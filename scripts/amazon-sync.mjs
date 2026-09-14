#!/usr/bin/env node
/**
 * Sincroniza dados da Amazon (Creators API) para os produtos da base.
 *
 * Lê todos os `dados/<categoria>.json`, extrai o ASIN de `lojas.amazon`, busca
 * título, marca, imagens licenciadas, preço e link com a tag, e grava um
 * arquivo por ASIN em `dados/amazon/`. O build do Next lê esses arquivos.
 *
 * Roda de dois jeitos:
 *
 *   node scripts/amazon-sync.mjs            # real: exige AMAZON_CLIENT_ID e
 *                                           # AMAZON_CLIENT_SECRET no ambiente
 *   node scripts/amazon-sync.mjs --simular  # gera dados fictícios, marcados,
 *                                           # para testar a interface sem API
 *
 * Sem credenciais e sem --simular, sai com código 0 e não escreve nada — assim
 * o workflow de deploy pode chamar este script sempre, e a etapa vira um
 * no-op enquanto a Creators API não estiver liberada.
 *
 * Nada de dependência: usa fetch e fs do próprio Node (>= 18).
 *
 * Referência: https://affiliate-program.amazon.com/creatorsapi/docs/en-us/
 */

import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const RAIZ = process.cwd();
const DIR_DADOS = path.join(RAIZ, "dados");
const DIR_SAIDA = path.join(DIR_DADOS, "amazon");

const MARKETPLACE = "www.amazon.com.br";
const ENDPOINT_TOKEN = "https://api.amazon.com/auth/o2/token";
const ENDPOINT_GET_ITEMS = "https://creatorsapi.amazon/catalog/v1/getItems";
const LOTE = 10; // limite da operação GetItems

// `||` e não `??`: no GitHub Actions uma variável ausente chega como string vazia.
const PARTNER_TAG = process.env.AMAZON_PARTNER_TAG || "guiaprodutona-20";
const CLIENT_ID = process.env.AMAZON_CLIENT_ID;
const CLIENT_SECRET = process.env.AMAZON_CLIENT_SECRET;
const SIMULAR = process.argv.includes("--simular");

/** Os campos que pedimos. Cada um custa cota; só o que a interface usa. */
const RECURSOS = [
  "images.primary.small",
  "images.primary.medium",
  "images.primary.large",
  "itemInfo.title",
  "itemInfo.byLineInfo",
  "itemInfo.features",
  "itemInfo.productInfo",
  "offersV2.listings.price",
  "offersV2.listings.availability",
];

function asinDe(url) {
  const m = String(url ?? "").match(/\/dp\/([A-Z0-9]{10})/i);
  return m ? m[1].toUpperCase() : null;
}

async function asinsDaBase() {
  const arquivos = (await readdir(DIR_DADOS)).filter((f) => f.endsWith(".json"));
  const asins = new Map(); // asin -> { slug, nome }
  for (const arquivo of arquivos) {
    const lista = JSON.parse(await readFile(path.join(DIR_DADOS, arquivo), "utf8"));
    for (const p of lista) {
      const asin = asinDe(p?.lojas?.amazon);
      if (asin) asins.set(asin, { slug: p.slug, nome: p.nome });
    }
  }
  return asins;
}

async function obterToken() {
  const corpo = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    scope: "creatorsapi::default",
  });
  const r = await fetch(ENDPOINT_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: corpo,
  });
  if (!r.ok) throw new Error(`Token LwA: HTTP ${r.status} ${await r.text()}`);
  const json = await r.json();
  if (!json.access_token) throw new Error("Token LwA sem access_token");
  return json.access_token;
}

async function getItems(token, ids) {
  const r = await fetch(ENDPOINT_GET_ITEMS, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "x-marketplace": MARKETPLACE,
    },
    body: JSON.stringify({
      itemIds: ids,
      itemIdType: "ASIN",
      marketplace: MARKETPLACE,
      partnerTag: PARTNER_TAG,
      languagesOfPreference: ["pt_BR"],
      currencyOfPreference: "BRL",
      resources: RECURSOS,
    }),
  });
  if (r.status === 429) throw new Error("Cota da API estourada (429). Tente mais tarde.");
  if (!r.ok) throw new Error(`GetItems: HTTP ${r.status} ${await r.text()}`);
  return r.json();
}

/**
 * Normaliza um item da API para o formato que o site consome. Tudo opcional:
 * a API devolve só os recursos pedidos, e alguns produtos não têm oferta.
 */
function normalizar(item, agora) {
  const imagem = (i) =>
    i?.url ? { url: i.url, largura: i.width ?? null, altura: i.height ?? null } : null;
  const oferta = item?.offersV2?.listings?.[0];
  const preco = oferta?.price;
  const dims = item?.itemInfo?.productInfo?.itemDimensions;
  const peso = dims?.weight;

  return {
    asin: item.asin,
    titulo: item?.itemInfo?.title?.displayValue ?? null,
    marca: item?.itemInfo?.byLineInfo?.brand?.displayValue ?? null,
    url: item?.detailPageURL ?? null,
    imagens: {
      pequena: imagem(item?.images?.primary?.small),
      media: imagem(item?.images?.primary?.medium),
      grande: imagem(item?.images?.primary?.large),
    },
    preco: preco
      ? {
          valor: preco.amount ?? preco.money?.amount ?? null,
          moeda: preco.currency ?? preco.money?.currency ?? "BRL",
          exibicao: preco.displayAmount ?? preco.money?.displayAmount ?? null,
        }
      : null,
    disponivel: oferta?.availability?.type
      ? oferta.availability.type === "Now"
      : null,
    caracteristicas: item?.itemInfo?.features?.displayValues ?? [],
    pesoDeclarado: peso?.displayValue
      ? `${peso.displayValue} ${peso.unit ?? ""}`.trim()
      : null,
    consultadoEm: agora,
    origem: "creators-api",
  };
}

/** Dados fictícios, visivelmente marcados, para testar a interface. */
function simular(asin, meta, agora) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='#e2f0ee'/><text x='200' y='140' text-anchor='middle' font-family='sans-serif' font-size='22' fill='#0a5250'>IMAGEM SIMULADA</text><text x='200' y='175' text-anchor='middle' font-family='monospace' font-size='16' fill='#5d6a73'>${asin}</text></svg>`;
  const url = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  const centavos = 9990 + (parseInt(asin.replace(/\D/g, "").slice(-4) || "0", 10) % 40000);
  return {
    asin,
    titulo: `${meta.nome} (simulado)`,
    marca: null,
    url: `https://www.amazon.com.br/dp/${asin}?tag=${PARTNER_TAG}`,
    imagens: {
      pequena: { url, largura: 160, altura: 120 },
      media: { url, largura: 400, altura: 300 },
      grande: { url, largura: 800, altura: 600 },
    },
    preco: {
      valor: centavos / 100,
      moeda: "BRL",
      exibicao: `R$ ${(centavos / 100).toFixed(2).replace(".", ",")}`,
    },
    disponivel: true,
    caracteristicas: ["Dado de simulação. Não publicar."],
    pesoDeclarado: null,
    consultadoEm: agora,
    origem: "simulacao",
  };
}

async function main() {
  const asins = await asinsDaBase();
  if (asins.size === 0) {
    console.log("Nenhum ASIN em dados/*.json. Nada a fazer.");
    return;
  }

  if (SIMULAR && process.env.CI) {
    console.error("Recusando --simular em CI: dado fictício não pode ir para produção.");
    process.exit(1);
  }

  if (!SIMULAR && (!CLIENT_ID || !CLIENT_SECRET)) {
    console.log(
      "Sem AMAZON_CLIENT_ID/AMAZON_CLIENT_SECRET no ambiente: pulando a sincronização.",
    );
    console.log("Quando a Creators API liberar, basta definir as duas variáveis.");
    return;
  }

  await mkdir(DIR_SAIDA, { recursive: true });
  const agora = new Date().toISOString();
  const lista = [...asins.keys()];
  let gravados = 0;

  if (SIMULAR) {
    for (const asin of lista) {
      await writeFile(
        path.join(DIR_SAIDA, `${asin}.json`),
        JSON.stringify(simular(asin, asins.get(asin), agora), null, 2) + "\n",
        "utf8",
      );
      gravados++;
    }
  } else {
    const token = await obterToken();
    for (let i = 0; i < lista.length; i += LOTE) {
      const ids = lista.slice(i, i + LOTE);
      const resposta = await getItems(token, ids);
      for (const erro of resposta?.errors ?? []) {
        console.warn(`Aviso da API: ${erro.code ?? "?"} — ${erro.message ?? ""}`);
      }
      for (const item of resposta?.itemResults?.items ?? []) {
        // A ordem da resposta não é garantida: sempre pelo ASIN.
        await writeFile(
          path.join(DIR_SAIDA, `${item.asin}.json`),
          JSON.stringify(normalizar(item, agora), null, 2) + "\n",
          "utf8",
        );
        gravados++;
      }
    }
  }

  await writeFile(
    path.join(DIR_SAIDA, "_indice.json"),
    JSON.stringify(
      { consultadoEm: agora, total: gravados, origem: SIMULAR ? "simulacao" : "creators-api" },
      null,
      2,
    ) + "\n",
    "utf8",
  );
  console.log(
    `${gravados} de ${lista.length} ASINs gravados em dados/amazon (${SIMULAR ? "SIMULAÇÃO" : "Creators API"}).`,
  );
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});

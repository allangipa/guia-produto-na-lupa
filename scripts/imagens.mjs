#!/usr/bin/env node
/**
 * Converte as fotos de produto para WebP e aponta as fichas para os novos
 * arquivos.
 *
 * Os PNGs oficiais dos fabricantes chegam pesados — o da JBL passa de 900 KB.
 * WebP com qualidade 82 corta perto de 70% sem diferença visível numa foto de
 * produto sobre fundo liso. Como o site é estático e não otimiza imagem em
 * tempo de execução, a conversão tem que acontecer aqui, antes do build.
 *
 *   npm run imagens
 *
 * Idempotente: pula o que já é WebP e só remove o PNG depois de gravar o WebP
 * com sucesso. Limita o lado maior a 1200 px, que é mais do que qualquer
 * card ou ficha exibe.
 *
 * Depois da conversão, gera as versões menores para o `srcset`.
 *
 * Medimos as larguras em que as fotos aparecem de verdade, no celular e no
 * desktop: de 86 px (o círculo de departamento) a 333 px (a foto grande da
 * ficha). Um arquivo de 1200 px para um círculo de 104 px é o desperdício que
 * a escada abaixo corta — na home, 257 KB viraram 53 KB.
 *
 * Cada largura vai para a sua pasta (public/produtos/240/), e a escada tem
 * três degraus, cada um atrás de uma medida:
 *
 *   240 — o círculo de departamento, 104 px em tela retina são 208
 *   480 — o card da prateleira da home, 230 px em retina são 460
 *
 * Não há terceiro degrau, e a decisão foi medida: o caso que faltaria cobrir
 * é a foto grande da ficha em tela retina (333 x 2 = 666), que hoje recebe a
 * original limitada a 1200 px. Um degrau de 800 a serviria com 28 KB em vez
 * de 35 — sete quilobytes por visita, em troca de 9,9 MB permanentes no
 * repositório, que crescem a cada foto nova. Não compensa. Se um dia o
 * cálculo mudar, é acrescentar 800 na linha acima e rodar de novo.
 */

import { readdir, readFile, writeFile, unlink, stat, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const RAIZ = process.cwd();
const DIR_IMG = path.join(RAIZ, "public", "produtos");
const DIR_DADOS = path.join(RAIZ, "dados");

async function converter() {
  const arquivos = (await readdir(DIR_IMG)).filter((f) => /\.(png|jpe?g)$/i.test(f));
  const trocas = new Map(); // "/produtos/x.png" -> "/produtos/x.webp"

  for (const f of arquivos) {
    const origem = path.join(DIR_IMG, f);
    const nomeWebp = f.replace(/\.(png|jpe?g)$/i, ".webp");
    const destino = path.join(DIR_IMG, nomeWebp);

    const antes = (await readFile(origem)).length;
    await sharp(origem)
      .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(destino);
    const depois = (await readFile(destino)).length;

    await unlink(origem);
    trocas.set(`/produtos/${f}`, `/produtos/${nomeWebp}`);
    console.log(
      `${f} → ${nomeWebp}: ${Math.round(antes / 1024)} KB → ${Math.round(depois / 1024)} KB (${Math.round((1 - depois / antes) * 100)}% menor)`,
    );
  }
  return trocas;
}

async function apontarFichas(trocas) {
  if (trocas.size === 0) return;
  const arquivos = (await readdir(DIR_DADOS)).filter((f) => f.endsWith(".json"));
  for (const f of arquivos) {
    const caminho = path.join(DIR_DADOS, f);
    let texto = await readFile(caminho, "utf8");
    let mudou = false;
    for (const [de, para] of trocas) {
      if (texto.includes(`"${de}"`)) {
        texto = texto.split(`"${de}"`).join(`"${para}"`);
        mudou = true;
      }
    }
    if (mudou) {
      await writeFile(caminho, texto, "utf8");
      console.log(`fichas atualizadas em dados/${f}`);
    }
  }
}

const LARGURAS = [240, 480];
const DIR_LIB = path.join(RAIZ, "lib");

/**
 * Cada largura tem a sua pasta: public/produtos/240/nome.webp.
 *
 * A primeira versao distinguia original de versao menor pelo sufixo do nome,
 * e 144 fotos ficaram de fora — todo produto cujo slug termina em numero
 * (amazfit-bip-6, arno-x-treme-7, britania-diamante-550) parecia uma versao
 * de 6, 7 ou 550 pixels. A pasta nao tem esse problema: o que esta na raiz e
 * original, e ponto.
 */
const pastaDaLargura = (base, w) => path.join(base, String(w));

/**
 * Toda pasta de imagem nossa entra na escada, nao so a de produto.
 *
 * A arte de comparativo e uma so hoje, e foi por isso que quase virou
 * excecao: 1080 px de largura servidos para aparecer em 352. Excecao de um
 * arquivo e a que ninguem lembra de revisar quando viram dez.
 */
const PASTAS = [
  { dir: DIR_IMG, prefixo: "/produtos" },
  { dir: path.join(RAIZ, "public", "comparativos"), prefixo: "/comparativos" },
];

/**
 * Gera as versões menores e devolve o mapa que o `srcset` consome.
 *
 * Só cria o degrau quando ele é de fato menor que o original: uma foto de
 * 366 px não ganha versão de 480. O manifesto registra a largura do original
 * junto, porque é ela que fecha o `srcset` — sem esse número o navegador não
 * sabe o que está escolhendo.
 */
async function gerarVariantes() {
  const manifesto = {};
  let criadas = 0;
  let bytesNovos = 0;

  for (const { dir, prefixo } of PASTAS) {
  const originais = (await readdir(dir, { withFileTypes: true }))
    .filter((e) => e.isFile() && e.name.endsWith(".webp"))
    .map((e) => e.name)
    .sort();

  for (const w of LARGURAS) await mkdir(pastaDaLargura(dir, w), { recursive: true });

  for (const f of originais) {
    const origem = path.join(dir, f);
    const meta = await sharp(origem).metadata();
    const degraus = [];

    for (const w of LARGURAS) {
      if (meta.width <= w) continue;
      const destino = path.join(pastaDaLargura(dir, w), f);

      // Refaz só quando o original mudou: reconverter 537 fotos a cada
      // execução gastaria minutos para reescrever bytes idênticos.
      let precisa = true;
      try {
        const [a, b] = await Promise.all([stat(destino), stat(origem)]);
        precisa = a.mtimeMs < b.mtimeMs;
      } catch {
        precisa = true;
      }
      if (precisa) {
        await sharp(origem).resize({ width: w }).webp({ quality: 82 }).toFile(destino);
        criadas++;
      }
      bytesNovos += (await stat(destino)).size;
      degraus.push(w);
    }

    // Toda foto entra no manifesto, inclusive a que nao rendeu degrau nenhum
    // por ja ser pequena. Se so as com degrau entrassem, uma foto nova que
    // ninguem processou ficaria ausente exatamente como uma foto pequena, e a
    // verificacao em lib/variantes.ts nao teria como distinguir as duas.
    manifesto[`${prefixo}/${f}`] = { larguras: degraus, original: meta.width };
  }
  }

  await writeFile(
    path.join(DIR_LIB, "variantes.json"),
    JSON.stringify(manifesto, null, 2) + "\n",
    "utf8",
  );

  console.log(
    `\nsrcset: ${Object.keys(manifesto).length} fotos no manifesto, ` +
      `${criadas} arquivo(s) gerado(s) agora, ` +
      `${(bytesNovos / 1048576).toFixed(1)} MB em degraus.`,
  );
  return manifesto;
}

const trocas = await converter();
await apontarFichas(trocas);
if (trocas.size === 0) console.log("Nada a converter: tudo já é WebP.");
await gerarVariantes();

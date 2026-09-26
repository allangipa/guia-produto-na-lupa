#!/usr/bin/env node
/**
 * Auditoria dos links de afiliado. Rodar uma vez por semana.
 *
 * Responde quatro perguntas, na ordem de gravidade:
 *
 *   1. Algum link publicado em conteúdo não existe na base?  (erro grave)
 *      É o caso do link inventado: um ASIN escrito de memória dentro de um
 *      bloco `lojas:` de MDX, que não corresponde a produto nenhum de `dados/`.
 *      Link de afiliado se copia da base, nunca se digita à mão.
 *
 *   2. Dois produtos apontam para o mesmo ASIN?  (erro grave)
 *      Quase sempre é link colado na ficha errada.
 *
 *   3. Que produtos não têm loja nenhuma, e quais deles já foram citados em
 *      guia, comparativo ou review? Produto citado sem link é o que mais
 *      incomoda o leitor: ele leu a recomendação e não tem onde comprar.
 *
 *   4. Que chave de loja aparece sem estar registrada em `lib/site.ts`?
 *      O build já quebra nesse caso, mas com mensagem que não diz o produto.
 *
 * Uso:
 *   node scripts/afiliados-cobertura.mjs            # relatório completo
 *   node scripts/afiliados-cobertura.mjs --resumo   # só as contas
 *
 * Sai com código 1 se achar erro grave (1, 2 ou 4), para poder entrar em CI.
 * Produto sem loja não é erro: é pesquisa pendente, e o relatório a enfileira.
 *
 * Nada de dependência: fs e path do próprio Node.
 */

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const RAIZ = process.cwd();
const DIR_DADOS = path.join(RAIZ, "dados");
const DIR_CONTEUDO = path.join(RAIZ, "content");
const RESUMO = process.argv.includes("--resumo");

function asinDe(url) {
  const m = String(url ?? "").match(/\/dp\/([A-Z0-9]{10})/i);
  return m ? m[1].toUpperCase() : null;
}

/** Aceita tanto `[...]` quanto `{ produtos: [...] }`. */
function listaDe(dados) {
  if (Array.isArray(dados)) return dados;
  if (Array.isArray(dados?.produtos)) return dados.produtos;
  return [];
}

function linksDe(produto) {
  return Object.values(produto.lojas ?? {}).filter(Boolean);
}

async function lerBase() {
  const arquivos = (await readdir(DIR_DADOS)).filter((f) => f.endsWith(".json"));
  const categorias = [];
  for (const arquivo of arquivos.sort()) {
    let dados;
    try {
      dados = JSON.parse(await readFile(path.join(DIR_DADOS, arquivo), "utf8"));
    } catch {
      continue;
    }
    const produtos = listaDe(dados);
    if (produtos.length) {
      categorias.push({ nome: arquivo.replace(/\.json$/, ""), produtos });
    }
  }
  return categorias;
}

/** Todos os `.mdx` de `content/`, em qualquer subpasta. */
async function lerConteudo() {
  const achados = [];
  async function andar(dir) {
    for (const item of await readdir(dir, { withFileTypes: true })) {
      const alvo = path.join(dir, item.name);
      if (item.isDirectory()) await andar(alvo);
      else if (item.name.endsWith(".mdx")) {
        achados.push({
          caminho: path.relative(DIR_CONTEUDO, alvo).replace(/\\/g, "/"),
          texto: await readFile(alvo, "utf8"),
        });
      }
    }
  }
  await andar(DIR_CONTEUDO);
  achados.sort((a, b) => a.caminho.localeCompare(b.caminho));
  return achados;
}

/**
 * Extrai os pares chave/url de dentro de cada bloco `lojas:` do front matter.
 * É YAML por indentação: entra no bloco ao ver `lojas:` e sai na primeira linha
 * que não seja mais indentada que ele.
 */
function lojasNoTexto(texto) {
  const pares = [];
  let indentacao = null;
  for (const linha of texto.split("\n")) {
    const abre = linha.match(/^(\s*)lojas:\s*(\{\s*\})?\s*$/);
    if (abre) {
      indentacao = abre[1].length;
      continue;
    }
    if (indentacao === null) continue;
    const item = linha.match(/^(\s*)([a-z]+):\s*"([^"]+)"\s*$/);
    if (item && item[1].length > indentacao) {
      pares.push({ chave: item[2], url: item[3] });
    } else {
      indentacao = null;
    }
  }
  return pares;
}

/** As chaves registradas em `lib/site.ts`, lidas do próprio arquivo. */
async function lojasRegistradas() {
  const fonte = await readFile(path.join(RAIZ, "lib", "site.ts"), "utf8");
  // Ancorado em `export const`: a palavra LOJAS aparece antes, no comentário.
  const bloco = fonte.match(/export const LOJAS[^=]*=\s*\{([\s\S]*?)\n\};/);
  if (!bloco) return null;
  return new Set([...bloco[1].matchAll(/^ {2}([a-z]+):\s*\{/gm)].map((m) => m[1]));
}

const linhas = [];
const diga = (s = "") => linhas.push(s);
let grave = 0;

const categorias = await lerBase();
const conteudo = await lerConteudo();
const registradas = await lojasRegistradas();

const produtos = categorias.flatMap((c) =>
  c.produtos.map((p) => ({ ...p, categoria: c.nome })),
);
const urlsDaBase = new Set(produtos.flatMap(linksDe));

// 1. Link publicado que não existe na base.
const forasteiros = [];
let linksEmConteudo = 0;
for (const { caminho, texto } of conteudo) {
  for (const { chave, url } of lojasNoTexto(texto)) {
    linksEmConteudo += 1;
    if (!urlsDaBase.has(url)) forasteiros.push({ caminho, chave, url });
  }
}
diga("1. LINKS PUBLICADOS FORA DA BASE");
if (forasteiros.length === 0) {
  diga(`   nenhum — os ${linksEmConteudo} links em conteúdo saíram todos da base`);
} else {
  grave += forasteiros.length;
  for (const f of forasteiros) diga(`   ERRO  ${f.caminho}  ${f.chave}: ${f.url}`);
}

// 2. ASIN repetido em dois produtos.
diga();
diga("2. ASIN REPETIDO");
const porAsin = new Map();
for (const p of produtos) {
  const asin = asinDe(p.lojas?.amazon);
  if (!asin) continue;
  if (!porAsin.has(asin)) porAsin.set(asin, []);
  porAsin.get(asin).push(p);
}
const repetidos = [...porAsin.entries()].filter(([, ps]) => ps.length > 1);
if (repetidos.length === 0) {
  diga(`   nenhum — ${porAsin.size} ASINs distintos na base`);
} else {
  grave += repetidos.length;
  for (const [asin, ps] of repetidos) {
    diga(`   ERRO  ${asin} em ${ps.map((p) => `${p.categoria}/${p.slug}`).join(", ")}`);
  }
}

// 3. Cobertura: produto sem loja nenhuma.
diga();
diga("3. COBERTURA DE AFILIADOS");
const semLoja = produtos.filter((p) => linksDe(p).length === 0);
const cobertos = produtos.length - semLoja.length;
diga(
  `   ${cobertos} de ${produtos.length} produtos têm link ` +
    `(${Math.round((cobertos / produtos.length) * 100)}%)`,
);
const buracos = categorias
  .map((c) => ({
    nome: c.nome,
    total: c.produtos.length,
    sem: c.produtos.filter((p) => linksDe(p).length === 0).length,
  }))
  .filter((c) => c.sem > 0)
  .sort((a, b) => b.sem - a.sem || a.nome.localeCompare(b.nome));
for (const c of buracos) {
  diga(`     ${c.nome.padEnd(24)} ${String(c.sem).padStart(3)} sem link, de ${c.total}`);
}
if (buracos.length === 0) diga("     todas as categorias cobertas");

// Nem todo produto sem link é trabalho pendente. Dois casos saem da fila:
// o que ainda não chegou às lojas, e o que já foi procurado há pouco.
const HOJE = new Date();
const DIAS = 24 * 60 * 60 * 1000;
const VALIDADE_DA_BUSCA = 30; // catálogo de varejo muda; um mês é prazo curto

const porVir = semLoja.filter(
  (p) => p.nasLojasEm && new Date(`${p.nasLojasEm}T00:00:00Z`) > HOJE,
);
const jaProcurados = semLoja.filter(
  (p) =>
    !porVir.includes(p) &&
    p.buscaDeLoja?.em &&
    (HOJE - new Date(`${p.buscaDeLoja.em}T00:00:00Z`)) / DIAS < VALIDADE_DA_BUSCA,
);
const fila = semLoja.filter((p) => !porVir.includes(p) && !jaProcurados.includes(p));

diga();
if (porVir.length) {
  diga(`   ${porVir.length} ainda não chegaram às lojas (não são lacuna):`);
  for (const p of porVir) diga(`     ${p.categoria}/${p.slug} — a partir de ${p.nasLojasEm}`);
}
if (jaProcurados.length) {
  diga(`   ${jaProcurados.length} procurados nos últimos ${VALIDADE_DA_BUSCA} dias, sem achar:`);
  for (const p of jaProcurados) {
    diga(`     ${p.categoria}/${p.slug} — ${p.buscaDeLoja.em}, em ${p.buscaDeLoja.onde.join(" e ")}`);
  }
}

// Dentro da fila, os já citados doem mais: o leitor viu a recomendação.
const citados = [];
for (const p of fila) {
  const onde = conteudo.filter((c) => c.texto.includes(p.nome)).map((c) => c.caminho);
  if (onde.length) citados.push({ produto: p, onde });
}
diga();
diga(`   FILA DE PESQUISA: ${fila.length} produtos`);
if (citados.length === 0) {
  diga("   nenhum deles citado em conteúdo publicado — ninguém lê recomendação sem saída");
} else {
  diga(`   ${citados.length} já citados em conteúdo publicado — comece por estes:`);
  for (const { produto, onde } of citados) {
    diga(`     ${produto.categoria}/${produto.slug} — ${onde.join(", ")}`);
  }
}
if (!RESUMO && fila.length) {
  diga();
  diga("   fila completa, por categoria:");
  let atual = null;
  for (const p of fila) {
    if (p.categoria !== atual) {
      atual = p.categoria;
      diga(`     ${atual}`);
    }
    diga(`       ${p.slug}`);
  }
}

// 4. Chave de loja não registrada.
diga();
diga("4. CHAVES DE LOJA");
if (!registradas) {
  diga("   não consegui ler LOJAS de lib/site.ts — confira à mão");
} else {
  const usadas = new Set(produtos.flatMap((p) => Object.keys(p.lojas ?? {})));
  for (const { texto } of conteudo) {
    for (const { chave } of lojasNoTexto(texto)) usadas.add(chave);
  }
  const estranhas = [...usadas].filter((k) => !registradas.has(k));
  if (estranhas.length === 0) {
    diga(`   todas registradas: ${[...usadas].sort().join(", ") || "(nenhuma em uso)"}`);
  } else {
    grave += estranhas.length;
    for (const k of estranhas) diga(`   ERRO  "${k}" não está em LOJAS de lib/site.ts`);
  }
}

diga();
diga(grave === 0 ? "Sem erro grave." : `${grave} erro(s) grave(s).`);
console.log(linhas.join("\n"));
process.exit(grave === 0 ? 0 : 1);

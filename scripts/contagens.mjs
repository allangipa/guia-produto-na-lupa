#!/usr/bin/env node
/**
 * Conferência das contagens escritas por extenso nos textos. Rodar depois de
 * mexer no tamanho de uma categoria, e antes do commit.
 *
 * Por que existe: quando uma categoria cresce, todo "dez fichas" e todo "13 das
 * 24" dos textos dela fica falso sem ninguém tocar no arquivo. Em 07/11/2026
 * sete guias estavam assim — liquidificadores, cafeteiras e tablets falavam em
 * dez fichas com vinte na base, e a conta só apareceu porque alguém releu.
 *
 * O que procura, em guias, comparativos e análises: um total de fichas que não
 * bate com o tamanho da categoria da peça. São três formas:
 *
 *   "das 24 fichas", "as vinte fichas", "40 fichas comparadas"
 *   "13 das 24" / "13 de 24"            (o segundo número é o total)
 *   "Quarenta e cinco secadores"         (número + o nome da categoria)
 *
 * Não é erro de build, é lista de leitura: "das 14 câmeras" é subgrupo e está
 * certo. O relatório mostra a frase, o número e o tamanho da categoria, e
 * quem lê decide. Um total MAIOR que a categoria é quase sempre erro, e vai
 * primeiro.
 *
 * Uso:
 *   node scripts/contagens.mjs              # tudo
 *   node scripts/contagens.mjs cafeteiras   # uma categoria
 *   node scripts/contagens.mjs --tudo       # inclui o que pode ser subgrupo
 *
 * Nada de dependência: fs e path do próprio Node.
 */

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const RAIZ = process.cwd();
const filtro = process.argv.slice(2).find((a) => !a.startsWith("--"));

const UNIDADES = {
  um: 1, uma: 1, dois: 2, duas: 2, três: 3, quatro: 4, cinco: 5, seis: 6,
  sete: 7, oito: 8, nove: 9, dez: 10, onze: 11, doze: 12, treze: 13,
  catorze: 14, quatorze: 14, quinze: 15, dezesseis: 16, dezessete: 17,
  dezoito: 18, dezenove: 19,
};
const DEZENAS = {
  vinte: 20, trinta: 30, quarenta: 40, cinquenta: 50, sessenta: 60,
  setenta: 70, oitenta: 80, noventa: 90,
};
const EXTENSO =
  `(?:(?:${Object.keys(DEZENAS).join("|")})(?: e (?:${Object.keys(UNIDADES).slice(0, 11).join("|")}))?|${Object.keys(UNIDADES).join("|")})`;
const NUM = `(\\d{1,3}|${EXTENSO})`;

function valor(s) {
  s = s.toLowerCase();
  if (/^\d/.test(s)) return Number(s.replace(".", ""));
  const [d, u] = s.split(" e ");
  if (DEZENAS[d] !== undefined) return DEZENAS[d] + (u ? UNIDADES[u] : 0);
  return UNIDADES[s];
}

// Nome da categoria como aparece no texto, para a forma "Quarenta e cinco secadores".
const NOMES = {
  cozinha: "air fryers?", audio: "fones?", celular: "celulares", tablets: "tablets",
  monitores: "monitores", liquidificadores: "liquidificadores", cafeteiras: "cafeteiras",
  aspiradores: "aspiradores", secadores: "secadores", batedeiras: "batedeiras",
  "escovas-secadoras": "escovas", ferros: "ferros", sanduicheiras: "sanduicheiras",
  torradeiras: "torradeiras", mixers: "mixers", processadores: "processadores",
  geladeiras: "geladeiras", microondas: "micro-ondas", ventiladores: "ventiladores",
  "lavadoras-alta-pressao": "lavadoras", lavadoras: "lavadoras", chaleiras: "chaleiras",
  espremedores: "espremedores", nobreaks: "nobreaks", "cooktops-inducao": "cooktops",
  "purificadores-agua": "purificadores", "ar-condicionado": "splits",
  furadeiras: "furadeiras", smartwatches: "smartwatches", perifericos: "periféricos",
  armazenamento: "(?:SSDs?|discos)", energia: "(?:carregadores|powerbanks|baterias)",
  conectividade: "roteadores",
  cftv: "(?:gravadores|DVRs)", lavaloucas: "lava-louças",
};

async function tamanhos() {
  const out = {};
  for (const f of await readdir(path.join(RAIZ, "dados"))) {
    if (!f.endsWith(".json")) continue;
    const lista = JSON.parse(await readFile(path.join(RAIZ, "dados", f), "utf8"));
    if (Array.isArray(lista)) out[f.replace(".json", "")] = lista.length;
  }
  return out;
}

function frase(texto, i, fim) {
  const a = Math.max(0, texto.lastIndexOf("\n", i) + 1);
  let b = texto.indexOf("\n", fim);
  if (b < 0) b = texto.length;
  return texto.slice(a, b).trim().replace(/\s+/g, " ").slice(0, 200);
}

const tam = await tamanhos();
const achados = [];

for (const tipo of ["guias", "comparativos", "reviews"]) {
  const dir = path.join(RAIZ, "content", tipo);
  for (const f of await readdir(dir)) {
    if (!f.endsWith(".mdx")) continue;
    const texto = await readFile(path.join(dir, f), "utf8");
    const cat = texto.match(/^categoria:\s*"?([\w-]+)"?/m)?.[1];
    if (!cat || tam[cat] === undefined) continue;
    if (filtro && cat !== filtro) continue;
    // A seção de fontes é registro do dia da consulta, não afirmação atual.
    const corpo = texto.replace(/\nfontes:\n[\s\S]*?(?=\n[a-zA-Z]+:|\n---)/, "\n");
    const total = tam[cat];
    const formas = [
      new RegExp(`\\b(?:d?as|nas|entre as|de|das) ${NUM} fichas\\b`, "gi"),
      new RegExp(`\\b${NUM} fichas (?:comparadas|lidas|desta|da base|da categoria)`, "gi"),
      // "13 das 24 publicam": só com o verbo de quem publica logo depois, senão
      // "214 de 240 litros" e "11 de 19 campos" entram na conta.
      new RegExp(`\\b${NUM} (?:das|de) ${NUM},? (?:fichas|publicam|declaram|trazem|dizem|informam|respondem|têm|não)\\b`, "gi"),
    ];
    if (NOMES[cat]) formas.push(new RegExp(`\\b${NUM} ${NOMES[cat]}\\b`, "gi"));
    const vistos = new Set();
    for (const re of formas) {
      for (const m of corpo.matchAll(re)) {
        const n = valor(m[m.length - 1] ?? m[1]);
        if (!n || n < 5 || n === total) continue;
        const chave = `${m.index}`;
        if (vistos.has(chave)) continue;
        vistos.add(chave);
        const depois = corpo.slice(m.index, m.index + m[0].length + 45);
        achados.push({
          arquivo: `${tipo}/${f}`, cat, total, n, maior: n > total,
          // "das 26 batedeiras da nossa base" é total declarado, não subgrupo.
          base: /(?:d[ae] (?:nossa )?base|desta base|da categoria|da lista)/i.test(depois),
          trecho: frase(corpo, m.index, m.index + m[0].length),
        });
      }
    }
  }
}

const tudo = process.argv.includes("--tudo");
const unicos = [...new Map(achados.map((a) => [`${a.arquivo}|${a.n}|${a.trecho}`, a])).values()];
const provaveis = unicos.filter((a) => a.maior || a.base);
const lista = (tudo ? unicos : provaveis).sort(
  (a, b) => b.maior - a.maior || b.base - a.base || a.arquivo.localeCompare(b.arquivo),
);
console.log(
  `
${provaveis.length} contagens que dizem ser o total da base, ou passam dele, e não batem` +
    ` com o tamanho da categoria.${tudo ? ` Mais ${unicos.length - provaveis.length} que podem ser subgrupo.` : " Use --tudo para ver também as que podem ser subgrupo."}
`,
);
let atual = "";
for (const a of lista) {
  if (a.arquivo !== atual) {
    atual = a.arquivo;
    console.log(`
${a.arquivo}  [${a.cat}: ${a.total} fichas]`);
  }
  console.log(`  ${a.maior ? "!!" : a.base ? " !" : "  "} ${a.n}: ${a.trecho}`);
}

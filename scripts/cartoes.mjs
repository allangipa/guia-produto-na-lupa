#!/usr/bin/env node
/**
 * Gera o cartão de compartilhamento (og:image, 1200×630) de cada análise.
 *
 *   npm run cartoes                  # todas
 *   npm run cartoes -- philco-pfr2200p
 *
 * Sai em `public/og/reviews/<slug>.png`, que a página da análise usa como
 * `og:image` quando o arquivo existe. Os PNG ficam no Git: o build na
 * hospedagem não roda este script, e um cartão que só existe na máquina de
 * quem gerou não aparece em compartilhamento nenhum.
 *
 * Nada aqui é escrito à mão. Kicker é o nome da categoria em
 * `lib/categorias.ts`; o título é o `tituloCurto` do frontmatter; os três
 * números são os três primeiros `pros`; a foto é a mesma da ficha, lida de
 * `dados/` pelo ASIN ou pelo nome. Mudou na análise, muda no cartão na
 * próxima execução.
 *
 * Fontes: as mesmas do site (Archivo, Fraunces, IBM Plex Mono), que
 * `scripts/carrossel.mjs` já baixa para `scripts/.fontes`. O sharp rasteriza
 * SVG com librsvg + fontconfig, que lê TTF e não WOFF, então o WOFF é
 * descomprimido para TTF ao lado (é zlib, sem dependência). Sem as fontes,
 * cai para Georgia/Segoe UI/Arial — fica legível, só não fica a cara do site.
 */

import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import matter from "gray-matter";

const RAIZ = process.cwd();
const DIR_MDX = path.join(RAIZ, "content", "reviews");
const DIR_SAIDA = path.join(RAIZ, "public", "og", "reviews");
const DIR_FONTES = path.join(RAIZ, "scripts", ".fontes");
const DIR_TTF = path.join(DIR_FONTES, "ttf");

const L = 1200;
const A = 630;
const MARGEM = 72;

// A paleta é a do herói escuro de app/globals.css (`.faixa`). Repetida porque
// o SVG não lê o CSS do site.
const COR = {
  faixa: "#101418",
  faixaTinta: "#eef3f2",
  faixaSuave: "#9fb2b1",
  acao: "#5FB8B5", // o verde da marca sobre fundo escuro (simbolo-fundo-escuro.svg)
  papel: "#ffffff",
  tintaSuave: "#5d6a73",
  linhaEscura: "#2a333b",
};

/* ---------------------------------------------------------------- fontes */

const UA_SEM_WOFF2 =
  "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0 Safari/537.36";

const FONTES = [
  ["archivo-400", "Archivo:wght@400"],
  ["archivo-600", "Archivo:wght@600"],
  ["fraunces-600", "Fraunces:opsz,wght@144,600"],
  ["mono-500", "IBM+Plex+Mono:wght@500"],
];

/** Mesmo mecanismo de `carrossel.mjs`: WOFF do Google, guardado fora do Git. */
async function baixarFonte(nome, consulta) {
  const destino = path.join(DIR_FONTES, nome + ".woff");
  if (fs.existsSync(destino)) return true;
  try {
    const css = await (
      await fetch("https://fonts.googleapis.com/css2?family=" + consulta, {
        headers: { "User-Agent": UA_SEM_WOFF2 },
      })
    ).text();
    const url = (css.match(/url\((https:[^)]+\.(?:woff|ttf|otf))\)/) || [])[1];
    if (!url) return false;
    fs.writeFileSync(destino, Buffer.from(await (await fetch(url)).arrayBuffer()));
    console.log(`  fonte baixada: ${nome}`);
    return true;
  } catch {
    return false;
  }
}

/**
 * WOFF 1.0 → TTF. O WOFF é o sfnt com as tabelas comprimidas em zlib e um
 * cabeçalho próprio; desfazer isso é reescrever o diretório de tabelas.
 */
function woffParaTtf(buf) {
  const sabor = buf.readUInt32BE(4);
  const n = buf.readUInt16BE(12);
  const tabelas = [];
  for (let i = 0; i < n; i++) {
    const o = 44 + i * 20;
    tabelas.push({
      tag: buf.subarray(o, o + 4),
      off: buf.readUInt32BE(o + 4),
      comp: buf.readUInt32BE(o + 8),
      orig: buf.readUInt32BE(o + 12),
      chk: buf.readUInt32BE(o + 16),
    });
  }
  const es = Math.floor(Math.log2(n));
  const sr = (1 << es) * 16;
  const cab = Buffer.alloc(12 + 16 * n);
  cab.writeUInt32BE(sabor, 0);
  cab.writeUInt16BE(n, 4);
  cab.writeUInt16BE(sr, 6);
  cab.writeUInt16BE(es, 8);
  cab.writeUInt16BE(n * 16 - sr, 10);
  const partes = [cab];
  let pos = cab.length;
  tabelas.forEach((t, i) => {
    let d = buf.subarray(t.off, t.off + t.comp);
    if (t.comp !== t.orig) d = zlib.inflateSync(d);
    const o = 12 + i * 16;
    t.tag.copy(cab, o);
    cab.writeUInt32BE(t.chk, o + 4);
    cab.writeUInt32BE(pos, o + 8);
    cab.writeUInt32BE(t.orig, o + 12);
    const sobra = (4 - (d.length % 4)) % 4;
    partes.push(d, Buffer.alloc(sobra));
    pos += d.length + sobra;
  });
  return Buffer.concat(partes);
}

/**
 * Prepara o fontconfig ANTES de carregar o sharp: a variável de ambiente é
 * lida uma vez, quando o libvips inicia. Por isso o `import("sharp")` é
 * dinâmico e vem depois desta função.
 *
 * Devolve se as fontes do site estão disponíveis — quando não estão, o SVG
 * ainda nomeia as famílias, e o fontconfig cai nas de sistema listadas a
 * seguir em cada `font-family`.
 */
async function prepararFontes() {
  fs.mkdirSync(DIR_TTF, { recursive: true });
  let todas = true;
  for (const [nome, consulta] of FONTES) {
    const ok = await baixarFonte(nome, consulta);
    if (!ok) {
      todas = false;
      continue;
    }
    const ttf = path.join(DIR_TTF, nome + ".ttf");
    if (!fs.existsSync(ttf)) {
      fs.writeFileSync(ttf, woffParaTtf(fs.readFileSync(path.join(DIR_FONTES, nome + ".woff"))));
    }
  }
  const barra = (p) => p.replace(/\\/g, "/");
  const sistema =
    process.platform === "win32"
      ? "C:/Windows/Fonts"
      : process.platform === "darwin"
        ? "/Library/Fonts"
        : "/usr/share/fonts";
  fs.writeFileSync(
    path.join(DIR_TTF, "fonts.conf"),
    `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>${barra(DIR_TTF)}</dir>
  <dir>${sistema}</dir>
  <cachedir>${barra(path.join(DIR_TTF, "cache"))}</cachedir>
</fontconfig>
`,
  );
  process.env.FONTCONFIG_PATH = DIR_TTF;
  if (!todas) console.log("  aviso: sem as fontes do site; usando fontes de sistema");
  return todas;
}

// Os nomes de família vêm da tabela `name` de cada arquivo do Google: o
// Fraunces subset se chama "Fraunces 144pt". A lista cai para sistema.
const FAM = {
  titulo: "'Fraunces 144pt', Fraunces, Georgia, 'Times New Roman', serif",
  texto: "Archivo, 'Segoe UI', Arial, Helvetica, sans-serif",
  dado: "'IBM Plex Mono', Consolas, 'Courier New', monospace",
};

/* ------------------------------------------------------------------ dados */

/** `slug → nome` das categorias, lido de lib/categorias.ts sem compilar TS. */
function nomesDasCategorias() {
  const fonte = fs.readFileSync(path.join(RAIZ, "lib", "categorias.ts"), "utf8");
  const mapa = new Map();
  for (const m of fonte.matchAll(/slug:\s*"([^"]+)",\s*nome:\s*"([^"]+)"/g)) {
    mapa.set(m[1], m[2]);
  }
  return mapa;
}

/** Índice das fotos da base, por ASIN e por nome — o mesmo de carrossel.mjs. */
function indiceDeFotos() {
  const porNome = new Map();
  const porAsin = new Map();
  for (const f of fs.readdirSync(path.join(RAIZ, "dados")).filter((f) => f.endsWith(".json"))) {
    const j = JSON.parse(fs.readFileSync(path.join(RAIZ, "dados", f), "utf8"));
    for (const p of Array.isArray(j) ? j : j.produtos || []) {
      if (!p.imagem) continue;
      porNome.set(p.nome, p);
      const asin = (p.lojas?.amazon || "").match(/\/dp\/([A-Z0-9]{10})/)?.[1];
      if (asin) porAsin.set(asin, p);
    }
  }
  return { porNome, porAsin };
}

/**
 * A foto da análise, pelo mesmo caminho da página: `produto.imagem` do
 * frontmatter e, na falta, a ficha da base casada por ASIN e depois por nome
 * exato (é o que `fotoDaBase` em lib/conteudo.ts faz).
 */
function fotoDe(fm, indice) {
  if (fm.produto?.imagem?.src) return fm.produto.imagem;
  const asin = (fm.produto?.lojas?.amazon || "").match(/\/dp\/([A-Z0-9]{10})/)?.[1];
  const p = (asin && indice.porAsin.get(asin)) || indice.porNome.get(fm.produto?.nome);
  return p?.imagem;
}

/* ------------------------------------------------------------------ texto */

const escapar = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const semMarcacao = (s) => String(s).replace(/[*][*](.+?)[*][*]/g, "$1").replace(/[*_`]/g, "");

/**
 * Largura real de um texto, em px, na fonte em que ele vai sair.
 *
 * O librsvg não devolve medidas, então o texto é rasterizado sozinho sobre
 * fundo transparente e o `trim()` do sharp diz quantos pixels sobraram.
 * Custa um rasterizado pequeno por linha; com cache, são poucas centenas por
 * execução — e a quebra de linha sai certa, em vez de estimada por tabela de
 * larguras, que errou para os dois lados na primeira versão.
 */
let sharpMedidor;
const cacheMedidas = new Map();
async function medir(texto, familia, peso, tamanho) {
  const chave = `${familia}|${peso}|${tamanho}|${texto}`;
  if (cacheMedidas.has(chave)) return cacheMedidas.get(chave);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${L * 2}" height="${Math.ceil(tamanho * 1.6)}"><text x="0" y="${Math.ceil(tamanho * 1.2)}" font-family="${familia}" font-weight="${peso}" font-size="${tamanho}" fill="#fff">${escapar(texto)}</text></svg>`;
  const { info } = await sharpMedidor(Buffer.from(svg)).trim().toBuffer({ resolveWithObject: true });
  // `trim()` corta a partir do pixel do canto; o texto começa em x=0, então o
  // offset esquerdo é zero e a largura do que sobrou é a largura do texto.
  const w = info.width <= 1 ? 0 : info.width + (info.trimOffsetLeft ? -info.trimOffsetLeft : 0);
  cacheMedidas.set(chave, w);
  return w;
}

async function quebrar(texto, larguraPx, tamanho, familia, peso) {
  const linhas = [];
  let atual = "";
  for (const palavra of texto.split(/\s+/)) {
    const tentativa = atual ? atual + " " + palavra : palavra;
    if (atual && (await medir(tentativa, familia, peso, tamanho)) > larguraPx) {
      linhas.push(atual);
      atual = palavra;
    } else {
      atual = tentativa;
    }
  }
  if (atual) linhas.push(atual);
  return linhas;
}

/**
 * Um pró encurtado para caber numa linha do cartão.
 *
 * Corta no último separador antes do limite (" — ", ", ", ": " ou espaço)
 * para não deixar palavra pela metade. Sem reticências quando o corte cai
 * numa fronteira de frase, para não parecer que falta algo.
 */
function encurtar(texto, limite = 70) {
  const t = semMarcacao(texto).trim();
  if (t.length <= limite) return t;
  const fatia = t.slice(0, limite);
  // Corta no último espaço; se há pontuação pouco antes dele, corta nela —
  // "…ATTO, e" fica melhor como "…ATTO…" do que como "…ATTO, e…".
  const espaco = fatia.lastIndexOf(" ");
  const pontuacao = Math.max(
    ...[" — ", " – ", ", ", ": ", "; "].map((c) => fatia.lastIndexOf(c)),
  );
  // Prefere fechar numa oração (pontuação) a cortar no meio dela, mesmo que
  // sobre espaço: "1800 W, a maior potência entre as dez…" lê pior do que
  // "1800 W, a maior potência entre as dez air fryers…" só com a vírgula.
  let melhor = pontuacao >= limite * 0.45 ? pontuacao : espaco;
  if (melhor < limite * 0.5) melhor = -1;
  let corte = (melhor > 0 ? fatia.slice(0, melhor) : fatia).replace(/[\s,;:—–-]+$/, "");
  // Não termina em palavra de ligação ("que", "de", "e"...): fica parecendo erro.
  const ligacao = /\s(que|a|o|e|de|da|do|das|dos|com|em|para|por|as|os|um|uma|no|na|nos|nas|ao|à|entre|sem)$/i;
  while (ligacao.test(corte)) corte = corte.replace(ligacao, "");
  return corte.replace(/[\s,;:—–-]+$/, "") + "…";
}

/* ---------------------------------------------------------------- cartão */

function svgTexto(linhas, { x, y, tamanho, familia, peso, cor, entrelinha }) {
  return linhas
    .map(
      (l, i) =>
        `<text x="${x}" y="${y + i * entrelinha}" font-family="${familia}" font-weight="${peso}" font-size="${tamanho}" fill="${cor}">${escapar(l)}</text>`,
    )
    .join("\n");
}

/**
 * Monta o SVG do cartão. A foto entra depois, pelo sharp, como camada
 * sobre o quadro branco — o librsvg leria WebP mal; o sharp lê bem.
 */
async function svgCartao({ kicker, titulo, pros, comFoto, simbolo, credito }) {
  const FOTO_LADO = 360;
  const fotoX = L - MARGEM - FOTO_LADO;
  const fotoY = 86;
  const colunaW = comFoto ? fotoX - 48 - MARGEM : L - 2 * MARGEM;

  // O título tenta a fonte maior e desce enquanto não cabe em três linhas.
  let tamTitulo = comFoto ? 54 : 62;
  let linhasTitulo = await quebrar(titulo, colunaW, tamTitulo, FAM.titulo, 600);
  while (linhasTitulo.length > 3 && tamTitulo > 38) {
    tamTitulo -= 4;
    linhasTitulo = await quebrar(titulo, colunaW, tamTitulo, FAM.titulo, 600);
  }
  linhasTitulo = linhasTitulo.slice(0, 4);
  const entrelinhaTitulo = Math.round(tamTitulo * 1.12);

  const yKicker = 104;
  const yTitulo = yKicker + 54;
  const yPros = yTitulo + linhasTitulo.length * entrelinhaTitulo + 26;
  const TAM_PRO = 24;
  const ENTRE_PRO = 40;

  const bullets = [];
  for (const [i, p] of pros.entries()) {
    const y = yPros + i * ENTRE_PRO;
    // Cada pró ocupa uma linha só: se os 70 caracteres não cabem na coluna
    // (com foto ela é mais estreita), encurta de novo até caber.
    let texto = p;
    let limite = 70;
    while ((await medir(texto, FAM.texto, 400, TAM_PRO)) > colunaW - 34 && limite > 20) {
      limite -= 3;
      texto = encurtar(p, limite);
    }
    bullets.push(
      `<circle cx="${MARGEM + 8}" cy="${y - 8}" r="5" fill="${COR.acao}"/>\n` +
        svgTexto([texto], { x: MARGEM + 30, y, tamanho: TAM_PRO, familia: FAM.texto, peso: 400, cor: COR.faixaTinta, entrelinha: ENTRE_PRO }),
    );
  }

  const quadroFoto = comFoto
    ? `<rect x="${fotoX}" y="${fotoY}" width="${FOTO_LADO}" height="${FOTO_LADO}" rx="28" fill="${COR.papel}"/>
       <text x="${fotoX + FOTO_LADO - 14}" y="${fotoY + FOTO_LADO + 30}" text-anchor="end" font-family="${FAM.texto}" font-size="16" fill="${COR.faixaSuave}">${escapar(credito)}</text>`
    : "";

  const yRodape = A - 58;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${L}" height="${A}" viewBox="0 0 ${L} ${A}">
  <rect width="${L}" height="${A}" fill="${COR.faixa}"/>
  <rect x="0" y="0" width="${L}" height="8" fill="${COR.acao}"/>
  <text x="${MARGEM}" y="${yKicker}" font-family="${FAM.texto}" font-weight="600" font-size="22" letter-spacing="3" fill="${COR.acao}">${escapar(kicker.toUpperCase())}</text>
  ${svgTexto(linhasTitulo, { x: MARGEM, y: yTitulo, tamanho: tamTitulo, familia: FAM.titulo, peso: 600, cor: COR.faixaTinta, entrelinha: entrelinhaTitulo })}
  ${bullets.join("\n")}
  ${quadroFoto}
  <line x1="${MARGEM}" y1="${yRodape - 44}" x2="${L - MARGEM}" y2="${yRodape - 44}" stroke="${COR.linhaEscura}" stroke-width="1"/>
  <g transform="translate(${MARGEM} ${yRodape - 28}) scale(${44 / 260})">${simbolo}</g>
  <text x="${MARGEM + 58}" y="${yRodape + 2}" font-family="${FAM.texto}" font-weight="600" font-size="22" fill="${COR.faixaTinta}">Guia Produto na Lupa</text>
  <text x="${L - MARGEM}" y="${yRodape + 2}" text-anchor="end" font-family="${FAM.dado}" font-weight="500" font-size="20" fill="${COR.faixaSuave}">guiaprodutonalupa.com.br</text>
</svg>`;
}

/** O miolo do SVG do símbolo (sem a tag <svg>), para ir inline no cartão. */
function simboloInline() {
  const svg = fs.readFileSync(path.join(RAIZ, "public", "marca", "simbolo-fundo-escuro.svg"), "utf8");
  return svg.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
}

async function gerar(arquivo, { sharp, indice, categorias, simbolo }) {
  const slug = arquivo.replace(/\.mdx$/, "");
  const fm = matter(fs.readFileSync(path.join(DIR_MDX, arquivo), "utf8")).data;

  const foto = fotoDe(fm, indice);
  const caminhoFoto = foto ? path.join(RAIZ, "public", foto.src.replace(/^\//, "")) : null;
  const comFoto = Boolean(caminhoFoto && fs.existsSync(caminhoFoto));

  const kicker = categorias.get(fm.categoria) || fm.categoria;
  const titulo = semMarcacao(fm.tituloCurto || fm.titulo);
  const pros = (fm.pros || []).slice(0, 3).map((p) => encurtar(p));

  const svg = await svgCartao({
    kicker,
    titulo,
    pros,
    comFoto,
    simbolo,
    credito: comFoto ? foto.credito || "" : "",
  });

  let img = sharp(Buffer.from(svg), { density: 72 });

  if (comFoto) {
    const FOTO_LADO = 360;
    const miolo = Math.round(FOTO_LADO * 0.84);
    const fotoPng = await sharp(caminhoFoto)
      .resize({ width: miolo, height: miolo, fit: "inside", withoutEnlargement: false })
      .flatten({ background: COR.papel })
      .png()
      .toBuffer();
    const meta = await sharp(fotoPng).metadata();
    const fotoX = L - MARGEM - FOTO_LADO;
    const fotoY = 86;
    img = img.composite([
      {
        input: fotoPng,
        left: Math.round(fotoX + (FOTO_LADO - meta.width) / 2),
        top: Math.round(fotoY + (FOTO_LADO - meta.height) / 2),
      },
    ]);
  }

  // PNG com paleta: o cartão é texto e fundo chapado, 256 cores bastam e o
  // arquivo fica bem abaixo dos 300 KB que o Facebook/WhatsApp buscam rápido.
  const saida = path.join(DIR_SAIDA, slug + ".png");
  const info = await img.png({ palette: true, quality: 90, compressionLevel: 9 }).toFile(saida);
  return { slug, comFoto, bytes: info.size };
}

/* ------------------------------------------------------------------- main */

async function main() {
  const so = process.argv.slice(2).filter((a) => !a.startsWith("-"));
  fs.mkdirSync(DIR_SAIDA, { recursive: true });

  await prepararFontes();
  const { default: sharp } = await import("sharp");
  sharpMedidor = sharp;

  const ctx = {
    sharp,
    indice: indiceDeFotos(),
    categorias: nomesDasCategorias(),
    simbolo: simboloInline(),
  };

  const arquivos = fs
    .readdirSync(DIR_MDX)
    .filter((f) => f.endsWith(".mdx"))
    .filter((f) => so.length === 0 || so.includes(f.replace(/\.mdx$/, "")));

  const resultados = [];
  for (const a of arquivos) {
    const r = await gerar(a, ctx);
    resultados.push(r);
    console.log(`  ${r.comFoto ? "foto " : "sem  "} ${(r.bytes / 1024).toFixed(0).padStart(4)} KB  ${r.slug}`);
  }

  const semFoto = resultados.filter((r) => !r.comFoto);
  const media = resultados.reduce((s, r) => s + r.bytes, 0) / Math.max(1, resultados.length);
  console.log(
    `\n${resultados.length} cartões em public/og/reviews — ${resultados.length - semFoto.length} com foto, ${semFoto.length} sem; média ${(media / 1024).toFixed(0)} KB`,
  );
  if (semFoto.length) console.log("  sem foto: " + semFoto.map((r) => r.slug).join(", "));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

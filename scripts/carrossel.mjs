#!/usr/bin/env node
/**
 * Gera os carrosséis de rede social a partir dos comparativos publicados.
 *
 *   npm run carrossel            # todos
 *   npm run carrossel -- wap-magic-vs-gtw-inox-50
 *
 * Sai em `social/<slug>/`: os PNG em 1080×1350 (proporção 4:5, a maior que o
 * Instagram aceita no feed) e um `legenda.txt` para copiar e colar.
 *
 * Nada aqui é inventado, e é esse o ponto. Cada slide sai de um campo que já
 * está publicado na página do comparativo — `titulo`, `linhas`, `vencedores`,
 * `lacunas`. Se o número muda na ficha, muda no slide na próxima execução; se
 * uma lacuna deixa de existir porque o fabricante passou a publicar o dado,
 * ela some do carrossel sozinha. O post nunca fica dizendo o que a página já
 * não diz mais.
 *
 * A foto de produto é a mesma da ficha — material do fabricante, com o
 * crédito colado na imagem em toda peça. Vale registrar o limite: essa foto
 * tem dono, e o que a licença de cada fabricante permite fora do nosso
 * domínio varia de marca para marca. Quem publica confere.
 *
 * O que nunca entra aqui é imagem vinda da Amazon. A Licença de PI do
 * Programa de Associados concede o direito de "copiar e exibir o Conteúdo do
 * Programa apenas em seu Site", e Conteúdo do Programa inclui, com todas as
 * letras, as imagens da Creators API. Rede social não é o Site.
 *
 * O motor é o `next/og`, que já vem no Next com satori e resvg dentro. Zero
 * dependência nova.
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import sharp from "sharp";
import React from "react";
import { ImageResponse } from "next/og.js";

const RAIZ = process.cwd();
const DIR_MDX = path.join(RAIZ, "content", "comparativos");
const DIR_SAIDA = path.join(RAIZ, "social");
const DIR_FONTES = path.join(RAIZ, "scripts", ".fontes");

const L = 1080;
const A = 1350;

// A paleta é a de app/globals.css. Repetida aqui porque o satori não lê CSS —
// se mudar lá, tem que mudar aqui, e é a única duplicação do arquivo.
const COR = {
  faixa: "#101418",
  faixaTinta: "#eef3f2",
  faixaSuave: "#9fb2b1",
  papel: "#ffffff",
  fundo: "#f3f5f7",
  tinta: "#101418",
  tintaSuave: "#5d6a73",
  linha: "#e2e6ea",
  acao: "#0f6e6c",
  acaoSuave: "#d9ecea",
  atencao: "#b53a2d",
  medio: "#906514",
};

/* ---------------------------------------------------------------- fontes */

const UA_SEM_WOFF2 =
  "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0 Safari/537.36";

/**
 * O Google devolve WOFF em vez de WOFF2 quando o navegador declarado é
 * antigo, e o satori lê WOFF. As fontes ficam em `scripts/.fontes`, fora do
 * Git: são as mesmas do site, baixadas uma vez e reusadas.
 */
async function fonte(nome, consulta) {
  fs.mkdirSync(DIR_FONTES, { recursive: true });
  const destino = path.join(DIR_FONTES, nome + ".woff");
  if (!fs.existsSync(destino)) {
    const css = await (
      await fetch("https://fonts.googleapis.com/css2?family=" + consulta, {
        headers: { "User-Agent": UA_SEM_WOFF2 },
      })
    ).text();
    const url = (css.match(/url\((https:[^)]+\.(?:woff|ttf|otf))\)/) || [])[1];
    if (!url) {
      throw new Error(
        `Nao consegui baixar a fonte ${nome}. O Google respondeu:\n${css.slice(0, 200)}`,
      );
    }
    fs.writeFileSync(destino, Buffer.from(await (await fetch(url)).arrayBuffer()));
    console.log(`  fonte baixada: ${nome}`);
  }
  return fs.readFileSync(destino);
}

/* ----------------------------------------------------------------- fotos */

/**
 * Índice das fotos da base, por nome e por ASIN.
 *
 * O ASIN primeiro porque é o único identificador que não muda de grafia: o
 * nome do produto no comparativo e na ficha às vezes difere numa palavra, e
 * casar por nome sozinho já falhou antes na base.
 */
function indiceDeFotos() {
  const porNome = new Map();
  const porAsin = new Map();
  for (const f of fs.readdirSync(path.join(RAIZ, "dados")).filter((f) => f.endsWith(".json"))) {
    const j = JSON.parse(fs.readFileSync(path.join(RAIZ, "dados", f), "utf8"));
    for (const p of Array.isArray(j) ? j : j.produtos || []) {
      if (!p.imagem) continue;
      porNome.set(p.nome.toLowerCase(), p);
      const asin = (p.lojas?.amazon || "").match(/\/dp\/([A-Z0-9]{10})/)?.[1];
      if (asin) porAsin.set(asin, p);
    }
  }
  return { porNome, porAsin };
}

/**
 * A foto de um concorrente, já em PNG e embutida.
 *
 * O satori não decodifica WebP, e a base inteira é WebP desde o
 * `npm run imagens`. O sharp converte na hora, no tamanho em que a foto vai
 * aparecer — 424 px é o dobro dos 212 do slide, para não sair borrada.
 *
 * Vai embutida como data URI porque o satori não lê caminho de disco.
 */
async function fotoDe(concorrente, indice) {
  const asin = (concorrente.lojas?.amazon || "").match(/\/dp\/([A-Z0-9]{10})/)?.[1];
  const p =
    (asin && indice.porAsin.get(asin)) ||
    indice.porNome.get(concorrente.nome.toLowerCase());
  if (!p?.imagem) return null;

  const arquivo = path.join(RAIZ, "public", p.imagem.src.replace(/^\//, ""));
  if (!fs.existsSync(arquivo)) return null;

  const png = await sharp(arquivo)
    .resize({ width: 424, height: 424, fit: "inside", withoutEnlargement: true })
    .flatten({ background: "#ffffff" })
    .png()
    .toBuffer();

  return {
    dados: "data:image/png;base64," + png.toString("base64"),
    credito: p.imagem.credito || "",
  };
}

/* ------------------------------------------------------------- elementos */

const el = (tipo, estilo, filhos) =>
  React.createElement(tipo, { style: estilo }, filhos);

const caixa = (estilo, filhos) =>
  el("div", { display: "flex", flexDirection: "column", ...estilo }, filhos);

const linha = (estilo, filhos) =>
  el("div", { display: "flex", flexDirection: "row", ...estilo }, filhos);

const texto = (conteudo, estilo) => el("div", estilo, conteudo);

/**
 * `<img>` precisa de `src` como propriedade, não dentro de `style` — o
 * `el()` acima manda tudo para o estilo, que é o certo para os outros
 * elementos e errado só para este.
 */
const imagem = (src, estilo) =>
  React.createElement("img", { src, style: estilo });

/**
 * A foto num cartão branco, com o crédito colado.
 *
 * O cartão branco não é enfeite: a foto do fabricante vem recortada sobre
 * fundo branco, e sobre a faixa escura ela apareceria como um retângulo
 * branco sem borda definida. E o crédito acompanha a foto em toda peça —
 * no site ele fica ao lado do endereço da fonte, aqui o endereço não cabe,
 * então o nome de quem fez a imagem é o mínimo que viaja junto.
 */
function fotoEmCartao(f, lado = 300) {
  return caixa(
    {
      width: lado,
      height: lado,
      background: COR.papel,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    [
      imagem(f.dados, {
        width: Math.round(lado * 0.81),
        height: Math.round(lado * 0.81),
        objectFit: "contain",
      }),
      texto(f.credito, {
        position: "absolute",
        bottom: 10,
        right: 12,
        fontFamily: "Archivo",
        fontSize: 15,
        color: COR.tintaSuave,
      }),
    ],
  );
}

/**
 * Tira o `**negrito**` do MDX.
 *
 * As `lacunas` e os subtitulos dos comparativos sao escritos com marcacao,
 * porque na pagina passam por um renderizador. Aqui nao passam: sem isto, o
 * slide sai com os asteriscos na cara do leitor. E o mesmo defeito que ja
 * apareceu no `resumo` das fichas — marcacao escrita para um destino,
 * impressa em outro.
 *
 * Tirar em vez de renderizar e decisao, nao preguica: o satori exige
 * `display: flex` em qualquer bloco com mais de um filho, entao um trecho em
 * negrito no meio de um paragrafo vira item de flexbox, e o texto passa a
 * quebrar entre os trechos em vez de entre as palavras. Uma enfase nao vale
 * uma linha mal quebrada — e num bullet curto, destacado e sozinho na tela,
 * ela ja nao fazia muita falta.
 */
function semMarcacao(bruto) {
  return String(bruto).replace(/[*][*](.+?)[*][*]/g, "$1");
}

/**
 * A marca no rodapé de todo slide, para a peça não circular anônima.
 *
 * Fixo no pé em vez de empurrado por `margin-top: auto`: o conteúdo dos
 * slides varia muito de altura — uma tabela de cinco linhas contra uma capa
 * de três —, e empurrar deixaria o rodapé dançando de slide para slide. Como
 * o corpo é centralizado na moldura, o rodapé preso embaixo é o único
 * elemento que se repete na mesma posição em todos.
 */
function rodape({ claro = false, numero, total }) {
  const cor = claro ? COR.tintaSuave : COR.faixaSuave;
  return linha(
    {
      position: "absolute",
      bottom: 72,
      left: 72,
      right: 72,
      alignItems: "center",
      justifyContent: "space-between",
      fontFamily: "Archivo",
      fontSize: 26,
      color: cor,
    },
    [
      texto("guiaprodutonalupa.com.br", { fontWeight: 600 }),
      texto(`${numero}/${total}`, { fontFamily: "Mono", letterSpacing: 1 }),
    ],
  );
}

/** Pastilha de rótulo, a mesma linguagem das pastilhas do site. */
function pastilha(conteudo, { claro = false } = {}) {
  return texto(conteudo, {
    fontFamily: "Archivo",
    fontSize: 24,
    fontWeight: 600,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: claro ? COR.acao : COR.faixaSuave,
    background: claro ? COR.acaoSuave : "rgba(255,255,255,0.08)",
    padding: "12px 24px",
    borderRadius: 999,
  });
}

/**
 * A moldura de todo slide.
 *
 * `justifyContent: center` porque o conteúdo de cada slide tem altura muito
 * diferente e o formato é fixo: uma capa de três linhas encostada no topo
 * deixaria metade da peça vazia. Centralizado, o mesmo texto ocupa o meio e a
 * sobra fica dividida em cima e embaixo, que é o que parece proposital.
 *
 * `position: relative` é o que ancora o rodapé fixo.
 */
const MOLDURA = {
  width: L,
  height: A,
  padding: 72,
  paddingBottom: 150,
  position: "relative",
  justifyContent: "center",
};

/* ---------------------------------------------------------------- slides */

/**
 * A capa sai do `tituloCurto`, quebrado nos dois pontos.
 *
 * Os títulos do site são escritos como "Produto A ou Produto B: o número que
 * decide" — a primeira metade diz de quem se trata e a segunda é o gancho.
 * Separar ali dá exatamente a hierarquia que uma capa precisa, sem escrever
 * texto novo. Quando não há dois pontos, o título inteiro vira o gancho.
 */
function slideCapa(c, fotos, total) {
  const bruto = c.tituloCurto || c.titulo;
  const corte = bruto.indexOf(": ");
  const chapeu = corte > 0 ? bruto.slice(0, corte) : "Comparativo";
  const gancho = corte > 0 ? bruto.slice(corte + 2) : bruto;
  const comFoto = fotos.filter(Boolean);

  // Com foto o subtítulo é cortado: os dois juntos não cabem, e numa capa o
  // que segura o polegar é a imagem mais o número, não o parágrafo. O
  // subtítulo inteiro continua na legenda, que é onde ele é lido.
  const subtitulo = semMarcacao(c.subtitulo);
  const resumo =
    comFoto.length === 2 && subtitulo.length > 150
      ? subtitulo.slice(0, subtitulo.indexOf(". ") + 1) || subtitulo
      : subtitulo;

  return caixa({ ...MOLDURA, background: COR.faixa, color: COR.faixaTinta }, [
    linha({ marginBottom: 40 }, [pastilha("Ficha contra ficha")]),
    texto(chapeu, {
      fontFamily: "Archivo",
      fontSize: 32,
      fontWeight: 600,
      color: COR.faixaSuave,
      marginBottom: 16,
    }),
    texto(gancho, {
      fontFamily: "Fraunces",
      fontSize: gancho.length > 46 ? 78 : 96,
      lineHeight: 1.04,
    }),
    texto(resumo, {
      fontFamily: "Archivo",
      fontSize: 30,
      lineHeight: 1.45,
      color: COR.faixaSuave,
      marginTop: 28,
    }),
    // Cartão, "ou", cartão — três itens numa linha, sem posicionamento
    // absoluto. A primeira versão punha o "ou" com `position: absolute`, e ele
    // ancorou na moldura em vez de na linha: caiu em cima da segunda foto.
    comFoto.length === 2
      ? linha({ marginTop: 40, alignItems: "center" }, [
          fotoEmCartao(fotos[0]),
          texto("ou", {
            fontFamily: "Fraunces",
            fontSize: 42,
            color: COR.faixaSuave,
            paddingLeft: 26,
            paddingRight: 26,
          }),
          fotoEmCartao(fotos[1]),
        ])
      : texto("", { height: 0 }),
    rodape({ numero: 1, total }),
  ]);
}

/**
 * Os dois concorrentes, com foto, nome e a linha que resume cada um.
 *
 * A foto é a do fabricante, a mesma da ficha, e o crédito vai colado nela —
 * no site o crédito fica na legenda ao lado do endereço da fonte, e aqui o
 * endereço não cabe, então o mínimo é o nome de quem fez a imagem aparecer
 * junto e sempre.
 */
function slideConcorrentes(c, fotos, n, total) {
  return caixa({ ...MOLDURA, background: COR.papel, color: COR.tinta }, [
    linha({ marginBottom: 40 }, [pastilha("Os dois", { claro: true })]),
    ...c.concorrentes.slice(0, 2).map((p, i) =>
      linha({ marginBottom: 40, alignItems: "center" }, [
        fotos[i]
          ? linha({ marginRight: 32 }, [fotoEmCartao(fotos[i], 260)])
          : caixa({ width: 0 }, []),
        caixa(
          {
            width: fotos[i] ? 644 : 936,
            borderLeft: `6px solid ${i === 0 ? COR.acao : COR.tintaSuave}`,
            paddingLeft: 24,
          },
          [
            texto(p.marca, {
              fontFamily: "Archivo",
              fontSize: 24,
              fontWeight: 600,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: COR.tintaSuave,
            }),
            texto(p.nome, {
              fontFamily: "Fraunces",
              fontSize: 48,
              lineHeight: 1.1,
              marginTop: 6,
            }),
            texto(semMarcacao(p.linhaResumo), {
              fontFamily: "Archivo",
              fontSize: 27,
              lineHeight: 1.4,
              color: COR.tintaSuave,
              marginTop: 12,
            }),
          ],
        ),
      ]),
    ),
    rodape({ claro: true, numero: n, total }),
  ]);
}

/**
 * A tabela, cinco linhas por slide.
 *
 * As linhas saem na ordem em que foram escritas no MDX, e isso é de
 * propósito: quem escreveu o comparativo pôs o critério que decide em cima.
 * Ordenar aqui por "maior diferença" pareceria mais esperto e trocaria o
 * julgamento de quem apurou por uma heurística.
 */
function slideTabela(c, linhas, n, total, primeira) {
  const [a, b] = c.concorrentes;
  return caixa({ ...MOLDURA, background: COR.fundo, color: COR.tinta }, [
    primeira
      ? linha({ marginBottom: 36 }, [pastilha("Lado a lado", { claro: true })])
      : texto("", { height: 0 }),
    linha(
      {
        fontFamily: "Archivo",
        fontSize: 24,
        fontWeight: 600,
        letterSpacing: 1,
        textTransform: "uppercase",
        color: COR.tintaSuave,
        paddingBottom: 16,
        borderBottom: `2px solid ${COR.linha}`,
      },
      [
        texto("", { width: "36%" }),
        texto(a.nome, { width: "32%" }),
        texto(b.nome, { width: "32%" }),
      ],
    ),
    ...linhas.map((l) =>
      linha(
        {
          paddingTop: 34,
          paddingBottom: 34,
          borderBottom: `1px solid ${COR.linha}`,
          alignItems: "flex-start",
        },
        [
          texto(l.criterio, {
            width: "36%",
            fontFamily: "Archivo",
            fontSize: 29,
            lineHeight: 1.3,
            color: COR.tintaSuave,
            paddingRight: 16,
          }),
          ...l.valores.slice(0, 2).map((v) =>
            texto(v, {
              width: "32%",
              fontFamily: "Mono",
              fontSize: 31,
              lineHeight: 1.3,
              paddingRight: 16,
              color: /não informa|nao informa/i.test(v) ? COR.atencao : COR.tinta,
            }),
          ),
        ],
      ),
    ),
    rodape({ claro: true, numero: n, total }),
  ]);
}

/** Para quem serve cada um. */
function slideVencedores(c, vencedores, n, total, primeira) {
  return caixa({ ...MOLDURA, background: COR.papel, color: COR.tinta }, [
    primeira
      ? linha({ marginBottom: 40 }, [pastilha("Para quem", { claro: true })])
      : texto("", { height: 0 }),
    ...vencedores.map((v) =>
      caixa({ marginBottom: 38 }, [
        texto(v.perfil, {
          fontFamily: "Archivo",
          fontSize: 30,
          lineHeight: 1.35,
          color: COR.tintaSuave,
        }),
        texto(v.produto, {
          fontFamily: "Fraunces",
          fontSize: 44,
          lineHeight: 1.15,
          marginTop: 10,
          color: COR.acao,
        }),
      ]),
    ),
    rodape({ claro: true, numero: n, total }),
  ]);
}

/**
 * O slide da assinatura: o que ninguém publica.
 *
 * É o que o site tem de diferente e é o que não cabe num anúncio. Vai sobre a
 * faixa escura, como no site, porque é o momento em que a peça deixa de
 * comparar e passa a acusar.
 */
function slideLacunas(c, lacunas, n, total) {
  return caixa({ ...MOLDURA, background: COR.faixa, color: COR.faixaTinta }, [
    linha({ marginBottom: 20 }, [pastilha("O que ninguém publica")]),
    texto("Perguntas que a ficha oficial não responde", {
      fontFamily: "Fraunces",
      fontSize: 52,
      lineHeight: 1.1,
      marginBottom: 40,
    }),
    ...lacunas.map((t) =>
      linha({ marginBottom: 28, alignItems: "flex-start" }, [
        texto("—", {
          fontFamily: "Archivo",
          fontSize: 30,
          color: COR.faixaSuave,
          marginRight: 18,
        }),
        texto(semMarcacao(t), {
          fontFamily: "Archivo",
          fontSize: 29,
          lineHeight: 1.45,
          color: COR.faixaTinta,
          width: 840,
        }),
      ]),
    ),
    rodape({ numero: n, total }),
  ]);
}

/** O fecho, com a frase que o site repete em toda ficha. */
function slideFecho(c, n, total) {
  const fontes = (c.fontes || []).filter((f) => f.tipo === "fabricante");
  return caixa({ ...MOLDURA, background: COR.papel, color: COR.tinta }, [
    linha({ marginBottom: 44 }, [pastilha("Como apuramos", { claro: true })]),
    texto("Nenhum dos dois foi testado por nós.", {
      fontFamily: "Fraunces",
      fontSize: 64,
      lineHeight: 1.1,
    }),
    texto(
      "Todos os números saíram das fichas oficiais do fabricante, e cada um " +
        "está publicado na página com o endereço da fonte e a data da consulta. " +
        "Quando o fabricante não publica um dado, a tabela diz isso em vez de estimar.",
      {
        fontFamily: "Archivo",
        fontSize: 31,
        lineHeight: 1.5,
        color: COR.tintaSuave,
        marginTop: 28,
      },
    ),
    ...(fontes.length
      ? [
          texto("Fontes deste comparativo", {
            fontFamily: "Archivo",
            fontSize: 24,
            fontWeight: 600,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: COR.tintaSuave,
            marginTop: 44,
            marginBottom: 14,
          }),
          ...fontes.slice(0, 3).map((f) =>
            texto(`${f.titulo} · consultada em ${f.consultadaEm}`, {
              fontFamily: "Mono",
              fontSize: 24,
              lineHeight: 1.5,
              color: COR.tintaSuave,
            }),
          ),
        ]
      : []),
    rodape({ claro: true, numero: n, total }),
  ]);
}

/**
 * Onde a pessoa compra — e por que isso tranquiliza.
 *
 * Quem chega de rede social num site que não conhece hesita antes de clicar, e
 * a hesitação é razoável. A resposta não é prometer segurança: é dizer o que
 * de fato acontece. O cadastro, o pagamento e a entrega são da Amazon, e nada
 * disso passa por aqui. É um fato verificável, e um fato tranquiliza mais que
 * uma garantia que nós não temos como dar.
 *
 * Por isso nada de "compre com total segurança": além de ser promessa sobre
 * empresa que não é nossa, o contrato de Associados proíbe qualquer coisa que
 * soe como a Amazon avalizando o site.
 *
 * A última linha é a declaração que o programa exige onde houver link de
 * afiliado — e rede social conta.
 */
function slideOndeCompra(c, n, total) {
  return caixa({ ...MOLDURA, background: COR.faixa, color: COR.faixaTinta }, [
    linha({ marginBottom: 40 }, [pastilha("Onde você compra")]),
    texto("Aqui você compara.", {
      fontFamily: "Fraunces",
      fontSize: 76,
      lineHeight: 1.08,
    }),
    texto("A compra é no site da Amazon.", {
      fontFamily: "Fraunces",
      fontSize: 76,
      lineHeight: 1.08,
      color: COR.faixaSuave,
    }),
    texto(
      "Seu cadastro, seu pagamento, sua entrega — nada disso passa por nós. " +
        "O que a gente faz é a parte chata: ler a ficha oficial de cada produto, " +
        "pôr as duas na mesma tabela e apontar o que o fabricante não publica.",
      {
        fontFamily: "Archivo",
        fontSize: 32,
        lineHeight: 1.5,
        color: COR.faixaTinta,
        marginTop: 36,
      },
    ),
    caixa(
      {
        marginTop: 40,
        background: "rgba(255,255,255,0.08)",
        borderRadius: 20,
        padding: 32,
      },
      [
        texto("A comparação completa, linha a linha:", {
          fontFamily: "Archivo",
          fontSize: 28,
          color: COR.faixaSuave,
        }),
        texto("guiaprodutonalupa.com.br", {
          fontFamily: "Fraunces",
          fontSize: 44,
          marginTop: 8,
        }),
      ],
    ),
    texto("Como Associado da Amazon, recebemos por compras qualificadas.", {
      fontFamily: "Archivo",
      fontSize: 24,
      lineHeight: 1.4,
      color: COR.faixaSuave,
      marginTop: 28,
    }),
    rodape({ numero: n, total }),
  ]);
}

/* ------------------------------------------------------------- montagem */

/** Divide uma lista em blocos de n. */
const emBlocos = (lista, n) =>
  Array.from({ length: Math.ceil(lista.length / n) }, (_, i) =>
    lista.slice(i * n, i * n + n),
  );

function montarSlides(c, fotos) {
  const blocosTabela = emBlocos(c.linhas.slice(0, 15), 5);
  const blocosVencedores = emBlocos(c.vencedores.slice(0, 4), 2);
  const lacunas = (c.lacunas || []).slice(0, 4);

  // Conta antes de montar, porque o rodapé precisa do total.
  const total =
    2 + blocosTabela.length + blocosVencedores.length + (lacunas.length ? 1 : 0) + 2;

  const slides = [];
  let n = 1;
  slides.push(slideCapa(c, fotos, total));
  n++;
  slides.push(slideConcorrentes(c, fotos, n, total));
  blocosTabela.forEach((bloco, i) => {
    n++;
    slides.push(slideTabela(c, bloco, n, total, i === 0));
  });
  blocosVencedores.forEach((bloco, i) => {
    n++;
    slides.push(slideVencedores(c, bloco, n, total, i === 0));
  });
  if (lacunas.length) {
    n++;
    slides.push(slideLacunas(c, lacunas, n, total));
  }
  n++;
  slides.push(slideFecho(c, n, total));
  n++;
  slides.push(slideOndeCompra(c, n, total));
  return slides;
}

/**
 * A legenda, montada dos mesmos campos.
 *
 * Sai num arquivo para copiar e colar em vez de ir só para a tela: é o que
 * separa "gerei as imagens" de "dá para postar".
 */
function montarLegenda(c, slug) {
  const [a, b] = c.concorrentes;
  const lacunas = (c.lacunas || []).slice(0, 2);
  const marcas = [...new Set(c.concorrentes.map((p) => p.marca))];
  const tags = [
    "#" + c.categoria.replace(/-/g, ""),
    ...marcas.map((m) => "#" + m.toLowerCase().replace(/[^a-z0-9]/g, "")),
    "#comparativo",
    "#fichatecnica",
    "#guiaprodutonalupa",
  ];
  return [
    c.titulo,
    "",
    c.subtitulo,
    "",
    `${a.nome} contra ${b.nome}, linha a linha, só com o que o fabricante publica.`,
    "",
    lacunas.length ? "O que nenhuma das duas fichas responde:" : "",
    ...lacunas.map((t) => "• " + t.replace(/\*\*/g, "")),
    "",
    "Nenhum dos dois foi testado por nós. Todos os números saíram das fichas",
    "oficiais, e a página traz o endereço de cada fonte e a data da consulta.",
    "",
    `A comparação completa: guiaprodutonalupa.com.br/comparativos/${slug}/`,
    "",
    "Aqui você compara; a compra é no site da Amazon. Seu cadastro, seu pagamento",
    "e sua entrega são de lá — nada disso passa por nós. Você paga o mesmo preço.",
    "",
    "Como Associado da Amazon, recebemos por compras qualificadas.",
    "",
    tags.join(" "),
  ]
    .filter((l, i, arr) => !(l === "" && arr[i - 1] === ""))
    .join("\n");
}

/* --------------------------------------------------------------- execucao */

async function main() {
  const alvo = process.argv[2];
  const arquivos = fs
    .readdirSync(DIR_MDX)
    .filter((f) => f.endsWith(".mdx"))
    .filter((f) => !alvo || f.startsWith(alvo));

  if (!arquivos.length) {
    console.error(`Nenhum comparativo encontrado${alvo ? ` para "${alvo}"` : ""}.`);
    process.exitCode = 1;
    return;
  }

  console.log("fontes:");
  const fontes = [
    { name: "Archivo", data: await fonte("archivo-400", "Archivo:wght@400"), weight: 400, style: "normal" },
    { name: "Archivo", data: await fonte("archivo-600", "Archivo:wght@600"), weight: 600, style: "normal" },
    { name: "Fraunces", data: await fonte("fraunces-600", "Fraunces:opsz,wght@144,600"), weight: 600, style: "normal" },
    { name: "Mono", data: await fonte("mono-500", "IBM+Plex+Mono:wght@500"), weight: 500, style: "normal" },
  ];
  console.log("  prontas\n");

  const indice = indiceDeFotos();

  for (const arquivo of arquivos) {
    const slug = arquivo.replace(/\.mdx$/, "");
    const { data } = matter(fs.readFileSync(path.join(DIR_MDX, arquivo), "utf8"));
    const destino = path.join(DIR_SAIDA, slug);
    fs.mkdirSync(destino, { recursive: true });

    const fotos = await Promise.all(
      data.concorrentes.slice(0, 2).map((p) => fotoDe(p, indice)),
    );
    const slides = montarSlides(data, fotos);
    for (const [i, slide] of slides.entries()) {
      const img = new ImageResponse(slide, { width: L, height: A, fonts: fontes });
      const buf = Buffer.from(await img.arrayBuffer());
      fs.writeFileSync(
        path.join(destino, String(i + 1).padStart(2, "0") + ".png"),
        buf,
      );
    }
    fs.writeFileSync(path.join(destino, "legenda.txt"), montarLegenda(data, slug), "utf8");
    console.log(`${slug}: ${slides.length} slides + legenda`);
  }

  console.log(`\nPronto em social/. Cada pasta é um post: os PNG na ordem, e a legenda ao lado.`);
}

await main();

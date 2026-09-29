import type { Produto } from "./specs";

/**
 * O motor do projeto de câmeras do /simulador: respostas entram, lista de
 * compras sai. Puro — roda no navegador e não lê disco. A especificação
 * completa, com o porquê de cada regra, está em docs/simulador.md.
 *
 * TRÊS ESPÉCIES DE NÚMERO, E ELAS NÃO SE MISTURAM
 *
 * 1. Número do fabricante — visão noturna, proteção IP, cartão máximo. Sai
 *    da ficha, e a frase diz "declara".
 * 2. Regra do simulador — margem de cabo, folga de canais. É nossa, e por
 *    isso aparece na tela com o rótulo "regra do simulador" e o valor à vista.
 * 3. Contagem de topologia — dois conectores BNC por câmera, um em cada
 *    ponta do cabo. Não é estimativa, é como a peça se liga.
 *
 * O que dependeria de número que ninguém publicou (tamanho do HD sem a taxa
 * de gravação do gravador, amperagem da fonte sem o consumo das câmeras) não
 * é calculado: a lista diz qual número falta e de quem.
 *
 * PEÇA SEM FICHA ENTRA NA LISTA
 *
 * Decisão do Allan em 28/09/2026 (a "opção A"): a lista mostra tudo o que o
 * projeto exige, com a especificação mínima, mesmo quando o site ainda não
 * tem ficha daquela peça. Esconder a peça faria a pessoa comprar câmera sem
 * cartão; inventar um produto quebraria a regra de só recomendar o que tem
 * fonte oficial.
 */

export type Sistema = "wifi" | "dvr" | "nvr";

export type Respostas = {
  internos: number;
  externos: number;
  /** Até quantos metros a câmera externa precisa enxergar à noite. */
  visaoNoturnaM: number;
  /** Até quantos metros a câmera interna precisa enxergar à noite — o maior cômodo. */
  visaoNoturnaInternaM: number;
  /** Imagem colorida à noite (câmera com luz branca). */
  noturnaColorida: boolean;
  /** O que precisa dar para ver na distância pedida, lá fora e dentro. */
  nivelExterno: Nivel;
  nivelInterno: Nivel;
  /**
   * No gravador, o que vence quando não dá para ter os dois: na linha MHDX
   * 13xx, gravar 1920 × 1080 desliga a detecção de pessoas.
   */
  prioridadeDvr: "resolucao" | "deteccao";
  cabo: "sim" | "obra" | "nao";
  internetEstavel: boolean;
  gravarSemInternet: boolean;
  /** Escolha do leitor, quando ele troca o sistema recomendado. */
  sistema?: Sistema;
  dias: 7 | 15 | 30;
  modo: "continuo" | "movimento";
  resolucao: "1080p" | "4mp" | "5mp";
  /** Metros de cabo, em média, de cada câmera até o gravador. */
  distanciaMediaM: number;
  /** Metros do ponto mais longe até o gravador. */
  distanciaMaxM: number;
  caboPreferido: "coaxial" | "utp";
  tomadaPerto: boolean;
  conectoresExpostos: boolean;
  celular: boolean;
  monitorLocal: boolean;
  nobreak: boolean;
  folga: boolean;
  instalador: "eu" | "profissional";
  wifiChegaLonge: "sim" | "nao" | "naoSei";
};

export const RESPOSTAS_INICIAIS: Respostas = {
  internos: 1,
  externos: 1,
  visaoNoturnaM: 8,
  visaoNoturnaInternaM: 5,
  noturnaColorida: false,
  nivelExterno: "observar",
  nivelInterno: "observar",
  prioridadeDvr: "deteccao",
  cabo: "sim",
  internetEstavel: true,
  gravarSemInternet: true,
  dias: 15,
  modo: "continuo",
  resolucao: "1080p",
  distanciaMediaM: 15,
  distanciaMaxM: 25,
  caboPreferido: "coaxial",
  tomadaPerto: false,
  conectoresExpostos: true,
  celular: true,
  monitorLocal: false,
  nobreak: false,
  folga: false,
  instalador: "profissional",
  wifiChegaLonge: "naoSei",
};

/**
 * NÍVEL DE DETALHE — a pergunta "o que precisa dar para ver ali?".
 *
 * Os quatro degraus e os pixels por metro de cada um são os da norma IEC
 * 62676-4 (DORI): detectar 25, observar 62,5, reconhecer 125, identificar 250.
 * A conta é geometria sobre dois números que o fabricante declara — a
 * resolução e o ângulo horizontal: na distância d, a cena tem 2·d·tan(ângulo/2)
 * metros de largura, e os pixels horizontais se repartem por ela.
 *
 * É o centro da imagem, com a câmera de frente para o alvo. Altura de
 * instalação, inclinação e distorção da lente ficam fora da conta, e a tela
 * diz isso. A ideia veio do Di.Ca Next, a calculadora da Intelbras; o que ela
 * não trata e este simulador trata é o que o gravador guarda: em 1080p Lite o
 * DVR grava 960 pixels de largura, e o detalhe gravado cai à metade.
 */
export type Nivel = "detectar" | "observar" | "reconhecer" | "identificar";

export const NIVEIS: Record<Nivel, { ppm: number; verbo: string; rotulo: string; detalhe: string }> = {
  detectar: { ppm: 25, verbo: "detectar", rotulo: "Que passou alguém", detalhe: "Saber que há uma pessoa, sem ver quem é." },
  observar: { ppm: 62.5, verbo: "observar", rotulo: "O que a pessoa faz", detalhe: "Roupa, cores e o que ela está fazendo." },
  reconhecer: { ppm: 125, verbo: "reconhecer", rotulo: "Quem é, se eu conheço", detalhe: "Reconhecer um rosto que você já viu." },
  identificar: { ppm: 250, verbo: "identificar", rotulo: "Quem é, mesmo um estranho", detalhe: "Detalhe para identificar alguém que você nunca viu." },
};

const ORDEM_NIVEIS: Nivel[] = ["detectar", "observar", "reconhecer", "identificar"];

/** Pixels horizontais da resolução declarada. */
export function pixelsHorizontais(resolucao: unknown): number | null {
  const t = typeof resolucao === "string" ? resolucao : "";
  if (t.startsWith("720p")) return 1280;
  if (t.startsWith("1080p")) return 1920;
  if (t.startsWith("2160p")) return 3840;
  return null;
}

/** Pixels por metro no centro da cena, a `distanciaM` metros. */
export function pixelsPorMetro(px: number, anguloGraus: number, distanciaM: number): number {
  return px / (2 * distanciaM * Math.tan((anguloGraus * Math.PI) / 360));
}

/** Até quantos metros a câmera chega a `ppm` pixels por metro. */
export function distanciaParaNivel(px: number, anguloGraus: number, ppm: number): number {
  return px / (ppm * 2 * Math.tan((anguloGraus * Math.PI) / 360));
}

/** O maior nível que um PPM alcança, ou null abaixo de detectar. */
export function nivelAlcancado(ppm: number): Nivel | null {
  return [...ORDEM_NIVEIS].reverse().find((k) => ppm >= NIVEIS[k].ppm) ?? null;
}

function ppmDa(p: Produto, distanciaM: number): number | null {
  const px = pixelsHorizontais(p.specs.resolucao);
  const ang = num(p.specs.anguloHorizontalGraus);
  return px && ang ? pixelsPorMetro(px, ang, distanciaM) : null;
}

export type Grupo = "principal" | "gravacao" | "cabos" | "energia" | "extras";

export const GRUPOS: { grupo: Grupo; titulo: string }[] = [
  { grupo: "principal", titulo: "Câmeras" },
  { grupo: "gravacao", titulo: "Gravação" },
  { grupo: "cabos", titulo: "Cabos e conectores" },
  { grupo: "energia", titulo: "Energia" },
  { grupo: "extras", titulo: "Extras do projeto" },
];

export type { Item } from "./simulador-lista";
import { OPCOES_POR_ITEM, type Item } from "./simulador-lista";

export type Projeto = {
  sistema: Sistema;
  motivos: string[];
  itens: Item[];
  avisos: string[];
};

/** Os produtos da base que o motor pode indicar. A página confere no build. */
export const SLUGS = {
  externa: "tplink-tapo-c500",
  internaTapo: "tplink-tapo-c200",
  internaFixaTapo: "tplink-tapo-c100",
  internaIntelbras: "intelbras-im3",
  repetidor: "tplink-tl-wa850re",
  monitor: "lg-20u401a",
} as const;

/**
 * Único dado de capacidade de cartão que um fabricante da base publica: a
 * TP-Link declara que 512 GB na C500 equivalem a 954 horas de gravação
 * (fonte `tapo-c500-oficial`). Não está em campo da ficha, e por isso fica
 * aqui com a origem escrita. As outras câmeras não declaram a relação.
 */
const HORAS_POR_GB: Record<string, number> = {
  [SLUGS.externa]: 954 / 512,
};

/** Regras do simulador. Nossas, não de fabricante — a tela diz isso. */
export const MARGEM_CABO = 0.1;
const CANAIS = [4, 8, 16, 32];
const PORTAS_SWITCH = [4, 8, 16, 24];
const CARTOES_GB = [32, 64, 128, 256, 512];

export const NOME_SISTEMA: Record<Sistema, string> = {
  wifi: "Câmeras Wi-Fi independentes",
  dvr: "Sistema cabeado com DVR",
  nvr: "Sistema cabeado IP, com NVR e PoE",
};

const n = (v: number) => v.toLocaleString("pt-BR");
const menorQueCabe = (lista: number[], minimo: number) =>
  lista.find((x) => x >= minimo) ?? lista.at(-1)!;

/** O maior cartão que a ficha aceita, lido do texto de armazenamento. */
function cartaoMaximoGb(p: Produto): number | null {
  const texto = String(p.specs.armazenamentoVideo ?? "");
  const nums = [...texto.matchAll(/(\d+)\s*GB/g)].map((m) => Number(m[1]));
  return nums.length ? Math.max(...nums) : null;
}

export function sistemaRecomendado(r: Respostas): {
  sistema: Sistema;
  motivos: string[];
} {
  const total = r.internos + r.externos;
  if (r.cabo === "nao") {
    return {
      sistema: "wifi",
      motivos: [
        "Não dá para passar cabo até as câmeras, e a câmera Wi-Fi é a única que dispensa o cabo de vídeo.",
      ],
    };
  }
  if (r.cabo === "obra" && total <= 4) {
    return {
      sistema: "wifi",
      motivos: [
        "Passar cabo exigiria obra, e com até quatro câmeras o sistema Wi-Fi evita a obra. Regra do simulador: acima de quatro, a indicação passa para gravação centralizada.",
      ],
    };
  }
  const sistema: Sistema = r.resolucao === "1080p" ? "dvr" : "nvr";
  const motivos = [
    "Com cabo até cada câmera, a gravação fica num gravador central e não depende do sinal Wi-Fi chegar a cada ponto.",
  ];
  if (r.cabo === "obra") {
    motivos.push(
      `São ${total} câmeras. Regra do simulador: acima de quatro, a indicação é gravação centralizada, mesmo com obra.`,
    );
  }
  motivos.push(
    sistema === "dvr"
      ? "Em 1080p, o DVR aproveita cabo coaxial ou de rede e é o sistema cabeado mais simples."
      : "Acima de 1080p a indicação é IP: câmera, energia e dados passam por um cabo de rede só (PoE).",
  );
  return { sistema, motivos };
}

export function montarProjeto(
  r: Respostas,
  base: Record<string, Produto>,
): Projeto {
  const recomendado = sistemaRecomendado(r);
  const sistema = r.sistema ?? recomendado.sistema;
  const motivos =
    sistema === recomendado.sistema
      ? recomendado.motivos
      : [
          `Você escolheu “${NOME_SISTEMA[sistema]}”; pelas suas respostas, a indicação era “${NOME_SISTEMA[recomendado.sistema]}”.`,
        ];
  const projeto =
    sistema === "wifi" ? projetoWifi(r, base) : projetoCabeado(r, sistema, base);
  return { sistema, motivos, ...projeto };
}

function projetoWifi(r: Respostas, base: Record<string, Produto>) {
  const itens: Item[] = [];
  const avisos: string[] = [];
  avisos.push(
    "O nível de detalhe que você pediu não entrou na escolha: as fichas das câmeras Wi-Fi da base não trazem o ângulo de visão em campo, e sem ele não há conta de pixels por metro.",
  );
  const escolhidas: { p: Produto; qtd: number }[] = [];

  if (r.externos > 0) {
    const p = base[SLUGS.externa];
    const alcance = Number(p.specs.visaoNoturnaM);
    if (alcance >= r.visaoNoturnaM) {
      escolhidas.push({ p, qtd: r.externos });
      itens.push({
        id: "camera-externa",
        grupo: "principal",
        papel: "Câmera externa",
        qtd: r.externos,
        produto: p.slug,
        porque: `A única câmera externa Wi-Fi da base: ${p.specs.protecaoIp} e visão noturna declarada de ${n(alcance)} m, acima dos ${n(r.visaoNoturnaM)} m que você pediu. A TP-Link declara que ela grava no cartão sem depender da nuvem.`,
      });
    } else {
      itens.push({
        id: "camera-externa",
        grupo: "principal",
        papel: "Câmera externa",
        qtd: r.externos,
        especificacao: `Câmera Wi-Fi externa com proteção IP declarada e visão noturna de pelo menos ${n(r.visaoNoturnaM)} m.`,
        porque: `Nenhuma câmera externa da base declara alcance noturno de ${n(r.visaoNoturnaM)} m.`,
        alternativa: {
          produto: p.slug,
          motivo: `declara ${n(alcance)} m, abaixo do que você pediu`,
        },
      });
    }
  }

  if (r.internos > 0) {
    const temTapo = escolhidas.some((e) => e.p.specs.appProprio === "Tapo");
    const [slug, outra, porque, motivoOutra] = temTapo
      ? [
          SLUGS.internaTapo,
          SLUGS.internaFixaTapo,
          "Mesmo aplicativo Tapo da câmera externa, então o projeto inteiro fica num app só. A TP-Link declara giro de 360°.",
          "mesma ficha, mas fixa, sem o giro",
        ]
      : [
          SLUGS.internaIntelbras,
          SLUGS.internaTapo,
          "A maior visão noturna declarada entre as internas da base, e a única que grava em DVR ou NVR pelo padrão ONVIF — se o projeto crescer para um sistema cabeado, ela entra nele.",
          "gira 360°, mas não declara gravação em DVR ou NVR",
        ];
    const p = base[slug];
    const alcance = Number(p.specs.visaoNoturnaM);
    const confira: string[] = [];
    if (r.gravarSemInternet && p.specs.funcionaSemNuvem !== true) {
      confira.push(
        `Você quer gravação sem internet, e a ${p.marca} não declara se esta câmera funciona sem a nuvem.`,
      );
    }
    if (alcance >= r.visaoNoturnaInternaM) {
      escolhidas.push({ p, qtd: r.internos });
      itens.push({
        id: "camera-interna",
        grupo: "principal",
        papel: "Câmera interna",
        qtd: r.internos,
        produto: p.slug,
        porque: `${porque} Visão noturna declarada de ${n(alcance)} m, ${p.specs.resolucaoVideo}.`,
        confira,
        alternativa: { produto: outra, motivo: motivoOutra },
      });
    } else {
      itens.push({
        id: "camera-interna",
        grupo: "principal",
        papel: "Câmera interna",
        qtd: r.internos,
        especificacao: `Câmera Wi-Fi interna com visão noturna de pelo menos ${n(r.visaoNoturnaInternaM)} m.`,
        porque: `Nenhuma câmera interna da base declara alcance noturno de ${n(r.visaoNoturnaInternaM)} m — a maior declara ${n(Number(base[SLUGS.internaIntelbras].specs.visaoNoturnaM))} m.`,
      });
    }
  }

  // Um cartão por câmera escolhida, do tamanho que a gravação pede quando a
  // ficha permite a conta, ou do maior que a câmera aceita quando não permite.
  // Desde 29/09/2026 o cartão vem da base (WD Purple, categoria CFTV) quando
  // há um do tamanho certo; a especificação continua valendo quando não há.
  const cartoes = Object.values(base)
    .filter((c) => c.specs.tipo === "Cartão microSD de vigilância" && typeof c.specs.capacidadeCartaoGb === "number")
    .sort((a, b) => (a.specs.capacidadeCartaoGb as number) - (b.specs.capacidadeCartaoGb as number));
  const maiorCartao = cartoes.at(-1);
  for (const { p, qtd } of escolhidas) {
    const maximo = cartaoMaximoGb(p);
    const horasPorGb = HORAS_POR_GB[p.slug];
    const horas = r.dias * 24;
    const precisa = horasPorGb ? Math.ceil(horas / horasPorGb) : (maximo ?? 0);
    const desejado = Math.min(menorQueCabe(CARTOES_GB, precisa), maximo ?? Infinity);
    // Só entra o cartão da base que atende o tamanho pedido. Se nenhum atende,
    // a linha fica com a especificação que atende, e o maior cartão da base
    // aparece como alternativa, dizendo quanto guarda.
    const cabe = (c: Produto) => (c.specs.capacidadeCartaoGb as number) <= (maximo ?? Infinity);
    const cartao = cartoes.find((c) => (c.specs.capacidadeCartaoGb as number) >= desejado && cabe(c));
    const menorAlternativo = !cartao && maiorCartao && cabe(maiorCartao) ? maiorCartao : undefined;
    const gb = cartao ? (cartao.specs.capacidadeCartaoGb as number) : desejado;
    let porque: string;
    const confira: string[] = [];
    if (horasPorGb) {
      const cabemDias = Math.floor((gb * horasPorGb) / 24);
      porque = `A TP-Link declara 954 horas em 512 GB. ${n(r.dias)} dias contínuos são ${n(horas)} horas, e ${n(gb)} GB guardam cerca de ${n(cabemDias)} dias.`;
      if (cabemDias < r.dias) {
        avisos.push(
          `O maior cartão que a ${p.nome} aceita guarda cerca de ${n(cabemDias)} dias contínuos, menos que os ${n(r.dias)} que você pediu.`,
        );
      }
      const ciclos = cartao && typeof cartao.specs.ciclosGravacao === "number" ? cartao.specs.ciclosGravacao : null;
      if (ciclos) {
        const gbPorDia = 24 / horasPorGb;
        const anos = (ciclos * gb) / gbPorDia / 365;
        porque += ` A ${cartao!.marca} declara no mínimo ${n(ciclos)} ciclos de gravação: gravando sem parar na taxa que a TP-Link declara, são cerca de ${n(Math.floor(anos))} anos até o limite.`;
      }
    } else {
      porque = `A ${p.marca} declara cartão de até ${n(maximo ?? 0)} GB, mas não declara quantas horas cabem nele. Sem essa relação não dá para calcular os ${n(r.dias)} dias; o simulador indica o maior aceito.`;
    }
    if (r.modo === "movimento") {
      porque += " Gravando só com movimento cabe mais; a conta usa gravação contínua, o pior caso.";
    }
    itens.push({
      id: `cartao-${p.slug}`,
      grupo: "gravacao",
      papel: `Cartão de memória para a ${p.modelo}`,
      qtd,
      ...(cartao
        ? { produto: cartao.slug }
        : {
            especificacao: `Cartão microSD de ${n(gb)} GB, próprio para gravação contínua${/classe 10/i.test(String(p.specs.armazenamentoVideo)) ? ", classe 10" : ""}.`,
          }),
      porque,
      confira: confira.length ? confira : undefined,
      alternativa: menorAlternativo
        ? {
            produto: menorAlternativo.slug,
            motivo: `cartão de vigilância com ficha no site, de ${n(menorAlternativo.specs.capacidadeCartaoGb as number)} GB${horasPorGb ? `: guarda cerca de ${n(Math.floor(((menorAlternativo.specs.capacidadeCartaoGb as number) * horasPorGb) / 24))} dias contínuos nesta câmera` : ", menor que o máximo que a câmera aceita"}`,
          }
        : undefined,
    });
  }

  if (r.externos > 0 && r.wifiChegaLonge !== "sim") {
    const p = base[SLUGS.repetidor];
    itens.push({
      id: "repetidor",
      grupo: "extras",
      papel:
        r.wifiChegaLonge === "nao"
          ? "Repetidor Wi-Fi"
          : "Repetidor Wi-Fi (se o sinal não chegar)",
      qtd: 1,
      produto: p.slug,
      porque: `As câmeras da base usam só Wi-Fi de 2,4 GHz. O repetidor mais simples da base cobre essa faixa: a TP-Link declara ${String(p.specs.bandas).replace(/^Banda/, "banda")} e ${n(Number(p.specs.velocidadeNominalMbps))} Mb/s.`,
      confira:
        r.wifiChegaLonge === "naoSei"
          ? ["Antes de comprar, veja no celular se o Wi-Fi chega com força no ponto da câmera externa."]
          : undefined,
    });
  }

  if (!r.tomadaPerto) {
    itens.push({
      id: "tomada",
      grupo: "energia",
      papel: "Ponto de energia perto de cada câmera",
      qtd: r.internos + r.externos,
      especificacao: "Tomada ou extensão até cada câmera.",
      porque:
        "Câmera Wi-Fi dispensa o cabo de vídeo, não o de energia. Nenhuma ficha da base declara o comprimento do cabo de alimentação.",
    });
  }

  if (!r.internetEstavel) {
    avisos.push(
      "Com internet instável, conte com o cartão, e não com a nuvem: a gravação em nuvem das câmeras da base é por assinatura e depende da conexão.",
    );
  }

  return { itens, avisos };
}

function projetoCabeado(
  r: Respostas,
  sistema: "dvr" | "nvr",
  base: Record<string, Produto>,
) {
  const itens: Item[] = [];
  const avisos: string[] = [];
  const total = r.internos + r.externos;
  const res = { "1080p": "1080p", "4mp": "4 MP", "5mp": "5 MP" }[r.resolucao];
  const utp = sistema === "nvr" || r.caboPreferido === "utp";
  const tecnologia =
    sistema === "dvr"
      ? "HD coaxial compatível com a tecnologia do DVR (HDCVI, AHD ou HDTVI — confira na ficha do gravador)"
      : "IP com alimentação PoE";

  if (sistema === "nvr") {
    avisos.push(
      `Para câmera IP a base ainda não tem ficha. Ao escolher, procure na ficha a resolução e o ângulo horizontal: a ${n(r.externos > 0 ? r.visaoNoturnaM : r.visaoNoturnaInternaM)} m, ${NIVEIS[r.externos > 0 ? r.nivelExterno : r.nivelInterno].verbo} pede ${decimal(NIVEIS[r.externos > 0 ? r.nivelExterno : r.nivelInterno].ppm)} pixels por metro — largura em pixels ÷ (2 × distância × tangente da metade do ângulo).`,
    );
  }
  const cftv = Object.values(base).filter((p) => p.categoria === "cftv");
  const nobreaks = Object.values(base).filter((p) => p.categoria === "nobreaks");
  const escolhidas: { p: Produto; qtd: number }[] = [];

  if (r.externos > 0) {
    const e = sistema === "dvr" ? escolherCamera(cftv, r, "externa") : null;
    if (e?.p) {
      escolhidas.push({ p: e.p, qtd: r.externos });
      itens.push({
        id: "bullet",
        grupo: "principal",
        papel: "Câmera externa",
        qtd: r.externos,
        produto: e.p.slug,
        porque: e.porque,
        regra: e.regra,
        confira: e.confira?.length ? e.confira : undefined,
        alternativa: e.alternativa,
        outras: e.outras,
      });
    } else {
      itens.push({
        id: "bullet",
        grupo: "principal",
        papel: "Câmera externa (bullet)",
        qtd: r.externos,
        especificacao: `Câmera ${tecnologia}, ${res}, proteção IP declarada para uso externo e visão noturna de pelo menos ${n(r.visaoNoturnaM)} m${r.noturnaColorida ? ", colorida à noite" : ""}.`,
        porque: e?.semBase ?? "O formato bullet é o de área externa: corpo vedado e alcance noturno maior.",
      });
    }
  }
  if (r.internos > 0) {
    const e = sistema === "dvr" ? escolherCamera(cftv, r, "interna") : null;
    if (e?.p) {
      escolhidas.push({ p: e.p, qtd: r.internos });
      itens.push({
        id: "dome",
        grupo: "principal",
        papel: "Câmera interna",
        qtd: r.internos,
        produto: e.p.slug,
        porque: e.porque,
        regra: e.regra,
        confira: e.confira?.length ? e.confira : undefined,
        alternativa: e.alternativa,
        outras: e.outras,
      });
    } else {
      itens.push({
        id: "dome",
        grupo: "principal",
        papel: "Câmera interna (dome)",
        qtd: r.internos,
        especificacao: `Câmera ${tecnologia}, ${res}, formato dome, visão noturna de pelo menos ${n(r.visaoNoturnaInternaM)} m${r.noturnaColorida ? ", colorida à noite" : ""}.`,
        porque: e?.semBase ?? "O formato dome é o de teto, para ambiente interno.",
      });
    }
  }

  const minimoCanais = r.folga ? total + 1 : total;
  const canais = menorQueCabe(CANAIS, minimoCanais);
  if (minimoCanais > CANAIS.at(-1)!) {
    avisos.push(`São ${total} câmeras; acima de 32 canais o projeto pede mais de um gravador.`);
  }
  const gravador = sistema === "dvr" ? escolherDvr(cftv, minimoCanais, r) : null;
  if (gravador?.p) {
    itens.push({
      id: "gravador",
      grupo: "gravacao",
      papel: "Gravador DVR",
      qtd: 1,
      produto: gravador.p.slug,
      porque: gravador.porque,
      regra: r.folga ? "Folga, na regra do simulador, é pelo menos um canal livre." : undefined,
      confira: gravador.confira,
      alternativa: gravador.alternativa,
    });
  } else {
    itens.push({
      id: "gravador",
      grupo: "gravacao",
      papel: sistema === "dvr" ? "Gravador DVR" : "Gravador NVR",
      qtd: 1,
      especificacao: `${sistema === "dvr" ? "DVR" : "NVR"} de ${canais} canais, que grave em ${res}.`,
      porque: `Você tem ${total} ${total === 1 ? "câmera" : "câmeras"}${r.folga ? " e pediu folga para crescer" : ""}; ${canais} canais é o menor tamanho de mercado que cabe.`,
      regra: r.folga ? "Folga, na regra do simulador, é pelo menos um canal livre." : undefined,
    });
  }

  if (gravador?.p && LINHA_13XX.test(gravador.p.slug) && r.prioridadeDvr === "resolucao") {
    for (const e of escolhidas) {
      if (!MODO_FULL_HD_13XX.has(e.p.slug)) {
        avisos.push(
          `A ${e.p.modelo} não está na lista de câmeras que a Intelbras declara compatíveis com o modo Full HD do ${gravador.p.modelo}. Com ela, o gravador grava 1080p Lite mesmo com o modo ligado.`,
        );
      }
    }
  }

  if (gravador?.p) avisos.push(...avisosDetalheGravado(r, gravador.p, escolhidas));

  itens.push(itemHd(r, total, gravador?.p, res, avisos, cftv));

  if (sistema === "nvr") {
    const portas = menorQueCabe(PORTAS_SWITCH, total);
    itens.push({
      id: "switch-poe",
      grupo: "energia",
      papel: "Switch PoE",
      qtd: 1,
      especificacao: `Switch PoE de ${portas} portas, com orçamento PoE maior que a soma do consumo das câmeras.`,
      porque:
        "No sistema IP a câmera recebe energia pelo cabo de rede. O switch precisa de uma porta por câmera e de potência PoE para todas.",
      confira: ["O consumo PoE declarado de cada câmera e o orçamento PoE declarado do switch."],
    });
  }

  const metros = Math.ceil(r.distanciaMediaM * total * (1 + MARGEM_CABO));
  itens.push({
    id: "cabo",
    grupo: "cabos",
    papel: utp ? "Cabo de rede" : "Cabo coaxial com energia",
    qtd: metros,
    unidade: "m",
    especificacao: utp
      ? "Cabo UTP Cat5e ou Cat6, de cobre."
      : "Cabo coaxial bipolar (vídeo e energia no mesmo cabo).",
    porque: `${n(total)} câmeras × ${n(r.distanciaMediaM)} m em média até o gravador, mais a margem.`,
    regra: `Margem de ${n(MARGEM_CABO * 100)}% para curvas e sobra nas pontas.`,
  });
  if (utp && r.distanciaMaxM > 100) {
    avisos.push(
      `O ponto mais longe fica a ${n(r.distanciaMaxM)} m. O padrão Ethernet limita um lance de cabo de rede a 100 m${sistema === "dvr" ? ", e o balun do DVR tem limite próprio, declarado na ficha dele" : ""}.`,
    );
  }
  if (!utp) {
    // O limite declarado vem do manual de cada câmera escolhida; vale o menor.
    const limites = escolhidas
      .map((e) => ({ p: e.p, m: typeof e.p.specs.alcanceCoaxialM === "number" ? e.p.specs.alcanceCoaxialM : null }))
      .filter((x): x is { p: Produto; m: number } => x.m != null);
    const menorLimite = limites.sort((a, b) => a.m - b.m)[0];
    if (menorLimite && limites.length === escolhidas.length) {
      if (r.distanciaMaxM > menorLimite.m) {
        avisos.push(
          `O ponto mais longe fica a ${n(r.distanciaMaxM)} m, e a Intelbras declara ${n(menorLimite.m)} m como distância máxima da ${menorLimite.p.modelo} em cabo coaxial. Aproxime o gravador ou use outra câmera nesse ponto.`,
        );
      }
    } else {
      avisos.push(
        `O ponto mais longe fica a ${n(r.distanciaMaxM)} m. O alcance do cabo coaxial depende da tecnologia do DVR e da câmera, e vem declarado no manual da câmera.`,
      );
    }
  }

  if (sistema === "nvr") {
    itens.push({
      id: "rj45",
      grupo: "cabos",
      papel: "Conector RJ45",
      qtd: total * 2,
      especificacao: "Conector RJ45 compatível com a categoria do cabo.",
      porque: "Dois por câmera, um em cada ponta do cabo.",
    });
  } else if (utp) {
    itens.push({
      id: "balun",
      grupo: "cabos",
      papel: "Balun (par)",
      qtd: total,
      unidade: "pares",
      especificacao: "Par de balun passivo, compatível com a resolução escolhida.",
      porque: "O balun converte o vídeo do DVR para o cabo de rede: um par por câmera, uma peça em cada ponta.",
    });
  } else {
    itens.push({
      id: "bnc",
      grupo: "cabos",
      papel: "Conector BNC",
      qtd: total * 2,
      especificacao: "Conector BNC para cabo coaxial (de mola ou de crimpar).",
      porque: "Dois por câmera, um em cada ponta do cabo de vídeo.",
    });
  }

  if (sistema === "dvr") {
    itens.push({
      id: "p4",
      grupo: "cabos",
      papel: "Conector P4 macho",
      qtd: total,
      especificacao: "Conector P4 macho com borne.",
      porque: "Um por câmera, para ligar a energia na ponta da câmera.",
    });
    itens.push(itemFonte(r, total, escolhidas, cftv));
  }

  if (r.conectoresExpostos && r.externos > 0) {
    itens.push({
      id: "caixa",
      grupo: "cabos",
      papel: "Caixa de passagem",
      qtd: r.externos,
      especificacao: "Caixa de passagem vedada para área externa.",
      porque: "Uma por câmera externa, para proteger as emendas e conectores da chuva.",
    });
  }

  if (r.celular) {
    itens.push({
      id: "patch",
      grupo: "cabos",
      papel: "Cabo de rede do gravador ao roteador",
      qtd: 1,
      especificacao: "Cabo de rede com os dois conectores (patch cord), no comprimento até o roteador.",
      porque: "Para ver as câmeras pelo celular, o gravador precisa estar ligado à internet da casa.",
    });
  }

  if (r.monitorLocal) {
    const p = base[SLUGS.monitor];
    itens.push({
      id: "monitor",
      grupo: "extras",
      papel: "Monitor",
      qtd: 1,
      produto: p.slug,
      porque: `A menor tela da base com entrada HDMI declarada (${n(Number(p.specs.telaPol))}"). O DVR e o NVR saem de vídeo por HDMI.`,
    });
    itens.push({
      id: "hdmi",
      grupo: "cabos",
      papel: "Cabo HDMI",
      qtd: 1,
      especificacao: "Cabo HDMI no comprimento do gravador ao monitor.",
      porque: "Liga o gravador ao monitor.",
    });
  }

  if (r.nobreak) {
    itens.push(itemNobreak(r, sistema, gravador?.p, itens, escolhidas, base, nobreaks, avisos));
  }

  if (r.instalador === "eu") {
    itens.push({
      id: "ferramentas",
      grupo: "extras",
      papel: "Ferramentas",
      qtd: 1,
      unidade: "kit",
      especificacao: utp
        ? "Alicate de crimpar RJ45 e testador de cabo de rede."
        : "Alicate para conector BNC (se for de crimpar) e desencapador de cabo coaxial.",
      porque: "Você vai montar os conectores.",
    });
  }

  return { itens, avisos };
}

// ---------------------------------------------------------------------------
// Escolha de peças da base (sistema com DVR). Desde 29/09/2026 a base tem
// DVRs e câmeras cabeadas (categoria cftv), e a lista deixa de dizer só "que
// especificação comprar" para dizer "qual produto" — com a regra à vista.

/** Tamanhos de HD e de fonte de mercado, para arredondar a conta para cima. */
const HDS_TB = [1, 2, 3, 4, 6, 8, 10, 12, 14, 16, 18];
const FONTES_A = [1, 2, 3, 5, 10, 15, 20, 30];
/** Regra do simulador: folga sobre a soma do consumo declarado das câmeras. */
export const FOLGA_FONTE = 0.2;
/**
 * Folga do nobreak sobre a soma dos watts declarados: cobre a perda da fonte
 * das câmeras (a Intelbras declara eficiência de 78% na EF 1201L e não declara
 * nas outras) e tira o nobreak do limite. É regra do simulador.
 */
export const FOLGA_NOBREAK = 0.5;
/**
 * O MHDX 1308 declara 4 Mbps no canal 1 e 2 Mbps nos demais. A ficha guarda
 * os 2 dos sete canais; a conta do HD soma a diferença do canal 1.
 */
const BITRATE_CANAL_1: Record<string, number> = { "intelbras-mhdx-1308": 4 };

/**
 * Câmeras da base que a Intelbras lista como compatíveis com o modo Full HD
 * dos MHDX 13xx, no documento "Câmeras compatíveis com a gravação em 1080p"
 * (backend.intelbras.com, 2026-06, consultado em 29/09/2026). Fora da lista,
 * o gravador grava a câmera em 1080p Lite mesmo com o modo ligado. A VHD 3220
 * Full Color+ e a VHD 1230 B Full Color MIC são 1080p e não estão na lista.
 *
 * O datasheet do MHDX 1304 diz o contrário — "compatível com todas as câmeras
 * intelbras com resolução full hd" — e o do 1308 e do 1316 remetem à lista.
 * Vale a lista, que é o documento específico e o mais restritivo.
 */
const MODO_FULL_HD_13XX = new Set([
  "intelbras-vhl-1220-b-g8",
  "intelbras-vhd-1220-d-g8",
  "intelbras-vhd-1220-b-full-color",
  "intelbras-vhd-1220-d-full-color",
]);
const LINHA_13XX = /^intelbras-mhdx-13\d\d$/;

const num = (v: unknown) => (typeof v === "number" ? v : null);
const txt = (v: unknown) => (typeof v === "string" ? v : "");
const decimal = (v: number) => v.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
/** Watt com as duas casas que a ficha publica: 1,56 W não vira 1,6. */
const watts = (v: number) => v.toLocaleString("pt-BR", { maximumFractionDigits: 2 });

type Escolha = {
  p?: Produto;
  porque: string;
  regra?: string;
  confira?: string[];
  alternativa?: { produto: string; motivo: string };
  outras?: { produto: string; motivo: string }[];
  /** Quando a base não tem candidata: por quê, para a linha sem ficha. */
  semBase?: string;
};

/** O que a segunda colocada tem a mais e a menos — em números da ficha. */
function diferencaCamera(escolhida: Produto, alt: Produto): string {
  const a = alt.specs;
  const e = escolhida.specs;
  const mais: string[] = [];
  if ((num(a.alcanceNoturnoM) ?? 0) > (num(e.alcanceNoturnoM) ?? 0))
    mais.push(`alcance noturno de ${n(num(a.alcanceNoturnoM)!)} m`);
  if (a.microfone === true && e.microfone !== true) mais.push("microfone");
  if ((num(a.anguloHorizontalGraus) ?? 0) > (num(e.anguloHorizontalGraus) ?? 0))
    mais.push(`ângulo de ${n(num(a.anguloHorizontalGraus)!)}°`);
  const consumo =
    (num(a.consumoW) ?? 0) > (num(e.consumoW) ?? 0)
      ? `consome ${watts(num(a.consumoW)!)} W, contra ${watts(num(e.consumoW)!)}`
      : "";
  if (mais.length && consumo) return `${mais.join(" e ")}, mas ${consumo}`;
  if (mais.length) return mais.join(" e ");
  return consumo || "ficha parecida, com consumo igual ou maior";
}

export function escolherCamera(
  cftv: Produto[],
  r: Respostas,
  onde: "externa" | "interna",
): Escolha {
  const formato = onde === "externa" ? "Câmera bullet" : "Câmera dome";
  const alcance = onde === "externa" ? r.visaoNoturnaM : r.visaoNoturnaInternaM;
  let lista = cftv.filter((p) => p.specs.tipo === formato);
  if (onde === "externa") lista = lista.filter((p) => txt(p.specs.instalacao) !== "Interno");
  lista = lista.filter((p) => txt(p.specs.resolucao).startsWith("1080p"));
  const emResolucao = lista.length;
  lista = lista.filter((p) => (num(p.specs.alcanceNoturnoM) ?? 0) >= alcance);
  const emAlcance = lista.length;
  if (r.noturnaColorida) lista = lista.filter((p) => p.specs.noturnaColorida === true);

  // Nível de detalhe: entre as que atendem alcance e cor, as que chegam aos
  // pixels por metro pedidos na distância informada. Se nenhuma chega, fica a
  // que mais se aproxima (ângulo mais fechado), e a lista diz até onde ela vai.
  const nivel = NIVEIS[onde === "externa" ? r.nivelExterno : r.nivelInterno];
  const atendemNivel = lista.filter((p) => (ppmDa(p, alcance) ?? 0) >= nivel.ppm);
  const semNivel = lista.length > 0 && atendemNivel.length === 0;
  if (semNivel) {
    lista = [...lista].sort((a, b) => (ppmDa(b, alcance) ?? 0) - (ppmDa(a, alcance) ?? 0)).slice(0, 1);
  } else if (lista.length) {
    lista = atendemNivel;
  }

  if (!lista.length) {
    const motivo = !emResolucao
      ? `Nenhuma câmera ${onde} 1080p na base.`
      : !emAlcance
        ? `Nenhuma câmera ${onde} 1080p da base declara alcance noturno de ${n(alcance)} m.`
        : `Nenhuma câmera ${onde} 1080p da base declara imagem colorida à noite com alcance de ${n(alcance)} m.`;
    return { porque: motivo, semBase: motivo };
  }

  // Regra do simulador: entre as que atendem, a de menor consumo declarado —
  // é a que pede a menor fonte. Empate vai para o maior alcance.
  lista.sort(
    (a, b) =>
      (num(a.specs.consumoW) ?? 99) - (num(b.specs.consumoW) ?? 99) ||
      (num(b.specs.alcanceNoturnoM) ?? 0) - (num(a.specs.alcanceNoturnoM) ?? 0),
  );
  const [p, alt] = lista;
  const s = p.specs;
  const filtros = [
    "1080p",
    `alcance noturno de pelo menos ${n(alcance)} m`,
    ...(r.noturnaColorida ? ["imagem colorida à noite"] : []),
    ...(semNivel ? [] : [`detalhe para ${nivel.verbo} a ${n(alcance)} m`]),
  ].join(", ");
  const confira: string[] = [];
  const ppm = ppmDa(p, alcance);
  const px = pixelsHorizontais(s.resolucao);
  const ang = num(s.anguloHorizontalGraus);
  const nivelPedido = onde === "externa" ? r.nivelExterno : r.nivelInterno;
  const acima = ppm != null ? nivelAlcancado(ppm) : null;
  const detalhe =
    ppm != null && px && ang
      ? ` A ${n(alcance)} m, os ${n(px)} pixels de largura e o ângulo de ${n(ang)}° declarados dão cerca de ${n(Math.round(ppm))} pixels por metro${semNivel ? "" : ` — o bastante para ${nivel.verbo} (${decimal(nivel.ppm)})${acima && acima !== nivelPedido ? `, e chega a ${NIVEIS[acima].verbo} (${decimal(NIVEIS[acima].ppm)})` : ""}`}.`
      : "";
  if (semNivel && ppm != null && px && ang) {
    const chega = nivelAlcancado(ppm);
    confira.push(
      `Nenhuma câmera da base com ${filtros} chega a ${decimal(nivel.ppm)} pixels por metro a ${n(alcance)} m, o que ${nivel.verbo} pede. Esta é a que mais se aproxima: ${n(Math.round(ppm))}${chega ? `, que basta para ${NIVEIS[chega].verbo}` : ", abaixo até de detectar"}. Para ${nivel.verbo}, ela precisa estar a até ${decimal(distanciaParaNivel(px, ang, nivel.ppm))} m do alvo.`,
    );
  }
  if (txt(s.alimentacao).includes("10,8") && r.distanciaMaxM >= 50 && !r.tomadaPerto) {
    confira.push(
      `A Intelbras declara que ela aceita só de 10,8 a 13,2 V. Com ${n(r.distanciaMaxM)} m de cabo desde uma fonte centralizada, a queda de tensão pode passar disso — confira, ou use fonte perto da câmera.`,
    );
  }
  const plural = onde === "externa" ? "bullets" : "domes";
  return {
    p,
    porque: `${semNivel ? `Entre as ${plural} da base com ${filtros}, é a de ângulo mais fechado, a que mais concentra pixels na distância pedida; declara ${watts(num(s.consumoW)!)} W.` : lista.length === 1 ? `É a única ${plural.slice(0, -1)} da base com ${filtros}, e declara ${watts(num(s.consumoW)!)} W de consumo.` : `Entre as ${lista.length} ${plural} da base com ${filtros}, é a de menor consumo declarado: ${watts(num(s.consumoW)!)} W.`} ${s.resolucao}, alcance noturno de ${n(num(s.alcanceNoturnoM)!)} m${s.protecaoIp ? `, ${s.protecaoIp}` : ""}, ${txt(s.tecnologias).startsWith("HDCVI,") ? "Multi HD" : "só HDCVI"}.${detalhe}`,
    regra: detalhe
      ? "Pixels por metro no centro da imagem, com a câmera de frente para o alvo: largura em pixels ÷ (2 × distância × tangente da metade do ângulo). Os degraus são os da norma IEC 62676-4. Altura de instalação, inclinação e distorção da lente ficam fora da conta."
      : undefined,
    confira,
    alternativa: alt ? { produto: alt.slug, motivo: diferencaCamera(p, alt) } : undefined,
    outras: lista.slice(2, OPCOES_POR_ITEM).map((o) => ({ produto: o.slug, motivo: diferencaCamera(p, o) })),
  };
}

/** Se o gravador grava 1920 × 1080, e se em todos os canais — pela ficha. */
function gravaCheioEmTodos(p: Produto): boolean {
  return /^Nos \d+ canais/.test(txt(p.specs.gravacao1080p));
}
function gravaCheio(p: Produto): boolean {
  const t = txt(p.specs.gravacao1080p);
  return t !== "" && !t.startsWith("Não grava");
}

export function escolherDvr(cftv: Produto[], minimo: number, r: Respostas): Escolha | null {
  const cabem = cftv.filter(
    (p) => p.specs.tipo === "Gravador DVR" && (num(p.specs.canais) ?? 0) >= minimo,
  );
  if (!cabem.length) return null;
  const menor = Math.min(...cabem.map((p) => num(p.specs.canais)!));
  const doTamanho = cabem.filter((p) => num(p.specs.canais) === menor);
  // Regra do simulador: no menor tamanho que cabe, o que grava 1920 × 1080 em
  // todos os canais; depois o que grava em parte deles; depois o de menor
  // consumo. Gravador que só grava 1080p Lite fica como alternativa.
  const ordem = [...doTamanho].sort(
    (a, b) =>
      Number(gravaCheioEmTodos(b)) - Number(gravaCheioEmTodos(a)) ||
      Number(gravaCheio(b)) - Number(gravaCheio(a)) ||
      (num(a.specs.consumoW) ?? 99) - (num(b.specs.consumoW) ?? 99),
  );
  const p = ordem[0];
  const alt = ordem.find((x) => x.marca !== p.marca) ?? ordem[1];
  const s = p.specs;
  const confira: string[] = [];
  if (txt(s.gravacao1080p).includes("desliga a detecção")) {
    confira.push(
      r.prioridadeDvr === "resolucao"
        ? "Você priorizou a imagem: ligue o modo Full HD no menu do gravador. Ele desliga a detecção de pessoas e as câmeras IP a mais — o alerta no celular passa a ser de qualquer movimento."
        : "Você priorizou o alerta: deixe o modo Full HD desligado. A gravação fica em 1080p Lite (960 × 1080), metade da largura da câmera, e a detecção de pessoas funciona.",
    );
  }
  if (!gravaCheio(p)) {
    confira.push("Este gravador não grava 1920 × 1080: a câmera Full HD fica em 1080p Lite (960 × 1080).");
  }
  let motivoAlt = "";
  if (alt) {
    const a = alt.specs;
    const pontos: string[] = [];
    if ((num(a.garantiaMeses) ?? 0) > (num(s.garantiaMeses) ?? 0))
      pontos.push(`${n(num(a.garantiaMeses)!)} meses de garantia, contra ${n(num(s.garantiaMeses)!)}`);
    if (!gravaCheio(alt) && gravaCheio(p)) pontos.push("mas só grava 1080p Lite");
    motivoAlt = pontos.join(", ") || "mesmo número de canais, ficha diferente";
  }
  const grav = txt(s.gravacao1080p);
  return {
    p,
    porque: `${n(menor)} canais, o menor tamanho da base que cabe o projeto. Em 1920 × 1080: ${grav.charAt(0).toLowerCase()}${grav.slice(1)}. Declara ${n(num(s.bitrateMbps)!)} Mb/s por canal e HD de até ${n(num(s.hdMaxTb)!)} TB.`,
    confira,
    alternativa: alt ? { produto: alt.slug, motivo: motivoAlt } : undefined,
  };
}

export function itemHd(
  r: Respostas,
  total: number,
  dvr: Produto | undefined,
  res: string,
  avisos: string[],
  cftv: Produto[] = [],
): Item {
  const bitrate = dvr ? num(dvr.specs.bitrateMbps) : null;
  const movimento =
    r.modo === "movimento"
      ? ["Gravando só com movimento cabe mais; a conta usa gravação contínua, o pior caso."]
      : [];
  if (!dvr || bitrate == null) {
    return {
      id: "hd",
      grupo: "gravacao",
      papel: "HD de vigilância",
      qtd: 1,
      especificacao: `HD próprio para gravação contínua (linha de vigilância), com capacidade para ${n(total)} câmeras × 24 h × ${n(r.dias)} dias.`,
      porque:
        "O tamanho do HD é a taxa de gravação do gravador vezes as horas. Sem gravador com ficha no site, não há taxa declarada para fazer a conta.",
      confira: [`Na ficha do gravador escolhido: a taxa de gravação em ${res} e o maior HD que ele aceita.`, ...movimento],
    };
  }
  const canal1 = BITRATE_CANAL_1[dvr.slug];
  const mbps = bitrate * total + (canal1 && total > 0 ? canal1 - bitrate : 0);
  // 1 Mb/s o dia inteiro = 86.400 s × 1 Mb ÷ 8 = 10,8 GB.
  const tb = (mbps * 10.8 * r.dias) / 1000;
  const maximo = num(dvr.specs.hdMaxTb) ?? HDS_TB.at(-1)!;
  const tamanho = Math.min(menorQueCabe(HDS_TB, tb), maximo);
  if (tb > maximo) {
    avisos.push(
      `A conta dá ${decimal(tb)} TB, mais que os ${n(maximo)} TB que o ${dvr.modelo} declara aceitar. Diminua os dias guardados ou grave só com movimento.`,
    );
  }
  const porqueConta = `O ${dvr.modelo} declara ${n(bitrate)} Mb/s por canal${canal1 ? ` (${n(canal1)} no canal 1)` : ""}. ${n(total)} ${total === 1 ? "câmera" : "câmeras"} gravando 24 h por ${n(r.dias)} dias dão cerca de ${decimal(tb)} TB.`;
  const regra =
    "Arredondado para o tamanho de HD de mercado logo acima, sem passar do máximo que o gravador aceita. Como a taxa declarada é a máxima, o HD dura isso ou mais.";

  // Desde 29/09/2026 o HD vem da base (WD Purple, Seagate SkyHawk): o menor que
  // comporta a conta; no empate de capacidade, o de menor consumo declarado.
  const hds = cftv
    .filter((p) => p.specs.tipo === "HD de vigilância" && typeof p.specs.capacidadeTb === "number")
    .filter((p) => (p.specs.capacidadeTb as number) >= Math.min(tb, maximo) && (p.specs.capacidadeTb as number) <= maximo)
    .sort(
      (a, b) =>
        (a.specs.capacidadeTb as number) - (b.specs.capacidadeTb as number) ||
        (num(a.specs.consumoW) ?? 99) - (num(b.specs.consumoW) ?? 99),
    );
  const hd = hds[0];
  // O que o gravador escreve num ano, contra a carga que o disco declara aguentar.
  const tbAno = (mbps * 10.8 * 365) / 1000;
  if (!hd) {
    return { id: "hd", grupo: "gravacao", papel: "HD de vigilância", qtd: 1, especificacao: `HD de vigilância de ${n(tamanho)} TB.`, porque: porqueConta, regra, confira: movimento };
  }
  const carga = num(hd.specs.cargaTrabalhoTbAno);
  if (carga != null && tbAno > carga) {
    avisos.push(
      `O gravador escreve cerca de ${n(Math.round(tbAno))} TB por ano nesta configuração, e o ${hd.modelo} declara carga de trabalho de ${n(carga)} TB por ano.`,
    );
  }
  const alt =
    hds.find((x) => x.marca !== hd.marca && x.specs.capacidadeTb === hd.specs.capacidadeTb) ??
    hds.find((x) => x.marca !== hd.marca);
  return {
    id: "hd",
    grupo: "gravacao",
    papel: "HD de vigilância",
    qtd: 1,
    produto: hd.slug,
    porque: `${porqueConta} O ${hd.modelo} tem ${n(hd.specs.capacidadeTb as number)} TB${carga != null ? `, e a ${hd.marca} declara ${n(carga)} TB por ano de carga de trabalho; este gravador escreve cerca de ${n(Math.round(tbAno))} TB` : ""}.`,
    regra,
    confira: movimento,
    alternativa: alt
      ? {
          produto: alt.slug,
          motivo: `${n(alt.specs.capacidadeTb as number)} TB e ${watts(num(alt.specs.consumoW)!)} W em operação, contra ${watts(num(hd.specs.consumoW)!)}`,
        }
      : undefined,
  };
}

export function itemFonte(
  r: Respostas,
  total: number,
  escolhidas: { p: Produto; qtd: number }[],
  cftv: Produto[] = [],
): Item {
  const cobertas = escolhidas.reduce((s, e) => s + e.qtd, 0) === total;
  const consumos = escolhidas.map((e) => num(e.p.specs.consumoW));
  if (!cobertas || consumos.some((c) => c == null)) {
    return r.tomadaPerto
      ? {
          id: "fonte",
          grupo: "energia",
          papel: "Fonte 12 V individual",
          qtd: total,
          especificacao: "Fonte 12 V com corrente acima do consumo declarado da câmera.",
          porque: "Há tomada perto das câmeras, então cada uma tem a própria fonte.",
          confira: ["O consumo declarado da câmera escolhida, em ampères ou watts."],
        }
      : {
          id: "fonte",
          grupo: "energia",
          papel: "Fonte 12 V centralizada",
          qtd: 1,
          especificacao: `Fonte 12 V centralizada, com corrente acima da soma do consumo das ${n(total)} câmeras.`,
          porque:
            "Sem tomada perto das câmeras, uma fonte só, junto do gravador, alimenta todas pelo mesmo cabo.",
          confira: ["O consumo declarado de cada câmera: sem ele não dá para dizer a amperagem."],
        };
  }
  const regra = `Folga de ${n(FOLGA_FONTE * 100)}% sobre o consumo declarado, arredondada para a fonte de mercado logo acima.`;
  const fmt = (v: number) => v.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
  // Desde 29/09/2026 a fonte vem da base (Intelbras EF): a menor com corrente
  // declarada acima do pedido. A promessa de "N câmeras" da fonte não entra na
  // conta: ela vale para câmeras de 250 ou 300 mA, e a conta usa a corrente
  // declarada de cada câmera do projeto.
  const fontes = cftv
    .filter((p) => p.specs.tipo === "Fonte 12 V" && typeof p.specs.correnteA === "number")
    .sort((x, y) => (x.specs.correnteA as number) - (y.specs.correnteA as number));
  const confiraTensao = escolhidas.some((e) => txt(e.p.specs.alimentacao).includes("10,8"))
    ? [
        "As fontes Intelbras saem com 12,8 V ± 5% — até 13,44 V sem carga — e parte das câmeras escolhidas declara aceitar até 13,2 V. Com o cabo a tensão cai, mas nenhuma das duas fichas diz quanto: confira antes de ligar.",
      ]
    : undefined;
  const escolher = (pedido: number) => fontes.find((x) => (x.specs.correnteA as number) >= pedido);
  if (r.tomadaPerto) {
    const maior = Math.max(...(consumos as number[]));
    const a = maior / 12;
    const pedido = a * (1 + FOLGA_FONTE);
    const f = escolher(pedido);
    return {
      id: "fonte",
      grupo: "energia",
      papel: "Fonte 12 V individual",
      qtd: total,
      ...(f ? { produto: f.slug } : { especificacao: `Fonte 12 V de ${n(menorQueCabe(FONTES_A, pedido))} A, uma por câmera.` }),
      porque: `A câmera que mais consome no projeto declara ${fmt(maior)} W — ${fmt(a)} A a 12 V.${f ? ` A ${f.modelo} declara ${n(f.specs.correnteA as number)} A de saída.` : ""}`,
      regra,
      confira: confiraTensao,
    };
  }
  const somaW = escolhidas.reduce((s, e) => s + num(e.p.specs.consumoW)! * e.qtd, 0);
  const a = somaW / 12;
  const pedido = a * (1 + FOLGA_FONTE);
  const f = escolher(pedido);
  return {
    id: "fonte",
    grupo: "energia",
    papel: "Fonte 12 V centralizada",
    qtd: 1,
    ...(f ? { produto: f.slug } : { especificacao: `Fonte 12 V de ${n(menorQueCabe(FONTES_A, pedido))} A.` }),
    porque: `As ${n(total)} câmeras escolhidas declaram ${fmt(somaW)} W somados — ${fmt(a)} A a 12 V, alimentadas pelo mesmo cabo a partir do gravador.${f ? ` A ${f.modelo} é a menor fonte da base com corrente acima disso: ${n(f.specs.correnteA as number)} A.` : ""}`,
    regra,
    confira: confiraTensao,
  };
}

/**
 * O nobreak do projeto, desde 29/09/2026 escolhido na base de nobreaks.
 *
 * A carga é a soma dos watts DECLARADOS de gravador, HD e câmeras — nunca o VA
 * do nome do nobreak, que não se soma com watt. A escolha é o menor nobreak em
 * watts que cabe a carga com a folga; no empate, o de menor consumo em espera
 * declarado. Quando a fonte central declara PFC ativo, só entra nobreak de onda
 * senoidal: os de onda retangular vêm com aviso do fabricante contra fonte PFC.
 *
 * Autonomia não é calculada. Ela depende da bateria, da carga e da curva de
 * descarga, e só uma ficha da base publica minutos com câmeras. Quando o
 * escolhido não tem esse número, a lista diz isso e aponta a que tem.
 */
export function itemNobreak(
  r: Respostas,
  sistema: Sistema,
  dvr: Produto | undefined,
  itens: Item[],
  escolhidas: { p: Produto; qtd: number }[],
  base: Record<string, Produto>,
  nobreaks: Produto[],
  avisos: string[],
): Item {
  const semBase: Item = {
    id: "nobreak",
    grupo: "energia",
    papel: "Nobreak",
    qtd: 1,
    especificacao: `Nobreak com potência em watts acima da soma do gravador e ${sistema === "nvr" ? "do switch PoE" : "da fonte das câmeras"}.`,
    porque: "Mantém o sistema gravando durante a queda de energia. Compare watts com watts: o VA do nome do nobreak não se soma com o consumo dos aparelhos.",
    confira: ["O consumo declarado do gravador e da fonte ou switch, em watts."],
  };
  if (sistema !== "dvr" || !dvr) return semBase;

  const hd = base[itens.find((i) => i.id === "hd")?.produto ?? ""];
  const fonte = base[itens.find((i) => i.id === "fonte")?.produto ?? ""];
  const wDvr = num(dvr.specs.consumoW);
  const wHd = hd ? num(hd.specs.consumoW) : null;
  const camerasW = escolhidas.map((e) => num(e.p.specs.consumoW));
  // Com fonte perto de cada câmera, elas ficam fora do nobreak: ele fica junto
  // do gravador e as tomadas das câmeras estão espalhadas pela casa.
  const cameras = r.tomadaPerto ? 0 : escolhidas.reduce((s, e) => s + (num(e.p.specs.consumoW) ?? 0) * e.qtd, 0);
  if (wDvr == null || (!r.tomadaPerto && camerasW.some((w) => w == null))) return semBase;

  const carga = wDvr + (wHd ?? 0) + cameras;
  const pedido = carga * (1 + FOLGA_NOBREAK);
  const pfc = !r.tomadaPerto && fonte && txt(fonte.specs.alimentacao).includes("PFC ativo");
  const candidatos = nobreaks
    .filter((p) => typeof p.specs.potenciaW === "number" && (p.specs.potenciaW as number) >= pedido)
    .filter((p) => !pfc || p.specs.compativelPfc === true)
    .sort(
      (a, b) =>
        (a.specs.potenciaW as number) - (b.specs.potenciaW as number) ||
        (num(a.specs.consumoStandbyW) ?? 99) - (num(b.specs.consumoStandbyW) ?? 99),
    );
  // Vale primeiro o nobreak que declara watts E autonomia com gravador e
  // câmeras, se ele couber a carga: é o único caso em que a lista pode dizer
  // quanto tempo o projeto fica de pé. Sem ele, o menor que cabe.
  const comAutonomia = candidatos.find((p) => /câmera/i.test(txt(p.specs.autonomia)));
  const nb = comAutonomia ?? candidatos[0];
  const w = (v: number) => v.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
  const partes = [
    `o ${dvr.modelo} declara ${w(wDvr)} W`,
    wHd != null ? `o HD ${hd!.modelo}, ${w(wHd)} W` : null,
    !r.tomadaPerto ? `as câmeras somam ${w(cameras)} W` : null,
  ].filter(Boolean);
  const conta = `Na ficha, ${partes.join("; ")}: ${w(carga)} W no total.`;
  const regra = `Folga de ${n(FOLGA_NOBREAK * 100)}% sobre a soma, para a perda na fonte das câmeras e para o nobreak não trabalhar no limite. A comparação é em watts, nunca em VA. Entre os que cabem, vale primeiro o que declara autonomia com gravador e câmeras; sem ele, o menor.`;
  const confira: string[] = [];
  if (r.tomadaPerto) {
    confira.push(
      "Com uma fonte perto de cada câmera, o nobreak fica junto do gravador e só segura ele: na queda de energia o gravador continua ligado e as câmeras apagam. Para manter as câmeras, a fonte precisa ser centralizada, ao lado do nobreak.",
    );
  }
  if (!nb) {
    return {
      ...semBase,
      especificacao: `Nobreak de pelo menos ${n(Math.ceil(pedido))} W${pfc ? ", de onda senoidal" : ""}.`,
      porque: conta,
      regra,
      confira,
    };
  }

  if (nb === comAutonomia) {
    confira.push(
      "A autonomia declarada vale para o cenário do fabricante, que descreve os aparelhos e não diz os watts. Com câmeras de consumo diferente, o tempo muda.",
    );
  } else {
    confira.push(
      `A ${nb.marca} não declara autonomia do ${nb.nome} com câmeras, e o simulador não calcula minutos: eles dependem da bateria, da carga e da idade da bateria.`,
    );
  }
  if (pfc) {
    avisos.push(
      `A ${fonte!.modelo} declara PFC ativo, e os nobreaks de onda retangular da base trazem aviso do fabricante contra fonte com PFC ativo. Por isso o simulador indica só nobreak de onda senoidal neste projeto.`,
    );
  }
  const menor = candidatos[0];
  const outraMarca = candidatos.find((p) => p.marca !== nb.marca);
  const alt =
    menor.slug !== nb.slug
      ? {
          produto: menor.slug,
          motivo: `o menor nobreak da base que cabe a carga, com ${n(menor.specs.potenciaW as number)} W declarados, mas sem autonomia declarada com câmeras`,
        }
      : outraMarca
        ? { produto: outraMarca.slug, motivo: `${n(outraMarca.specs.potenciaW as number)} W declarados, de outra marca` }
        : undefined;
  const va = typeof nb.specs.potenciaVa === "number" ? ` (os ${n(nb.specs.potenciaVa as number)} VA do nome)` : "";
  return {
    id: "nobreak",
    grupo: "energia",
    papel: "Nobreak",
    qtd: 1,
    produto: nb.slug,
    porque: `${conta} ${
      nb === comAutonomia
        ? `O ${nb.nome} cabe essa carga com a folga e é o único da base que declara os watts e a autonomia com gravador e câmeras: ${txt(nb.specs.autonomia)}.`
        : `O ${nb.nome} é o menor nobreak da base que cabe essa carga com a folga.`
    } A ${nb.marca} declara ${n(nb.specs.potenciaW as number)} W${va}.`,
    regra,
    confira,
    alternativa: alt,
  };
}

/**
 * O detalhe que o DVR GUARDA, e não o que a câmera entrega. Em 1080p Lite o
 * gravador grava 960 pixels de largura — metade dos 1.920 da câmera —, e os
 * pixels por metro gravados caem à metade. Grava cheio só com gravador que
 * grava 1920 × 1080, com o leitor priorizando resolução e, na linha 13xx, com
 * câmera da lista de compatíveis do modo Full HD.
 */
function avisosDetalheGravado(
  r: Respostas,
  dvr: Produto,
  escolhidas: { p: Produto; qtd: number }[],
): string[] {
  const avisos: string[] = [];
  for (const e of escolhidas) {
    const onde = e.p.specs.tipo === "Câmera dome" ? "interna" : "externa";
    const alcance = onde === "externa" ? r.visaoNoturnaM : r.visaoNoturnaInternaM;
    const nivel = NIVEIS[onde === "externa" ? r.nivelExterno : r.nivelInterno];
    const px = pixelsHorizontais(e.p.specs.resolucao);
    const ppm = ppmDa(e.p, alcance);
    if (px !== 1920 || ppm == null) continue;
    const podeCheio =
      gravaCheio(dvr) && (!LINHA_13XX.test(dvr.slug) || MODO_FULL_HD_13XX.has(e.p.slug));
    const gravaCheioAqui = podeCheio && r.prioridadeDvr === "resolucao";
    const gravado = gravaCheioAqui ? ppm : ppm / 2;
    if (gravado >= nivel.ppm) continue;
    const chega = nivelAlcancado(gravado);
    const aoVivo = nivelAlcancado(ppm);
    // Se ao vivo já não chegava ao pedido, o aviso da câmera disse; aqui só
    // importa se a gravação cai mais um degrau.
    if (ppm < nivel.ppm && chega === aoVivo) continue;
    const parcial = gravaCheioAqui && !gravaCheioEmTodos(dvr) ? " nos canais que ele grava cheio" : "";
    avisos.push(
      gravaCheioAqui
        ? `O ${dvr.modelo} grava 1920 × 1080 só em parte dos canais. Nos outros, a ${e.p.modelo} fica gravada em 1080p Lite: cerca de ${n(Math.round(ppm / 2))} pixels por metro a ${n(alcance)} m${chega ? `, o bastante para ${NIVEIS[chega].verbo}` : ""}, abaixo dos ${decimal(nivel.ppm)} de ${nivel.verbo}.`
        : `Ao vivo, a ${e.p.modelo} entrega cerca de ${n(Math.round(ppm))} pixels por metro a ${n(alcance)} m${aoVivo ? `, o bastante para ${NIVEIS[aoVivo].verbo}` : ""}. Mas o ${dvr.modelo} grava em 1080p Lite, 960 pixels de largura: a gravação guarda cerca de ${n(Math.round(gravado))}${chega ? `, o bastante só para ${NIVEIS[chega].verbo}` : ""}.${podeCheio ? ` No modo Full HD, que desliga a detecção de pessoas, a gravação volta aos ${n(Math.round(ppm))}${parcial}.` : " Este gravador não grava 1920 × 1080."}`,
    );
  }
  return avisos;
}

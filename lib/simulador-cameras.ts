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

export type Grupo = "principal" | "gravacao" | "cabos" | "energia" | "extras";

export const GRUPOS: { grupo: Grupo; titulo: string }[] = [
  { grupo: "principal", titulo: "Câmeras" },
  { grupo: "gravacao", titulo: "Gravação" },
  { grupo: "cabos", titulo: "Cabos e conectores" },
  { grupo: "energia", titulo: "Energia" },
  { grupo: "extras", titulo: "Extras do projeto" },
];

export type Item = {
  id: string;
  grupo: Grupo;
  papel: string;
  qtd: number;
  unidade?: string;
  /** Produto da base. Sem ele, o item sai com `especificacao`. */
  produto?: string;
  /** O que comprar, quando o site ainda não tem ficha da peça. */
  especificacao?: string;
  porque: string;
  /** Regra nossa usada no cálculo — sempre à vista. */
  regra?: string;
  /** O que a documentação não responde e importa para este projeto. */
  confira?: string[];
  /** A segunda colocada, e o que a tirou. */
  alternativa?: { produto: string; motivo: string };
};

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
  for (const { p, qtd } of escolhidas) {
    const maximo = cartaoMaximoGb(p);
    const horasPorGb = HORAS_POR_GB[p.slug];
    const horas = r.dias * 24;
    let especificacao: string;
    let porque: string;
    if (horasPorGb && maximo) {
      const precisa = Math.ceil(horas / horasPorGb);
      const gb = Math.min(menorQueCabe(CARTOES_GB, precisa), maximo);
      const cabemDias = Math.floor((gb * horasPorGb) / 24);
      especificacao = `Cartão microSD de ${n(gb)} GB, próprio para gravação contínua.`;
      porque = `A TP-Link declara 954 horas em 512 GB. ${n(r.dias)} dias contínuos são ${n(horas)} horas, e ${n(gb)} GB guardam cerca de ${n(cabemDias)} dias.`;
      if (precisa > maximo) {
        avisos.push(
          `O maior cartão que a ${p.nome} aceita guarda cerca de ${n(cabemDias)} dias contínuos, menos que os ${n(r.dias)} que você pediu.`,
        );
      }
    } else {
      especificacao = `Cartão microSD de ${n(maximo ?? 0)} GB, o maior que a câmera aceita${/classe 10/i.test(String(p.specs.armazenamentoVideo)) ? ", classe 10" : ""}.`;
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
      especificacao,
      porque,
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

  if (r.externos > 0) {
    itens.push({
      id: "bullet",
      grupo: "principal",
      papel: "Câmera externa (bullet)",
      qtd: r.externos,
      especificacao: `Câmera ${tecnologia}, ${res}, proteção IP declarada para uso externo e visão noturna de pelo menos ${n(r.visaoNoturnaM)} m.`,
      porque:
        "O formato bullet é o de área externa: corpo vedado e alcance noturno maior.",
    });
  }
  if (r.internos > 0) {
    itens.push({
      id: "dome",
      grupo: "principal",
      papel: "Câmera interna (dome)",
      qtd: r.internos,
      especificacao: `Câmera ${tecnologia}, ${res}, formato dome, visão noturna de pelo menos ${n(r.visaoNoturnaInternaM)} m.`,
      porque: "O formato dome é o de teto, para ambiente interno.",
    });
  }

  const minimoCanais = r.folga ? total + 1 : total;
  const canais = menorQueCabe(CANAIS, minimoCanais);
  if (minimoCanais > CANAIS.at(-1)!) {
    avisos.push(`São ${total} câmeras; acima de 32 canais o projeto pede mais de um gravador.`);
  }
  itens.push({
    id: "gravador",
    grupo: "gravacao",
    papel: sistema === "dvr" ? "Gravador DVR" : "Gravador NVR",
    qtd: 1,
    especificacao: `${sistema === "dvr" ? "DVR" : "NVR"} de ${canais} canais, que grave em ${res}.`,
    porque: `Você tem ${total} ${total === 1 ? "câmera" : "câmeras"}${r.folga ? " e pediu folga para crescer" : ""}; ${canais} canais é o menor tamanho de mercado que cabe.`,
    regra: r.folga
      ? "Folga, na regra do simulador, é pelo menos um canal livre."
      : undefined,
  });

  itens.push({
    id: "hd",
    grupo: "gravacao",
    papel: "HD de vigilância",
    qtd: 1,
    especificacao: `HD próprio para gravação contínua (linha de vigilância), com capacidade para ${n(total)} câmeras × 24 h × ${n(r.dias)} dias.`,
    porque:
      "O tamanho do HD é a taxa de gravação do gravador vezes as horas. O site ainda não tem ficha de gravador, e sem a taxa declarada o simulador não calcula os terabytes.",
    confira: [
      "Na ficha do gravador escolhido: a taxa de gravação em " + res + " e o maior HD que ele aceita.",
      r.modo === "movimento"
        ? "Gravando só com movimento o HD dura mais; a conta de referência é a contínua."
        : "",
    ].filter(Boolean),
  });

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
    avisos.push(
      `O ponto mais longe fica a ${n(r.distanciaMaxM)} m. O alcance do cabo coaxial depende da tecnologia do DVR e da câmera, e vem declarado na ficha deles.`,
    );
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
    itens.push(
      r.tomadaPerto
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
          },
    );
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
    itens.push({
      id: "nobreak",
      grupo: "energia",
      papel: "Nobreak",
      qtd: 1,
      especificacao: `Nobreak com potência acima da soma do gravador e ${sistema === "nvr" ? "do switch PoE" : "da fonte das câmeras"}.`,
      porque: "Mantém o sistema gravando durante a queda de energia.",
      confira: ["O consumo declarado do gravador e da fonte ou switch."],
    });
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

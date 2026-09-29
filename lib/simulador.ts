import type { Produto } from "./specs";

/**
 * A matriz do simulador de montagem (/simulador).
 *
 * Pedido do Allan em 28/09/2026, a partir de um roteiro de "setup simulator"
 * que recomendava produtos fora da base — Deco M4, UniFi U6, relés Zemismart,
 * DVR, HD de vigilância — com justificativas no indicativo ("elimine zonas
 * mortas", "imune a inibidores de sinal") e botão para `href="#"`. A versão
 * daqui só recomenda o que tem ficha apurada, e a justificativa sai dos campos
 * da ficha: quando o número muda na base, a frase muda junto.
 *
 * TRÊS DECISÕES QUE NÃO ESTAVAM NO ROTEIRO
 *
 * 1. O tamanho do ambiente só é perguntado para rede Wi-Fi. É a única das três
 *    frentes em que a documentação liga o produto a uma área — a cobertura em
 *    m² dos sistemas mesh. Perguntar o tamanho da casa para escolher uma
 *    tomada inteligente seria fingir uma personalização que não existe.
 *
 * 2. "Custo-benefício × Premium" virou "O essencial × Mais recursos". Sem
 *    preço em texto (a Amazon só autoriza pela API), o site não sabe o que é
 *    barato; sabe o que cada ficha declara. "Mais recursos" é isso, literal.
 *
 * 3. A cobertura só vale se for a do kit que está à venda. X50 e BE22 declaram
 *    600 m² para o kit de TRÊS, e o anúncio é o de duas. Por isso o essencial
 *    acima de 150 m² é o Halo H80X, cujos 460 m² são do kit anunciado.
 */

export type Foco = "wifi" | "automacao" | "seguranca";
export type Tamanho = "ate50" | "50a150" | "mais150";
export type Perfil = "essencial" | "recursos";

export const FOCOS: { valor: Foco; rotulo: string }[] = [
  { valor: "wifi", rotulo: "Rede Wi-Fi" },
  { valor: "automacao", rotulo: "Automação residencial" },
  { valor: "seguranca", rotulo: "Segurança e câmeras" },
];

export const TAMANHOS: { valor: Tamanho; rotulo: string }[] = [
  { valor: "ate50", rotulo: "Até 50 m²" },
  { valor: "50a150", rotulo: "De 50 a 150 m²" },
  { valor: "mais150", rotulo: "Mais de 150 m²" },
];

export const PERFIS: { valor: Perfil; rotulo: string }[] = [
  { valor: "essencial", rotulo: "O essencial" },
  { valor: "recursos", rotulo: "Mais recursos declarados" },
];

export type Indicacao = {
  slug: string;
  /** Por que este produto responde à combinação. Números lidos da ficha. */
  porque: (p: Produto) => string;
};

export type Resultado = {
  indicacoes: Indicacao[];
  /** O que ficou de fora da indicação e por quê — produto sem ficha, ou ficha que não sustenta a recomendação. Fica escrito. */
  foraDaBase?: string;
};

const n = (v: unknown) =>
  typeof v === "number" ? v.toLocaleString("pt-BR") : String(v);

const decoX10: Indicacao = {
  slug: "tplink-deco-x10",
  porque: (p) =>
    `A TP-Link declara ${n(p.specs.coberturaM2)} m² de cobertura para o kit de duas unidades, que é o anunciado — e publica o número unidade por unidade, coisa rara na categoria. É ${p.specs.padraoWifi}, com o sinal espalhado por módulos em vez de repetidor.`,
};

const haloH80x: Indicacao = {
  slug: "mercusys-halo-h80x",
  porque: (p) =>
    `A Mercusys declara ${n(p.specs.coberturaM2)} m² para o kit de duas unidades, que é o anunciado. Entre os sistemas mesh da base, é a maior cobertura declarada para o kit que está de fato à venda. ${p.specs.padraoWifi}, ${n(p.specs.velocidade5ghzMbps)} Mb/s declarados em 5 GHz.`,
};

const decoBe22 = (tamanho: Tamanho): Indicacao => ({
  slug: "tplink-deco-be22",
  porque: (p) =>
    `${p.specs.padraoWifi}, com ${n(p.specs.velocidade5ghzMbps)} Mb/s declarados em 5 GHz e MLO. A TP-Link declara ${n(p.specs.coberturaM2)} m² para o kit de três unidades; o anúncio é o de duas, e para ele a marca não publica área.` +
    (tamanho === "mais150"
      ? " Acima de 150 m², meça a casa antes: o único número de cobertura publicado não é o do produto vendido."
      : ""),
});

const MATRIZ: Record<string, Resultado> = {
  "wifi:essencial:ate50": { indicacoes: [decoX10] },
  "wifi:essencial:50a150": { indicacoes: [decoX10] },
  "wifi:essencial:mais150": { indicacoes: [haloH80x] },
  "wifi:recursos:ate50": { indicacoes: [decoBe22("ate50")] },
  "wifi:recursos:50a150": { indicacoes: [decoBe22("50a150")] },
  "wifi:recursos:mais150": {
    indicacoes: [decoBe22("mais150")],
    foraDaBase:
      "O Deco BE65 é mais rápido e tem quatro portas de 2,5 Gb/s, mas a TP-Link não declara a cobertura dele — só \"cobertura ampliada para a casa toda\", sem número. Sem área declarada, não há como dizer se ele cobre o seu espaço.",
  },

  "automacao:essencial": {
    indicacoes: [
      {
        slug: "positivo-smart-plug",
        porque: (p) =>
          `Tomada Wi-Fi de ${n(p.specs.cargaMaxW)} W de carga máxima, com homologação na Anatel e ${n(p.specs.garantiaMeses)} meses de garantia publicados. A Positivo não nomeia o aplicativo nem os assistentes de voz.`,
      },
      {
        slug: "positivo-smart-lampada",
        porque: (p) =>
          `${n(p.specs.fluxoLumens)} lúmens e temperatura de cor declarada de ${p.specs.temperaturaCorK} — a única lâmpada da base que publica a faixa em kelvin. ${n(p.specs.garantiaMeses)} meses de garantia.`,
      },
    ],
  },
  "automacao:recursos": {
    indicacoes: [
      {
        slug: "tplink-tapo-p110",
        porque: (p) =>
          `A única tomada da base que mede consumo e a única que declara, por escrito, que o controle local funciona sem internet e sem a nuvem. Carga máxima declarada de ${n(p.specs.cargaMaxW)} W, com ${p.specs.assistentes}.`,
      },
      {
        slug: "positivo-smart-lampada",
        porque: (p) =>
          `${n(p.specs.fluxoLumens)} lúmens e faixa de ${p.specs.temperaturaCorK} declaradas. A Positivo não diz se ela funciona sem a nuvem.`,
      },
    ],
    foraDaBase:
      "Hub Zigbee, relé para interruptor e medidor de energia de quadro (trilho DIN) ainda não têm ficha apurada no site. Quando tiverem, entram aqui.",
  },

  "seguranca:essencial": {
    indicacoes: [
      {
        slug: "tplink-tapo-c100",
        porque: (p) =>
          `Câmera interna fixa, ${p.specs.resolucaoVideo}, com visão noturna declarada de ${n(p.specs.visaoNoturnaM)} m. Grava em ${p.specs.armazenamentoVideo}. A TP-Link não diz se ela funciona sem a nuvem.`,
      },
    ],
  },
  "seguranca:recursos": {
    indicacoes: [
      {
        slug: "intelbras-im3",
        porque: (p) =>
          `A única câmera da base que grava em DVR ou NVR de terceiros pelo padrão ONVIF, além de cartão e nuvem. ${p.specs.resolucaoVideo}, visão noturna declarada de ${n(p.specs.visaoNoturnaM)} m. A Intelbras não promete que ela funciona sem a nuvem dela.`,
      },
      {
        slug: "tplink-tapo-c500",
        porque: (p) =>
          `Para fora de casa: ${p.specs.protecaoIp}, visão noturna declarada de ${n(p.specs.visaoNoturnaM)} m e giro de 360°. A TP-Link declara que ela funciona com o cartão local, sem depender obrigatoriamente da nuvem.`,
      },
    ],
    foraDaBase:
      "Kit de DVR, câmera bullet cabeada e HD de vigilância ainda não têm ficha apurada no site.",
  },
};

/** A chave da combinação. O tamanho só entra quando o foco é Wi-Fi. */
export function chaveDo(foco: Foco, perfil: Perfil, tamanho: Tamanho) {
  return foco === "wifi" ? `${foco}:${perfil}:${tamanho}` : `${foco}:${perfil}`;
}

export function todasAsCombinacoes(): [string, Resultado][] {
  return Object.entries(MATRIZ);
}

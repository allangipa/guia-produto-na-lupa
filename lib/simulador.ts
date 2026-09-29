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
 * Câmeras e Wi-Fi saíram desta matriz em 29/09/2026: viraram os questionários
 * completos de lib/simulador-cameras.ts e lib/simulador-wifi.ts, que montam a
 * lista de compras do projeto. Só automação segue aqui até ganhar o dela — ver
 * docs/simulador.md. As três decisões abaixo nasceram com a matriz de Wi-Fi; a
 * primeira e a terceira hoje moram no motor de Wi-Fi, e a segunda vale aqui.
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
export type Perfil = "essencial" | "recursos";

export const FOCOS: { valor: Foco; rotulo: string }[] = [
  { valor: "wifi", rotulo: "Rede Wi-Fi" },
  { valor: "automacao", rotulo: "Automação residencial" },
  { valor: "seguranca", rotulo: "Câmeras de segurança" },
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

const MATRIZ: Record<string, Resultado> = {
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
};

/** A chave da combinação. */
export function chaveDo(foco: Foco, perfil: Perfil) {
  return `${foco}:${perfil}`;
}

export function todasAsCombinacoes(): [string, Resultado][] {
  return Object.entries(MATRIZ);
}

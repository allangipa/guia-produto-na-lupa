import type { Produto } from "./specs";
import { OPCOES_POR_ITEM, type Item } from "./simulador-lista";

/**
 * O cooktop de indução e a instalação que ele pede, no /simulador. Puro —
 * roda no navegador.
 *
 * A CONTA QUE AS FICHAS DEIXAM PARA O COMPRADOR
 *
 * Só 3 dos 16 cooktops declaram o disjuntor (Dako Diplomata 32 A, Dako Select
 * 40 A, Midea CYAD11 20 A), e 6 não declaram watt nenhum. A conta que resta ao
 * comprador é física: corrente = potência declarada ÷ tensão da casa. Um
 * cooktop de 7.400 W a 220 V puxa 34 A.
 *
 * O QUE O SIMULADOR NÃO FAZ
 *
 * Não indica tamanho de disjuntor nem de fio. Isso é dimensionamento de
 * instalação elétrica (NBR 5410), com fator de demanda, comprimento do
 * circuito e método de instalação, e é trabalho de eletricista — errar ali é
 * risco de incêndio, não de compra errada. A lista dá a corrente, o disjuntor
 * que o fabricante declara quando declara, e o aviso de que acima de 20 A não
 * há tomada no padrão brasileiro (NBR 14136).
 */

export type Tensao = 127 | 220;

export type RespostasCooktop = {
  tensao: Tensao;
  bocas: 1 | 2 | 4 | 5;
};

export const RESPOSTAS_COOKTOP: RespostasCooktop = { tensao: 220, bocas: 4 };

export const GRUPOS_COOKTOP = [{ grupo: "cozinha", titulo: "Cooktop de indução" }];

/** A maior tomada do padrão brasileiro (NBR 14136) é de 20 A. */
export const TOMADA_MAXIMA_A = 20;

const n = (v: number) => v.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
const num = (v: unknown) => (typeof v === "number" ? v : null);
const txt = (v: unknown) => (typeof v === "string" ? v : "");

/** Se a ficha declara funcionar na tensão da casa. Tensão em branco não serve. */
function funcionaEm(p: Produto, v: Tensao): boolean {
  return txt(p.specs.tensao).includes(String(v));
}

export type ProjetoCooktop = { titulo: string; motivos: string[]; avisos: string[]; itens: Item[] };

export function montarProjetoCooktop(r: RespostasCooktop, baseTodas: Record<string, Produto>): ProjetoCooktop {
  const base = Object.values(baseTodas).filter((p) => p.categoria === "cooktops");
  const avisos: string[] = [];
  const motivos = [
    `Casa em ${r.tensao} V, cooktop de ${r.bocas === 5 ? "5 bocas ou mais" : `${r.bocas} ${r.bocas === 1 ? "boca" : "bocas"}`}.`,
  ];
  const naTensao = base.filter((p) => funcionaEm(p, r.tensao));
  const bocasPedidas = (p: Produto) => (r.bocas === 5 ? (num(p.specs.bocas) ?? 0) >= 5 : num(p.specs.bocas) === r.bocas);
  const semTensao = base.filter((p) => !txt(p.specs.tensao) && bocasPedidas(p));
  if (semTensao.length) {
    avisos.push(`${semTensao.map((p) => p.nome).join(", ")} não ${semTensao.length === 1 ? "declara" : "declaram"} a tensão com clareza e ${semTensao.length === 1 ? "ficou" : "ficaram"} fora.`);
  }
  const bocas = (p: Produto) => num(p.specs.bocas) ?? 0;
  let candidatos = naTensao.filter((p) => (r.bocas === 5 ? bocas(p) >= 5 : bocas(p) === r.bocas));
  if (!candidatos.length) {
    const outros = naTensao.filter((p) => bocas(p) >= r.bocas);
    if (outros.length) {
      avisos.push(`Nenhum cooktop da base com exatamente ${r.bocas} ${r.bocas === 1 ? "boca" : "bocas"} declara funcionar em ${r.tensao} V; a lista mostra os de mais bocas que funcionam.`);
      candidatos = outros;
    }
  }
  if (r.tensao === 127 && r.bocas >= 4) {
    const so220 = base.filter((p) => bocas(p) >= 4 && funcionaEm(p, 220) && !funcionaEm(p, 127)).length;
    if (so220) avisos.push(`Nenhum cooktop de 4 bocas ou mais da base declara funcionar em 127 V: os ${so220} que existem são de 220 V.`);
  }

  // Quem declara o disjuntor primeiro, depois quem declara a potência — é o
  // que o comprador precisa para instalar; depois a garantia.
  candidatos = candidatos.sort(
    (a, b) =>
      Number(num(b.specs.disjuntorA) != null) - Number(num(a.specs.disjuntorA) != null) ||
      Number(num(b.specs.potenciaTotalW) != null) - Number(num(a.specs.potenciaTotalW) != null) ||
      (num(b.specs.garantiaMeses) ?? 0) - (num(a.specs.garantiaMeses) ?? 0),
  );
  const corrente = (p: Produto) => {
    const w = num(p.specs.potenciaTotalW);
    return w != null ? w / r.tensao : null;
  };
  const descreve = (p: Produto) => {
    const w = num(p.specs.potenciaTotalW);
    const a = corrente(p);
    const d = num(p.specs.disjuntorA);
    return [
      w != null ? `${n(w)} W declarados — ${n(a!)} A a ${r.tensao} V` : "não declara a potência total",
      d != null ? `disjuntor de ${n(d)} A declarado` : "não declara o disjuntor",
    ].join("; ");
  };

  const [p, ...resto] = candidatos;
  if (!p) {
    return {
      titulo: "O cooktop para a sua cozinha",
      motivos,
      avisos: [...avisos, `Nenhum cooktop da base declara funcionar em ${r.tensao} V com essa quantidade de bocas.`],
      itens: [
        {
          id: "cooktop",
          grupo: "cozinha",
          papel: "Cooktop de indução",
          qtd: 1,
          especificacao: `Cooktop de indução de ${r.bocas} bocas que declare funcionar em ${r.tensao} V, com potência total e disjuntor declarados.`,
          porque: "Sem a potência total, não há como saber a corrente que a instalação precisa aguentar.",
        },
      ],
    };
  }
  const a = corrente(p);
  const confira: string[] = [];
  if (a != null && a > TOMADA_MAXIMA_A) {
    confira.push(
      `${n(a)} A passam dos ${TOMADA_MAXIMA_A} A da maior tomada do padrão brasileiro (NBR 14136): a ligação é direta, num circuito só dele.`,
    );
  }
  if (a == null) confira.push(`A ${p.marca} não declara a potência total: sem ela, não dá para saber a corrente.`);
  confira.push("O disjuntor e a bitola do fio quem define é o eletricista, pela NBR 5410 — o simulador dá a corrente, não o dimensionamento.");
  return {
    titulo: `O cooktop para ${r.tensao} V`,
    motivos,
    avisos,
    itens: [
      {
        id: "cooktop",
        grupo: "cozinha",
        papel: `Cooktop de indução, ${r.bocas === 5 ? "5 bocas ou mais" : `${r.bocas} ${r.bocas === 1 ? "boca" : "bocas"}`}`,
        qtd: 1,
        produto: p.slug,
        porque: `${num(p.specs.disjuntorA) != null ? "Declara o disjuntor que a instalação pede — só 3 dos 16 cooktops da base declaram. " : ""}${descreve(p)}.`,
        regra: `Corrente = potência declarada ÷ ${r.tensao} V. É física, não estimativa; o que ela não inclui é o dimensionamento do circuito.`,
        confira,
        alternativa: resto[0] ? { produto: resto[0].slug, motivo: descreve(resto[0]) } : undefined,
        outras: resto.slice(1, OPCOES_POR_ITEM - 1).map((o) => ({ produto: o.slug, motivo: descreve(o) })),
      },
    ],
  };
}

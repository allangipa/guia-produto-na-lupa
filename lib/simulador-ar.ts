import type { Produto } from "./specs";
import { OPCOES_POR_ITEM, type Item } from "./simulador-lista";

/**
 * A calculadora de ar-condicionado do /simulador: o cômodo entra, o BTU e os
 * splits da base saem. Puro — roda no navegador.
 *
 * A CONTA É DE UM FABRICANTE, NÃO NOSSA
 *
 * É a do simulador de capacidade da LG Brasil
 * (lg.com/br/suporte/simulador-ar-condicionado), lida no código da página em
 * 29/09/2026: 600 BTU por m², mais 600 por pessoa; mais 20% no Norte, Nordeste
 * e Centro-Oeste; mais 15% com muito sol; mais 400 por TV e 600 por computador
 * e por geladeira ou frigobar. A LG limita a 100 m², e aqui também.
 *
 * A página de texto da mesma LG fala em "média inicial de 600 a 800 BTUs por
 * m²" que "muitos profissionais" usam, sem dizer quando usar cada ponta. Até
 * 29/09 o guia deste site atribuía à LG uma regra de 600 com pouco sol e 800
 * com muito, que ela não escreve; foi corrigido.
 *
 * A área que o fabricante do split declara (só a Electrolux declara, nas seis
 * MaxComfort) não entra na conta: aparece ao lado, porque as duas nem sempre
 * batem e o comprador merece ver as duas.
 */

export type Regiao = "quente" | "outra";
export type Ciclo = "frio" | "quenteFrio";

export type RespostasAr = {
  areaM2: number;
  pessoas: number;
  regiao: Regiao;
  muitoSol: boolean;
  tvs: number;
  computadores: number;
  geladeiras: number;
  ciclo: Ciclo;
};

export const RESPOSTAS_AR: RespostasAr = {
  areaM2: 12,
  pessoas: 2,
  regiao: "outra",
  muitoSol: false,
  tvs: 1,
  computadores: 0,
  geladeiras: 0,
  ciclo: "frio",
};

export const GRUPOS_AR = [{ grupo: "clima", titulo: "Ar-condicionado" }];

export const AREA_MAXIMA_M2 = 100;

const n = (v: number) => v.toLocaleString("pt-BR");
const num = (v: unknown) => (typeof v === "number" ? v : null);
const txt = (v: unknown) => (typeof v === "string" ? v : "");

/** A conta do simulador da LG, passo a passo — cada parcela vai para a tela. */
export function calcularBtu(r: RespostasAr): { total: number; passos: string[] } {
  const passos: string[] = [];
  let btu = r.areaM2 * 600;
  passos.push(`${n(r.areaM2)} m² × 600 = ${n(btu)}`);
  if (r.pessoas > 0) {
    btu += r.pessoas * 600;
    passos.push(`+ ${n(r.pessoas)} ${r.pessoas === 1 ? "pessoa" : "pessoas"} × 600 = ${n(btu)}`);
  }
  if (r.regiao === "quente") {
    btu += btu * 0.2;
    passos.push(`+ 20% (Norte, Nordeste ou Centro-Oeste) = ${n(Math.round(btu))}`);
  }
  if (r.muitoSol) {
    btu += btu * 0.15;
    passos.push(`+ 15% (muito sol) = ${n(Math.round(btu))}`);
  }
  const extras = r.tvs * 400 + r.computadores * 600 + r.geladeiras * 600;
  if (extras > 0) {
    btu += extras;
    const partes = [
      r.tvs ? `${n(r.tvs)} TV × 400` : null,
      r.computadores ? `${n(r.computadores)} computador × 600` : null,
      r.geladeiras ? `${n(r.geladeiras)} geladeira × 600` : null,
    ].filter(Boolean);
    passos.push(`+ ${partes.join(" + ")} = ${n(Math.round(btu))}`);
  }
  return { total: Math.round(btu), passos };
}

/** "Entre 12 e 18 m²" → { min: 12, max: 18 }. */
function areaDeclarada(p: Produto): { min: number; max: number } | null {
  const m = txt(p.specs.areaRecomendadaM2).match(/(\d+(?:,\d+)?)\D+(\d+(?:,\d+)?)/);
  if (!m) return null;
  return { min: Number(m[1].replace(",", ".")), max: Number(m[2].replace(",", ".")) };
}

const ehQuenteFrio = (p: Produto) => /quente/i.test(txt(p.specs.ciclo));

export type ProjetoAr = { titulo: string; motivos: string[]; avisos: string[]; itens: Item[]; btu: number; passos: string[] };

export function montarProjetoAr(r: RespostasAr, baseTodas: Record<string, Produto>): ProjetoAr {
  const base = Object.values(baseTodas).filter((p) => p.categoria === "ar-condicionado");
  const { total, passos } = calcularBtu(r);
  const avisos: string[] = [];
  const motivos: string[] = [
    `Pela conta do simulador da LG, o cômodo pede ${n(total)} BTU/h.`,
  ];
  const doCiclo = base.filter((p) => (r.ciclo === "quenteFrio" ? ehQuenteFrio(p) : !ehQuenteFrio(p)));
  const tamanhos = [...new Set(doCiclo.map((p) => num(p.specs.capacidadeBtus)).filter((x): x is number => x != null))].sort(
    (a, b) => a - b,
  );
  const tamanho = tamanhos.find((t) => t >= total);
  const itens: Item[] = [];

  if (!tamanho) {
    const maior = tamanhos.at(-1);
    avisos.push(
      `Nenhum split ${r.ciclo === "quenteFrio" ? "quente e frio" : "só frio"} da base chega a ${n(total)} BTU/h${maior ? `; o maior tem ${n(maior)}` : ""}. Para esse cômodo, confirme o dimensionamento com quem vai instalar.`,
    );
    itens.push({
      id: "ar",
      grupo: "clima",
      papel: "Ar-condicionado",
      qtd: 1,
      especificacao: `Ar-condicionado de pelo menos ${n(total)} BTU/h, ${r.ciclo === "quenteFrio" ? "quente e frio" : "só frio"}.`,
      porque: `Conta do simulador de capacidade da LG: ${passos.join(" → ")}.`,
    });
    return { titulo: "O ar-condicionado do cômodo", motivos, avisos, itens, btu: total, passos };
  }

  // Entre os do tamanho — que a conta da LG já garante —, primeiro o menor
  // consumo anual declarado (sem declaração vai para o fim); depois o maior
  // IDRS; depois quem declara uma área que cobre o cômodo; depois a garantia.
  const cobre = (p: Produto) => {
    const a = areaDeclarada(p);
    return a ? a.max >= r.areaM2 : false;
  };
  const candidatos = doCiclo
    .filter((p) => num(p.specs.capacidadeBtus) === tamanho)
    .sort(
      (a, b) =>
        (num(a.specs.consumoKwhAno) ?? 99999) - (num(b.specs.consumoKwhAno) ?? 99999) ||
        (num(b.specs.idrsWhWh) ?? 0) - (num(a.specs.idrsWhWh) ?? 0) ||
        Number(cobre(b)) - Number(cobre(a)) ||
        (num(b.specs.garantiaMeses) ?? 0) - (num(a.specs.garantiaMeses) ?? 0),
    );
  const [p, ...resto] = candidatos;
  const conferir: string[] = [];
  const area = areaDeclarada(p);
  if (area) {
    if (area.max < r.areaM2) {
      conferir.push(`A ${p.marca} declara este modelo para até ${n(area.max)} m², menos que os ${n(r.areaM2)} m² do cômodo.`);
    } else {
      conferir.push(
        `A ${p.marca} declara este modelo para ${n(area.min)} a ${n(area.max)} m². A conta da LG, com as pessoas e aparelhos que você marcou, pede ${n(total)} BTU/h — as duas regras não são a mesma, e a lista mostra as duas.`,
      );
    }
  } else {
    conferir.push(`A ${p.marca} não declara para quantos m² este modelo serve; a escolha é só pela conta da LG.`);
  }
  if (txt(p.specs.tensao)) conferir.push(`Tensão declarada: ${txt(p.specs.tensao)}. Confira o circuito do cômodo antes de comprar.`);

  const detalhe = (x: Produto) =>
    [
      num(x.specs.consumoKwhAno) != null ? `${n(num(x.specs.consumoKwhAno)!)} kWh/ano declarados` : "consumo anual não declarado",
      num(x.specs.idrsWhWh) != null ? `IDRS ${String(x.specs.idrsWhWh).replace(".", ",")}` : null,
      txt(x.specs.classificacaoEnergetica) ? `faixa ${txt(x.specs.classificacaoEnergetica)} do INMETRO` : null,
      areaDeclarada(x) ? `área declarada até ${n(areaDeclarada(x)!.max)} m²` : null,
    ]
      .filter(Boolean)
      .join(", ");

  itens.push({
    id: "ar",
    grupo: "clima",
    papel: `Split de ${n(tamanho)} BTU/h`,
    qtd: 1,
    produto: p.slug,
    porque: `Conta do simulador de capacidade da LG: ${passos.join(" → ")}. ${n(tamanho)} BTU/h é o menor tamanho da base que cobre os ${n(total)} da conta. Entre os ${n(candidatos.length)} desse tamanho, ${num(p.specs.consumoKwhAno) != null ? "é o de menor consumo anual declarado" : "nenhum declara consumo anual; este vem primeiro pelo IDRS e pela garantia"}: ${detalhe(p)}.`,
    confira: conferir,
    alternativa: resto[0] ? { produto: resto[0].slug, motivo: detalhe(resto[0]) } : undefined,
    outras: resto.slice(1, OPCOES_POR_ITEM - 1).map((o) => ({ produto: o.slug, motivo: detalhe(o) })),
  });

  if (r.areaM2 > AREA_MAXIMA_M2) {
    avisos.push(`O simulador da LG vai até ${n(AREA_MAXIMA_M2)} m². Acima disso, quem instala dimensiona.`);
  }
  return { titulo: `O ar-condicionado para ${n(r.areaM2)} m²`, motivos, avisos, itens, btu: total, passos };
}

import type { Produto } from "./specs";
import { OPCOES_POR_ITEM, type Item } from "./simulador-lista";

/**
 * A air fryer pelo tamanho da família, no /simulador. Puro — roda no navegador.
 *
 * O LITRO DO NOME NÃO DIZ QUANTO CABE
 *
 * A pergunta natural é "para quantas pessoas", e só 3 das 20 fichas a
 * respondem (Walita NA130 e NA230, 1 a 6; Elgin Facilita Fry, 1 a 2). O que 11
 * respondem, no manual, é quanta batata frita cabe por vez — e esse número não
 * acompanha o litro: a Mondial AFON-12L, de 12 litros, aceita 400 g; a AFN-40,
 * de 4, aceita 500. Por isso a escolha é pela batata declarada (`batataMaxKg`),
 * e as pessoas só pesam onde o fabricante as declara.
 *
 * Não há conversão de pessoas em gramas: nenhuma fonte listada sustenta uma
 * porção por pessoa, e o site não inventa uma.
 */

export type Pessoas = "1-2" | "3-4" | "5-6" | "7+";
export type Batata = 0.5 | 0.8 | 1;

export type RespostasAirfryer = {
  pessoas: Pessoas;
  batataKg: Batata;
  lavaLoucas: boolean;
};

export const RESPOSTAS_AIRFRYER: RespostasAirfryer = { pessoas: "3-4", batataKg: 0.8, lavaLoucas: false };

export const GRUPOS_AIRFRYER = [{ grupo: "cozinha", titulo: "Air fryer" }];

const n = (v: number) => v.toLocaleString("pt-BR");
const num = (v: unknown) => (typeof v === "number" ? v : null);
const txt = (v: unknown) => (typeof v === "string" ? v : "");
const kg = (v: number) => (v < 1 ? `${n(Math.round(v * 1000))} g` : `${n(v)} kg`);

const FAIXA: Record<Pessoas, [number, number]> = { "1-2": [1, 2], "3-4": [3, 4], "5-6": [5, 6], "7+": [7, 99] };

/** "1 a 6" → [1, 6]. */
function pessoasDe(p: Produto): [number, number] | null {
  const m = txt(p.specs.pessoasDeclaradas).match(/(\d+)\D+(\d+)/);
  return m ? [Number(m[1]), Number(m[2])] : null;
}

export type ProjetoAirfryer = { titulo: string; motivos: string[]; avisos: string[]; itens: Item[] };

export function montarProjetoAirfryer(r: RespostasAirfryer, baseTodas: Record<string, Produto>): ProjetoAirfryer {
  const base = Object.values(baseTodas).filter((p) => p.categoria === "cozinha");
  const [pMin, pMax] = FAIXA[r.pessoas];
  const avisos: string[] = [];
  const declaramBatata = base.filter((p) => num(p.specs.batataMaxKg) != null);
  const declaramPessoas = base.filter((p) => pessoasDe(p));
  const motivos = [
    `Você quer fazer até ${kg(r.batataKg)} de batata frita de uma vez. Das ${n(base.length)} air fryers da base, ${n(declaramBatata.length)} dizem no manual quanta batata cabe; a escolha é entre elas.`,
  ];

  const serveAsPessoas = (p: Produto) => {
    const f = pessoasDe(p);
    return f ? f[0] <= pMin && f[1] >= Math.min(pMax, 99) : false;
  };
  let candidatos = declaramBatata
    .filter((p) => (num(p.specs.batataMaxKg) as number) >= r.batataKg)
    .filter((p) => !r.lavaLoucas || p.specs.lavaLoucas === true);
  // Quem declara servir às pessoas pedidas vem primeiro; depois a de menor
  // caixa (não pagar por tamanho que não usa); depois a maior batata.
  candidatos = candidatos.sort(
    (a, b) =>
      Number(serveAsPessoas(b)) - Number(serveAsPessoas(a)) ||
      (num(a.specs.capacidadeTotalL) ?? 99) - (num(b.specs.capacidadeTotalL) ?? 99) ||
      (num(b.specs.batataMaxKg) ?? 0) - (num(a.specs.batataMaxKg) ?? 0),
  );

  const litroEngana = declaramBatata
    .filter((p) => (num(p.specs.capacidadeTotalL) ?? 0) >= 9 && (num(p.specs.batataMaxKg) ?? 1) < r.batataKg)
    .map((p) => `${p.nome}: ${n(num(p.specs.capacidadeTotalL)!)} litros e ${kg(num(p.specs.batataMaxKg)!)} de batata por vez`);
  if (litroEngana.length) {
    avisos.push(`O litro do nome não diz quanto cabe. Ficaram de fora air fryers grandes que aceitam menos batata do que você pediu — ${litroEngana.join("; ")}.`);
  }
  if (!declaramPessoas.some(serveAsPessoas)) {
    avisos.push(
      `Nenhuma ficha da base declara servir ${r.pessoas === "7+" ? "mais de 6 pessoas" : `${pMin} a ${pMax} pessoas`}; só ${n(declaramPessoas.length)} das ${n(base.length)} dizem para quantas pessoas servem. A escolha fica pela batata por vez.`,
    );
  }

  const servemSemBatata = declaramPessoas.filter((x) => serveAsPessoas(x) && num(x.specs.batataMaxKg) == null);
  if (servemSemBatata.length) {
    avisos.push(
      `${servemSemBatata.map((x) => x.nome).join(" e ")} ${servemSemBatata.length === 1 ? "declara" : "declaram"} servir essa quantidade de pessoas, mas o manual não diz quanta batata cabe — ${servemSemBatata.length === 1 ? "ficou" : "ficaram"} fora da conta.`,
    );
  }
  const [p, ...resto] = candidatos;
  if (!p) {
    return {
      titulo: "A air fryer para a sua casa",
      motivos,
      avisos: [...avisos, `Nenhuma air fryer da base declara aceitar ${kg(r.batataKg)} de batata de uma vez${r.lavaLoucas ? " com peças que vão na lava-louças" : ""}.`],
      itens: [
        {
          id: "airfryer",
          grupo: "cozinha",
          papel: "Air fryer",
          qtd: 1,
          especificacao: `Air fryer cujo manual declare pelo menos ${kg(r.batataKg)} de batata frita por vez.`,
          porque: "Confira a tabela de alimentos do manual antes de comprar: é lá que o fabricante diz quanto cabe.",
        },
      ],
    };
  }
  const detalhe = (x: Produto) =>
    [
      `${kg(num(x.specs.batataMaxKg)!)} de batata por vez`,
      num(x.specs.capacidadeTotalL) != null ? `${n(num(x.specs.capacidadeTotalL)!)} L no nome` : null,
      num(x.specs.capacidadeUtilL) != null ? `${n(num(x.specs.capacidadeUtilL)!)} L de cesto` : null,
      pessoasDe(x) ? `declara ${txt(x.specs.pessoasDeclaradas)} pessoas` : null,
    ]
      .filter(Boolean)
      .join(", ");
  const confira: string[] = [];
  if (!pessoasDe(p)) confira.push(`A ${p.marca} não diz para quantas pessoas ela serve.`);
  if (num(p.specs.capacidadeUtilL) == null) confira.push(`A ${p.marca} não diz quanto cabe no cesto, só o litro do nome.`);

  return {
    titulo: `A air fryer para ${kg(r.batataKg)} de batata por vez`,
    motivos,
    avisos,
    itens: [
      {
        id: "airfryer",
        grupo: "cozinha",
        papel: "Air fryer",
        qtd: 1,
        produto: p.slug,
        porque: serveAsPessoas(p)
          ? `A ${p.marca} declara que ela serve ${txt(p.specs.pessoasDeclaradas)} pessoas, e o manual cobre a batata que você pediu: ${detalhe(p)}.`
          : `É a de menor litragem entre as que o manual declara aceitar ${kg(r.batataKg)} de batata ou mais: ${detalhe(p)}.`,
        regra: "Entre as que aceitam a batata pedida, primeiro a que declara servir às pessoas; depois a de menor litragem, para não pagar por tamanho que não se usa.",
        confira: confira.length ? confira : undefined,
        alternativa: resto[0] ? { produto: resto[0].slug, motivo: detalhe(resto[0]) } : undefined,
        outras: resto.slice(1, OPCOES_POR_ITEM - 1).map((o) => ({ produto: o.slug, motivo: detalhe(o) })),
      },
    ],
  };
}

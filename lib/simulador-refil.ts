import type { Produto } from "./specs";
import { OPCOES_POR_ITEM, type Item } from "./simulador-lista";

/**
 * O refil do purificador de água no /simulador: o consumo da casa entra, a
 * duração do refil sai. Puro — roda no navegador.
 *
 * O LITRO É O NÚMERO HONESTO
 *
 * A vida útil do refil vem em duas unidades que brigam. A Consul dá 1.500 L em
 * 6 meses e 2.250 L em 9 — os mesmos 250 L por mês. A IBBL dá os mesmos 6 meses
 * a refis de 2.000 e de 3.000 L. O mês é o litro dividido por um consumo que
 * nenhuma das 17 fichas escreve. Aqui o consumo é o da casa do leitor, e a
 * duração sai do litro declarado.
 *
 * Só entram as fichas que declaram o refil em litros (8 de 17: Consul e IBBL).
 * Electrolux, Midea e Philco não declaram, e a lista diz isso. O prazo em meses
 * do fabricante aparece ao lado: nenhuma ficha diz se ele vale como limite
 * mesmo com pouco uso.
 */

export type RespostasRefil = {
  /** Litros de água filtrada por dia: beber, café, cozinhar. */
  litrosDia: number;
  gelada: boolean;
};

export const RESPOSTAS_REFIL: RespostasRefil = { litrosDia: 8, gelada: true };

export const GRUPOS_REFIL = [{ grupo: "agua", titulo: "Purificador de água" }];

const n = (v: number) => v.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
const num = (v: unknown) => (typeof v === "number" ? v : null);
const txt = (v: unknown) => (typeof v === "string" ? v : "");
/** Dias médios de um mês — 365 ÷ 12. */
const DIAS_MES = 365 / 12;

const temGelada = (p: Produto) =>
  /gelad/i.test(txt(p.specs.temperaturasDisponiveis)) || num(p.specs.capacidadeResfriamentoLh) != null;

export type ProjetoRefil = { titulo: string; motivos: string[]; avisos: string[]; itens: Item[] };

/** Meses que o refil dura na casa, pela conta dos litros. */
export function mesesNaCasa(p: Produto, litrosDia: number): number | null {
  const l = num(p.specs.vidaUtilFiltroL);
  return l && litrosDia > 0 ? l / (litrosDia * DIAS_MES) : null;
}

export function montarProjetoRefil(r: RespostasRefil, baseTodas: Record<string, Produto>): ProjetoRefil {
  const base = Object.values(baseTodas).filter((p) => p.categoria === "purificadores");
  const declaram = base.filter((p) => num(p.specs.vidaUtilFiltroL) != null);
  const naoDeclaram = [...new Set(base.filter((p) => num(p.specs.vidaUtilFiltroL) == null).map((p) => p.marca))];
  const litrosMes = r.litrosDia * DIAS_MES;
  const motivos = [
    `Sua casa usa ${n(r.litrosDia)} L de água filtrada por dia — cerca de ${n(Math.round(litrosMes))} L por mês.`,
  ];
  const avisos = [
    `Só ${declaram.length} dos ${base.length} purificadores da base dizem quantos litros o refil filtra. ${naoDeclaram.join(", ")} não declaram, e ficam fora da conta.`,
  ];
  let candidatos = declaram.filter((p) => !r.gelada || temGelada(p));
  if (r.gelada && candidatos.length < declaram.length) {
    const fora = declaram.filter((p) => !temGelada(p)).map((p) => p.nome);
    if (fora.length) avisos.push(`Sem água gelada declarada, saíram: ${fora.join(", ")}.`);
  }
  // Menos trocas por ano primeiro — o refil que filtra mais litros; no
  // empate, o de maior taxa de resfriamento declarada.
  candidatos = candidatos.sort(
    (a, b) =>
      (num(b.specs.vidaUtilFiltroL) ?? 0) - (num(a.specs.vidaUtilFiltroL) ?? 0) ||
      (num(b.specs.capacidadeResfriamentoLh) ?? 0) - (num(a.specs.capacidadeResfriamentoLh) ?? 0),
  );
  const descreve = (p: Produto) => {
    const l = num(p.specs.vidaUtilFiltroL)!;
    const meses = mesesNaCasa(p, r.litrosDia)!;
    const trocas = 12 / meses;
    const decl = num(p.specs.vidaUtilFiltroMeses);
    const t = Math.round(trocas * 10) / 10;
    return `refil de ${n(l)} L: pela conta dos litros, dura cerca de ${n(meses)} ${meses < 1.05 && meses > 0.95 ? "mês" : "meses"} na sua casa — ${n(t)} ${t === 1 ? "troca" : "trocas"} por ano${decl != null ? `; a ${p.marca} escreve ${n(decl)} meses` : ""}`;
  };
  const [p, ...resto] = candidatos;
  if (!p) {
    return {
      titulo: "O purificador para a sua casa",
      motivos,
      avisos: [...avisos, "Nenhum purificador da base declara, ao mesmo tempo, o refil em litros e água gelada."],
      itens: [
        {
          id: "purificador",
          grupo: "agua",
          papel: "Purificador de água",
          qtd: 1,
          especificacao: `Purificador que declare a vida útil do refil em litros${r.gelada ? " e água gelada" : ""}.`,
          porque: "Só o litro permite saber quanto o refil dura na sua casa.",
        },
      ],
    };
  }
  const meses = mesesNaCasa(p, r.litrosDia)!;
  const decl = num(p.specs.vidaUtilFiltroMeses);
  const confira: string[] = [];
  if (decl != null && Math.abs(meses - decl) / decl > 0.2) {
    confira.push(
      meses > decl
        ? `Pelo litro, o refil duraria ${n(meses)} meses na sua casa, mais que os ${n(decl)} que a ${p.marca} escreve. A ficha não diz se o prazo em meses vale como limite mesmo com pouco uso — confira no manual.`
        : `Pelo litro, o refil dura ${n(meses)} meses na sua casa, menos que os ${n(decl)} que a ${p.marca} escreve: o prazo em meses supõe um consumo menor que o seu.`,
    );
  }
  if (r.gelada && num(p.specs.capacidadeResfriamentoLh) == null) {
    confira.push(`A ${p.marca} não declara quantos litros de água gelada ele repõe por hora.`);
  }
  return {
    titulo: `O refil para ${n(r.litrosDia)} L por dia`,
    motivos,
    avisos,
    itens: [
      {
        id: "purificador",
        grupo: "agua",
        papel: "Purificador de água",
        qtd: 1,
        produto: p.slug,
        porque: `É o que pede menos trocas de refil entre os que atendem: ${descreve(p)}.${num(p.specs.capacidadeResfriamentoLh) != null ? ` Declara repor ${n(num(p.specs.capacidadeResfriamentoLh)!)} L de água gelada por hora.` : ""}`,
        regra: `Duração na sua casa = litros do refil ÷ (${n(r.litrosDia)} L por dia × ${n(DIAS_MES)} dias por mês). Ordem: o refil que filtra mais litros primeiro.`,
        confira: confira.length ? confira : undefined,
        alternativa: resto[0] ? { produto: resto[0].slug, motivo: descreve(resto[0]) } : undefined,
        outras: resto.slice(1, OPCOES_POR_ITEM - 1).map((o) => ({ produto: o.slug, motivo: descreve(o) })),
      },
    ],
  };
}

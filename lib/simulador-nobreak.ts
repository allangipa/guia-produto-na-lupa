import type { Produto } from "./specs";
import { OPCOES_POR_ITEM, type Item } from "./simulador-lista";
import { FOLGA_NOBREAK } from "./simulador-cameras";

/**
 * O nobreak para qualquer carga do /simulador: os aparelhos entram, o nobreak
 * sai. Puro — roda no navegador. É o motor do nobreak do projeto de câmeras
 * aberto para computador, roteador e TV.
 *
 * OS WATTS SÃO DO LEITOR, NÃO NOSSOS
 *
 * O site não tem fonte para dizer quanto "um computador" consome — a faixa vai
 * de dezenas a centenas de watts. Por isso a pessoa digita os watts da
 * etiqueta de cada aparelho, e a conta soma o que ela digitou. Nada de valor
 * típico inventado.
 *
 * Só entram nobreaks que declaram watts (o VA do nome não se soma com o
 * consumo dos aparelhos). Com fonte de PFC ativo, só quem declara, por
 * escrito, servir para ela. Autonomia não é calculada: aparece a que o
 * fabricante declara, com a carga dele.
 */

export type Pfc = "sim" | "nao" | "naoSei";

export type Aparelho = { nome: string; watts: number; qtd: number };

export type RespostasNobreak = {
  aparelhos: Aparelho[];
  /** A fonte do computador tem PFC ativo? Só pergunta se houver computador. */
  pfc: Pfc;
  temComputador: boolean;
};

export const RESPOSTAS_NOBREAK: RespostasNobreak = {
  aparelhos: [
    { nome: "Computador de mesa", watts: 0, qtd: 1 },
    { nome: "Monitor", watts: 0, qtd: 1 },
    { nome: "Roteador e modem", watts: 0, qtd: 1 },
    { nome: "Outro aparelho", watts: 0, qtd: 0 },
  ],
  pfc: "naoSei",
  temComputador: true,
};

export const GRUPOS_NOBREAK = [{ grupo: "energia", titulo: "Nobreak" }];

const n = (v: number) => v.toLocaleString("pt-BR");
const txt = (v: unknown) => (typeof v === "string" ? v : "");
const num = (v: unknown) => (typeof v === "number" ? v : null);

export type ProjetoNobreak = { titulo: string; motivos: string[]; avisos: string[]; itens: Item[] };

export function cargaTotal(r: RespostasNobreak): number {
  return r.aparelhos.reduce((s, a) => s + Math.max(0, a.watts) * Math.max(0, a.qtd), 0);
}

export function montarProjetoNobreak(r: RespostasNobreak, baseTodas: Record<string, Produto>): ProjetoNobreak {
  const base = Object.values(baseTodas).filter((p) => p.categoria === "nobreaks");
  const carga = cargaTotal(r);
  const pedido = carga * (1 + FOLGA_NOBREAK);
  const avisos: string[] = [];
  const usados = r.aparelhos.filter((a) => a.watts > 0 && a.qtd > 0);
  const motivos = [
    `Os aparelhos que você marcou somam ${n(carga)} W: ${usados.map((a) => `${a.qtd > 1 ? `${n(a.qtd)} × ` : ""}${a.nome.toLowerCase()} de ${n(a.watts)} W`).join(", ")}.`,
  ];
  const semWatts = r.aparelhos.filter((a) => a.qtd > 0 && a.watts <= 0);
  if (semWatts.length) {
    avisos.push(
      `Sem os watts de ${semWatts.map((a) => a.nome.toLowerCase()).join(", ")}, eles ficaram fora da conta. O número está na etiqueta do aparelho ou da fonte dele.`,
    );
  }

  const pfcObrigatorio = r.temComputador && r.pfc === "sim";
  const declaramWatts = base.filter((p) => typeof p.specs.potenciaW === "number");
  let candidatos = declaramWatts
    .filter((p) => (p.specs.potenciaW as number) >= pedido)
    .filter((p) => !pfcObrigatorio || p.specs.compativelPfc === true);
  // Quem não sabe se tem PFC fica com os que aceitam PFC primeiro; o aviso
  // explica. Depois, o menor em watts; no empate, o menor consumo em espera.
  candidatos = [...candidatos].sort(
    (a, b) =>
      (r.temComputador && r.pfc === "naoSei" ? Number(b.specs.compativelPfc === true) - Number(a.specs.compativelPfc === true) : 0) ||
      (a.specs.potenciaW as number) - (b.specs.potenciaW as number) ||
      (num(a.specs.consumoStandbyW) ?? 99) - (num(b.specs.consumoStandbyW) ?? 99),
  );

  const regra = `Folga de ${n(FOLGA_NOBREAK * 100)}% sobre a soma, para o nobreak não trabalhar no limite. A comparação é em watts, nunca em VA do nome. Entre os que cabem, o menor.`;
  if (r.temComputador && r.pfc !== "nao") {
    avisos.push(
      r.pfc === "sim"
        ? "Com fonte de PFC ativo, só entram nobreaks cujo fabricante declara, por escrito, servir para ela. Os de onda não senoidal desta base trazem aviso contra esse uso, ou não dizem nada."
        : "Não sabe se a fonte do computador tem PFC ativo? A etiqueta dela diz (\"Active PFC\"). Na dúvida, a lista põe primeiro os nobreaks que o fabricante declara servirem para PFC ativo.",
    );
  }
  const [p, ...resto] = candidatos;
  if (!p) {
    return {
      titulo: "O nobreak para os seus aparelhos",
      motivos,
      avisos: [
        ...avisos,
        `Nenhum nobreak da base que declara watts${pfcObrigatorio ? " e aceita PFC ativo" : ""} chega a ${n(Math.ceil(pedido))} W.`,
      ],
      itens: [
        {
          id: "nobreak",
          grupo: "energia",
          papel: "Nobreak",
          qtd: 1,
          especificacao: `Nobreak de pelo menos ${n(Math.ceil(pedido))} W declarados${pfcObrigatorio ? ", de onda senoidal e com indicação do fabricante para fonte PFC ativo" : ""}.`,
          porque: `${n(carga)} W dos aparelhos, com a folga.`,
          regra,
        },
      ],
    };
  }
  const diferenca = (o: Produto) =>
    [
      `${n(o.specs.potenciaW as number)} W declarados`,
      o.specs.compativelPfc === true ? "declara servir para PFC ativo" : o.specs.compativelPfc === false ? "desaconselhado para PFC ativo" : null,
      txt(o.specs.formaOnda) ? `onda ${txt(o.specs.formaOnda).toLowerCase()}` : null,
    ]
      .filter(Boolean)
      .join(", ");
  const confira: string[] = [];
  const autonomia = txt(p.specs.autonomia);
  confira.push(
    autonomia
      ? `Autonomia declarada pela ${p.marca}: ${autonomia}. Vale para a carga dela; com ${n(carga)} W, o tempo é outro.`
      : `A ${p.marca} não declara autonomia deste modelo com carga nenhuma, e o simulador não calcula minutos.`,
  );
  if (r.temComputador && p.specs.compativelPfc !== true && r.pfc !== "nao") {
    confira.push(`A ${p.marca} ${p.specs.compativelPfc === false ? "desaconselha este modelo para fonte com PFC ativo" : "não diz se este modelo serve para fonte com PFC ativo"}.`);
  }
  return {
    titulo: `O nobreak para ${n(carga)} W`,
    motivos,
    avisos,
    itens: [
      {
        id: "nobreak",
        grupo: "energia",
        papel: "Nobreak",
        qtd: 1,
        produto: p.slug,
        porque: `${n(carga)} W dos aparelhos, com a folga, pedem ${n(Math.ceil(pedido))} W. O ${p.nome} é o menor da base que cabe${pfcObrigatorio || (r.temComputador && r.pfc === "naoSei" && p.specs.compativelPfc === true) ? " entre os que declaram servir para PFC ativo" : ""}: ${diferenca(p)}${typeof p.specs.potenciaVa === "number" ? ` (os ${n(p.specs.potenciaVa as number)} VA do nome)` : ""}.`,
        regra,
        confira,
        alternativa: resto[0] ? { produto: resto[0].slug, motivo: diferenca(resto[0]) } : undefined,
        outras: resto.slice(1, OPCOES_POR_ITEM - 1).map((o) => ({ produto: o.slug, motivo: diferenca(o) })),
      },
    ],
  };
}

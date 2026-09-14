import type { DadosAmazon } from "@/lib/specs";

/**
 * Preço vindo da Creators API, com o horário da consulta.
 *
 * É a única forma permitida de mostrar preço da Amazon: o valor tem que vir da
 * API e vir acompanhado de quando foi consultado. Sem dado, o componente não
 * renderiza nada — e a página continua mandando o leitor ver o preço na loja.
 */
function horaLegivel(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
}

export function PrecoAmazon({
  dados,
  compacto = false,
}: {
  dados?: DadosAmazon;
  compacto?: boolean;
}) {
  if (!dados?.preco?.exibicao) return null;
  const simulado = dados.origem === "simulacao";

  if (compacto) {
    return (
      <p className="mt-2 flex items-baseline gap-1.5 text-[0.82rem]">
        <span className="dados font-semibold">{dados.preco.exibicao}</span>
        <span className="text-[0.7rem] text-tinta-suave">na Amazon</span>
        {simulado && (
          <span className="rounded bg-medio-suave px-1 text-[0.62rem] font-semibold uppercase text-medio">
            simulado
          </span>
        )}
      </p>
    );
  }

  return (
    <div className="mt-5 rounded-xl border border-linha bg-superficie p-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="dados text-2xl font-semibold">{dados.preco.exibicao}</span>
        <span className="text-[0.85rem] text-tinta-suave">na Amazon.com.br</span>
        {dados.disponivel === false && (
          <span className="text-[0.85rem] text-atencao">indisponível no momento</span>
        )}
        {simulado && (
          <span className="rounded bg-medio-suave px-1.5 py-0.5 text-[0.68rem] font-semibold uppercase text-medio">
            dado simulado
          </span>
        )}
      </div>
      <p className="mt-1 text-[0.75rem] text-tinta-suave">
        Preço consultado em {horaLegivel(dados.consultadoEm)}. Muda ao longo do
        dia; o que vale é o da loja no momento da compra.
      </p>
    </div>
  );
}

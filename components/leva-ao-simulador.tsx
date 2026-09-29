import Link from "next/link";
import { CHAMADAS, FOCO_DA_CATEGORIA, FOCOS, hrefDoFoco } from "@/lib/simulador";

/**
 * O caminho da ficha para o simulador da categoria, desde 29/09/2026. Quem
 * chega pelo Google numa ficha de split não sabia que existe a calculadora de
 * BTU — o simulador só aparecia no rodapé.
 *
 * Não é CTA e não usa cor de ação: é link interno, e `acao` pertence ao botão
 * de compra. Não conta para o teto de três blocos de CTA por página.
 */
export function LevaAoSimulador({ categoria }: { categoria?: string }) {
  const foco = categoria ? FOCO_DA_CATEGORIA[categoria] : undefined;
  if (!foco) return null;
  const rotulo = FOCOS.find((f) => f.valor === foco)!.rotulo;
  return (
    <Link
      href={hrefDoFoco(foco)}
      className="painel mt-8 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 p-5 transition hover:border-tinta-suave"
    >
      <span>
        <span className="text-[0.78rem] font-semibold uppercase tracking-[0.06em] text-tinta-suave">
          Simulador · {rotulo}
        </span>
        <span className="mt-1 block titulo-ui text-[1.05rem]">{CHAMADAS[foco]}</span>
      </span>
      <span className="shrink-0 text-[0.88rem] underline underline-offset-4">Abrir o simulador</span>
    </Link>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icone } from "@/components/icones";

/**
 * Trilho lateral de navegação — desktop.
 *
 * O padrão de Amazon e Mercado Livre: lista vertical, ícone à esquerda,
 * rótulo curto, sempre visível enquanto a página rola. Resolve o que a fileira
 * de pílulas não resolve quando as categorias passam de três: ela some ao
 * rolar e não cabe na largura.
 *
 * Só recebe categorias com produto. "Em breve" numa barra lateral parece
 * site abandonado; a lista cresce sozinha conforme a base cresce.
 *
 * Cliente por um único motivo: precisa do caminho atual para marcar o item
 * ativo. Os dados chegam prontos do servidor.
 */
export type ItemTrilho = {
  href: string;
  rotulo: string;
  icone: string;
  contagem?: number;
};

export type GrupoTrilho = {
  titulo: string;
  itens: ItemTrilho[];
};

export function Trilho({ grupos }: { grupos: GrupoTrilho[] }) {
  const caminho = usePathname();

  const ativo = (href: string) =>
    href === "/" ? caminho === "/" : caminho.startsWith(href);

  return (
    <nav aria-label="Seções do site" className="grid gap-6">
      {grupos.map((g) => (
        <div key={g.titulo}>
          <p className="px-3 text-[0.68rem] font-semibold uppercase tracking-[0.09em] text-tinta-suave">
            {g.titulo}
          </p>
          <ul className="mt-2 grid gap-0.5">
            {g.itens.map((i) => {
              const on = ativo(i.href);
              return (
                <li key={i.href}>
                  <Link
                    href={i.href}
                    aria-current={on ? "page" : undefined}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[0.9rem] transition-colors ${
                      on
                        ? "bg-acao-suave font-semibold text-acao-forte"
                        : "text-tinta hover:bg-superficie"
                    }`}
                  >
                    <Icone
                      nome={i.icone}
                      className={`h-4 w-4 shrink-0 ${on ? "text-acao-forte" : "text-tinta-suave"}`}
                    />
                    <span className="truncate">{i.rotulo}</span>
                    {typeof i.contagem === "number" && (
                      <span className="dados ml-auto text-[0.72rem] text-tinta-suave">
                        {i.contagem}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

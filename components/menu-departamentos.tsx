"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { GrupoNav } from "@/lib/navegacao";
import { Icone } from "@/components/icones";

/**
 * Botão "Todas as categorias" e o painel que ele abre.
 *
 * Substitui a tira de pílulas que tinha uma por categoria. O painel é a mesma
 * árvore da página `/categorias`, e o botão aponta para ela também: quem está
 * sem JavaScript clica no link e chega no mesmo conteúdo, em página inteira.
 * Por isso o gatilho é um `<a>` com `onClick` que previne, e não um `<button>`
 * — sem script, ele continua levando a algum lugar.
 */
export function MenuDepartamentos({ grupos }: { grupos: GrupoNav[] }) {
  const [aberto, setAberto] = useState(false);
  const painelId = useId();
  const caixa = useRef<HTMLDivElement>(null);
  const gatilho = useRef<HTMLAnchorElement>(null);
  const caminho = usePathname();

  // Navegou: o painel não pode sobreviver à troca de página.
  useEffect(() => setAberto(false), [caminho]);

  useEffect(() => {
    if (!aberto) return;
    function naTecla(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setAberto(false);
        gatilho.current?.focus();
      }
    }
    function noClique(e: MouseEvent) {
      const alvo = e.target as Node;
      if (!caixa.current?.contains(alvo) && !gatilho.current?.contains(alvo)) {
        setAberto(false);
      }
    }
    document.addEventListener("keydown", naTecla);
    document.addEventListener("mousedown", noClique);
    return () => {
      document.removeEventListener("keydown", naTecla);
      document.removeEventListener("mousedown", noClique);
    };
  }, [aberto]);

  return (
    <div className="relative">
      <Link
        ref={gatilho}
        href="/categorias"
        onClick={(e) => {
          e.preventDefault();
          setAberto((v) => !v);
        }}
        aria-expanded={aberto}
        aria-controls={painelId}
        className="pilula !gap-2 whitespace-nowrap"
      >
        <Icone nome="grade" className="h-4 w-4" />
        Todas as categorias
      </Link>

      {aberto && (
        <div
          id={painelId}
          ref={caixa}
          className="absolute left-0 top-[calc(100%+0.6rem)] z-50 w-[min(94vw,62rem)] rounded-[var(--raio-card)] border border-linha bg-papel p-6 shadow-2xl"
        >
          {/* Departamento e categoria precisam se distinguir de relance: o
              departamento é rótulo em caixa alta com régua embaixo, a categoria
              é um disco com foto — a mesma forma que a home usa, e a mesma da
              página /categorias. Sem isso, os dois níveis viram uma lista só. */}
          <ul className="grid gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
            {grupos.map((g) => (
              <li key={g.slug}>
                <Link
                  href={`/categorias#${g.slug}`}
                  className="block border-b border-linha pb-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-tinta-suave hover:text-acao-forte"
                >
                  {g.nome}
                </Link>
                <ul className="mt-3 space-y-2.5">
                  {g.itens.map((i) => (
                    <li key={i.slug}>
                      <Link
                        href={`/categorias/${i.slug}`}
                        className="group flex items-center gap-3 hover:text-acao-forte"
                      >
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-linha bg-superficie p-1.5 group-hover:border-acao">
                          {i.capa ? (
                            <img src={i.capa} alt="" className="h-full w-full object-contain" />
                          ) : (
                            <Icone nome={i.slug} className="h-5 w-5 text-acao" />
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[0.95rem] leading-tight">{i.nome}</span>
                          <span className="dados block text-[0.72rem] text-tinta-suave">
                            {i.total} {i.total === 1 ? "ficha" : "fichas"}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <p className="mt-6 border-t border-linha pt-4 text-[0.85rem] text-tinta-suave">
            Em caixa alta, o departamento; com foto, a categoria.{" "}
            <Link href="/categorias" className="underline hover:text-acao-forte">
              Ver a página inteira
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}

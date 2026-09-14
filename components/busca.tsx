"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { ItemIndice } from "@/lib/indice";
import { Icone } from "@/components/icones";

/**
 * Busca do cabeçalho — grande e central, como em qualquer loja.
 *
 * Roda no navegador sobre o índice montado no build. Compara sem acento de
 * propósito: quem procura "bateria" e quem procura "batería" quer a mesma
 * coisa.
 */

const MAXIMO = 8;

function normalizar(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function Busca({ indice }: { indice: ItemIndice[] }) {
  const [termo, setTermo] = useState("");
  const [aberto, setAberto] = useState(false);
  const container = useRef<HTMLDivElement>(null);

  const resultados = useMemo(() => {
    const t = normalizar(termo.trim());
    if (t.length < 2) return [];
    return indice
      .filter((i) => normalizar(`${i.titulo} ${i.termos}`).includes(t))
      .slice(0, MAXIMO);
  }, [termo, indice]);

  function aoPerderFoco(e: React.FocusEvent<HTMLDivElement>) {
    if (!container.current?.contains(e.relatedTarget as Node)) setAberto(false);
  }

  return (
    <div
      ref={container}
      onBlur={aoPerderFoco}
      className="relative w-full"
      role="search"
    >
      <Icone
        nome="lupa"
        className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-tinta-suave"
      />
      <input
        type="search"
        value={termo}
        placeholder="Buscar produto, marca ou modelo"
        aria-label="Buscar no site"
        onChange={(e) => {
          setTermo(e.target.value);
          setAberto(true);
        }}
        onFocus={() => setAberto(true)}
        onKeyDown={(e) => e.key === "Escape" && setAberto(false)}
        className="campo-busca"
      />

      {aberto && termo.trim().length >= 2 && (
        <div className="painel absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden shadow-[var(--sombra-3)]">
          {resultados.length === 0 ? (
            <p className="px-4 py-3 text-[0.9rem] text-tinta-suave">
              Nada encontrado para “{termo.trim()}”.
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {resultados.map((r) => (
                <li key={r.url}>
                  <Link
                    href={r.url}
                    onClick={() => {
                      setAberto(false);
                      setTermo("");
                    }}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-superficie"
                  >
                    <span className="pastilha-neutra pastilha shrink-0">
                      {r.tipo}
                    </span>
                    <span className="text-[0.9rem] leading-snug">{r.titulo}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

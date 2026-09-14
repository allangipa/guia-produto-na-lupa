"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { ItemIndice } from "@/lib/indice";

/**
 * Busca do cabeçalho.
 *
 * Roda no navegador sobre o índice montado no build. Compara sem acento de
 * propósito: quem procura "bateria" e quem procura "batería" quer a mesma
 * coisa, e exigir acentuação correta num campo de busca é hostilidade
 * disfarçada de rigor.
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
    // Só fecha quando o foco sai do bloco inteiro: clicar num resultado move o
    // foco para o link, e fechar nesse instante cancelaria a navegação.
    if (!container.current?.contains(e.relatedTarget as Node)) setAberto(false);
  }

  return (
    <div
      ref={container}
      onBlur={aoPerderFoco}
      className="relative"
      role="search"
    >
      <input
        type="search"
        value={termo}
        placeholder="Buscar produto"
        aria-label="Buscar no site"
        onChange={(e) => {
          setTermo(e.target.value);
          setAberto(true);
        }}
        onFocus={() => setAberto(true)}
        onKeyDown={(e) => e.key === "Escape" && setAberto(false)}
        className="w-36 rounded border border-linha bg-papel px-2.5 py-1 text-[0.85rem] focus:w-52 sm:w-44"
      />

      {aberto && termo.trim().length >= 2 && (
        <div className="absolute right-0 top-full z-50 mt-1 w-80 max-w-[80vw] rounded-lg border border-linha bg-papel shadow-lg">
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
                    className="block px-4 py-2 hover:bg-superficie"
                  >
                    <span className="block text-[0.9rem] leading-snug">
                      {r.titulo}
                    </span>
                    <span className="mt-0.5 block text-[0.75rem] text-tinta-suave">
                      {r.tipo}
                    </span>
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

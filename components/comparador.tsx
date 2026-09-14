"use client";

import { Fragment, useMemo, useState, useEffect } from "react";
import Link from "next/link";
import type { Campo, Produto } from "@/lib/specs";
import { transparencia, valorLegivel } from "@/lib/specs";

/**
 * Comparador lado a lado.
 *
 * A seleção vive na query string (`?p=slug-a,slug-b`), não em estado interno:
 * assim o visitante consegue mandar a comparação pronta para alguém, e a mesma
 * URL sempre mostra a mesma tabela.
 *
 * O vencedor de cada linha sai de `campo.melhor` — o site não precisa saber que
 * mAh é bom e grama é ruim, ele lê isso da definição do campo.
 */

const LIMITE = 4;

function slugsDaUrl(): string[] {
  if (typeof window === "undefined") return [];
  const p = new URLSearchParams(window.location.search).get("p");
  return p ? p.split(",").filter(Boolean).slice(0, LIMITE) : [];
}

export function Comparador({
  produtos,
  campos,
  categoria,
}: {
  produtos: Produto[];
  campos: Campo[];
  categoria: string;
}) {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [pronto, setPronto] = useState(false);

  // A query string só existe no navegador: num site exportado estaticamente, a
  // página é a mesma para toda comparação e a seleção é lida depois da carga.
  useEffect(() => {
    setSlugs(slugsDaUrl());
    setPronto(true);
  }, []);

  function atualizar(novos: string[]) {
    setSlugs(novos);
    const url = novos.length
      ? `${window.location.pathname}?p=${novos.join(",")}`
      : window.location.pathname;
    window.history.replaceState(null, "", url);
  }

  const escolhidos = useMemo(
    () =>
      slugs
        .map((s) => produtos.find((p) => p.slug === s))
        .filter((p): p is Produto => Boolean(p)),
    [slugs, produtos],
  );

  const grupos = useMemo(() => {
    const mapa = new Map<string, Campo[]>();
    for (const c of campos) {
      mapa.set(c.grupo, [...(mapa.get(c.grupo) ?? []), c]);
    }
    return [...mapa.entries()];
  }, [campos]);

  /** Índices dos produtos que ganham a linha. Empate marca todos. */
  function vencedores(campo: Campo): number[] {
    if (!campo.melhor || escolhidos.length < 2) return [];
    const valores = escolhidos.map((p) => p.specs[campo.chave]);
    const numeros = valores.filter((v): v is number => typeof v === "number");
    if (numeros.length < 2) return [];
    const alvo =
      campo.melhor === "menor" ? Math.min(...numeros) : Math.max(...numeros);
    const ganhadores = valores.flatMap((v, i) => (v === alvo ? [i] : []));
    // Empate de todo mundo não é vitória de ninguém: destacar a linha inteira
    // só polui a tabela e esconde as linhas onde existe diferença de verdade.
    return ganhadores.length === valores.length ? [] : ganhadores;
  }

  if (!pronto) return null;

  return (
    <div className="mt-8">
      <div className="rounded-lg border border-linha bg-superficie p-5">
        <h2 className="font-titulo text-lg">
          Escolha até {LIMITE} para comparar
        </h2>
        <div className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {produtos.map((p) => {
            const marcado = slugs.includes(p.slug);
            return (
              <label
                key={p.slug}
                className="flex items-start gap-2 text-[0.95rem]"
              >
                <input
                  type="checkbox"
                  checked={marcado}
                  disabled={!marcado && slugs.length >= LIMITE}
                  onChange={() =>
                    atualizar(
                      marcado
                        ? slugs.filter((s) => s !== p.slug)
                        : [...slugs, p.slug],
                    )
                  }
                  className="mt-1 accent-acao"
                />
                <span>{p.nome}</span>
              </label>
            );
          })}
        </div>
      </div>

      {escolhidos.length === 0 && (
        <p className="mt-8 text-tinta-suave">
          Marque dois ou mais produtos acima. A tabela realça quem ganha em cada
          linha e mostra em cinza o que cada fabricante deixa de informar.
        </p>
      )}

      {escolhidos.length > 0 && (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-[0.95rem]">
            <thead>
              <tr className="border-b border-linha">
                <th className="w-48 py-3 text-left align-bottom font-medium text-tinta-suave">
                  &nbsp;
                </th>
                {escolhidos.map((p) => {
                  const t = transparencia(p, campos);
                  return (
                    <th key={p.slug} className="py-3 pl-4 text-left align-bottom">
                      <Link
                        href={`/produtos/${p.slug}`}
                        className="font-titulo text-base leading-snug hover:text-acao-forte"
                      >
                        {p.nome}
                      </Link>
                      <span className="mt-1 block font-dado text-[0.75rem] font-normal text-tinta-suave">
                        {t.nota}% da ficha publicada
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {grupos.map(([grupo, lista]) => (
                <Fragment key={grupo}>
                  <tr>
                    <th
                      colSpan={escolhidos.length + 1}
                      className="pt-8 pb-2 text-left font-titulo text-[0.95rem] text-tinta-suave"
                    >
                      {grupo}
                    </th>
                  </tr>
                  {lista.map((campo) => {
                    const ganha = vencedores(campo);
                    return (
                      <tr key={campo.chave} className="border-t border-linha">
                        <th className="py-3 pr-4 text-left align-top font-normal">
                          {campo.rotulo}
                          {campo.ajuda && (
                            <span className="mt-0.5 block text-[0.78rem] text-tinta-suave">
                              {campo.ajuda}
                            </span>
                          )}
                        </th>
                        {escolhidos.map((p, i) => {
                          const valor = p.specs[campo.chave];
                          const ausente = valor === null || valor === undefined;
                          return (
                            <td
                              key={p.slug}
                              className={`dados denso py-3 pl-4 align-top ${
                                ausente ? "text-ausente" : ""
                              } ${
                                // O vencedor é marcado por peso e realce, nunca
                                // pela cor de ação: verde é do CTA, e dez marcas
                                // verdes numa tabela apagam o único botão.
                                ganha.includes(i)
                                  ? "bg-realce font-semibold"
                                  : ""
                              }`}
                            >
                              {valorLegivel(valor, campo)}
                              {ganha.includes(i) && ganha.length === 1 && (
                                <span className="ml-1.5 text-[0.7rem] uppercase tracking-wide text-tinta-suave">
                                  melhor
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {escolhidos.length > 0 && (
        <p className="mt-8 max-w-[62ch] text-[0.9rem] text-tinta-suave">
          Todos os números vêm da documentação oficial de cada fabricante e são
          promessas dele, não medições nossas. Cada ficha lista as páginas
          consultadas e a data —{" "}
          <Link
            href={`/categorias/${categoria}`}
            className="underline decoration-linha underline-offset-4 hover:decoration-acao"
          >
            ver todos os produtos da categoria
          </Link>
          .
        </p>
      )}
    </div>
  );
}

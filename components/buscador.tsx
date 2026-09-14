"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Campo, Produto } from "@/lib/specs";
import { transparencia } from "@/lib/specs";
import { CardProduto } from "@/components/card-produto";

/**
 * O buscador da categoria.
 *
 * Roda inteiro no navegador, sobre o JSON que o build embute na página: é o que
 * permite filtrar e ordenar num site estático, sem servidor e sem banco.
 *
 * Os controles não são escritos à mão por categoria — saem de `campos`. Um campo
 * com `filtro: "faixa"` vira um input de mínimo (ou de máximo, quando menor é
 * melhor); um campo com `melhor` entra na ordenação. Abrir a categoria de
 * monitores depois é só declarar os campos dela.
 */

const LIMITE_COMPARACAO = 4;

type Filtros = {
  marcas: string[];
  faixas: Record<string, number | null>;
  booleanos: Record<string, boolean>;
  soFichaCompleta: boolean;
};

export function Buscador({
  produtos,
  campos,
  categoria,
}: {
  produtos: Produto[];
  campos: Campo[];
  categoria: string;
}) {
  const marcas = useMemo(
    () => [...new Set(produtos.map((p) => p.marca))].sort(),
    [produtos],
  );
  const camposFaixa = useMemo(
    () => campos.filter((c) => c.filtro === "faixa"),
    [campos],
  );
  const camposBooleanos = useMemo(
    () => campos.filter((c) => c.filtro === "booleano"),
    [campos],
  );
  const camposOrdenaveis = useMemo(
    () => campos.filter((c) => c.melhor),
    [campos],
  );

  const [filtros, setFiltros] = useState<Filtros>({
    marcas: [],
    faixas: {},
    booleanos: {},
    soFichaCompleta: false,
  });
  const [ordem, setOrdem] = useState<string>("");
  const [selecionados, setSelecionados] = useState<string[]>([]);

  const resultado = useMemo(() => {
    let lista = produtos.filter((p) => {
      if (filtros.marcas.length && !filtros.marcas.includes(p.marca))
        return false;

      for (const campo of camposFaixa) {
        const limite = filtros.faixas[campo.chave];
        if (limite === null || limite === undefined) continue;
        const valor = p.specs[campo.chave];
        // Produto que não informa o dado sai do resultado quando esse dado
        // vira critério: não dá para afirmar que ele atende o filtro.
        if (typeof valor !== "number") return false;
        if (campo.melhor === "menor" ? valor > limite : valor < limite)
          return false;
      }

      for (const campo of camposBooleanos) {
        if (!filtros.booleanos[campo.chave]) continue;
        if (p.specs[campo.chave] !== true) return false;
      }

      if (filtros.soFichaCompleta) {
        const t = transparencia(p, campos);
        if (t.ausentes.length) return false;
      }

      return true;
    });

    if (ordem) {
      const campo = campos.find((c) => c.chave === ordem);
      if (campo) {
        lista = [...lista].sort((a, b) => {
          const va = a.specs[campo.chave];
          const vb = b.specs[campo.chave];
          // Quem não informa vai para o fim da lista, sempre.
          if (typeof va !== "number") return 1;
          if (typeof vb !== "number") return -1;
          return campo.melhor === "menor" ? va - vb : vb - va;
        });
      }
    }

    return lista;
  }, [produtos, filtros, ordem, campos, camposFaixa, camposBooleanos]);

  function alternarMarca(marca: string) {
    setFiltros((f) => ({
      ...f,
      marcas: f.marcas.includes(marca)
        ? f.marcas.filter((m) => m !== marca)
        : [...f.marcas, marca],
    }));
  }

  function alternarSelecao(slug: string) {
    setSelecionados((s) =>
      s.includes(slug)
        ? s.filter((x) => x !== slug)
        : s.length >= LIMITE_COMPARACAO
          ? s
          : [...s, slug],
    );
  }

  const limpar = () =>
    setFiltros({
      marcas: [],
      faixas: {},
      booleanos: {},
      soFichaCompleta: false,
    });

  const temFiltro =
    filtros.marcas.length > 0 ||
    filtros.soFichaCompleta ||
    Object.values(filtros.faixas).some((v) => v !== null && v !== undefined) ||
    Object.values(filtros.booleanos).some(Boolean);

  return (
    <div className="mt-10">
      <div className="rounded-lg border border-linha bg-superficie p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-titulo text-lg">Filtrar</h2>
          {temFiltro && (
            <button
              type="button"
              onClick={limpar}
              className="text-[0.85rem] underline decoration-linha underline-offset-4 hover:decoration-acao"
            >
              Limpar filtros
            </button>
          )}
        </div>

        <fieldset className="mt-5">
          <legend className="text-[0.85rem] font-medium">Marca</legend>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
            {marcas.map((m) => (
              <label key={m} className="flex items-center gap-2 text-[0.95rem]">
                <input
                  type="checkbox"
                  checked={filtros.marcas.includes(m)}
                  onChange={() => alternarMarca(m)}
                  className="accent-acao"
                />
                {m}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {camposFaixa.map((campo) => (
            <label key={campo.chave} className="block">
              <span className="block text-[0.85rem] font-medium">
                {campo.melhor === "menor" ? "Máximo de" : "Mínimo de"}{" "}
                {campo.rotulo.toLowerCase()}
                {campo.unidade ? ` (${campo.unidade})` : ""}
              </span>
              <input
                type="number"
                inputMode="numeric"
                value={filtros.faixas[campo.chave] ?? ""}
                onChange={(e) =>
                  setFiltros((f) => ({
                    ...f,
                    faixas: {
                      ...f.faixas,
                      [campo.chave]:
                        e.target.value === "" ? null : Number(e.target.value),
                    },
                  }))
                }
                className="mt-1 w-full rounded border border-linha bg-papel px-3 py-2 text-[0.95rem]"
              />
            </label>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
          {camposBooleanos.map((campo) => (
            <label
              key={campo.chave}
              className="flex items-center gap-2 text-[0.95rem]"
            >
              <input
                type="checkbox"
                checked={filtros.booleanos[campo.chave] ?? false}
                onChange={(e) =>
                  setFiltros((f) => ({
                    ...f,
                    booleanos: {
                      ...f.booleanos,
                      [campo.chave]: e.target.checked,
                    },
                  }))
                }
                className="accent-acao"
              />
              {campo.rotulo}
            </label>
          ))}
          <label className="flex items-center gap-2 text-[0.95rem]">
            <input
              type="checkbox"
              checked={filtros.soFichaCompleta}
              onChange={(e) =>
                setFiltros((f) => ({
                  ...f,
                  soFichaCompleta: e.target.checked,
                }))
              }
              className="accent-acao"
            />
            Só produtos com ficha completa
          </label>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="font-dado text-[0.9rem] text-tinta-suave">
          {resultado.length} de {produtos.length}{" "}
          {produtos.length === 1 ? "produto" : "produtos"}
        </p>
        <label className="flex items-center gap-2 text-[0.9rem]">
          Ordenar por
          <select
            value={ordem}
            onChange={(e) => setOrdem(e.target.value)}
            className="rounded border border-linha bg-papel px-2 py-1"
          >
            <option value="">Padrão</option>
            {camposOrdenaveis.map((c) => (
              <option key={c.chave} value={c.chave}>
                {c.rotulo} ({c.melhor === "menor" ? "menor" : "maior"} primeiro)
              </option>
            ))}
          </select>
        </label>
      </div>

      <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {resultado.map((p) => (
          <li key={p.slug} className="flex flex-col gap-2">
            <CardProduto produto={p} campos={campos} />
            {/* Fora do card de propósito: o card inteiro é um link para a
                ficha, e uma caixa de seleção por baixo dele não receberia
                clique. */}
            <label className="flex items-center gap-2 pl-1 text-[0.85rem] text-tinta-suave">
              <input
                type="checkbox"
                checked={selecionados.includes(p.slug)}
                onChange={() => alternarSelecao(p.slug)}
                disabled={
                  !selecionados.includes(p.slug) &&
                  selecionados.length >= LIMITE_COMPARACAO
                }
                className="accent-acao"
              />
              Comparar
            </label>
          </li>
        ))}
      </ul>

      {resultado.length === 0 && (
        <p className="mt-6 text-tinta-suave">
          Nenhum produto atende a esses filtros. Vale lembrar que quem não informa
          um dado sai do resultado quando esse dado vira critério — não dá para
          afirmar que ele atende.
        </p>
      )}

      {selecionados.length > 0 && (
        <div className="sticky bottom-0 mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-linha bg-papel py-4">
          <p className="text-[0.9rem] text-tinta-suave">
            {selecionados.length}{" "}
            {selecionados.length === 1
              ? "produto selecionado"
              : "produtos selecionados"}
            {selecionados.length >= LIMITE_COMPARACAO && " (máximo)"}
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setSelecionados([])}
              className="text-[0.85rem] underline decoration-linha underline-offset-4"
            >
              Limpar
            </button>
            <Link
              href={`/comparar/${categoria}?p=${selecionados.join(",")}`}
              className="rounded bg-acao px-5 py-2.5 text-[0.95rem] font-medium text-papel hover:bg-acao-forte"
            >
              Comparar {selecionados.length === 1 ? "" : "os "}
              {selecionados.length}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

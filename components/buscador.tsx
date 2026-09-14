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

  const chip = (ativo: boolean) =>
    `rounded-full border px-3 py-1 text-[0.85rem] transition-colors ${
      ativo
        ? "border-acao bg-acao text-white"
        : "border-linha text-tinta-suave hover:border-acao hover:text-tinta"
    }`;

  return (
    /* Trilho de filtro à esquerda, resultados à direita — o arranjo de qualquer
       ferramenta de busca séria. Empilhado, o filtro empurrava os produtos para
       baixo da dobra, que é onde eles menos servem. */
    <div className="mt-10 grid gap-8 lg:grid-cols-[15.5rem_1fr] lg:items-start">
      <aside className="painel p-5 lg:sticky lg:top-32">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="titulo-ui text-lg">Filtrar</h2>
          {temFiltro && (
            <button
              type="button"
              onClick={limpar}
              className="text-[0.8rem] text-tinta-suave underline decoration-linha underline-offset-4 hover:text-tinta"
            >
              Limpar
            </button>
          )}
        </div>

        <fieldset className="mt-5 border-t border-linha pt-5">
          <legend className="float-left w-full pb-2 text-[0.72rem] uppercase tracking-[0.08em] text-tinta-suave">
            Marca
          </legend>
          <div className="clear-both flex flex-wrap gap-2">
            {marcas.map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={filtros.marcas.includes(m)}
                onClick={() => alternarMarca(m)}
                className={chip(filtros.marcas.includes(m))}
              >
                {m}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-6 border-t border-linha pt-5">
          <legend className="float-left w-full pb-3 text-[0.72rem] uppercase tracking-[0.08em] text-tinta-suave">
            Limites
          </legend>
          {/* `clear-both` nos três blocos: a legenda é flutuante para
              ocupar a linha inteira, e um contêiner flex/grid não desce
              sozinho para baixo de um float — ele se espreme ao lado, com
              largura zero, e o conteúdo vaza por cima dos cards. */}
          <div className="clear-both grid gap-3">
            {camposFaixa.map((campo) => (
              <label key={campo.chave} className="grid gap-1">
                <span className="text-[0.82rem] leading-tight text-tinta-suave">
                  {campo.melhor === "menor" ? "Máx." : "Mín."}{" "}
                  {campo.rotulo.toLowerCase()}
                  {campo.unidade ? (
                    <span className="text-tinta-suave"> ({campo.unidade})</span>
                  ) : null}
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="—"
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
                  className="dados w-full rounded-lg border border-linha bg-papel px-2.5 py-1.5 text-[0.85rem]"
                />
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-6 border-t border-linha pt-5">
          <legend className="float-left w-full pb-2 text-[0.72rem] uppercase tracking-[0.08em] text-tinta-suave">
            Só com
          </legend>
          <div className="clear-both flex flex-wrap gap-2">
            {camposBooleanos.map((campo) => (
              <button
                key={campo.chave}
                type="button"
                aria-pressed={filtros.booleanos[campo.chave] ?? false}
                onClick={() =>
                  setFiltros((f) => ({
                    ...f,
                    booleanos: {
                      ...f.booleanos,
                      [campo.chave]: !f.booleanos[campo.chave],
                    },
                  }))
                }
                className={chip(filtros.booleanos[campo.chave] ?? false)}
              >
                {campo.rotulo}
              </button>
            ))}
            <button
              type="button"
              aria-pressed={filtros.soFichaCompleta}
              onClick={() =>
                setFiltros((f) => ({
                  ...f,
                  soFichaCompleta: !f.soFichaCompleta,
                }))
              }
              className={chip(filtros.soFichaCompleta)}
            >
              Ficha completa
            </button>
          </div>
        </fieldset>
      </aside>

      <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-linha pb-4">
        <p className="text-[0.9rem] text-tinta-suave">
          <span className="dados text-tinta">{resultado.length}</span> de{" "}
          <span className="dados">{produtos.length}</span>{" "}
          {produtos.length === 1 ? "produto" : "produtos"}
        </p>
        <label className="flex items-center gap-2 text-[0.85rem] text-tinta-suave">
          Ordenar por
          <select
            value={ordem}
            onChange={(e) => setOrdem(e.target.value)}
            className="rounded-lg border border-linha bg-papel px-2.5 py-1.5 text-tinta"
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

      {/* Três colunas só a partir de xl: com o trilho do site e o de filtro
          lado a lado, em 1024 px sobram ~350 px para os cards, e três deles
          nesse espaço viram tiras de 100 px. */}
      <ul className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
        <div className="painel sticky bottom-4 z-30 mt-8 flex flex-wrap items-center justify-between gap-3 px-5 py-4 !shadow-[var(--sombra-3)]">
          <p className="text-[0.9rem] text-tinta-suave">
            <span className="dados text-tinta">{selecionados.length}</span>{" "}
            {selecionados.length === 1
              ? "produto selecionado"
              : "produtos selecionados"}
            {selecionados.length >= LIMITE_COMPARACAO && " (máximo)"}
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setSelecionados([])}
              className="text-[0.85rem] text-tinta-suave underline decoration-linha underline-offset-4 hover:text-tinta"
            >
              Limpar
            </button>
            <Link
              href={`/comparar/${categoria}?p=${selecionados.join(",")}`}
              className="botao botao-primario"
            >
              Comparar {selecionados.length === 1 ? "" : "os "}
              {selecionados.length}
            </Link>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

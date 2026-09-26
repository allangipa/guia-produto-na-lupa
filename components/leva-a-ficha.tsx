import Link from "next/link";
import { camposDa, transparencia } from "@/lib/specs";
import type { Produto } from "@/lib/specs";

/**
 * O caminho de volta da peça editorial para a ficha técnica.
 *
 * Medido em 26/09/2026: os 27 guias linkavam para a ficha das escolhas deles,
 * e **nenhum dos 44 comparativos e nenhuma das 19 análises** linkava. A peça
 * citava o número, dizia de qual fonte ele saiu, e não dava ao leitor como
 * chegar aos outros vinte campos da mesma ficha.
 *
 * Isso era pior aqui do que seria em outro site. Numa publicação que não testa
 * produto, a ficha campo a campo não é apêndice: é a matéria-prima do texto, e
 * é onde moram as divergências entre fontes e a data de cada consulta. A
 * análise argumenta a partir dela; mandar o leitor conferir é parte do método.
 *
 * O contador de campos vai no rótulo de propósito. "Ver a ficha" não diz o que
 * o leitor ganha ao clicar; "19 dos 24 campos" diz — e diz na mesma unidade
 * que o selo de transparência usa no topo da página.
 *
 * Não é CTA e não usa cor de ação: é link interno, e `acao` pertence ao botão
 * de compra. Não conta para o teto de três blocos de CTA por página.
 */
export function LevaAFicha({ produtos }: { produtos: Produto[] }) {
  const fichas = produtos.filter(Boolean);
  if (!fichas.length) return null;

  const muitas = fichas.length > 1;

  return (
    <section className="my-12">
      <h2 className="titulo-ui text-xl">
        {muitas ? "As fichas técnicas completas" : "A ficha técnica completa"}
      </h2>
      <p className="mt-1 max-w-[62ch] text-[0.9rem] text-tinta-suave">
        Os números desta página saem {muitas ? "destas fichas" : "desta ficha"},
        campo a campo, com a fonte de cada um, a data da consulta e as
        divergências entre fontes quando existem.
      </p>

      <ul className={`mt-5 grid gap-3 ${muitas ? "sm:grid-cols-2" : ""}`}>
        {fichas.map((p) => {
          const campos = camposDa(p.categoria);
          const t = campos.length ? transparencia(p, campos) : null;
          return (
            <li key={p.slug}>
              <Link
                href={`/produtos/${p.slug}/`}
                className="painel flex h-full items-baseline justify-between gap-4 p-5 transition hover:border-acao"
              >
                <span className="titulo-ui font-semibold">
                  Ficha do {p.nome}
                </span>
                {t?.total ? (
                  <span className="shrink-0 text-[0.82rem] text-tinta-suave">
                    <span className="dados">
                      {t.preenchidos} de {t.total}
                    </span>{" "}
                    campos
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

import Link from "next/link";
import {
  todosOsReviews,
  todosOsComparativos,
  todosOsGuias,
  dataLegivel,
} from "@/lib/conteudo";
import { categorias } from "@/lib/categorias";
import { todosOsProdutos, camposDa, transparencia } from "@/lib/produtos";
import { CardProduto } from "@/components/card-produto";

export default function Home() {
  const reviews = todosOsReviews();
  const comparativos = todosOsComparativos();
  const guias = todosOsGuias();
  const produtos = todosOsProdutos();

  const marcas = [...new Set(produtos.map((p) => p.marca))];

  /**
   * O número que abre a página é o achado que sustenta o site, e precisa valer
   * em qualquer categoria.
   *
   * A primeira versão contava quantos produtos não declaravam ciclos de carga —
   * que é campo de bateria externa. Quando os fones entraram, eles passaram a
   * ser contados como se escondessem um dado que não existe para eles, e o
   * rótulo ainda dizia "powerbanks" somando as duas categorias.
   */
  const media = produtos.length
    ? Math.round(
        produtos.reduce(
          (soma, p) => soma + transparencia(p, camposDa(p.categoria)).nota,
          0,
        ) / produtos.length,
      )
    : 0;

  /** Uma prateleira por categoria com produto na base, como qualquer loja faz. */
  const prateleiras = categorias
    .map((c) => ({ cat: c, itens: produtos.filter((p) => p.categoria === c.slug) }))
    .filter((p) => p.itens.length > 0);

  return (
    <div>
      {/*
        Sem herói.
        A versão anterior gastava uma tela inteira em título e parágrafo antes
        de mostrar o primeiro produto — estrutura de artigo, não de ferramenta.
        Agora a barra de contexto tem uma linha e a página abre em produto, que
        é o que o visitante veio ver.
      */}
      <section className="faixa">
        <div className="mx-auto flex max-w-[var(--largura-ferramenta)] flex-wrap items-center gap-x-8 gap-y-3 px-5 py-4">
          <p className="text-[0.95rem]">
            <strong className="font-semibold">
              Fichas técnicas oficiais, lado a lado.
            </strong>{" "}
            <span className="text-[color:var(--color-faixa-suave)]">
              Sem teste próprio, com a fonte de cada número.
            </span>
          </p>
          <dl className="ml-auto flex flex-wrap items-baseline gap-x-6 gap-y-1 text-[0.8rem]">
            <div className="flex items-baseline gap-1.5">
              <dd className="dados text-base">{produtos.length}</dd>
              <dt className="text-[color:var(--color-faixa-suave)]">produtos</dt>
            </div>
            <div className="flex items-baseline gap-1.5">
              <dd className="dados text-base">{marcas.length}</dd>
              <dt className="text-[color:var(--color-faixa-suave)]">marcas</dt>
            </div>
            <div className="flex items-baseline gap-1.5">
              <dd className="dados text-base text-atencao">{media}%</dd>
              <dt className="text-[color:var(--color-faixa-suave)]">
                da ficha é publicada, em média
              </dt>
            </div>
          </dl>
        </div>
      </section>

      <div className="mx-auto max-w-[var(--largura-ferramenta)] px-5">
      {prateleiras.map(({ cat, itens }) => (
        <section key={cat.slug} className="border-b border-linha py-8">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h2 className="titulo-ui text-xl">{cat.nome}</h2>
            <div className="flex items-center gap-5 text-[0.85rem]">
              <Link href={`/comparar/${cat.slug}`} className="text-acao-forte hover:underline">
                Comparar
              </Link>
              <Link href={`/categorias/${cat.slug}`} className="text-acao-forte hover:underline">
                Ver os {itens.length}
              </Link>
            </div>
          </div>
          {/* Prateleira: rola na horizontal no celular, vira grade densa no
              desktop. Cinco por linha em vez de três — o dobro de produto por
              tela, que é o que separa catálogo de lista de links. */}
          <ul className="mt-4 grid auto-cols-[14rem] grid-flow-col gap-3 overflow-x-auto pb-2 sm:auto-cols-auto sm:grid-flow-row sm:grid-cols-3 lg:grid-cols-5">
            {itens.map((p) => (
              <li key={p.slug}>
                <CardProduto produto={p} campos={camposDa(p.categoria)} />
              </li>
            ))}
          </ul>
        </section>
      ))}

      {guias.length > 0 && (
        <section className="border-b border-linha py-14">
          <h2 className="titulo-ui text-2xl">Guias de compra</h2>
          <p className="mt-2 max-w-[58ch] text-tinta-suave">
            Um pick por perfil de uso, não uma lista de dez produtos.
          </p>
          <ul className="mt-6 divide-y divide-linha border-t border-linha">
            {guias.map((g) => (
              <li key={g.slug}>
                <Link href={`/guias/${g.slug}`} className="group block py-6">
                  <span className="block titulo-ui text-xl leading-snug group-hover:text-acao-forte">
                    {g.titulo}
                  </span>
                  <span className="mt-1 block max-w-[62ch] text-tinta-suave">
                    {g.subtitulo}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="py-14">
        <h2 className="titulo-ui text-2xl">Análises</h2>
        <ul className="mt-6 divide-y divide-linha border-t border-linha">
          {reviews.map((r) => (
            <li key={r.slug}>
              <Link
                href={`/reviews/${r.slug}`}
                className="group grid gap-1 py-6 sm:grid-cols-[4rem_1fr]"
              >
                <span className="font-dado text-lg tabular-nums text-tinta-suave">
                  {r.nota.toFixed(1)}
                </span>
                <span>
                  <span className="block titulo-ui text-xl leading-snug group-hover:text-acao-forte">
                    {r.titulo}
                  </span>
                  <span className="mt-1 block max-w-[62ch] text-tinta-suave">
                    {r.subtitulo}
                  </span>
                  <span className="mt-2 block text-[0.82rem] text-tinta-suave">
                    Atualizada em {dataLegivel(r.atualizadoEm)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
          {reviews.length === 0 && (
            <li className="py-6 text-tinta-suave">
              Nenhuma análise publicada ainda. Crie um arquivo em
              <code className="font-dado"> content/reviews/</code>.
            </li>
          )}
        </ul>
      </section>

      <section className="border-t border-linha py-14">
        <h2 className="titulo-ui text-2xl">Categorias</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categorias.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/categorias/${c.slug}`}
                className="group flex h-full flex-col rounded-xl border border-linha bg-superficie p-5 transition-colors hover:border-acao"
              >
                <span className="titulo-ui text-lg leading-snug group-hover:text-acao-forte">
                  {c.nome}
                </span>
                <span className="mt-2 text-[0.92rem] text-tinta-suave">
                  {c.dorPrincipal}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {comparativos.length > 0 && (
        <section className="pb-14">
          <h2 className="titulo-ui text-2xl">Comparativos</h2>
          <ul className="mt-6 divide-y divide-linha border-t border-linha">
            {comparativos.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/comparativos/${c.slug}`}
                  className="group block py-6"
                >
                  <span className="block titulo-ui text-xl leading-snug group-hover:text-acao-forte">
                    {c.titulo}
                  </span>
                  <span className="mt-1 block max-w-[62ch] text-tinta-suave">
                    {c.subtitulo}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      </div>
    </div>
  );
}

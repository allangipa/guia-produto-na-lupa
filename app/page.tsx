import Link from "next/link";
import {
  todosOsReviews,
  todosOsComparativos,
  todosOsGuias,
  dataLegivel,
} from "@/lib/conteudo";
import { categorias } from "@/lib/categorias";
import { todosOsProdutos, camposDa } from "@/lib/produtos";
import { CardProduto } from "@/components/card-produto";

export default function Home() {
  const reviews = todosOsReviews();
  const comparativos = todosOsComparativos();
  const guias = todosOsGuias();
  const produtos = todosOsProdutos();

  // O número que abre a página não é enfeite: é o achado que sustenta o site.
  const semCiclos = produtos.filter(
    (p) => p.specs.ciclosCarga === null || p.specs.ciclosCarga === undefined,
  ).length;
  const marcas = [...new Set(produtos.map((p) => p.marca))];

  return (
    <div>
      {/* Faixa escura de largura total. É o que separa uma página com desenho
          de um documento: a home precisa ter um momento, não só parágrafos. */}
      <section className="faixa">
        <div className="mx-auto grid max-w-[var(--largura-ferramenta)] items-center gap-12 px-5 py-16 lg:grid-cols-[1.15fr_1fr] lg:py-24">
          <div>
            <p className="pastilha !border-[color:var(--color-faixa-suave)] !text-[color:var(--color-faixa-suave)]">
              Pesquisa sem teste próprio
            </p>
            <h1 className="mt-5 max-w-[17ch] font-titulo text-[2.6rem] leading-[1.05] tracking-tight sm:text-[3.4rem]">
              Nenhuma análise aqui termina em “compre”.
            </h1>
            <p className="mt-6 max-w-[54ch] text-lg text-[color:var(--color-faixa-suave)]">
              Colocamos lado a lado o que cada fabricante declara — e publicamos
              o que ele deixa de declarar. Cada número tem a fonte oficial no fim
              da página.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3">
              <Link
                href="/comparar/energia"
                className="botao rounded-lg bg-acao px-6 py-3 font-medium text-white shadow-[var(--sombra-2)] transition-colors hover:bg-acao-forte"
              >
                Comparar produtos
              </Link>
              <Link
                href="/metodologia"
                className="underline decoration-[color:var(--color-faixa-suave)] underline-offset-4"
              >
                Como as notas são dadas
              </Link>
            </div>
          </div>

          {/* O herói mostra a ferramenta funcionando, com números reais da base,
              em vez de só prometer que ela existe. */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-[var(--sombra-3)] backdrop-blur">
            <p className="text-[0.72rem] uppercase tracking-[0.12em] text-[color:var(--color-faixa-suave)]">
              O que a base já mostra
            </p>
            <dl className="mt-5 grid gap-5">
              <div className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-4">
                <dt className="text-[color:var(--color-faixa-suave)]">
                  Powerbanks com ficha oficial
                </dt>
                <dd className="dados text-2xl">{produtos.length}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-4">
                <dt className="text-[color:var(--color-faixa-suave)]">
                  Fabricantes comparados
                </dt>
                <dd className="dados text-2xl">{marcas.length}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="max-w-[24ch] text-[color:var(--color-faixa-suave)]">
                  Não declaram quantos ciclos a bateria aguenta
                </dt>
                <dd className="dados text-2xl text-atencao">
                  {semCiclos} de {produtos.length}
                </dd>
              </div>
            </dl>
            <p className="mt-6 text-[0.85rem] leading-relaxed text-[color:var(--color-faixa-suave)]">
              Quando um campo falta na ficha de todos os concorrentes, deixa de
              ser descuido de uma marca e vira característica do mercado.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[var(--largura-ferramenta)] px-5">
      {produtos.length > 0 && (
        <section className="border-b border-linha py-16">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <h2 className="font-titulo text-2xl">Fichas técnicas comparáveis</h2>
            <Link
              href="/categorias/energia"
              className="text-acao-forte underline underline-offset-4"
            >
              Filtrar todos os produtos
            </Link>
          </div>
          <p className="mt-2 max-w-[58ch] text-tinta-suave">
            Cada ficha vem da documentação oficial do fabricante, normalizada na
            mesma unidade. A porcentagem é quanto dessa ficha ele realmente
            publica — o resto fica marcado como não informado.
          </p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {produtos.map((p) => (
              <li key={p.slug}>
                <CardProduto produto={p} campos={camposDa(p.categoria)} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {guias.length > 0 && (
        <section className="border-b border-linha py-14">
          <h2 className="font-titulo text-2xl">Guias de compra</h2>
          <p className="mt-2 max-w-[58ch] text-tinta-suave">
            Um pick por perfil de uso, não uma lista de dez produtos.
          </p>
          <ul className="mt-6 divide-y divide-linha border-t border-linha">
            {guias.map((g) => (
              <li key={g.slug}>
                <Link href={`/guias/${g.slug}`} className="group block py-6">
                  <span className="block font-titulo text-xl leading-snug group-hover:text-acao-forte">
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
        <h2 className="font-titulo text-2xl">Análises</h2>
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
                  <span className="block font-titulo text-xl leading-snug group-hover:text-acao-forte">
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
        <h2 className="font-titulo text-2xl">Categorias</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categorias.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/categorias/${c.slug}`}
                className="group flex h-full flex-col rounded-xl border border-linha bg-superficie p-5 transition-colors hover:border-acao"
              >
                <span className="font-titulo text-lg leading-snug group-hover:text-acao-forte">
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
          <h2 className="font-titulo text-2xl">Comparativos</h2>
          <ul className="mt-6 divide-y divide-linha border-t border-linha">
            {comparativos.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/comparativos/${c.slug}`}
                  className="group block py-6"
                >
                  <span className="block font-titulo text-xl leading-snug group-hover:text-acao-forte">
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

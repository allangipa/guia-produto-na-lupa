import Link from "next/link";
import {
  todosOsReviews,
  todosOsComparativos,
  todosOsGuias,
  dataLegivel,
} from "@/lib/conteudo";
import { categorias } from "@/lib/categorias";
import { todosOsProdutos, camposDa, transparencia } from "@/lib/produtos";

export default function Home() {
  const reviews = todosOsReviews();
  const comparativos = todosOsComparativos();
  const guias = todosOsGuias();
  const produtos = todosOsProdutos();

  return (
    <div className="mx-auto max-w-[var(--largura-ferramenta)] px-5">
      <section className="grid items-center gap-10 border-b border-linha py-14 sm:grid-cols-[1fr_16rem] sm:py-20">
        <div>
          <h1 className="max-w-[16ch] font-titulo text-4xl leading-[1.08] tracking-tight sm:text-5xl">
            Nenhuma análise aqui termina em “compre”.
          </h1>
          <p className="mt-5 max-w-[58ch] text-lg text-tinta-suave">
            Colocamos lado a lado o que cada fabricante declara — e publicamos o
            que ele deixa de declarar. Nenhum produto daqui foi testado por nós,
            e cada número tem a fonte oficial no fim da página.
          </p>
          <p className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link
              href="/comparar/energia"
              className="rounded bg-acao px-5 py-2.5 font-medium text-papel hover:bg-acao-forte"
            >
              Comparar produtos
            </Link>
            <Link
              href="/metodologia"
              className="text-acao-forte underline underline-offset-4"
            >
              Como as notas são dadas
            </Link>
          </p>
        </div>
        <div className="hidden justify-self-end sm:block">
          <img
            src="/marca/simbolo.svg"
            alt=""
            aria-hidden
            width={260}
            height={260}
            className="so-claro w-56"
          />
          <img
            src="/marca/simbolo-fundo-escuro.svg"
            alt=""
            aria-hidden
            width={260}
            height={260}
            className="so-escuro w-56"
          />
        </div>
      </section>

      {produtos.length > 0 && (
        <section className="border-b border-linha py-14">
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
            {produtos.map((p) => {
              const t = transparencia(p, camposDa(p.categoria));
              return (
                <li key={p.slug}>
                  <Link
                    href={`/produtos/${p.slug}`}
                    className="group flex h-full flex-col rounded-xl border border-linha p-5 transition-colors hover:border-acao"
                  >
                    <span className="text-[0.8rem] text-tinta-suave">
                      {p.marca}
                    </span>
                    <span className="mt-1 font-titulo text-lg leading-snug group-hover:text-acao-forte">
                      {p.nome}
                    </span>
                    <span className="mt-auto flex items-baseline gap-2 pt-4">
                      <span className="dados text-xl">{t.nota}%</span>
                      <span className="text-[0.8rem] text-tinta-suave">
                        da ficha publicada
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
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
  );
}

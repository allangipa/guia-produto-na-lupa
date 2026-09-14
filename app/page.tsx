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
import { Icone } from "@/components/icones";

export default function Home() {
  const reviews = todosOsReviews();
  const comparativos = todosOsComparativos();
  const guias = todosOsGuias();
  const produtos = todosOsProdutos();

  const marcas = [...new Set(produtos.map((p) => p.marca))];
  const media = produtos.length
    ? Math.round(
        produtos.reduce(
          (soma, p) => soma + transparencia(p, camposDa(p.categoria)).nota,
          0,
        ) / produtos.length,
      )
    : 0;

  const prateleiras = categorias
    .map((c) => ({ cat: c, itens: produtos.filter((p) => p.categoria === c.slug) }))
    .filter((p) => p.itens.length > 0);

  const editorial = [
    ...guias.map((g) => ({ tipo: "Guia", href: `/guias/${g.slug}`, titulo: g.titulo, sub: g.subtitulo, data: g.atualizadoEm })),
    ...comparativos.map((c) => ({ tipo: "Comparativo", href: `/comparativos/${c.slug}`, titulo: c.titulo, sub: c.subtitulo, data: c.atualizadoEm })),
    ...reviews.map((r) => ({ tipo: "Análise", href: `/reviews/${r.slug}`, titulo: r.titulo, sub: r.subtitulo, data: r.atualizadoEm })),
  ].sort((a, b) => b.data.localeCompare(a.data));

  return (
    <div className="mx-auto max-w-[var(--largura-ferramenta)] px-5 pb-8">
      {/*
        Banner informativo, não herói: cabe numa faixa curta, com a tese do
        site em uma linha e os números da base ao lado. A página abre em
        produto logo abaixo, como qualquer loja.
      */}
      <section className="banner mt-5 grid gap-6 p-6 md:grid-cols-[1.3fr_1fr] md:items-center md:p-8">
        <div>
          <span className="pastilha">Pesquisa sem teste próprio</span>
          <h1 className="mt-3 max-w-[22ch] font-titulo text-[1.9rem] leading-[1.1] tracking-tight sm:text-[2.4rem]">
            Fichas técnicas oficiais, lado a lado — com o que o fabricante deixa
            de informar.
          </h1>
          <p className="mt-3 max-w-[54ch] text-[0.95rem] text-tinta-suave">
            Cada número tem a fonte declarada. O que falta fica marcado, campo
            por campo, e vira a nota de transparência de cada produto.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={`/comparar/${prateleiras[0]?.cat.slug ?? "audio"}`}
              className="botao botao-primario"
            >
              <Icone nome="comparar" className="h-4 w-4" />
              Comparar produtos
            </Link>
            <Link href="/metodologia" className="botao botao-secundario">
              Como avaliamos
            </Link>
          </div>
        </div>

        <dl className="grid grid-cols-3 gap-3">
          {[
            { v: produtos.length, r: "produtos com ficha oficial" },
            { v: marcas.length, r: "fabricantes comparados" },
            { v: `${media}%`, r: "da ficha é publicada, em média", cor: "text-atencao" },
          ].map((s) => (
            <div key={s.r} className="rounded-xl border border-linha bg-papel/70 p-3.5">
              <dd className={`dados text-2xl font-semibold leading-none ${s.cor ?? ""}`}>
                {s.v}
              </dd>
              <dt className="mt-1.5 text-[0.75rem] leading-snug text-tinta-suave">
                {s.r}
              </dt>
            </div>
          ))}
        </dl>
      </section>

      {prateleiras.map(({ cat, itens }) => (
        <section key={cat.slug} className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <div>
              <h2 className="titulo-ui text-[1.35rem]">{cat.nome}</h2>
              <p className="mt-0.5 text-[0.85rem] text-tinta-suave">{cat.dorPrincipal}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/comparar/${cat.slug}`} className="pilula">
                <Icone nome="comparar" className="h-3.5 w-3.5" />
                Comparar
              </Link>
              <Link href={`/categorias/${cat.slug}`} className="pilula pilula-ativa">
                Ver os {itens.length}
                <Icone nome="seta" className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
          <ul className="rolo mt-4 grid auto-cols-[14.5rem] grid-flow-col gap-3.5 overflow-x-auto pb-3 sm:auto-cols-auto sm:grid-flow-row sm:grid-cols-3 lg:grid-cols-5">
            {itens.map((p) => (
              <li key={p.slug}>
                <CardProduto produto={p} campos={camposDa(p.categoria)} />
              </li>
            ))}
          </ul>
        </section>
      ))}

      {editorial.length > 0 && (
        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <h2 className="titulo-ui text-[1.35rem]">Guias e análises</h2>
            <Link href="/guias" className="pilula">
              Ver tudo <Icone nome="seta" className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ul className="mt-4 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {editorial.map((e) => (
              <li key={e.href}>
                <Link
                  href={e.href}
                  className="cartao group flex h-full flex-col p-5"
                >
                  <span className="pastilha pastilha-neutra self-start">{e.tipo}</span>
                  <span className="mt-3 line-clamp-2 titulo-ui text-[1.05rem] leading-snug group-hover:text-acao-forte">
                    {e.titulo}
                  </span>
                  <span className="mt-2 line-clamp-2 text-[0.88rem] text-tinta-suave">
                    {e.sub}
                  </span>
                  <span className="mt-auto pt-4 text-[0.75rem] text-tinta-suave">
                    Atualizado em {dataLegivel(e.data)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-12">
        <h2 className="titulo-ui text-[1.35rem]">Categorias</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categorias.map((c) => {
            const n = produtos.filter((p) => p.categoria === c.slug).length;
            return (
              <li key={c.slug}>
                <Link
                  href={`/categorias/${c.slug}`}
                  className={`cartao flex h-full items-start justify-between gap-3 p-4 ${n ? "" : "opacity-60"}`}
                >
                  <span>
                    <span className="block titulo-ui text-[0.98rem]">{c.nome}</span>
                    <span className="mt-1 block text-[0.8rem] text-tinta-suave">
                      {n ? `${n} ${n === 1 ? "produto" : "produtos"}` : "Em breve"}
                    </span>
                  </span>
                  <Icone nome="seta" className="mt-1 h-4 w-4 shrink-0 text-tinta-suave" />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

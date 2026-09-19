import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import { guia, todosOsGuias, dataLegivel, fotoDaBase } from "@/lib/conteudo";
import { ogImagem } from "@/lib/site";
import { categoria as buscarCategoria } from "@/lib/categorias";
import { componentesMdx } from "@/components/mdx";
import { Divulgacao } from "@/components/divulgacao";
import { Lacunas } from "@/components/pros-contras";
import { LojaCta } from "@/components/loja-cta";
import { Fontes } from "@/components/fontes";
import { JsonLd, schemaBreadcrumb } from "@/lib/schema";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return todosOsGuias().map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const g = guia(slug);
  if (!g) return {};
  return {
    title: g.titulo,
    description: g.subtitulo,
    alternates: { canonical: `/guias/${g.slug}` },
    openGraph: {
      title: g.titulo,
      description: g.subtitulo,
      ...ogImagem(
        fotoDaBase(
          g.escolhas.map((e) => e.lojas),
          g.escolhas.map((e) => e.produto),
        ),
      ),
    },
  };
}

export default async function PaginaGuia({ params }: Params) {
  const { slug } = await params;
  const g = guia(slug);
  if (!g) notFound();
  const cat = buscarCategoria(g.categoria);

  const { content } = await compileMDX({
    source: g.corpo,
    components: componentesMdx,
  });

  return (
    <article className="mx-auto max-w-[var(--largura-prosa)] px-5 py-12">
      <JsonLd
        data={schemaBreadcrumb([
          { nome: "Início", url: "/" },
          ...(cat ? [{ nome: cat.nome, url: `/categorias/${cat.slug}` }] : []),
          { nome: g.titulo, url: `/guias/${g.slug}` },
        ])}
      />
      <header>
        <Divulgacao atualizadoEm={dataLegivel(g.atualizadoEm)} />
        <h1 className="mt-3 font-titulo text-3xl leading-[1.12] tracking-tight sm:text-4xl">
          {g.titulo}
        </h1>
        <p className="mt-4 max-w-[62ch] text-lg text-tinta-suave">{g.subtitulo}</p>
      </header>

      <section className="my-10 border-y border-linha py-8">
        <h2 className="font-titulo text-xl">A escolha certa depende de quem você é</h2>
        <ol className="mt-5 space-y-6">
          {g.escolhas.map((e) => (
            <li key={e.perfil} className="grid gap-1 sm:grid-cols-[14rem_1fr]">
              <p className="font-medium">{e.perfil}</p>
              <div>
                <p className="font-titulo text-lg leading-snug">
                  {e.reviewSlug ? (
                    <Link
                      href={`/reviews/${e.reviewSlug}`}
                      className="underline decoration-linha underline-offset-4 hover:decoration-acao"
                    >
                      {e.produto}
                    </Link>
                  ) : (
                    e.produto
                  )}
                </p>
                <p className="mt-1 max-w-[56ch] text-tinta-suave">{e.porque}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="prosa">{content}</div>

      <Lacunas itens={g.lacunas} />

      <section className="mt-12">
        <h2 className="font-titulo text-xl">Onde comprar cada um</h2>
        {g.escolhas.map((e) => (
          <div key={e.produto} className="mt-6">
            <p className="font-medium">{e.produto}</p>
            <LojaCta lojas={e.lojas} produto={e.produto} posicao="fechamento" />
          </div>
        ))}
      </section>

      <Fontes itens={g.fontes} />
    </article>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import {
  comparativo,
  todosOsComparativos,
  dataLegivel,
} from "@/lib/conteudo";
import { componentesMdx } from "@/components/mdx";
import { Divulgacao } from "@/components/divulgacao";
import { Lacunas } from "@/components/pros-contras";
import { LojaCta } from "@/components/loja-cta";
import { TabelaComparativa } from "@/components/tabela-comparativa";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return todosOsComparativos().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const c = comparativo(slug);
  if (!c) return {};
  return {
    title: c.titulo,
    description: c.subtitulo,
    alternates: { canonical: `/comparativos/${c.slug}` },
  };
}

export default async function PaginaComparativo({ params }: Params) {
  const { slug } = await params;
  const c = comparativo(slug);
  if (!c) notFound();

  const { content } = await compileMDX({
    source: c.corpo,
    components: componentesMdx,
  });

  return (
    <article className="mx-auto max-w-3xl px-5 py-12">
      <header>
        <Divulgacao atualizadoEm={dataLegivel(c.atualizadoEm)} />
        <h1 className="mt-3 font-titulo text-3xl leading-[1.12] tracking-tight sm:text-4xl">
          {c.titulo}
        </h1>
        <p className="mt-4 max-w-[62ch] text-lg text-tinta-suave">
          {c.subtitulo}
        </p>
      </header>

      <section className="my-10 border-y border-linha py-8">
        <h2 className="font-titulo text-xl">Quem ganha, e para quem</h2>
        <dl className="mt-4 space-y-4">
          {c.vencedores.map((v) => (
            <div key={v.perfil}>
              <dt className="font-medium">
                {v.perfil}: {v.produto}
              </dt>
              <dd className="max-w-[62ch] text-tinta-suave">{v.porque}</dd>
            </div>
          ))}
        </dl>
      </section>

      <TabelaComparativa produtos={c.concorrentes} linhas={c.linhas} />

      <div className="prosa">{content}</div>

      <Lacunas itens={c.lacunas} />

      {c.concorrentes.map((p) => (
        <div key={p.nome}>
          <h2 className="mt-10 font-titulo text-xl">{p.nome}</h2>
          <p className="mt-1 max-w-[62ch] text-tinta-suave">{p.linhaResumo}</p>
          <LojaCta lojas={p.lojas} produto={p.nome} posicao="fechamento" />
        </div>
      ))}
    </article>
  );
}

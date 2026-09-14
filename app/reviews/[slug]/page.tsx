import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import { review, todosOsReviews, dataLegivel } from "@/lib/conteudo";
import { site } from "@/lib/site";
import { componentesMdx } from "@/components/mdx";
import { Divulgacao } from "@/components/divulgacao";
import { VereditoRapido, EscalaCriterios } from "@/components/veredito";
import { ProsContras, Lacunas } from "@/components/pros-contras";
import { LojaCta } from "@/components/loja-cta";
import { FotoProduto } from "@/components/foto-produto";
import { Fontes } from "@/components/fontes";
import { JsonLd, schemaReview, schemaBreadcrumb } from "@/lib/schema";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return todosOsReviews().map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const r = review(slug);
  if (!r) return {};
  return {
    title: r.titulo,
    description: r.subtitulo,
    alternates: { canonical: `/reviews/${r.slug}` },
    openGraph: {
      title: r.titulo,
      description: r.subtitulo,
      type: "article",
      publishedTime: r.publicadoEm,
      modifiedTime: r.atualizadoEm,
    },
  };
}

export default async function PaginaReview({ params }: Params) {
  const { slug } = await params;
  const r = review(slug);
  if (!r) notFound();

  const { content } = await compileMDX({
    source: r.corpo,
    components: componentesMdx,
  });

  return (
    <article className="mx-auto max-w-3xl px-5 py-12">
      <JsonLd data={schemaReview(r)} />
      <JsonLd
        data={schemaBreadcrumb([
          { nome: "Início", url: "/" },
          { nome: "Análises", url: "/reviews" },
          { nome: r.produto.nome, url: `/reviews/${r.slug}` },
        ])}
      />

      <header>
        <Divulgacao atualizadoEm={dataLegivel(r.atualizadoEm)} />
        <h1 className="mt-3 font-titulo text-3xl leading-[1.12] tracking-tight sm:text-4xl">
          {r.titulo}
        </h1>
        <p className="mt-4 max-w-[62ch] text-lg text-tinta-suave">
          {r.subtitulo}
        </p>
      </header>

      {r.produto.imagem && (
        <FotoProduto imagem={r.produto.imagem} prioridade />
      )}

      <VereditoRapido nota={r.nota} para={r.para} naoPara={r.naoPara} />

      <LojaCta
        lojas={r.produto.lojas}
        produto={r.produto.nome}
        posicao="veredito"
      />

      <div className="prosa">{content}</div>

      <section className="my-12">
        <h2 className="font-titulo text-xl">Nota por critério</h2>
        <EscalaCriterios criterios={r.criterios} />
      </section>

      <ProsContras pros={r.pros} contras={r.contras} />

      <LojaCta
        lojas={r.produto.lojas}
        produto={r.produto.nome}
        posicao="prosContras"
      />

      <Lacunas itens={r.lacunas} />

      <Fontes itens={r.fontes} />

      <footer className="mt-14 border-t border-linha pt-8 text-[0.95rem] text-tinta-suave">
        <p className="max-w-[62ch]">
          Publicada em {dataLegivel(r.publicadoEm)} e revisada em{" "}
          {dataLegivel(r.atualizadoEm)}. Ficha técnica muda sem aviso: se algo
          aqui não bate mais com a página oficial, ou se você usa esse produto e
          a sua experiência foi outra, escreva para{" "}
          <a
            href={`mailto:${site.editor.contato}`}
            className="underline decoration-linha underline-offset-4 hover:decoration-acao"
          >
            {site.editor.contato}
          </a>
          . A correção entra com crédito.
        </p>
      </footer>
    </article>
  );
}

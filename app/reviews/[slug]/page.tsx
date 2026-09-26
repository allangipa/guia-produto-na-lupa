import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import {
  review,
  todosOsReviews,
  dataLegivel,
  fotoDaBase,
  produtoDaBase,
} from "@/lib/conteudo";
import { tituloSeo, ogImagem, site } from "@/lib/site";
import { componentesMdx, opcoesMdx } from "@/components/mdx";
import { Divulgacao } from "@/components/divulgacao";
import { VereditoRapido, EscalaCriterios } from "@/components/veredito";
import { ProsContras, Lacunas } from "@/components/pros-contras";
import { LojaCta } from "@/components/loja-cta";
import { FotoProduto } from "@/components/foto-produto";
import { SeloTransparencia } from "@/components/selo-transparencia";
import { LevaAFicha } from "@/components/leva-a-ficha";
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
    title: tituloSeo(r.tituloCurto ?? r.titulo),
    description: r.subtitulo,
    alternates: { canonical: `/reviews/${r.slug}` },
    openGraph: {
      title: r.titulo,
      description: r.subtitulo,
      type: "article",
      publishedTime: r.publicadoEm,
      modifiedTime: r.atualizadoEm,
      ...ogImagem(r.produto.imagem ?? fotoDaBase([r.produto.lojas], [r.produto.nome])),
    },
  };
}

export default async function PaginaReview({ params }: Params) {
  const { slug } = await params;
  const r = review(slug);
  if (!r) notFound();

  // A mesma ficha alimenta o selo do topo e o link do fim da página.
  const ficha = produtoDaBase([r.produto.lojas], [r.produto.nome]);

  const { content } = await compileMDX({
    source: r.corpo,
    components: componentesMdx,
    options: opcoesMdx,
  });

  return (
    <article className="mx-auto max-w-[var(--largura-prosa)] px-5 py-12">
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

      {/* A foto vem da base quando o frontmatter não traz — que era o caso dos
          18 reviews até 26/09/2026. O mesmo casamento já alimentava a imagem de
          compartilhamento desta página; só a página em si ficava sem. */}
      {(() => {
        const foto =
          r.produto.imagem ?? fotoDaBase([r.produto.lojas], [r.produto.nome]);
        return foto ? <FotoProduto imagem={foto} prioridade /> : null;
      })()}

      {/* O selo antes do veredito: quem lê "não informa" no texto precisa saber
          se aquilo é deslize ou o padrão da ficha inteira. */}
      {ficha ? (
        <div className="mt-8">
          <SeloTransparencia produto={ficha} />
        </div>
      ) : null}

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

      <LevaAFicha produtos={ficha ? [ficha] : []} />

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

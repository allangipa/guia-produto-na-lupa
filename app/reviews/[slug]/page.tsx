import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
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
import { LevaAFicha } from "@/components/leva-a-ficha";
import { Fontes } from "@/components/fontes";
import { JsonLd, schemaReview, schemaBreadcrumb } from "@/lib/schema";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return todosOsReviews().map((r) => ({ slug: r.slug }));
}

/**
 * O cartão de compartilhamento da análise, gerado por `npm run cartoes` em
 * `public/og/reviews/<slug>.png` (1200×630): título, três números da ficha e
 * a foto oficial sobre o fundo escuro do site. Quando o arquivo não existe —
 * análise nova antes de rodar o script — a página cai para a foto do produto,
 * que era o que já ia no og:image.
 */
function cartaoOg(slug: string) {
  const relativo = `/og/reviews/${slug}.png`;
  return fs.existsSync(path.join(process.cwd(), "public", relativo))
    ? relativo
    : undefined;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const r = review(slug);
  if (!r) return {};
  const foto = r.produto.imagem ?? fotoDaBase([r.produto.lojas], [r.produto.nome]);
  const cartao = cartaoOg(r.slug);
  return {
    title: tituloSeo(r.tituloCurto ?? r.titulo),
    description: r.descricao ?? r.subtitulo,
    alternates: { canonical: `/reviews/${r.slug}` },
    openGraph: {
      title: r.titulo,
      description: r.descricao ?? r.subtitulo,
      type: "article",
      publishedTime: r.publicadoEm,
      modifiedTime: r.atualizadoEm,
      ...(cartao
        ? {
            images: [
              { url: cartao, width: 1200, height: 630, alt: r.tituloCurto ?? r.titulo },
            ],
          }
        : ogImagem(foto)),
    },
    twitter: { card: "summary_large_image" },
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
        {/* Menor no celular, de propósito: com o título em 3xl e o subtítulo em
            lg, o card do veredito começava a 757 px numa tela de 812 (medido
            em 17/10/2026) — a nota ficava abaixo da dobra justamente onde a
            maioria lê. No desktop os tamanhos não mudam. */}
        <h1 className="mt-3 font-titulo text-[1.65rem] leading-[1.15] tracking-tight sm:text-4xl sm:leading-[1.12]">
          {r.titulo}
        </h1>
      </header>

      {/* No celular o subtítulo desce para depois do card: título, veredito,
          subtítulo. No desktop a ordem é a de sempre (subtítulo, card). */}
      <div className="flex flex-col">
        <p className="order-2 mt-6 max-w-[62ch] text-base text-tinta-suave sm:order-1 sm:mt-4 sm:text-lg">
          {r.subtitulo}
        </p>

      {/* O veredito na primeira tela, desde 17/10/2026: nota, selo, "compre
          se", "não compre se" e a foto ao lado, num card só. Até então a foto
          ocupava a largura inteira e a nota ficava abaixo da dobra. A foto vem
          da base quando o frontmatter não traz — o mesmo casamento que alimenta
          o cartão de compartilhamento. */}
      <VereditoRapido
        nota={r.nota}
        para={r.para}
        naoPara={r.naoPara}
        foto={r.produto.imagem ?? fotoDaBase([r.produto.lojas], [r.produto.nome])}
        ficha={ficha ?? undefined}
        cta={
          <LojaCta
            lojas={r.produto.lojas}
            produto={r.produto.nome}
            posicao="veredito"
          />
        }
      />
      </div>

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

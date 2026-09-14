import { site } from "./site";
import type { Review } from "./conteudo";

/**
 * Gera Product + Review com a NOTA EDITORIAL (reviewRating).
 *
 * Não geramos aggregateRating de propósito: agregado exige avaliações reais
 * de terceiros coletadas no site. Inventar ratingCount para forçar as estrelinhas
 * no Google é o caminho mais curto para uma ação manual. Quando houver um sistema
 * real de notas de leitores, aggregateRating entra aqui — e só então.
 */
export function schemaReview(r: Review) {
  const ofertas = [
    r.produto.lojas.amazon && "Amazon",
    r.produto.lojas.mercadolivre && "Mercado Livre",
  ].filter(Boolean) as string[];

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: r.produto.nome,
    brand: { "@type": "Brand", name: r.produto.marca },
    description: r.produto.linhaResumo,
    // O Google não exibe rich result de produto sem imagem. Sai do ar junto
    // com a foto quando a análise ainda não tem uma licenciada.
    ...(r.produto.imagem
      ? { image: `${site.url}${r.produto.imagem.src}` }
      : {}),
    ...(ofertas.length
      ? {
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: "BRL",
            availability: "https://schema.org/InStock",
            offerCount: ofertas.length,
            seller: ofertas.map((nome) => ({
              "@type": "Organization",
              name: nome,
            })),
          },
        }
      : {}),
    review: {
      "@type": "Review",
      name: r.titulo,
      datePublished: r.publicadoEm,
      dateModified: r.atualizadoEm,
      // Autoria é da publicação, não de uma pessoa: ninguém aqui teve o produto
      // na mão, e assinar com nome próprio sugeriria experiência que não houve.
      author: { "@type": "Organization", name: site.editor.nome, url: site.url },
      publisher: { "@type": "Organization", name: site.nome, url: site.url },
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.nota,
        bestRating: 10,
        worstRating: 0,
      },
      // As páginas oficiais que sustentam a análise, declaradas ao buscador.
      ...(r.fontes?.length
        ? {
            citation: r.fontes.map((f) => ({
              "@type": "WebPage",
              name: f.titulo,
              url: f.url,
            })),
          }
        : {}),
      positiveNotes: {
        "@type": "ItemList",
        itemListElement: r.pros.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: p,
        })),
      },
      negativeNotes: {
        "@type": "ItemList",
        itemListElement: r.contras.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c,
        })),
      },
    },
  };
}

export function schemaBreadcrumb(trilha: { nome: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trilha.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.nome,
      item: `${site.url}${t.url}`,
    })),
  };
}

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

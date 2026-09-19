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

/**
 * Comparativo: ItemList dos produtos comparados, dentro de um Article.
 *
 * Não é `Product`: a página não é sobre um produto, é sobre a comparação de
 * dois — declarar Product aqui faria o buscador escolher um dos dois como
 * assunto, e nenhum dos dois é.
 *
 * Vale a mesma regra do `schemaReview`: nada de `aggregateRating`. Agregado
 * exige avaliação real de terceiro coletada no site, e forçar estrelinha é o
 * caminho curto para uma ação manual.
 */
export function schemaComparativo(c: {
  slug: string;
  titulo: string;
  subtitulo: string;
  publicadoEm: string;
  atualizadoEm: string;
  concorrentes: { nome: string; marca: string; linhaResumo: string; imagem?: { src: string } }[];
  fontes?: { titulo: string; url: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: c.titulo,
    description: c.subtitulo,
    datePublished: c.publicadoEm,
    dateModified: c.atualizadoEm,
    mainEntityOfPage: `${site.url}/comparativos/${c.slug}/`,
    // Autoria da publicação, não de pessoa: ninguém aqui teve o produto na mão.
    author: { "@type": "Organization", name: site.editor.nome, url: site.url },
    publisher: { "@type": "Organization", name: site.nome, url: site.url },
    about: {
      "@type": "ItemList",
      numberOfItems: c.concorrentes.length,
      itemListElement: c.concorrentes.map((x, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Product",
          name: x.nome,
          brand: { "@type": "Brand", name: x.marca },
          description: x.linhaResumo,
          ...(x.imagem ? { image: `${site.url}${x.imagem.src}` } : {}),
        },
      })),
    },
    ...(c.fontes?.length
      ? {
          citation: c.fontes.map((f) => ({
            "@type": "WebPage",
            name: f.titulo,
            url: f.url,
          })),
        }
      : {}),
  };
}

/**
 * Pagina de categoria: CollectionPage com a ItemList dos produtos dentro.
 *
 * `CollectionPage`, e nao `ItemList` solto, porque a pagina e mais do que a
 * lista — tem a descricao da categoria, a pergunta que a guia e, quando existe,
 * a nota de por que ela parou no numero em que parou. A lista e o conteudo
 * principal, e e isso que `mainEntity` quer dizer.
 *
 * Os produtos entram com nome, marca, URL e foto — nada de preco, que o site
 * ainda nao publica, e nada de `aggregateRating`, pela mesma razao de sempre:
 * agregado exige avaliacao real de terceiro coletada aqui.
 */
export function schemaCategoria(
  cat: { slug: string; nome: string; descricao: string },
  produtos: {
    slug: string;
    nome: string;
    marca: string;
    imagem?: { src: string };
  }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: cat.nome,
    description: cat.descricao,
    url: `${site.url}/categorias/${cat.slug}/`,
    isPartOf: { "@type": "WebSite", name: site.nome, url: site.url },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: produtos.length,
      itemListElement: produtos.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${site.url}/produtos/${p.slug}/`,
        item: {
          "@type": "Product",
          name: p.nome,
          brand: { "@type": "Brand", name: p.marca },
          ...(p.imagem ? { image: `${site.url}${p.imagem.src}` } : {}),
        },
      })),
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

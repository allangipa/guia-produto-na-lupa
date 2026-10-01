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
    // Sem `offers`, desde 01/10/2026. O AggregateOffer saía sem preço, e o
    // Search Console marca isso como erro crítico ("lowPrice não foi
    // encontrado"): oferta sem preço não é oferta para o Google. A `review`
    // basta para o Product ser válido, e é ela que dá o trecho com a nota.
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
      // Sem Product aninhado, pela mesma razao da pagina de categoria: o
      // Google valida todo Product declarado e exige preco, avaliacao ou nota
      // agregada. O assunto desta pagina e a comparacao; quem e produto e a
      // ficha, e e la que o Product fica.
      itemListElement: c.concorrentes.map((x, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: x.nome,
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
      // ListItem com nome e URL, e NUNCA um Product aninhado.
      //
      // Ate 26/09/2026 cada item trazia um objeto Product completo aqui, e o
      // Search Console recusou: "Especifique offers, review ou
      // aggregateRating". Um Product declarado e uma promessa de que ha algo
      // a comprar, e o Google cobra preco, avaliacao ou nota agregada. Este
      // site nao publica preco (so a Product Advertising API autoriza, com
      // horario da consulta) e nao tem agregado de leitor.
      //
      // Pagina de lista nao precisa disso: a recomendacao do proprio Google
      // para pagina-resumo e ListItem apontando para a pagina de detalhe, que
      // e onde o Product mora. A ficha emite ItemPage (ver `schemaProduto`).
      itemListElement: produtos.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: p.nome,
        url: `${site.url}/produtos/${p.slug}/`,
      })),
    },
  };
}

/**
 * A ficha de produto declara `ItemPage`, e NÃO `Product`, desde 01/10/2026.
 *
 * Até então emitia Product com um AggregateOffer sem preço, e o relatório de
 * trechos de produto do Search Console marcou as fichas como inválidas:
 * "O campo lowPrice não foi encontrado (em offers)", erro crítico. O Google
 * só aceita Product com preço, com review ou com aggregateRating, e a ficha não
 * pode ter nenhum dos três:
 *   - preço só sai da Product Advertising API, com horário, e ela está fechada;
 *   - a ficha não tem nota editorial (quem tem é a análise, em `schemaReview`);
 *   - agregado exige avaliação real de leitor, que o site não tem.
 * Antes disso (26/09) a saída foi oferta sem preço, que trocou um erro por
 * outro. Não há como declarar Product honesto aqui; declarar a página é.
 *
 * Quando a API liberar preço com horário, o Product volta com `Offer` de
 * verdade — `price`, `priceCurrency` e `priceValidUntil` da consulta.
 */
export function schemaProduto(p: {
  nome: string;
  resumo?: string;
  slug: string;
  imagem?: { src: string };
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemPage",
    name: p.nome,
    ...(p.resumo ? { description: p.resumo } : {}),
    url: `${site.url}/produtos/${p.slug}/`,
    ...(p.imagem ? { primaryImageOfPage: `${site.url}${p.imagem.src}` } : {}),
    inLanguage: "pt-BR",
    isPartOf: { "@type": "WebSite", name: site.nome, url: site.url },
    publisher: { "@type": "Organization", name: site.nome, url: site.url },
  };
}

/**
 * ItemList para o guia: a lista de escolhas, na ordem em que a pagina as mostra.
 *
 * O comparativo ja emitia ItemList e o guia nao, embora o guia SEJA uma lista —
 * uma escolha por perfil de leitor. Inconsistencia interna, nao falta de dado.
 */
export function schemaGuia(g: {
  titulo: string;
  slug: string;
  escolhas: { produto: string; perfil: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: g.titulo,
    url: `${site.url}/guias/${g.slug}/`,
    numberOfItems: g.escolhas.length,
    itemListOrder: "https://schema.org/ItemListUnordered",
    itemListElement: g.escolhas.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: e.produto,
      description: e.perfil,
    })),
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

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

/**
 * Product para a ficha de produto.
 *
 * As 423 fichas carregavam so BreadcrumbList ate 26/09/2026 — eram 76% do site
 * e as paginas que respondem a busca por modelo ("WAP Magic ficha tecnica"),
 * sem declarar ao buscador que sao produto. Comparativo e analise ja emitiam
 * Product; a ficha, nao.
 *
 * SEM PRECO E SEM aggregateRating, e isso limita o rich result de proposito.
 * Preco so pode sair da Product Advertising API, com horario da consulta, e ela
 * ainda nao esta liberada; agregado exige avaliacao real de leitor, que o site
 * nao tem. Inventar qualquer um dos dois e o caminho mais curto para uma acao
 * manual do Google.
 *
 * O que entra e o que a ficha de fato sustenta: marca, modelo, imagem
 * licenciada, a descricao editorial e os campos de especificacao como
 * `additionalProperty` — que e onde mora o trabalho do site, e o unico lugar
 * do schema que aceita "quantos pascal" e "quantos litros uteis".
 */
export function schemaProduto(
  p: {
    nome: string;
    marca: string;
    modelo?: string | string[];
    resumo?: string;
    slug: string;
    imagem?: { src: string };
    lojas?: Record<string, string | undefined>;
    specs: Record<string, unknown>;
  },
  campos: { chave: string; rotulo: string; unidade?: string }[],
) {
  const lojas = Object.entries(p.lojas ?? {})
    .filter(([, url]) => url)
    .map(([chave]) => chave);

  // So campo preenchido: `additionalProperty` com "nao informa" viraria ruido,
  // e a lacuna ja e dita na pagina, para gente, com todas as letras.
  const propriedades = campos
    .filter((c) => p.specs[c.chave] !== null && p.specs[c.chave] !== undefined)
    .map((c) => {
      const v = p.specs[c.chave];
      return {
        "@type": "PropertyValue",
        name: c.rotulo,
        // Booleano vira Sim/Nao: `String(true)` daria "true", que nao diz nada
        // a quem le o schema. Numero fica cru, sem separador de milhar, que e o
        // formato que a maquina entende — o separador e para a tela.
        value: typeof v === "boolean" ? (v ? "Sim" : "Não") : String(v),
        ...(c.unidade ? { unitText: c.unidade } : {}),
      };
    });

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.nome,
    brand: { "@type": "Brand", name: p.marca },
    ...(p.modelo
      ? { model: Array.isArray(p.modelo) ? p.modelo.join(" / ") : p.modelo }
      : {}),
    ...(p.resumo ? { description: p.resumo } : {}),
    url: `${site.url}/produtos/${p.slug}/`,
    ...(p.imagem ? { image: `${site.url}${p.imagem.src}` } : {}),
    ...(propriedades.length ? { additionalProperty: propriedades } : {}),
    ...(lojas.length
      ? {
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: "BRL",
            availability: "https://schema.org/InStock",
            offerCount: lojas.length,
          },
        }
      : {}),
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

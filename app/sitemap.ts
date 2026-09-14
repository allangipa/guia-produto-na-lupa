export const dynamic = "force-static";

import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import {
  todosOsReviews,
  todosOsComparativos,
  todosOsGuias,
  conteudoDaCategoria,
} from "@/lib/conteudo";
import { categorias } from "@/lib/categorias";
import { todosOsProdutos, produtosDaCategoria } from "@/lib/produtos";

/**
 * O site é exportado com `trailingSlash: true`: a URL canônica de cada página
 * termina em barra. O sitemap tem que apontar para a mesma forma — sem a barra,
 * o Google recebe um redirecionamento por URL e o Search Console reclama de
 * "URL do sitemap difere da canônica".
 */
const u = (rota: string) => `${site.url}${rota}/`;

export default function sitemap(): MetadataRoute.Sitemap {
  const fixas = [
    "",
    "/guias",
    "/reviews",
    "/comparativos",
    "/transparencia",
    "/metodologia",
    "/sobre",
    "/privacidade",
  ].map(
    (rota) => ({
      url: u(rota),
      lastModified: new Date(),
    }),
  );

  const cats = categorias
    .filter((c) => {
      const t = conteudoDaCategoria(c.slug);
      return (
        t.guias.length ||
        t.reviews.length ||
        t.comparativos.length ||
        produtosDaCategoria(c.slug).length
      );
    })
    .map((c) => ({ url: u(`/categorias/${c.slug}`), lastModified: new Date() }));

  // Uma página de comparação por categoria com base preenchida. As combinações
  // ficam na query string, que o Google não indexa como páginas separadas.
  const comparadores = categorias
    .filter((c) => produtosDaCategoria(c.slug).length > 0)
    .map((c) => ({
      url: u(`/comparar/${c.slug}`),
      lastModified: new Date(),
    }));

  const fichas = todosOsProdutos().map((p) => ({
    url: u(`/produtos/${p.slug}`),
    lastModified: new Date(p.atualizadoEm),
  }));

  const conteudo = [
    ...todosOsGuias().map((g) => ({
      url: u(`/guias/${g.slug}`),
      lastModified: new Date(g.atualizadoEm),
    })),
    ...todosOsReviews().map((r) => ({
      url: u(`/reviews/${r.slug}`),
      lastModified: new Date(r.atualizadoEm),
    })),
    ...todosOsComparativos().map((c) => ({
      url: u(`/comparativos/${c.slug}`),
      lastModified: new Date(c.atualizadoEm),
    })),
  ];

  return [...fixas, ...cats, ...comparadores, ...fichas, ...conteudo];
}

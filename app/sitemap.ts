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

export default function sitemap(): MetadataRoute.Sitemap {
  const fixas = ["", "/guias", "/reviews", "/comparativos", "/metodologia", "/sobre"].map(
    (rota) => ({
      url: `${site.url}${rota}`,
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
    .map((c) => ({ url: `${site.url}/categorias/${c.slug}`, lastModified: new Date() }));

  // Uma página de comparação por categoria com base preenchida. As combinações
  // ficam na query string, que o Google não indexa como páginas separadas.
  const comparadores = categorias
    .filter((c) => produtosDaCategoria(c.slug).length > 0)
    .map((c) => ({
      url: `${site.url}/comparar/${c.slug}`,
      lastModified: new Date(),
    }));

  const fichas = todosOsProdutos().map((p) => ({
    url: `${site.url}/produtos/${p.slug}`,
    lastModified: new Date(p.atualizadoEm),
  }));

  const conteudo = [
    ...todosOsGuias().map((g) => ({
      url: `${site.url}/guias/${g.slug}`,
      lastModified: new Date(g.atualizadoEm),
    })),
    ...todosOsReviews().map((r) => ({
      url: `${site.url}/reviews/${r.slug}`,
      lastModified: new Date(r.atualizadoEm),
    })),
    ...todosOsComparativos().map((c) => ({
      url: `${site.url}/comparativos/${c.slug}`,
      lastModified: new Date(c.atualizadoEm),
    })),
  ];

  return [...fixas, ...cats, ...comparadores, ...fichas, ...conteudo];
}

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
      return t.guias.length || t.reviews.length || t.comparativos.length;
    })
    .map((c) => ({ url: `${site.url}/categorias/${c.slug}`, lastModified: new Date() }));

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

  return [...fixas, ...cats, ...conteudo];
}

export const dynamic = "force-static";

import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import {
  todosOsReviews,
  todosOsComparativos,
  todosOsGuias,
  conteudoDaCategoria,
  fotoDaBase,
} from "@/lib/conteudo";
import { categorias } from "@/lib/categorias";
import { recortes } from "@/lib/recortes";
import { todosOsProdutos, produtosDaCategoria } from "@/lib/produtos";

/**
 * O site é exportado com `trailingSlash: true`: a URL canônica de cada página
 * termina em barra. O sitemap tem que apontar para a mesma forma — sem a barra,
 * o Google recebe um redirecionamento por URL e o Search Console reclama de
 * "URL do sitemap difere da canônica".
 */
const u = (rota: string) => `${site.url}${rota}/`;

/**
 * As fotos de uma página, em URL absoluta, para o sitemap de imagens.
 *
 * Até 26/09/2026 o sitemap declarava 556 URLs e nenhuma imagem, com 418 fotos
 * oficiais de fabricante publicadas. Busca por imagem é fonte real de tráfego
 * em consulta de produto, e o site não se apresentava para ela.
 *
 * Só entra foto que existe de verdade: `undefined` vira lista vazia, e entrada
 * sem imagem sai do XML em vez de declarar uma URL que devolve 404.
 */
const imgs = (...fotos: ({ src: string } | undefined)[]) => {
  const srcs = [...new Set(fotos.filter(Boolean).map((f) => `${site.url}${f!.src}`))];
  return srcs.length ? { images: srcs } : {};
};

export default function sitemap(): MetadataRoute.Sitemap {
  const fixas = [
    "",
    "/guias",
    "/reviews",
    "/comparativos",
    "/listas",
    "/categorias",
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
  // As paginas de /comparar sairam do sitemap junto com o `noindex` delas:
  // pedir indexacao de uma URL marcada para nao indexar e sinal contraditorio.
  // Elas continuam alcancaveis por link, e o `follow` mantem o valor do link.

  const fichas = todosOsProdutos().map((p) => ({
    url: u(`/produtos/${p.slug}`),
    lastModified: new Date(p.atualizadoEm),
    ...imgs(p.imagem),
  }));

  const conteudo = [
    ...todosOsGuias().map((g) => ({
      url: u(`/guias/${g.slug}`),
      lastModified: new Date(g.atualizadoEm),
      ...imgs(...g.escolhas.map((e) => fotoDaBase([e.lojas], [e.produto]))),
    })),
    ...todosOsReviews().map((r) => ({
      url: u(`/reviews/${r.slug}`),
      lastModified: new Date(r.atualizadoEm),
      ...imgs(r.produto.imagem ?? fotoDaBase([r.produto.lojas], [r.produto.nome])),
    })),
    ...todosOsComparativos().map((c) => ({
      url: u(`/comparativos/${c.slug}`),
      lastModified: new Date(c.atualizadoEm),
      ...imgs(
        c.imagem,
        ...c.concorrentes.map((p) => p.imagem ?? fotoDaBase([p.lojas], [p.nome])),
      ),
    })),
  ];

  const listas = recortes.map((r) => ({
    url: u(`/listas/${r.slug}`),
    lastModified: new Date(),
  }));

  return [...fixas, ...cats, ...fichas, ...conteudo, ...listas];
}

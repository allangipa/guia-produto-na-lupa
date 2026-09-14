import { todosOsProdutos } from "./produtos";
import {
  todosOsReviews,
  todosOsComparativos,
  todosOsGuias,
} from "./conteudo";
import { categorias } from "./categorias";

/**
 * Índice de busca, montado no build.
 *
 * Site estático não tem servidor para consultar, então o índice viaja junto com
 * a página e a busca acontece no navegador. Com algumas centenas de itens isso
 * é irrelevante; se a base passar de uns poucos milhares, vale trocar por um
 * arquivo carregado sob demanda no primeiro toque no campo.
 */
export type ItemIndice = {
  titulo: string;
  url: string;
  tipo: string;
  /** Texto extra que também casa na busca, sem aparecer no rótulo. */
  termos: string;
};

export function indiceDeBusca(): ItemIndice[] {
  return [
    ...todosOsProdutos().map((p) => ({
      titulo: p.nome,
      url: `/produtos/${p.slug}`,
      tipo: "Produto",
      termos: `${p.marca} ${p.modelo} ${p.resumo}`,
    })),
    ...categorias.map((c) => ({
      titulo: c.nome,
      url: `/categorias/${c.slug}`,
      tipo: "Categoria",
      termos: c.descricao,
    })),
    ...todosOsGuias().map((g) => ({
      titulo: g.titulo,
      url: `/guias/${g.slug}`,
      tipo: "Guia",
      termos: g.subtitulo,
    })),
    ...todosOsReviews().map((r) => ({
      titulo: r.titulo,
      url: `/reviews/${r.slug}`,
      tipo: "Análise",
      termos: `${r.produto.marca} ${r.subtitulo}`,
    })),
    ...todosOsComparativos().map((c) => ({
      titulo: c.titulo,
      url: `/comparativos/${c.slug}`,
      tipo: "Comparativo",
      termos: c.subtitulo,
    })),
  ];
}

import { categorias } from "@/lib/categorias";
import { departamentos } from "@/lib/departamentos";
import { produtosDaCategoria } from "@/lib/produtos";

/**
 * Monta a árvore departamento > categoria uma vez, com a contagem de produtos,
 * para o topo, o rodapé e a página de índice mostrarem exatamente a mesma
 * coisa. Três leituras separadas dos mesmos dados divergiriam no primeiro dia
 * em que alguém filtrasse diferente num dos três.
 *
 * Categoria sem produto fica de fora: a página dela existe, mas é fina, já sai
 * do índice do Google (ver `generateMetadata` da categoria) e não deve ocupar
 * linha no menu prometendo o que ainda não há.
 */
export type ItemNav = {
  slug: string;
  nome: string;
  total: number;
  /** Foto do primeiro produto da categoria que tenha imagem, para o disco. */
  capa: string | null;
};
export type GrupoNav = {
  slug: string;
  nome: string;
  descricao: string;
  itens: ItemNav[];
  total: number;
};

export function navegacao(): GrupoNav[] {
  const nomeDe = new Map(categorias.map((c) => [c.slug, c.nome]));
  return departamentos
    .map((d) => {
      const itens = d.categorias
        .map((s) => {
          const lista = produtosDaCategoria(s);
          return {
            slug: s,
            nome: nomeDe.get(s) ?? s,
            total: lista.length,
            capa: lista.find((p) => p.imagem)?.imagem?.src ?? null,
          };
        })
        .filter((i) => i.total > 0);
      return {
        slug: d.slug,
        nome: d.nome,
        descricao: d.descricao,
        itens,
        total: itens.reduce((n, i) => n + i.total, 0),
      };
    })
    .filter((d) => d.itens.length > 0);
}

import bruto from "./removidos.json";
import { categoria as buscarCategoria } from "./categorias";
import { todosOsGuias } from "./conteudo";

export type Removido = {
  slug: string;
  nome: string;
  categoria: string;
};

/**
 * Os produtos que saíram da base, e para onde mandar quem chega na URL deles.
 *
 * Em 26/09/2026 saíram 40 produtos sem link de afiliado. As URLs continuaram no
 * índice do Google, e o Search Console mostrou que pelo menos uma delas — a do
 * WAP Turbo 2002 — tinha 6 impressões quando virou 404. Não sabíamos disso na
 * hora de apagar: o sitemap tinha sido enviado no mesmo dia.
 *
 * Site estático não tem redirect de servidor. O que dá para fazer, e é o que a
 * página de `/produtos/[slug]` faz quando o produto não está mais na base, é
 * servir um HTML no endereço antigo com `canonical` apontando para o destino e
 * um `meta refresh` de zero segundo. O Google trata isso como redirecionamento
 * e transfere o sinal; o leitor cai no guia da categoria em vez de numa página
 * de erro.
 *
 * O arquivo vive em `lib/`, e não em `dados/`: `dados/` é varrido pelo
 * carregador de produtos, e um manifesto sem `specs` lá dentro vira quarenta
 * produtos quebrados no build. Aconteceu na primeira tentativa.
 *
 * O destino é o GUIA da categoria, e não a página de categoria: quem buscou o
 * nome de um modelo está escolhendo o que comprar, e é o guia que responde
 * isso. Sem guia, cai na categoria; sem categoria, na home.
 */
export const removidos = bruto as Removido[];

export function removido(slug: string): Removido | undefined {
  return removidos.find((r) => r.slug === slug);
}

export function destinoDe(r: Removido): { url: string; nome: string } {
  const guia = todosOsGuias().find((g) => g.categoria === r.categoria);
  if (guia) return { url: `/guias/${guia.slug}/`, nome: guia.titulo };
  const cat = buscarCategoria(r.categoria);
  if (cat) return { url: `/categorias/${cat.slug}/`, nome: cat.nome };
  return { url: "/", nome: "a página inicial" };
}

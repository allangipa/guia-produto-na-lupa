import { categorias } from "@/lib/categorias";
import { produtosDaCategoria } from "@/lib/produtos";
import { iconeDaCategoria } from "@/lib/specs";
import { Trilho, type GrupoTrilho } from "@/components/trilho";

/**
 * Monta os grupos do trilho no servidor, a partir da base, e entrega ao
 * componente de cliente já prontos — o trilho nunca toca em disco.
 */
export function TrilhoDoSite() {
  const comProdutos = categorias
    .map((c) => ({ c, n: produtosDaCategoria(c.slug).length }))
    .filter((x) => x.n > 0);

  const grupos: GrupoTrilho[] = [
    {
      titulo: "Produtos",
      itens: comProdutos.map(({ c, n }) => ({
        href: `/categorias/${c.slug}`,
        rotulo: c.nome,
        icone: iconeDaCategoria(c.slug),
        contagem: n,
      })),
    },
    {
      titulo: "Comparar",
      itens: comProdutos.map(({ c }) => ({
        href: `/comparar/${c.slug}`,
        rotulo: c.nome,
        icone: "comparar",
      })),
    },
    {
      titulo: "Conteúdo",
      itens: [
        { href: "/guias", rotulo: "Guias de compra", icone: "fonte" },
        { href: "/reviews", rotulo: "Análises", icone: "lupa" },
        { href: "/comparativos", rotulo: "Comparativos", icone: "comparar" },
      ],
    },
    {
      titulo: "O site",
      itens: [
        { href: "/metodologia", rotulo: "Como avaliamos", icone: "info" },
        { href: "/sobre", rotulo: "O que este site é", icone: "info" },
        { href: "/privacidade", rotulo: "Privacidade", icone: "escudo" },
      ],
    },
  ];

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-[7.25rem] max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
        <Trilho grupos={grupos} />
      </div>
    </aside>
  );
}

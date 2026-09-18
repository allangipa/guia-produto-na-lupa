import type { Metadata } from "next";
import Link from "next/link";
import { categorias } from "@/lib/categorias";
import { produtosDaCategoria } from "@/lib/produtos";
import { Icone } from "@/components/icones";
import { iconeDaCategoria } from "@/lib/specs";

/**
 * A porta de entrada do comparador: escolher a categoria, depois os produtos.
 *
 * Existe porque o botão "Comparar" do cabeçalho apontava para
 * `/comparar/${comProdutos[0].slug}` — sempre a primeira categoria da lista,
 * que é áudio. Quem quisesse comparar monitor ou airfryer caía num comparador
 * de fone de ouvido sem nenhuma indicação de que havia outros, e o site parecia
 * ter uma categoria só.
 *
 * Cada categoria só aparece aqui se tiver produto: comparador vazio é página
 * fina, e a rota nem é gerada para categoria sem base.
 */
export const metadata: Metadata = {
  title: "Comparar produtos",
  description:
    "Escolha a categoria e compare lado a lado a ficha técnica oficial, na mesma unidade, com o que cada fabricante deixa de publicar à mostra.",
  alternates: { canonical: "/comparar" },
};

export default function PaginaEscolherCategoria() {
  const comProdutos = categorias
    .map((c) => ({ ...c, produtos: produtosDaCategoria(c.slug) }))
    .filter((c) => c.produtos.length > 0);

  return (
    <div className="mx-auto max-w-[var(--largura-ferramenta)] px-5 py-12">
      <h1 className="titulo-ui text-3xl tracking-tight">Comparar produtos</h1>
      <p className="mt-3 max-w-[62ch] text-lg text-tinta-suave">
        Escolha a categoria. Na próxima tela você seleciona até quatro produtos
        e vê ficha contra ficha, na mesma unidade — com o que o fabricante{" "}
        <strong className="font-semibold text-tinta">não publica</strong> à
        mostra, que conta tanto quanto o que ele publica.
      </p>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {comProdutos.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/comparar/${c.slug}`}
              className="cartao flex h-full items-center gap-3 p-4 transition-colors hover:border-acao"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-superficie">
                <Icone
                  nome={iconeDaCategoria(c.slug)}
                  className="h-5 w-5 text-acao"
                />
              </span>
              <span className="min-w-0">
                <span className="titulo-ui block truncate text-[1.02rem]">
                  {c.nome}
                </span>
                <span className="dados block text-[0.78rem] text-tinta-suave">
                  {c.produtos.length}{" "}
                  {c.produtos.length === 1 ? "produto" : "produtos"}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

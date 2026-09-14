import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categorias, categoria as buscar } from "@/lib/categorias";
import { produtosDaCategoria, camposDa } from "@/lib/produtos";
import { Comparador } from "@/components/comparador";

type Params = { params: Promise<{ categoria: string }> };

/**
 * Só existe página de comparação para categoria que já tem produtos na base.
 * Comparador vazio é página fina — e frustra o visitante que chegou pela busca.
 */
export function generateStaticParams() {
  return categorias
    .filter((c) => produtosDaCategoria(c.slug).length > 0)
    .map((c) => ({ categoria: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { categoria } = await params;
  const c = buscar(categoria);
  if (!c) return {};
  return {
    title: `Comparar ${c.nome.toLowerCase()}`,
    description: `Compare lado a lado a ficha técnica oficial de ${c.nome.toLowerCase()}, na mesma unidade, com a transparência de cada marca medida campo por campo.`,
    alternates: { canonical: `/comparar/${c.slug}` },
  };
}

export default async function PaginaComparar({ params }: Params) {
  const { categoria } = await params;
  const c = buscar(categoria);
  if (!c) notFound();

  const produtos = produtosDaCategoria(c.slug);
  if (!produtos.length) notFound();

  return (
    <div className="mx-auto max-w-[var(--largura-ferramenta)] px-5 py-12">
      <h1 className="titulo-ui text-3xl tracking-tight">
        Comparar {c.nome.toLowerCase()}
      </h1>
      <p className="mt-3 max-w-[62ch] text-lg text-tinta-suave">
        Ficha contra ficha, na mesma unidade. O que aparece em cinza é o que o
        fabricante não publica — e conta tanto quanto o que ele publica.
      </p>

      <Comparador
        produtos={produtos}
        campos={camposDa(c.slug)}
        categoria={c.slug}
      />
    </div>
  );
}

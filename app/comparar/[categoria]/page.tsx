import type { Metadata } from "next";
import Link from "next/link";
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

  // As outras categorias que dao para comparar.
  //
  // Sem esta linha, quem caia aqui pelo botao do cabecalho ficava preso na
  // categoria em que entrou: a pagina nao dizia que existiam outras, e o
  // comparador parecia servir so a fones de ouvido.
  const outras = categorias.filter(
    (x) => produtosDaCategoria(x.slug).length > 0,
  );

  return (
    <div className="mx-auto max-w-[var(--largura-ferramenta)] px-5 py-12">
      <p className="text-[0.8rem] text-tinta-suave">
        <Link href="/comparar" className="hover:text-acao">
          Comparar
        </Link>{" "}
        › {c.nome}
      </p>

      <h1 className="titulo-ui mt-1 text-3xl tracking-tight">
        Comparar {c.nome.toLowerCase()}
      </h1>
      <p className="mt-3 max-w-[62ch] text-lg text-tinta-suave">
        Ficha contra ficha, na mesma unidade. O que aparece em cinza é o que o
        fabricante não publica — e conta tanto quanto o que ele publica.
      </p>

      {outras.length > 1 && (
        <nav
          aria-label="Trocar de categoria"
          className="mt-6 flex flex-wrap gap-2"
        >
          {outras.map((x) =>
            x.slug === c.slug ? (
              // .pilula-ativa, e nao utilidades do Tailwind: .pilula define
              // cor e borda no globals.css e vence border-acao/text-acao, que
              // ficavam sem efeito nenhum — a pilula atual saia identica as
              // outras seis e o seletor nao dizia onde voce estava.
              <span key={x.slug} aria-current="page" className="pilula pilula-ativa">
                {x.nome}
              </span>
            ) : (
              <Link key={x.slug} href={`/comparar/${x.slug}`} className="pilula">
                {x.nome}
              </Link>
            ),
          )}
        </nav>
      )}

      <Comparador
        produtos={produtos}
        campos={camposDa(c.slug)}
        categoria={c.slug}
      />
    </div>
  );
}

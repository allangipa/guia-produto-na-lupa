import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categorias, categoria as buscar } from "@/lib/categorias";
import { conteudoDaCategoria } from "@/lib/conteudo";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return categorias.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const c = buscar(slug);
  if (!c) return {};
  const { guias, reviews, comparativos } = conteudoDaCategoria(c.slug);
  const vazia = !guias.length && !reviews.length && !comparativos.length;
  return {
    title: c.nome,
    description: c.descricao,
    alternates: { canonical: `/categorias/${c.slug}` },
    // Categoria sem conteúdo é página fina: fica fora do índice até ter o que mostrar.
    robots: vazia ? { index: false, follow: true } : { index: true, follow: true },
  };
}

function Bloco({
  titulo,
  itens,
  base,
}: {
  titulo: string;
  itens: { slug: string; titulo: string; subtitulo: string }[];
  base: string;
}) {
  if (!itens.length) return null;
  return (
    <section className="mt-12">
      <h2 className="font-titulo text-xl">{titulo}</h2>
      <ul className="mt-4 divide-y divide-linha border-t border-linha">
        {itens.map((i) => (
          <li key={i.slug}>
            <Link href={`${base}/${i.slug}`} className="group block py-5">
              <span className="block font-titulo text-lg leading-snug group-hover:text-acao-escura">
                {i.titulo}
              </span>
              <span className="mt-1 block max-w-[62ch] text-[0.95rem] text-tinta-suave">
                {i.subtitulo}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function PaginaCategoria({ params }: Params) {
  const { slug } = await params;
  const c = buscar(slug);
  if (!c) notFound();
  const { guias, reviews, comparativos } = conteudoDaCategoria(c.slug);
  const vazio = !guias.length && !reviews.length && !comparativos.length;

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="font-titulo text-3xl tracking-tight">{c.nome}</h1>
      <p className="mt-3 max-w-[62ch] text-lg text-tinta-suave">{c.descricao}</p>
      <p className="mt-4 max-w-[62ch] border-l-[3px] border-acao pl-4 text-tinta-suave">
        A pergunta que guia tudo aqui: {c.dorPrincipal}
      </p>

      <Bloco titulo="Guias de compra" itens={guias} base="/guias" />
      <Bloco titulo="Comparativos" itens={comparativos} base="/comparativos" />
      <Bloco titulo="Análises" itens={reviews} base="/reviews" />

      {vazio && (
        <p className="mt-12 text-tinta-suave">
          Ainda não há conteúdo publicado nesta categoria.
        </p>
      )}
    </div>
  );
}

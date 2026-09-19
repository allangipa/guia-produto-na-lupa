import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categorias, categoria as buscar } from "@/lib/categorias";
import { conteudoDaCategoria } from "@/lib/conteudo";
import { recortesDaCategoria, produtosDoRecorte } from "@/lib/recortes";
import { produtosDaCategoria, camposDa } from "@/lib/produtos";
import { ogImagem } from "@/lib/site";
import { Buscador } from "@/components/buscador";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return categorias.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const c = buscar(slug);
  if (!c) return {};
  const { guias, reviews, comparativos } = conteudoDaCategoria(c.slug);
  const vazia =
    !guias.length &&
    !reviews.length &&
    !comparativos.length &&
    !produtosDaCategoria(c.slug).length;
  return {
    title: c.nome,
    description: c.descricao,
    alternates: { canonical: `/categorias/${c.slug}` },
    // Categoria sem conteúdo é página fina: fica fora do índice até ter o que mostrar.
    robots: vazia ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      title: c.nome,
      description: c.descricao,
      ...ogImagem(produtosDaCategoria(c.slug).find((p) => p.imagem)?.imagem),
    },
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
      <h2 className="titulo-ui text-xl">{titulo}</h2>
      <ul className="mt-4 divide-y divide-linha border-t border-linha">
        {itens.map((i) => (
          <li key={i.slug}>
            <Link href={`${base}/${i.slug}`} className="group block py-5">
              <span className="block titulo-ui text-lg leading-snug group-hover:text-acao-escura">
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
  const produtos = produtosDaCategoria(c.slug);
  const vazio =
    !guias.length && !reviews.length && !comparativos.length && !produtos.length;

  // Página de categoria é ferramenta, tenha ou não produtos hoje: a largura não
  // pode dançar conforme a base cresce. Os blocos de texto seguem presos em 62
  // caracteres, que é o que mantém a leitura confortável numa página larga.
  return (
    <div className="mx-auto max-w-[var(--largura-ferramenta)] px-5 py-12">
      <h1 className="titulo-ui text-3xl tracking-tight">{c.nome}</h1>
      <p className="mt-3 max-w-[62ch] text-lg text-tinta-suave">{c.descricao}</p>
      <p className="mt-4 max-w-[62ch] border-l-[3px] border-acao pl-4 text-tinta-suave">
        A pergunta que guia tudo aqui: {c.dorPrincipal}
      </p>

      {produtos.length > 0 && (
        <>
          <Buscador
            produtos={produtos}
            campos={camposDa(c.slug)}
            categoria={c.slug}
          />
          <p className="mt-6 max-w-[62ch] text-[0.9rem] text-tinta-suave">
            A porcentagem ao lado de cada produto é quanto da ficha técnica o
            próprio fabricante publica. Nenhum destes produtos foi testado por
            nós: cada ficha lista as páginas oficiais consultadas e a data.
          </p>

          {/* Categoria que parou por falta de documentação diz isso na cara do
              leitor. O número sai da contagem, nunca de texto escrito à mão. */}
          {c.porQueParou && (
            <aside className="mt-6 max-w-[62ch] rounded-[var(--raio-controle)] border border-linha bg-superficie p-5">
              <p className="titulo-ui text-[1.05rem] leading-snug text-tinta">
                Esta categoria tem {produtos.length}{" "}
                {produtos.length === 1 ? "produto" : "produtos"}, e parou aqui de
                propósito.
              </p>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-tinta-suave">
                {c.porQueParou}
              </p>
            </aside>
          )}
        </>
      )}

      {/* Os recortes vem antes do conteudo editorial: quem chega numa
          categoria grande quer estreitar, nao ler. */}
      <Bloco
        titulo="Listas dentro desta categoria"
        itens={recortesDaCategoria(c.slug).map((r) => ({
          slug: r.slug,
          titulo: `${r.titulo} (${produtosDoRecorte(r).length})`,
          subtitulo: r.subtitulo,
        }))}
        base="/listas"
      />
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

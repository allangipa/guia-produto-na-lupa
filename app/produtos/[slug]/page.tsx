import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  produto as buscarProduto,
  todosOsProdutos,
  camposDa,
} from "@/lib/produtos";
import { categoria as buscarCategoria } from "@/lib/categorias";
import { dataLegivel } from "@/lib/conteudo";
import { FichaSpecs, NotaTransparencia } from "@/components/ficha-specs";
import { Divergencias } from "@/components/divergencias";
import { Relatos } from "@/components/relatos";
import { FotoProduto } from "@/components/foto-produto";
import { Silhueta } from "@/components/silhueta";
import { Fontes } from "@/components/fontes";
import { LojaCta } from "@/components/loja-cta";
import { Divulgacao } from "@/components/divulgacao";
import { JsonLd, schemaBreadcrumb } from "@/lib/schema";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return todosOsProdutos().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = buscarProduto(slug);
  if (!p) return {};
  return {
    title: `${p.nome}: ficha técnica oficial`,
    description: p.resumo,
    alternates: { canonical: `/produtos/${p.slug}` },
  };
}

export default async function PaginaProduto({ params }: Params) {
  const { slug } = await params;
  const p = buscarProduto(slug);
  if (!p) notFound();

  const campos = camposDa(p.categoria);
  const cat = buscarCategoria(p.categoria);

  return (
    <article className="mx-auto max-w-[var(--largura-prosa)] px-5 py-12">
      <JsonLd
        data={schemaBreadcrumb([
          { nome: "Início", url: "/" },
          ...(cat ? [{ nome: cat.nome, url: `/categorias/${cat.slug}` }] : []),
          { nome: p.nome, url: `/produtos/${p.slug}` },
        ])}
      />

      <header>
        <Divulgacao atualizadoEm={dataLegivel(p.atualizadoEm)} />
        <h1 className="mt-3 titulo-ui text-3xl leading-[1.12] tracking-tight sm:text-4xl">
          {p.nome}
        </h1>
        <p className="mt-2 font-dado text-[0.85rem] text-tinta-suave">
          {p.marca} · modelo {p.modelo}
        </p>
        <p className="mt-4 max-w-[62ch] text-lg text-tinta-suave">{p.resumo}</p>
      </header>

      {p.imagem ? (
        <FotoProduto imagem={p.imagem} prioridade />
      ) : (
        <div className="painel my-8 p-6">
          <h2 className="titulo-ui text-lg">Tamanho real</h2>
          <p className="mt-1 max-w-[52ch] text-[0.9rem] text-tinta-suave">
            Desenhado na escala das dimensões oficiais, contra o contorno de um
            cartão de crédito.
          </p>
          <div className="mt-5">
            <Silhueta dimensoes={p.specs.dimensoesMm as string} />
          </div>
        </div>
      )}

      <NotaTransparencia produto={p} campos={campos} />

      {p.divergencias?.length ? (
        <Divergencias
          itens={p.divergencias}
          campos={campos}
          fontes={p.fontes}
          specs={p.specs}
        />
      ) : null}

      <h2 className="mt-12 titulo-ui text-xl">Ficha técnica completa</h2>
      <FichaSpecs produto={p} campos={campos} />

      {p.relatos?.length ? <Relatos itens={p.relatos} /> : null}

      {cat && (
        <nav className="mt-12 flex flex-wrap gap-x-6 gap-y-2 border-t border-linha pt-6 text-[0.95rem]">
          <Link
            href={`/comparar/${cat.slug}?p=${p.slug}`}
            className="underline decoration-linha underline-offset-4 hover:decoration-acao"
          >
            Comparar com outro produto
          </Link>
          <Link
            href={`/categorias/${cat.slug}`}
            className="underline decoration-linha underline-offset-4 hover:decoration-acao"
          >
            Ver todos de {cat.nome.toLowerCase()}
          </Link>
        </nav>
      )}

      {(p.lojas.amazon || p.lojas.mercadolivre) && (
        <LojaCta lojas={p.lojas} produto={p.nome} posicao="fechamento" />
      )}

      <Fontes itens={p.fontes} />
    </article>
  );
}

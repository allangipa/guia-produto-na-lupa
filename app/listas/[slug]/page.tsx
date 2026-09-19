import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { recortes, recorte as buscar, produtosDoRecorte } from "@/lib/recortes";
import { categoria as buscarCategoria } from "@/lib/categorias";
import { camposDa } from "@/lib/produtos";
import { CardProduto } from "@/components/card-produto";
import { Icone } from "@/components/icones";
import { JsonLd, schemaBreadcrumb } from "@/lib/schema";
import { ogImagem, site } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return recortes.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const r = buscar(slug);
  if (!r) return {};
  return {
    title: r.titulo,
    description: r.subtitulo,
    alternates: { canonical: `/listas/${r.slug}` },
    openGraph: {
      title: r.titulo,
      description: r.subtitulo,
      ...ogImagem(produtosDoRecorte(r).find((p) => p.imagem)?.imagem),
    },
  };
}

export default async function PaginaRecorte({ params }: Params) {
  const { slug } = await params;
  const r = buscar(slug);
  if (!r) notFound();

  const produtos = produtosDoRecorte(r);
  const cat = buscarCategoria(r.categoria);
  const campos = camposDa(r.categoria);

  return (
    <div className="mx-auto max-w-[var(--largura-ferramenta)] px-5 py-12">
      {/* ItemList, não Product: a página é sobre um conjunto, e nenhum dos itens
          é o assunto dela. Sem aggregateRating, pela mesma razão do resto do
          site — agregado exige avaliação real de terceiro coletada aqui. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: r.titulo,
          description: r.subtitulo,
          numberOfItems: produtos.length,
          itemListElement: produtos.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${site.url}/produtos/${p.slug}/`,
            item: {
              "@type": "Product",
              name: p.nome,
              brand: { "@type": "Brand", name: p.marca },
              ...(p.imagem ? { image: `${site.url}${p.imagem.src}` } : {}),
            },
          })),
        }}
      />
      <JsonLd
        data={schemaBreadcrumb([
          { nome: "Início", url: "/" },
          { nome: "Listas", url: "/listas" },
          { nome: r.titulo, url: `/listas/${r.slug}` },
        ])}
      />

      <header className="max-w-[62ch]">
        {cat && (
          <Link href={`/categorias/${cat.slug}`} className="pastilha">
            {cat.nome}
          </Link>
        )}
        <h1 className="mt-3 font-titulo text-3xl leading-[1.12] tracking-tight sm:text-4xl">
          {r.titulo}
        </h1>
        <p className="mt-4 text-lg text-tinta-suave">{r.subtitulo}</p>
      </header>

      {/* O critério fica visível. Uma lista filtrada sem dizer o filtro é uma
          caixa-preta, e o leitor não tem como saber por que um produto entrou
          e outro não. */}
      <section className="painel mt-8 max-w-[62ch] p-5">
        <p className="titulo-ui text-[0.95rem]">
          {produtos.length} {produtos.length === 1 ? "ficha" : "fichas"}, pelo
          critério abaixo
        </p>
        <p className="mt-2 text-[0.9rem] leading-relaxed text-tinta-suave">
          {r.criterio} Quem não declara o campo fica de fora — ausência de
          menção não é “não tem”, é “não informa”, e este guia não preenche
          lacuna com estimativa.
        </p>
        <p className="mt-3 text-[0.8rem] leading-relaxed text-tinta-suave">
          Esta lista existe porque <strong>{r.buscaQueOrigina}</strong> é a{" "}
          {r.posicaoNaSugestao}, nas sugestões da busca da Amazon Brasil
          consultadas em 19 de setembro de 2026. A Amazon não publica o volume
          por trás dessa ordem: é sinal de demanda, não medida de venda.
        </p>
      </section>

      <div className="prosa mt-10 max-w-[62ch]">
        {r.texto.map((p, i) => (
          <p key={i} dangerouslySetInnerHTML={{ __html: negrito(p) }} />
        ))}
      </div>

      <section className="mt-12">
        <h2 className="titulo-ui text-xl">As fichas</h2>
        <p className="mt-1 max-w-[62ch] text-[0.9rem] text-tinta-suave">
          A porcentagem mede quanto o fabricante publica, não quanto o produto é
          bom.
        </p>
        <ul className="mt-5 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
          {produtos.map((p) => (
            <li key={p.slug}>
              <CardProduto produto={p} campos={campos} />
            </li>
          ))}
        </ul>
        {cat && (
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href={`/comparar/${cat.slug}`} className="pilula">
              <Icone nome="comparar" className="h-3.5 w-3.5" />
              Comparar lado a lado
            </Link>
            <Link href={`/categorias/${cat.slug}`} className="pilula">
              Ver {cat.nome} por inteiro
            </Link>
            <Link href="/listas" className="pilula">
              Outras listas
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

/**
 * Só **negrito**, e escapando o resto antes. O texto do recorte é nosso, não
 * vem de fora — mas passar string por `dangerouslySetInnerHTML` sem escapar é
 * o tipo de atalho que sobrevive até o dia em que a origem do texto muda.
 */
function negrito(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

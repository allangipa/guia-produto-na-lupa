import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  produto as buscarProduto,
  todosOsProdutos,
  camposDa,
  transparencia,
  faixaTransparencia,
  destaquesDa,
  iconeDo,
  valorLegivel,
} from "@/lib/produtos";
import { categoria as buscarCategoria } from "@/lib/categorias";
import { dataLegivel } from "@/lib/conteudo";
import { FichaSpecs, NotaTransparencia } from "@/components/ficha-specs";
import { Divergencias } from "@/components/divergencias";
import { Relatos } from "@/components/relatos";
import { MidiaProduto } from "@/components/midia-produto";
import { Silhueta } from "@/components/silhueta";
import { Fontes } from "@/components/fontes";
import { LojaCta } from "@/components/loja-cta";
import { Divulgacao } from "@/components/divulgacao";
import { Icone } from "@/components/icones";
import { PrecoAmazon } from "@/components/preco-amazon";
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

/**
 * Página de produto no formato de loja: mídia à esquerda, o essencial à
 * direita (marca, nome, badge de transparência, seis números com ícone, loja),
 * e só depois o aprofundamento — tamanho real, o que falta, ficha completa,
 * fontes. Quem chega decidido resolve acima da dobra; quem quer conferir
 * desce.
 */
export default async function PaginaProduto({ params }: Params) {
  const { slug } = await params;
  const p = buscarProduto(slug);
  if (!p) notFound();

  const campos = camposDa(p.categoria);
  const cat = buscarCategoria(p.categoria);
  const t = transparencia(p, campos);
  const faixa = faixaTransparencia(t.nota);

  // Seis números para o topo: os destaques da categoria primeiro, depois os
  // campos que o fabricante publicou, na ordem da ficha.
  const destaques = destaquesDa(p.categoria);
  const essenciais = [
    ...destaques,
    ...campos
      .filter(
        (c) =>
          !destaques.includes(c.chave) &&
          c.contaTransparencia &&
          p.specs[c.chave] !== null &&
          p.specs[c.chave] !== undefined &&
          !p.naoSeAplica?.includes(c.chave),
      )
      .map((c) => c.chave),
  ]
    .slice(0, 6)
    .map((chave) => campos.find((c) => c.chave === chave))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <article className="mx-auto max-w-[var(--largura-ferramenta)] px-5 py-6">
      <JsonLd
        data={schemaBreadcrumb([
          { nome: "Início", url: "/" },
          ...(cat ? [{ nome: cat.nome, url: `/categorias/${cat.slug}` }] : []),
          { nome: p.nome, url: `/produtos/${p.slug}` },
        ])}
      />

      <nav aria-label="Você está em" className="text-[0.8rem] text-tinta-suave">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href="/" className="hover:text-tinta">Início</Link></li>
          {cat && (
            <>
              <li aria-hidden>›</li>
              <li><Link href={`/categorias/${cat.slug}`} className="hover:text-tinta">{cat.nome}</Link></li>
            </>
          )}
          <li aria-hidden>›</li>
          <li className="text-tinta">{p.nome}</li>
        </ol>
      </nav>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_1.05fr] lg:items-start">
        <div className="painel overflow-hidden">
          <MidiaProduto produto={p} prioridade razao="aspect-[4/3]" />
          {!p.imagem && !p.amazon?.imagens?.grande && (
            <p className="border-t border-linha px-4 py-2.5 text-[0.78rem] text-tinta-suave">
              Silhueta em escala real, desenhada a partir das dimensões oficiais.
              Sem foto licenciada até a API da loja liberar.
            </p>
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="pastilha">{p.marca}</span>
            <span className="dados text-[0.78rem] text-tinta-suave">modelo {p.modelo}</span>
          </div>
          <h1 className="mt-3 titulo-ui text-[1.7rem] leading-[1.15] sm:text-[2.1rem]">
            {p.nome}
          </h1>
          <div className="mt-2">
            <Divulgacao atualizadoEm={dataLegivel(p.atualizadoEm)} />
          </div>
          <p className="mt-4 max-w-[58ch] text-[1rem] text-tinta-suave">{p.resumo}</p>

          <a
            href="#transparencia"
            className={`${faixa.classe} mt-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[0.85rem] font-semibold`}
          >
            <span className="dados">{t.nota}%</span> da ficha publicada
            <span className="font-normal opacity-80">· {faixa.rotulo}</span>
          </a>

          <ul className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {essenciais.map((campo) => {
              const valor = p.specs[campo.chave];
              const ausente = valor === null || valor === undefined;
              return (
                <li key={campo.chave} className="rounded-xl border border-linha bg-papel p-3">
                  <div className="flex items-center gap-1.5 text-[0.72rem] text-tinta-suave">
                    <Icone nome={iconeDo(campo.chave)} className={`h-3.5 w-3.5 ${ausente ? "text-ausente" : "text-acao"}`} />
                    <span className="truncate">{campo.rotulo}</span>
                  </div>
                  <div className={`dados mt-1 text-[0.98rem] ${ausente ? "text-ausente" : "font-semibold"}`}>
                    {valorLegivel(valor, campo)}
                  </div>
                </li>
              );
            })}
          </ul>

          <PrecoAmazon dados={p.amazon} />

          <LojaCta lojas={p.lojas} produto={p.nome} posicao="veredito" />

          {cat && (
            <div className="mt-2 flex flex-wrap gap-2">
              <Link href={`/comparar/${cat.slug}?p=${p.slug}`} className="pilula">
                <Icone nome="comparar" className="h-3.5 w-3.5" />
                Comparar com outro
              </Link>
              <Link href={`/categorias/${cat.slug}`} className="pilula">
                Todos de {cat.nome.toLowerCase()}
                <Icone nome="seta" className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {!p.imagem && p.specs.dimensoesMm ? (
          <section className="painel p-6">
            <h2 className="titulo-ui text-lg">Tamanho real</h2>
            <p className="mt-1 max-w-[46ch] text-[0.88rem] text-tinta-suave">
              Na escala das dimensões oficiais, contra o contorno de um cartão de
              crédito.
            </p>
            <div className="mt-5">
              <Silhueta dimensoes={p.specs.dimensoesMm as string} className="max-w-[20rem]" />
            </div>
          </section>
        ) : null}
        <section id="transparencia" className="painel p-6">
          <NotaTransparencia produto={p} campos={campos} />
        </section>
      </div>

      {p.divergencias?.length ? (
        <Divergencias itens={p.divergencias} campos={campos} fontes={p.fontes} specs={p.specs} />
      ) : null}

      <section id="ficha" className="painel mt-8 p-6">
        <h2 className="titulo-ui text-xl">Ficha técnica completa</h2>
        <p className="mt-1 text-[0.88rem] text-tinta-suave">
          Tudo que a fonte publica, e em cinza tudo que ela não publica.
        </p>
        <FichaSpecs produto={p} campos={campos} />
      </section>

      {p.relatos?.length ? (
        <section className="painel mt-8 p-6">
          <Relatos itens={p.relatos} />
        </section>
      ) : null}

      <section className="painel mt-8 p-6">
        <Fontes itens={p.fontes} />
      </section>
    </article>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import {
  comparativo,
  todosOsComparativos,
  dataLegivel,
  fotoDaBase,
  produtoDaBase,
} from "@/lib/conteudo";
import { JsonLd, schemaComparativo, schemaBreadcrumb } from "@/lib/schema";
import { tituloSeo, ogImagem } from "@/lib/site";
import { componentesMdx, opcoesMdx } from "@/components/mdx";
import { Divulgacao } from "@/components/divulgacao";
import { Lacunas } from "@/components/pros-contras";
import { LojaCta } from "@/components/loja-cta";
import { FrenteAFrente } from "@/components/frente-a-frente";
import { Fontes } from "@/components/fontes";
import { TabelaComparativa } from "@/components/tabela-comparativa";
import { Foto } from "@/components/foto";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return todosOsComparativos().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const c = comparativo(slug);
  if (!c) return {};
  return {
    title: tituloSeo(c.tituloCurto ?? c.titulo),
    description: c.subtitulo,
    alternates: { canonical: `/comparativos/${c.slug}` },
    // A arte de capa é sobretudo isto: o que aparece quando alguém cola o link
    // numa conversa. Sem ela, a rede escolhe sozinha um pedaço da página — por
    // isso, na falta da arte, entra a foto do primeiro produto comparado.
    openGraph: {
      title: c.titulo,
      description: c.subtitulo,
      type: "article",
      publishedTime: c.publicadoEm,
      modifiedTime: c.atualizadoEm,
      ...ogImagem(
        c.imagem ??
          fotoDaBase(
            c.concorrentes.map((x) => x.lojas),
            c.concorrentes.map((x) => x.nome),
          ),
      ),
    },
  };
}

export default async function PaginaComparativo({ params }: Params) {
  const { slug } = await params;
  const c = comparativo(slug);
  if (!c) notFound();

  const { content } = await compileMDX({
    source: c.corpo,
    components: componentesMdx,
    options: opcoesMdx,
  });

  return (
    <article className="mx-auto max-w-[var(--largura-prosa)] px-5 py-12">
      <JsonLd data={schemaComparativo(c)} />
      <JsonLd
        data={schemaBreadcrumb([
          { nome: "Início", url: "/" },
          { nome: "Comparativos", url: "/comparativos" },
          { nome: c.titulo, url: `/comparativos/${c.slug}` },
        ])}
      />
      <header>
        <Divulgacao atualizadoEm={dataLegivel(c.atualizadoEm)} />
        <h1 className="mt-3 font-titulo text-3xl leading-[1.12] tracking-tight sm:text-4xl">
          {c.titulo}
        </h1>
        <p className="mt-4 max-w-[62ch] text-lg text-tinta-suave">
          {c.subtitulo}
        </p>

        {/* Os dois produtos antes do texto: é o que faz a página se ler como
            comparação. A foto vem da base — nenhum comparativo declara imagem
            por concorrente —, pelo mesmo casamento que a imagem de
            compartilhamento já usava aqui. */}
        <FrenteAFrente
          concorrentes={c.concorrentes}
          fotos={c.concorrentes.map(
            (p) => p.imagem ?? fotoDaBase([p.lojas], [p.nome]),
          )}
          fichas={c.concorrentes.map((p) => produtoDaBase([p.lojas], [p.nome]))}
        />

        {/* Largura limitada de propósito: a arte é retrato 4:5, feita para
            rede social, e em tamanho cheio empurraria a tabela para fora da
            primeira tela — que é o que o leitor veio ler. */}
        {c.imagem && (
          <figure className="mt-8">
            <Foto
              src={c.imagem.src}
              alt={c.imagem.alt}
              tamanhos="(max-width: 400px) 92vw, 352px"
              className="mx-auto w-full max-w-[22rem] rounded-xl border border-linha"
            />
            <figcaption className="mt-2 text-center text-[0.75rem] text-tinta-suave">
              {c.imagem.credito}
            </figcaption>
          </figure>
        )}
      </header>

      <section className="my-10 border-y border-linha py-8">
        <h2 className="font-titulo text-xl">Quem ganha, e para quem</h2>
        <dl className="mt-4 space-y-4">
          {c.vencedores.map((v) => (
            <div key={v.perfil}>
              <dt className="font-medium">
                {v.perfil}: {v.produto}
              </dt>
              <dd className="max-w-[62ch] text-tinta-suave">{v.porque}</dd>
            </div>
          ))}
        </dl>
      </section>

      <TabelaComparativa produtos={c.concorrentes} linhas={c.linhas} />

      <div className="prosa">{content}</div>

      <Lacunas itens={c.lacunas} />

      {c.concorrentes.map((p) => (
        <div key={p.nome}>
          <h2 className="mt-10 font-titulo text-xl">{p.nome}</h2>
          <p className="mt-1 max-w-[62ch] text-tinta-suave">{p.linhaResumo}</p>
          <LojaCta lojas={p.lojas} produto={p.nome} posicao="fechamento" />
        </div>
      ))}

      <Fontes itens={c.fontes} />
    </article>
  );
}

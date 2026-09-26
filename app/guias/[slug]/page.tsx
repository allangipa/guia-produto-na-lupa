import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import {
  guia,
  todosOsGuias,
  dataLegivel,
  fotoDaBase,
  chegadaDe,
  produtoDaBase,
} from "@/lib/conteudo";
import { tituloSeo, ogImagem, lojasDe } from "@/lib/site";
import { categoria as buscarCategoria } from "@/lib/categorias";
import { componentesMdx, opcoesMdx } from "@/components/mdx";
import { Divulgacao } from "@/components/divulgacao";
import { Lacunas } from "@/components/pros-contras";
import { LojaCta, DivulgacaoComissao } from "@/components/loja-cta";
import { EscolhaDoGuia } from "@/components/escolha-do-guia";
import { Fontes } from "@/components/fontes";
import { JsonLd, schemaBreadcrumb } from "@/lib/schema";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return todosOsGuias().map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const g = guia(slug);
  if (!g) return {};
  return {
    title: tituloSeo(g.tituloCurto ?? g.titulo),
    description: g.subtitulo,
    alternates: { canonical: `/guias/${g.slug}` },
    openGraph: {
      title: g.titulo,
      description: g.subtitulo,
      ...ogImagem(
        fotoDaBase(
          g.escolhas.map((e) => e.lojas),
          g.escolhas.map((e) => e.produto),
        ),
      ),
    },
  };
}

export default async function PaginaGuia({ params }: Params) {
  const { slug } = await params;
  const g = guia(slug);
  if (!g) notFound();
  const cat = buscarCategoria(g.categoria);

  const { content } = await compileMDX({
    source: g.corpo,
    components: componentesMdx,
    options: opcoesMdx,
  });

  // As escolhas que têm para onde mandar o leitor. Serve para duas coisas na
  // seção de compra: saber se ela deve existir, e saber qual botão leva a cor
  // sólida — que é o da primeira escolha COM link, não o da primeira escolha.
  const comLink = g.escolhas.filter((e) => lojasDe(e.lojas).length > 0);

  return (
    <article className="mx-auto max-w-[var(--largura-prosa)] px-5 py-12">
      <JsonLd
        data={schemaBreadcrumb([
          { nome: "Início", url: "/" },
          ...(cat ? [{ nome: cat.nome, url: `/categorias/${cat.slug}` }] : []),
          { nome: g.titulo, url: `/guias/${g.slug}` },
        ])}
      />
      <header>
        <Divulgacao atualizadoEm={dataLegivel(g.atualizadoEm)} />
        <h1 className="mt-3 font-titulo text-3xl leading-[1.12] tracking-tight sm:text-4xl">
          {g.titulo}
        </h1>
        <p className="mt-4 max-w-[62ch] text-lg text-tinta-suave">{g.subtitulo}</p>
      </header>

      <section className="my-10 border-y border-linha py-8">
        <h2 className="font-titulo text-xl">A escolha certa depende de quem você é</h2>
        <ol className="mt-5 grid gap-3.5">
          {g.escolhas.map((e) => {
            const ficha = produtoDaBase([e.lojas], [e.produto]);
            return (
              <EscolhaDoGuia
                key={e.perfil}
                perfil={e.perfil}
                produto={e.produto}
                porque={e.porque}
                reviewSlug={e.reviewSlug}
                foto={ficha?.imagem ?? fotoDaBase([e.lojas], [e.produto])}
                ficha={ficha}
              />
            );
          })}
        </ol>
      </section>

      <div className="prosa">{content}</div>

      <Lacunas itens={g.lacunas} />

      {/*
        UM CTA POR ESCOLHA, NUM BLOCO SÓ, DEPOIS DE TUDO

        A seção fica depois do corpo e das lacunas porque a regra da casa é que
        o botão venha depois da entrega de valor. São vários botões, um por
        produto recomendado, e nenhum produto repete — o teto de três CTAs vale
        para blocos de interrupção, não para tabela de onde comprar. Ver
        "Regras técnicas de afiliado" no CLAUDE.md.

        Só o primeiro botão é sólido: uma cor de ação por página. E a divulgação
        aparece uma vez para a lista toda, em vez de se repetir sob cada botão,
        que numa lista de oito viraria oito parágrafos idênticos.

        Escolha sem link não entra como nome pelado: ou diz quando chega às
        lojas, ou fica de fora daqui e continua acessível pela ficha, linkada
        na lista de escolhas lá em cima.
      */}
      {comLink.length > 0 && (
        <section className="mt-12">
          <h2 className="font-titulo text-xl">Onde comprar cada um</h2>
          <DivulgacaoComissao plural={comLink.length > 1} />
          {g.escolhas.map((e) => {
            const temLink = lojasDe(e.lojas).length > 0;
            const chegada = temLink ? undefined : chegadaDe(e.produto);
            if (!temLink && !chegada) return null;
            return (
              <div key={e.produto} className="mt-6">
                <p className="font-medium">{e.produto}</p>
                {chegada ? (
                  <p className="mt-1 text-[0.88rem] text-tinta-suave">
                    Ainda não chegou às lojas. O fabricante marca{" "}
                    <strong className="dados">{dataLegivel(chegada)}</strong>.
                  </p>
                ) : (
                  <LojaCta
                    lojas={e.lojas}
                    produto={e.produto}
                    posicao="fechamento"
                    enfase={
                      e.produto === comLink[0].produto ? "solido" : "contorno"
                    }
                    divulgacao={false}
                  />
                )}
              </div>
            );
          })}
        </section>
      )}

      <Fontes itens={g.fontes} />
    </article>
  );
}

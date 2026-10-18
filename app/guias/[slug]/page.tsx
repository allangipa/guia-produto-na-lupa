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
import { LevaAoSimulador } from "@/components/leva-ao-simulador";
import { recortesDaCategoria, produtosDoRecorte } from "@/lib/recortes";
import { Lacunas } from "@/components/pros-contras";
import { LojaCta, DivulgacaoComissao } from "@/components/loja-cta";
import { EscolhaDoGuia } from "@/components/escolha-do-guia";
import { Fontes } from "@/components/fontes";
import { JsonLd, schemaBreadcrumb, schemaGuia, schemaPerguntas } from "@/lib/schema";
import { Perguntas } from "@/components/perguntas";
import { ComoFoiFeita } from "@/components/como-foi-feita";
import { Foto } from "@/components/foto";
import { produtosDaCategoria } from "@/lib/produtos";

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
    description: g.descricao ?? g.subtitulo,
    alternates: { canonical: `/guias/${g.slug}` },
    openGraph: {
      title: g.titulo,
      description: g.descricao ?? g.subtitulo,
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
  // Rótulo curto para a pílula: o título dos recortes é frase de busca.
  const listas = recortesDaCategoria(g.categoria).map((r) => ({
    slug: r.slug,
    rotulo: `${r.titulo.split(":")[0]} (${produtosDoRecorte(r).length})`,
  }));

  const { content } = await compileMDX({
    source: g.corpo,
    components: componentesMdx,
    options: opcoesMdx,
  });

  // As escolhas que têm para onde mandar o leitor. Serve para duas coisas na
  // seção de compra: saber se ela deve existir, e saber qual botão leva a cor
  // sólida — que é o da primeira escolha COM link, não o da primeira escolha.
  const comLink = g.escolhas.filter((e) => lojasDe(e.lojas).length > 0);

  // As escolhas com a ficha e a foto resolvidas uma vez: a fileira do topo e
  // os cards completos leem a mesma lista.
  const escolhas = g.escolhas.map((e, i) => {
    const ficha = produtoDaBase([e.lojas], [e.produto]);
    return {
      ...e,
      id: `escolha-${i + 1}`,
      ficha,
      foto: ficha?.imagem ?? fotoDaBase([e.lojas], [e.produto]),
    };
  });

  return (
    <article className="mx-auto max-w-[var(--largura-prosa)] px-5 py-12">
      <JsonLd data={schemaGuia(g)} />
      {g.perguntas?.length ? <JsonLd data={schemaPerguntas(g.perguntas)} /> : null}
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

      {/* A primeira tela, desde 17/10/2026: a caixa "como esta lista foi feita"
          e a fileira das escolhas com foto. Até então a primeira tela do guia
          era só texto — kicker, título, subtítulo e o título da seção — e a
          foto do produto só aparecia ao rolar. Os sites que ranqueiam abrem com
          um quadro-resumo e os critérios (docs/concorrentes-2026-10-17.md). A
          fileira é um índice: cada miniatura leva ao card completo, que
          continua abaixo com o porquê e os números. Não há botão de compra
          aqui: os CTAs do guia ficam juntos em "Onde comprar cada um". */}
      <ComoFoiFeita
        fontes={g.fontes}
        escolhas={g.escolhas.length}
        fichasNaBase={produtosDaCategoria(g.categoria).length}
        categoriaNome={cat?.nome}
      />

      <nav aria-label="As escolhas, em resumo" className="mt-4">
        <ol className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
          {escolhas.map((e) => (
            <li key={e.id}>
              <a
                href={`#${e.id}`}
                className="cartao group flex h-full flex-col p-2.5 transition hover:border-tinta-suave"
              >
                <span className="flex h-20 items-center justify-center rounded-md bg-superficie p-1.5">
                  {e.foto ? (
                    <Foto
                      src={e.foto.src}
                      alt=""
                      tamanhos="(max-width: 640px) 40vw, 140px"
                      className="h-full w-auto max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-[0.7rem] text-tinta-suave">sem foto oficial</span>
                  )}
                </span>
                <span className="mt-2 text-[0.7rem] font-semibold uppercase leading-tight tracking-[0.04em] text-tinta-suave">
                  {e.perfil}
                </span>
                <span className="mt-1 text-[0.82rem] font-medium leading-snug group-hover:text-acao-forte">
                  {e.produto}
                </span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <section className="my-10 border-y border-linha py-8">
        <h2 className="font-titulo text-xl">A escolha certa depende de quem você é</h2>
        <ol className="mt-5 grid gap-3.5">
          {escolhas.map((e) => (
            <EscolhaDoGuia
              key={e.perfil}
              id={e.id}
              perfil={e.perfil}
              produto={e.produto}
              porque={e.porque}
              reviewSlug={e.reviewSlug}
              foto={e.foto}
              ficha={e.ficha}
            />
          ))}
        </ol>
      </section>

      {/* A ferramenta da categoria, desde 07/10/2026: quem leu as escolhas por
          perfil tem como pergunta seguinte qual serve para a casa dele, e é
          isso que o simulador responde com a conta à vista. Link de página que
          o Google já indexa também é o que leva o robô às /simulador/<slug>.
          Não é CTA nem cor de ação. Só aparece nas categorias que têm
          ferramenta (FOCO_DA_CATEGORIA). */}
      <div className="-mt-4 mb-10">
        <LevaAoSimulador categoria={g.categoria} />
      </div>

      {/* As listas por recorte da categoria, desde 17/10/2026. Quem chega no
          guia de air fryer e quer "a de 12 litros" tem a página certa a um
          clique — e é o único caminho do robô até /listas a partir de uma
          página que já ranqueia. Antes só a página de categoria linkava. */}
      {listas.length > 0 && (
        <nav aria-label="Listas desta categoria" className="-mt-4 mb-10 flex flex-wrap items-center gap-2 text-[0.88rem]">
          <span className="text-tinta-suave">Listas:</span>
          {listas.map((r) => (
            <Link key={r.slug} href={`/listas/${r.slug}`} className="pilula">
              {r.rotulo}
            </Link>
          ))}
        </nav>
      )}

      <div className="prosa">{content}</div>

      <Lacunas itens={g.lacunas} />

      <Perguntas itens={g.perguntas} />

      {/*
        UM CTA POR ESCOLHA, NUM BLOCO SÓ, DEPOIS DE TUDO

        A seção fica depois do corpo e das lacunas porque a regra da casa é que
        o botão venha depois da entrega de valor. São vários botões, um por
        produto recomendado, e nenhum produto repete — o teto de três CTAs vale
        para blocos de interrupção, não para tabela de onde comprar. Ver
        "Regras técnicas de afiliado" no CLAUDE.md.

        Todos os botões são sólidos. Deixar só o primeiro cheio foi tentado em
        26/09/2026 e estava errado: aqui cada botão é um produto diferente, um
        por perfil de leitor, e pôr quatro com contorno dizia que aquelas quatro
        recomendações valem menos. Dentro de UM produto com várias lojas a
        hierarquia existe e continua — a segunda loja é alternativa da primeira.
        Entre produtos que são resposta para perguntas diferentes, não.

        A divulgação aparece uma vez para a lista toda, em vez de se repetir sob
        cada botão, que numa lista de oito viraria oito parágrafos idênticos.

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

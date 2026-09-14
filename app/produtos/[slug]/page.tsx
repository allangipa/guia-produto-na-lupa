import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  produto as buscarProduto,
  todosOsProdutos,
  produtosDaCategoria,
  camposDa,
  transparencia,
  faixaTransparencia,
  destaquesDa,
  iconeDo,
  valorLegivel,
} from "@/lib/produtos";
import { aindaNaoSaiu } from "@/lib/specs";
import { categoria as buscarCategoria } from "@/lib/categorias";
import { dataLegivel } from "@/lib/conteudo";
import { FichaSpecs, NotaTransparencia } from "@/components/ficha-specs";
import { Divergencias } from "@/components/divergencias";
import { Relatos } from "@/components/relatos";
import { MidiaProduto } from "@/components/midia-produto";
import { GaleriaProduto } from "@/components/galeria-produto";
import { CardProduto } from "@/components/card-produto";
import { ComparadoCom } from "@/components/comparado-com";
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

  // Relacionados = a mesma categoria, que é a única vizinhança em que a
  // comparação deste site funciona: mesmos campos, mesma régua. A marca do
  // produto aberto vem primeiro, porque "outro modelo da mesma marca" é a
  // dúvida mais frequente de quem está numa ficha; o resto entra na ordem do
  // arquivo. Cinco cabem numa fileira sem virar vitrine.
  const daCategoria = produtosDaCategoria(p.categoria).filter(
    (o) => o.slug !== p.slug,
  );
  const relacionados = [
    ...daCategoria.filter((o) => o.marca === p.marca),
    ...daCategoria.filter((o) => o.marca !== p.marca),
  ].slice(0, 5);

  // "Parecido" aqui tem definição, e ela fica escrita na tela: o campo que
  // encabeça a categoria — tela no celular, capacidade útil na airfryer — e os
  // três vizinhos mais próximos nele. Sem preço na base, ordenar por preço não
  // é opção; e ordenar por marca ou por ordem de arquivo não torna nada
  // parecido. Quem não publica o campo fica de fora da vizinhança, porque não
  // há como medir a distância.
  // Percorre os destaques até achar um que este produto publique: a Philco não
  // diz a capacidade útil da airfryer — que é justamente a lacuna da categoria
  // — e nem por isso ela deve cair na vizinhança genérica.
  const campoEixo = destaquesDa(p.categoria)
    .map((chave) => campos.find((c) => c.chave === chave && c.tipo === "numero"))
    .find((c) => c && typeof p.specs[c.chave] === "number");
  const meu = campoEixo ? p.specs[campoEixo.chave] : null;

  let concorrentes: typeof daCategoria;
  let criterio: string;
  if (campoEixo && typeof meu === "number") {
    concorrentes = daCategoria
      .filter((o) => typeof o.specs[campoEixo.chave] === "number")
      .sort(
        (a, b) =>
          Math.abs((a.specs[campoEixo.chave] as number) - meu) -
          Math.abs((b.specs[campoEixo.chave] as number) - meu),
      )
      .slice(0, 3);
    criterio = `Os três da categoria mais próximos em ${campoEixo.rotulo.toLowerCase()}.`;
  } else {
    concorrentes = relacionados.filter((o) => o.marca !== p.marca).slice(0, 3);
    criterio = "Três da mesma categoria, de outras marcas.";
  }

  // As linhas são os destaques da categoria mais os campos que contam para a
  // transparência, na ordem do esquema. Oito cabem sem virar ficha técnica —
  // a ficha inteira já está logo abaixo.
  const linhasComparativo = [
    ...destaquesDa(p.categoria),
    ...campos.filter((c) => c.contaTransparencia).map((c) => c.chave),
  ]
    .filter((chave, i, todas) => todas.indexOf(chave) === i)
    .map((chave) => campos.find((c) => c.chave === chave))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
    .filter((c) => !p.naoSeAplica?.includes(c.chave))
    .slice(0, 8);

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
          {/* Galeria só quando existe mais de uma foto oficial. Sem isso, o
              MidiaProduto continua respondendo por foto única, imagem
              licenciada da Amazon e silhueta — os três casos que ele já trata. */}
          {p.imagem && p.galeria?.length ? (
            <GaleriaProduto fotos={[p.imagem, ...p.galeria]} nome={p.nome} />
          ) : (
            <MidiaProduto produto={p} prioridade razao="aspect-[4/3]" />
          )}
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

          {/* O aviso fica aqui, e não só no bloco de loja, porque produto que
              ainda não saiu às vezes nem tem link de loja — o iPhone Duo não
              tem. Sem isto, a página inteira leria como a de um produto à
              venda e a data de lançamento só apareceria no meio do resumo. */}
          {aindaNaoSaiu(p) && (
            <p className="mt-5 max-w-[58ch] border-l-[3px] border-acao bg-realce px-4 py-3 text-[0.9rem]">
              Ainda não chegou às lojas. O fabricante marca{" "}
              <strong className="dados">{dataLegivel(p.nasLojasEm!)}</strong>. A
              ficha abaixo é a que a {p.marca} publicou no anúncio — nada aqui
              vem de uso, e o que a marca não declarou continua contando como
              omissão.
            </p>
          )}

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

          {/* Sem `nasLojasEm` aqui: o aviso já está acima, no topo da ficha.
              A prop existe para guias e comparativos, onde o botão aparece
              longe de qualquer cabeçalho de produto. */}
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

      <ComparadoCom
        produto={p}
        concorrentes={concorrentes}
        campos={campos}
        linhas={linhasComparativo}
        criterio={criterio}
      />

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

      {relacionados.length > 0 && cat && (
        <section className="mt-12">
          {/* "Outros áudio com ficha aberta" não existe em português. O nome da
              categoria entra como nome próprio, depois de uma preposição, e aí
              serve para as oito sem concordância a resolver. */}
          <h2 className="titulo-ui text-xl">Mais fichas em {cat.nome}</h2>
          <p className="mt-1 max-w-[62ch] text-[0.9rem] text-tinta-suave">
            Mesma categoria, mesmos campos, mesma régua de transparência — é
            isso que torna a comparação possível. A porcentagem mede quanto o
            fabricante publica, não quanto o produto é bom.
          </p>
          <ul className="rolo mt-5 grid auto-cols-[14.5rem] grid-flow-col gap-3.5 overflow-x-auto pb-3 sm:auto-cols-auto sm:grid-flow-row sm:grid-cols-3 lg:grid-cols-5">
            {relacionados.map((r) => (
              <li key={r.slug}>
                <CardProduto produto={r} campos={camposDa(r.categoria)} />
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={`/comparar/${cat.slug}?p=${p.slug}`} className="pilula">
              <Icone nome="comparar" className="h-3.5 w-3.5" />
              Comparar com um destes
            </Link>
            <Link href={`/categorias/${cat.slug}`} className="pilula">
              Ver a categoria inteira
            </Link>
          </div>
        </section>
      )}
    </article>
  );
}

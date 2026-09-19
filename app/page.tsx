import type { Metadata } from "next";
import Link from "next/link";
import {
  todosOsReviews,
  todosOsComparativos,
  todosOsGuias,
  dataLegivel,
} from "@/lib/conteudo";
import { categorias, posicaoNaHome } from "@/lib/categorias";
import { departamentos } from "@/lib/departamentos";
import { todosOsProdutos, camposDa, transparencia } from "@/lib/produtos";
import { aindaNaoSaiu } from "@/lib/specs";
import { jaNasLojas, lancamentos } from "@/lib/lancamentos";
import { linkAmazon } from "@/lib/site";
import { CardProduto } from "@/components/card-produto";
import { Icone } from "@/components/icones";

/**
 * A home era a única página sem `canonical` — todas as outras declaram a sua.
 * Sem ela, qualquer endereço que chegue ao mesmo conteúdo (`/index.html`, um
 * link com `?utm_source=...`, `www` contra a raiz) pode ser indexado como
 * página separada, e as duas versões disputam a mesma posição. A tag fica
 * aqui, e não no layout, de propósito: no layout ela seria herdada por
 * qualquer página futura que esquecesse a sua, e uma página interna dizendo
 * ser a home é pior do que página sem canonical.
 */
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  // A capa da home e a foto do produto que a propria faixa destaca. Sai do
  // mesmo lugar que a faixa le, entao acompanha sozinha quando o destaque muda
  // — e nao ha arte generica inventada so para preencher o campo.
  openGraph: (() => {
    const l = lancamentos[0];
    const p = l && todosOsProdutos().find((x) => x.slug === l.slugProduto);
    return p?.imagem
      ? { images: [{ url: p.imagem.src, alt: p.imagem.alt }] }
      : {};
  })(),
};

/**
 * Título de seção no padrão de loja: frase curta com a palavra-chave em cor de
 * ação e um traço embaixo, "ver todos" à direita. Um lugar só para o estilo
 * não divergir entre as seções.
 */
function TituloSecao({
  antes,
  destaque,
  href,
  acao = "Ver todos",
  sub,
}: {
  antes: string;
  destaque: string;
  href: string;
  acao?: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
      <div>
        <h2 className="titulo-ui text-[1.35rem]">
          {antes} <span className="text-acao-forte">{destaque}</span>
        </h2>
        <span className="mt-1.5 block h-[3px] w-24 rounded-full bg-acao" aria-hidden />
        {sub && <p className="mt-2 text-[0.85rem] text-tinta-suave">{sub}</p>}
      </div>
      <Link href={href} className="inline-flex items-center gap-1 text-[0.9rem] font-medium text-tinta-suave hover:text-acao-forte">
        {acao} <Icone nome="seta" className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

export default function Home() {
  const reviews = todosOsReviews();
  const comparativos = todosOsComparativos();
  const guias = todosOsGuias();
  const produtos = todosOsProdutos();

  const marcas = [...new Set(produtos.map((p) => p.marca))];
  const media = produtos.length
    ? Math.round(
        produtos.reduce(
          (soma, p) => soma + transparencia(p, camposDa(p.categoria)).nota,
          0,
        ) / produtos.length,
      )
    : 0;

  // A prateleira mostra só o que dá para comprar hoje. Produto anunciado e ainda
  // não lançado tem lugar próprio nesta página — o herói e "Próximos
  // lançamentos" — e ocupava a prateleira empurrando para fora quem já está à
  // venda: em Celulares os cinco cards eram iPhones, três deles sem data de
  // loja cumprida. A contagem do "Ver as N" continua sendo a da categoria
  // inteira, que é o que o visitante encontra ao clicar.
  const prateleiras = categorias
    .map((c) => {
      const daCategoria = produtos.filter((p) => p.categoria === c.slug);
      return {
        cat: c,
        total: daCategoria.length,
        itens: daCategoria.filter((p) => !aindaNaoSaiu(p)),
      };
    })
    .filter((p) => p.itens.length > 0);

  // A fileira de círculos e a pilha de prateleiras cresciam uma por categoria.
  // Com sete cabia; com doze a home já era um rolo, e o plano passa de trinta.
  // Agora os círculos são por departamento — cinco, número que não acompanha o
  // de categorias — e as prateleiras param nas seis mais completas, com o resto
  // a um clique em /categorias.
  const porDepartamento = departamentos
    .map((d) => {
      // Na ordem que o departamento declara, não na de `categorias`. A capa e o
      // ícone saem do primeiro item, e "Celular e tablet" vinha com um power
      // bank porque `energia` está antes de `celular` na lista geral. O
      // departamento já diz em que ordem as categorias dele aparecem — o menu e
      // o índice respeitam isso, e a home era o único lugar que não respeitava.
      const itens = d.categorias.flatMap((s) => {
        const p = prateleiras.find((x) => x.cat.slug === s);
        return p ? [p] : [];
      });
      return {
        dep: d,
        total: itens.reduce((n, p) => n + p.total, 0),
        capa: itens.flatMap((p) => p.itens).find((p) => p.imagem),
        iconeDe: itens[0]?.cat.slug ?? d.categorias[0],
      };
    })
    .filter((d) => d.total > 0);

  // A ordem sai de ORDEM_NA_HOME, não da contagem de fichas. Ordenar por
  // contagem fazia a home se reorganizar sozinha a cada categoria nova — as
  // cinco de 18/09/2026 tomaram as seis vagas e Celulares saiu da página.
  // Quantas aparecem é o único número a mexer aqui; a ordem se muda em
  // lib/categorias.ts.
  const VITRINE = 12;
  const emDestaque = [...prateleiras]
    .sort((a, b) => posicaoNaHome(a.cat.slug) - posicaoNaHome(b.cat.slug))
    .slice(0, VITRINE);
  const restantes = prateleiras.length - emDestaque.length;

  const destaques = lancamentos
    .map((l) => ({ ...l, produto: produtos.find((p) => p.slug === l.slugProduto) }))
    .filter((l) => l.produto);
  const heroi = destaques[0];
  const proximos = destaques.slice(1);
  // A faixa anunciava "Pre-venda aberta" no dia seguinte a data de loja do
  // iPhone 18 Pro. A etiqueta agora sai da data, nao de texto fixo.
  const heroiJaSaiu = heroi ? jaNasLojas(heroi) : false;

  // Marcas que mais publicam a ficha: média das notas, mínimo de dois produtos
  // para não premiar amostra de um. A tabela completa está em /transparencia.
  const porMarca = marcas
    .map((m) => {
      const lista = produtos.filter((p) => p.marca === m);
      const nota = Math.round(
        lista.reduce((s, p) => s + transparencia(p, camposDa(p.categoria)).nota, 0) / lista.length,
      );
      return { marca: m, nota, n: lista.length, exemplo: lista.find((p) => p.imagem) ?? lista[0] };
    })
    .filter((m) => m.n >= 2)
    .sort((a, b) => b.nota - a.nota)
    .slice(0, 3);
  const tons = ["faixa text-faixa-tinta", "bg-medio-suave text-tinta", "bg-acao-suave text-tinta"];

  const editorial = [
    ...guias.map((g) => ({ tipo: "Guia", href: `/guias/${g.slug}`, titulo: g.titulo, sub: g.subtitulo, data: g.atualizadoEm })),
    ...comparativos.map((c) => ({ tipo: "Comparativo", href: `/comparativos/${c.slug}`, titulo: c.titulo, sub: c.subtitulo, data: c.atualizadoEm })),
    ...reviews.map((r) => ({ tipo: "Análise", href: `/reviews/${r.slug}`, titulo: r.titulo, sub: r.subtitulo, data: r.atualizadoEm })),
  ]
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-[var(--largura-ferramenta)] px-5 pb-8">
      {/*
        Herói escuro no padrão de loja: uma faixa, um produto, uma frase.
        Nada troca sozinho e não há contagem regressiva — o lançamento em
        destaque é um só, e as datas vêm da página do fabricante. A regra do
        projeto proíbe movimento automático, não o mecanismo: se um dia houver
        mais de um lançamento para mostrar aqui, pode ter seta operada pelo
        leitor, desde que a faixa não ande sozinha.
      */}
      {heroi ? (
        <section className="faixa relative mt-5 grid overflow-hidden rounded-[var(--raio-card)] shadow-[var(--sombra-2)] md:grid-cols-[1.25fr_1fr] md:items-center">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 90% at 85% 50%, color-mix(in oklab, var(--color-acao) 45%, transparent), transparent 70%)",
            }}
          />
          <div className="relative p-7 md:p-10 lg:p-12">
            <span className="pastilha !bg-white/10 !text-white">
              {heroiJaSaiu ? `À venda desde ${heroi.nasLojas}` : heroi.etapa}
            </span>
            <h1 className="mt-4 max-w-[16ch] font-titulo text-[2.2rem] leading-[1.02] tracking-tight sm:text-[2.9rem] lg:text-[3.4rem]">
              {heroi.titulo}
            </h1>
            <p className="mt-4 max-w-[52ch] text-[0.98rem] leading-relaxed text-faixa-suave">
              {heroi.resumo}
            </p>
            <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-2">
              {(heroiJaSaiu
                ? [{ r: "Nas lojas desde", v: heroi.nasLojas }]
                : [
                    { r: "Pré-venda", v: heroi.preVenda },
                    { r: "Nas lojas", v: heroi.nasLojas },
                  ]
              ).map((d) => (
                <div key={d.r}>
                  <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-faixa-suave">{d.r}</dt>
                  <dd className="dados text-[1.15rem] font-semibold">{d.v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              {heroi.produto!.lojas.amazon && (
                <a
                  href={linkAmazon(heroi.produto!.lojas.amazon)}
                  rel="sponsored nofollow noopener"
                  target="_blank"
                  className="botao botao-primario"
                >
                  {heroiJaSaiu ? "Disponível na Amazon" : "Pré-venda na Amazon"}{" "}
                  <Icone nome="seta" className="h-4 w-4" />
                </a>
              )}
              <Link href={`/produtos/${heroi.produto!.slug}`} className="botao !border-white/25 !bg-white/10 !text-white hover:!bg-white/15">
                Ficha completa
              </Link>
              {heroi.comparativoSlug && (
                <Link href={`/comparativos/${heroi.comparativoSlug}`} className="inline-flex items-center gap-1.5 px-2 text-[0.9rem] text-faixa-suave hover:text-white">
                  <Icone nome="comparar" className="h-4 w-4" /> Contra o iPhone 17
                </Link>
              )}
            </div>
            <p className="mt-6 text-[0.72rem] text-faixa-suave">
              Datas: {heroi.fonte.titulo}, consultado em {dataLegivel(heroi.fonte.consultadaEm)}. Link de afiliado: o site recebe comissão e você paga o mesmo preço.
            </p>
          </div>
          {/* Foto oficial vem em fundo branco; em vez de fingir recorte, ela
              vira um cartão de produto flutuando sobre a faixa escura. */}
          <Link href={`/produtos/${heroi.produto!.slug}`} className="relative flex items-center justify-center p-6 md:p-8">
            <span className="relative flex aspect-[4/3] w-full max-w-[22rem] items-center justify-center overflow-hidden rounded-2xl bg-white p-5 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.6)]">
              {heroi.produto!.imagem ? (
                <img src={heroi.produto!.imagem.src} alt={heroi.produto!.imagem.alt} className="h-full w-full object-contain" />
              ) : (
                <Icone nome="celular" className="h-24 w-24 text-ausente" />
              )}
              {heroi.produto!.imagem && (
                <span className="absolute bottom-2 right-3 text-[0.62rem] text-[#5d6a73]">{heroi.produto!.imagem.credito}</span>
              )}
            </span>
          </Link>
        </section>
      ) : (
        <section className="banner mt-5 p-8">
          <h1 className="font-titulo text-[2.4rem] leading-tight tracking-tight">Compare fichas técnicas oficiais, lado a lado.</h1>
        </section>
      )}

      {/* A tese do site e os números da base, numa tira — o herói é do produto. */}
      <section className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="cartao flex items-center gap-3.5 p-4 lg:col-span-1">
          <img src="/marca/simbolo.svg" alt="" aria-hidden width={44} height={44} className="so-claro h-11 w-11 shrink-0" />
          <img src="/marca/simbolo-fundo-escuro.svg" alt="" aria-hidden width={44} height={44} className="so-escuro h-11 w-11 shrink-0" />
          <p className="text-[0.88rem] leading-snug">
            <strong className="titulo-ui">Fichas oficiais, lado a lado.</strong>{" "}
            <span className="text-tinta-suave">Cada número com a fonte, e o que o fabricante omite escrito.</span>
          </p>
        </div>
        {[
          { v: produtos.length, r: "produtos com ficha oficial", href: "/comparar/" + (prateleiras[0]?.cat.slug ?? "audio") },
          { v: marcas.length, r: "fabricantes no ranking", href: "/transparencia" },
          { v: `${media}%`, r: "da ficha é publicada, em média", href: "/transparencia", cor: "text-atencao" },
        ].map((s) => (
          <Link key={s.r} href={s.href} className="cartao flex items-center gap-4 p-4">
            <span className={`dados text-[1.9rem] font-semibold leading-none ${s.cor ?? ""}`}>{s.v}</span>
            <span className="text-[0.82rem] leading-snug text-tinta-suave">{s.r}</span>
          </Link>
        ))}
      </section>

      {/* Departamentos em círculo, como a fileira "comprar por categoria" das
          lojas: a foto de um produto de dentro vira o ícone do departamento. */}
      <section className="mt-12">
        <TituloSecao antes="Compre por" destaque="departamento" href="/categorias" acao="Todas as categorias" />
        <ul className="rolo mt-6 flex gap-4 overflow-x-auto pb-3 sm:grid sm:grid-cols-3 md:grid-cols-5 sm:overflow-visible">
          {porDepartamento.map(({ dep, total, capa, iconeDe }) => (
            <li key={dep.slug} className="shrink-0 sm:shrink">
              <Link href={`/categorias#${dep.slug}`} className="group flex w-[7.5rem] flex-col items-center gap-3 sm:w-auto">
                <span className="cartao flex h-[7.5rem] w-[7.5rem] items-center justify-center overflow-hidden !rounded-full bg-superficie p-4 group-hover:!border-acao">
                  {capa?.imagem ? (
                    <img src={capa.imagem.src} alt="" className="h-full w-full object-contain" />
                  ) : (
                    <Icone nome={iconeDe} className="h-10 w-10 text-acao" />
                  )}
                </span>
                <span className="text-center text-[0.9rem] font-medium leading-tight group-hover:text-acao-forte">
                  {dep.nome}
                  <span className="dados block text-[0.72rem] font-normal text-tinta-suave">{total} fichas</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/*
        O título era "Os mais vendidos em X" e foi corrigido em 14/09/2026:
        a prateleira mostra cinco de dez, na ordem do arquivo, e em Celulares
        os primeiros são lançamentos em pré-venda — chamar isso de "mais
        vendidos" afirmava mais do que o dado sustenta. A seleção da base
        sai mesmo do ranking da Amazon, e essa afirmação, com data e fonte,
        vive na página da categoria e no guia, onde as fontes estão listadas.
        Os cards são só de produto já à venda (ver `aindaNaoSaiu`).
      */}
      {emDestaque.map(({ cat, itens, total }) => (
        <section key={cat.slug} className="mt-12">
          <TituloSecao antes="Fichas de" destaque={cat.nome} href={`/categorias/${cat.slug}`} acao={`Ver as ${total}`} sub={cat.dorPrincipal} />
          <ul className="rolo mt-5 grid auto-cols-[14.5rem] grid-flow-col gap-3.5 overflow-x-auto pb-3 sm:auto-cols-auto sm:grid-flow-row sm:grid-cols-3 lg:grid-cols-5">
            {itens.slice(0, 5).map((p) => (
              <li key={p.slug}>
                <CardProduto produto={p} campos={camposDa(p.categoria)} />
              </li>
            ))}
          </ul>
        </section>
      ))}

      {restantes > 0 && (
        <p className="mt-10 text-center">
          <Link href="/categorias" className="botao botao-secundario">
            Mais {restantes} {restantes === 1 ? "categoria" : "categorias"} no
            índice completo
          </Link>
        </p>
      )}

      {/* Marcas, no lugar dos "top brands" de loja: aqui a régua é quanto da
          ficha a marca publica — o único ranking que este site pode fazer. */}
      {porMarca.length > 0 && (
        <section className="mt-12">
          <TituloSecao antes="Marcas que mais publicam a" destaque="ficha" href="/transparencia" acao="Ranking completo" sub="Média da nota de transparência dos produtos da marca — é sobre a documentação, não sobre o produto." />
          <ul className="mt-5 grid gap-3.5 md:grid-cols-3">
            {porMarca.map((m, i) => (
              <li key={m.marca}>
                <Link href="/transparencia" className={`cartao relative grid h-40 grid-cols-[1fr_7.5rem] items-center gap-3 overflow-hidden p-5 ${tons[i]}`}>
                  <div className="min-w-0">
                    <span className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] opacity-70">{m.marca}</span>
                    <span className="dados mt-1 block text-[2.4rem] font-semibold leading-none">{m.nota}%</span>
                    <span className="mt-1 block text-[0.8rem] leading-snug opacity-80">da ficha publicada · {m.n} produtos</span>
                  </div>
                  <span className="flex h-28 w-full items-center justify-center overflow-hidden rounded-xl bg-white/90 p-2">
                    {m.exemplo?.imagem && (
                      <img src={m.exemplo.imagem.src} alt="" className="h-full w-full object-contain" />
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {proximos.length > 0 && (
        <section className="mt-12">
          <TituloSecao antes="Próximos" destaque="lançamentos" href="/categorias/celular" />
          <ul className="mt-5 grid gap-3.5 md:grid-cols-2">
            {proximos.map((l) => (
              <li key={l.slugProduto}>
                <Link href={`/produtos/${l.produto!.slug}`} className="cartao flex items-center gap-5 p-5">
                  <span className="flex h-24 w-28 shrink-0 items-center justify-center rounded-xl bg-superficie p-2">
                    {l.produto!.imagem && <img src={l.produto!.imagem.src} alt="" className="h-full w-full object-contain" />}
                  </span>
                  <span className="min-w-0">
                    <span className="pastilha">{l.etapa}</span>
                    <span className="mt-2 block titulo-ui text-[1.1rem]">{l.titulo}</span>
                    <span className="mt-1 block text-[0.85rem] text-tinta-suave">Nas lojas em <span className="dados">{l.nasLojas}</span> · {l.fonte.titulo}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {editorial.length > 0 && (
        <section className="mt-12">
          <TituloSecao antes="Guias e" destaque="comparativos" href="/guias" acao="Ver tudo" />
          <ul className="mt-5 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {editorial.map((e) => (
              <li key={e.href}>
                <Link href={e.href} className="cartao group flex h-full flex-col p-5">
                  <span className="pastilha pastilha-neutra self-start">{e.tipo}</span>
                  <span className="mt-3 line-clamp-2 titulo-ui text-[1.05rem] leading-snug group-hover:text-acao-forte">{e.titulo}</span>
                  <span className="mt-2 line-clamp-2 text-[0.88rem] text-tinta-suave">{e.sub}</span>
                  <span className="mt-auto pt-4 text-[0.75rem] text-tinta-suave">Atualizado em {dataLegivel(e.data)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import { tituloSeo } from "@/lib/site";
import Link from "next/link";
import { categorias } from "@/lib/categorias";
import {
  todosOsProdutos,
  camposDa,
  transparencia,
  faixaTransparencia,
  type Campo,
  type Produto,
} from "@/lib/produtos";
import { Icone } from "@/components/icones";
import { dataLegivel } from "@/lib/conteudo";

export const metadata: Metadata = {
  title: tituloSeo("Ranking de transparência: quem publica a ficha inteira"),
  description:
    "Quanto da ficha técnica cada fabricante publica na própria página, marca por marca e produto por produto. Sem nota nossa: ou o dado está publicado, ou não está.",
  alternates: { canonical: "/transparencia" },
};

/**
 * O ranking é a soma do que já existe em cada ficha: a nota de transparência é
 * a única do site que não passa por julgamento, e por isso é a única que pode
 * ser somada entre marcas sem virar opinião. Ela mede a documentação, não o
 * produto — e a página repete isso porque é o erro de leitura mais fácil.
 */
type Marca = {
  nome: string;
  produtos: { p: Produto; nota: number; ausentes: Campo[] }[];
  media: number;
  categorias: string[];
  /** Campos mais omitidos pela marca, contando em quantos produtos faltam. */
  maisOmitidos: { campo: Campo; vezes: number }[];
};

function classifica(produtos: Produto[]): Marca[] {
  const porMarca = new Map<string, Marca["produtos"]>();
  for (const p of produtos) {
    const t = transparencia(p, camposDa(p.categoria));
    porMarca.set(p.marca, [
      ...(porMarca.get(p.marca) ?? []),
      { p, nota: t.nota, ausentes: t.ausentes },
    ]);
  }
  return [...porMarca.entries()]
    .map(([nome, lista]) => {
      const contagem = new Map<string, { campo: Campo; vezes: number }>();
      for (const { ausentes } of lista) {
        for (const c of ausentes) {
          const atual = contagem.get(c.chave);
          contagem.set(c.chave, { campo: c, vezes: (atual?.vezes ?? 0) + 1 });
        }
      }
      return {
        nome,
        produtos: lista.sort((a, b) => b.nota - a.nota),
        media: Math.round(lista.reduce((s, x) => s + x.nota, 0) / lista.length),
        categorias: [...new Set(lista.map((x) => x.p.categoria))],
        maisOmitidos: [...contagem.values()]
          .sort((a, b) => b.vezes - a.vezes)
          .slice(0, 3),
      };
    })
    .sort((a, b) => b.media - a.media || b.produtos.length - a.produtos.length);
}

function nomeCategoria(slug: string) {
  return categorias.find((c) => c.slug === slug)?.nome ?? slug;
}

export default function Transparencia() {
  const produtos = todosOsProdutos();
  const marcas = classifica(produtos);
  const atualizadoEm = produtos
    .map((p) => p.atualizadoEm)
    .sort()
    .at(-1);
  const melhor = marcas[0];
  const pior = marcas.at(-1);

  const porCategoria = categorias
    .map((c) => ({
      cat: c,
      itens: produtos
        .filter((p) => p.categoria === c.slug)
        .map((p) => ({ p, t: transparencia(p, camposDa(c.slug)) }))
        .sort((a, b) => b.t.nota - a.t.nota),
    }))
    .filter((c) => c.itens.length > 0);

  return (
    <div className="mx-auto max-w-[var(--largura-ferramenta)] px-5 pb-12">
      <section className="banner mt-5 grid gap-6 p-6 md:grid-cols-[1.3fr_1fr] md:items-center md:p-8">
        <div>
          <span className="pastilha">Ranking de transparência</span>
          <h1 className="mt-3 max-w-[22ch] font-titulo text-[1.9rem] leading-[1.1] tracking-tight sm:text-[2.4rem]">
            Quem publica a ficha inteira — e quem deixa de fora
          </h1>
          <p className="mt-3 max-w-[58ch] text-[0.95rem] text-tinta-suave">
            Cada produto do site tem uma nota de transparência: a porcentagem
            dos campos comparáveis que o fabricante publica na própria página.
            Aqui essas notas viram um ranking por marca. É a única conta do
            site sem julgamento nosso — ou o dado está publicado, ou não está.
            Mede a documentação, não o produto.
          </p>
        </div>
        {melhor && pior && (
          <dl className="grid grid-cols-2 gap-3">
            {[
              { r: "publica mais", m: melhor },
              { r: "publica menos", m: pior },
            ].map((s) => (
              <div key={s.r} className="rounded-xl border border-linha bg-papel/70 p-3.5">
                <dd className="dados text-2xl font-semibold leading-none">
                  {s.m.media}%
                </dd>
                <dt className="mt-1.5 text-[0.75rem] leading-snug text-tinta-suave">
                  <span className="font-semibold text-tinta">{s.m.nome}</span>{" "}
                  {s.r}, em {s.m.produtos.length}{" "}
                  {s.m.produtos.length === 1 ? "produto" : "produtos"}
                </dt>
              </div>
            ))}
          </dl>
        )}
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <div>
            <h2 className="titulo-ui text-[1.35rem]">Por marca</h2>
            <p className="mt-0.5 text-[0.85rem] text-tinta-suave">
              Média das notas dos produtos da marca na base. Marca com um
              produto só é uma amostra, não um veredito.
            </p>
          </div>
          {atualizadoEm && (
            <p className="text-[0.8rem] text-tinta-suave">
              Base atualizada em {dataLegivel(atualizadoEm)}
            </p>
          )}
        </div>

        <ol className="mt-4 grid gap-3">
          {marcas.map((m, i) => {
            const faixa = faixaTransparencia(m.media);
            return (
              <li key={m.nome} className="painel p-5">
                <div className="grid gap-4 md:grid-cols-[3rem_1fr_auto] md:items-start">
                  <span className="dados text-2xl font-semibold text-tinta-suave">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="titulo-ui text-[1.15rem]">{m.nome}</h3>
                      <span className={`${faixa.classe} rounded-full px-2 py-0.5 text-[0.7rem] font-semibold`}>
                        {faixa.rotulo}
                      </span>
                      <span className="text-[0.8rem] text-tinta-suave">
                        {m.produtos.length}{" "}
                        {m.produtos.length === 1 ? "produto" : "produtos"} ·{" "}
                        {m.categorias.map(nomeCategoria).join(", ")}
                      </span>
                    </div>
                    {/* Barra: a nota como largura, para o ranking se ler de
                        relance sem depender só do número. */}
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-superficie">
                      <div
                        className="h-full rounded-full bg-acao"
                        style={{ width: `${m.media}%` }}
                      />
                    </div>
                    {m.maisOmitidos.length > 0 ? (
                      <p className="mt-3 text-[0.88rem] text-tinta-suave">
                        <span className="text-tinta">Não informa:</span>{" "}
                        {m.maisOmitidos.map((o, k) => (
                          <span key={o.campo.chave}>
                            {k > 0 && ", "}
                            <span className="text-ausente">{o.campo.rotulo.toLowerCase()}</span>
                            {m.produtos.length > 1 && (
                              <span className="dados"> ({o.vezes}/{m.produtos.length})</span>
                            )}
                          </span>
                        ))}
                      </p>
                    ) : (
                      <p className="mt-3 text-[0.88rem] text-tinta-suave">
                        Publica todos os campos comparáveis da categoria.
                      </p>
                    )}
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {m.produtos.map(({ p, nota }) => (
                        <li key={p.slug}>
                          <Link href={`/produtos/${p.slug}`} className="pilula">
                            <span className="dados">{nota}%</span>
                            <span className="max-w-[18ch] truncate">{p.nome}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="dados text-3xl font-semibold leading-none md:text-right">
                    {m.media}%
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {porCategoria.map(({ cat, itens }) => (
        <section key={cat.slug} className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <div>
              <h2 className="titulo-ui text-[1.35rem]">{cat.nome}</h2>
              <p className="mt-0.5 text-[0.85rem] text-tinta-suave">
                {itens[0].t.total} campos comparáveis na categoria. Quem publica
                todos fica em 100%.
              </p>
            </div>
            <Link href={`/categorias/${cat.slug}`} className="pilula">
              Ver a categoria <Icone nome="seta" className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="painel mt-4 overflow-x-auto">
            <table className="w-full text-[0.9rem]">
              <thead>
                <tr className="border-b border-linha text-left text-[0.72rem] uppercase tracking-[0.07em] text-tinta-suave">
                  <th className="px-5 py-3 font-semibold">Produto</th>
                  <th className="px-5 py-3 font-semibold">Publicado</th>
                  <th className="px-5 py-3 font-semibold">Não informa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-linha">
                {itens.map(({ p, t }) => (
                  <tr key={p.slug}>
                    <td className="px-5 py-3">
                      <Link href={`/produtos/${p.slug}`} className="hover:text-acao-forte">
                        <span className="block text-[0.7rem] font-semibold uppercase tracking-[0.07em] text-tinta-suave">
                          {p.marca}
                        </span>
                        {p.nome}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-28 shrink-0 overflow-hidden rounded-full bg-superficie">
                          <div className="h-full rounded-full bg-acao" style={{ width: `${t.nota}%` }} />
                        </div>
                        <span className="dados font-semibold">{t.nota}%</span>
                        <span className="dados text-[0.78rem] text-tinta-suave">
                          {t.preenchidos}/{t.total}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[0.85rem] text-tinta-suave">
                      {t.ausentes.length
                        ? t.ausentes.map((c) => c.rotulo.toLowerCase()).join(", ")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <section className="prosa mt-12 max-w-[var(--largura-prosa)]">
        <h2>Como a conta é feita</h2>
        <p>
          Cada categoria tem uma lista de campos comparáveis — os que um
          fabricante razoavelmente deveria publicar, como capacidade útil numa
          airfryer ou peso num fone. A nota de um produto é a fração desses
          campos que aparece na documentação oficial consultada, com a página e
          a data listadas na ficha. Campo que não se aplica ao produto (estojo
          de carga num fone over-ear, por exemplo) fica fora da conta.
        </p>
        <p>
          A nota da marca é a média simples das notas dos produtos dela na base.
          Ela sobe quando a marca publica mais e desce quando publica menos —
          nunca quando o produto é pior ou melhor, porque isso este site não
          mede. Se uma ficha oficial mudar, a nota muda na próxima atualização;
          correções chegam por{" "}
          <a href="mailto:contato@guiaprodutonalupa.com.br">
            contato@guiaprodutonalupa.com.br
          </a>
          .
        </p>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { tituloSeo, lojasDe } from "@/lib/site";
import { produto as buscarProduto, type Produto } from "@/lib/produtos";
import { todasAsCombinacoes, type Resultado } from "@/lib/simulador";
import { dataLegivel } from "@/lib/conteudo";
import { SetupSimulator } from "@/components/setup-simulator";
import { MidiaProduto } from "@/components/midia-produto";
import { LojaCta, DivulgacaoComissao } from "@/components/loja-cta";
import { Divulgacao } from "@/components/divulgacao";

export const metadata: Metadata = {
  title: tituloSeo("Simulador: qual Wi-Fi, automação ou câmera para a sua casa"),
  description:
    "Três perguntas e uma recomendação de rede Wi-Fi, automação ou câmera, tirada só das fichas oficiais dos fabricantes — com o que a documentação não informa escrito ao lado.",
  alternates: { canonical: "/simulador" },
};

/**
 * Toda indicação da matriz precisa existir na base e ter loja. Recomendar um
 * slug que saiu da base — a regra de 26/09 apaga produto sem link — deixaria
 * o leitor com um card sem botão no fim de um simulador de compra. Quebra o
 * build, como os outros `verificar()` do projeto.
 */
function resolver(): [string, Resultado, Produto[]][] {
  const faltando: string[] = [];
  const saida = todasAsCombinacoes().map(([chave, r]) => {
    const produtos = r.indicacoes.map((i) => {
      const p = buscarProduto(i.slug);
      if (!p || !lojasDe(p.lojas).length) faltando.push(`${chave} → ${i.slug}`);
      return p!;
    });
    return [chave, r, produtos] as [string, Resultado, Produto[]];
  });
  if (faltando.length) {
    throw new Error(
      `Simulador recomenda produto fora da base ou sem loja: ${faltando.join(", ")}. ` +
        `Troque a indicação em lib/simulador.ts.`,
    );
  }
  return saida;
}

function Cards({ r, produtos }: { r: Resultado; produtos: Produto[] }) {
  return (
    <>
      <ul
        className={`mt-6 grid gap-5 ${produtos.length > 1 ? "md:grid-cols-2" : "max-w-xl"}`}
      >
        {produtos.map((p, i) => (
          <li key={p.slug} className="painel flex flex-col overflow-hidden">
            <MidiaProduto produto={p} tamanhos="(max-width: 768px) 89vw, 420px" />
            <div className="flex flex-1 flex-col p-5">
              <p className="text-[0.8rem] text-tinta-suave">{p.specs.tipo as string}</p>
              <h3 className="titulo-ui mt-0.5 text-[1.2rem]">{p.nome}</h3>
              <p className="mt-2 flex-1 text-[0.93rem]">{r.indicacoes[i].porque(p)}</p>
              <Link
                href={`/produtos/${p.slug}`}
                className="mt-3 text-[0.88rem] underline decoration-linha underline-offset-4 hover:decoration-acao"
              >
                Ver a ficha completa, com fontes e lacunas
              </Link>
              <LojaCta
                lojas={p.lojas}
                produto={p.nome}
                posicao="simulador"
                divulgacao={false}
              />
            </div>
          </li>
        ))}
      </ul>
      <DivulgacaoComissao plural={produtos.length > 1} />
      {r.foraDaBase && (
        <div className="mt-6 border-l-[3px] border-linha bg-superficie px-4 py-3 text-[0.9rem]">
          <p className="font-medium">O que ficou de fora, e por quê</p>
          <p className="mt-1 text-tinta-suave">{r.foraDaBase}</p>
        </div>
      )}
    </>
  );
}

export default function Simulador() {
  const combinacoes = resolver();
  const resultados = Object.fromEntries(
    combinacoes.map(([chave, r, produtos]) => [
      chave,
      <Cards key={chave} r={r} produtos={produtos} />,
    ]),
  );
  const atualizadoEm = combinacoes
    .flatMap(([, , ps]) => ps.map((p) => p.atualizadoEm))
    .sort()
    .at(-1)!;
  const totalProdutos = new Set(
    combinacoes.flatMap(([, , ps]) => ps.map((p) => p.slug)),
  ).size;

  return (
    <div className="mx-auto max-w-[var(--largura-ferramenta)] px-5 pb-12">
      <section className="banner mt-5 p-6 md:p-8">
        <span className="pastilha">Simulador</span>
        <h1 className="mt-3 max-w-[24ch] font-titulo text-[1.9rem] leading-[1.1] tracking-tight sm:text-[2.4rem]">
          Wi-Fi, automação ou câmeras: por onde começar
        </h1>
        <p className="mt-3 max-w-[62ch] text-[0.95rem] text-tinta-suave">
          Três perguntas e uma indicação, escolhida entre {totalProdutos} produtos
          com ficha apurada no site. A justificativa de cada uma é o que o
          fabricante declara, e não teste nosso — e, quando a documentação não
          sustenta uma resposta, a página diz isso em vez de preencher.
        </p>
        <div className="mt-4">
          <Divulgacao atualizadoEm={dataLegivel(atualizadoEm)} />
        </div>
      </section>

      <section className="mt-8">
        <SetupSimulator resultados={resultados} />
      </section>

      <section className="mx-auto mt-14 max-w-[var(--largura-prosa)] text-[0.93rem] text-tinta-suave">
        <h2 className="titulo-ui text-[1.15rem] text-tinta">Como a indicação é escolhida</h2>
        <p className="mt-2">
          O simulador só recomenda produto que tem ficha no site, com fonte
          oficial e link de loja. Em Wi-Fi, o tamanho do ambiente é comparado com
          a cobertura que o fabricante declara — e só conta a cobertura do kit que
          está à venda: o Deco X50 e o Deco BE22 publicam 600 m² para o kit de
          três unidades, e o anúncio é o de duas.
        </p>
        <p className="mt-2">
          “Mais recursos” quer dizer mais itens declarados na ficha, não preço
          maior: o site não publica preço. Para ver todos os produtos lado a
          lado, use o <Link href="/comparar/conectividade" className="underline underline-offset-4">comparador de conectividade</Link> ou o
          de <Link href="/comparar/casa-conectada" className="underline underline-offset-4">casa conectada</Link>.
        </p>
      </section>
    </div>
  );
}

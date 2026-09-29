import type { Metadata } from "next";
import Link from "next/link";
import { tituloSeo, lojasDe } from "@/lib/site";
import { todosOsProdutos, type Produto } from "@/lib/produtos";
import { todasAsCombinacoes, type Resultado } from "@/lib/simulador";
import { dataLegivel } from "@/lib/conteudo";
import { Simulador } from "@/components/simulador";
import { SLUGS as SLUGS_CAMERAS } from "@/lib/simulador-cameras";
import { MidiaProduto } from "@/components/midia-produto";
import { LojaCta, DivulgacaoComissao } from "@/components/loja-cta";
import { Divulgacao } from "@/components/divulgacao";

export const metadata: Metadata = {
  title: tituloSeo("Simulador: monte o projeto de câmeras, Wi-Fi ou automação"),
  description:
    "Monte o projeto de câmeras de segurança, rede Wi-Fi ou automação e receba a lista do que comprar, peça por peça, tirada das fichas oficiais dos fabricantes — com o que a documentação não informa escrito ao lado.",
  alternates: { canonical: "/simulador" },
};

/**
 * Toda indicação da matriz precisa existir na base e ter loja. Recomendar um
 * slug que saiu da base — a regra de 26/09 apaga produto sem link — deixaria
 * o leitor com um card sem botão no fim de um simulador de compra. Quebra o
 * build, como os outros `verificar()` do projeto.
 */
function resolver(
  buscarProduto: (slug: string) => Produto | undefined,
): [string, Resultado, Produto[]][] {
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

/**
 * A base do questionário de câmeras. Mesma regra da matriz: o que o motor
 * pode indicar precisa existir e ter loja, senão o build para.
 */
function baseCameras(
  buscarProduto: (slug: string) => Produto | undefined,
  cftv: Produto[],
): Record<string, Produto> {
  const faltando: string[] = [];
  const fixos = Object.values(SLUGS_CAMERAS).map((slug) => {
    const p = buscarProduto(slug);
    if (!p || !lojasDe(p.lojas).length) faltando.push(slug);
    return p!;
  });
  // A categoria CFTV entra inteira: o motor escolhe DVR e câmera pelos campos.
  // Produto sem loja não entra, pela mesma regra dos fixos.
  const base = Object.fromEntries(
    [...fixos, ...cftv.filter((p) => lojasDe(p.lojas).length)].map((p) => [
      p.slug,
      leve(p),
    ]),
  );
  if (faltando.length) {
    throw new Error(
      `Simulador de câmeras indica produto fora da base ou sem loja: ${faltando.join(", ")}. ` +
        `Troque em SLUGS, em lib/simulador-cameras.ts.`,
    );
  }
  return base;
}

/**
 * O motor roda no navegador e só lê ficha, loja e foto. Fontes, divergências e
 * resumo ficam na página do produto — mandá-los junto multiplicaria o peso da
 * página por nada.
 */
function leve(p: Produto): Produto {
  const { slug, nome, marca, modelo, categoria, specs, lojas, imagem, naoSeAplica, atualizadoEm } = p;
  return { slug, nome, marca, modelo, categoria, specs, lojas, imagem, naoSeAplica, atualizadoEm, resumo: "", fontes: [] };
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

export default function PaginaSimulador() {
  // Uma leitura da base para a página inteira, e não uma por indicação.
  const porSlug = new Map(todosOsProdutos().map((p) => [p.slug, p]));
  const buscarProduto = (slug: string) => porSlug.get(slug);
  const combinacoes = resolver(buscarProduto);
  const resultados = Object.fromEntries(
    combinacoes.map(([chave, r, produtos]) => [
      chave,
      <Cards key={chave} r={r} produtos={produtos} />,
    ]),
  );
  // Câmeras escolhem entre as fichas de CFTV; Wi-Fi, entre as de conectividade.
  const cameras = baseCameras(
    buscarProduto,
    [...porSlug.values()].filter((p) => p.categoria === "cftv" || p.categoria === "conectividade"),
  );
  const usados = [
    ...combinacoes.flatMap(([, , ps]) => ps),
    ...Object.values(cameras),
  ];
  const atualizadoEm = usados.map((p) => p.atualizadoEm).sort().at(-1)!;

  return (
    <div className="mx-auto max-w-[var(--largura-ferramenta)] px-5 pb-12">
      <section className="banner mt-5 p-6 md:p-8">
        <span className="pastilha">Simulador</span>
        <h1 className="mt-3 max-w-[24ch] font-titulo text-[1.9rem] leading-[1.1] tracking-tight sm:text-[2.4rem]">
          Monte o projeto e veja o que comprar
        </h1>
        <p className="mt-3 max-w-[62ch] text-[0.95rem] text-tinta-suave">
          Câmeras de segurança, rede Wi-Fi ou automação. Você responde sobre a
          casa, e o simulador devolve a lista de compras do projeto, peça por
          peça — das câmeras aos conectores. Cada justificativa é o que o
          fabricante declara, e não teste nosso; quando a documentação não
          sustenta uma resposta, a página diz isso em vez de preencher.
        </p>
        <div className="mt-4">
          <Divulgacao atualizadoEm={dataLegivel(atualizadoEm)} />
        </div>
      </section>

      <section className="mt-8">
        <Simulador resultados={resultados} baseCameras={cameras} />
      </section>

      <section className="mx-auto mt-14 max-w-[var(--largura-prosa)] text-[0.93rem] text-tinta-suave">
        <h2 className="titulo-ui text-[1.15rem] text-tinta">Como a lista é montada</h2>
        <p className="mt-2">
          No projeto de câmeras, cada resposta vira uma peça ou uma quantidade:
          os pontos definem as câmeras e os canais do gravador, a distância
          define os metros de cabo, e cada cabo leva um conector em cada ponta.
          Peça que o site ainda não apurou aparece na lista com a especificação
          que o projeto exige e sem link — esconder a peça faria você comprar
          câmera sem cartão, e inventar um produto quebraria a regra de só
          indicar o que tem fonte oficial.
        </p>
        <p className="mt-2">
          O simulador só recomenda produto que tem ficha no site, com fonte
          oficial e link de loja. Em Wi-Fi, a área da casa é comparada com a
          cobertura que o fabricante declara para cada número de unidades — o
          Deco X10, por exemplo, publica 190, 360 e 520 m² para uma, duas e três.
          Quando o anúncio vende menos unidades do que a conta pede, a unidade
          que falta entra na lista. Nenhum roteador nem repetidor desta base
          declara área, e a lista diz isso.
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

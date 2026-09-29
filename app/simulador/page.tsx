import type { Metadata } from "next";
import Link from "next/link";
import { tituloSeo, lojasDe } from "@/lib/site";
import { todosOsProdutos, type Produto } from "@/lib/produtos";
import { dataLegivel } from "@/lib/conteudo";
import { Simulador } from "@/components/simulador";
import { SLUGS as SLUGS_CAMERAS } from "@/lib/simulador-cameras";
import { Divulgacao } from "@/components/divulgacao";

export const metadata: Metadata = {
  title: tituloSeo("Simulador: monte o projeto de câmeras, Wi-Fi ou automação"),
  description:
    "Monte o projeto de câmeras de segurança, rede Wi-Fi ou automação e receba a lista do que comprar, peça por peça, tirada das fichas oficiais dos fabricantes — com o que a documentação não informa escrito ao lado.",
  alternates: { canonical: "/simulador" },
};

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

export default function PaginaSimulador() {
  // Uma leitura da base para a página inteira, e não uma por indicação.
  const porSlug = new Map(todosOsProdutos().map((p) => [p.slug, p]));
  const buscarProduto = (slug: string) => porSlug.get(slug);
  // Câmeras escolhem entre as fichas de CFTV e de nobreaks; Wi-Fi, entre as de
  // conectividade; automação, entre as de casa conectada.
  const base = baseCameras(
    buscarProduto,
    [...porSlug.values()].filter((p) =>
      ["cftv", "conectividade", "nobreaks", "casa-conectada"].includes(p.categoria ?? ""),
    ),
  );
  const usados = Object.values(base);
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
          peça — das câmeras aos conectores, da central ao interruptor. Cada justificativa é o que o
          fabricante declara, e não teste nosso; quando a documentação não
          sustenta uma resposta, a página diz isso em vez de preencher.
        </p>
        <div className="mt-4">
          <Divulgacao atualizadoEm={dataLegivel(atualizadoEm)} />
        </div>
      </section>

      <section className="mt-8">
        <Simulador base={base} />
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
          O detalhe da imagem é conta, não promessa: na distância que você
          informa, a cena tem uma largura que depende do ângulo de visão
          declarado pelo fabricante, e os pixels de largura da câmera se
          repartem por ela. Os degraus — 25 pixels por metro para detectar,
          62,5 para observar, 125 para reconhecer e 250 para identificar — são
          os da norma IEC 62676-4. A conta vale para o centro da imagem, com a
          câmera de frente para o alvo; altura, inclinação e distorção da lente
          ficam de fora. E ela considera o que o gravador guarda: em 1080p Lite,
          o DVR grava metade da largura da câmera, e o detalhe gravado cai à
          metade.
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
          Na automação, a primeira escolha é o aplicativo: o simulador procura o
          que cobre mais peças do projeto com ficha no site, para a casa não
          ficar com três apps no celular, e avisa onde uma peça obriga a um
          segundo. Central (hub) só entra quando a ficha de uma peça a exige.
          Fio neutro e funcionamento sem internet só contam quando o fabricante
          escreve — e a lista diz quantas peças escrevem.
        </p>
        <p className="mt-2">
          Cada peça mostra até três modelos da base que atendem ao projeto: o
          indicado, com o porquê, e os outros com o que muda em relação a ele.
          Para ver todos lado a lado, use o <Link href="/comparar/conectividade" className="underline underline-offset-4">comparador de conectividade</Link> ou o
          de <Link href="/comparar/casa-conectada" className="underline underline-offset-4">casa conectada</Link>.
        </p>
      </section>
    </div>
  );
}

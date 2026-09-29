import type { Metadata } from "next";
import Link from "next/link";
import { tituloSeo } from "@/lib/site";
import { CHAMADAS, FOCOS, hrefDoFoco } from "@/lib/simulador";
import { PAGINAS } from "@/lib/simulador-paginas";
import { JsonLd, schemaBreadcrumb } from "@/lib/schema";
import { RedirecionaProjeto } from "@/components/simulador-redireciona";

export const metadata: Metadata = {
  title: tituloSeo("Simulador de compra: câmeras, Wi-Fi, automação, ar, nobreak e cozinha"),
  description:
    "Oito ferramentas para montar o projeto antes de comprar — câmeras de segurança, Wi-Fi, automação, BTUs do ar-condicionado, nobreak, air fryer, refil do purificador e cooktop de indução —, com a lista tirada das fichas oficiais dos fabricantes.",
  alternates: { canonical: "/simulador" },
};

/**
 * A porta de entrada das ferramentas. Desde 29/09/2026 cada uma tem página
 * própria (/simulador/<slug>); esta lista as oito e redireciona o endereço
 * antigo `?projeto=`.
 */
export default function PaginaSimulador() {
  return (
    <div className="mx-auto max-w-[var(--largura-ferramenta)] px-5 pb-12">
      <RedirecionaProjeto />
      <JsonLd
        data={schemaBreadcrumb([
          { nome: "Início", url: "/" },
          { nome: "Simulador", url: "/simulador" },
        ])}
      />
      <section className="banner mt-5 p-6 md:p-8">
        <span className="pastilha">Simulador</span>
        <h1 className="mt-3 max-w-[24ch] font-titulo text-[1.9rem] leading-[1.1] tracking-tight sm:text-[2.4rem]">
          Monte o projeto e veja o que comprar
        </h1>
        <p className="mt-3 max-w-[62ch] text-[0.95rem] text-tinta-suave">
          Você responde sobre a casa, e a ferramenta devolve a lista de compras
          do projeto, peça por peça. Cada justificativa é o que o fabricante
          declara, e não teste nosso; quando a documentação não sustenta uma
          resposta, a página diz isso em vez de preencher.
        </p>
      </section>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {FOCOS.map((f) => (
          <li key={f.valor}>
            <Link href={hrefDoFoco(f.valor)} className="cartao flex h-full flex-col p-5 transition hover:border-tinta-suave">
              <span className="text-[0.78rem] font-semibold uppercase tracking-[0.06em] text-tinta-suave">{f.rotulo}</span>
              <span className="mt-1 titulo-ui text-[1.05rem] leading-snug">{PAGINAS[f.valor].h1}</span>
              <span className="mt-2 text-[0.84rem] leading-snug text-tinta-suave">{CHAMADAS[f.valor]}</span>
            </Link>
          </li>
        ))}
      </ul>

      <section className="mx-auto mt-14 max-w-[var(--largura-prosa)] text-[0.93rem] text-tinta-suave">
        <h2 className="titulo-ui text-[1.15rem] text-tinta">Como a lista é montada</h2>
        <p className="mt-2">
          O simulador só recomenda produto que tem ficha no site, com fonte
          oficial e link de loja, e mostra até três modelos por peça: o
          indicado, com o porquê, e os outros com o que muda em relação a ele.
          Peça que o site ainda não apurou aparece na lista com a especificação
          que o projeto exige e sem link — esconder a peça faria você comprar
          incompleto, e inventar um produto quebraria a regra de só indicar o
          que tem fonte oficial.
        </p>
        <p className="mt-2">
          Os números vêm de três lugares, e a lista diz de qual: o que o
          fabricante declara, a regra do simulador (rotulada, com o valor à
          vista) e a física — corrente é potência dividida por tensão, e cada
          cabo leva um conector em cada ponta.
        </p>
      </section>
    </div>
  );
}

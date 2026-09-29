import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site, tituloSeo } from "@/lib/site";
import { dataLegivel } from "@/lib/conteudo";
import { FOCOS, SLUG_DO_FOCO, focoDoSlug, hrefDoFoco, type Foco } from "@/lib/simulador";
import { baseDoFoco } from "@/lib/simulador-base";
import { PAGINAS, tabelasDoFoco } from "@/lib/simulador-paginas";
import type { Produto } from "@/lib/specs";
import { Divulgacao } from "@/components/divulgacao";
import { JsonLd, schemaBreadcrumb } from "@/lib/schema";
import { SimuladorCameras } from "@/components/simulador-cameras";
import { SimuladorWifi } from "@/components/simulador-wifi";
import { SimuladorAutomacao } from "@/components/simulador-automacao";
import { SimuladorAr } from "@/components/simulador-ar";
import { SimuladorNobreak } from "@/components/simulador-nobreak";
import { SimuladorAirfryer } from "@/components/simulador-airfryer";
import { SimuladorRefil } from "@/components/simulador-refil";
import { SimuladorCooktop } from "@/components/simulador-cooktop";

type Params = { params: Promise<{ projeto: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return FOCOS.map((f) => ({ projeto: SLUG_DO_FOCO[f.valor] }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const foco = focoDoSlug((await params).projeto);
  if (!foco) return {};
  const p = PAGINAS[foco];
  return {
    title: tituloSeo(p.seo),
    description: p.descricao,
    alternates: { canonical: hrefDoFoco(foco) },
    openGraph: { title: p.seo, description: p.descricao },
  };
}

function Ferramenta({ foco, base }: { foco: Foco; base: Record<string, Produto> }) {
  switch (foco) {
    case "seguranca":
      return <SimuladorCameras base={base} />;
    case "wifi":
      return <SimuladorWifi base={base} />;
    case "automacao":
      return <SimuladorAutomacao base={base} />;
    case "ar":
      return <SimuladorAr base={base} />;
    case "nobreak":
      return <SimuladorNobreak base={base} />;
    case "airfryer":
      return <SimuladorAirfryer base={base} />;
    case "purificador":
      return <SimuladorRefil base={base} />;
    case "cooktop":
      return <SimuladorCooktop base={base} />;
  }
}

/**
 * Uma página por ferramenta do simulador, desde 29/09/2026. Até então as oito
 * dividiam /simulador, e o Google via uma página só, com um título genérico,
 * para oito buscas diferentes ("calculadora de BTU", "quanto dura o refil").
 */
export default async function PaginaFerramenta({ params }: Params) {
  const foco = focoDoSlug((await params).projeto);
  if (!foco) notFound();
  const pagina = PAGINAS[foco];
  const rotulo = FOCOS.find((f) => f.valor === foco)!.rotulo;
  const base = baseDoFoco(foco);
  const tabelas = tabelasDoFoco(foco, base);
  const atualizadoEm = Object.values(base).map((p) => p.atualizadoEm).sort().at(-1)!;
  const url = hrefDoFoco(foco);

  return (
    <div className="mx-auto max-w-[var(--largura-ferramenta)] px-5 pb-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: pagina.h1,
          description: pagina.descricao,
          url: `${site.url}${url}`,
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Qualquer navegador",
          inLanguage: "pt-BR",
          isAccessibleForFree: true,
          offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
          publisher: { "@type": "Organization", name: site.nome, url: site.url },
        }}
      />
      <JsonLd
        data={schemaBreadcrumb([
          { nome: "Início", url: "/" },
          { nome: "Simulador", url: "/simulador" },
          { nome: rotulo, url },
        ])}
      />

      <nav aria-label="Trilha" className="mt-5 text-[0.82rem] text-tinta-suave">
        <Link href="/simulador" className="underline underline-offset-4">Simulador</Link>
        <span aria-hidden="true"> / </span>
        <span>{rotulo}</span>
      </nav>

      <section className="banner mt-3 p-6 md:p-8">
        <span className="pastilha">Simulador · {rotulo}</span>
        <h1 className="mt-3 max-w-[28ch] font-titulo text-[1.9rem] leading-[1.1] tracking-tight sm:text-[2.4rem]">
          {pagina.h1}
        </h1>
        <p className="mt-3 max-w-[62ch] text-[0.95rem] text-tinta-suave">{pagina.intro[0]}</p>
        <div className="mt-4">
          <Divulgacao atualizadoEm={dataLegivel(atualizadoEm)} />
        </div>
      </section>

      <section className="mt-8">
        <Ferramenta foco={foco} base={base} />
      </section>

      <section className="mx-auto mt-14 max-w-[var(--largura-prosa)] text-[0.93rem] text-tinta-suave">
        <h2 className="titulo-ui text-[1.15rem] text-tinta">Como a conta é feita</h2>
        {pagina.intro.slice(1).map((t) => (
          <p key={t} className="mt-2">{t}</p>
        ))}
        <p className="mt-2">
          Cada justificativa da lista é o que o fabricante declara, e não teste
          nosso. O simulador só recomenda produto que tem ficha no site, com
          fonte oficial e link de loja, e mostra até três modelos por peça para
          você escolher.
        </p>
      </section>

      {tabelas.map((t) => (
        <section key={t.titulo} className="mt-10">
          <h2 className="titulo-ui text-[1.15rem]">{t.titulo}</h2>
          <div className="mt-3 overflow-x-auto rounded-lg border border-linha bg-papel">
            <table className="w-full min-w-[34rem] border-collapse text-[0.88rem]">
              <thead>
                <tr>
                  {t.cabecalho.map((c) => (
                    <th key={c} scope="col" className="border-b border-linha bg-superficie p-3 text-left align-bottom font-medium">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {t.linhas.map((l, i) => (
                  <tr key={l.slug ?? i} className="even:bg-superficie/50">
                    {l.celulas.map((c, j) =>
                      j === 0 ? (
                        <th key={j} scope="row" className="border-b border-linha p-3 text-left font-medium">
                          {l.slug ? (
                            <Link href={`/produtos/${l.slug}`} className="underline underline-offset-4">{c}</Link>
                          ) : (
                            c
                          )}
                        </th>
                      ) : (
                        <td key={j} className={`border-b border-linha p-3 ${c === "Não informado" ? "text-ausente" : /^[\d.,]+( |$)/.test(c) ? "dados whitespace-nowrap" : ""}`}>
                          {c}
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[0.82rem] text-tinta-suave">{t.nota}</p>
        </section>
      ))}

      <section className="mt-12 grid gap-3 sm:grid-cols-2">
        <Link href={`/guias/${pagina.guia.slug}`} className="painel p-5 transition hover:border-tinta-suave">
          <span className="text-[0.78rem] font-semibold uppercase tracking-[0.06em] text-tinta-suave">Para ler antes</span>
          <span className="mt-1 block titulo-ui">{pagina.guia.nome}</span>
        </Link>
        <Link href={`/categorias/${pagina.categoria.slug}`} className="painel p-5 transition hover:border-tinta-suave">
          <span className="text-[0.78rem] font-semibold uppercase tracking-[0.06em] text-tinta-suave">Todas as fichas</span>
          <span className="mt-1 block titulo-ui">{pagina.categoria.nome}</span>
        </Link>
      </section>

      <nav aria-label="Outras ferramentas" className="mt-10">
        <h2 className="titulo-ui text-[1.05rem]">Outras ferramentas do simulador</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {FOCOS.filter((f) => f.valor !== foco).map((f) => (
            <li key={f.valor}>
              <Link href={hrefDoFoco(f.valor)} className="pilula">{f.rotulo}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

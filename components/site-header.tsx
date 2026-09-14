import Link from "next/link";
import { site } from "@/lib/site";
import { AlternadorTema } from "@/components/tema";
import { Busca } from "@/components/busca";
import { indiceDeBusca } from "@/lib/indice";

/**
 * O menu mudou de eixo quando o site virou base de dados.
 *
 * Antes listava só formatos de texto (guias, análises, comparativos) — e as
 * páginas mais usadas do site, o buscador da categoria e o comparador, não
 * apareciam em lugar nenhum. Agora as ferramentas vêm primeiro, e o conteúdo
 * editorial depois: é a ordem em que o visitante realmente usa.
 *
 * Fixo no topo porque tabela comparativa é página longa, e voltar ao menu não
 * pode custar uma rolagem inteira.
 */
const ferramentas = [
  { href: "/categorias/energia", rotulo: "Produtos" },
  { href: "/comparar/energia", rotulo: "Comparar" },
];

const editorial = [
  { href: "/guias", rotulo: "Guias" },
  { href: "/reviews", rotulo: "Análises" },
  { href: "/metodologia", rotulo: "Como avaliamos" },
];

export function SiteHeader() {
  // Montado no servidor, no build: a busca chega pronta ao navegador.
  const indice = indiceDeBusca();

  return (
    <header className="sticky top-0 z-40 border-b border-linha bg-papel/95 backdrop-blur">
      <div className="mx-auto flex max-w-[var(--largura-ferramenta)] flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3">
        <Link
          href="/"
          className="font-titulo text-xl leading-none tracking-tight"
        >
          {site.nome}
        </Link>

        <nav aria-label="Principal" className="order-3 w-full sm:order-none sm:w-auto">
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[0.9rem]">
            {ferramentas.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="font-medium hover:text-acao-forte">
                  {item.rotulo}
                </Link>
              </li>
            ))}
            <li aria-hidden className="text-linha">
              |
            </li>
            {editorial.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-tinta-suave hover:text-tinta">
                  {item.rotulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <Busca indice={indice} />
          <AlternadorTema />
        </div>
      </div>
    </header>
  );
}

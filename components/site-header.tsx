import Link from "next/link";
import { site } from "@/lib/site";
import { categorias } from "@/lib/categorias";
import { produtosDaCategoria } from "@/lib/produtos";
import { indiceDeBusca } from "@/lib/indice";
import { AlternadorTema } from "@/components/tema";
import { Busca } from "@/components/busca";
import { Icone } from "@/components/icones";

/**
 * Cabeçalho em duas linhas, como as lojas fazem.
 *
 * Linha 1: marca, busca grande no centro, ações à direita. Linha 2: pílulas
 * de navegação — categorias com produto primeiro, editorial depois. Fixo no
 * topo porque tabela comparativa é página longa.
 */
export function SiteHeader() {
  const indice = indiceDeBusca();
  const comProdutos = categorias.filter(
    (c) => produtosDaCategoria(c.slug).length > 0,
  );

  return (
    <header className="sticky top-0 z-40 border-b border-linha bg-papel/95 backdrop-blur">
      <div className="mx-auto flex max-w-[var(--largura-ferramenta)] items-center gap-4 px-5 py-3 md:gap-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5"
          aria-label={site.nome}
        >
          <img
            src="/marca/simbolo.svg"
            alt=""
            aria-hidden
            width={36}
            height={36}
            className="so-claro h-9 w-9"
          />
          <img
            src="/marca/simbolo-fundo-escuro.svg"
            alt=""
            aria-hidden
            width={36}
            height={36}
            className="so-escuro h-9 w-9"
          />
          <span className="hidden font-titulo text-[1.15rem] leading-none tracking-tight sm:inline">
            {site.nome}
          </span>
        </Link>

        <div className="mx-auto hidden w-full max-w-[38rem] md:block">
          <Busca indice={indice} />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Link
            href={`/comparar/${comProdutos[0]?.slug ?? "audio"}`}
            className="botao botao-secundario hidden !py-2 text-[0.85rem] sm:inline-flex"
          >
            <Icone nome="comparar" className="h-4 w-4" />
            Comparar
          </Link>
          <AlternadorTema />
        </div>
      </div>

      <div className="px-5 pb-3 md:hidden">
        <Busca indice={indice} />
      </div>

      <nav aria-label="Principal" className="border-t border-linha">
        <ul className="rolo mx-auto flex max-w-[var(--largura-ferramenta)] gap-2 overflow-x-auto px-5 py-2">
          {comProdutos.map((c) => (
            <li key={c.slug} className="shrink-0">
              <Link href={`/categorias/${c.slug}`} className="pilula">
                {c.nome}
              </Link>
            </li>
          ))}
          <li aria-hidden className="mx-1 shrink-0 self-center text-linha">
            |
          </li>
          <li className="shrink-0">
            <Link href="/guias" className="pilula">
              Guias de compra
            </Link>
          </li>
          <li className="shrink-0">
            <Link href="/reviews" className="pilula">
              Análises
            </Link>
          </li>
          <li className="shrink-0">
            <Link href="/comparativos" className="pilula">
              Comparativos
            </Link>
          </li>
          <li className="shrink-0">
            <Link href="/metodologia" className="pilula">
              Como avaliamos
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

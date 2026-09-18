import Link from "next/link";
import { site } from "@/lib/site";
import { categorias } from "@/lib/categorias";
import { produtosDaCategoria } from "@/lib/produtos";
import { indiceDeBusca } from "@/lib/indice";
import { AlternadorTema } from "@/components/tema";
import { Busca } from "@/components/busca";
import { Icone } from "@/components/icones";

/**
 * Cabeçalho em duas linhas, no padrão das lojas grandes.
 *
 * Linha 1: marca em tamanho de marca (a horizontal, não o símbolo miúdo),
 * busca grande no centro, ações à direita. Linha 2: chips de navegação com
 * as categorias que têm produto, depois o editorial — em toda largura, porque
 * é a barra que o leitor procura primeiro. Fixo no topo porque tabela
 * comparativa é página longa.
 */
export function SiteHeader() {
  const indice = indiceDeBusca();
  const comProdutos = categorias.filter(
    (c) => produtosDaCategoria(c.slug).length > 0,
  );

  return (
    <header className="sticky top-0 z-40 border-b border-linha bg-papel/95 backdrop-blur">
      <div className="mx-auto flex max-w-[var(--largura-ferramenta)] items-center gap-4 px-5 py-3.5 md:gap-8">
        <Link href="/" className="flex shrink-0 items-center" aria-label={site.nome}>
          {/* Símbolo só no celular; a marca inteira a partir de sm. As duas
              versões por tema, porque o traço preto some no escuro. */}
          {/* Os wrappers cuidam da largura; as classes de tema (.so-claro/.so-escuro)
              ficam só nas imagens, senão o display delas anula o `hidden`. */}
          <span className="sm:hidden">
            <img src="/marca/simbolo.svg" alt="" aria-hidden width={40} height={40} className="so-claro h-10 w-10" />
            <img src="/marca/simbolo-fundo-escuro.svg" alt="" aria-hidden width={40} height={40} className="so-escuro h-10 w-10" />
          </span>
          <span className="hidden sm:block">
            <img src="/marca/marca-horizontal.svg" alt="" aria-hidden width={739} height={98} className="so-claro h-11 w-auto md:h-12" />
            <img src="/marca/marca-horizontal-fundo-escuro.svg" alt="" aria-hidden width={739} height={98} className="so-escuro h-11 w-auto md:h-12" />
          </span>
        </Link>

        <div className="mx-auto hidden w-full max-w-[40rem] md:block">
          <Busca indice={indice} />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {/* Vai para a escolha de categoria, não para uma categoria fixa.
              Antes apontava para comProdutos[0], que é sempre áudio: quem
              queria comparar monitor caía num comparador de fone sem saber
              que havia outros. */}
          <Link
            href="/comparar"
            className="botao botao-secundario hidden !py-2.5 text-[0.85rem] sm:inline-flex"
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
        <ul className="rolo mx-auto flex max-w-[var(--largura-ferramenta)] gap-2 overflow-x-auto px-5 py-2.5">
          {comProdutos.map((c) => (
            <li key={c.slug} className="shrink-0">
              <Link href={`/categorias/${c.slug}`} className="pilula">
                {c.nome}
              </Link>
            </li>
          ))}
          <li aria-hidden className="mx-1 shrink-0 self-center text-linha">|</li>
          <li className="shrink-0"><Link href="/guias" className="pilula">Guias de compra</Link></li>
          <li className="shrink-0"><Link href="/comparativos" className="pilula">Comparativos</Link></li>
          <li className="shrink-0"><Link href="/reviews" className="pilula">Análises</Link></li>
          <li className="shrink-0"><Link href="/transparencia" className="pilula">Transparência</Link></li>
          <li className="shrink-0"><Link href="/metodologia" className="pilula">Como avaliamos</Link></li>
        </ul>
      </nav>
    </header>
  );
}

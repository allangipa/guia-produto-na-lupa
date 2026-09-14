import Link from "next/link";
import { site } from "@/lib/site";
import { categorias } from "@/lib/categorias";
import { produtosDaCategoria } from "@/lib/produtos";

/**
 * Rodapé sólido na cor de ação, como as lojas fazem — é o único bloco grande
 * de cor do site, e fica no fim de propósito: fecha a página sem competir com
 * o botão de compra lá em cima.
 */
export function SiteFooter() {
  const comProdutos = categorias.filter(
    (c) => produtosDaCategoria(c.slug).length > 0,
  );
  const link = "text-white/80 hover:text-white";
  const titulo = "text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-white/60";

  return (
    <footer className="mt-20 bg-acao-forte text-white">
      <div className="mx-auto grid max-w-[var(--largura-ferramenta)] gap-x-10 gap-y-8 px-5 py-12 text-[0.9rem] md:grid-cols-[1.4fr_1.2fr_.85fr_1.1fr]">
        <div>
          <img src="/marca/marca-horizontal-fundo-escuro.svg" alt={site.nome} width={739} height={98} className="h-11 w-auto" />
          <p className="mt-4 max-w-[40ch] text-white/80">
            Compare fichas técnicas oficiais lado a lado, na mesma unidade, com
            a fonte de cada número declarada e uma nota de transparência por
            produto.
          </p>
          {/* A primeira frase é a declaração que o contrato de Associados exige,
              nesta redação. As outras são nossas. */}
          <p className="mt-4 max-w-[44ch] text-[0.82rem] text-white/60">
            Como Associado da Amazon, o {site.nome} recebe por compras
            qualificadas. Também participamos do programa de afiliados do
            Mercado Livre. Comprando por um link daqui, o site recebe comissão
            sem custo extra para você — e isso não muda o que escrevemos.
          </p>
        </div>

        {/* Duas colunas, e só as categorias. Havia aqui um segundo bloco com
            "Comparar <categoria>" repetindo cada uma, o que dobrava a lista e
            esticava o rodapé por uma página inteira. O comparador está no topo
            de toda página de categoria e no fim de toda ficha — não precisa de
            sete entradas no rodapé para ser encontrado. */}
        <nav aria-label="Categorias">
          <p className={titulo}>Produtos</p>
          <ul className="mt-3 grid grid-cols-2 gap-x-5 gap-y-2">
            {comProdutos.map((c) => (
              <li key={c.slug}>
                <Link href={`/categorias/${c.slug}`} className={link}>{c.nome}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Conteúdo">
          <p className={titulo}>Conteúdo</p>
          <ul className="mt-3 space-y-2">
            <li><Link href="/guias" className={link}>Guias de compra</Link></li>
            <li><Link href="/comparativos" className={link}>Comparativos</Link></li>
            <li><Link href="/reviews" className={link}>Análises</Link></li>
          </ul>
        </nav>

        <nav aria-label="Institucional">
          <p className={titulo}>O site</p>
          <ul className="mt-3 space-y-2">
            <li><Link href="/transparencia" className={link}>Ranking de transparência</Link></li>
            <li><Link href="/metodologia" className={link}>Como avaliamos</Link></li>
            <li><Link href="/sobre" className={link}>O que este site é</Link></li>
            <li><Link href="/privacidade" className={link}>Privacidade</Link></li>
            <li><a href={`mailto:${site.editor.contato}`} className={link}>{site.editor.contato}</a></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/15">
        <p className="mx-auto max-w-[var(--largura-ferramenta)] px-5 py-4 text-[0.8rem] text-white/60">
          © {new Date().getFullYear()} {site.nome} · Fichas oficiais dos fabricantes, sem teste próprio. Fotos: material oficial das marcas, removidas a pedido.
        </p>
      </div>
    </footer>
  );
}

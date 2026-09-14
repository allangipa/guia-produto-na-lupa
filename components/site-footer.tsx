import Link from "next/link";
import { site } from "@/lib/site";
import { categorias } from "@/lib/categorias";
import { produtosDaCategoria } from "@/lib/produtos";

export function SiteFooter() {
  const comProdutos = categorias.filter(
    (c) => produtosDaCategoria(c.slug).length > 0,
  );

  return (
    <footer className="mt-20 border-t border-linha bg-papel">
      <div className="mx-auto grid max-w-[var(--largura-ferramenta)] gap-10 px-5 py-12 text-[0.9rem] md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="font-titulo text-xl">{site.nome}</p>
          <p className="mt-3 max-w-[40ch] text-tinta-suave">
            Compare fichas técnicas oficiais lado a lado, na mesma unidade, e
            veja o que cada fabricante deixa de fora. Toda informação tem a
            fonte declarada.
          </p>
          <p className="mt-4 max-w-[44ch] text-[0.82rem] text-tinta-suave">
            Participamos dos programas de afiliados da Amazon e do Mercado
            Livre. Comprando por um link daqui, o site recebe comissão sem custo
            extra para você — e isso não muda o que escrevemos.
          </p>
        </div>

        <nav aria-label="Categorias">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-tinta-suave">
            Produtos
          </p>
          <ul className="mt-3 space-y-2">
            {comProdutos.map((c) => (
              <li key={c.slug}>
                <Link href={`/categorias/${c.slug}`} className="hover:text-acao-forte">
                  {c.nome}
                </Link>
              </li>
            ))}
            {comProdutos.map((c) => (
              <li key={`cmp-${c.slug}`}>
                <Link href={`/comparar/${c.slug}`} className="hover:text-acao-forte">
                  Comparar {c.nome.toLowerCase()}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Conteúdo">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-tinta-suave">
            Conteúdo
          </p>
          <ul className="mt-3 space-y-2">
            <li><Link href="/guias" className="hover:text-acao-forte">Guias de compra</Link></li>
            <li><Link href="/reviews" className="hover:text-acao-forte">Análises</Link></li>
            <li><Link href="/comparativos" className="hover:text-acao-forte">Comparativos</Link></li>
          </ul>
        </nav>

        <nav aria-label="Institucional">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-tinta-suave">
            O site
          </p>
          <ul className="mt-3 space-y-2">
            <li><Link href="/metodologia" className="hover:text-acao-forte">Como avaliamos</Link></li>
            <li><Link href="/sobre" className="hover:text-acao-forte">O que este site é</Link></li>
            <li><Link href="/privacidade" className="hover:text-acao-forte">Privacidade</Link></li>
            <li>
              <a href={`mailto:${site.editor.contato}`} className="hover:text-acao-forte">
                {site.editor.contato}
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-linha">
        <p className="mx-auto max-w-[var(--largura-ferramenta)] px-5 py-4 text-[0.8rem] text-tinta-suave">
          © {new Date().getFullYear()} {site.nome}
        </p>
      </div>
    </footer>
  );
}

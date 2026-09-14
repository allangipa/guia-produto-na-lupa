import Link from "next/link";
import { site } from "@/lib/site";
import { categorias } from "@/lib/categorias";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-linha bg-superficie">
      <div className="mx-auto max-w-[var(--largura-ferramenta)] space-y-6 px-5 py-10 text-sm text-tinta-suave">
        <nav aria-label="Categorias">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {categorias.map((c) => (
              <li key={c.slug}>
                <Link href={`/categorias/${c.slug}`} className="hover:text-tinta">
                  {c.nome}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="max-w-[68ch]">
          {site.nome} participa de programas de afiliados da Amazon e do Mercado
          Livre. Quando você compra por um link daqui, o site recebe uma comissão
          sem custo extra para você. Isso não muda o que escrevemos: as falhas de
          cada produto aparecem na análise, e recomendamos não comprar quando é o
          caso.
        </p>
        <p>
          <Link href="/metodologia" className="underline underline-offset-4">
            Como avaliamos
          </Link>
          {" · "}
          <Link href="/sobre" className="underline underline-offset-4">
            Quem escreve
          </Link>
        </p>
        <p>© {new Date().getFullYear()} {site.nome}</p>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { site } from "@/lib/site";

const navegacao = [
  { href: "/guias", rotulo: "Guias de compra" },
  { href: "/reviews", rotulo: "Análises" },
  { href: "/comparativos", rotulo: "Comparativos" },
  { href: "/metodologia", rotulo: "Como avaliamos" },
  { href: "/sobre", rotulo: "Sobre" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-linha">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-4">
        <Link href="/" className="font-titulo text-xl leading-none tracking-tight">
          {site.nome}
        </Link>
        <nav aria-label="Principal">
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[0.95rem] text-tinta-suave">
            {navegacao.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-tinta">
                  {item.rotulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

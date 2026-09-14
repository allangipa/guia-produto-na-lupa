import Link from "next/link";
import type { Metadata } from "next";
import { todosOsGuias } from "@/lib/conteudo";

export const metadata: Metadata = {
  title: "Guias de compra",
  description: "Os melhores de cada categoria, separados por perfil de uso.",
  alternates: { canonical: "/guias" },
};

export default function ListaGuias() {
  const itens = todosOsGuias();
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="font-titulo text-3xl tracking-tight">Guias de compra</h1>
      <ul className="mt-8 divide-y divide-linha border-t border-linha">
        {itens.map((g) => (
          <li key={g.slug}>
            <Link href={`/guias/${g.slug}`} className="group block py-6">
              <span className="block font-titulo text-xl leading-snug group-hover:text-acao-escura">
                {g.titulo}
              </span>
              <span className="mt-1 block max-w-[62ch] text-tinta-suave">{g.subtitulo}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

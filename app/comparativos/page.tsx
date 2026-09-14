import Link from "next/link";
import type { Metadata } from "next";
import { todosOsComparativos } from "@/lib/conteudo";

export const metadata: Metadata = {
  title: "Comparativos",
  description: "Duelos diretos entre produtos, com vencedor definido por perfil.",
  alternates: { canonical: "/comparativos" },
};

export default function ListaComparativos() {
  const itens = todosOsComparativos();
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="font-titulo text-3xl tracking-tight">Comparativos</h1>
      <ul className="mt-8 divide-y divide-linha border-t border-linha">
        {itens.map((c) => (
          <li key={c.slug}>
            <Link href={`/comparativos/${c.slug}`} className="group block py-6">
              <span className="block font-titulo text-xl leading-snug group-hover:text-acao-escura">
                {c.titulo}
              </span>
              <span className="mt-1 block max-w-[62ch] text-tinta-suave">
                {c.subtitulo}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

import Link from "next/link";
import type { Metadata } from "next";
import { todosOsReviews, dataLegivel } from "@/lib/conteudo";

export const metadata: Metadata = {
  title: "Análises",
  description: "Todas as análises de tecnologia e acessórios publicadas.",
  alternates: { canonical: "/reviews" },
};

export default function ListaReviews() {
  const reviews = todosOsReviews();
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="font-titulo text-3xl tracking-tight">Análises</h1>
      <ul className="mt-8 divide-y divide-linha border-t border-linha">
        {reviews.map((r) => (
          <li key={r.slug}>
            <Link href={`/reviews/${r.slug}`} className="group block py-6">
              <span className="block font-titulo text-xl leading-snug group-hover:text-acao-escura">
                {r.titulo}
              </span>
              <span className="mt-1 block max-w-[62ch] text-tinta-suave">
                {r.subtitulo}
              </span>
              <span className="mt-2 block font-dado text-[0.82rem] text-tinta-suave">
                {r.nota.toFixed(1)} · {dataLegivel(r.atualizadoEm)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

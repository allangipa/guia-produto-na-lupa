import Link from "next/link";
import type { Metadata } from "next";
import { recortes, produtosDoRecorte } from "@/lib/recortes";
import { categoria as buscarCategoria } from "@/lib/categorias";

export const metadata: Metadata = {
  title: "Listas por recorte",
  description:
    "Fatias de categoria que respondem o que as pessoas buscam: batedeira planetária, aspirador sem fio, monitor de 27 polegadas.",
  alternates: { canonical: "/listas" },
};

export default function ListaDeRecortes() {
  const itens = recortes.map((r) => ({
    r,
    n: produtosDoRecorte(r).length,
    cat: buscarCategoria(r.categoria),
  }));
  return (
    <div className="mx-auto max-w-[var(--largura-prosa)] px-5 py-12">
      <h1 className="font-titulo text-3xl tracking-tight">Listas por recorte</h1>
      <p className="mt-4 max-w-[62ch] text-lg text-tinta-suave">
        Quase ninguém procura por modelo. Procura por recorte — “batedeira
        planetária”, “aspirador sem fio”, “monitor 27 polegadas”. Cada lista
        aqui responde uma dessas buscas com as fichas que já existem na base, e
        diz o que aquele corte revela.
      </p>
      <ul className="mt-8 divide-y divide-linha border-t border-linha">
        {itens.map(({ r, n, cat }) => (
          <li key={r.slug}>
            <Link href={`/listas/${r.slug}`} className="group block py-6">
              <span className="block font-titulo text-xl leading-snug group-hover:text-acao-forte">
                {r.titulo}
              </span>
              <span className="mt-1 block max-w-[62ch] text-tinta-suave">
                {r.subtitulo}
              </span>
              <span className="dados mt-2 block text-[0.8rem] text-tinta-suave">
                {n} {n === 1 ? "ficha" : "fichas"}
                {cat ? ` · ${cat.nome}` : ""}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

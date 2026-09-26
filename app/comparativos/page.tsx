import Link from "next/link";
import type { Metadata } from "next";
import { todosOsComparativos, fotoDaBase, dataLegivel } from "@/lib/conteudo";
import { Foto } from "@/components/foto";

export const metadata: Metadata = {
  title: "Comparativos",
  description: "Duelos diretos entre produtos, com vencedor definido por perfil.",
  alternates: { canonical: "/comparativos" },
};

/**
 * A listagem de comparativos, em cartões.
 *
 * Era uma lista de títulos e parágrafos até 26/09/2026 — quarenta e quatro
 * deles empilhados, sem uma imagem. Quem chega aqui está escolhendo qual duelo
 * abrir, e escolhe pelos produtos, não pela frase.
 *
 * Cada cartão mostra as duas fotos frente a frente, com o "ou" no meio. As
 * fotos vêm da base, casadas por ASIN ou nome exato; quando falta uma das duas,
 * o cartão fica só com o texto em vez de mostrar meia comparação.
 *
 * Largura de ferramenta, e não de prosa: isto é uma grade para escolher, não
 * um texto para ler.
 */
export default function ListaComparativos() {
  const itens = todosOsComparativos();
  return (
    <div className="mx-auto max-w-[var(--largura-ferramenta)] px-5 py-12">
      <h1 className="font-titulo text-3xl tracking-tight">Comparativos</h1>
      <p className="mt-2 max-w-[62ch] text-tinta-suave">
        Ficha contra ficha, com vencedor por perfil de quem compra.{" "}
        <span className="dados">{itens.length}</span> comparativos publicados.
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {itens.map((c) => {
          const fotos = c.concorrentes.map(
            (p) => p.imagem ?? fotoDaBase([p.lojas], [p.nome]),
          );
          const par = fotos.length === 2 && fotos.every(Boolean) ? fotos : null;
          return (
            <li key={c.slug} className="cartao group relative flex flex-col">
              {par && (
                <div className="flex items-center gap-1 border-b border-linha bg-superficie px-3 py-3">
                  {par.map((foto, i) => (
                    <div key={i} className="flex min-w-0 flex-1 items-center justify-center">
                      <Foto
                        src={foto!.src}
                        alt={foto!.alt}
                        tamanhos="(max-width: 640px) 40vw, 150px"
                        className="h-24 w-auto max-w-full object-contain"
                      />
                      {i === 0 && (
                        <span className="ml-1 shrink-0 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-tinta-suave">
                          ou
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-1 flex-col p-4">
                <h2 className="titulo-ui text-[1.02rem] leading-snug">
                  <Link
                    href={`/comparativos/${c.slug}`}
                    className="after:absolute after:inset-0 group-hover:text-acao-forte"
                  >
                    {c.titulo}
                  </Link>
                </h2>
                <p className="mt-2 line-clamp-3 text-[0.9rem] leading-snug text-tinta-suave">
                  {c.subtitulo}
                </p>
                <span className="mt-3 block font-dado text-[0.75rem] text-tinta-suave">
                  {dataLegivel(c.atualizadoEm)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

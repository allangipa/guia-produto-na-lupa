"use client";

import { linkAmazon } from "@/lib/site";
import type { Loja } from "@/lib/conteudo";

type Props = {
  lojas: Loja;
  produto: string;
  /** Onde o bloco está na página — usado só para medir qual posição converte. */
  posicao: "veredito" | "prosContras" | "fechamento";
};

function registrarClique(loja: string, produto: string, posicao: string) {
  const w = window as unknown as {
    dataLayer?: unknown[];
    plausible?: (evento: string, opcoes?: object) => void;
  };
  w.dataLayer?.push({ event: "clique_afiliado", loja, produto, posicao });
  w.plausible?.("Clique afiliado", { props: { loja, produto, posicao } });
}

/**
 * Sem preço em texto: a Amazon só permite exibir preço via Product Advertising API,
 * com horário da consulta. Enquanto a API não estiver ligada, o botão leva o leitor
 * a ver o preço na origem — que é onde ele está correto de qualquer jeito.
 *
 * Os dois botões têm o mesmo peso visual de propósito. Não estamos torcendo por loja.
 */
export function LojaCta({ lojas, produto, posicao }: Props) {
  const temAlguma = lojas.amazon || lojas.mercadolivre;
  if (!temAlguma) return null;

  const base =
    "flex-1 rounded-md px-5 py-3 text-center text-[0.98rem] font-medium transition-colors";

  return (
    <div className="my-8 rounded-lg border border-linha bg-superficie p-5">
      <p className="mb-4 max-w-[60ch] text-[0.95rem] text-tinta-suave">
        Se o {produto} fizer sentido para o seu caso, veja o preço atual nas duas
        lojas antes de decidir — a diferença entre elas costuma ser maior que a
        diferença entre modelos.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        {lojas.amazon && (
          <a
            href={linkAmazon(lojas.amazon)}
            rel="sponsored nofollow noopener"
            target="_blank"
            onClick={() => registrarClique("amazon", produto, posicao)}
            className={`${base} bg-acao text-papel hover:bg-acao-forte`}
          >
            Ver preço na Amazon
          </a>
        )}
        {lojas.mercadolivre && (
          <a
            href={lojas.mercadolivre}
            rel="sponsored nofollow noopener"
            target="_blank"
            onClick={() => registrarClique("mercadolivre", produto, posicao)}
            className={`${base} border border-acao text-acao-forte hover:bg-acao hover:text-papel`}
          >
            Ver no Mercado Livre
          </a>
        )}
      </div>
      <p className="mt-3 text-[0.8rem] text-tinta-suave">
        Links de afiliado. O preço muda ao longo do dia; quem manda é o da loja.
      </p>
    </div>
  );
}

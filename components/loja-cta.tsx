"use client";

import { linkAmazon } from "@/lib/site";
import type { Loja } from "@/lib/conteudo";
import { Icone } from "@/components/icones";

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
 * Sem preço em texto: a Amazon só permite exibir preço via Product Advertising
 * API, com horário da consulta. Enquanto a API não estiver ligada, o botão leva
 * o leitor a ver o preço na origem — que é onde ele está correto de qualquer
 * jeito.
 *
 * Os dois botões têm o mesmo peso visual de propósito. Não estamos torcendo por
 * loja. É o único botão sólido da página — a regra da cor de ação.
 */
export function LojaCta({ lojas, produto, posicao }: Props) {
  const temAlguma = lojas.amazon || lojas.mercadolivre;
  if (!temAlguma) return null;

  return (
    <div className="my-6">
      <div className="flex flex-col gap-2.5 sm:flex-row">
        {lojas.amazon && (
          <a
            href={linkAmazon(lojas.amazon)}
            rel="sponsored nofollow noopener"
            target="_blank"
            onClick={() => registrarClique("amazon", produto, posicao)}
            className="botao botao-primario flex-1 !py-3"
          >
            Ver preço na Amazon
            <Icone nome="seta" className="h-4 w-4" />
          </a>
        )}
        {lojas.mercadolivre && (
          <a
            href={lojas.mercadolivre}
            rel="sponsored nofollow noopener"
            target="_blank"
            onClick={() => registrarClique("mercadolivre", produto, posicao)}
            className="botao botao-secundario flex-1 !py-3"
          >
            Ver no Mercado Livre
            <Icone nome="seta" className="h-4 w-4" />
          </a>
        )}
      </div>
      <p className="mt-2.5 text-[0.78rem] text-tinta-suave">
        Link de afiliado: o site recebe comissão e você paga o mesmo preço. O
        preço muda ao longo do dia; quem manda é o da loja.
      </p>
    </div>
  );
}

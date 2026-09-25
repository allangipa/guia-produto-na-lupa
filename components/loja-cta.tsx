"use client";

import { linkAmazon } from "@/lib/site";
import type { Loja } from "@/lib/conteudo";
import { Icone } from "@/components/icones";

type Props = {
  lojas: Loja;
  produto: string;
  /** Onde o bloco está na página — usado só para medir qual posição converte. */
  posicao: "veredito" | "prosContras" | "fechamento";
  /**
   * Data ISO em que o produto chega às lojas, quando ela ainda não passou.
   * O aviso vem antes do botão: mandar alguém para a loja sem dizer que o
   * produto é pré-venda é deixar a descoberta para depois do clique.
   */
  nasLojasEm?: string;
};

/**
 * O único evento que o site mede: qual botão de loja foi clicado, em qual
 * produto e em que posição da página.
 *
 * Os três destinos convivem e cada um só dispara se existir — trocar de
 * ferramenta não deve exigir mexer em componente. Nenhum deles recebe dado
 * de quem clicou: o que importa é qual ficha converte, não quem.
 */
function registrarClique(loja: string, produto: string, posicao: string) {
  const w = window as unknown as {
    dataLayer?: unknown[];
    plausible?: (evento: string, opcoes?: object) => void;
    umami?: { track?: (evento: string, dados?: object) => void };
  };
  w.dataLayer?.push({ event: "clique_afiliado", loja, produto, posicao });
  w.plausible?.("Clique afiliado", { props: { loja, produto, posicao } });
  w.umami?.track?.("clique-afiliado", { loja, produto, posicao });
}

/**
 * Sem preço em texto: a Amazon só permite exibir preço via Product Advertising
 * API, com horário da consulta. O botão leva o leitor à origem, que é onde o
 * preço está correto de qualquer jeito.
 *
 * O RÓTULO DIZ "COMPRAR", E NÃO "VER PREÇO"
 *
 * Decisão do Allan em 25/09/2026, depois de olhar o Promobit: o verbo do botão
 * é o que anuncia a ação, e "ver preço" convida a espiar quando a meta é
 * vender. A regra da Amazon é sobre EXIBIR preço e sobre não se passar pela
 * loja — não sobre o verbo. "Comprar na Amazon" atribui a compra à Amazon, não
 * a nós, e não afirma preço nenhum.
 *
 * A linha de divulgação abaixo continua dizendo que o preço muda e que quem
 * manda é o da loja. É ela que impede o botão de virar promessa.
 *
 * Os dois botões têm o mesmo peso visual de propósito. Não estamos torcendo por
 * loja. É o único botão sólido da página — a regra da cor de ação.
 */
export function LojaCta({ lojas, produto, posicao, nasLojasEm }: Props) {
  const temAlguma = lojas.amazon || lojas.mercadolivre;
  if (!temAlguma) return null;

  const porVir = nasLojasEm ? nasLojasEm.split("-") : null;

  return (
    <div className="my-6">
      {porVir && (
        <p className="mb-3 border-l-[3px] border-acao bg-realce px-4 py-3 text-[0.88rem]">
          Este produto ainda não chegou às lojas. O fabricante marca{" "}
          <strong className="dados">
            {porVir[2]}/{porVir[1]}/{porVir[0]}
          </strong>
          . O que estiver à venda hoje é pré-venda, e o prazo de entrega é o da
          loja, não o nosso.
        </p>
      )}
      <div className="flex flex-col gap-2.5 sm:flex-row">
        {lojas.amazon && (
          <a
            href={linkAmazon(lojas.amazon)}
            rel="sponsored nofollow noopener"
            target="_blank"
            onClick={() => registrarClique("amazon", produto, posicao)}
            className="botao botao-primario flex-1 !py-3"
          >
            Comprar na Amazon
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
            Comprar no Mercado Livre
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

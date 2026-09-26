"use client";

import { lojasDe, linkDaLoja, rotuloCompra } from "@/lib/site";
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
  /**
   * Se este bloco imprime a linha de divulgação. Só passe `false` quando ela
   * já estiver visível no mesmo bloco de conteúdo — como na seção dos guias,
   * onde aparece uma vez para a lista toda em vez de se repetir abaixo de cada
   * botão. Nunca deixe uma tela com botão e sem divulgação.
   */
  divulgacao?: boolean;
};

/**
 * A linha que impede o botão de virar promessa: diz que há comissão, que o
 * leitor não paga mais caro por ela e que o preço de verdade é o da loja.
 *
 * Mora aqui, e não solta no meio das páginas, para que exista uma única
 * redação dela no site.
 */
export function DivulgacaoComissao({ plural = false }: { plural?: boolean }) {
  return (
    <p className="mt-2.5 text-[0.78rem] text-tinta-suave">
      {plural ? "Links de afiliado" : "Link de afiliado"}: o site recebe comissão
      e você paga o mesmo preço. O preço muda ao longo do dia; quem manda é o da
      loja.
    </p>
  );
}

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
 * O BOTÃO NÃO É MAIS DA AMAZON, É DA LOJA QUE TIVER O PRODUTO
 *
 * Decisão do Allan em 25/09/2026, ao planejar entrar em mais programas de
 * afiliado. O componente não conhece loja nenhuma por dentro: ele percorre o
 * que o produto declarou, na ordem de `LOJAS` em lib/site.ts, e monta a frase
 * com o nome e a preposição de lá — "na Amazon", "no Mercado Livre", "nas
 * Casas Bahia". Loja nova entra no registro, e o site inteiro passa a saber
 * escrever o nome dela.
 *
 * Quando há mais de uma, a primeira leva o botão sólido e as outras ficam com
 * o contorno — a regra da casa é que exista UMA cor de ação por página, e três
 * botões verdes lado a lado apagariam os três. A ordem está declarada em
 * número, e mudar o número muda o site inteiro.
 *
 * A hierarquia vale DENTRO de um produto, e não entre produtos. Na seção "Onde
 * comprar cada um" de um guia cada bloco é um produto diferente, um por perfil
 * de leitor: lá todos os botões são sólidos, porque nenhuma daquelas
 * recomendações vale menos que as outras. Tentado ao contrário em 26/09/2026 e
 * desfeito no mesmo dia.
 */
export function LojaCta({
  lojas,
  produto,
  posicao,
  nasLojasEm,
  divulgacao = true,
}: Props) {
  // Na ordem declarada em LOJAS, e sem chave desconhecida — que o build
  // recusa antes de chegar aqui.
  const disponiveis = lojasDe(lojas);
  if (!disponiveis.length) return null;

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
        {disponiveis.map(({ chave, url }, i) => (
          <a
            key={chave}
            href={linkDaLoja(chave, url)}
            rel="sponsored nofollow noopener"
            target="_blank"
            onClick={() => registrarClique(chave, produto, posicao)}
            className={`botao ${i === 0 ? "botao-primario" : "botao-secundario"} flex-1 !py-3`}
          >
            {rotuloCompra(chave)}
            <Icone nome="seta" className="h-4 w-4" />
          </a>
        ))}
      </div>
      {divulgacao && <DivulgacaoComissao plural={disponiveis.length > 1} />}
    </div>
  );
}

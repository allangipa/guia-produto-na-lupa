import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "O que este site é, de onde tira as informações e o que ele deliberadamente não faz.",
  alternates: { canonical: "/sobre" },
};

export default function Sobre() {
  return (
    <div className="mx-auto max-w-[var(--largura-prosa)] px-5 py-12">
      <h1 className="font-titulo text-3xl tracking-tight">
        O que este site é
      </h1>
      <div className="prosa mt-8">
        <p>
          O {site.nome} compara produtos de tecnologia e acessórios a partir da
          documentação oficial dos fabricantes. A pergunta que move cada página é
          sempre a mesma: onde este produto falha, e para quem essa falha
          importa.
        </p>

        <h2>O que não fazemos, e por quê</h2>
        <p>
          <strong>Não testamos produtos.</strong> Nenhum aparelho analisado aqui
          passou pelas nossas mãos, e nenhuma frase deste site vai dizer o
          contrário. Você não vai ler “usei por três semanas” nem encontrar
          medição de bancada, porque não houve nem uma coisa nem outra.
        </p>
        <p>
          Essa escolha custa caro — experiência de primeira mão é o sinal mais
          forte que existe numa análise — e é declarada em vez de disfarçada
          porque o disfarce custaria mais. Um site que finge ter testado se
          desmonta na primeira pergunta específica de um leitor que realmente
          tem o produto.
        </p>

        <h2>Então o que sobra</h2>
        <p>
          Sobra o trabalho que o fabricante não faz, e que quase nenhum site em
          português faz direito:
        </p>
        <ul>
          <li>
            <strong>Normalizar.</strong> Cada fabricante mede do seu jeito e
            publica na unidade que lhe convém. Colocar seis modelos na mesma
            tabela, na mesma unidade, é metade do trabalho de decidir.
          </li>
          <li>
            <strong>Rotular.</strong> Todo número daqui carrega a origem. Dado de
            fabricante é <em>promessa</em>, não resultado — e aparece marcado
            como tal, porque promessa de marketing e medição independente não
            valem a mesma coisa.
          </li>
          <li>
            <strong>Listar a omissão.</strong> Toda análise tem uma seção
            chamada “O que o fabricante não informa”. É a parte mais útil da
            página e a mais difícil de montar: o que a ficha técnica evita dizer
            costuma ser exatamente o que decide a compra.
          </li>
        </ul>
        <p>
          Cada página termina com a lista das fontes oficiais consultadas, com a
          data da consulta e o que especificamente saiu de cada uma. Ficha
          técnica muda sem aviso; você consegue conferir se ainda bate.
        </p>

        <h2>Quem responde</h2>
        <p>
          As análises são assinadas pela publicação, não por uma pessoa. Como
          ninguém aqui testou os produtos, uma assinatura pessoal sugeriria uma
          autoridade de uso que não existe — quem responde pelo conteúdo é o
          método, e o método está descrito em{" "}
          <Link href="/metodologia">Como avaliamos</Link>.
        </p>
        <p>
          Erro apontado por leitor é corrigido no texto, com a data da revisão na
          página. Se você tem um dos produtos analisados e a sua experiência foi
          outra, ela vale mais que a nossa pesquisa: escreva para{" "}
          <a href={`mailto:${site.editor.contato}`}>{site.editor.contato}</a> e a
          divergência entra na análise, com crédito.
        </p>

        <h2>Como o site se sustenta</h2>
        <p>
          Por comissão de afiliado da Amazon e do Mercado Livre. Se você compra
          por um link daqui, o site recebe uma porcentagem e você paga
          exatamente o mesmo preço. Nenhuma marca paga por análise, por nota ou
          por posição em comparativo, e quando um produto não vale a compra a
          análise diz isso — inclusive quando é o que mais renderia comissão.
        </p>
        <p>
          As imagens de produto vêm do material oficial dos próprios
          fabricantes, com crédito visível e a página de origem registrada na
          ficha. Os direitos são deles; se uma marca preferir que uma imagem
          não apareça aqui, ela é removida a pedido — o caminho está em{" "}
          <Link href="/privacidade">Privacidade</Link>.
        </p>
      </div>
    </div>
  );
}

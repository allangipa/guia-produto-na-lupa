import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Como avaliamos",
  description:
    "Os critérios de nota, o que conseguimos testar, o que não conseguimos, e como o site ganha dinheiro.",
  alternates: { canonical: "/metodologia" },
};

export default function Metodologia() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="font-titulo text-3xl tracking-tight">Como avaliamos</h1>
      <div className="prosa mt-8">
        <p>
          Antes de qualquer critério, o essencial: <strong>este site não testa
          produtos</strong>. As análises são feitas a partir da documentação
          oficial dos fabricantes. A ficha técnica entra como evidência declarada
          por quem vende — nunca como conclusão nossa.
        </p>

        <h2>De onde vêm as informações</h2>
        <p>
          Da página oficial do produto, do manual, da especificação técnica
          publicada pelo fabricante e dos termos de garantia e suporte que ele
          assume por escrito. Cada análise termina com a lista dessas páginas,
          com a data da consulta e o que especificamente saiu de cada uma, para
          você poder conferir na origem.
        </p>
        <p>
          Tudo que vem daí é <em>promessa do fabricante</em>. Quando a marca diz
          “30 horas de bateria”, o que existe é uma afirmação comercial em
          condições que ela escolheu. Escrevemos assim, e não como fato
          verificado.
        </p>

        <h2>Os critérios que dá para avaliar assim</h2>
        <p>
          A nota final não é média simples: cada critério tem seu peso, e o peso
          fica escrito na análise. Os critérios são estes porque são os que a
          documentação oficial permite comparar com honestidade.
        </p>
        <ul>
          <li>
            <strong>O que a especificação entrega</strong> — o que está prometido
            para a tarefa principal, comparado ao que a concorrência promete pelo
            mesmo dinheiro.
          </li>
          <li>
            <strong>Materiais e construção declarados</strong> — o que o
            fabricante afirma sobre material, vedação, resistência e o que ele
            evita afirmar.
          </li>
          <li>
            <strong>Compatibilidade e limites</strong> — o que precisa existir
            para o produto funcionar como anunciado, e o que deixa de funcionar
            fora dessas condições.
          </li>
          <li>
            <strong>Garantia e suporte no Brasil</strong> — prazo, cobertura,
            rede autorizada e disponibilidade de peças, conforme o que a marca
            assume por escrito.
          </li>
          <li>
            <strong>Transparência da documentação</strong> — quanto o fabricante
            informa e quanto ele omite. Marca que publica dado desfavorável pontua
            mais alto que marca que só publica o que convém.
          </li>
        </ul>

        <h2>O que não fazemos</h2>
        <p>
          Não medimos, não cronometramos, não abrimos, não deixamos cair. Nenhum
          critério acima avalia durabilidade real, desempenho real ou conforto
          real, porque isso exige ter o produto — e não temos.
        </p>
        <p>
          Não estimamos número que não medimos. Quando um dado importante não
          aparece na documentação oficial, ele vai para a seção “O que o
          fabricante não informa” em vez de virar um chute com cara de teste.
          Isso deixa algumas análises incompletas de propósito, e essa seção
          costuma ser a parte mais útil da página.
        </p>
        <p>
          Também não publicamos preço fixo no texto. Preço muda várias vezes por
          dia nas duas lojas; qualquer número escrito aqui estaria errado quando
          você lesse.
        </p>

        <h2>Como o site ganha dinheiro</h2>
        <p>
          Por comissão de afiliado da Amazon e do Mercado Livre. Se você compra
          por um link daqui, o site recebe uma porcentagem e você paga o mesmo
          preço. Nenhuma marca paga por análise, por nota ou por posição em
          comparativo — e, quando um produto não vale a compra, a análise diz
          isso, mesmo sendo o que mais renderia comissão.
        </p>

        <h2>Correções</h2>
        <p>
          Erro apontado por leitor é corrigido no texto, com a data da revisão no
          topo da página. E vale dizer com todas as letras: se você tem o produto
          e a sua experiência contradiz o que o fabricante promete,{" "}
          <strong>a sua informação vale mais que a nossa pesquisa</strong>.
          Escreva — a divergência entra na análise, com crédito.
        </p>
      </div>
    </div>
  );
}

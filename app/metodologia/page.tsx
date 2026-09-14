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
          Toda análise deste site parte de uma pergunta: o que esse produto faz
          com a rotina de quem compra. A ficha técnica entra como evidência, nunca
          como conclusão.
        </p>

        <h2>Os cinco critérios</h2>
        <p>
          A nota final não é média simples. Cada categoria tem seu próprio peso, e
          o peso fica escrito na análise.
        </p>
        <ul>
          <li>
            <strong>Desempenho na tarefa principal</strong> — o produto faz bem a
            única coisa pela qual você o compraria?
          </li>
          <li>
            <strong>Construção e durabilidade</strong> — materiais, encaixes,
            pontos que costumam quebrar primeiro.
          </li>
          <li>
            <strong>Uso diário</strong> — o que incomoda depois da terceira
            semana, não no unboxing.
          </li>
          <li>
            <strong>Suporte e reposição no Brasil</strong> — assistência, peças,
            garantia real, tempo de resposta.
          </li>
          <li>
            <strong>Preço pelo que entrega</strong> — comparado ao que a
            concorrência cobra pela mesma função.
          </li>
        </ul>

        <h2>De onde vêm as informações</h2>
        <p>
          Três fontes, sempre identificadas no texto: uso próprio, quando o
          produto passou pelas nossas mãos; dados do fabricante, tratados como
          promessa e não como fato; e o padrão de reclamação de compradores
          verificados, quando o mesmo defeito aparece de forma repetida.
        </p>

        <h2>O que não fazemos</h2>
        <p>
          Não estimamos número que não medimos. Quando um dado importante não
          existe ou não foi possível conferir, ele aparece na seção “O que não
          conseguimos verificar” em vez de virar um chute com cara de teste. Isso
          deixa algumas análises incompletas de propósito.
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
          topo da página. Se você usa um produto que analisamos e a sua
          experiência foi outra, escreva: a divergência entra na análise.
        </p>
      </div>
    </div>
  );
}

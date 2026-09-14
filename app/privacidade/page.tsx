import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacidade",
  description:
    "Que dados este site coleta, que dados ele não coleta, e o que acontece quando você clica num link de afiliado.",
  alternates: { canonical: "/privacidade" },
};

/**
 * Exigida pela LGPD e esperada pelos programas de afiliado no cadastro.
 *
 * Escrita para ser lida, não para cobrir o autor: um site estático que não tem
 * formulário, login nem banco de dados coleta pouquíssimo, e dizer isso em
 * português direto vale mais que três telas de jargão copiado de modelo.
 */
export default function Privacidade() {
  return (
    <div className="mx-auto max-w-[var(--largura-prosa)] px-5 py-12">
      <h1 className="font-titulo text-3xl tracking-tight">Privacidade</h1>
      <p className="mt-3 max-w-[62ch] text-lg text-tinta-suave">
        Em resumo: este site não tem cadastro, não tem formulário, não tem
        comentários e não tem banco de dados. Quase não há o que coletar — e o
        que há está descrito abaixo.
      </p>

      <div className="prosa mt-10">
        <h2>Quem é o responsável</h2>
        <p>
          O {site.nome} é uma publicação independente. Para qualquer questão
          sobre dados, correção de conteúdo ou remoção, escreva para{" "}
          <a href={`mailto:${site.editor.contato}`}>{site.editor.contato}</a>.
          Respondemos no mesmo endereço.
        </p>

        <h2>O que o site não faz</h2>
        <ul>
          <li>Não pede cadastro nem login.</li>
          <li>Não tem formulário de contato que armazene o que você escreve.</li>
          <li>Não envia newsletter e não mantém lista de e-mails.</li>
          <li>Não vende, aluga nem compartilha dados com terceiros.</li>
          <li>
            Não usa cookies próprios de rastreamento. As páginas são arquivos
            estáticos, sem servidor de aplicação por trás.
          </li>
        </ul>

        <h2>O que fica no seu navegador</h2>
        <p>
          Uma única coisa: a sua escolha de tema (claro, escuro ou o do sistema),
          guardada no armazenamento local do próprio navegador. Ela nunca sai do
          seu aparelho, não é enviada a lugar nenhum e você pode apagá-la
          limpando os dados do site.
        </p>

        <h2>Hospedagem e registros de acesso</h2>
        <p>
          O site é hospedado no GitHub Pages. Como qualquer servidor da internet,
          a infraestrutura de hospedagem registra requisições, o que inclui
          endereço IP e tipo de navegador. Esses registros são do provedor de
          hospedagem, seguem a política dele e não temos acesso a eles nem os
          utilizamos.
        </p>
        <p>
          As fontes tipográficas são carregadas do Google Fonts, o que significa
          que o seu navegador faz uma requisição aos servidores do Google ao
          abrir o site.
        </p>

        <h2>Links de afiliado</h2>
        <p>
          Este site participa de programas de afiliados da Amazon e do Mercado
          Livre. Quando você clica num link de loja, essas empresas normalmente
          gravam um cookie no seu navegador para identificar que a visita veio
          daqui, e é assim que a comissão é atribuída caso você compre.
        </p>
        <p>
          Esse cookie é da loja, não nosso. Nós não recebemos os seus dados
          pessoais, não sabemos o que você comprou e não temos acesso ao seu
          histórico. O que chega até nós é um relatório agregado de comissões.
          Você paga exatamente o mesmo preço com ou sem o link.
        </p>
        <p>
          Todo link de loja neste site carrega <code>rel="sponsored nofollow"</code>{" "}
          e a divulgação de afiliado aparece no topo de toda página de conteúdo.
          Como o site ganha dinheiro está descrito em{" "}
          <Link href="/metodologia">Como avaliamos</Link>.
        </p>

        <h2>Imagens de produto</h2>
        <p>
          As fotos de produto publicadas aqui vêm do material oficial do
          próprio fabricante, com crédito visível na imagem e a página de origem
          registrada na ficha. Os direitos são do fabricante. Se você representa
          uma marca e prefere que uma imagem não apareça neste site, escreva
          para{" "}
          <a href={`mailto:${site.editor.contato}`}>{site.editor.contato}</a>{" "}
          e ela é removida — sem exigir justificativa.
        </p>

        <h2>Medição de audiência</h2>
        <p>
          No momento não há nenhuma ferramenta de analytics instalada. Se isso
          mudar, esta página será atualizada antes, e a escolha será por uma
          ferramenta sem cookies e sem identificação individual.
        </p>

        <h2>Seus direitos</h2>
        <p>
          A LGPD garante a você acesso, correção e exclusão dos seus dados
          pessoais. Como este site não coleta dados pessoais identificáveis, na
          prática não há o que solicitar — mas se você acredita que algum dado
          seu apareça aqui, escreva para{" "}
          <a href={`mailto:${site.editor.contato}`}>{site.editor.contato}</a> e
          resolvemos.
        </p>

        <h2>Mudanças</h2>
        <p>
          Se esta política mudar, a data de revisão abaixo muda junto. Revisada
          em 14 de setembro de 2026.
        </p>
      </div>
    </div>
  );
}

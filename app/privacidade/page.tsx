import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacidade",
  description:
    "Que dados este site coleta, que dados ele não coleta, como funcionam os anúncios do Google AdSense e o que acontece quando você clica num link de afiliado.",
  alternates: { canonical: "/privacidade" },
};

/**
 * Exigida pela LGPD e esperada pelos programas de afiliado no cadastro.
 *
 * Escrita para ser lida, não para cobrir o autor: um site estático que não tem
 * formulário, login nem banco de dados coleta pouquíssimo, e dizer isso em
 * português direto vale mais que três telas de jargão copiado de modelo.
 *
 * Revista em 02/10/2026 para o Google AdSense: o site passou a exibir
 * anúncios, que trazem cookie de terceiro e a faixa de consentimento
 * (`components/consentimento.tsx`). As frases que diziam que o site não tinha
 * cookie de rastreamento nenhum saíram, porque deixaram de ser verdade.
 */
export default function Privacidade() {
  return (
    <div className="mx-auto max-w-[var(--largura-prosa)] px-5 py-12">
      <h1 className="font-titulo text-3xl tracking-tight">Privacidade</h1>
      <p className="mt-3 max-w-[62ch] text-lg text-tinta-suave">
        Em resumo: este site não tem cadastro, não tem formulário, não tem
        comentários e não tem banco de dados. Ele exibe anúncios do Google
        AdSense, e o Google usa cookies para isso — o que você pode recusar.
        Tudo está descrito abaixo.
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
          <li>Não vende nem aluga dados de ninguém.</li>
          <li>
            Não grava cookies próprios. As páginas são arquivos estáticos, sem
            servidor de aplicação por trás. Os cookies que aparecem ao navegar
            aqui são de terceiros — o Google, pelos anúncios, e as lojas, pelos
            links de afiliado — e estão descritos nas seções abaixo.
          </li>
        </ul>

        <h2>O que o site guarda no seu navegador</h2>
        <p>
          Duas coisas, no armazenamento local do próprio navegador (não são
          cookies e nunca saem do seu aparelho):
        </p>
        <ul>
          <li>
            a sua escolha de tema (claro, escuro ou o do sistema), na chave{" "}
            <code>tema</code>;
          </li>
          <li>
            a sua resposta à faixa de anúncios — <code>aceitar</code> ou{" "}
            <code>recusar</code> —, na chave <code>gp-consentimento</code>,
            para a faixa não voltar a cada página.
          </li>
        </ul>
        <p>
          Você pode apagar as duas limpando os dados do site no navegador; a
          faixa de anúncios volta a aparecer na visita seguinte.
        </p>

        <h2>Anúncios (Google AdSense)</h2>
        <p>
          Este site exibe anúncios do Google AdSense, que ajudam a pagar o
          trabalho junto com as comissões de afiliado. Nenhum anúncio é escolhido
          por nós, e nenhum anunciante influencia o que escrevemos.
        </p>
        <ul>
          <li>
            O Google, como fornecedor terceirizado, usa cookies para exibir
            anúncios neste site.
          </li>
          <li>
            O cookie DART, usado pelo Google, permite exibir anúncios com base
            nas suas visitas a este e a outros sites da internet.
          </li>
          <li>
            O Google e os parceiros de publicidade dele podem usar cookies,
            web beacons e identificadores semelhantes para medir a audiência e o
            desempenho dos anúncios e para personalizá-los.
          </li>
        </ul>
        <p>
          Você pode desativar a publicidade personalizada nas{" "}
          <a href="https://adssettings.google.com" rel="noopener">
            configurações de anúncios do Google
          </a>
          , entender como o Google usa esses dados em{" "}
          <a
            href="https://policies.google.com/technologies/ads?hl=pt-BR"
            rel="noopener"
          >
            policies.google.com/technologies/ads
          </a>
          , e recusar a personalização de outros fornecedores em{" "}
          <a href="https://www.aboutads.info/choices" rel="noopener">
            aboutads.info/choices
          </a>
          .
        </p>
        <p>
          <strong>A faixa no pé da página.</strong> Na primeira visita aparece
          uma faixa com dois botões. “Entendi” mantém os anúncios. “Recusar
          anúncios” impede que o script do AdSense seja carregado — ele é
          removido da página na hora e não carrega nas visitas seguintes, então
          o Google não grava cookie de anúncio por este site. A escolha fica
          guardada na chave <code>gp-consentimento</code> descrita acima; para
          mudar de ideia, apague os dados do site e a faixa volta. Para
          visitantes do Espaço Econômico Europeu, do Reino Unido e da Suíça, a
          pergunta é feita pela mensagem de consentimento do próprio Google, e
          a nossa faixa sai da frente.
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
          As fontes tipográficas são servidas do próprio domínio do site: abrir
          uma página não faz o seu navegador pedir fonte a servidor de
          terceiros.
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
          Não há ferramenta de analytics própria instalada. A medição que existe
          é a do Google AdSense, sobre a exibição e o desempenho dos anúncios,
          descrita acima — e ela não carrega se você recusar os anúncios. Se
          uma ferramenta própria for instalada, esta página será atualizada
          antes, e a escolha será por uma ferramenta sem cookies e sem
          identificação individual.
        </p>

        <h2>Serviços de terceiros</h2>
        <ul>
          <li>
            <strong>GitHub Pages</strong> — hospedagem, com os registros de
            acesso descritos acima.
          </li>
          <li>
            <strong>Google AdSense</strong> — anúncios, com cookies do Google e
            de parceiros, se você não recusar.
          </li>
          <li>
            <strong>Amazon e Mercado Livre</strong> — programas de afiliado, com
            cookie da loja quando você clica num link dela.
          </li>
        </ul>
        <p>
          Cada um segue a própria política de privacidade, e nós não recebemos
          os dados pessoais que eles coletam.
        </p>

        <h2>Seus direitos</h2>
        <p>
          A LGPD garante a você acesso, correção e exclusão dos seus dados
          pessoais. Este site não coleta, por conta própria, dados pessoais
          identificáveis. Os dados de anúncio são coletados e tratados pelo
          Google: pedidos sobre eles vão ao Google, pelas{" "}
          <a href="https://adssettings.google.com" rel="noopener">
            configurações de anúncios
          </a>{" "}
          e pelos canais da{" "}
          <a href="https://policies.google.com/privacy?hl=pt-BR" rel="noopener">
            política de privacidade do Google
          </a>
          . Para qualquer outra questão, ou se você acredita que algum dado seu
          apareça aqui, escreva para{" "}
          <a href={`mailto:${site.editor.contato}`}>{site.editor.contato}</a> —
          o caminho está também em <Link href="/contato">Contato</Link>.
        </p>

        <h2>Mudanças</h2>
        <p>
          Se esta política mudar, a data de revisão abaixo muda junto. Revisada
          em 2 de outubro de 2026, com a entrada do Google AdSense.
        </p>
      </div>
    </div>
  );
}

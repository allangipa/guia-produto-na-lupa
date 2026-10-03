import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contato",
  description:
    "Como falar com o Guia Produto na Lupa: correções com fonte, imagens de fabricante, pedidos sobre dados e sugestões de pauta.",
  alternates: { canonical: "/contato" },
};

/**
 * Criada em 02/10/2026, junto com o AdSense, que espera uma página de contato
 * própria. O e-mail é o mesmo que o site já publica no rodapé e no /sobre
 * (`site.editor.contato`) — não há formulário, de propósito: formulário
 * guardaria o que o leitor escreve, e a política de privacidade diz que não
 * guardamos.
 */
export default function Contato() {
  const email = site.editor.contato;
  return (
    <div className="mx-auto max-w-[var(--largura-prosa)] px-5 py-12">
      <h1 className="font-titulo text-3xl tracking-tight">Contato</h1>
      <p className="mt-3 max-w-[62ch] text-lg text-tinta-suave">
        Correção, imagem de fabricante, pedido sobre dados ou sugestão: o
        caminho é um só, por e-mail.
      </p>

      <div className="painel mt-8 p-5">
        <p className="text-[0.95rem]">
          <strong>E-mail:</strong>{" "}
          <a href={`mailto:${email}`} className="text-acao-forte underline">
            {email}
          </a>
        </p>
      </div>

      <div className="prosa mt-10">
        <h2>Para que escrever</h2>
        <ul>
          <li>
            <strong>Correções.</strong> Um número que não bate com a ficha do
            fabricante, um modelo trocado, uma informação que mudou. Mande a
            fonte junto, de preferência a página oficial: é o que permite
            corrigir rápido. Erro confirmado é corrigido no texto, com a data
            da revisão na página.
          </li>
          <li>
            <strong>Imagens e créditos.</strong> As fotos de produto vêm do
            material oficial das marcas. Se você representa uma marca e prefere
            que uma imagem não apareça aqui, ela é removida a pedido, sem
            exigir justificativa.
          </li>
          <li>
            <strong>Seus dados.</strong> Pedidos sob a LGPD, conforme a{" "}
            <Link href="/privacidade">política de privacidade</Link>. O que
            diz respeito aos anúncios é tratado pelo Google, e a página explica
            o caminho.
          </li>
          <li>
            <strong>Pautas e parcerias.</strong> Sugestão de produto ou
            categoria para comparar é bem-vinda. Nenhuma marca paga por
            análise, nota ou posição em comparativo, e isso não está à venda.
          </li>
          <li>
            <strong>Experiência com o produto.</strong> Se você tem um dos
            produtos analisados e a sua experiência foi outra, ela vale mais
            que a nossa pesquisa: a divergência entra na análise, com crédito.
          </li>
        </ul>

        <h2>Como respondemos</h2>
        <p>
          Não há formulário nem cadastro: a conversa é por e-mail, e o seu
          endereço não é usado para mais nada além de responder. Quem responde é
          a publicação, como explicado em{" "}
          <Link href="/sobre">O que este site é</Link>.
        </p>
      </div>
    </div>
  );
}

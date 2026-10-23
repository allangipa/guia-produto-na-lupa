"use client";

import type { Curso } from "@/lib/cursos";
import { linkDaLoja } from "@/lib/site";
import { registrarClique } from "@/components/loja-cta";
import { Icone } from "@/components/icones";

/**
 * O curso (ou e-book) de afiliado, como passo seguinte de quem quer fazer o
 * serviço sozinho. Desde 23/10/2026; critério em docs/hotmart.md.
 *
 * É um bloco de CTA e conta no teto de três por página. Vem depois da entrega
 * de valor — no guia, depois de "Onde comprar cada um"; no simulador, depois
 * da lista de compras — e nunca no lugar de um produto.
 *
 * O texto segue a regra da ficha: o que a página de venda publica, com a data
 * da consulta, e o que ela não publica. Ninguém aqui leu o guia ou fez o
 * curso, e o bloco diz isso antes de qualquer outra coisa.
 *
 * O botão diz "Ver a página do guia", e não "Comprar na Hotmart": o hotlink
 * abre a página de venda do produtor, que é onde o leitor confere o que a
 * gente resumiu. Comprar é o passo dele lá, não o nosso aqui.
 */
export function CursoHotmart({
  curso: c,
  posicao,
  titulo = "Para instalar você mesmo",
}: {
  curso: Curso;
  posicao: "guia" | "simulador";
  titulo?: string;
}) {
  const [ano, mes, dia] = c.fonte.consultadaEm.split("-");
  return (
    <section id="para-instalar" className="painel mt-12 scroll-mt-24 p-5 sm:p-6">
      <h2 className="titulo-ui text-[1.15rem]">{titulo}</h2>
      <p className="mt-2 max-w-[62ch] text-[0.92rem] text-tinta-suave">
        {c.tipo === "guia" ? "Ninguém aqui leu este guia." : "Ninguém aqui fez este curso."} O que vem abaixo é o que a página de venda
        publica, consultada em{" "}
        <span className="dados">
          {dia}/{mes}/{ano}
        </span>
        , e o que ela deixa de fora.
      </p>

      <p className="mt-5 font-medium">{c.nome}</p>
      <p className="mt-1 text-[0.88rem] text-tinta-suave">
        {c.formato} · de {c.produtor}. {c.produtorQuem}
      </p>

      <dl className="mt-4 grid gap-x-4 gap-y-2 text-[0.92rem] sm:grid-cols-[8rem_1fr]">
        {c.publica.map((p) => (
          <div key={p.campo} className="contents">
            <dt className="font-medium">{p.campo}</dt>
            <dd className="max-w-[56ch] text-tinta-suave">{p.valor}</dd>
          </div>
        ))}
      </dl>

      {c.lacunas.length > 0 && (
        <div className="mt-5 border border-dashed border-linha p-4">
          <p className="text-[0.88rem] font-medium">O que a página de venda não informa</p>
          <ul className="mt-2 space-y-1 text-[0.88rem] text-tinta-suave">
            {c.lacunas.map((l) => (
              <li key={l} className="max-w-[60ch]">{l}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="my-6">
        <a
          href={linkDaLoja("hotmart", c.hotmart)}
          rel="sponsored nofollow noopener"
          target="_blank"
          onClick={() => registrarClique("hotmart", c.nome, posicao)}
          className="botao botao-primario flex-1 !py-3 sm:inline-flex"
        >
          Ver a página do {c.tipo}
          <Icone nome="seta" className="h-4 w-4" />
        </a>
        <p className="mt-2.5 text-[0.78rem] text-tinta-suave">
          Link de afiliado da Hotmart: o site recebe comissão e você paga o
          mesmo preço. Preço, garantia e condições valem os da página do
          produtor. Fonte:{" "}
          <a href={c.fonte.url} rel="nofollow noopener" target="_blank" className="underline underline-offset-4">
            {c.fonte.titulo}
          </a>
          .
        </p>
      </div>
    </section>
  );
}

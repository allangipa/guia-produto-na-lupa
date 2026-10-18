import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Criterio, Imagem } from "@/lib/conteudo";
import { notaLegivel } from "@/lib/conteudo";
import type { Produto } from "@/lib/specs";
import { SeloTransparencia } from "@/components/selo-transparencia";

/**
 * A escala por critério é o elemento visual forte da página: uma leitura de
 * instrumento, não um enfeite. Cada barra mostra onde o produto está em cada
 * frente e o comentário explica por quê.
 */
export function EscalaCriterios({ criterios }: { criterios: Criterio[] }) {
  return (
    <dl className="mt-6 space-y-4">
      {criterios.map((c) => (
        <div key={c.nome} className="grid gap-1 sm:grid-cols-[11rem_1fr]">
          <dt className="pt-[2px] text-[0.95rem] font-medium">
            {c.nome}
            {/* O peso na tela, e nao so no arquivo: a /metodologia promete que
                "o peso fica escrito na analise", e ate 25/09/2026 nao ficava
                em lugar nenhum. */}
            <span className="ml-1.5 font-dado text-[0.72rem] font-normal tabular-nums text-tinta-suave">
              {Math.round(c.peso * 100)}%
            </span>
          </dt>
          <dd>
            <div className="flex items-center gap-3">
              <div
                className="h-[6px] flex-1 rounded-full bg-linha"
                role="img"
                aria-label={`${c.nome}: ${notaLegivel(c.nota)} de 10, com peso de ${Math.round(c.peso * 100)}% na nota final`}
              >
                <div
                  className="h-full rounded-full bg-acao"
                  style={{ width: `${Math.max(0, Math.min(10, c.nota)) * 10}%` }}
                />
              </div>
              <span className="font-dado text-[0.85rem] tabular-nums text-tinta-suave">
                {notaLegivel(c.nota)}
              </span>
            </div>
            <p className="mt-1 max-w-[60ch] text-[0.92rem] text-tinta-suave">
              {c.comentario}
            </p>
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * O veredito na primeira tela, desde 17/10/2026.
 *
 * Até então a análise abria com título, subtítulo e uma foto em largura
 * inteira; a nota, o "compre se" e o "não compre se" só apareciam depois de
 * rolar. Os sites que ranqueiam em "X é bom?" (TudoCelular, TechTudo) abrem
 * com a nota e a resposta — ver docs/concorrentes-2026-10-17.md. Aqui o card
 * reúne nota, selo de transparência, as duas listas e a foto, menor, ao lado;
 * a linha de rodapé diz em uma frase o que o corpo do texto explica depois:
 * ninguém aqui usou o produto, e a nota mede o que a documentação permite.
 *
 * `foto` e `ficha` são opcionais para o card servir também a uma análise sem
 * foto licenciada ou sem produto na base; o layout fecha nos dois casos.
 */
export function VereditoRapido({
  nota,
  para,
  naoPara,
  foto,
  ficha,
  cta,
}: {
  nota: number;
  para: string[];
  naoPara: string[];
  foto?: Imagem;
  ficha?: Produto;
  /**
   * O botão de loja, dentro do card e abaixo das listas, desde 17/10/2026.
   * Decisão do Allan: "pode ser mudado se achar que melhora a possibilidade de
   * clique". Continua depois da entrega de valor (nota e listas) e continua
   * sendo o único bloco de CTA do veredito; no celular passa a ficar junto do
   * veredito em vez de depois da foto, a mais de 1.500 px do topo.
   */
  cta?: ReactNode;
}) {
  return (
    <section aria-label="Veredito em 30 segundos" className="painel order-1 mt-6 overflow-hidden sm:order-2 sm:mt-8">
      <div className={`grid gap-6 p-5 sm:p-6 ${foto ? "sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]" : ""}`}>
        {/* No celular a foto vem depois da nota e das listas: o veredito é o
            que a pessoa veio ver, e 256 px de foto antes dele o empurravam
            para fora da primeira tela. */}
        {foto && (
          <figure className="order-2 min-w-0 sm:order-1">
            <div className="overflow-hidden rounded-lg border border-linha bg-superficie">
              <Image
                src={foto.src}
                alt={foto.alt}
                width={900}
                height={600}
                priority
                className="h-auto max-h-64 w-full object-contain sm:max-h-none"
              />
            </div>
            <figcaption className="mt-1.5 text-[0.72rem] leading-snug text-tinta-suave">
              {foto.credito}
            </figcaption>
          </figure>
        )}

        <div className="order-1 min-w-0 sm:order-2">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
            <span className="font-dado text-[2.6rem] tabular-nums leading-none">
              {notaLegivel(nota)}
            </span>
            <span className="text-[0.95rem] text-tinta-suave">de 10 na nossa escala</span>
            {ficha && <SeloTransparencia produto={ficha} className="ml-auto" />}
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div>
              <h2 className="titulo-ui text-[1rem]">Compre se você</h2>
              <ul className="mt-2 space-y-1.5 text-[0.93rem] leading-snug">
                {para.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span aria-hidden className="text-acao">✓</span>
                    <span className="max-w-[40ch]">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="titulo-ui text-[1rem]">Não compre se você</h2>
              <ul className="mt-2 space-y-1.5 text-[0.93rem] leading-snug">
                {naoPara.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span aria-hidden className="text-atencao">✕</span>
                    <span className="max-w-[40ch]">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {cta && <div className="-mb-2 mt-1">{cta}</div>}
        </div>
      </div>

      {/* A ressalva que o corpo do texto detalha, em uma linha e antes de
          qualquer botão: é o que separa esta nota de uma nota de quem testou. */}
      <p className="border-t border-linha bg-superficie/60 px-5 py-2.5 text-[0.8rem] text-tinta-suave sm:px-6">
        Nota pela documentação oficial do fabricante — ninguém aqui usou o
        produto.{" "}
        <Link href="/metodologia" className="underline underline-offset-4">
          Como avaliamos
        </Link>
      </p>
    </section>
  );
}

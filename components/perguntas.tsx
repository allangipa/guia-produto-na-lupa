import { negrito } from "@/lib/texto";

export type Pergunta = { pergunta: string; resposta: string };

/**
 * "Perguntas que a ficha responde", no fim do guia, desde 17/10/2026.
 *
 * Os sites que ranqueiam nas nossas buscas (Zoom, Promobit, Panelas e
 * Cozinha) fecham o guia com títulos em forma de pergunta — é o que entra no
 * "As pessoas também perguntam" do Google. As perguntas aqui são as que o
 * autocomplete completa para a categoria (ver docs/concorrentes-2026-10-17.md),
 * e cada resposta sai das fichas da base, com os números, ou diz que a ficha
 * não responde. Nada de estimativa, nada de preço, nada de "testamos".
 *
 * Pergunta e resposta ficam em `perguntas:` no frontmatter do guia; a página
 * emite também o JSON-LD FAQPage (`schemaPerguntas`), que é verdadeiro porque
 * o par pergunta/resposta está visível na página.
 */
export function Perguntas({ itens }: { itens?: Pergunta[] }) {
  if (!itens?.length) return null;
  return (
    <section id="perguntas" className="my-10 scroll-mt-24">
      <h2 className="font-titulo text-xl">Perguntas que a ficha responde</h2>
      <p className="mt-2 max-w-[62ch] text-[0.95rem] text-tinta-suave">
        São as perguntas que o Google completa sozinho quando alguém digita o
        nome da categoria. As respostas saem das fichas oficiais desta base, com
        os números — e dizem quando a ficha não responde.
      </p>
      <div className="mt-6 space-y-6">
        {itens.map((q) => (
          <div key={q.pergunta} className="max-w-[62ch]">
            <h3 className="titulo-ui text-[1.05rem]">{q.pergunta}</h3>
            <p
              className="mt-1.5 text-[0.95rem] leading-relaxed text-tinta-suave"
              dangerouslySetInnerHTML={{ __html: negrito(q.resposta) }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

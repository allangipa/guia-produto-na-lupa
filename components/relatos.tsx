import type { Relato } from "@/lib/specs";
import { dataLegivel } from "@/lib/conteudo";

/**
 * O que compradores relatam de forma repetida.
 *
 * É a única parte deste site que toca na experiência real de uso — e a única
 * coisa que um site sem bancada pode oferecer que o fabricante jamais vai
 * publicar. Nada aqui é copiado: as avaliações das lojas são lidas como
 * matéria-prima e o que sai é síntese nossa.
 *
 * A conta "X de Y avaliações lidas" fica visível de propósito. Sem ela, o
 * leitor não tem como separar padrão de reclamação isolada — e um relato sem
 * denominador é opinião fingindo ser dado.
 */
export function Relatos({ itens }: { itens: Relato[] }) {
  if (!itens?.length) return null;

  const problemas = itens.filter((r) => r.tom === "problema");
  const elogios = itens.filter((r) => r.tom === "elogio");
  const lidasEm = itens
    .map((r) => r.lidasEm)
    .sort()
    .at(-1);
  const lojas = [...new Set(itens.flatMap((r) => r.lojas))];

  return (
    <section className="my-12">
      <h2 className="font-titulo text-xl">O que os compradores relatam</h2>
      <p className="mt-2 max-w-[62ch] text-[0.95rem] text-tinta-suave">
        Lemos as avaliações públicas {lojas.length ? `d${lojas.length > 1 ? "as lojas" : "a loja"} ${lojas.join(" e ")}` : "das lojas"}{" "}
        e reunimos abaixo só o que aparece de forma repetida, escrito com nossas
        palavras. Não reproduzimos avaliações nem notas de terceiros, e elas não
        entram em nenhuma nota deste site.
      </p>

      {[
        { titulo: "Reclamações que se repetem", lista: problemas },
        { titulo: "Elogios que se repetem", lista: elogios },
      ].map(({ titulo, lista }) =>
        lista.length ? (
          <div key={titulo} className="mt-6">
            <h3 className="font-titulo text-lg">{titulo}</h3>
            <ul className="mt-3 divide-y divide-linha border-y border-linha">
              {lista.map((r) => (
                <li
                  key={r.padrao}
                  className="grid gap-1 py-3 sm:grid-cols-[1fr_10rem]"
                >
                  <p className="max-w-[56ch]">{r.padrao}</p>
                  <p className="font-dado text-[0.8rem] text-tinta-suave sm:text-right">
                    {r.mencoes} de {r.totalLidas} lidas
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : null,
      )}

      {lidasEm && (
        <p className="mt-4 font-dado text-[0.8rem] text-tinta-suave">
          Avaliações lidas em {dataLegivel(lidasEm)}
        </p>
      )}
    </section>
  );
}

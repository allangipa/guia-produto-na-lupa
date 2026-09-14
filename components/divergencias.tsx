import type { Campo, Divergencia } from "@/lib/specs";
import { valorLegivel } from "@/lib/specs";
import type { Fonte } from "@/lib/conteudo";
import { rotuloTipoFonte } from "@/lib/conteudo";

/**
 * Onde as fontes não batem.
 *
 * Num site que não testa, achar contradição entre o que a marca estampa e o que
 * ela registra num órgão regulador é o mais perto que dá para chegar de uma
 * apuração própria. Por isso a divergência não é nota de rodapé: ganha seção,
 * com os dois valores e o nome de quem disse cada um.
 */
export function Divergencias({
  itens,
  campos,
  fontes,
  specs,
}: {
  itens: Divergencia[];
  campos: Campo[];
  fontes: Fonte[];
  specs: Record<string, unknown>;
}) {
  if (!itens?.length) return null;

  const fonte = (id: string) => fontes.find((f) => f.id === id);

  return (
    <section className="my-10 rounded-lg border-l-[3px] border-atencao bg-superficie p-5">
      <h2 className="titulo-ui text-lg">Onde as fontes não batem</h2>
      <p className="mt-2 max-w-[62ch] text-[0.95rem] text-tinta-suave">
        Fontes diferentes publicaram números diferentes para o mesmo dado — ou
        uma publicou o que a outra calou. Mostramos os dois lados e dizemos de
        quem é cada um: a diferença costuma ser mais informativa que qualquer um
        dos valores sozinho.
      </p>

      <ul className="mt-6 space-y-6">
        {itens.map((d) => {
          const campo = campos.find((c) => c.chave === d.campo);
          if (!campo) return null;
          const adotada = fonte(d.fonteAdotada);
          const divergente = fonte(d.fonteDivergente);

          // O fabricante calar e outra fonte publicar não é contradição: é
          // lacuna preenchida por quem mediu. Merece texto diferente, senão a
          // tela diz "Não informa — adotado", que não quer dizer nada.
          const adotadoAusente =
            specs[d.campo] === null || specs[d.campo] === undefined;

          return (
            <li key={`${d.campo}-${d.fonteDivergente}`} className="max-w-[62ch]">
              <p className="font-medium">{campo.rotulo}</p>
              <dl className="mt-2 space-y-1.5 text-[0.95rem]">
                <div className="flex flex-wrap gap-x-2">
                  <dt className="text-tinta-suave">
                    {adotada
                      ? `${rotuloTipoFonte[adotada.tipo]} (${adotada.titulo})`
                      : "Fonte adotada"}
                    :
                  </dt>
                  <dd
                    className={`dados ${adotadoAusente ? "text-ausente" : ""}`}
                  >
                    {valorLegivel((specs[d.campo] ?? null) as never, campo)}
                    {!adotadoAusente && (
                      <span className="ml-2 rounded border border-linha px-1.5 py-0.5 text-[0.7rem] uppercase tracking-wide text-tinta-suave">
                        adotado
                      </span>
                    )}
                  </dd>
                </div>
                <div className="flex flex-wrap gap-x-2">
                  <dt className="text-tinta-suave">
                    {divergente
                      ? `${rotuloTipoFonte[divergente.tipo]} (${divergente.titulo})`
                      : "Outra fonte"}
                    :
                  </dt>
                  <dd className="font-dado text-atencao">
                    {d.valorDivergente}
                  </dd>
                </div>
              </dl>
              {adotadoAusente && (
                <p className="mt-2 text-[0.9rem] text-tinta-suave">
                  O fabricante não publica este dado. O valor acima existe
                  porque outra fonte o registrou — não é contradição, é uma
                  lacuna preenchida por quem mediu.
                </p>
              )}
              {d.observacao && (
                <p className="mt-2 text-[0.9rem] text-tinta-suave">
                  {d.observacao}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

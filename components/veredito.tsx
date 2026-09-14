import type { Criterio } from "@/lib/conteudo";

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
          <dt className="pt-[2px] text-[0.95rem] font-medium">{c.nome}</dt>
          <dd>
            <div className="flex items-center gap-3">
              <div
                className="h-[6px] flex-1 rounded-full bg-linha"
                role="img"
                aria-label={`${c.nome}: ${c.nota.toFixed(1)} de 10`}
              >
                <div
                  className="h-full rounded-full bg-acao"
                  style={{ width: `${Math.max(0, Math.min(10, c.nota)) * 10}%` }}
                />
              </div>
              <span className="font-dado text-[0.85rem] tabular-nums text-tinta-suave">
                {c.nota.toFixed(1)}
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

export function VereditoRapido({
  nota,
  para,
  naoPara,
}: {
  nota: number;
  para: string[];
  naoPara: string[];
}) {
  return (
    <section
      aria-label="Veredito em 30 segundos"
      className="my-10 border-y border-linha py-8"
    >
      <div className="flex items-baseline gap-3">
        <span className="font-dado text-4xl tabular-nums leading-none">
          {nota.toFixed(1)}
        </span>
        <span className="text-tinta-suave">de 10 na nossa escala</span>
      </div>

      <div className="mt-7 grid gap-7 sm:grid-cols-2">
        <div>
          <h2 className="titulo-ui text-lg">Compre se você</h2>
          <ul className="mt-2 space-y-2 text-[0.97rem]">
            {para.map((p) => (
              <li key={p} className="flex gap-2">
                <span aria-hidden className="text-acao">
                  ✓
                </span>
                <span className="max-w-[40ch]">{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="titulo-ui text-lg">Não compre se você</h2>
          <ul className="mt-2 space-y-2 text-[0.97rem]">
            {naoPara.map((p) => (
              <li key={p} className="flex gap-2">
                <span aria-hidden className="text-atencao">
                  ✕
                </span>
                <span className="max-w-[40ch]">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

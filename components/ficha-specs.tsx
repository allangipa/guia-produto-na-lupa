import type { Campo, Produto } from "@/lib/produtos";
import { transparencia, valorLegivel } from "@/lib/produtos";

/**
 * A ficha completa de um produto, agrupada por bloco.
 *
 * O que o fabricante não informa aparece na mesma tabela, em vermelho, e não
 * escondido: numa ficha montada só com documentação oficial, a ausência é
 * metade da informação.
 */
export function FichaSpecs({
  produto,
  campos,
}: {
  produto: Produto;
  campos: Campo[];
}) {
  const grupos = new Map<string, Campo[]>();
  for (const c of campos) {
    grupos.set(c.grupo, [...(grupos.get(c.grupo) ?? []), c]);
  }

  return (
    <div className="mt-10">
      {[...grupos.entries()].map(([grupo, lista]) => (
        <section key={grupo} className="mt-8 first:mt-0">
          <h2 className="titulo-ui text-lg">{grupo}</h2>
          <dl className="mt-3 divide-y divide-linha border-y border-linha">
            {lista.map((campo) => {
              const valor = produto.specs[campo.chave];
              const ausente = valor === null || valor === undefined;
              return (
                <div
                  key={campo.chave}
                  className="grid gap-1 py-3 sm:grid-cols-[18rem_1fr]"
                >
                  <dt className="text-[0.95rem]">
                    {campo.rotulo}
                    {campo.ajuda && (
                      <span className="mt-0.5 block max-w-[42ch] text-[0.78rem] text-tinta-suave">
                        {campo.ajuda}
                      </span>
                    )}
                  </dt>
                  <dd
                    className={`dados text-[0.95rem] ${ausente ? "text-ausente" : ""}`}
                  >
                    {valorLegivel(valor, campo)}
                    {/* Só conta como confirmação o que veio de fonte que mediu
                        ou registrou por conta própria — varejo copia a marca. */}
                    {produto.confirmadoPor?.[campo.chave]?.length ? (
                      <span className="ml-2 rounded border border-linha px-1.5 py-0.5 text-[0.7rem] uppercase tracking-wide text-tinta-suave">
                        confirmado
                      </span>
                    ) : null}
                  </dd>
                </div>
              );
            })}
          </dl>
        </section>
      ))}
    </div>
  );
}

/**
 * A nota que não depende de julgamento nosso: ou o dado está na documentação
 * oficial, ou não está.
 */
export function NotaTransparencia({
  produto,
  campos,
}: {
  produto: Produto;
  campos: Campo[];
}) {
  const t = transparencia(produto, campos);

  return (
    <div>
      <div className="flex items-baseline gap-3">
        <p className="font-dado text-4xl leading-none">{t.nota}%</p>
        <p className="text-tinta-suave">
          da ficha técnica é publicada pelo fabricante
        </p>
      </div>
      <p className="mt-3 max-w-[62ch] text-[0.95rem] text-tinta-suave">
        {t.preenchidos} de {t.total} campos comparáveis estão na documentação
        oficial. Esta é a única nota do site que não passa por julgamento nosso:
        ou o dado está publicado, ou não está.
      </p>

      {t.ausentes.length > 0 && (
        <div className="mt-6">
          <h2 className="titulo-ui text-lg">O que o fabricante não informa</h2>
          <ul className="mt-3 space-y-2">
            {t.ausentes.map((c) => (
              <li key={c.chave} className="max-w-[62ch] text-[0.95rem]">
                <span className="text-ausente">{c.rotulo}</span>
                {c.ajuda && (
                  <span className="text-tinta-suave"> — {c.ajuda}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

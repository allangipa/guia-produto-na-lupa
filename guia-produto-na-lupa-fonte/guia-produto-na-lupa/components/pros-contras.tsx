/**
 * Os contras vêm primeiro, e na mesma altura visual dos prós.
 * Review que só elogia não é lido como review.
 */
export function ProsContras({
  pros,
  contras,
}: {
  pros: string[];
  contras: string[];
}) {
  return (
    <section className="my-10 grid gap-8 sm:grid-cols-2">
      <div className="rounded-lg border-l-[3px] border-atencao bg-superficie p-5">
        <h2 className="font-titulo text-lg">Onde ele decepciona</h2>
        <ul className="mt-3 space-y-2 text-[0.97rem]">
          {contras.map((c) => (
            <li key={c} className="max-w-[42ch]">{c}</li>
          ))}
        </ul>
      </div>
      <div className="rounded-lg border-l-[3px] border-acao bg-superficie p-5">
        <h2 className="font-titulo text-lg">Onde ele entrega</h2>
        <ul className="mt-3 space-y-2 text-[0.97rem]">
          {pros.map((p) => (
            <li key={p} className="max-w-[42ch]">{p}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Regra da casa: quando o dado não existe, a lacuna fica escrita. */
export function Lacunas({ itens }: { itens: string[] }) {
  if (!itens?.length) return null;
  return (
    <section className="my-10 border border-dashed border-linha p-5">
      <h2 className="font-titulo text-lg">O que não conseguimos verificar</h2>
      <ul className="mt-3 space-y-2 text-[0.95rem] text-tinta-suave">
        {itens.map((i) => (
          <li key={i} className="max-w-[62ch]">{i}</li>
        ))}
      </ul>
    </section>
  );
}

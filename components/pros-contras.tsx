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
        <h2 className="titulo-ui text-lg">O que pesa contra</h2>
        <ul className="mt-3 space-y-2 text-[0.97rem]">
          {contras.map((c) => (
            <li key={c} className="max-w-[42ch]">{c}</li>
          ))}
        </ul>
      </div>
      <div className="rounded-lg border-l-[3px] border-acao bg-superficie p-5">
        <h2 className="titulo-ui text-lg">O que pesa a favor</h2>
        <ul className="mt-3 space-y-2 text-[0.97rem]">
          {pros.map((p) => (
            <li key={p} className="max-w-[42ch]">{p}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/**
 * O que o fabricante não conta.
 *
 * Num site que testa produto, isto seria uma nota de rodapé. Aqui é o produto
 * editorial: qualquer um copia a ficha técnica, mas ninguém publica a lista do
 * que a página oficial evita dizer. A omissão é a informação — e é o único
 * lugar da análise onde há trabalho que o fabricante não fez por nós.
 */
export function Lacunas({ itens }: { itens: string[] }) {
  if (!itens?.length) return null;
  return (
    <section className="my-10 border border-dashed border-linha p-5">
      <h2 className="titulo-ui text-lg">O que o fabricante não informa</h2>
      <p className="mt-2 max-w-[62ch] text-[0.95rem] text-tinta-suave">
        Procuramos e não achamos na documentação oficial. Fica em branco de
        propósito: estimativa com cara de teste é o que este site não faz.
      </p>
      <ul className="mt-4 space-y-2 text-[0.95rem] text-tinta-suave">
        {itens.map((i) => (
          <li key={i} className="max-w-[62ch]">{i}</li>
        ))}
      </ul>
    </section>
  );
}

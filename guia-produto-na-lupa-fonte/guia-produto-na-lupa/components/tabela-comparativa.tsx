import type { Produto } from "@/lib/conteudo";

type Props = {
  titulo?: string;
  produtos: Pick<Produto, "nome" | "marca">[];
  linhas: { criterio: string; valores: string[] }[];
  /** Índice do produto vencedor, se houver um vencedor geral. */
  destaque?: number;
};

/**
 * No celular a tabela rola na horizontal com a coluna de critérios travada,
 * então o leitor nunca perde a referência do que está comparando.
 */
export function TabelaComparativa({
  titulo,
  produtos,
  linhas,
  destaque,
}: Props) {
  return (
    <section className="my-10">
      {titulo && <h2 className="font-titulo text-xl">{titulo}</h2>}
      <div className="mt-4 overflow-x-auto rounded-lg border border-linha">
        <table className="w-full min-w-[34rem] border-collapse text-[0.93rem]">
          <caption className="sr-only">
            {titulo ?? "Comparativo entre os produtos analisados"}
          </caption>
          <thead>
            <tr>
              <th
                scope="col"
                className="sticky left-0 z-10 w-40 border-b border-linha bg-superficie p-3 text-left align-bottom font-medium"
              >
                Critério
              </th>
              {produtos.map((p, i) => (
                <th
                  scope="col"
                  key={p.nome}
                  className={`border-b border-linha p-3 text-left align-bottom font-medium ${
                    i === destaque ? "bg-acao/8" : "bg-superficie"
                  }`}
                >
                  <span className="block text-[0.78rem] font-normal text-tinta-suave">
                    {p.marca}
                  </span>
                  {p.nome}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {linhas.map((linha) => (
              <tr key={linha.criterio} className="even:bg-superficie/50">
                <th
                  scope="row"
                  className="sticky left-0 z-10 border-b border-linha bg-papel p-3 text-left font-medium"
                >
                  {linha.criterio}
                </th>
                {linha.valores.map((v, i) => (
                  <td
                    key={`${linha.criterio}-${i}`}
                    className={`border-b border-linha p-3 align-top ${
                      i === destaque ? "bg-acao/5" : ""
                    }`}
                  >
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[0.8rem] text-tinta-suave sm:hidden">
        Arraste a tabela para o lado para ver todas as colunas.
      </p>
    </section>
  );
}

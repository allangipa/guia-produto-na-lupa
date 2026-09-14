import {
  dataLegivel,
  rotuloTipoFonte,
  FONTES_INDEPENDENTES,
  type Fonte,
} from "@/lib/conteudo";

/**
 * A lista de fontes é o que separa esta análise de uma cópia da página da loja.
 * Sem uso próprio do produto, a única prova que o leitor tem é poder conferir
 * cada número na origem — por isso ela fica no corpo da página, não escondida
 * num rodapé, e cada item diz o que especificamente saiu dali.
 *
 * Links sem `sponsored`: fonte não é link comercial. `nofollow` também não, para
 * a citação valer como citação.
 */
export function Fontes({ itens }: { itens: Fonte[] }) {
  if (!itens?.length) return null;

  return (
    <section className="my-12 border-t border-linha pt-8">
      <h2 className="font-titulo text-xl">De onde vieram os dados</h2>
      <p className="mt-2 max-w-[62ch] text-[0.95rem] text-tinta-suave">
        Nenhum produto desta página passou pelas nossas mãos. Tudo que está
        afirmado aqui veio das páginas abaixo, e cada número do fabricante é uma
        promessa dele — não uma medição nossa. Fontes marcadas como independentes
        são as que mediram ou registraram por conta própria; as demais, incluindo
        as lojas, costumam reproduzir o que o fabricante publicou.
      </p>

      <ol className="mt-6 space-y-5">
        {itens.map((f) => (
          <li key={f.url} className="max-w-[62ch]">
            <a
              href={f.url}
              target="_blank"
              rel="noopener"
              className="font-medium underline decoration-linha underline-offset-4 hover:decoration-acao"
            >
              {f.titulo}
            </a>
            <p className="mt-1 text-[0.95rem] text-tinta-suave">
              {f.oQueSaiuDaqui}
            </p>
            <p className="mt-1 font-dado text-[0.8rem] text-tinta-suave">
              {rotuloTipoFonte[f.tipo]}
              {FONTES_INDEPENDENTES.includes(f.tipo) && " · independente"} ·
              consultada em {dataLegivel(f.consultadaEm)}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

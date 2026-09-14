import Link from "next/link";
import type { Campo, Produto } from "@/lib/specs";
import { transparencia, valorLegivel } from "@/lib/specs";
import { Silhueta } from "@/components/silhueta";

/**
 * O card de produto, usado na home e no buscador.
 *
 * A versão anterior mostrava marca, nome e uma porcentagem — informação de menos
 * para alguém decidindo, e vazio demais para um site que se propõe a comparar.
 * Agora carrega a silhueta em escala, os três números que separam um powerbank
 * de outro, e a transparência como barra, que se lê sem ler.
 *
 * A barra é deliberadamente neutra: alta ou baixa, ela informa sobre a
 * documentação do fabricante, não sobre a qualidade do produto. Pintar de verde
 * e vermelho seria dizer uma coisa que o dado não diz.
 */
export function CardProduto({
  produto,
  campos,
  destaques = ["capacidadeNominal", "potenciaMaxSaida", "pesoG"],
}: {
  produto: Produto;
  campos: Campo[];
  destaques?: string[];
}) {
  const t = transparencia(produto, campos);
  const linhas = destaques
    .map((chave) => campos.find((c) => c.chave === chave))
    .filter((c): c is Campo => Boolean(c));

  return (
    <article className="group relative flex h-full flex-col rounded-xl border border-linha p-5 transition-colors hover:border-acao">
      <p className="text-[0.78rem] uppercase tracking-wide text-tinta-suave">
        {produto.marca}
      </p>
      <h3 className="mt-1 font-titulo text-lg leading-snug">
        <Link
          href={`/produtos/${produto.slug}`}
          className="after:absolute after:inset-0 group-hover:text-acao-forte"
        >
          {produto.nome}
        </Link>
      </h3>

      <div className="mt-4">
        <Silhueta dimensoes={produto.specs.dimensoesMm as string} rotulo={false} />
      </div>

      <dl className="mt-4 grid gap-1.5 border-t border-linha pt-4 text-[0.85rem]">
        {linhas.map((campo) => {
          const valor = produto.specs[campo.chave];
          const ausente = valor === null || valor === undefined;
          return (
            <div key={campo.chave} className="flex justify-between gap-3">
              <dt className="text-tinta-suave">{campo.rotulo}</dt>
              <dd className={`dados ${ausente ? "text-ausente" : ""}`}>
                {valorLegivel(valor, campo)}
              </dd>
            </div>
          );
        })}
      </dl>

      <div className="mt-auto pt-5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="dados text-[0.85rem]">{t.nota}%</span>
          <span className="text-[0.72rem] text-tinta-suave">
            da ficha publicada
          </span>
        </div>
        <div
          className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-superficie"
          role="img"
          aria-label={`${t.preenchidos} de ${t.total} campos publicados pelo fabricante`}
        >
          <div
            className="h-full rounded-full bg-ausente"
            style={{ width: `${t.nota}%` }}
          />
        </div>
      </div>
    </article>
  );
}

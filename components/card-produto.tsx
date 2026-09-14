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
    <article className="cartao group relative flex h-full flex-col overflow-hidden">
      {/* A silhueta ganha superfície própria e vira a "foto" do card: é a
          primeira coisa que o olho encontra, como em qualquer site de produto. */}
      <div className="flex min-h-[9.5rem] items-center justify-center bg-superficie px-6 py-7">
        <Silhueta dimensoes={produto.specs.dimensoesMm as string} rotulo={false} />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <span className="pastilha self-start">{produto.marca}</span>
        <h3 className="mt-3 font-titulo text-lg leading-snug">
          <Link
            href={`/produtos/${produto.slug}`}
            className="after:absolute after:inset-0 group-hover:text-acao-forte"
          >
            {produto.nome}
          </Link>
        </h3>

        <dl className="mt-4 grid gap-2 text-[0.85rem]">
          {linhas.map((campo) => {
            const valor = produto.specs[campo.chave];
            const ausente = valor === null || valor === undefined;
            return (
              <div
                key={campo.chave}
                className="flex items-baseline justify-between gap-3 border-b border-linha pb-2 last:border-0 last:pb-0"
              >
                <dt className="text-tinta-suave">{campo.rotulo}</dt>
                <dd className={`dados ${ausente ? "text-ausente" : "font-medium"}`}>
                  {valorLegivel(valor, campo)}
                </dd>
              </div>
            );
          })}
        </dl>

        <div className="mt-auto pt-6">
          <div className="flex items-baseline justify-between gap-2">
            <span className="dados text-[0.95rem] font-medium">{t.nota}%</span>
            <span className="text-[0.72rem] text-tinta-suave">
              da ficha publicada
            </span>
          </div>
          <div
            className="mt-2 h-2 w-full overflow-hidden rounded-full bg-superficie"
            role="img"
            aria-label={`${t.preenchidos} de ${t.total} campos publicados pelo fabricante`}
          >
            <div
              className="h-full rounded-full bg-tinta-suave"
              style={{ width: `${t.nota}%` }}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

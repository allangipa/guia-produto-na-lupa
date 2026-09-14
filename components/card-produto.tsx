import Link from "next/link";
import type { Campo, Produto } from "@/lib/specs";
import { transparencia, valorLegivel } from "@/lib/specs";
import { MidiaProduto } from "@/components/midia-produto";

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
      <MidiaProduto produto={produto} />

      {/* Compacto de propósito: o card precisa caber cinco por linha. Nome,
          três números e a barra — nada de resumo em prosa, que é o que fazia a
          grade virar uma lista de artigos. */}
      <div className="flex flex-1 flex-col p-3">
        <span className="text-[0.68rem] font-semibold uppercase tracking-[0.06em] text-acao-forte">
          {produto.marca}
        </span>
        <h3 className="mt-1 titulo-ui text-[0.92rem] leading-snug">
          <Link
            href={`/produtos/${produto.slug}`}
            className="after:absolute after:inset-0 group-hover:text-acao-forte"
          >
            {produto.nome}
          </Link>
        </h3>

        <dl className="mt-2.5 grid gap-1 text-[0.78rem]">
          {linhas.map((campo) => {
            const valor = produto.specs[campo.chave];
            const ausente = valor === null || valor === undefined;
            return (
              <div
                key={campo.chave}
                className="flex items-baseline justify-between gap-2"
              >
                <dt className="truncate text-tinta-suave">{campo.rotulo}</dt>
                <dd
                  className={`dados shrink-0 ${ausente ? "text-ausente" : "font-medium"}`}
                >
                  {valorLegivel(valor, campo)}
                </dd>
              </div>
            );
          })}
        </dl>

        <div className="mt-auto pt-3">
          <div className="flex items-baseline justify-between gap-2">
            <span className="dados text-[0.78rem] font-semibold">{t.nota}%</span>
            <span className="text-[0.65rem] text-tinta-suave">da ficha</span>
          </div>
          <div
            className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-superficie"
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

import Link from "next/link";
import type { Campo, Produto } from "@/lib/specs";
import {
  transparencia,
  valorLegivel,
  iconeDo,
  destaquesDa,
  faixaTransparencia,
  rotuloCurto,
  aindaNaoSaiu,
} from "@/lib/specs";
import { MidiaProduto } from "@/components/midia-produto";
import { Icone } from "@/components/icones";
import { PrecoAmazon } from "@/components/preco-amazon";

/**
 * O card de produto — home, buscador, prateleiras.
 *
 * Lê como card de loja: mídia em cima sobre fundo claro, marca pequena, nome em
 * duas linhas, três números com ícone, e o badge de transparência no canto da
 * mídia. O badge é colorido por faixa porque é dado sobre a documentação do
 * fabricante — e o rótulo diz "ficha", nunca "produto".
 */
export function CardProduto({
  produto,
  campos,
  destaques,
  tamanhos,
}: {
  produto: Produto;
  campos: Campo[];
  destaques?: string[];
  /** A largura em que este card aparece. Medida, nao estimada — ver Foto. */
  tamanhos?: string;
}) {
  const t = transparencia(produto, campos);
  const faixa = faixaTransparencia(t.nota);
  // Produto anunciado e ainda não lançado: o card avisa antes do clique, para
  // ninguém abrir a ficha achando que é só escolher a cor.
  const porVir = aindaNaoSaiu(produto) ? produto.nasLojasEm!.split("-") : null;
  const chaves = destaques ?? destaquesDa(produto.categoria);
  const linhas = chaves
    .map((chave) => campos.find((c) => c.chave === chave))
    .filter((c): c is Campo => Boolean(c));

  return (
    <article className="cartao group relative flex h-full flex-col overflow-hidden">
      <div className="relative">
        <MidiaProduto produto={produto} tamanhos={tamanhos} />
        <span
          className={`${faixa.classe} absolute left-2.5 top-2.5 rounded-full px-2 py-0.5 text-[0.68rem] font-semibold`}
          title={`${t.preenchidos} de ${t.total} campos publicados pelo fabricante`}
        >
          <span className="dados">{t.nota}%</span> da ficha
        </span>
        {porVir && (
          <span className="absolute right-2.5 top-2.5 rounded-full bg-tinta px-2 py-0.5 text-[0.68rem] font-semibold text-papel">
            Nas lojas em <span className="dados">{porVir[2]}/{porVir[1]}</span>
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <span className="text-[0.68rem] font-semibold uppercase tracking-[0.07em] text-tinta-suave">
          {produto.marca}
        </span>
        <h3 className="mt-1 line-clamp-2 titulo-ui text-[0.95rem] leading-snug">
          <Link
            href={`/produtos/${produto.slug}`}
            className="after:absolute after:inset-0 group-hover:text-acao-forte"
          >
            {produto.nome}
          </Link>
        </h3>

        <ul className="mt-3 grid gap-1.5 text-[0.8rem]">
          {linhas.map((campo) => {
            const valor = produto.specs[campo.chave];
            const ausente = valor === null || valor === undefined;
            return (
              <li
                key={campo.chave}
                className="flex items-center gap-2"
                title={campo.rotulo}
              >
                <Icone
                  nome={iconeDo(campo.chave)}
                  className={`h-3.5 w-3.5 shrink-0 ${ausente ? "text-ausente" : "text-acao"}`}
                />
                <span className="truncate text-tinta-suave">{rotuloCurto(campo)}</span>
                <span
                  className={`dados ml-auto shrink-0 ${ausente ? "text-ausente" : "font-semibold"}`}
                >
                  {valorLegivel(valor, campo)}
                </span>
              </li>
            );
          })}
        </ul>

        <PrecoAmazon dados={produto.amazon} compacto />

        <div className="mt-auto flex items-center justify-between gap-2 pt-3.5 text-[0.75rem]">
          <span className="text-tinta-suave">{faixa.rotulo}</span>
          <span className="inline-flex items-center gap-1 font-medium text-acao-forte">
            Ver ficha <Icone nome="seta" className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </article>
  );
}

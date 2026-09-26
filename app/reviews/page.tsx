import Link from "next/link";
import type { Metadata } from "next";
import {
  todosOsReviews,
  dataLegivel,
  fotoDaBase,
  notaLegivel,
} from "@/lib/conteudo";
import { Foto } from "@/components/foto";

export const metadata: Metadata = {
  title: "Análises",
  description: "Todas as análises de tecnologia e acessórios publicadas.",
  alternates: { canonical: "/reviews" },
};

/**
 * A listagem de análises, em cartões.
 *
 * Duas coisas mudaram em 26/09/2026. A primeira é a foto, que não existia aqui
 * nem nas próprias análises, embora a ficha do mesmo produto tivesse uma.
 *
 * A segunda é a nota. Ela vinha como texto mono miúdo ao lado da data — o
 * número mais trabalhoso do site, derivado de cinco critérios ponderados, com
 * o peso visual de um rodapé. Agora é o primeiro elemento do cartão.
 *
 * A nota não leva cor. A primeira versão pintava de `atencao` tudo entre 5 e 7,
 * e como quase toda nota do site cai nessa faixa a página virou uma parede de
 * âmbar — além de usar errado o token: `atencao` é de contra e de divergência
 * entre fontes, e uma nota é medição, não alerta. Tamanho e peso bastam para
 * ela ser o primeiro elemento que o olho pega.
 */

export default function ListaReviews() {
  const reviews = todosOsReviews();
  return (
    <div className="mx-auto max-w-[var(--largura-ferramenta)] px-5 py-12">
      <h1 className="font-titulo text-3xl tracking-tight">Análises</h1>
      <p className="mt-2 max-w-[62ch] text-tinta-suave">
        Nota de 0 a 10 por critério ponderado, a partir do que a documentação
        oficial permite julgar.{" "}
        <Link
          href="/metodologia"
          className="underline decoration-linha underline-offset-4 hover:decoration-acao"
        >
          Como avaliamos
        </Link>
        .
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((r) => {
          const foto =
            r.produto.imagem ?? fotoDaBase([r.produto.lojas], [r.produto.nome]);
          return (
            <li key={r.slug} className="cartao group relative flex flex-col">
              {foto && (
                <div className="flex aspect-[4/3] items-center justify-center border-b border-linha bg-superficie p-4">
                  <Foto
                    src={foto.src}
                    alt={foto.alt}
                    tamanhos="(max-width: 640px) 88vw, 300px"
                    className="max-h-full w-auto object-contain"
                  />
                </div>
              )}

              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-baseline gap-2">
                  <span className="dados text-2xl font-semibold leading-none">
                    {notaLegivel(r.nota)}
                  </span>
                  <span className="text-[0.72rem] text-tinta-suave">de 10</span>
                  <span className="ml-auto font-dado text-[0.72rem] text-tinta-suave">
                    {dataLegivel(r.atualizadoEm)}
                  </span>
                </div>

                <h2 className="mt-2.5 titulo-ui text-[1.02rem] leading-snug">
                  <Link
                    href={`/reviews/${r.slug}`}
                    className="after:absolute after:inset-0 group-hover:text-acao-forte"
                  >
                    {r.titulo}
                  </Link>
                </h2>
                <p className="mt-2 line-clamp-3 text-[0.9rem] leading-snug text-tinta-suave">
                  {r.subtitulo}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

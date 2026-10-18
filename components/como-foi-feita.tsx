import Link from "next/link";
import { dataLegivel } from "@/lib/conteudo";
import type { Fonte } from "@/lib/conteudo";

/**
 * "Como esta lista foi feita", no topo do guia, desde 17/10/2026.
 *
 * TechTudo e Panelas e Cozinha põem um bloco de critérios antes dos produtos
 * (ver docs/concorrentes-2026-10-17.md). O nosso método estava a um clique, em
 * /metodologia, e a maioria não clica. Esta caixa diz em quatro linhas o que
 * sustenta a lista — e tudo sai do frontmatter do próprio guia, nada é
 * digitado: as fontes do tipo fabricante contam as fichas lidas e dão as datas;
 * a fonte de varejo cujo título ou URL fala em ranking ou mais vendidos dá a
 * origem da seleção. Guia sem ranking nas fontes escreve "seleção entre as N
 * fichas da categoria", porque "mais vendido" só aparece onde o ranking está
 * escrito com data e fonte (regra da casa).
 */
export function ComoFoiFeita({
  fontes,
  escolhas,
  fichasNaBase,
  categoriaNome,
}: {
  fontes: Fonte[];
  escolhas: number;
  fichasNaBase: number;
  categoriaNome?: string;
}) {
  const fabricantes = fontes.filter((f) => f.tipo === "fabricante");
  const ranking = fontes.find(
    (f) => f.tipo === "varejo" && /mais vendid|ranking|bestsellers/i.test(`${f.titulo} ${f.url}`),
  );
  const datas = fontes
    .map((f) => f.consultadaEm)
    .filter((d): d is string => Boolean(d))
    .sort();
  const de = datas[0];
  const ate = datas[datas.length - 1];
  const quando = !de ? null : de === ate ? `em ${dataLegivel(de)}` : `entre ${dataLegivel(de)} e ${dataLegivel(ate)}`;

  return (
    <aside aria-label="Como esta lista foi feita" className="painel mt-6 p-4 sm:p-5">
      <p className="titulo-ui text-[0.95rem]">Como esta lista foi feita</p>
      <ul className="mt-2 grid gap-x-6 gap-y-1 text-[0.88rem] leading-snug text-tinta-suave sm:grid-cols-2">
        <li>
          <strong className="font-semibold text-tinta">
            {fabricantes.length} {fabricantes.length === 1 ? "ficha oficial lida" : "fichas oficiais lidas"}
          </strong>
          {quando ? `, ${quando}` : ""} — página do fabricante, manual ou termos de garantia.
        </li>
        <li>
          {ranking ? (
            <>
              <strong className="font-semibold text-tinta">Seleção:</strong>{" "}
              <a href={ranking.url} rel="noopener nofollow" className="underline underline-offset-4">
                {ranking.titulo}
              </a>
              {ranking.consultadaEm ? `, consultado em ${dataLegivel(ranking.consultadaEm)}` : ""}.
            </>
          ) : (
            <>
              <strong className="font-semibold text-tinta">Seleção:</strong> entre as {fichasNaBase} fichas
              {categoriaNome ? ` de ${categoriaNome.toLowerCase()}` : ""} desta base.
            </>
          )}
        </li>
        <li>
          <strong className="font-semibold text-tinta">
            {escolhas} {escolhas === 1 ? "escolha" : "escolhas"}, uma por perfil
          </strong>{" "}
          — com o motivo escrito ao lado de cada uma.
        </li>
        <li>
          <strong className="font-semibold text-tinta">Nenhum produto testado.</strong> A comparação é
          ficha contra ficha, e a lacuna fica escrita.{" "}
          <Link href="/metodologia" className="underline underline-offset-4">
            Como avaliamos
          </Link>
        </li>
      </ul>
    </aside>
  );
}

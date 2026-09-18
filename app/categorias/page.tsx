import type { Metadata } from "next";
import Link from "next/link";
import { categoria as buscar } from "@/lib/categorias";
import { navegacao } from "@/lib/navegacao";
import { Icone } from "@/components/icones";

export const metadata: Metadata = {
  title: "Todas as categorias",
  description:
    "O catálogo inteiro por departamento, com quantas fichas cada categoria tem e a pergunta que guia cada uma.",
  alternates: { canonical: "/categorias" },
};

/**
 * O mapa do catálogo em página inteira — o mesmo conteúdo do painel do topo.
 *
 * Existe por dois motivos: é o destino de quem está sem JavaScript e clica no
 * botão de departamentos, e é a página que responde "o que tem aqui?" sem
 * obrigar o leitor a abrir um menu e decorar o que viu.
 *
 * A hierarquia é desenhada, não só indentada. A primeira versão listava
 * departamento e categoria com o mesmo peso, um debaixo do outro, e não dava
 * para saber qual era qual. Agora departamento é um título com régua em toda a
 * largura e categoria é um disco com foto — a mesma peça que a home usa para
 * departamento, aqui um nível abaixo. Quem já viu a home reconhece a forma.
 */
export default function PaginaCategorias() {
  const grupos = navegacao();
  const total = grupos.reduce((n, g) => n + g.total, 0);

  return (
    <div className="mx-auto max-w-[var(--largura-ferramenta)] px-5 py-12">
      <h1 className="titulo-ui text-3xl tracking-tight">Todas as categorias</h1>
      <p className="mt-3 max-w-[62ch] text-lg text-tinta-suave">
        {total} fichas em {grupos.length} departamentos. O número embaixo de
        cada categoria é quantos produtos ela tem hoje — e a categoria que parou
        abaixo do que a gente queria diz na própria página por que parou.
      </p>

      {grupos.map((g) => (
        <section key={g.slug} id={g.slug} className="mt-14 scroll-mt-32">
          <div className="border-b border-linha pb-3">
            <h2 className="titulo-ui text-2xl tracking-tight">{g.nome}</h2>
            <p className="mt-1 max-w-[62ch] text-[0.95rem] text-tinta-suave">
              {g.descricao} · {g.total} fichas em{" "}
              {g.itens.length === 1 ? "1 categoria" : `${g.itens.length} categorias`}
            </p>
          </div>

          <ul className="mt-7 grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-5">
            {g.itens.map((i) => {
              const c = buscar(i.slug);
              return (
                <li key={i.slug}>
                  <Link
                    href={`/categorias/${i.slug}`}
                    className="group flex flex-col items-center gap-3 text-center"
                  >
                    <span className="cartao flex h-[7.5rem] w-[7.5rem] items-center justify-center overflow-hidden !rounded-full bg-superficie p-4 group-hover:!border-acao">
                      {i.capa ? (
                        <img src={i.capa} alt="" className="h-full w-full object-contain" />
                      ) : (
                        <Icone nome={i.slug} className="h-10 w-10 text-acao" />
                      )}
                    </span>
                    <span>
                      <span className="block titulo-ui text-[1.02rem] leading-tight group-hover:text-acao-forte">
                        {i.nome}
                      </span>
                      <span className="dados mt-1 block text-[0.75rem] text-tinta-suave">
                        {i.total} {i.total === 1 ? "ficha" : "fichas"}
                      </span>
                      {c && (
                        <span className="mt-2 block text-[0.82rem] leading-snug text-tinta-suave">
                          {c.dorPrincipal}
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

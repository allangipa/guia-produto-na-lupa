import type { Metadata } from "next";
import Link from "next/link";
import { categoria as buscar } from "@/lib/categorias";
import { navegacao } from "@/lib/navegacao";

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
 */
export default function PaginaCategorias() {
  const grupos = navegacao();
  const total = grupos.reduce((n, g) => n + g.total, 0);

  return (
    <div className="mx-auto max-w-[var(--largura-ferramenta)] px-5 py-12">
      <h1 className="titulo-ui text-3xl tracking-tight">Todas as categorias</h1>
      <p className="mt-3 max-w-[62ch] text-lg text-tinta-suave">
        {total} fichas em {grupos.length} departamentos. O número ao lado de
        cada categoria é quantos produtos ela tem hoje — e a categoria que parou
        abaixo do que a gente queria diz na própria página por que parou.
      </p>

      <div className="mt-10 grid gap-x-10 gap-y-12 lg:grid-cols-2">
        {grupos.map((g) => (
          <section key={g.slug} id={g.slug} className="scroll-mt-32">
            <h2 className="titulo-ui text-xl">{g.nome}</h2>
            <p className="mt-1.5 max-w-[52ch] text-[0.95rem] text-tinta-suave">
              {g.descricao}
            </p>
            <ul className="mt-4 divide-y divide-linha border-t border-linha">
              {g.itens.map((i) => {
                const c = buscar(i.slug);
                return (
                  <li key={i.slug}>
                    <Link
                      href={`/categorias/${i.slug}`}
                      className="group flex items-baseline justify-between gap-4 py-4"
                    >
                      <span className="min-w-0">
                        <span className="block titulo-ui text-[1.05rem] leading-snug group-hover:text-acao-forte">
                          {i.nome}
                        </span>
                        {c && (
                          <span className="mt-1 block max-w-[46ch] text-[0.9rem] text-tinta-suave">
                            {c.dorPrincipal}
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 tabular-nums text-[0.85rem] text-tinta-suave">
                        {i.total} {i.total === 1 ? "ficha" : "fichas"}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

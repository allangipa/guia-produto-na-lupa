import type { MDXComponents } from "mdx/types";
import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import type { ComponentProps } from "react";
import { TabelaComparativa } from "./tabela-comparativa";

/**
 * Link interno do texto passa pelo `next/link`, que põe a barra final
 * (`trailingSlash: true`). Escrito em markdown, `[guia](/guias/x)` saía como
 * `<a href="/guias/x">`, e o GitHub Pages responde com 301 para `/guias/x/`:
 * um redirecionamento a cada link, contado no relatório de indexação do
 * Search Console (07/10/2026). Link externo e âncora passam como estão.
 */
function LinkDoTexto({ href = "", ...resto }: ComponentProps<"a">) {
  if (href.startsWith("/") && !href.startsWith("//")) return <Link href={href} {...resto} />;
  return <a href={href} {...resto} />;
}

/** Componentes disponíveis dentro dos arquivos .mdx de conteúdo. */
export const componentesMdx: MDXComponents = {
  TabelaComparativa: TabelaComparativa as never,
  a: LinkDoTexto,
};

/**
 * Opções de compilação do MDX, iguais para guia, comparativo e review.
 *
 * O `remark-gfm` entrou em 25/09/2026 por um motivo concreto: **as tabelas em
 * markdown nunca renderizaram neste site**. Markdown padrão não tem tabela — ela
 * é extensão do GitHub —, então `| marca | publicam |` e a linha de separação
 * `|---|---|` saíam como texto corrido, com os pipes à vista, em 15 páginas já
 * publicadas. Era exatamente o tipo de detalhe que faz um site parecer amador.
 *
 * Como as três páginas compilam MDX separadamente, as opções moram aqui: plugin
 * novo se liga num lugar só, e não em três que podem divergir.
 *
 * O estilo das tabelas fica no `.prosa table` do globals.css, e imita a
 * `TabelaComparativa` — mesma borda, mesmo cabeçalho, mesma listra par.
 */
export const opcoesMdx: NonNullable<MDXRemoteProps["options"]> = {
  mdxOptions: { remarkPlugins: [remarkGfm] },
};

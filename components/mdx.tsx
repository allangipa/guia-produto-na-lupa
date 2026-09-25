import type { MDXComponents } from "mdx/types";
import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { TabelaComparativa } from "./tabela-comparativa";

/** Componentes disponíveis dentro dos arquivos .mdx de conteúdo. */
export const componentesMdx: MDXComponents = {
  TabelaComparativa: TabelaComparativa as never,
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

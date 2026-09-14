import type { MDXComponents } from "mdx/types";
import { TabelaComparativa } from "./tabela-comparativa";

/** Componentes disponíveis dentro dos arquivos .mdx de conteúdo. */
export const componentesMdx: MDXComponents = {
  TabelaComparativa: TabelaComparativa as never,
};

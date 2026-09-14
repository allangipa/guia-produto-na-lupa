import fs from "node:fs";
import path from "node:path";
import type { Produto } from "./specs";
import { asinDe, dadosAmazon } from "./amazon";

/**
 * Leitura da base de produtos. Só de servidor: usa `node:fs`, então nada que
 * rode no navegador pode importar daqui — os componentes de filtro e comparação
 * importam de `lib/specs.ts`, que é puro.
 */

export * from "./specs";

const RAIZ = path.join(process.cwd(), "dados");

export function produtosDaCategoria(categoria: string): Produto[] {
  const arquivo = path.join(RAIZ, `${categoria}.json`);
  if (!fs.existsSync(arquivo)) return [];
  const bruto = JSON.parse(fs.readFileSync(arquivo, "utf8")) as Produto[];
  // Os dados da Amazon entram aqui, uma vez, para que card, ficha e
  // comparador leiam `produto.amazon` sem tocar em disco — inclusive os
  // componentes que rodam no navegador.
  return bruto.map((p) => {
    const amazon = dadosAmazon(asinDe(p.lojas?.amazon));
    return { ...p, categoria, ...(amazon ? { amazon } : {}) };
  });
}

export function todosOsProdutos(): Produto[] {
  if (!fs.existsSync(RAIZ)) return [];
  return fs
    .readdirSync(RAIZ)
    .filter((f) => f.endsWith(".json"))
    .flatMap((f) => produtosDaCategoria(f.replace(/\.json$/, "")));
}

export function produto(slug: string): Produto | undefined {
  return todosOsProdutos().find((p) => p.slug === slug);
}

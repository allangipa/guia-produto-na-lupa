import fs from "node:fs";
import path from "node:path";
import type { Produto } from "./specs";
import { asinDe, dadosAmazon } from "./amazon";
import { verificarVariantes } from "./variantes-conferir";

/**
 * Leitura da base de produtos. Só de servidor: usa `node:fs`, então nada que
 * rode no navegador pode importar daqui — os componentes de filtro e comparação
 * importam de `lib/specs.ts`, que é puro.
 */

export * from "./specs";

const RAIZ = path.join(process.cwd(), "dados");

/**
 * `resumo` e texto puro, e a pagina o imprime como texto.
 *
 * Os scripts que montam a base escrevem `**assim**` no `oQueSaiuDaqui`, e o
 * habito vazou para o `resumo`. Vinte fichas ficaram exibindo os asteriscos na
 * tela e, pior, mandando-os para a `description` da pagina: o texto que
 * aparece no resultado do Google.
 *
 * O `oQueSaiuDaqui` hoje passa por `negrito()` e so aparece na pagina, nunca
 * em metadado — por isso la a marcacao e permitida, e aqui e proibida.
 *
 * Nao aparece errado para quem escreve o script; so na pagina pronta. Por isso
 * quebra o build, como os outros `verificar()` do projeto.
 */
function verificarResumos(produtos: Produto[]) {
  const comMarcacao = produtos
    .filter((p) => /\*\*|__|\[.+?\]\(.+?\)/.test(p.resumo ?? ""))
    .map((p) => p.slug);
  if (comMarcacao.length) {
    throw new Error(
      `Marcacao de markdown no \`resumo\` de: ${comMarcacao.join(", ")}. ` +
        `O resumo e impresso como texto puro e vai inteiro para a meta description — ` +
        `os asteriscos apareceriam na pagina e no resultado de busca. Escreva sem marcacao.`,
    );
  }
}

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
  const todos = fs
    .readdirSync(RAIZ)
    .filter((f) => f.endsWith(".json"))
    .flatMap((f) => produtosDaCategoria(f.replace(/\.json$/, "")));
  verificarResumos(todos);
  verificarVariantes(
    todos.map((p) => p.imagem?.src).filter((s): s is string => Boolean(s)),
  );
  return todos;
}

export function produto(slug: string): Produto | undefined {
  return todosOsProdutos().find((p) => p.slug === slug);
}

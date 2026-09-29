import { lojasDe } from "./site";
import { todosOsProdutos, type Produto } from "./produtos";
import { SLUGS as SLUGS_CAMERAS } from "./simulador-cameras";
import type { Foco } from "./simulador";

/**
 * O que cada página do simulador manda para o navegador. Só roda no build.
 *
 * Cada ferramenta leva só as categorias que o motor dela lê — a página de
 * air fryer não carrega os 87 produtos de casa conectada. A regra de sempre:
 * o que o motor pode indicar precisa existir e ter loja, senão o build para.
 */
export const CATEGORIAS_DO_FOCO: Record<Foco, string[]> = {
  seguranca: ["cftv", "nobreaks"],
  wifi: ["conectividade"],
  automacao: ["casa-conectada"],
  ar: ["ar-condicionado"],
  nobreak: ["nobreaks"],
  airfryer: ["cozinha"],
  purificador: ["purificadores"],
  cooktop: ["cooktops"],
};

/**
 * O motor roda no navegador e só lê ficha, loja e foto. Fontes, divergências e
 * resumo ficam na página do produto — mandá-los junto multiplicaria o peso da
 * página por nada.
 */
function leve(p: Produto): Produto {
  const { slug, nome, marca, modelo, categoria, specs, lojas, imagem, naoSeAplica, atualizadoEm } = p;
  return { slug, nome, marca, modelo, categoria, specs, lojas, imagem, naoSeAplica, atualizadoEm, resumo: "", fontes: [] };
}

export function baseDoFoco(foco: Foco): Record<string, Produto> {
  const todos = todosOsProdutos();
  const porSlug = new Map(todos.map((p) => [p.slug, p]));
  const categorias = CATEGORIAS_DO_FOCO[foco];
  const daCategoria = todos.filter((p) => categorias.includes(p.categoria ?? "") && lojasDe(p.lojas).length);

  // Câmeras indicam também peças fixas de outras categorias (a Tapo, o
  // repetidor, o monitor); essas não podem sumir da base sem o build avisar.
  const fixos: Produto[] = [];
  if (foco === "seguranca") {
    const faltando: string[] = [];
    for (const slug of Object.values(SLUGS_CAMERAS)) {
      const p = porSlug.get(slug);
      if (!p || !lojasDe(p.lojas).length) faltando.push(slug);
      else fixos.push(p);
    }
    if (faltando.length) {
      throw new Error(
        `Simulador de câmeras indica produto fora da base ou sem loja: ${faltando.join(", ")}. ` +
          `Troque em SLUGS, em lib/simulador-cameras.ts.`,
      );
    }
  }
  return Object.fromEntries([...fixos, ...daCategoria].map((p) => [p.slug, leve(p)]));
}

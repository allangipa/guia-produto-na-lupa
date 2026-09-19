import { categorias } from "@/lib/categorias";

/**
 * Camada acima da categoria, no padrão das lojas grandes.
 *
 * A barra do topo nasceu com uma pílula por categoria. Com sete funcionava;
 * com doze já rolava de lado, e o plano é passar de trinta — a tira só cresce
 * e o leitor perde a noção do que existe. Departamento resolve porque o número
 * de departamentos não acompanha o de categorias: entram categorias novas
 * dentro dos mesmos cinco, e o topo continua do mesmo tamanho.
 *
 * Regra: toda categoria pertence a **exatamente um** departamento. Não há
 * categoria órfã nem categoria em dois lugares — quem chega por um caminho
 * chega pelo mesmo caminho sempre. O `verificar()` no fim do arquivo cobra
 * isso na hora do build, para ninguém abrir categoria e esquecer de encaixar.
 */
export type Departamento = {
  slug: string;
  nome: string;
  /** Uma linha, para a página de índice e o menu. Não é promessa do que virá. */
  descricao: string;
  /** Slugs de categoria, na ordem em que aparecem. */
  categorias: string[];
};

export const departamentos: Departamento[] = [
  {
    slug: "computador",
    nome: "Computador e escritório",
    descricao: "O que fica na mesa: tela, teclado, mouse e onde o arquivo mora.",
    categorias: ["monitores", "perifericos", "armazenamento"],
  },
  {
    slug: "celular-e-tablet",
    nome: "Celular e tablet",
    descricao: "Aparelho, tela grande e o que mantém os dois carregados.",
    categorias: ["celular", "tablets", "smartwatches", "energia"],
  },
  {
    slug: "audio",
    nome: "Áudio",
    descricao: "Fones, caixas de som e microfones.",
    categorias: ["audio"],
  },
  {
    slug: "casa-e-redes",
    nome: "Casa conectada e redes",
    descricao: "O Wi-Fi da casa e os aparelhos que dependem dele para funcionar.",
    categorias: ["conectividade", "casa-conectada"],
  },
  {
    slug: "cozinha",
    nome: "Cozinha",
    descricao: "Eletroportátil de bancada, com a medida do anúncio convertida.",
    categorias: ["cozinha", "sanduicheiras", "cafeteiras", "liquidificadores",
      "torradeiras", "chaleiras", "espremedores"],
  },
  {
    slug: "eletrodomesticos",
    nome: "Eletrodomésticos",
    descricao:
      "O aparelho grande da casa e o que cuida dela: refrigeração, lavagem, climatização e limpeza. A ficha dele importa mais, e costuma ser mais curta.",
    categorias: ["geladeiras", "lavadoras", "lavaloucas", "microondas", "ventiladores",
      "ferros", "aspiradores"],
  },
];

/** O departamento de uma categoria, ou `undefined` se ela ficou órfã. */
export function departamentoDe(slugCategoria: string): Departamento | undefined {
  return departamentos.find((d) => d.categorias.includes(slugCategoria));
}

export function departamento(slug: string): Departamento | undefined {
  return departamentos.find((d) => d.slug === slug);
}

/**
 * Quebra o build quando a taxonomia sai do lugar. É de propósito: categoria
 * fora de departamento some da navegação inteira e ninguém percebe olhando a
 * tela — some silenciosamente, que é o pior jeito de quebrar.
 */
function verificar() {
  const conhecidas = new Set(categorias.map((c) => c.slug));
  const vistas = new Map<string, string>();
  for (const d of departamentos) {
    for (const s of d.categorias) {
      if (!conhecidas.has(s)) {
        throw new Error(
          `Departamento "${d.slug}" aponta para a categoria "${s}", que não existe em lib/categorias.ts.`,
        );
      }
      const antes = vistas.get(s);
      if (antes) {
        throw new Error(
          `A categoria "${s}" está em dois departamentos: "${antes}" e "${d.slug}". Cada uma pertence a um só.`,
        );
      }
      vistas.set(s, d.slug);
    }
  }
  const orfas = categorias.filter((c) => !vistas.has(c.slug)).map((c) => c.slug);
  if (orfas.length) {
    throw new Error(
      `Categoria sem departamento: ${orfas.join(", ")}. Encaixe em lib/departamentos.ts — sem isso ela não aparece na navegação.`,
    );
  }
}

verificar();

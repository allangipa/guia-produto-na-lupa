/**
 * O item de uma lista de compras do /simulador, comum a todas as frentes.
 * Cada frente tem o seu motor (simulador-cameras.ts, simulador-wifi.ts) e as
 * suas seções; o formato do item é um só, para uma tela só desenhar todos.
 */
export type Item = {
  id: string;
  /** Seção da lista em que o item aparece — cada frente declara as suas. */
  grupo: string;
  papel: string;
  qtd: number;
  unidade?: string;
  /** Produto da base. Sem ele, o item sai com `especificacao`. */
  produto?: string;
  /** O que comprar, quando o site ainda não tem ficha da peça. */
  especificacao?: string;
  porque: string;
  /** Regra nossa usada no cálculo — sempre à vista. */
  regra?: string;
  /** O que a documentação não responde e importa para este projeto. */
  confira?: string[];
  /** A segunda colocada, e o que a tirou. */
  alternativa?: { produto: string; motivo: string };
};

/** Arredonda para cima até o primeiro valor da lista que cabe. */
export const menorQueCabe = (lista: number[], minimo: number) =>
  lista.find((x) => x >= minimo) ?? lista.at(-1)!;

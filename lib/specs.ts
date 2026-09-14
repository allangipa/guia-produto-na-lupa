/**
 * Tipos e regras de comparacao dos produtos.
 *
 * Este modulo e deliberadamente puro: nao toca em disco, porque o buscador e o
 * comparador rodam no navegador e importam daqui. Toda leitura de arquivo mora
 * em lib/produtos.ts, que e so de servidor.
 */

import type { Loja, Fonte, Imagem } from "./conteudo";

/**
 * Duas fontes dizendo números diferentes para o mesmo campo.
 *
 * Não é um problema a esconder: é a informação mais valiosa que este site pode
 * publicar. Quando a homologação registra um valor e o marketing estampa outro,
 * a divergência diz mais sobre o produto do que qualquer um dos dois números
 * sozinho. O site adota um valor, mostra o outro, e diz de quem é cada um.
 */
export type Divergencia = {
  /** `chave` do campo em questão. */
  campo: string;
  /** O valor que o site publica na ficha, e o `id` da fonte que o sustenta. */
  fonteAdotada: string;
  valorDivergente: string;
  fonteDivergente: string;
  observacao?: string;
};

/**
 * O que compradores relatam de forma repetida.
 *
 * Nada aqui é copiado: as avaliações das lojas são lidas como matéria-prima de
 * pesquisa e o que sai é síntese escrita com nossas palavras — republicar texto
 * ou nota de terceiro violaria os termos das lojas, o direito autoral de quem
 * escreveu e, no caso de `aggregateRating`, as diretrizes do Google.
 *
 * `mencoes` e `totalLidas` existem para o leitor calibrar: "7 de 200" é padrão,
 * "2 de 200" é ruído. Um relato sem essa conta é opinião disfarçada de dado.
 */
export type Relato = {
  padrao: string;
  mencoes: number;
  totalLidas: number;
  tom: "problema" | "elogio";
  /** Onde as avaliações foram lidas, ex.: ["Amazon", "Mercado Livre"]. */
  lojas: string[];
  lidasEm: string;
};

/**
 * A camada de dados do site.
 *
 * Um produto aqui não é um artigo: é um registro comparável. É o que permite
 * filtrar, ordenar e cruzar — as ferramentas que os artigos nunca dão.
 *
 * `null` num campo não é "vazio": significa **o fabricante não informa**, e é
 * uma informação tão publicável quanto o número que ele informa. Toda a nota de
 * transparência sai daí.
 */
export type ValorSpec = string | number | boolean | null;

export type Produto = {
  slug: string;
  nome: string;
  marca: string;
  modelo: string;
  categoria: string;
  resumo: string;
  specs: Record<string, ValorSpec>;
  lojas: Loja;
  imagem?: Imagem;
  fontes: Fonte[];
  /**
   * Campos confirmados por fonte independente: chave do campo → `id` das fontes.
   * Confirmação de varejo não entra, porque varejo copia o fabricante.
   */
  confirmadoPor?: Record<string, string[]>;
  divergencias?: Divergencia[];
  relatos?: Relato[];
  atualizadoEm: string;
};

/**
 * A definição de um campo comparável. É isto que ensina o site a ordenar
 * ("maior mAh primeiro"), a destacar o vencedor de cada linha do comparador e a
 * montar os filtros sem que ninguém escreva UI específica por categoria.
 */
export type Campo = {
  chave: string;
  rotulo: string;
  grupo: string;
  tipo: "numero" | "texto" | "booleano";
  unidade?: string;
  /** Para ordenar e para apontar o vencedor da linha. Ausente = não se compara. */
  melhor?: "maior" | "menor";
  /** Como este campo aparece no buscador. */
  filtro?: "faixa" | "opcoes" | "booleano";
  /** Explicação curta: por que este número importa na hora de decidir. */
  ajuda?: string;
  /**
   * Campos marcados entram na nota de transparência. Só entram os que um
   * fabricante razoavelmente deveria publicar — não faz sentido punir quem não
   * informa algo que ninguém informa.
   */
  contaTransparencia?: boolean;
};

export const camposEnergia: Campo[] = [
  {
    chave: "capacidadeNominal",
    rotulo: "Capacidade nominal",
    grupo: "Capacidade",
    tipo: "numero",
    unidade: "mAh",
    melhor: "maior",
    filtro: "faixa",
    ajuda:
      "O número grande da caixa. É a capacidade da célula interna, não o que chega no seu celular.",
    contaTransparencia: true,
  },
  {
    chave: "capacidadeReal",
    rotulo: "Capacidade real",
    grupo: "Capacidade",
    tipo: "numero",
    unidade: "mAh",
    melhor: "maior",
    filtro: "faixa",
    ajuda:
      "O que de fato sai pela porta, depois da perda de conversão. Costuma ser 60% a 65% da nominal — e é o número que decide quantas cargas você consegue.",
    contaTransparencia: true,
  },
  {
    chave: "energiaWh",
    rotulo: "Energia",
    grupo: "Capacidade",
    tipo: "numero",
    unidade: "Wh",
    melhor: "maior",
    ajuda:
      "A unidade que companhia aérea usa. Acima de 100 Wh, o embarque costuma ser proibido sem autorização.",
    contaTransparencia: true,
  },
  {
    chave: "quimica",
    rotulo: "Tipo de célula",
    grupo: "Capacidade",
    tipo: "texto",
    contaTransparencia: true,
  },
  {
    chave: "potenciaMaxSaida",
    rotulo: "Potência máxima de saída",
    grupo: "Potência",
    tipo: "numero",
    unidade: "W",
    melhor: "maior",
    filtro: "faixa",
    ajuda:
      "O teto de velocidade de carga. Quase sempre só vale com uma porta ocupada por vez.",
    contaTransparencia: true,
  },
  {
    chave: "potenciaMaxEntrada",
    rotulo: "Potência máxima de entrada",
    grupo: "Potência",
    tipo: "numero",
    unidade: "W",
    melhor: "maior",
    ajuda:
      "Quanto ele aceita para se recarregar. Entrada fraca é o que faz uma bateria grande levar a noite inteira.",
    contaTransparencia: true,
  },
  {
    chave: "portasSaida",
    rotulo: "Portas de saída",
    grupo: "Potência",
    tipo: "numero",
    melhor: "maior",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "descricaoSaidas",
    rotulo: "Quais portas",
    grupo: "Potência",
    tipo: "texto",
    contaTransparencia: true,
  },
  {
    chave: "caboIntegrado",
    rotulo: "Cabo integrado",
    grupo: "Potência",
    tipo: "booleano",
    filtro: "booleano",
    ajuda: "Cabo preso ao aparelho, que dispensa levar o seu.",
  },
  {
    chave: "pesoG",
    rotulo: "Peso",
    grupo: "Tamanho",
    tipo: "numero",
    unidade: "g",
    melhor: "menor",
    filtro: "faixa",
    ajuda:
      "O critério que mais decide se o produto vai ser usado ou esquecido em casa.",
    contaTransparencia: true,
  },
  {
    chave: "dimensoesMm",
    rotulo: "Dimensões",
    grupo: "Tamanho",
    tipo: "texto",
    contaTransparencia: true,
  },
  {
    chave: "tempoRecargaH",
    rotulo: "Tempo de recarga do próprio aparelho",
    grupo: "Uso diário",
    tipo: "numero",
    unidade: "h",
    melhor: "menor",
    filtro: "faixa",
    ajuda:
      "Quanto tempo ele leva para se encher de novo. É o dado que mais falta nas fichas — e o que define se ele estará pronto amanhã de manhã.",
    contaTransparencia: true,
  },
  {
    chave: "displayDigital",
    rotulo: "Display digital de carga",
    grupo: "Uso diário",
    tipo: "booleano",
    filtro: "booleano",
    ajuda:
      "Mostra o nível restante em número, em vez das quatro luzinhas que não dizem nada.",
  },
  {
    chave: "garantiaMeses",
    rotulo: "Garantia",
    grupo: "Garantia e suporte",
    tipo: "numero",
    unidade: "meses",
    melhor: "maior",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "ciclosCarga",
    rotulo: "Ciclos de carga declarados",
    grupo: "Garantia e suporte",
    tipo: "numero",
    melhor: "maior",
    ajuda:
      "Quantas recargas até a célula perder capacidade relevante. Define se o produto ainda serve daqui a dois anos.",
    contaTransparencia: true,
  },
];

/** Cada categoria traz o seu próprio conjunto de campos comparáveis. */
export const camposPorCategoria: Record<string, Campo[]> = {
  energia: camposEnergia,
};

export function camposDa(categoria: string): Campo[] {
  return camposPorCategoria[categoria] ?? [];
}

/**
 * Quanto da ficha o fabricante realmente publica, de 0 a 100.
 *
 * É a única nota deste site que não depende de julgamento nosso: ou o dado está
 * na documentação oficial, ou não está. Marca que publica capacidade real e
 * tempo de recarga pontua alto; marca que só publica o número grande da caixa
 * pontua baixo — e o leitor vê exatamente quais campos faltaram.
 */
export function transparencia(p: Produto, campos: Campo[]) {
  const avaliados = campos.filter((c) => c.contaTransparencia);
  const ausentes = avaliados.filter(
    (c) => p.specs[c.chave] === null || p.specs[c.chave] === undefined,
  );
  const preenchidos = avaliados.length - ausentes.length;
  return {
    nota: avaliados.length
      ? Math.round((preenchidos / avaliados.length) * 100)
      : 0,
    preenchidos,
    total: avaliados.length,
    ausentes,
  };
}

/** Formata um valor para leitura, com o "não informa" explícito. */
export function valorLegivel(valor: ValorSpec, campo: Campo): string {
  if (valor === null || valor === undefined) return "Não informa";
  if (typeof valor === "boolean") return valor ? "Sim" : "Não";
  if (typeof valor === "number") {
    const n = valor.toLocaleString("pt-BR");
    return campo.unidade ? `${n} ${campo.unidade}` : n;
  }
  return valor;
}

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

/**
 * O que a Creators API da Amazon devolve para um ASIN, já normalizado por
 * `scripts/amazon-sync.mjs`. Tudo opcional: a API só manda o que foi pedido, e
 * produto sem oferta não tem preço.
 *
 * `origem: "simulacao"` marca dado fictício gerado para testar a interface —
 * a interface o exibe com aviso, e o script se recusa a gerá-lo em CI.
 */
export type ImagemAmazon = {
  url: string;
  largura: number | null;
  altura: number | null;
};

export type DadosAmazon = {
  asin: string;
  titulo: string | null;
  marca: string | null;
  /** Link da página do produto, já com a tag de afiliado. */
  url: string | null;
  imagens: {
    pequena: ImagemAmazon | null;
    media: ImagemAmazon | null;
    grande: ImagemAmazon | null;
  };
  preco: {
    valor: number | null;
    moeda: string;
    exibicao: string | null;
  } | null;
  disponivel: boolean | null;
  caracteristicas: string[];
  pesoDeclarado: string | null;
  /** ISO. Preço só pode ser exibido com o horário da consulta. */
  consultadoEm: string;
  origem: "creators-api" | "simulacao";
};

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
  /**
   * Campos que não se aplicam a este produto, pela natureza dele — não que o
   * fabricante tenha deixado de informar.
   *
   * Fone over-ear não tem estojo de carga, então "bateria com o estojo" ali não
   * é omissão: é pergunta sem sentido. Sem esta lista, a nota de transparência
   * puniria o produto por não ter uma coisa que ele não pode ter, e a nota
   * deixaria de medir o que se propõe a medir.
   */
  naoSeAplica?: string[];
  /** Anexado na leitura da base, quando existe sincronização da Amazon. */
  amazon?: DadosAmazon;
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

/**
 * Fones de ouvido.
 *
 * A ficha aqui é bem mais rica que a de bateria: a Philips publica driver,
 * impedância, sensibilidade, faixa de frequência, codec e capacidade de bateria
 * separada por fone e por estojo. Por isso os campos são mais e mais finos — o
 * esquema segue o que o setor realmente documenta, não o que seria cômodo.
 */
export const camposAudio: Campo[] = [
  {
    chave: "formato",
    rotulo: "Formato",
    grupo: "O que é",
    tipo: "texto",
    ajuda:
      "TWS é o par sem fio com estojo; over-ear cobre a orelha inteira; intra-auricular entra no canal.",
    contaTransparencia: true,
  },
  {
    chave: "driverMm",
    rotulo: "Driver",
    grupo: "Som",
    tipo: "numero",
    unidade: "mm",
    melhor: "maior",
    filtro: "faixa",
    ajuda:
      "Diâmetro do alto-falante. Driver maior costuma empurrar mais grave, mas tamanho sozinho não define qualidade.",
    contaTransparencia: true,
  },
  {
    chave: "impedanciaOhm",
    rotulo: "Impedância",
    grupo: "Som",
    tipo: "numero",
    unidade: "Ω",
    ajuda:
      "Resistência elétrica. Acima de 32 Ω, celular pode não ter força para tocar alto.",
    contaTransparencia: true,
  },
  {
    chave: "sensibilidadeDb",
    rotulo: "Sensibilidade",
    grupo: "Som",
    tipo: "numero",
    unidade: "dB",
    melhor: "maior",
    ajuda: "Quanto volume sai para a mesma potência de entrada.",
    contaTransparencia: true,
  },
  {
    chave: "faixaFrequencia",
    rotulo: "Faixa de frequência",
    grupo: "Som",
    tipo: "texto",
    contaTransparencia: true,
  },
  {
    chave: "bluetoothVersao",
    rotulo: "Versão do Bluetooth",
    grupo: "Conexão",
    tipo: "texto",
    contaTransparencia: true,
  },
  {
    chave: "codecs",
    rotulo: "Codecs",
    grupo: "Conexão",
    tipo: "texto",
    ajuda:
      "SBC é o mínimo que todo aparelho tem. AAC ajuda no iPhone; aptX e LDAC, em Android compatível.",
    contaTransparencia: true,
  },
  {
    chave: "multiponto",
    rotulo: "Dois aparelhos ao mesmo tempo",
    grupo: "Conexão",
    tipo: "booleano",
    filtro: "booleano",
    ajuda: "Conectar no celular e no notebook sem reparear a cada troca.",
  },
  {
    chave: "horasFone",
    rotulo: "Bateria do fone",
    grupo: "Bateria",
    tipo: "numero",
    unidade: "h",
    melhor: "maior",
    filtro: "faixa",
    ajuda:
      "Quanto toca com uma carga, sem o estojo. É o número que importa no dia a dia.",
    contaTransparencia: true,
  },
  {
    chave: "horasTotal",
    rotulo: "Bateria com o estojo",
    grupo: "Bateria",
    tipo: "numero",
    unidade: "h",
    melhor: "maior",
    filtro: "faixa",
    ajuda:
      "O número grande do anúncio. Só vale se você carregar o estojo junto.",
    contaTransparencia: true,
  },
  {
    chave: "tempoCargaH",
    rotulo: "Tempo de carga",
    grupo: "Bateria",
    tipo: "numero",
    unidade: "h",
    melhor: "menor",
    contaTransparencia: true,
  },
  {
    chave: "cargaRapida",
    rotulo: "Carga rápida",
    grupo: "Bateria",
    tipo: "texto",
    ajuda: "Quantos minutos na tomada rendem quantas horas de música.",
  },
  {
    chave: "cancelamentoAtivo",
    rotulo: "Cancelamento ativo de ruído",
    grupo: "Uso diário",
    tipo: "booleano",
    filtro: "booleano",
  },
  {
    chave: "reducaoDb",
    rotulo: "Redução de ruído declarada",
    grupo: "Uso diário",
    tipo: "numero",
    unidade: "dB",
    melhor: "maior",
    ajuda:
      "Quanto o fabricante afirma cortar. Medido em condições que ele escolheu — promessa, não teste nosso.",
    contaTransparencia: true,
  },
  {
    chave: "protecaoAgua",
    rotulo: "Proteção contra água",
    grupo: "Uso diário",
    tipo: "texto",
    ajuda: "IPX4 aguenta suor e chuva leve; IPX7 aguenta imersão.",
    contaTransparencia: true,
  },
  {
    chave: "pesoG",
    rotulo: "Peso",
    grupo: "Uso diário",
    tipo: "numero",
    unidade: "g",
    melhor: "menor",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "controles",
    rotulo: "Controles",
    grupo: "Uso diário",
    tipo: "texto",
    contaTransparencia: true,
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
];

/**
 * Cozinha — por ora, airfryers.
 *
 * O número que vende é "litros", e ele quase sempre é a capacidade da caixa,
 * não do cesto onde a comida cabe. Por isso os dois entram separados, como
 * bateria nominal e real nas baterias, e fone e estojo nos fones.
 */
export const camposCozinha: Campo[] = [
  {
    chave: "formato",
    rotulo: "Formato",
    grupo: "O que é",
    tipo: "texto",
    ajuda: "Cesto (gaveta) ou forno (porta frontal, com bandejas).",
    contaTransparencia: true,
  },
  {
    chave: "capacidadeTotalL",
    rotulo: "Capacidade total",
    grupo: "Capacidade",
    tipo: "numero",
    unidade: "L",
    melhor: "maior",
    filtro: "faixa",
    ajuda: "O número da caixa: o volume interno do aparelho.",
    contaTransparencia: true,
  },
  {
    chave: "capacidadeUtilL",
    rotulo: "Capacidade útil",
    grupo: "Capacidade",
    tipo: "numero",
    unidade: "L",
    melhor: "maior",
    filtro: "faixa",
    ajuda:
      "Quanto cabe de comida no cesto. Costuma ser 60% a 70% do total — e é o que define se a refeição sai em uma leva.",
    contaTransparencia: true,
  },
  {
    chave: "potenciaW",
    rotulo: "Potência",
    grupo: "Desempenho declarado",
    tipo: "numero",
    unidade: "W",
    melhor: "maior",
    filtro: "faixa",
    ajuda: "Mais potência aquece mais rápido e pesa na conta de luz na mesma proporção.",
    contaTransparencia: true,
  },
  {
    chave: "temperaturaMaxC",
    rotulo: "Temperatura máxima",
    grupo: "Desempenho declarado",
    tipo: "numero",
    unidade: "°C",
    melhor: "maior",
    contaTransparencia: true,
  },
  {
    chave: "temperaturaMinC",
    rotulo: "Temperatura mínima",
    grupo: "Desempenho declarado",
    tipo: "numero",
    unidade: "°C",
    melhor: "menor",
    ajuda: "Abaixo de 60 °C dá para desidratar; acima disso, só cozinha.",
    contaTransparencia: true,
  },
  {
    chave: "timerMaxMin",
    rotulo: "Timer máximo",
    grupo: "Desempenho declarado",
    tipo: "numero",
    unidade: "min",
    melhor: "maior",
    contaTransparencia: true,
  },
  {
    chave: "funcoesPredefinidas",
    rotulo: "Funções predefinidas",
    grupo: "Uso diário",
    tipo: "numero",
    melhor: "maior",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "painel",
    rotulo: "Painel",
    grupo: "Uso diário",
    tipo: "texto",
    contaTransparencia: true,
  },
  {
    chave: "visor",
    rotulo: "Janela para ver a comida",
    grupo: "Uso diário",
    tipo: "booleano",
    filtro: "booleano",
  },
  {
    chave: "lavaLoucas",
    rotulo: "Peças vão na lava-louças",
    grupo: "Uso diário",
    tipo: "booleano",
    filtro: "booleano",
    contaTransparencia: true,
  },
  {
    chave: "tensao",
    rotulo: "Tensão",
    grupo: "Instalação",
    tipo: "texto",
    filtro: "opcoes",
    ajuda: "Bivolt evita o erro mais caro da categoria: ligar 127 V em 220 V.",
    contaTransparencia: true,
  },
  {
    chave: "pesoKg",
    rotulo: "Peso",
    grupo: "Instalação",
    tipo: "numero",
    unidade: "kg",
    melhor: "menor",
    contaTransparencia: true,
  },
  {
    chave: "dimensoesMm",
    rotulo: "Dimensões",
    grupo: "Instalação",
    tipo: "texto",
    ajuda: "Antes de comprar, meça o vão embaixo do armário.",
    contaTransparencia: true,
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
];

/**
 * Celulares. A ficha oficial de smartphone é longa e cheia de marketing; os
 * campos aqui são os que decidem compra e cabem numa linha. `bateriaMah` e
 * `memoriaRamGb` contam para a transparência de propósito: são dois números que
 * quase toda marca Android publica e que a Apple nunca publicou.
 */
export const camposCelular: Campo[] = [
  {
    chave: "formato",
    rotulo: "Formato",
    grupo: "O que é",
    tipo: "texto",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "telaPol",
    rotulo: "Tela",
    grupo: "Tela",
    tipo: "numero",
    unidade: "pol",
    melhor: "maior",
    filtro: "faixa",
    ajuda: "Diagonal declarada. Em dobrável, é a tela interna aberta.",
    contaTransparencia: true,
  },
  {
    chave: "resolucao",
    rotulo: "Resolução",
    grupo: "Tela",
    tipo: "texto",
    contaTransparencia: true,
  },
  {
    chave: "taxaHz",
    rotulo: "Taxa de atualização",
    grupo: "Tela",
    tipo: "numero",
    unidade: "Hz",
    melhor: "maior",
    contaTransparencia: true,
  },
  {
    chave: "brilhoPicoNits",
    rotulo: "Brilho de pico",
    grupo: "Tela",
    tipo: "numero",
    unidade: "nits",
    melhor: "maior",
    ajuda: "O número que a marca declara para sol a pino. O brilho típico costuma ser um terço disso.",
    contaTransparencia: true,
  },
  {
    chave: "chip",
    rotulo: "Chip",
    grupo: "Desempenho declarado",
    tipo: "texto",
    contaTransparencia: true,
  },
  {
    chave: "memoriaRamGb",
    rotulo: "Memória RAM",
    grupo: "Desempenho declarado",
    tipo: "numero",
    unidade: "GB",
    melhor: "maior",
    contaTransparencia: true,
  },
  {
    chave: "armazenamento",
    rotulo: "Opções de armazenamento",
    grupo: "Desempenho declarado",
    tipo: "texto",
    contaTransparencia: true,
  },
  {
    chave: "cameraPrincipalMp",
    rotulo: "Câmera principal",
    grupo: "Câmeras",
    tipo: "numero",
    unidade: "MP",
    melhor: "maior",
    contaTransparencia: true,
  },
  {
    chave: "teleobjetiva",
    rotulo: "Teleobjetiva",
    grupo: "Câmeras",
    tipo: "texto",
    ajuda: "Lente própria para zoom. \"2x por recorte\" é a câmera principal cortada, não uma lente a mais.",
    contaTransparencia: true,
  },
  {
    chave: "cameraFrontalMp",
    rotulo: "Câmera frontal",
    grupo: "Câmeras",
    tipo: "numero",
    unidade: "MP",
    melhor: "maior",
    contaTransparencia: true,
  },
  {
    chave: "bateriaMah",
    rotulo: "Bateria",
    grupo: "Bateria",
    tipo: "numero",
    unidade: "mAh",
    melhor: "maior",
    ajuda: "A capacidade em mAh. A Apple publica só horas de vídeo; o mAh sai de certificação, não da ficha.",
    contaTransparencia: true,
  },
  {
    chave: "horasVideo",
    rotulo: "Reprodução de vídeo",
    grupo: "Bateria",
    tipo: "numero",
    unidade: "h",
    melhor: "maior",
    filtro: "faixa",
    ajuda: "Horas de vídeo declaradas — o teste padrão da Apple. Uso real é menor.",
    contaTransparencia: true,
  },
  {
    chave: "cargaRapida",
    rotulo: "Carga rápida",
    grupo: "Bateria",
    tipo: "texto",
    contaTransparencia: true,
  },
  {
    chave: "cargaSemFioW",
    rotulo: "Carga sem fio",
    grupo: "Bateria",
    tipo: "numero",
    unidade: "W",
    melhor: "maior",
    contaTransparencia: true,
  },
  {
    chave: "usb",
    rotulo: "Porta USB-C",
    grupo: "Conexão",
    tipo: "texto",
    ajuda: "USB 2 é o padrão de 2000: 480 Mb/s. USB 3 é vinte vezes mais rápido para tirar vídeo do aparelho.",
    contaTransparencia: true,
  },
  {
    chave: "sim",
    rotulo: "Chip de operadora",
    grupo: "Conexão",
    tipo: "texto",
    filtro: "opcoes",
    ajuda: "Só eSIM exige que a sua operadora ofereça eSIM — nem toda linha pré-paga tem.",
    contaTransparencia: true,
  },
  {
    chave: "protecaoAgua",
    rotulo: "Proteção contra água",
    grupo: "Corpo",
    tipo: "texto",
    contaTransparencia: true,
  },
  {
    chave: "material",
    rotulo: "Material",
    grupo: "Corpo",
    tipo: "texto",
    contaTransparencia: true,
  },
  {
    chave: "pesoG",
    rotulo: "Peso",
    grupo: "Corpo",
    tipo: "numero",
    unidade: "g",
    melhor: "menor",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "espessuraMm",
    rotulo: "Espessura",
    grupo: "Corpo",
    tipo: "numero",
    unidade: "mm",
    melhor: "menor",
    contaTransparencia: true,
  },
  {
    chave: "dimensoesMm",
    rotulo: "Dimensões",
    grupo: "Corpo",
    tipo: "texto",
    contaTransparencia: true,
  },
  {
    chave: "garantiaMeses",
    rotulo: "Garantia",
    grupo: "Garantia e suporte",
    tipo: "numero",
    unidade: "meses",
    melhor: "maior",
    contaTransparencia: true,
  },
];

/**
 * Tablets. Parecido com celular, com o que muda de verdade na decisão: caneta
 * na caixa, alto-falantes, rede (só Wi-Fi ou com chip) e a política de
 * atualização — tablet dura mais que celular, e é a atualização que decide
 * quantos anos ele continua útil.
 */
export const camposTablet: Campo[] = [
  {
    chave: "telaPol",
    rotulo: "Tela",
    grupo: "Tela",
    tipo: "numero",
    unidade: "pol",
    melhor: "maior",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "resolucao",
    rotulo: "Resolução",
    grupo: "Tela",
    tipo: "texto",
    contaTransparencia: true,
  },
  {
    chave: "taxaHz",
    rotulo: "Taxa de atualização",
    grupo: "Tela",
    tipo: "numero",
    unidade: "Hz",
    melhor: "maior",
    contaTransparencia: true,
  },
  {
    chave: "brilhoNits",
    rotulo: "Brilho",
    grupo: "Tela",
    tipo: "numero",
    unidade: "nits",
    melhor: "maior",
    ajuda: "Tablet é usado no sofá e na cama, mas 400 nits ou menos não dá para ler na varanda.",
    contaTransparencia: true,
  },
  {
    chave: "chip",
    rotulo: "Chip",
    grupo: "Desempenho declarado",
    tipo: "texto",
    contaTransparencia: true,
  },
  {
    chave: "memoriaRamGb",
    rotulo: "Memória RAM",
    grupo: "Desempenho declarado",
    tipo: "numero",
    unidade: "GB",
    melhor: "maior",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "armazenamento",
    rotulo: "Armazenamento",
    grupo: "Desempenho declarado",
    tipo: "texto",
    contaTransparencia: true,
  },
  {
    chave: "rede",
    rotulo: "Rede",
    grupo: "Conexão",
    tipo: "texto",
    filtro: "opcoes",
    ajuda: "Só Wi-Fi ou com chip de operadora (4G/5G). A versão com chip é outro produto, com outro preço.",
    contaTransparencia: true,
  },
  {
    chave: "wifi",
    rotulo: "Wi-Fi",
    grupo: "Conexão",
    tipo: "texto",
    contaTransparencia: true,
  },
  {
    chave: "usb",
    rotulo: "Porta USB-C",
    grupo: "Conexão",
    tipo: "texto",
    contaTransparencia: true,
  },
  {
    chave: "canetaInclusa",
    rotulo: "Caneta na caixa",
    grupo: "Uso diário",
    tipo: "booleano",
    filtro: "booleano",
    ajuda: "Suportar caneta e vir com caneta são coisas diferentes — e a caneta avulsa custa caro.",
    contaTransparencia: true,
  },
  {
    chave: "altoFalantes",
    rotulo: "Alto-falantes",
    grupo: "Uso diário",
    tipo: "numero",
    melhor: "maior",
    contaTransparencia: true,
  },
  {
    chave: "cameraTraseiraMp",
    rotulo: "Câmera traseira",
    grupo: "Uso diário",
    tipo: "numero",
    unidade: "MP",
    melhor: "maior",
  },
  {
    chave: "cameraFrontalMp",
    rotulo: "Câmera frontal",
    grupo: "Uso diário",
    tipo: "numero",
    unidade: "MP",
    melhor: "maior",
    ajuda: "Em tablet a frontal importa mais que a traseira: é a das chamadas de vídeo.",
    contaTransparencia: true,
  },
  {
    chave: "bateriaMah",
    rotulo: "Bateria",
    grupo: "Bateria",
    tipo: "numero",
    unidade: "mAh",
    melhor: "maior",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "cargaW",
    rotulo: "Carga",
    grupo: "Bateria",
    tipo: "numero",
    unidade: "W",
    melhor: "maior",
    ajuda: "Bateria de tablet é grande: com 15 W, uma carga completa leva a noite inteira.",
    contaTransparencia: true,
  },
  {
    chave: "carregadorNaCaixa",
    rotulo: "Carregador na caixa",
    grupo: "Bateria",
    tipo: "booleano",
    filtro: "booleano",
    contaTransparencia: true,
  },
  {
    chave: "sistema",
    rotulo: "Sistema na caixa",
    grupo: "Atualizações",
    tipo: "texto",
    contaTransparencia: true,
  },
  {
    chave: "atualizacoes",
    rotulo: "Atualizações prometidas",
    grupo: "Atualizações",
    tipo: "texto",
    ajuda: "Quantas versões do sistema o fabricante promete. É o que separa um tablet de 2 anos de um de 6.",
    contaTransparencia: true,
  },
  {
    chave: "pesoG",
    rotulo: "Peso",
    grupo: "Corpo",
    tipo: "numero",
    unidade: "g",
    melhor: "menor",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "espessuraMm",
    rotulo: "Espessura",
    grupo: "Corpo",
    tipo: "numero",
    unidade: "mm",
    melhor: "menor",
    contaTransparencia: true,
  },
  {
    chave: "dimensoesMm",
    rotulo: "Dimensões",
    grupo: "Corpo",
    tipo: "texto",
    contaTransparencia: true,
  },
  {
    chave: "protecaoAgua",
    rotulo: "Proteção contra água",
    grupo: "Corpo",
    tipo: "texto",
  },
  {
    chave: "garantiaMeses",
    rotulo: "Garantia",
    grupo: "Garantia e suporte",
    tipo: "numero",
    unidade: "meses",
    melhor: "maior",
    contaTransparencia: true,
  },
];

/**
 * Monitores. A ficha de monitor é a mais numérica de todas — e a mais fácil
 * de inflar: "1 ms" pode ser GtG ou MPRT, "144 Hz" pode exigir overclock. Os
 * campos guardam o número e o texto guarda a condição.
 */
export const camposMonitor: Campo[] = [
  {
    chave: "telaPol",
    rotulo: "Tela",
    grupo: "Tela",
    tipo: "numero",
    unidade: "pol",
    melhor: "maior",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "resolucao",
    rotulo: "Resolução",
    grupo: "Tela",
    tipo: "texto",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "painel",
    rotulo: "Tipo de painel",
    grupo: "Tela",
    tipo: "texto",
    filtro: "opcoes",
    ajuda: "IPS tem cor e ângulo; VA tem contraste; TN é o mais barato e o pior de lado.",
    contaTransparencia: true,
  },
  {
    chave: "taxaHz",
    rotulo: "Taxa de atualização",
    grupo: "Tela",
    tipo: "numero",
    unidade: "Hz",
    melhor: "maior",
    filtro: "faixa",
    ajuda: "Se a taxa máxima exige overclock (\"O/C\"), o campo de texto diz.",
    contaTransparencia: true,
  },
  {
    chave: "tempoRespostaMs",
    rotulo: "Tempo de resposta",
    grupo: "Tela",
    tipo: "numero",
    unidade: "ms",
    melhor: "menor",
    ajuda: "GtG e MPRT não são a mesma medida — MPRT dá número menor. A ficha diz qual foi declarado.",
    contaTransparencia: true,
  },
  {
    chave: "medidaResposta",
    rotulo: "Medida do tempo de resposta",
    grupo: "Tela",
    tipo: "texto",
    contaTransparencia: true,
  },
  {
    chave: "brilhoNits",
    rotulo: "Brilho",
    grupo: "Tela",
    tipo: "numero",
    unidade: "nits",
    melhor: "maior",
    contaTransparencia: true,
  },
  {
    chave: "contraste",
    rotulo: "Contraste",
    grupo: "Tela",
    tipo: "texto",
    contaTransparencia: true,
  },
  {
    chave: "coresSrgb",
    rotulo: "Cobertura sRGB",
    grupo: "Tela",
    tipo: "numero",
    unidade: "%",
    melhor: "maior",
    contaTransparencia: true,
  },
  {
    chave: "hdr",
    rotulo: "HDR",
    grupo: "Tela",
    tipo: "texto",
    ajuda: "\"HDR10\" sem brilho acima de 400 nits é compatibilidade de sinal, não imagem HDR.",
  },
  {
    chave: "sincronizacao",
    rotulo: "Sincronização adaptativa",
    grupo: "Jogo",
    tipo: "texto",
    contaTransparencia: true,
  },
  {
    chave: "hdmi",
    rotulo: "Entradas HDMI",
    grupo: "Conexões",
    tipo: "texto",
    contaTransparencia: true,
  },
  {
    chave: "displayPort",
    rotulo: "DisplayPort",
    grupo: "Conexões",
    tipo: "texto",
    contaTransparencia: true,
  },
  {
    chave: "outrasPortas",
    rotulo: "Outras portas",
    grupo: "Conexões",
    tipo: "texto",
  },
  {
    chave: "altoFalantes",
    rotulo: "Alto-falantes",
    grupo: "Conexões",
    tipo: "booleano",
    filtro: "booleano",
    contaTransparencia: true,
  },
  {
    chave: "ajusteAltura",
    rotulo: "Ajuste de altura",
    grupo: "Corpo",
    tipo: "booleano",
    filtro: "booleano",
    ajuda: "Sem ajuste de altura, o monitor fica onde a base põe — e a base costuma pôr baixo demais.",
    contaTransparencia: true,
  },
  {
    chave: "vesa",
    rotulo: "Furação VESA",
    grupo: "Corpo",
    tipo: "texto",
    contaTransparencia: true,
  },
  {
    chave: "pesoKg",
    rotulo: "Peso",
    grupo: "Corpo",
    tipo: "numero",
    unidade: "kg",
    melhor: "menor",
    contaTransparencia: true,
  },
  {
    chave: "dimensoesMm",
    rotulo: "Dimensões com base",
    grupo: "Corpo",
    tipo: "texto",
    contaTransparencia: true,
  },
  {
    chave: "consumoW",
    rotulo: "Consumo",
    grupo: "Corpo",
    tipo: "numero",
    unidade: "W",
    melhor: "menor",
    contaTransparencia: true,
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
];

/** Cada categoria traz o seu próprio conjunto de campos comparáveis. */
export const camposPorCategoria: Record<string, Campo[]> = {
  energia: camposEnergia,
  audio: camposAudio,
  cozinha: camposCozinha,
  celular: camposCelular,
  tablets: camposTablet,
  monitores: camposMonitor,
};

export function camposDa(categoria: string): Campo[] {
  return camposPorCategoria[categoria] ?? [];
}

/**
 * Ícone de cada campo, por chave. Fica fora da definição do campo para o
 * módulo de dados não saber que existe interface — e para a mesma chave em
 * categorias diferentes (pesoG, garantiaMeses) ganhar o mesmo ícone sozinha.
 */
const ICONE_POR_CAMPO: Record<string, string> = {
  capacidadeNominal: "bateria",
  capacidadeReal: "bateria",
  energiaWh: "raio",
  quimica: "driver",
  potenciaMaxSaida: "raio",
  potenciaMaxEntrada: "raio",
  portasSaida: "portas",
  descricaoSaidas: "portas",
  caboIntegrado: "cabo",
  pesoG: "peso",
  dimensoesMm: "regua",
  tempoRecargaH: "relogio",
  displayDigital: "display",
  garantiaMeses: "escudo",
  ciclosCarga: "bateria",
  formato: "fone",
  driverMm: "driver",
  impedanciaOhm: "ohm",
  sensibilidadeDb: "onda",
  faixaFrequencia: "onda",
  bluetoothVersao: "bluetooth",
  codecs: "bluetooth",
  multiponto: "bluetooth",
  horasFone: "bateria",
  horasTotal: "bateria",
  tempoCargaH: "relogio",
  cargaRapida: "raio",
  cancelamentoAtivo: "fone",
  reducaoDb: "fone",
  protecaoAgua: "gota",
  controles: "controle",
  capacidadeTotalL: "panela",
  capacidadeUtilL: "panela",
  potenciaW: "raio",
  temperaturaMaxC: "termometro",
  temperaturaMinC: "termometro",
  timerMaxMin: "relogio",
  funcoesPredefinidas: "controle",
  painel: "display",
  visor: "display",
  lavaLoucas: "gota",
  tensao: "raio",
  pesoKg: "peso",
  telaPol: "celular",
  resolucao: "display",
  taxaHz: "display",
  brilhoPicoNits: "display",
  chip: "chip",
  memoriaRamGb: "chip",
  armazenamento: "portas",
  cameraPrincipalMp: "camera",
  teleobjetiva: "camera",
  cameraFrontalMp: "camera",
  bateriaMah: "bateria",
  horasVideo: "bateria",
  cargaSemFioW: "raio",
  usb: "cabo",
  sim: "celular",
  material: "celular",
  espessuraMm: "regua",
  brilhoNits: "display",
  rede: "bluetooth",
  wifi: "bluetooth",
  canetaInclusa: "controle",
  altoFalantes: "onda",
  cameraTraseiraMp: "camera",
  cargaW: "raio",
  carregadorNaCaixa: "cabo",
  sistema: "chip",
  atualizacoes: "escudo",
  tempoRespostaMs: "relogio",
  medidaResposta: "relogio",
  contraste: "display",
  coresSrgb: "display",
  hdr: "display",
  sincronizacao: "controle",
  hdmi: "portas",
  displayPort: "portas",
  outrasPortas: "portas",
  ajusteAltura: "regua",
  vesa: "regua",
  consumoW: "raio",
};

export function iconeDo(chave: string): string {
  return ICONE_POR_CAMPO[chave] ?? "info";
}

/** Ícone de cada categoria — trilho de navegação, mídia sem foto, cards. */
const ICONE_POR_CATEGORIA: Record<string, string> = {
  audio: "fone",
  energia: "bateria",
  perifericos: "controle",
  monitores: "display",
  armazenamento: "portas",
  conectividade: "bluetooth",
  "casa-conectada": "display",
  celular: "celular",
  cozinha: "panela",
  tablets: "display",
  eletrodomesticos: "raio",
};

export function iconeDaCategoria(slug: string): string {
  return ICONE_POR_CATEGORIA[slug] ?? "info";
}

/** Rótulo curto para o card, onde "Potência máxima de saída" não cabe. */
const ROTULO_CURTO: Record<string, string> = {
  capacidadeNominal: "Capacidade",
  capacidadeReal: "Cap. real",
  energiaWh: "Energia",
  potenciaMaxSaida: "Saída",
  potenciaMaxEntrada: "Entrada",
  portasSaida: "Portas",
  pesoG: "Peso",
  dimensoesMm: "Tamanho",
  tempoRecargaH: "Recarga",
  garantiaMeses: "Garantia",
  driverMm: "Driver",
  horasFone: "Bateria",
  horasTotal: "Com estojo",
  bluetoothVersao: "Bluetooth",
  protecaoAgua: "Água",
  reducaoDb: "Cancelamento",
  tempoCargaH: "Carga",
  capacidadeTotalL: "Total",
  capacidadeUtilL: "Útil",
  potenciaW: "Potência",
  temperaturaMaxC: "Temp. máx.",
  temperaturaMinC: "Temp. mín.",
  timerMaxMin: "Timer",
  funcoesPredefinidas: "Funções",
  lavaLoucas: "Lava-louças",
  pesoKg: "Peso",
  telaPol: "Tela",
  brilhoPicoNits: "Brilho",
  memoriaRamGb: "RAM",
  armazenamento: "Espaço",
  cameraPrincipalMp: "Câmera",
  cameraFrontalMp: "Frontal",
  bateriaMah: "Bateria",
  horasVideo: "Vídeo",
  cargaSemFioW: "Sem fio",
  espessuraMm: "Espessura",
  brilhoNits: "Brilho",
  canetaInclusa: "Caneta",
  altoFalantes: "Falantes",
  cameraTraseiraMp: "Traseira",
  cargaW: "Carga",
  carregadorNaCaixa: "Carregador",
  atualizacoes: "Atualizações",
  taxaHz: "Taxa",
  tempoRespostaMs: "Resposta",
  coresSrgb: "sRGB",
  ajusteAltura: "Altura",
  consumoW: "Consumo",
  resolucao: "Resolução",
  painel: "Painel",
};

export function rotuloCurto(campo: Campo): string {
  return ROTULO_CURTO[campo.chave] ?? campo.rotulo;
}

/** Os três números que separam um produto de outro, por categoria — para o card. */
const DESTAQUES_POR_CATEGORIA: Record<string, string[]> = {
  energia: ["capacidadeNominal", "potenciaMaxSaida", "pesoG"],
  audio: ["horasFone", "driverMm", "protecaoAgua"],
  cozinha: ["capacidadeUtilL", "potenciaW", "tensao"],
  celular: ["telaPol", "horasVideo", "pesoG"],
  tablets: ["telaPol", "bateriaMah", "canetaInclusa"],
  monitores: ["telaPol", "taxaHz", "painel"],
};

export function destaquesDa(categoria: string): string[] {
  return DESTAQUES_POR_CATEGORIA[categoria] ?? [];
}

/**
 * Faixa da nota de transparência. Cor de dado, sobre a documentação do
 * fabricante — nunca sobre a qualidade do produto, e o rótulo diz isso.
 */
export function faixaTransparencia(nota: number): {
  classe: "faixa-bom" | "faixa-medio" | "faixa-baixo";
  rotulo: string;
} {
  if (nota >= 70) return { classe: "faixa-bom", rotulo: "Ficha completa" };
  if (nota >= 45) return { classe: "faixa-medio", rotulo: "Ficha parcial" };
  return { classe: "faixa-baixo", rotulo: "Ficha pobre" };
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
  const avaliados = campos.filter(
    (c) => c.contaTransparencia && !p.naoSeAplica?.includes(c.chave),
  );
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

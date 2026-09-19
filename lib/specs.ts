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
  /**
   * Fotos oficiais adicionais, na ordem em que aparecem na ficha depois de
   * `imagem`. Mesma regra da principal: material do fabricante, com `credito` e
   * `origem`, baixado da página dele — **nunca** da listagem de uma loja, que é
   * infração de direito autoral e quebra do contrato de afiliado, mesmo quando
   * a foto na loja é do próprio fabricante.
   *
   * Existe porque uma foto só não responde o que o comprador pergunta: como é
   * de costas, quanto é fino, quantas cores existem. Fica fora do card, que
   * continua com uma imagem só para a grade não dançar.
   */
  galeria?: Imagem[];
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
  /**
   * Data em que o fabricante diz que o produto chega às lojas, em ISO.
   *
   * Só existe enquanto essa data não passou. Produto anunciado ainda não é
   * produto à venda: a ficha vale, mas ele não pode disputar espaço com quem
   * já está na prateleira nem receber botão de compra sem aviso. Sai da home,
   * leva o aviso na ficha e continua na categoria.
   */
  nasLojasEm?: string;
  atualizadoEm: string;
};

/**
 * O produto ainda não chegou às lojas na data de referência?
 *
 * A comparação é com a data do build, porque o site é estático: a resposta é
 * verdadeira até a próxima publicação. Por isso a data também fica escrita na
 * tela — quem lê confere sozinho, sem depender de quando o site foi gerado.
 */
export function aindaNaoSaiu(p: Produto, hoje = new Date()): boolean {
  if (!p.nasLojasEm) return false;
  const lancamento = new Date(`${p.nasLojasEm}T00:00:00Z`);
  if (Number.isNaN(lancamento.getTime())) return false;
  return lancamento.getTime() > hoje.getTime();
}

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

/**
 * Liquidificadores. O campo que decide a categoria é o mesmo da airfryer:
 * `capacidadeUtilL`. O copo tem 2,2 litros, mas a vitamina que cabe sem
 * transbordar é menor — e só parte das marcas publica os dois números.
 */
export const camposLiquidificador: Campo[] = [
  {
    chave: "capacidadeTotalL",
    rotulo: "Capacidade do copo",
    grupo: "Capacidade",
    tipo: "numero",
    unidade: "L",
    melhor: "maior",
    filtro: "faixa",
    ajuda: "O número do anúncio: o volume do copo até a borda.",
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
      "Quanto dá para bater sem transbordar. Costuma ser 70% do copo — e é o número que decide se a vitamina da família sai de uma vez.",
    contaTransparencia: true,
  },
  {
    chave: "materialCopo",
    rotulo: "Material do copo",
    grupo: "Capacidade",
    tipo: "texto",
    filtro: "opcoes",
    ajuda: "Plástico (PP) risca e amarela; SAN e cristal resistem mais; vidro é o mais pesado.",
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
    ajuda: "Watt é o que o motor consome, não o que ele tritura — mas é o único número que todas publicam.",
    contaTransparencia: true,
  },
  {
    chave: "velocidades",
    rotulo: "Velocidades",
    grupo: "Desempenho declarado",
    tipo: "numero",
    melhor: "maior",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "rpm",
    rotulo: "Rotação máxima",
    grupo: "Desempenho declarado",
    tipo: "numero",
    unidade: "rpm",
    melhor: "maior",
    ajuda: "A rotação diz mais sobre trituração que o watt — e quase ninguém publica.",
    contaTransparencia: true,
  },
  {
    chave: "laminas",
    rotulo: "Lâminas",
    grupo: "Desempenho declarado",
    tipo: "texto",
    contaTransparencia: true,
  },
  {
    chave: "pulsar",
    rotulo: "Função pulsar",
    grupo: "Uso diário",
    tipo: "booleano",
    filtro: "booleano",
    contaTransparencia: true,
  },
  {
    chave: "filtro",
    rotulo: "Acompanha filtro",
    grupo: "Uso diário",
    tipo: "booleano",
    filtro: "booleano",
    ajuda: "O filtro separa o bagaço do suco. Vem na caixa ou é acessório à parte.",
    contaTransparencia: true,
  },
  {
    chave: "travaSeguranca",
    rotulo: "Trava de segurança",
    grupo: "Uso diário",
    tipo: "booleano",
    filtro: "booleano",
    ajuda: "Impede o motor de ligar com o copo fora do lugar.",
  },
  {
    chave: "tensao",
    rotulo: "Tensão",
    grupo: "Instalação",
    tipo: "texto",
    filtro: "opcoes",
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
    ajuda: "A altura é o que decide se ele cabe embaixo do armário da bancada.",
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
 * Cafeteiras elétricas de filtro. A unidade da categoria é a "xícara", e ela
 * tem 40 ml — não os 200 ml da caneca que a pessoa usa. Por isso o campo de
 * litros anda junto com o de xícaras: é a única forma de comparar "38 xícaras"
 * de uma marca com "1,2 L" de outra.
 */
export const camposCafeteira: Campo[] = [
  {
    chave: "capacidadeL",
    rotulo: "Capacidade em litros",
    grupo: "Capacidade",
    tipo: "numero",
    unidade: "L",
    melhor: "maior",
    filtro: "faixa",
    ajuda: "O reservatório de água. É o número que dá para comparar entre marcas.",
    contaTransparencia: true,
  },
  {
    chave: "xicaras",
    rotulo: "Xícaras declaradas",
    grupo: "Capacidade",
    tipo: "numero",
    melhor: "maior",
    filtro: "faixa",
    ajuda:
      "A xícara do anúncio tem cerca de 40 ml — é o cafezinho, não a caneca de 200 ml. \"38 xícaras\" são 1,5 litro.",
    contaTransparencia: true,
  },
  {
    chave: "mlPorXicara",
    rotulo: "Mililitros por xícara",
    grupo: "Capacidade",
    tipo: "numero",
    unidade: "ml",
    ajuda: "Quantos mililitros o fabricante chama de uma xícara. Quase ninguém escreve.",
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
    contaTransparencia: true,
  },
  {
    chave: "consumoKwh",
    rotulo: "Consumo declarado",
    grupo: "Desempenho declarado",
    tipo: "numero",
    unidade: "kWh",
    melhor: "menor",
    contaTransparencia: true,
  },
  {
    chave: "materialJarra",
    rotulo: "Material da jarra",
    grupo: "Jarra e filtro",
    tipo: "texto",
    filtro: "opcoes",
    ajuda: "Vidro deixa ver o nível e quebra; inox segura o calor e esconde quanto sobrou.",
    contaTransparencia: true,
  },
  {
    chave: "filtroPermanente",
    rotulo: "Filtro permanente",
    grupo: "Jarra e filtro",
    tipo: "booleano",
    filtro: "booleano",
    ajuda: "Lavável e reutilizável — dispensa o filtro de papel.",
    contaTransparencia: true,
  },
  {
    chave: "cortaPingos",
    rotulo: "Sistema corta-pingos",
    grupo: "Uso diário",
    tipo: "booleano",
    filtro: "booleano",
    ajuda: "Permite tirar a jarra com o café ainda passando, sem pingar na base.",
    contaTransparencia: true,
  },
  {
    chave: "manterAquecido",
    rotulo: "Base que mantém aquecido",
    grupo: "Uso diário",
    tipo: "booleano",
    filtro: "booleano",
    contaTransparencia: true,
  },
  {
    chave: "timer",
    rotulo: "Timer programável",
    grupo: "Uso diário",
    tipo: "booleano",
    filtro: "booleano",
    ajuda: "Deixar pronto na véspera para o café estar feito quando você acorda.",
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
    chave: "tensao",
    rotulo: "Tensão",
    grupo: "Instalação",
    tipo: "texto",
    filtro: "opcoes",
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
 * Armazenamento: pen drive, SSD interno e externo, HD portátil e cartão.
 *
 * O setor publica leitura e cala escrita. É a assimetria que define a
 * categoria: o número grande da embalagem é sempre o de leitura sequencial, e
 * quem compra para guardar arquivo quer saber o de escrita — que costuma ser
 * metade, ou um quinto, e na maioria das fichas simplesmente não existe.
 *
 * O TBW tem o mesmo papel do "ciclos de carga" na bateria: é o que diz se o
 * produto ainda serve daqui a três anos. Fabricante de SSD sério publica;
 * fabricante de pen drive, nunca.
 */
export const camposArmazenamento: Campo[] = [
  {
    chave: "tipo",
    rotulo: "Tipo",
    grupo: "O que é",
    tipo: "texto",
    filtro: "opcoes",
    ajuda:
      "Pen drive, SSD e HD não competem entre si: mudam a velocidade, o preço por gigabyte e o que acontece se cair no chão.",
    contaTransparencia: true,
  },
  {
    chave: "capacidadeGb",
    rotulo: "Capacidade",
    grupo: "O que é",
    tipo: "numero",
    unidade: "GB",
    melhor: "maior",
    filtro: "faixa",
    ajuda:
      "O número da caixa é em base 10. No sistema operacional, 1 TB aparece como 931 GB — não é defeito nem propaganda enganosa, são duas contas diferentes.",
    contaTransparencia: true,
  },
  {
    chave: "interface",
    rotulo: "Interface",
    grupo: "Conexão",
    tipo: "texto",
    filtro: "opcoes",
    ajuda:
      "O barramento decide o teto. USB 2.0 trava em 60 MB/s por mais rápida que seja a memória lá dentro.",
    contaTransparencia: true,
  },
  {
    chave: "conector",
    rotulo: "Conector",
    grupo: "Conexão",
    tipo: "texto",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "leituraMbs",
    rotulo: "Leitura declarada",
    grupo: "Velocidade",
    tipo: "numero",
    unidade: "MB/s",
    melhor: "maior",
    filtro: "faixa",
    ajuda:
      "O número grande da embalagem, quase sempre o de leitura sequencial, medido em condição de laboratório.",
    contaTransparencia: true,
  },
  {
    chave: "escritaMbs",
    rotulo: "Escrita declarada",
    grupo: "Velocidade",
    tipo: "numero",
    unidade: "MB/s",
    melhor: "maior",
    filtro: "faixa",
    ajuda:
      "Quanto tempo leva para copiar para dentro. É o número que a maioria das fichas não traz — e o que você sente ao mover uma pasta grande.",
    contaTransparencia: true,
  },
  {
    chave: "memoriaTipo",
    rotulo: "Tipo de memória",
    grupo: "Velocidade",
    tipo: "texto",
    ajuda: "TLC guarda três bits por célula e QLC guarda quatro: mais barato, menos resistente.",
    contaTransparencia: true,
  },
  {
    chave: "durabilidadeTbw",
    rotulo: "Durabilidade declarada",
    grupo: "Durabilidade",
    tipo: "numero",
    unidade: "TBW",
    melhor: "maior",
    filtro: "faixa",
    ajuda:
      "Quantos terabytes dá para escrever antes de a garantia acabar. É o dado que separa o SSD que dura do que é barato.",
    contaTransparencia: true,
  },
  {
    chave: "resistencia",
    rotulo: "Resistência declarada",
    grupo: "Durabilidade",
    tipo: "texto",
    ajuda: "Queda, água, poeira e raio X — o que o fabricante promete por escrito.",
    contaTransparencia: true,
  },
  {
    chave: "criptografia",
    rotulo: "Criptografia por hardware",
    grupo: "Durabilidade",
    tipo: "booleano",
    filtro: "booleano",
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
    chave: "pesoG",
    rotulo: "Peso",
    grupo: "Tamanho",
    tipo: "numero",
    unidade: "g",
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

/**
 * Redes e Wi-Fi: roteadores, repetidores, mesh e adaptadores.
 *
 * O nome do produto é o marketing da categoria. "AX3000" não é a velocidade
 * do aparelho: é a soma aritmética das duas bandas — 574 Mb/s em 2,4 GHz mais
 * 2.402 em 5 GHz. Nenhum aparelho entrega os dois ao mesmo tempo para o mesmo
 * dispositivo, e nenhum celular chega perto disso numa banda só.
 *
 * Por isso a velocidade nominal e as velocidades por banda são campos
 * separados: um é o que está no nome, os outros são o que o fabricante declara
 * na tabela. Quando a marca publica os três, a diferença fica à vista sem
 * precisar de explicação.
 */
export const camposRede: Campo[] = [
  {
    chave: "tipo",
    rotulo: "Tipo",
    grupo: "O que é",
    tipo: "texto",
    filtro: "opcoes",
    ajuda:
      "Roteador cria a rede, repetidor estende a que já existe e mesh troca a casa inteira por um sistema só.",
    contaTransparencia: true,
  },
  {
    chave: "padraoWifi",
    rotulo: "Padrão Wi-Fi",
    grupo: "Wi-Fi",
    tipo: "texto",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "bandas",
    rotulo: "Bandas",
    grupo: "Wi-Fi",
    tipo: "texto",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "velocidadeNominalMbps",
    rotulo: "Velocidade do nome",
    grupo: "Wi-Fi",
    tipo: "numero",
    unidade: "Mb/s",
    melhor: "maior",
    filtro: "faixa",
    ajuda:
      "O número que aparece no nome do produto. É a soma das bandas, não o que chega em um aparelho.",
    contaTransparencia: true,
  },
  {
    chave: "velocidade24ghzMbps",
    rotulo: "Velocidade em 2,4 GHz",
    grupo: "Wi-Fi",
    tipo: "numero",
    unidade: "Mb/s",
    melhor: "maior",
    ajuda: "A banda que atravessa parede. É a mais lenta das duas, e a que você usa longe do roteador.",
    contaTransparencia: true,
  },
  {
    chave: "velocidade5ghzMbps",
    rotulo: "Velocidade em 5 GHz",
    grupo: "Wi-Fi",
    tipo: "numero",
    unidade: "Mb/s",
    melhor: "maior",
    ajuda: "A banda rápida, que perde força a cada parede. É o número que mais se aproxima do uso real perto do aparelho.",
    contaTransparencia: true,
  },
  {
    chave: "antenas",
    rotulo: "Antenas",
    grupo: "Wi-Fi",
    tipo: "texto",
    contaTransparencia: true,
  },
  {
    chave: "mumimo",
    rotulo: "MU-MIMO",
    grupo: "Wi-Fi",
    tipo: "booleano",
    filtro: "booleano",
    ajuda: "Atende vários aparelhos ao mesmo tempo em vez de alternar entre eles.",
    contaTransparencia: true,
  },
  {
    chave: "mesh",
    rotulo: "Forma malha (mesh)",
    grupo: "Wi-Fi",
    tipo: "booleano",
    filtro: "booleano",
    contaTransparencia: true,
  },
  {
    chave: "portasLan",
    rotulo: "Portas LAN",
    grupo: "Portas",
    tipo: "numero",
    melhor: "maior",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "portaGigabit",
    rotulo: "Portas gigabit",
    grupo: "Portas",
    tipo: "booleano",
    filtro: "booleano",
    ajuda:
      "Porta de 100 Mb/s limita a internet contratada antes do Wi-Fi limitar. Em plano de 300 Mega, é o gargalo.",
    contaTransparencia: true,
  },
  {
    chave: "coberturaM2",
    rotulo: "Cobertura declarada",
    grupo: "Alcance",
    tipo: "numero",
    unidade: "m²",
    melhor: "maior",
    filtro: "faixa",
    ajuda:
      "Número do fabricante, medido em campo aberto ou em planta ideal. Parede de alvenaria derruba muito.",
    contaTransparencia: true,
  },
  {
    chave: "dispositivosSimultaneos",
    rotulo: "Aparelhos simultâneos declarados",
    grupo: "Alcance",
    tipo: "numero",
    melhor: "maior",
    contaTransparencia: true,
  },
  {
    chave: "dimensoesMm",
    rotulo: "Dimensões",
    grupo: "Instalação",
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
 * Periféricos: mouses, teclados e combos.
 *
 * Duas coisas definem a ficha aqui, e as duas são promessa de fabricante sem
 * condição declarada.
 *
 * O DPI é o teto do sensor, não a sensibilidade que alguém usa: 8.000 DPI num
 * mouse de escritório é número de caixa. E a duração de pilha — "até 18 meses",
 * "até 2 anos" — vem de um uso diário que a marca raramente escreve qual é.
 * Por isso os dois campos existem, e por isso o texto ao lado deles diz que
 * são declarações, não medições.
 *
 * Mousepad não entra na categoria: ocupa um terço do ranking e não tem
 * praticamente nenhum campo comparável além de tamanho.
 */
export const camposPeriferico: Campo[] = [
  {
    chave: "tipo",
    rotulo: "Tipo",
    grupo: "O que é",
    tipo: "texto",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "conexao",
    rotulo: "Conexão",
    grupo: "O que é",
    tipo: "texto",
    filtro: "opcoes",
    ajuda:
      "Receptor USB ocupa uma porta e some se você perder. Bluetooth não ocupa porta, mas depende do computador ter.",
    contaTransparencia: true,
  },
  {
    chave: "dpiMax",
    rotulo: "DPI máximo declarado",
    grupo: "Mouse",
    tipo: "numero",
    unidade: "DPI",
    melhor: "maior",
    filtro: "faixa",
    ajuda:
      "O teto do sensor, não a sensibilidade de uso. Acima de 3.000 o ponteiro atravessa a tela num movimento de pulso — o número serve para a caixa, não para o dia a dia.",
    contaTransparencia: true,
  },
  {
    chave: "sensor",
    rotulo: "Sensor",
    grupo: "Mouse",
    tipo: "texto",
    contaTransparencia: true,
  },
  {
    chave: "botoes",
    rotulo: "Botões",
    grupo: "Mouse",
    tipo: "numero",
    melhor: "maior",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "layout",
    rotulo: "Layout",
    grupo: "Teclado",
    tipo: "texto",
    filtro: "opcoes",
    ajuda: "ABNT2 tem a tecla Ç e o layout brasileiro; US internacional, não.",
    contaTransparencia: true,
  },
  {
    chave: "tipoTecla",
    rotulo: "Tipo de tecla",
    grupo: "Teclado",
    tipo: "texto",
    filtro: "opcoes",
    ajuda: "Membrana é silenciosa e barata; tesoura tem curso curto; mecânica dura mais e faz barulho.",
    contaTransparencia: true,
  },
  {
    chave: "tecladoNumerico",
    rotulo: "Teclado numérico",
    grupo: "Teclado",
    tipo: "booleano",
    filtro: "booleano",
    contaTransparencia: true,
  },
  {
    chave: "alimentacao",
    rotulo: "Alimentação",
    grupo: "Energia",
    tipo: "texto",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "duracaoPilhaMeses",
    rotulo: "Duração de pilha declarada",
    grupo: "Energia",
    tipo: "numero",
    unidade: "meses",
    melhor: "maior",
    filtro: "faixa",
    ajuda:
      "Promessa do fabricante, quase sempre sem dizer quantas horas por dia de uso ela supõe. Serve para comparar marcas, não para prever a sua gaveta.",
    contaTransparencia: true,
  },
  {
    chave: "alcanceM",
    rotulo: "Alcance sem fio declarado",
    grupo: "Energia",
    tipo: "numero",
    unidade: "m",
    melhor: "maior",
    contaTransparencia: true,
  },
  {
    chave: "pesoG",
    rotulo: "Peso",
    grupo: "Tamanho",
    tipo: "numero",
    unidade: "g",
    melhor: "menor",
    filtro: "faixa",
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
 * Casa conectada: tomadas, lâmpadas e câmeras.
 *
 * Esta é a única categoria da base em que o produto pode parar de funcionar
 * sem quebrar. Tomada inteligente, lâmpada e câmera dependem do servidor do
 * fabricante: se a empresa desliga a nuvem, encerra o aplicativo ou some do
 * Brasil, o aparelho vira plástico — e isso não aparece em ficha nenhuma.
 *
 * Por isso `funcionaSemNuvem` existe, e por isso ele quase sempre vai estar em
 * branco. Um campo vazio aqui não é desleixo da ficha: é a resposta.
 *
 * `appProprio` e `assistentes` são campos separados de propósito. Compatível
 * com Alexa não quer dizer que dispense o aplicativo da marca — quase sempre é
 * preciso instalar os dois, e é isso que o leitor quer saber antes de comprar.
 */
export const camposCasaConectada: Campo[] = [
  {
    chave: "tipo",
    rotulo: "Tipo",
    grupo: "O que é",
    tipo: "texto",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "conexao",
    rotulo: "Conexão",
    grupo: "O que é",
    tipo: "texto",
    filtro: "opcoes",
    ajuda:
      "Quase tudo aqui é Wi-Fi de 2,4 GHz só. Se o seu roteador estiver em 5 GHz separado, o aparelho não enxerga a rede.",
    contaTransparencia: true,
  },
  {
    chave: "appProprio",
    rotulo: "Aplicativo do fabricante",
    grupo: "Quem controla",
    tipo: "texto",
    filtro: "opcoes",
    ajuda: "O aplicativo que você precisa instalar para configurar, mesmo que depois use por voz.",
    contaTransparencia: true,
  },
  {
    chave: "assistentes",
    rotulo: "Assistentes compatíveis",
    grupo: "Quem controla",
    tipo: "texto",
    contaTransparencia: true,
  },
  {
    chave: "funcionaSemNuvem",
    rotulo: "Funciona sem a nuvem do fabricante",
    grupo: "Quem controla",
    tipo: "booleano",
    filtro: "booleano",
    ajuda:
      "Se a empresa desligar o servidor, o aparelho continua ligando e desligando? É o dado que decide o que você leva para casa — e quase ninguém publica.",
    contaTransparencia: true,
  },
  {
    chave: "cargaMaxW",
    rotulo: "Carga máxima",
    grupo: "Tomada",
    tipo: "numero",
    unidade: "W",
    melhor: "maior",
    filtro: "faixa",
    ajuda: "O limite do que dá para ligar nela. Chuveiro e ar-condicionado passam de qualquer tomada inteligente comum.",
    contaTransparencia: true,
  },
  {
    chave: "medeConsumo",
    rotulo: "Mede consumo",
    grupo: "Tomada",
    tipo: "booleano",
    filtro: "booleano",
    contaTransparencia: true,
  },
  {
    chave: "fluxoLumens",
    rotulo: "Fluxo luminoso",
    grupo: "Lâmpada",
    tipo: "numero",
    unidade: "lm",
    melhor: "maior",
    filtro: "faixa",
    ajuda: "O que realmente mede o quanto ilumina. Watt mede consumo, não luz.",
    contaTransparencia: true,
  },
  {
    chave: "temperaturaCorK",
    rotulo: "Temperatura de cor",
    grupo: "Lâmpada",
    tipo: "texto",
    contaTransparencia: true,
  },
  {
    chave: "corRgb",
    rotulo: "Muda de cor",
    grupo: "Lâmpada",
    tipo: "booleano",
    filtro: "booleano",
    contaTransparencia: true,
  },
  {
    chave: "resolucaoVideo",
    rotulo: "Resolução de vídeo",
    grupo: "Câmera",
    tipo: "texto",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "visaoNoturnaM",
    rotulo: "Visão noturna declarada",
    grupo: "Câmera",
    tipo: "numero",
    unidade: "m",
    melhor: "maior",
    contaTransparencia: true,
  },
  {
    chave: "armazenamentoVideo",
    rotulo: "Onde grava",
    grupo: "Câmera",
    tipo: "texto",
    ajuda:
      "Cartão de memória é seu; nuvem costuma ser assinatura, e o plano gratuito guarda poucos dias.",
    contaTransparencia: true,
  },
  {
    chave: "protecaoIp",
    rotulo: "Proteção contra água e poeira",
    grupo: "Instalação",
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
 * Sanduicheiras e grills.
 *
 * O ângulo: a única pergunta de quem compra é quantos sanduíches cabem de uma
 * vez, e quase nenhuma marca responde. A caixa publica a potência, que é o
 * número que menos diz — 750 W e 1.000 W fazem o mesmo sanduíche, em tempos
 * parecidos, e nenhuma marca declara o tempo.
 *
 * As três famílias de fabricante documentam metades diferentes: Britânia e
 * Philco publicam quantidade por vez e trava de fechamento e calam as medidas;
 * Mondial publica luz, bandeja e controle de temperatura e cala as medidas;
 * Cadence e Oster publicam medidas e consumo e calam todo o resto. Colocar as
 * três no mesmo quadro é o que a categoria faz de útil.
 */
export const camposSanduicheira: Campo[] = [
  {
    chave: "tipo",
    rotulo: "Tipo",
    grupo: "O que é",
    tipo: "texto",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "sanduichesPorVez",
    rotulo: "Sanduíches por vez",
    grupo: "O que é",
    tipo: "numero",
    melhor: "maior",
    filtro: "faixa",
    ajuda:
      "A pergunta que se faz na loja, e a que menos aparece na ficha. Quando está em branco aqui, é porque o fabricante não publica — não porque não coube.",
    contaTransparencia: true,
  },
  {
    chave: "abertura180",
    rotulo: "Abre 180°",
    grupo: "O que é",
    tipo: "booleano",
    filtro: "booleano",
    ajuda:
      "Aberta em 180 graus, a sanduicheira vira uma chapa de mesa com o dobro da área. Sem isso, ela só prensa.",
    contaTransparencia: true,
  },
  {
    chave: "tipoChapa",
    rotulo: "Tipo de chapa",
    grupo: "Chapa",
    tipo: "texto",
    filtro: "opcoes",
    ajuda: "Lisa marca menos e serve para tudo; ondulada faz a listra do grill.",
    contaTransparencia: true,
  },
  {
    chave: "revestimento",
    rotulo: "Revestimento",
    grupo: "Chapa",
    tipo: "texto",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "potenciaW",
    rotulo: "Potência",
    grupo: "Energia",
    tipo: "numero",
    unidade: "W",
    melhor: "maior",
    filtro: "faixa",
    ajuda:
      "O número da caixa. Aquece mais rápido, não assa diferente — e nenhuma marca desta lista publica o tempo de preparo.",
    contaTransparencia: true,
  },
  {
    chave: "consumoKwh",
    rotulo: "Consumo",
    grupo: "Energia",
    tipo: "numero",
    unidade: "kWh",
    melhor: "menor",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "controleTemperatura",
    rotulo: "Controle de temperatura",
    grupo: "Uso",
    tipo: "booleano",
    filtro: "booleano",
    contaTransparencia: true,
  },
  {
    chave: "luzIndicadora",
    rotulo: "Luz indicadora",
    grupo: "Uso",
    tipo: "booleano",
    filtro: "booleano",
    contaTransparencia: true,
  },
  {
    chave: "bandejaColetora",
    rotulo: "Bandeja coletora",
    grupo: "Uso",
    tipo: "booleano",
    filtro: "booleano",
    ajuda: "Recolhe a gordura que escorre da chapa. Sem ela, escorre na bancada.",
    contaTransparencia: true,
  },
  {
    chave: "travaFechamento",
    rotulo: "Trava de fechamento",
    grupo: "Uso",
    tipo: "booleano",
    filtro: "booleano",
    ajuda: "Prende a tampa fechada para guardar em pé, ocupando menos armário.",
    contaTransparencia: true,
  },
  {
    chave: "comprimentoCaboM",
    rotulo: "Comprimento do cabo",
    grupo: "Uso",
    tipo: "numero",
    unidade: "m",
    melhor: "maior",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "tensao",
    rotulo: "Tensão",
    grupo: "Ficha",
    tipo: "texto",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "pesoKg",
    rotulo: "Peso",
    grupo: "Ficha",
    tipo: "numero",
    unidade: "kg",
    melhor: "menor",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "dimensoesMm",
    rotulo: "Dimensões",
    grupo: "Ficha",
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
 * Micro-ondas.
 *
 * Dois ângulos, e os dois saem da própria documentação das marcas.
 *
 * O primeiro é o mesmo das airfryers: **os litros do anúncio não são os litros
 * que você usa**. A Panasonic publica volume total e volume útil separados — 21
 * viram 11, 27 viram 18, 34 viram 23. Nenhuma outra marca da categoria publica
 * o útil, e o número que vai na caixa é sempre o total.
 *
 * O segundo é a potência. Cada marca publica um número em watts e **nenhuma diz
 * de que grandeza ele é**: o que a tomada consome ou o que chega ao alimento.
 * A Panasonic é a única cuja estrutura de ficha responde — o campo dela vem num
 * conjunto com "Potência Grill" e "Potência Convecção", que são potências de
 * cozimento. As outras publicam um número só, entre 1.100 e 1.650 W, faixa
 * típica de consumo. Por isso um 21 L declara 700 W e um 20 L declara 1.100 W
 * na mesma tabela: não estão medindo a mesma coisa, e o texto de ajuda avisa.
 */
export const camposMicroondas: Campo[] = [
  {
    chave: "tipoInstalacao",
    rotulo: "Instalação",
    grupo: "O que é",
    tipo: "texto",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "capacidadeTotalL",
    rotulo: "Capacidade da caixa",
    grupo: "Capacidade",
    tipo: "numero",
    unidade: "L",
    melhor: "maior",
    filtro: "faixa",
    ajuda: "O número do anúncio. Mede a cavidade inteira, inclusive o que o prato giratório não alcança.",
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
      "O que dá para usar de verdade. Uma única marca desta categoria publica: nela, 21 L de caixa viram 11 L úteis. Campo vazio aqui significa que o fabricante só publica o total.",
    contaTransparencia: true,
  },
  {
    chave: "potenciaW",
    rotulo: "Potência declarada",
    grupo: "Cozimento",
    tipo: "numero",
    unidade: "W",
    melhor: "maior",
    filtro: "faixa",
    ajuda:
      "Compare com cuidado: as marcas publicam um número em watts sem dizer se é o que a tomada consome ou o que chega ao alimento — grandezas que diferem quase pelo dobro. Nesta coluna convivem as duas leituras.",
    contaTransparencia: true,
  },
  {
    chave: "niveisPotencia",
    rotulo: "Níveis de potência",
    grupo: "Cozimento",
    tipo: "numero",
    melhor: "maior",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "grill",
    rotulo: "Grill",
    grupo: "Cozimento",
    tipo: "booleano",
    filtro: "booleano",
    contaTransparencia: true,
  },
  {
    chave: "receitasPreProgramadas",
    rotulo: "Receitas pré-programadas",
    grupo: "Cozimento",
    tipo: "numero",
    melhor: "maior",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "diametroPratoCm",
    rotulo: "Diâmetro do prato",
    grupo: "Cozimento",
    tipo: "numero",
    unidade: "cm",
    melhor: "maior",
    filtro: "faixa",
    ajuda: "O que decide se o seu prato de jantar entra e gira.",
    contaTransparencia: true,
  },
  {
    chave: "painel",
    rotulo: "Painel",
    grupo: "Uso",
    tipo: "texto",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "travaSeguranca",
    rotulo: "Trava de segurança",
    grupo: "Uso",
    tipo: "booleano",
    filtro: "booleano",
    contaTransparencia: true,
  },
  {
    chave: "classificacaoEnergetica",
    rotulo: "Classificação energética",
    grupo: "Uso",
    tipo: "texto",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "tensao",
    rotulo: "Tensão",
    grupo: "Ficha",
    tipo: "texto",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "pesoKg",
    rotulo: "Peso",
    grupo: "Ficha",
    tipo: "numero",
    unidade: "kg",
    melhor: "menor",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "dimensoesMm",
    rotulo: "Dimensões",
    grupo: "Ficha",
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
 * Geladeiras.
 *
 * O ângulo: **os litros do anúncio somam geladeira e freezer**. Uma "377 L"
 * tem 283 L de geladeira e 94 de freezer; uma "385 L" tem 291 e 94. Todas as
 * quatro marcas publicam a divisão, e nenhuma delas a coloca no nome do
 * produto — o nome leva sempre a soma.
 *
 * O segundo campo que separa as marcas é o consumo em kWh por mês, que aqui
 * vai de 13,1 a 31,3 entre produtos da mesma lista. É o número que decide o
 * custo de dez anos de uso e não aparece em nenhum anúncio.
 */
export const camposGeladeira: Campo[] = [
  {
    chave: "tipo",
    rotulo: "Tipo",
    grupo: "O que é",
    tipo: "texto",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "portas",
    rotulo: "Portas",
    grupo: "O que é",
    tipo: "numero",
    melhor: "maior",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "degelo",
    rotulo: "Degelo",
    grupo: "O que é",
    tipo: "texto",
    filtro: "opcoes",
    ajuda: "Frost Free não forma gelo e não precisa degelar; Cycle Defrost precisa.",
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
    ajuda: "O número que vai no nome do produto. É a soma dos dois compartimentos.",
    contaTransparencia: true,
  },
  {
    chave: "capacidadeGeladeiraL",
    rotulo: "Só a geladeira",
    grupo: "Capacidade",
    tipo: "numero",
    unidade: "L",
    melhor: "maior",
    filtro: "faixa",
    ajuda:
      "A parte que refrigera, sem o freezer. Numa de 377 L são 283 — e é este o número que decide se a compra da semana cabe.",
    contaTransparencia: true,
  },
  {
    chave: "capacidadeFreezerL",
    rotulo: "Só o freezer",
    grupo: "Capacidade",
    tipo: "numero",
    unidade: "L",
    melhor: "maior",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "consumoKwhMes",
    rotulo: "Consumo por mês",
    grupo: "Energia",
    tipo: "numero",
    unidade: "kWh",
    melhor: "menor",
    filtro: "faixa",
    ajuda:
      "O que a geladeira custa depois da compra. Entre os modelos desta lista a diferença passa de duas vezes, e não aparece em anúncio nenhum.",
    contaTransparencia: true,
  },
  {
    chave: "classificacaoEnergetica",
    rotulo: "Selo do Inmetro",
    grupo: "Energia",
    tipo: "texto",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "niveisTemperatura",
    rotulo: "Níveis de temperatura",
    grupo: "Uso",
    tipo: "numero",
    melhor: "maior",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "painel",
    rotulo: "Painel",
    grupo: "Uso",
    tipo: "texto",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "alarmePortaAberta",
    rotulo: "Alarme de porta aberta",
    grupo: "Uso",
    tipo: "booleano",
    filtro: "booleano",
    contaTransparencia: true,
  },
  {
    chave: "nivelRuidoDb",
    rotulo: "Ruído",
    grupo: "Uso",
    tipo: "numero",
    unidade: "dB",
    melhor: "menor",
    filtro: "faixa",
    ajuda: "Geladeira fica ligada a noite inteira. Uma única marca desta lista publica o ruído.",
    contaTransparencia: true,
  },
  {
    chave: "tensao",
    rotulo: "Tensão",
    grupo: "Ficha",
    tipo: "texto",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "pesoKg",
    rotulo: "Peso",
    grupo: "Ficha",
    tipo: "numero",
    unidade: "kg",
    melhor: "menor",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "dimensoesMm",
    rotulo: "Dimensões",
    grupo: "Ficha",
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
 * Máquinas de lavar de carga superior.
 *
 * O ângulo é o consumo de água por ciclo, que todas as marcas publicam e
 * nenhuma coloca no anúncio. Entre duas máquinas de 15 kg desta lista a
 * diferença é de 50 litros por lavagem — a Panasonic declara 110 L e a
 * Electrolux, 160. Em três lavagens por semana isso dá mais de 7.000 litros
 * por ano de diferença, no mesmo tamanho de roupa.
 *
 * O quilo do nome é sempre de roupa seca, e é a única medida que aparece na
 * frente da máquina.
 */
export const camposLavadora: Campo[] = [
  {
    chave: "tipo",
    rotulo: "Abertura",
    grupo: "O que é",
    tipo: "texto",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "capacidadeKg",
    rotulo: "Capacidade",
    grupo: "O que é",
    tipo: "numero",
    unidade: "kg",
    melhor: "maior",
    filtro: "faixa",
    ajuda: "Peso de roupa seca que cabe no cesto. É o número que vai no nome do produto.",
    contaTransparencia: true,
  },
  {
    chave: "consumoAguaL",
    rotulo: "Água por ciclo",
    grupo: "Consumo",
    tipo: "numero",
    unidade: "L",
    melhor: "menor",
    filtro: "faixa",
    ajuda:
      "O número que decide a conta de água e não aparece em anúncio nenhum. Entre duas máquinas do mesmo tamanho desta lista a diferença passa de 50 litros por lavagem.",
    contaTransparencia: true,
  },
  {
    chave: "consumoEnergiaKwh",
    rotulo: "Energia por ciclo",
    grupo: "Consumo",
    tipo: "numero",
    unidade: "kWh",
    melhor: "menor",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "classificacaoEnergetica",
    rotulo: "Selo do Inmetro",
    grupo: "Consumo",
    tipo: "texto",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "rotacaoRpm",
    rotulo: "Centrifugação",
    grupo: "Lavagem",
    tipo: "numero",
    unidade: "rpm",
    melhor: "maior",
    filtro: "faixa",
    ajuda: "Quanto mais alta, mais seca a roupa sai — e menos tempo no varal.",
    contaTransparencia: true,
  },
  {
    chave: "eficienciaCentrifugacao",
    rotulo: "Eficiência de centrifugação",
    grupo: "Lavagem",
    tipo: "texto",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "programas",
    rotulo: "Programas",
    grupo: "Lavagem",
    tipo: "numero",
    melhor: "maior",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "materialCesto",
    rotulo: "Material do cesto",
    grupo: "Lavagem",
    tipo: "texto",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "reaproveitamentoAgua",
    rotulo: "Reaproveita a água",
    grupo: "Lavagem",
    tipo: "booleano",
    filtro: "booleano",
    contaTransparencia: true,
  },
  {
    chave: "filtroFiapos",
    rotulo: "Filtro de fiapos",
    grupo: "Lavagem",
    tipo: "booleano",
    filtro: "booleano",
    contaTransparencia: true,
  },
  {
    chave: "painel",
    rotulo: "Painel",
    grupo: "Uso",
    tipo: "texto",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "tensao",
    rotulo: "Tensão",
    grupo: "Ficha",
    tipo: "texto",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "pesoKg",
    rotulo: "Peso",
    grupo: "Ficha",
    tipo: "numero",
    unidade: "kg",
    melhor: "menor",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "dimensoesMm",
    rotulo: "Dimensões",
    grupo: "Ficha",
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
 * Torradeiras.
 *
 * O número que todas publicam é o de níveis de tostagem — 6, 7 ou 8 — e
 * **nenhuma diz o que cada nível significa**: nem tempo, nem temperatura. Um
 * "nível 4" de uma marca não é o "nível 4" da outra, e a coluna serve para
 * mostrar isso, não para ordenar.
 *
 * O campo que responderia a pergunta de quem compra é a espessura de pão que
 * entra na fenda. Duas marcas publicam, e numa delas o valor é a frase
 * "Exemplo: 30mm" — o texto de amostra ficou na ficha publicada.
 */
export const camposTorradeira: Campo[] = [
  {
    chave: "niveisTostagem",
    rotulo: "Níveis de tostagem",
    grupo: "Tostagem",
    tipo: "numero",
    melhor: "maior",
    filtro: "faixa",
    ajuda:
      "Quantas posições o seletor tem. Nenhuma marca publica o tempo ou a temperatura de cada uma, então o nível 4 de uma não é o nível 4 da outra.",
    contaTransparencia: true,
  },
  {
    chave: "fatias",
    rotulo: "Fatias por vez",
    grupo: "Tostagem",
    tipo: "numero",
    melhor: "maior",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "espessuraPaoMm",
    rotulo: "Espessura de pão",
    grupo: "Tostagem",
    tipo: "numero",
    unidade: "mm",
    melhor: "maior",
    filtro: "faixa",
    ajuda:
      "A largura da fenda decide se o pão de padaria entra ou fica pela metade. Quase nenhuma ficha publica.",
    contaTransparencia: true,
  },
  {
    chave: "potenciaW",
    rotulo: "Potência",
    grupo: "Energia",
    tipo: "numero",
    unidade: "W",
    melhor: "maior",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "consumoKwh",
    rotulo: "Consumo",
    grupo: "Energia",
    tipo: "numero",
    unidade: "kWh",
    melhor: "menor",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "funcaoDescongelar",
    rotulo: "Descongelar",
    grupo: "Funções",
    tipo: "booleano",
    filtro: "booleano",
    contaTransparencia: true,
  },
  {
    chave: "funcaoReaquecer",
    rotulo: "Reaquecer",
    grupo: "Funções",
    tipo: "booleano",
    filtro: "booleano",
    contaTransparencia: true,
  },
  {
    chave: "funcaoCancelar",
    rotulo: "Cancelar",
    grupo: "Funções",
    tipo: "booleano",
    filtro: "booleano",
    ajuda: "Interrompe o ciclo e sobe o pão antes do tempo. Sem ela, só tirando da tomada.",
    contaTransparencia: true,
  },
  {
    chave: "desligamentoAutomatico",
    rotulo: "Desligamento automático",
    grupo: "Funções",
    tipo: "booleano",
    filtro: "booleano",
    contaTransparencia: true,
  },
  {
    chave: "bandejaRemovivel",
    rotulo: "Bandeja de migalhas",
    grupo: "Uso",
    tipo: "booleano",
    filtro: "booleano",
    contaTransparencia: true,
  },
  {
    chave: "guardaFio",
    rotulo: "Guarda-fio",
    grupo: "Uso",
    tipo: "booleano",
    filtro: "booleano",
    contaTransparencia: true,
  },
  {
    chave: "comprimentoCaboM",
    rotulo: "Comprimento do cabo",
    grupo: "Uso",
    tipo: "numero",
    unidade: "m",
    melhor: "maior",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "tensao",
    rotulo: "Tensão",
    grupo: "Ficha",
    tipo: "texto",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "pesoKg",
    rotulo: "Peso",
    grupo: "Ficha",
    tipo: "numero",
    unidade: "kg",
    melhor: "menor",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "dimensoesMm",
    rotulo: "Dimensões",
    grupo: "Ficha",
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
 * Chaleiras elétricas.
 *
 * Duas coisas que a categoria mostra e o anúncio não.
 *
 * A primeira: **a potência muda com a tomada**. O mesmo produto que declara
 * 1.200 W em 127 V declara 1.500 ou 1.850 W em 220 V, e seis das nove marcas
 * desta lista publicam os dois valores. O anúncio traz um número só — às vezes
 * o de 127, às vezes o de 220 — e a ficha aqui usa sempre o de 127 V, com os
 * dois escritos na fonte.
 *
 * A segunda: o número pelo qual se compra uma chaleira é **quanto tempo leva
 * para ferver**, e uma única marca da lista publica.
 */
export const camposChaleira: Campo[] = [
  {
    chave: "capacidadeL",
    rotulo: "Capacidade",
    grupo: "O que é",
    tipo: "numero",
    unidade: "L",
    melhor: "maior",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "material",
    rotulo: "Material da jarra",
    grupo: "O que é",
    tipo: "texto",
    filtro: "opcoes",
    ajuda: "Inox, vidro ou plástico. Alguns modelos anunciados como inox têm só o acabamento externo.",
    contaTransparencia: true,
  },
  {
    chave: "potenciaW",
    rotulo: "Potência em 127 V",
    grupo: "Aquecimento",
    tipo: "numero",
    unidade: "W",
    melhor: "maior",
    filtro: "faixa",
    ajuda:
      "A mesma chaleira costuma ter duas potências, uma por tensão. Esta coluna traz sempre a de 127 V; a de 220 V está na fonte de cada ficha.",
    contaTransparencia: true,
  },
  {
    chave: "tempoFervuraMin",
    rotulo: "Tempo para ferver",
    grupo: "Aquecimento",
    tipo: "texto",
    ajuda:
      "O motivo pelo qual se compra uma chaleira elétrica. Uma única marca desta lista publica — as outras deixam a conta por conta da potência.",
    contaTransparencia: true,
  },
  {
    chave: "controleTemperatura",
    rotulo: "Controle de temperatura",
    grupo: "Aquecimento",
    tipo: "booleano",
    filtro: "booleano",
    contaTransparencia: true,
  },
  {
    chave: "manterAquecido",
    rotulo: "Manter aquecido",
    grupo: "Aquecimento",
    tipo: "booleano",
    filtro: "booleano",
    contaTransparencia: true,
  },
  {
    chave: "desligamentoAutomatico",
    rotulo: "Desligamento automático",
    grupo: "Segurança",
    tipo: "booleano",
    filtro: "booleano",
    contaTransparencia: true,
  },
  {
    chave: "protecaoSemAgua",
    rotulo: "Proteção contra ferver sem água",
    grupo: "Segurança",
    tipo: "booleano",
    filtro: "booleano",
    ajuda:
      "Desliga se a jarra for ligada vazia. É a proteção que evita o acidente, e quase nenhuma ficha declara — diferente do desligamento automático, que todo anúncio estampa.",
    contaTransparencia: true,
  },
  {
    chave: "baseGiratoria",
    rotulo: "Base giratória 360°",
    grupo: "Uso",
    tipo: "booleano",
    filtro: "booleano",
    contaTransparencia: true,
  },
  {
    chave: "visorNivel",
    rotulo: "Visor de nível",
    grupo: "Uso",
    tipo: "booleano",
    filtro: "booleano",
    contaTransparencia: true,
  },
  {
    chave: "filtro",
    rotulo: "Filtro",
    grupo: "Uso",
    tipo: "booleano",
    filtro: "booleano",
    contaTransparencia: true,
  },
  {
    chave: "comprimentoCaboM",
    rotulo: "Comprimento do cabo",
    grupo: "Uso",
    tipo: "numero",
    unidade: "m",
    melhor: "maior",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "tensao",
    rotulo: "Tensão",
    grupo: "Ficha",
    tipo: "texto",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "pesoKg",
    rotulo: "Peso",
    grupo: "Ficha",
    tipo: "numero",
    unidade: "kg",
    melhor: "menor",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "dimensoesMm",
    rotulo: "Dimensões",
    grupo: "Ficha",
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
 * Espremedores de frutas cítricas.
 *
 * A potência vai de 30 a 260 W nesta lista — oito vezes de diferença para a
 * mesma laranja —, e nenhuma marca diz o que os watts a mais compram. O que
 * muda o resultado é outra coisa: **rotação alternada**, que gira o cone nos
 * dois sentidos e solta mais suco da mesma metade, e o **número de cones**,
 * que decide se o limão e a laranja usam o mesmo bico.
 *
 * Os dois campos existem em metade das fichas. A potência existe em todas.
 */
export const camposEspremedor: Campo[] = [
  {
    chave: "capacidadeJarraL",
    rotulo: "Capacidade da jarra",
    grupo: "O que é",
    tipo: "numero",
    unidade: "L",
    melhor: "maior",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "cones",
    rotulo: "Cones",
    grupo: "Extração",
    tipo: "numero",
    melhor: "maior",
    filtro: "faixa",
    ajuda: "Dois cones significam um bico para limão e outro para laranja. Um cone serve os dois de qualquer jeito.",
    contaTransparencia: true,
  },
  {
    chave: "rotacaoAlternada",
    rotulo: "Rotação alternada",
    grupo: "Extração",
    tipo: "booleano",
    filtro: "booleano",
    ajuda:
      "O cone gira nos dois sentidos e solta mais suco da mesma metade. É o campo que muda o resultado, e metade das fichas não publica.",
    contaTransparencia: true,
  },
  {
    chave: "potenciaW",
    rotulo: "Potência",
    grupo: "Extração",
    tipo: "numero",
    unidade: "W",
    melhor: "maior",
    filtro: "faixa",
    ajuda:
      "Vai de 30 a 260 W nesta lista, para a mesma fruta. Nenhuma marca declara o que os watts a mais entregam.",
    contaTransparencia: true,
  },
  {
    chave: "acionamento",
    rotulo: "Acionamento",
    grupo: "Extração",
    tipo: "texto",
    filtro: "opcoes",
    ajuda: "Por pressão liga ao encostar a fruta; por botão exige a outra mão.",
    contaTransparencia: true,
  },
  {
    chave: "controlePolpa",
    rotulo: "Regulagem de polpa",
    grupo: "Extração",
    tipo: "booleano",
    filtro: "booleano",
    contaTransparencia: true,
  },
  {
    chave: "jarraRemovivel",
    rotulo: "Jarra removível",
    grupo: "Uso",
    tipo: "booleano",
    filtro: "booleano",
    contaTransparencia: true,
  },
  {
    chave: "indicadorCapacidade",
    rotulo: "Indicador de nível",
    grupo: "Uso",
    tipo: "booleano",
    filtro: "booleano",
    contaTransparencia: true,
  },
  {
    chave: "lavaLoucas",
    rotulo: "Vai à lava-louças",
    grupo: "Uso",
    tipo: "booleano",
    filtro: "booleano",
    contaTransparencia: true,
  },
  {
    chave: "material",
    rotulo: "Material",
    grupo: "Uso",
    tipo: "texto",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "comprimentoCaboM",
    rotulo: "Comprimento do cabo",
    grupo: "Uso",
    tipo: "numero",
    unidade: "m",
    melhor: "maior",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "tensao",
    rotulo: "Tensão",
    grupo: "Ficha",
    tipo: "texto",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "pesoKg",
    rotulo: "Peso",
    grupo: "Ficha",
    tipo: "numero",
    unidade: "kg",
    melhor: "menor",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "dimensoesMm",
    rotulo: "Dimensões",
    grupo: "Ficha",
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
 * Lava-louças.
 *
 * A máquina é vendida como economia de água, e **nenhuma ficha desta categoria
 * publica os dois consumos**. A Electrolux publica litros por ciclo e cala o
 * kWh; a Brastemp publica kWh e cala os litros; a Philco não publica nenhum dos
 * dois. Quem quer comparar o custo de usar precisa de um número que cada marca
 * escolheu não dar.
 *
 * A unidade da categoria é o "serviço" — o conjunto de louça de uma pessoa
 * numa refeição, definido por norma. Todas publicam, e nenhuma explica.
 */
export const camposLavaLouca: Campo[] = [
  {
    chave: "servicos",
    rotulo: "Serviços",
    grupo: "O que é",
    tipo: "numero",
    melhor: "maior",
    filtro: "faixa",
    ajuda:
      "Um serviço é o conjunto de louça de uma pessoa numa refeição — prato, prato fundo, sobremesa, xícara, copo e talheres. A conta é de norma, e nenhuma marca explica na ficha.",
    contaTransparencia: true,
  },
  {
    chave: "tipoInstalacao",
    rotulo: "Instalação",
    grupo: "O que é",
    tipo: "texto",
    filtro: "opcoes",
    ajuda: "De bancada cabe em cima da pia; de piso ocupa um vão e precisa de ponto de água.",
    contaTransparencia: true,
  },
  {
    chave: "consumoAguaL",
    rotulo: "Água por ciclo",
    grupo: "Consumo",
    tipo: "numero",
    unidade: "L",
    melhor: "menor",
    filtro: "faixa",
    ajuda:
      "O número que justifica a compra — e que só uma das três marcas desta lista publica. Lavar a mesma louça na pia passa de 100 litros.",
    contaTransparencia: true,
  },
  {
    chave: "consumoEnergiaKwh",
    rotulo: "Energia por ciclo",
    grupo: "Consumo",
    tipo: "numero",
    unidade: "kWh",
    melhor: "menor",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "classificacaoEnergetica",
    rotulo: "Selo do Inmetro",
    grupo: "Consumo",
    tipo: "texto",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "programas",
    rotulo: "Programas",
    grupo: "Lavagem",
    tipo: "numero",
    melhor: "maior",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "temperaturaMaxC",
    rotulo: "Temperatura da água",
    grupo: "Lavagem",
    tipo: "numero",
    unidade: "°C",
    melhor: "maior",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "cestoTalheres",
    rotulo: "Cesto para talheres",
    grupo: "Lavagem",
    tipo: "booleano",
    filtro: "booleano",
    contaTransparencia: true,
  },
  {
    chave: "travaPainel",
    rotulo: "Trava do painel",
    grupo: "Uso",
    tipo: "booleano",
    filtro: "booleano",
    ajuda: "Bloqueia os botões contra criança curiosa no meio do ciclo.",
    contaTransparencia: true,
  },
  {
    chave: "painel",
    rotulo: "Painel",
    grupo: "Uso",
    tipo: "texto",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "tensao",
    rotulo: "Tensão",
    grupo: "Ficha",
    tipo: "texto",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "pesoKg",
    rotulo: "Peso",
    grupo: "Ficha",
    tipo: "numero",
    unidade: "kg",
    melhor: "menor",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "dimensoesMm",
    rotulo: "Dimensões",
    grupo: "Ficha",
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
 * Smartwatches e pulseiras inteligentes.
 *
 * O número que decide a compra é a autonomia, e **"até 25 dias" só quer dizer
 * alguma coisa quando a marca diz em que uso**. As três marcas desta lista
 * publicam regimes diferentes:
 *
 * - a Amazfit publica até cinco — uso típico, uso intenso, modo always-on,
 *   GPS contínuo e GPS com música;
 * - a Huawei publica três — máximo, uso típico e always-on ligado;
 * - a Xiaomi publica um, o típico, e pronto.
 *
 * Por isso a ficha tem duas colunas de autonomia em vez de uma. A diferença
 * entre elas, quando existe, costuma ser de metade: 25 dias viram 13.
 */
export const camposSmartwatch: Campo[] = [
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
    chave: "tipoTela",
    rotulo: "Tipo de tela",
    grupo: "Tela",
    tipo: "texto",
    filtro: "opcoes",
    ajuda: "AMOLED acende pixel a pixel e fica preto de verdade; LCD tem fundo iluminado.",
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
    chave: "ppi",
    rotulo: "Densidade",
    grupo: "Tela",
    tipo: "numero",
    unidade: "ppi",
    melhor: "maior",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "brilhoNits",
    rotulo: "Brilho máximo",
    grupo: "Tela",
    tipo: "numero",
    unidade: "nits",
    melhor: "maior",
    filtro: "faixa",
    ajuda: "O que decide se dá para ler o relógio no sol.",
    contaTransparencia: true,
  },
  {
    chave: "bateriaMah",
    rotulo: "Bateria",
    grupo: "Autonomia",
    tipo: "numero",
    unidade: "mAh",
    melhor: "maior",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "autonomiaTipicaDias",
    rotulo: "Autonomia em uso típico",
    grupo: "Autonomia",
    tipo: "numero",
    unidade: "dias",
    melhor: "maior",
    filtro: "faixa",
    ajuda: "O número do anúncio. Nenhuma marca define o que é uso típico.",
    contaTransparencia: true,
  },
  {
    chave: "autonomiaIntensaDias",
    rotulo: "Autonomia em uso intenso",
    grupo: "Autonomia",
    tipo: "numero",
    unidade: "dias",
    melhor: "maior",
    filtro: "faixa",
    ajuda:
      "Com tela sempre ligada, treino e GPS. Quando a marca publica os dois números, o segundo costuma ser metade do primeiro — e a maioria publica só o primeiro.",
    contaTransparencia: true,
  },
  {
    chave: "resistenciaAgua",
    rotulo: "Resistência à água",
    grupo: "Corpo",
    tipo: "texto",
    filtro: "opcoes",
    ajuda: "5 ATM aguenta piscina; 10 ATM, mergulho raso — e só com certificação declarada.",
    contaTransparencia: true,
  },
  {
    chave: "altoFalante",
    rotulo: "Alto-falante",
    grupo: "Corpo",
    tipo: "booleano",
    filtro: "booleano",
    ajuda: "Sem ele, a chamada no pulso não existe.",
    contaTransparencia: true,
  },
  {
    chave: "gps",
    rotulo: "GPS",
    grupo: "Corpo",
    tipo: "texto",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "pesoG",
    rotulo: "Peso sem pulseira",
    grupo: "Corpo",
    tipo: "numero",
    unidade: "g",
    melhor: "menor",
    filtro: "faixa",
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
    chave: "compatibilidade",
    rotulo: "Compatibilidade",
    grupo: "Ficha",
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
 * Ventiladores.
 *
 * O "50 cm" do anúncio **é a grade, não a hélice**. Duas marcas desta lista
 * publicam as duas medidas em campos separados — WAP e Mallory — e nas duas o
 * produto vendido como 50 cm tem hélice de 40. As outras publicam um número só,
 * no nome do produto, sem dizer qual dos dois ele é: por isso a coluna se chama
 * "diâmetro declarado" e existe uma segunda coluna só para a hélice.
 *
 * O segundo buraco é a **vazão**. É o número que diz quanto ar sai de verdade,
 * e uma marca em cinco publica. O resto oferece watts, que medem o que entra
 * pela tomada, e contagem de pás, que não se compara entre desenhos diferentes.
 */
export const camposVentilador: Campo[] = [
  {
    chave: "tipo",
    rotulo: "Tipo",
    grupo: "O que é",
    tipo: "texto",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "diametroDeclaradoCm",
    rotulo: "Diâmetro declarado",
    grupo: "Hélice",
    tipo: "numero",
    unidade: "cm",
    melhor: "maior",
    filtro: "faixa",
    ajuda:
      "O número que a marca publica — e a maioria não diz se é da grade ou da hélice. Onde as duas medidas existem, a diferença é de 10 cm.",
    contaTransparencia: true,
  },
  {
    chave: "diametroHeliceCm",
    rotulo: "Diâmetro da hélice",
    grupo: "Hélice",
    tipo: "numero",
    unidade: "cm",
    melhor: "maior",
    filtro: "faixa",
    ajuda: "A medida que move ar. Num ventilador anunciado como 50 cm, costuma ser 40.",
    contaTransparencia: true,
  },
  {
    chave: "pas",
    rotulo: "Pás",
    grupo: "Hélice",
    tipo: "numero",
    melhor: "maior",
    filtro: "faixa",
    ajuda: "Mais pás não significa mais vento: o desenho e o ângulo mudam tudo, e nenhuma marca publica isso.",
    contaTransparencia: true,
  },
  {
    chave: "vazaoM3s",
    rotulo: "Vazão de ar",
    grupo: "Desempenho",
    tipo: "numero",
    unidade: "m³/s",
    melhor: "maior",
    filtro: "faixa",
    ajuda:
      "Quanto ar o ventilador move. É o único número que compara desenhos diferentes, e uma marca em cinco publica.",
    contaTransparencia: true,
  },
  {
    chave: "potenciaW",
    rotulo: "Potência",
    grupo: "Desempenho",
    tipo: "numero",
    unidade: "W",
    melhor: "maior",
    filtro: "faixa",
    ajuda: "Mede o que entra pela tomada, não o que sai de vento.",
    contaTransparencia: true,
  },
  {
    chave: "consumoKwhMes",
    rotulo: "Consumo por mês",
    grupo: "Desempenho",
    tipo: "numero",
    unidade: "kWh",
    melhor: "menor",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "velocidades",
    rotulo: "Velocidades",
    grupo: "Uso",
    tipo: "numero",
    melhor: "maior",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "oscilante",
    rotulo: "Oscilante",
    grupo: "Uso",
    tipo: "booleano",
    filtro: "booleano",
    contaTransparencia: true,
  },
  {
    chave: "controleRemoto",
    rotulo: "Controle remoto",
    grupo: "Uso",
    tipo: "booleano",
    filtro: "booleano",
    contaTransparencia: true,
  },
  {
    chave: "alturaAjustavel",
    rotulo: "Altura ajustável",
    grupo: "Uso",
    tipo: "booleano",
    filtro: "booleano",
    contaTransparencia: true,
  },
  {
    chave: "comprimentoCaboM",
    rotulo: "Comprimento do cabo",
    grupo: "Uso",
    tipo: "numero",
    unidade: "m",
    melhor: "maior",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "tensao",
    rotulo: "Tensão",
    grupo: "Ficha",
    tipo: "texto",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "pesoKg",
    rotulo: "Peso",
    grupo: "Ficha",
    tipo: "numero",
    unidade: "kg",
    melhor: "menor",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "dimensoesMm",
    rotulo: "Dimensões",
    grupo: "Ficha",
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

/** Cada categoria traz o seu próprio conjunto de campos comparáveis. */
/**
 * Ferro de passar. O anúncio vende watt — e watt é o que esquenta a chapa,
 * não o que sai dela. Quem passa sente vapor: quantos gramas por minuto, por
 * quantos furos, alimentados por qual reservatório. Duas marcas em cinco
 * publicam a vazão; as outras três deixam o comprador com a potência e a cor.
 */
export const camposFerroDePassar: Campo[] = [
  {
    chave: "tipo",
    rotulo: "Tipo",
    grupo: "O que é",
    tipo: "texto",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "materialBase",
    rotulo: "Material da base",
    grupo: "O que é",
    tipo: "texto",
    filtro: "opcoes",
    ajuda:
      "Antiaderente, cerâmica ou uma liga com nome próprio — Durilium, Glissium, Resilium. O nome comercial é da marca; não diz do que a chapa é feita nem como desliza.",
    contaTransparencia: true,
  },
  {
    chave: "saidasVapor",
    rotulo: "Saídas de vapor",
    grupo: "Vapor",
    tipo: "numero",
    melhor: "maior",
    filtro: "faixa",
    ajuda:
      "Quantos furos a base tem. Entre os que publicam, vai de 19 a 400 — e furo a mais não significa vapor a mais: dois ferros aqui têm a mesma vazão com o dobro de furos.",
    contaTransparencia: true,
  },
  {
    chave: "vazaoContinuaGMin",
    rotulo: "Vapor contínuo",
    grupo: "Vapor",
    tipo: "numero",
    unidade: "g/min",
    melhor: "maior",
    filtro: "faixa",
    ajuda:
      "Quanto vapor sai por minuto enquanto se passa. É o número que diz se o ferro dá conta do linho, e é o que quase nenhuma marca publica.",
    contaTransparencia: true,
  },
  {
    chave: "vazaoExtraGMin",
    rotulo: "Jato de vapor",
    grupo: "Vapor",
    tipo: "numero",
    unidade: "g/min",
    melhor: "maior",
    filtro: "faixa",
    ajuda:
      "O pico do botão de vapor extra, para o vinco que não sai. Dura segundos e esvazia o reservatório rápido — não é a vazão de trabalho.",
    contaTransparencia: true,
  },
  {
    chave: "reservatorioMl",
    rotulo: "Reservatório",
    grupo: "Vapor",
    tipo: "numero",
    unidade: "ml",
    melhor: "maior",
    filtro: "faixa",
    ajuda:
      "Quanta água cabe. Dividido pela vazão contínua, dá quantos minutos de vapor antes de reabastecer.",
    contaTransparencia: true,
  },
  {
    chave: "vaporVertical",
    rotulo: "Vapor vertical",
    grupo: "Vapor",
    tipo: "booleano",
    filtro: "opcoes",
    ajuda: "Passar a peça pendurada no cabide, sem tábua.",
    contaTransparencia: true,
  },
  {
    chave: "potenciaW",
    rotulo: "Potência",
    grupo: "Energia",
    tipo: "numero",
    unidade: "W",
    filtro: "faixa",
    ajuda:
      "O que aquece a chapa, na tomada de 127 V. Quase todo ferro de entrada tem 1.200 W, e é o número que o anúncio escolhe mostrar justamente por ser o mais parecido entre todos.",
    contaTransparencia: true,
  },
  {
    chave: "consumoKwhMes",
    rotulo: "Consumo declarado",
    grupo: "Energia",
    tipo: "numero",
    unidade: "kWh",
    melhor: "menor",
    filtro: "faixa",
    ajuda:
      "O campo existe nas cinco marcas e em nenhuma delas traz consumo: o valor é a potência em quilowatt. Arno publica 1,52 para 1.520 W, Philco 1,2 para 1.200 W, Oster 1,2 KWH para 1.200 W. Por isso a coluna está vazia na categoria inteira.",
    contaTransparencia: true,
  },
  {
    chave: "tensao",
    rotulo: "Tensão",
    grupo: "Energia",
    tipo: "texto",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "comprimentoCaboM",
    rotulo: "Comprimento do cabo",
    grupo: "Uso",
    tipo: "numero",
    unidade: "m",
    melhor: "maior",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "desligamentoAutomatico",
    rotulo: "Desligamento automático",
    grupo: "Uso",
    tipo: "booleano",
    filtro: "opcoes",
    ajuda: "Corta sozinho quando fica parado. É o que separa esquecer o ferro ligado de um incêndio.",
    contaTransparencia: true,
  },
  {
    chave: "antigotejamento",
    rotulo: "Antigotejamento",
    grupo: "Uso",
    tipo: "booleano",
    filtro: "opcoes",
    ajuda: "Impede a água de pingar na roupa quando a chapa ainda está fria.",
    contaTransparencia: true,
  },
  {
    chave: "autoLimpeza",
    rotulo: "Auto-limpeza",
    grupo: "Uso",
    tipo: "booleano",
    filtro: "opcoes",
    ajuda: "Expulsa o calcário acumulado. Em água dura, é o que decide quanto tempo os furos continuam abertos.",
    contaTransparencia: true,
  },
  {
    chave: "spray",
    rotulo: "Spray",
    grupo: "Uso",
    tipo: "booleano",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "pesoKg",
    rotulo: "Peso",
    grupo: "Corpo",
    tipo: "numero",
    unidade: "kg",
    filtro: "faixa",
    ajuda:
      "Sem melhor nem pior: peso ajuda a vincar e cansa o braço. Aqui vai de 0,6 a 3,7 kg, que é a diferença entre um ferro de viagem e uma estação de vapor.",
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
    grupo: "Corpo",
    tipo: "numero",
    unidade: "meses",
    melhor: "maior",
    filtro: "faixa",
    contaTransparencia: true,
  },
];

/**
 * Aspirador de po. A caixa anuncia watt, que e o que o motor puxa da tomada.
 * O que levanta poeira e succao, medida em pascal — e duas marcas em sete
 * publicam. Pior: as duas que publicam usam unidades diferentes, e uma delas
 * usa duas unidades dentro do proprio catalogo. Por isso a ficha tem duas
 * colunas: o numero convertido para pascal e, do lado, exatamente o que o
 * fabricante escreveu.
 */
export const camposAspirador: Campo[] = [
  {
    chave: "tipo",
    rotulo: "Tipo",
    grupo: "O que é",
    tipo: "texto",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "semFio",
    rotulo: "Sem fio",
    grupo: "O que é",
    tipo: "booleano",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "succaoPa",
    rotulo: "Sucção",
    grupo: "Sucção",
    tipo: "numero",
    unidade: "Pa",
    melhor: "maior",
    filtro: "faixa",
    ajuda:
      "O que de fato levanta a poeira, convertido para pascal para os números ficarem comparáveis. Entre os que publicam, vai de 360 Pa a 26.500 — e o mais forte não é o de mais watts.",
    contaTransparencia: true,
  },
  {
    chave: "succaoDeclarada",
    rotulo: "Como a marca escreveu",
    grupo: "Sucção",
    tipo: "texto",
    ajuda:
      "O valor exato da ficha do fabricante, com a unidade dele. Existe porque “265 mbar” e “400 Pa” aparecem no mesmo catálogo e são 66 vezes diferentes — quem compara os números crus compara errado.",
    contaTransparencia: true,
  },
  {
    chave: "potenciaW",
    rotulo: "Potência",
    grupo: "Energia",
    tipo: "numero",
    unidade: "W",
    filtro: "faixa",
    ajuda:
      "O que o motor puxa da tomada. É o número da caixa e não ordena a lista: nesta categoria um aparelho de 450 W puxa mais vácuo que um de 2.000 W, pela ficha da mesma marca.",
    contaTransparencia: true,
  },
  {
    chave: "autonomiaMin",
    rotulo: "Autonomia",
    grupo: "Energia",
    tipo: "numero",
    unidade: "min",
    melhor: "maior",
    filtro: "faixa",
    ajuda: "Só faz sentido nos sem fio. Nos de tomada, o campo não se aplica.",
    contaTransparencia: true,
  },
  {
    chave: "alcanceM",
    rotulo: "Alcance",
    grupo: "Energia",
    tipo: "numero",
    unidade: "m",
    melhor: "maior",
    filtro: "faixa",
    ajuda: "Cabo mais mangueira: até onde dá para ir sem trocar de tomada.",
    contaTransparencia: true,
  },
  {
    chave: "capacidadeReservatorioL",
    rotulo: "Reservatório",
    grupo: "Coleta",
    tipo: "numero",
    unidade: "L",
    melhor: "maior",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "filtroHepa",
    rotulo: "Filtro HEPA",
    grupo: "Coleta",
    tipo: "booleano",
    filtro: "opcoes",
    ajuda: "Retem particula fina em vez de devolver ao ar. Importa para quem tem alergia.",
    contaTransparencia: true,
  },
  {
    chave: "niveisFiltragem",
    rotulo: "Níveis de filtragem",
    grupo: "Coleta",
    tipo: "numero",
    melhor: "maior",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "aspiraLiquidos",
    rotulo: "Aspira líquidos",
    grupo: "Coleta",
    tipo: "booleano",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "ruidoDb",
    rotulo: "Ruído",
    grupo: "Uso",
    tipo: "numero",
    unidade: "dB",
    melhor: "menor",
    filtro: "faixa",
    ajuda:
      "Aqui vai de 65 a 95 dB. Trinta decibéis de diferença não é “um pouco mais alto”: a escala é logarítmica.",
    contaTransparencia: true,
  },
  {
    chave: "pesoKg",
    rotulo: "Peso",
    grupo: "Corpo",
    tipo: "numero",
    unidade: "kg",
    melhor: "menor",
    filtro: "faixa",
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
    chave: "tensao",
    rotulo: "Tensão",
    grupo: "Corpo",
    tipo: "texto",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "garantiaMeses",
    rotulo: "Garantia",
    grupo: "Corpo",
    tipo: "numero",
    unidade: "meses",
    melhor: "maior",
    filtro: "faixa",
    contaTransparencia: true,
  },
];

/**
 * Lavadora de alta pressao. O nome do produto e a pressao — 1600PSI, 2200PSI —
 * e pressao sozinha nao lava: ela solta a sujeira, a agua leva embora. Quem
 * decide quanto tempo leva para terminar a parede e a vazao, em litros por
 * hora, e a vazao anda solta da pressao. A Electrolux tem cinco modelos de
 * 1.600 a 2.200 psi com a mesma vazao de 280 L/h; a WAP tem uma de 1.700 psi
 * que joga 750 L/h contra 520 da de 2.610.
 */
export const camposLavadoraAltaPressao: Campo[] = [
  {
    chave: "tipo",
    rotulo: "Tipo",
    grupo: "O que é",
    tipo: "texto",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "pressaoPsi",
    rotulo: "Pressão máxima",
    grupo: "Água",
    tipo: "numero",
    unidade: "psi",
    melhor: "maior",
    filtro: "faixa",
    ajuda:
      "É o número que batiza o produto. Solta a sujeira grudada — mas sozinho não diz em quanto tempo o serviço acaba.",
    contaTransparencia: true,
  },
  {
    chave: "pressaoDeclarada",
    rotulo: "Como a marca escreveu",
    grupo: "Água",
    tipo: "texto",
    ajuda:
      "O valor exato da ficha. WAP e Mondial publicam em psi; a Electrolux chama o campo de “Pressão máxima (PSI/Libras)” e escreve o valor em megapascal com o psi entre parênteses.",
    contaTransparencia: true,
  },
  {
    chave: "vazaoLh",
    rotulo: "Vazão",
    grupo: "Água",
    tipo: "numero",
    unidade: "L/h",
    melhor: "maior",
    filtro: "faixa",
    ajuda:
      "Quantos litros por hora saem do bico. É o que enxagua e o que determina quanto tempo leva para cobrir a área — e não acompanha a pressão: aqui há aparelho de menos pressão com quase o dobro de vazão.",
    contaTransparencia: true,
  },
  {
    chave: "temperaturaMaxEntradaC",
    rotulo: "Temperatura máx. da água",
    grupo: "Água",
    tipo: "numero",
    unidade: "°C",
    filtro: "faixa",
    ajuda: "Até que temperatura a água de entrada pode chegar sem dano à bomba.",
    contaTransparencia: true,
  },
  {
    chave: "tipoMotor",
    rotulo: "Tipo de motor",
    grupo: "Motor",
    tipo: "texto",
    filtro: "opcoes",
    ajuda:
      "Universal é mais leve e barato; indução é mais pesado, mais silencioso e dura mais. Uma marca em quatro publica qual é o seu.",
    contaTransparencia: true,
  },
  {
    chave: "tipoBomba",
    rotulo: "Tipo de bomba",
    grupo: "Motor",
    tipo: "texto",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "potenciaW",
    rotulo: "Potência",
    grupo: "Motor",
    tipo: "numero",
    unidade: "W",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "ruidoDb",
    rotulo: "Ruído",
    grupo: "Motor",
    tipo: "numero",
    unidade: "dB",
    melhor: "menor",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "comprimentoMangueiraM",
    rotulo: "Mangueira",
    grupo: "Alcance",
    tipo: "numero",
    unidade: "m",
    melhor: "maior",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "comprimentoCaboM",
    rotulo: "Cabo elétrico",
    grupo: "Alcance",
    tipo: "numero",
    unidade: "m",
    melhor: "maior",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "alcanceM",
    rotulo: "Alcance total",
    grupo: "Alcance",
    tipo: "numero",
    unidade: "m",
    melhor: "maior",
    filtro: "faixa",
    ajuda: "Cabo mais mangueira: quanto dá para andar sem trocar de tomada.",
    contaTransparencia: true,
  },
  {
    chave: "pesoKg",
    rotulo: "Peso",
    grupo: "Corpo",
    tipo: "numero",
    unidade: "kg",
    filtro: "faixa",
    ajuda:
      "Sem melhor nem pior: o peso vem do motor de indução, que dura mais e não sobe escada. Aqui vai de 3 a 77 kg.",
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
    chave: "tensao",
    rotulo: "Tensão",
    grupo: "Corpo",
    tipo: "texto",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "garantiaMeses",
    rotulo: "Garantia",
    grupo: "Corpo",
    tipo: "numero",
    unidade: "meses",
    melhor: "maior",
    filtro: "faixa",
    contaTransparencia: true,
  },
];

/**
 * Secador de cabelo. A caixa diz 2.000 W e nenhuma das cinco marcas publica
 * quanto ar sai — que e o que seca. Sem vazao, o que resta de comparavel sao
 * duas coisas: quantas combinacoes de temperatura e velocidade o aparelho da,
 * e se a grade de tras sai para limpar. A grade importa porque secador morre
 * de fiapo entupindo a entrada de ar e o motor cozinhando atras dela — e uma
 * marca em cinco diz se a sua sai.
 */
export const camposSecadorCabelo: Campo[] = [
  {
    chave: "potenciaW",
    rotulo: "Potência",
    grupo: "Motor",
    tipo: "numero",
    unidade: "W",
    filtro: "faixa",
    ajuda:
      "O número da caixa, na tomada de 127 V. Não é quanto ar sai: os modelos de motor brushless aqui têm 400 a 600 W a menos que os convencionais e pesam metade.",
    contaTransparencia: true,
  },
  {
    chave: "tipoMotor",
    rotulo: "Tipo de motor",
    grupo: "Motor",
    tipo: "texto",
    filtro: "opcoes",
    ajuda:
      "Brushless (BLDC) gira muito mais rápido, pesa menos e dura mais que o motor com escovas. Uma marca em cinco publica qual é o seu.",
    contaTransparencia: true,
  },
  {
    chave: "rotacaoRpm",
    rotulo: "Rotação",
    grupo: "Motor",
    tipo: "numero",
    unidade: "rpm",
    melhor: "maior",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "niveisTemperatura",
    rotulo: "Níveis de temperatura",
    grupo: "Controle",
    tipo: "numero",
    melhor: "maior",
    filtro: "faixa",
    ajuda:
      "Quantas temperaturas dá para escolher. Multiplicado pelas velocidades, é o número de ajustes reais — uma marca chega a batizar o produto com a conta: “6 Combinações” é 3 × 2.",
    contaTransparencia: true,
  },
  {
    chave: "niveisVelocidade",
    rotulo: "Níveis de velocidade",
    grupo: "Controle",
    tipo: "numero",
    melhor: "maior",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "jatoArFrio",
    rotulo: "Jato de ar frio",
    grupo: "Controle",
    tipo: "booleano",
    filtro: "opcoes",
    ajuda: "Botão que corta a resistência para fixar o penteado sem mais calor.",
    contaTransparencia: true,
  },
  {
    chave: "gradeTraseiraRemovivel",
    rotulo: "Grade traseira removível",
    grupo: "Manutenção",
    tipo: "booleano",
    filtro: "opcoes",
    ajuda:
      "Por onde o ar entra — e onde o fiapo se acumula até o motor superaquecer. Se a grade não sai, não há como limpar por dentro. É o campo que mais diz sobre quanto tempo o aparelho dura, e o que menos aparece.",
    contaTransparencia: true,
  },
  {
    chave: "caboGiratorio",
    rotulo: "Cabo giratório",
    grupo: "Manutenção",
    tipo: "booleano",
    filtro: "opcoes",
    ajuda: "Evita que o fio torça e parta na saída do corpo, que é onde ele parte.",
    contaTransparencia: true,
  },
  {
    chave: "emiteIons",
    rotulo: "Emite íons",
    grupo: "Controle",
    tipo: "booleano",
    filtro: "opcoes",
    ajuda:
      "As marcas associam íons a menos frizz. A ficha registra só se o recurso existe; nenhuma publica medida do efeito, e este guia não testa.",
    contaTransparencia: true,
  },
  {
    chave: "comprimentoCaboM",
    rotulo: "Comprimento do cabo",
    grupo: "Corpo",
    tipo: "numero",
    unidade: "m",
    melhor: "maior",
    filtro: "faixa",
    contaTransparencia: true,
  },
  {
    chave: "pesoKg",
    rotulo: "Peso",
    grupo: "Corpo",
    tipo: "numero",
    unidade: "kg",
    melhor: "menor",
    filtro: "faixa",
    ajuda:
      "Fica no ar, no alto, por minutos. Aqui vai de 285 g a 620 g — e os leves são justamente os de motor brushless.",
    contaTransparencia: true,
  },
  {
    chave: "tensao",
    rotulo: "Tensão",
    grupo: "Corpo",
    tipo: "texto",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "registroInmetro",
    rotulo: "Registro no Inmetro",
    grupo: "Corpo",
    tipo: "texto",
    ajuda:
      "O número da certificação compulsória, consultável no registro público do Inmetro. Uma marca em cinco publica — e é o único dado desta ficha que dá para conferir fora do site de quem vende.",
    contaTransparencia: true,
  },
  {
    chave: "garantiaMeses",
    rotulo: "Garantia",
    grupo: "Corpo",
    tipo: "numero",
    unidade: "meses",
    melhor: "maior",
    filtro: "faixa",
    contaTransparencia: true,
  },
];

/**
 * Batedeira. O anuncio vende watt e a faixa e larga — 185 a 1.200 W. Mas a
 * linha "comum" inteira de duas marcas, de 350 a 550 W, tem exatamente a mesma
 * ficha: 4 velocidades, tigela de 4 a 4,3 L e um par de batedores. O que muda
 * de verdade e o tipo: na planetaria o batedor orbita enquanto gira, alcanca a
 * parede da tigela e vem com tres pecas diferentes — batedor, gancho e fouet —
 * em 11 ou 12 velocidades. A diferenca entre 350 e 550 W nao aparece em campo
 * nenhum; a diferenca entre comum e planetaria aparece em todos.
 */
export const camposBatedeira: Campo[] = [
  {
    chave: "tipo",
    rotulo: "Tipo",
    grupo: "O que é",
    tipo: "texto",
    filtro: "opcoes",
    ajuda:
      "Comum: dois batedores girando no lugar. Planetária: o batedor gira e ao mesmo tempo percorre a tigela, como a Lua em volta da Terra — por isso o nome. É a divisão que separa as fichas em dois blocos.",
    contaTransparencia: true,
  },
  {
    chave: "potenciaW",
    rotulo: "Potência",
    grupo: "O que é",
    tipo: "numero",
    unidade: "W",
    filtro: "faixa",
    ajuda:
      "O número do anúncio. Entre as comuns ele varia de 350 a 550 W sem mudar mais nada da ficha — nem velocidade, nem tigela, nem batedor.",
    contaTransparencia: true,
  },
  {
    chave: "velocidades",
    rotulo: "Velocidades",
    grupo: "Controle",
    tipo: "numero",
    melhor: "maior",
    filtro: "faixa",
    ajuda:
      "Toda comum daqui tem 4. Toda planetária tem 11 ou 12 — com uma exceção de 8, que é justamente a mais potente da lista.",
    contaTransparencia: true,
  },
  {
    chave: "batedores",
    rotulo: "Batedores",
    grupo: "Controle",
    tipo: "texto",
    filtro: "opcoes",
    ajuda:
      "Um par igual, ou três peças diferentes: batedor de massa leve, gancho de pão e fouet de claras. Uma comum só faz o primeiro trabalho.",
    contaTransparencia: true,
  },
  {
    chave: "capacidadeTigelaL",
    rotulo: "Tigela",
    grupo: "Tigela",
    tipo: "numero",
    unidade: "L",
    melhor: "maior",
    filtro: "faixa",
    ajuda:
      "A capacidade até a borda, que é o que as marcas publicam. Nenhuma diz quanto cabe de massa sem espirrar.",
    contaTransparencia: true,
  },
  {
    chave: "capacidadeFarinhaKg",
    rotulo: "Farinha",
    grupo: "Tigela",
    tipo: "numero",
    unidade: "kg",
    melhor: "maior",
    filtro: "faixa",
    ajuda:
      "Quantos quilos de farinha a batedeira dá conta de trabalhar. É o que a tigela faz, não o que ela comporta — e uma marca em cinco publica.",
    contaTransparencia: true,
  },
  {
    chave: "capacidadeMassaPaoKg",
    rotulo: "Massa de pão",
    grupo: "Tigela",
    tipo: "numero",
    unidade: "kg",
    melhor: "maior",
    filtro: "faixa",
    ajuda:
      "O serviço mais pesado que uma batedeira faz. Onde existe, mostra que a capacidade de trabalho não acompanha o watt: a de 325 W aqui leva 4 kg, e a de 350 W não publica quanto leva.",
    contaTransparencia: true,
  },
  {
    chave: "elevacaoTigela",
    rotulo: "Elevação da tigela",
    grupo: "Tigela",
    tipo: "texto",
    filtro: "opcoes",
    ajuda:
      "Duas mecânicas diferentes: na de cabeça basculante o corpo inclina para trás; na de elevação a tigela sobe por alavanca, que é o arranjo das máquinas de massa pesada.",
    contaTransparencia: true,
  },
  {
    chave: "capacidadeTigelaExtraL",
    rotulo: "Tigela extra",
    grupo: "Tigela",
    tipo: "numero",
    unidade: "L",
    melhor: "maior",
    filtro: "faixa",
    ajuda: "Algumas comuns vêm com uma segunda tigela menor. Uma marca publica esse campo.",
    contaTransparencia: true,
  },
  {
    chave: "funcaoTurbo",
    rotulo: "Função turbo",
    grupo: "Controle",
    tipo: "booleano",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "funcaoPortatil",
    rotulo: "Sai da base",
    grupo: "Controle",
    tipo: "booleano",
    filtro: "opcoes",
    ajuda: "Se o corpo destaca do pedestal e vira batedeira de mão.",
    contaTransparencia: true,
  },
  {
    chave: "pesoKg",
    rotulo: "Peso",
    grupo: "Corpo",
    tipo: "numero",
    unidade: "kg",
    filtro: "faixa",
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
    chave: "tensao",
    rotulo: "Tensão",
    grupo: "Corpo",
    tipo: "texto",
    filtro: "opcoes",
    contaTransparencia: true,
  },
  {
    chave: "garantiaMeses",
    rotulo: "Garantia",
    grupo: "Corpo",
    tipo: "numero",
    unidade: "meses",
    melhor: "maior",
    filtro: "faixa",
    contaTransparencia: true,
  },
];

export const camposPorCategoria: Record<string, Campo[]> = {
  sanduicheiras: camposSanduicheira,
  microondas: camposMicroondas,
  geladeiras: camposGeladeira,
  lavadoras: camposLavadora,
  torradeiras: camposTorradeira,
  chaleiras: camposChaleira,
  espremedores: camposEspremedor,
  lavaloucas: camposLavaLouca,
  smartwatches: camposSmartwatch,
  ventiladores: camposVentilador,
  ferros: camposFerroDePassar,
  aspiradores: camposAspirador,
  "lavadoras-alta-pressao": camposLavadoraAltaPressao,
  secadores: camposSecadorCabelo,
  batedeiras: camposBatedeira,
  energia: camposEnergia,
  armazenamento: camposArmazenamento,
  conectividade: camposRede,
  perifericos: camposPeriferico,
  "casa-conectada": camposCasaConectada,
  audio: camposAudio,
  cozinha: camposCozinha,
  celular: camposCelular,
  tablets: camposTablet,
  monitores: camposMonitor,
  liquidificadores: camposLiquidificador,
  cafeteiras: camposCafeteira,
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
  capacidadeFarinhaKg: "panela",
  capacidadeMassaPaoKg: "panela",
  elevacaoTigela: "info",
  registroInmetro: "escudo",
  batedores: "panela",
  capacidadeTigelaL: "panela",
  capacidadeTigelaExtraL: "panela",
  funcaoTurbo: "raio",
  funcaoPortatil: "info",
  niveisVelocidade: "info",
  jatoArFrio: "raio",
  gradeTraseiraRemovivel: "info",
  caboGiratorio: "raio",
  emiteIons: "raio",
  pressaoPsi: "raio",
  pressaoDeclarada: "info",
  vazaoLh: "gota",
  temperaturaMaxEntradaC: "gota",
  tipoMotor: "raio",
  tipoBomba: "raio",
  comprimentoMangueiraM: "regua",
  succaoPa: "raio",
  succaoDeclarada: "info",
  semFio: "bateria",
  autonomiaMin: "bateria",
  capacidadeReservatorioL: "gota",
  filtroHepa: "info",
  niveisFiltragem: "info",
  aspiraLiquidos: "gota",
  ruidoDb: "fone",
  materialBase: "panela",
  saidasVapor: "gota",
  vazaoContinuaGMin: "gota",
  vazaoExtraGMin: "gota",
  reservatorioMl: "gota",
  vaporVertical: "gota",
  antigotejamento: "gota",
  autoLimpeza: "info",
  spray: "gota",
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
  materialCopo: "panela",
  velocidades: "controle",
  rpm: "raio",
  laminas: "driver",
  pulsar: "controle",
  filtro: "gota",
  travaSeguranca: "escudo",
  capacidadeL: "panela",
  xicaras: "panela",
  mlPorXicara: "gota",
  consumoKwh: "raio",
  materialJarra: "gota",
  filtroPermanente: "gota",
  cortaPingos: "gota",
  manterAquecido: "termometro",
  timer: "relogio",
  capacidadeGb: "portas",
  interface: "cabo",
  conector: "portas",
  leituraMbs: "raio",
  escritaMbs: "raio",
  memoriaTipo: "chip",
  durabilidadeTbw: "escudo",
  resistencia: "escudo",
  criptografia: "escudo",
  padraoWifi: "bluetooth",
  bandas: "onda",
  velocidadeNominalMbps: "raio",
  velocidade24ghzMbps: "onda",
  velocidade5ghzMbps: "onda",
  antenas: "bluetooth",
  mumimo: "bluetooth",
  mesh: "bluetooth",
  portasLan: "portas",
  portaGigabit: "portas",
  coberturaM2: "regua",
  dispositivosSimultaneos: "controle",
  conexao: "cabo",
  dpiMax: "controle",
  sensor: "chip",
  botoes: "controle",
  layout: "controle",
  tipoTecla: "controle",
  tecladoNumerico: "controle",
  alimentacao: "bateria",
  duracaoPilhaMeses: "bateria",
  alcanceM: "regua",
  appProprio: "celular",
  assistentes: "onda",
  funcionaSemNuvem: "escudo",
  cargaMaxW: "raio",
  medeConsumo: "raio",
  fluxoLumens: "display",
  temperaturaCorK: "termometro",
  corRgb: "display",
  resolucaoVideo: "display",
  visaoNoturnaM: "regua",
  armazenamentoVideo: "portas",
  protecaoIp: "gota",
  sanduichesPorVez: "panela",
  abertura180: "seta",
  tipoChapa: "panela",
  revestimento: "escudo",
  controleTemperatura: "termometro",
  luzIndicadora: "display",
  bandejaColetora: "gota",
  travaFechamento: "check",
  comprimentoCaboM: "cabo",
  tipoInstalacao: "panela",
  niveisPotencia: "controle",
  diametroPratoCm: "regua",
  grill: "termometro",
  receitasPreProgramadas: "nome",
  classificacaoEnergetica: "raio",
  portas: "portas",
  degelo: "termometro",
  capacidadeGeladeiraL: "gota",
  capacidadeFreezerL: "termometro",
  consumoKwhMes: "raio",
  niveisTemperatura: "controle",
  alarmePortaAberta: "onda",
  nivelRuidoDb: "onda",
  capacidadeKg: "peso",
  consumoAguaL: "gota",
  consumoEnergiaKwh: "raio",
  rotacaoRpm: "onda",
  eficienciaCentrifugacao: "onda",
  programas: "controle",
  materialCesto: "panela",
  reaproveitamentoAgua: "gota",
  filtroFiapos: "escudo",
  niveisTostagem: "termometro",
  fatias: "panela",
  espessuraPaoMm: "regua",
  funcaoDescongelar: "gota",
  funcaoReaquecer: "termometro",
  funcaoCancelar: "x",
  desligamentoAutomatico: "relogio",
  bandejaRemovivel: "portas",
  guardaFio: "cabo",
  tempoFervuraMin: "relogio",
  protecaoSemAgua: "escudo",
  baseGiratoria: "seta",
  visorNivel: "display",
  capacidadeJarraL: "gota",
  cones: "panela",
  rotacaoAlternada: "seta",
  acionamento: "controle",
  controlePolpa: "filtro",
  jarraRemovivel: "portas",
  indicadorCapacidade: "regua",
  servicos: "panela",
  cestoTalheres: "portas",
  travaPainel: "escudo",
  tipoTela: "display",
  ppi: "display",
  autonomiaTipicaDias: "bateria",
  autonomiaIntensaDias: "bateria",
  resistenciaAgua: "gota",
  altoFalante: "onda",
  gps: "regua",
  compatibilidade: "celular",
  diametroDeclaradoCm: "regua",
  diametroHeliceCm: "regua",
  pas: "onda",
  vazaoM3s: "onda",
  oscilante: "seta",
  controleRemoto: "controle",
  alturaAjustavel: "regua",
};

export function iconeDo(chave: string): string {
  return ICONE_POR_CAMPO[chave] ?? "info";
}

/** Ícone de cada categoria — trilho de navegação, mídia sem foto, cards. */
const ICONE_POR_CATEGORIA: Record<string, string> = {
  batedeiras: "panela",
  secadores: "raio",
  "lavadoras-alta-pressao": "gota",
  aspiradores: "info",
  ferros: "panela",
  audio: "fone",
  energia: "bateria",
  perifericos: "controle",
  monitores: "display",
  armazenamento: "portas",
  conectividade: "bluetooth",
  "casa-conectada": "display",
  celular: "celular",
  cozinha: "panela",
  liquidificadores: "panela",
  cafeteiras: "panela",
  tablets: "display",
  sanduicheiras: "panela",
  microondas: "panela",
  geladeiras: "termometro",
  lavadoras: "gota",
  torradeiras: "panela",
  chaleiras: "gota",
  espremedores: "gota",
  lavaloucas: "gota",
  smartwatches: "relogio",
  ventiladores: "onda",
  eletrodomesticos: "raio",
};

export function iconeDaCategoria(slug: string): string {
  return ICONE_POR_CATEGORIA[slug] ?? "info";
}

/** Rótulo curto para o card, onde "Potência máxima de saída" não cabe. */
const ROTULO_CURTO: Record<string, string> = {
  capacidadeFarinhaKg: "Farinha",
  capacidadeMassaPaoKg: "Massa de pão",
  elevacaoTigela: "Elevação",
  registroInmetro: "Inmetro",
  batedores: "Batedores",
  capacidadeTigelaL: "Tigela",
  capacidadeTigelaExtraL: "Tigela extra",
  funcaoTurbo: "Turbo",
  funcaoPortatil: "Sai da base",
  niveisVelocidade: "Velocidades",
  jatoArFrio: "Ar frio",
  gradeTraseiraRemovivel: "Grade sai",
  caboGiratorio: "Cabo giratório",
  emiteIons: "Íons",
  pressaoPsi: "Pressão",
  pressaoDeclarada: "Declarado",
  vazaoLh: "Vazão",
  temperaturaMaxEntradaC: "Água máx.",
  tipoMotor: "Motor",
  tipoBomba: "Bomba",
  comprimentoMangueiraM: "Mangueira",
  succaoPa: "Sucção",
  succaoDeclarada: "Declarado",
  semFio: "Sem fio",
  autonomiaMin: "Autonomia",
  capacidadeReservatorioL: "Reservatório",
  filtroHepa: "HEPA",
  niveisFiltragem: "Filtragem",
  aspiraLiquidos: "Líquidos",
  ruidoDb: "Ruído",
  materialBase: "Base",
  saidasVapor: "Saídas",
  vazaoContinuaGMin: "Vapor contínuo",
  vazaoExtraGMin: "Jato",
  reservatorioMl: "Reservatório",
  vaporVertical: "Vertical",
  antigotejamento: "Antigota",
  autoLimpeza: "Auto-limpeza",
  spray: "Spray",
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
  materialCopo: "Copo",
  capacidadeL: "Capacidade",
  xicaras: "Xícaras",
  mlPorXicara: "ml/xícara",
  materialJarra: "Jarra",
  filtroPermanente: "Filtro",
  cortaPingos: "Corta-pingos",
  manterAquecido: "Aquecido",
  consumoKwh: "Consumo",
  velocidades: "Velocidades",
  rpm: "Rotação",
  travaSeguranca: "Trava",
  capacidadeGb: "Capacidade",
  leituraMbs: "Leitura",
  escritaMbs: "Escrita",
  durabilidadeTbw: "Durabilidade",
  memoriaTipo: "Memória",
  criptografia: "Criptografia",
  resistencia: "Resistência",
  velocidadeNominalMbps: "Nome",
  velocidade24ghzMbps: "2,4 GHz",
  velocidade5ghzMbps: "5 GHz",
  padraoWifi: "Padrão",
  portasLan: "LAN",
  portaGigabit: "Gigabit",
  coberturaM2: "Cobertura",
  dispositivosSimultaneos: "Aparelhos",
  dpiMax: "DPI",
  duracaoPilhaMeses: "Pilha",
  alcanceM: "Alcance",
  tecladoNumerico: "Numérico",
  tipoTecla: "Teclas",
  appProprio: "App",
  assistentes: "Assistentes",
  funcionaSemNuvem: "Sem nuvem",
  cargaMaxW: "Carga máx.",
  medeConsumo: "Mede consumo",
  fluxoLumens: "Luz",
  temperaturaCorK: "Cor",
  corRgb: "RGB",
  resolucaoVideo: "Vídeo",
  visaoNoturnaM: "Noturna",
  armazenamentoVideo: "Grava em",
  protecaoIp: "IP",
  tipoInstalacao: "Instalação",
  niveisPotencia: "Níveis",
  diametroPratoCm: "Prato",
  receitasPreProgramadas: "Receitas",
  classificacaoEnergetica: "Selo",
  capacidadeGeladeiraL: "Geladeira",
  capacidadeFreezerL: "Freezer",
  consumoKwhMes: "Consumo/mês",
  niveisTemperatura: "Níveis",
  alarmePortaAberta: "Alarme",
  nivelRuidoDb: "Ruído",
  capacidadeKg: "Capacidade",
  consumoAguaL: "Água/ciclo",
  consumoEnergiaKwh: "Energia/ciclo",
  rotacaoRpm: "Centrifuga",
  eficienciaCentrifugacao: "Ef. centrif.",
  materialCesto: "Cesto",
  reaproveitamentoAgua: "Reaproveita",
  filtroFiapos: "Filtro",
  niveisTostagem: "Níveis",
  espessuraPaoMm: "Espessura",
  funcaoDescongelar: "Descongela",
  funcaoReaquecer: "Reaquece",
  funcaoCancelar: "Cancela",
  desligamentoAutomatico: "Desliga só",
  bandejaRemovivel: "Bandeja",
  tempoFervuraMin: "Ferve em",
  protecaoSemAgua: "Sem água",
  baseGiratoria: "Base 360°",
  visorNivel: "Visor",
  capacidadeJarraL: "Jarra",
  rotacaoAlternada: "Dois sentidos",
  controlePolpa: "Polpa",
  jarraRemovivel: "Jarra removível",
  indicadorCapacidade: "Nível",
  servicos: "Serviços",
  cestoTalheres: "Talheres",
  travaPainel: "Trava",
  tipoTela: "Painel",
  autonomiaTipicaDias: "Uso típico",
  autonomiaIntensaDias: "Uso intenso",
  resistenciaAgua: "Água",
  altoFalante: "Som",
  diametroDeclaradoCm: "Diâmetro",
  diametroHeliceCm: "Hélice",
  vazaoM3s: "Vazão",
  controleRemoto: "Remoto",
  alturaAjustavel: "Altura aj.",
  sanduichesPorVez: "Por vez",
  abertura180: "Abre 180°",
  tipoChapa: "Chapa",
  controleTemperatura: "Termostato",
  luzIndicadora: "Luz",
  bandejaColetora: "Bandeja",
  travaFechamento: "Trava",
  comprimentoCaboM: "Cabo",
};

export function rotuloCurto(campo: Campo): string {
  return ROTULO_CURTO[campo.chave] ?? campo.rotulo;
}

/** Os três números que separam um produto de outro, por categoria — para o card. */
const DESTAQUES_POR_CATEGORIA: Record<string, string[]> = {
  energia: ["capacidadeNominal", "potenciaMaxSaida", "pesoG"],
  armazenamento: ["capacidadeGb", "leituraMbs", "tipo"],
  conectividade: ["velocidadeNominalMbps", "velocidade5ghzMbps", "padraoWifi"],
  perifericos: ["tipo", "conexao", "duracaoPilhaMeses"],
  "casa-conectada": ["tipo", "assistentes", "funcionaSemNuvem"],
  audio: ["horasFone", "driverMm", "protecaoAgua"],
  cozinha: ["capacidadeUtilL", "potenciaW", "tensao"],
  celular: ["telaPol", "horasVideo", "pesoG"],
  tablets: ["telaPol", "bateriaMah", "canetaInclusa"],
  monitores: ["telaPol", "taxaHz", "painel"],
  liquidificadores: ["capacidadeUtilL", "potenciaW", "velocidades"],
  cafeteiras: ["capacidadeL", "xicaras", "materialJarra"],
  sanduicheiras: ["sanduichesPorVez", "potenciaW", "abertura180"],
  microondas: ["capacidadeTotalL", "capacidadeUtilL", "potenciaW"],
  geladeiras: ["capacidadeTotalL", "capacidadeGeladeiraL", "consumoKwhMes"],
  lavadoras: ["capacidadeKg", "consumoAguaL", "rotacaoRpm"],
  torradeiras: ["niveisTostagem", "espessuraPaoMm", "potenciaW"],
  chaleiras: ["capacidadeL", "tempoFervuraMin", "potenciaW"],
  espremedores: ["capacidadeJarraL", "cones", "rotacaoAlternada"],
  lavaloucas: ["servicos", "consumoAguaL", "tipoInstalacao"],
  smartwatches: ["autonomiaTipicaDias", "autonomiaIntensaDias", "telaPol"],
  ventiladores: ["diametroHeliceCm", "vazaoM3s", "potenciaW"],
  ferros: ["vazaoContinuaGMin", "saidasVapor", "reservatorioMl"],
  aspiradores: ["succaoPa", "potenciaW", "ruidoDb"],
  "lavadoras-alta-pressao": ["vazaoLh", "pressaoPsi", "tipoMotor"],
  secadores: ["gradeTraseiraRemovivel", "niveisTemperatura", "potenciaW"],
  batedeiras: ["tipo", "capacidadeFarinhaKg", "capacidadeTigelaL"],
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

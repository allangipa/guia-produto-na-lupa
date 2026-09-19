import { categorias } from "@/lib/categorias";
import { produtosDaCategoria } from "@/lib/produtos";
import type { Produto } from "@/lib/specs";

/**
 * Recorte = uma fatia de uma categoria que corresponde a uma pergunta que as
 * pessoas de fato digitam: "batedeira planetária", "aspirador de pó sem fio",
 * "monitor 27 polegadas".
 *
 * ## Por que existe
 *
 * A base tem 434 fichas com os campos preenchidos, e quase ninguém busca por
 * modelo — busca por recorte. Cada recorte daqui é uma página que responde uma
 * dessas buscas com os dados que já existem, sem apuração nova.
 *
 * ## Por que é uma lista escrita à mão, e não gerado de todo valor de campo
 *
 * Gerar uma página por valor possível de filtro é a receita conhecida de página
 * fina: dezenas de URLs que repetem a mesma tabela com um item a menos, sem
 * nada escrito. O buscador chama isso de página-porta e trata como spam, e o
 * estrago cai sobre o site inteiro, não sobre as páginas ruins.
 *
 * Então cada recorte aqui é curado e tem três exigências, cobradas no build
 * pelo `verificar()` no fim do arquivo:
 *
 * 1. **Pelo menos 5 produtos.** Abaixo disso a página não compara nada.
 * 2. **Não pode pegar a categoria inteira.** Se todo produto passa no filtro,
 *    a página é cópia da categoria — conteúdo duplicado, e das duas o
 *    buscador escolhe uma.
 * 3. **Texto próprio, de no mínimo 600 caracteres.** É o que separa uma página
 *    de uma consulta salva. O texto tem que dizer o que o recorte revela;
 *    se não houver nada a dizer, o recorte não devia existir.
 *
 * Quebrar o build é de propósito: um recorte que murchou porque a categoria
 * mudou some do ar em silêncio, e ninguém percebe olhando a tela.
 */
export type Recorte = {
  /** Vira a URL: /listas/<slug>/ */
  slug: string;
  categoria: string;
  titulo: string;
  subtitulo: string;
  /**
   * A consulta que trouxe a pessoa, como a busca da Amazon a sugere. Fica
   * escrita na página, com a ressalva de que é sinal de demanda e não medida.
   */
  buscaQueOrigina: string;
  /** Em que posição essa sugestão aparece. */
  posicaoNaSugestao: string;
  /** O critério em português, mostrado na página. Sem isso o filtro é caixa-preta. */
  criterio: string;
  filtro: (p: Produto) => boolean;
  /** Parágrafos. Ver a exigência 3 acima. */
  texto: string[];
};

const N_MINIMO = 5;
const TEXTO_MINIMO = 600;

export const recortes: Recorte[] = [
  {
    slug: "batedeiras-planetarias",
    categoria: "batedeiras",
    titulo: "Batedeiras planetárias",
    subtitulo:
      "As que o batedor percorre a tigela em vez de girar parado — 11 ou 12 velocidades contra as 4 de toda batedeira comum, e três batedores em vez de um par.",
    buscaQueOrigina: "batedeira planetaria",
    posicaoNaSugestao: "1ª sugestão para “batedeira”",
    criterio: "Fichas em que o fabricante declara o tipo como planetária.",
    filtro: (p) => p.specs.tipo === "Planetária",
    texto: [
      "A primeira coisa que a busca da Amazon sugere para quem digita “batedeira” não é uma marca: é a palavra **planetária**. Faz sentido, porque é a única divisão dessa prateleira que muda o que o aparelho faz.",
      "Numa batedeira comum, dois batedores iguais giram parados no lugar. Numa planetária, o batedor gira sobre o próprio eixo e ao mesmo tempo percorre a tigela inteira, como a Lua em volta da Terra — daí o nome. Ele alcança a parede e o fundo sem alguém empurrar a massa para o meio.",
      "A ficha mostra a diferença em dois campos, e não é sutil. **Toda batedeira comum desta base tem 4 velocidades e um par de batedores**, da de 350 W à de 550 W. **Toda planetária tem 11 ou 12 velocidades e três peças diferentes** — batedor de massa leve, gancho de pão e fouet de claras. Uma comum só faz o primeiro trabalho.",
      "E o watt continua não ordenando nada. A planetária de menor potência da lista tem 270 W; a de maior tem 1.200 W e **oito** velocidades, menos que as de 600 e 700 W da mesma marca. Entre uma comum de 500 W e uma planetária de 500 W, a potência é a mesma e o aparelho é outro.",
      "Duas marcas publicam o tipo em campo de especificação. As outras deixam a palavra só no nome do produto — por isso algumas fichas abaixo têm o campo “Tipo” vazio mesmo sendo planetárias pelo nome, e este recorte só inclui as que declaram.",
    ],
  },
  {
    slug: "aspiradores-sem-fio",
    categoria: "aspiradores",
    titulo: "Aspiradores sem fio",
    subtitulo:
      "Verticais e robôs a bateria — onde o watt mente mais, porque um de 450 W puxa mais vácuo que um de tomada de 2.000 W, pela ficha da mesma marca.",
    buscaQueOrigina: "aspirador de po sem fio",
    posicaoNaSugestao: "1ª sugestão para “aspirador de pó”",
    criterio: "Fichas em que o fabricante declara funcionamento a bateria, sem fio.",
    filtro: (p) => p.specs.semFio === true,
    texto: [
      "“Aspirador de pó sem fio” é a primeira coisa que a busca sugere na categoria, e é também onde o número da caixa engana mais.",
      "Watt mede o que o motor puxa da tomada — ou da bateria. Não mede o que sai do bocal. O que levanta poeira é sucção, medida em pascal, e **duas marcas em sete publicam**. Nesta lista dá para ver o resultado: o WAP Magic, sem fio, com 450 W, declara 220 mbar de vácuo. O GTW Inox 70 Duo da mesma marca, de tomada, com dois motores somando 2.000 W, declara 200.",
      "Quatro vezes e meia os watts, vinte milibares a menos. Não é comparação entre marcas nem entre ficha honesta e ficha inflada: é a mesma empresa, o mesmo campo, o mesmo catálogo. A diferença está no motor — os sem fio usam brushless, otimizado para tirar o máximo de uma bateria pequena.",
      "O que o sem fio cobra em troca está em dois campos: **autonomia** e **reservatório**. Trinta minutos e 260 ml no Magic; os de tomada não têm limite de tempo e chegam a 70 litros de tambor. Para um apartamento, meia hora resolve. Para obra ou quintal, não.",
      "Uma armadilha de unidade que vale para a lista toda: a WAP publica o vácuo em milibar nos aparelhos de tomada e em pascal nos robôs do mesmo catálogo. São 100 pascal para cada milibar — um robô de “400 Pa” ao lado de um aspirador de “265” parece mais forte e é sessenta e seis vezes mais fraco. Por isso cada ficha aqui traz o valor convertido e, ao lado, o texto exato do fabricante.",
    ],
  },
  {
    slug: "aspiradores-po-e-agua",
    categoria: "aspiradores",
    titulo: "Aspiradores de pó e água",
    subtitulo:
      "Os que aspiram líquido — e onde a ficha esquece justamente de dizer quantos litros de líquido cabem dentro.",
    buscaQueOrigina: "aspirador de po e agua",
    posicaoNaSugestao: "2ª sugestão para “aspirador de pó”",
    criterio: "Fichas em que o fabricante declara que o aparelho aspira líquidos.",
    filtro: (p) => p.specs.aspiraLiquidos === true,
    texto: [
      "É a segunda coisa que a busca sugere para “aspirador de pó”, e a única função desta prateleira que um aspirador comum não faz de jeito nenhum: puxar água.",
      "Quem procura isso tem um problema específico — vazamento, quintal, carro molhado, obra — e uma pergunta específica: **quantos litros cabem**. É o número que diz se o serviço sai numa passada ou em quatro.",
      "E é o número que falta com mais frequência. Nesta lista há aparelhos que publicam o tambor com precisão — 25 L com 17 úteis, 70 L com 67 — e há o WAP GTW Inox 50, de 1.600 W, que **não publica capacidade nenhuma**. Num aspirador de pó e água. A mesma marca publica esse campo em outros modelos da mesma linha.",
      "O segundo número que importa aqui é a sucção, e nesta categoria ela aparece: a WAP declara o vácuo de toda a linha. A faixa vai de 170 a 265 mbar, e ela não acompanha o watt — o aparelho de 2.000 W em dois motores fica abaixo do de 1.600 W de motor único.",
      "Vale um aviso sobre o peso. Esses aparelhos vão de 3,7 a 30 kg. O tambor de aço que aguenta água e cavaco de obra é o mesmo que não sobe escada, e nenhuma ficha chama atenção para isso — o peso está lá, na última linha, do lado das dimensões.",
    ],
  },
  {
    slug: "monitores-27-polegadas",
    categoria: "monitores",
    titulo: "Monitores de 27 polegadas",
    subtitulo:
      "A tela que a busca mais pede — e a armadilha: cinco dos sete daqui são Full HD, o que os deixa menos nítidos que qualquer 24 polegadas da mesma resolução.",
    buscaQueOrigina: "monitor 27 polegadas",
    posicaoNaSugestao: "1ª sugestão para “monitor”",
    criterio: "Fichas com tela de 27 polegadas declarada pelo fabricante.",
    filtro: (p) => p.specs.telaPol === 27,
    texto: [
      "“Monitor 27 polegadas” é a primeira sugestão da busca, à frente de “monitor gamer” e de “monitor 24 polegadas”. Vinte e sete virou o tamanho padrão do desejo — e é onde mora a confusão mais cara da categoria.",
      "Polegada mede a diagonal da tela. Não mede quantos pixels há nela. Quando os mesmos 1920 × 1080 são esticados de 24 para 27 polegadas, eles não aumentam de número — aumentam de tamanho. A imagem fica maior e **menos nítida**.",
      "Em densidade de pixels, um Full HD de 24 polegadas entrega 91,8 pontos por polegada. O mesmo Full HD em 27 cai para **81,6**. O QHD de 27 sobe para 108,8, e o 4K de 27 vai a 163,2 — o dobro do Full HD de mesmo tamanho.",
      "Cinco dos sete monitores de 27 desta base são Full HD. Quem troca um 24 por um 27 mantendo a resolução está comprando uma tela maior e mais borrada, e nenhuma ficha de fabricante faz essa conta — ela publica a polegada numa linha e a resolução em outra, como se fossem independentes.",
      "A densidade acima é conta nossa, feita a partir dos dois campos publicados. Não é número de fabricante, e está aqui justamente porque nenhum deles publica.",
      "O outro campo para ler com cuidado é o tempo de resposta. Os números desta lista vão de 0,5 a 5 ms e foram medidos de três maneiras diferentes — GtG, MPRT e MBR —, que não são comparáveis entre si. Cada ficha abaixo diz qual régua o fabricante usou.",
    ],
  },
  {
    slug: "monitores-24-polegadas",
    categoria: "monitores",
    titulo: "Monitores de 24 polegadas",
    subtitulo:
      "Todos Full HD, todos IPS, de 100 a 180 Hz. O que separa um do outro é a taxa — e um tempo de resposta medido com três réguas diferentes.",
    buscaQueOrigina: "monitor 24 polegadas",
    posicaoNaSugestao: "3ª sugestão para “monitor”",
    criterio: "Fichas com tela de 24 polegadas declarada pelo fabricante.",
    filtro: (p) => p.specs.telaPol === 24,
    texto: [
      "Vinte e quatro polegadas é o tamanho em que Full HD ainda faz sentido: são 91,8 pontos por polegada, contra 81,6 do mesmo Full HD numa tela de 27. Os sete monitores de 24 desta base são todos Full HD e todos de painel IPS, o que deixa a escolha concentrada em dois campos.",
      "O primeiro é a **taxa de atualização**, e ela varia de verdade: 100, 120, 144 e 180 Hz. Cem hertz já é o dobro dos 60 de um monitor de escritório antigo; de 144 para 180 o ganho é bem menor que a diferença de preço costuma sugerir.",
      "O segundo é o **tempo de resposta**, e aqui o número publicado não serve para comparar. Os valores desta lista vão de 0,5 a 5 ms, e foram medidos por três métodos diferentes:",
      "**GtG** mede a troca de um cinza para outro. **MPRT** mede a persistência da imagem, e costuma dar número menor para o mesmo painel. **MBR**, que a LG declara em dois modelos, é um modo de redução de desfoque que — pela própria LG — escurece a tela e desativa o FreeSync enquanto está ligado.",
      "Ou seja: o “0,5 ms” de um e o “1 ms” de outro e o “5 ms” de um terceiro são três réguas, não três posições na mesma régua. Cada ficha abaixo traz a medida ao lado do número, que é a única forma de ler isso sem se enganar.",
      "Nenhum dos sete publica cobertura de cor em sRGB de forma completa, e é o dado que decidiria a compra de quem edita foto.",
    ],
  },
  {
    slug: "air-fryers-220v",
    categoria: "cozinha",
    titulo: "Air fryers que funcionam em 220 V",
    subtitulo:
      "A primeira coisa que a busca pergunta sobre air fryer é a tomada. E a resposta está escrita de quatro jeitos diferentes: “220 V”, “127 V ou 220 V”, “110 V” e “127 V”.",
    buscaQueOrigina: "air fryer 220v",
    posicaoNaSugestao: "1ª sugestão para “air fryer”",
    criterio:
      "Fichas cuja tensão declarada inclui 220 V — tanto as exclusivas de 220 V quanto as bivolt.",
    filtro: (p) => typeof p.specs.tensao === "string" && p.specs.tensao.includes("220"),
    texto: [
      "As duas primeiras sugestões da busca para “air fryer” não são marca nem capacidade: são **220 V** e **110 V**. Antes de qualquer coisa, a pessoa quer saber se o aparelho liga na tomada dela.",
      "É uma pergunta simples que a categoria responde de forma confusa. Nas vinte fichas desta base, a tensão aparece escrita de quatro maneiras: “220 V”, “127 V ou 220 V”, “127 V” e “110 V”.",
      "As duas últimas descrevem a mesma tomada. A rede residencial brasileira de tensão baixa é nominalmente 127 V; “110 V” é como quase todo mundo continua chamando, e alguns fabricantes imprimem isso na ficha. Um aparelho declarado “110 V” e outro declarado “127 V” vão para o mesmo lugar da parede.",
      "Esta lista reúne as fichas cuja tensão declarada inclui 220 V — as exclusivas dessa tensão e as bivolt, que a ficha escreve como “127 V ou 220 V”. São a maioria da categoria, mas não a categoria inteira: há modelos que só existem na tensão baixa, e comprar um deles para uma tomada de 220 é prejuízo imediato.",
      "Uma ressalva importante: bivolt na ficha quase sempre significa chaveamento automático nos modelos recentes, mas **nem toda ficha diz se a troca é automática ou por chave**. Onde o fabricante não diz, este guia não afirma — e num aparelho de resistência, ligar na tensão errada com a chave no lugar errado queima na primeira vez.",
    ],
  },
  {
    slug: "roteadores-wifi-6",
    categoria: "conectividade",
    titulo: "Roteadores e sistemas Wi-Fi 6",
    subtitulo:
      "O padrão que a busca mais procura depois da marca — e onde o número que batiza o produto, AX3000, é uma soma de duas bandas que nenhum aparelho entrega junto.",
    buscaQueOrigina: "roteador wifi 6",
    posicaoNaSugestao: "2ª sugestão para “roteador”",
    criterio: "Fichas cujo padrão declarado é Wi-Fi 6 (802.11ax).",
    filtro: (p) => typeof p.specs.padraoWifi === "string" && p.specs.padraoWifi.includes("Wi-Fi 6"),
    texto: [
      "Depois da marca, o que mais se digita na busca de roteador é o padrão: **wifi 6**. E é justamente no nome desses aparelhos que mora o número mais mal lido da categoria.",
      "AX3000, AX1800, AX5400. Nenhum deles é uma velocidade. São a **soma** das velocidades das duas bandas. Um AX3000 é 574 Mb/s em 2,4 GHz mais 2.402 Mb/s em 5 GHz, o que dá 2.976 — arredondado para três mil.",
      "O seu celular conecta em uma banda de cada vez. Ele nunca vai ver 3000, porque essa soma não acontece em nenhum aparelho: acontece no catálogo. A comparação honesta entre dois roteadores é **banda de 5 GHz contra banda de 5 GHz**, e é essa coluna que as fichas abaixo trazem separada.",
      "A convenção é da indústria inteira, não de uma marca, e é por isso que ela passa despercebida: como todo mundo soma, a comparação entre produtos até funciona. O que não funciona é ler o número como a velocidade que você vai ter.",
      "O segundo campo para ler com atenção é a **cobertura em metro quadrado**, quando existe. Num sistema mesh ela costuma ser declarada para o kit de três unidades, e a listagem à venda é muitas vezes a de duas — o número certo do kit menor simplesmente não é publicado. Onde esta base encontrou esse caso, a condição está colada ao número.",
      "E nenhuma das fichas desta lista publica velocidade real medida a uma distância dada, com parede no meio. Os números são de barramento, no melhor caso — que é o oposto da situação que leva alguém a comprar um roteador novo.",
    ],
  },
];

/** Os produtos de um recorte, já filtrados. */
export function produtosDoRecorte(r: Recorte): Produto[] {
  return produtosDaCategoria(r.categoria).filter(r.filtro);
}

export function recorte(slug: string): Recorte | undefined {
  return recortes.find((r) => r.slug === slug);
}

/** Os recortes de uma categoria, para a página dela linkar. */
export function recortesDaCategoria(slug: string): Recorte[] {
  return recortes.filter((r) => r.categoria === slug);
}

/**
 * Cobra no build as três exigências documentadas no topo. Quebrar o build é o
 * ponto: recorte que murchou sai do ar em silêncio, e página fina no ar é
 * prejuízo para o domínio inteiro, não só para ela.
 */
function verificar() {
  const conhecidas = new Set(categorias.map((c) => c.slug));
  const vistos = new Set<string>();
  for (const r of recortes) {
    if (vistos.has(r.slug)) {
      throw new Error(`Recorte duplicado: "${r.slug}".`);
    }
    vistos.add(r.slug);

    if (!conhecidas.has(r.categoria)) {
      throw new Error(
        `Recorte "${r.slug}" aponta para a categoria "${r.categoria}", que não existe em lib/categorias.ts.`,
      );
    }

    const todos = produtosDaCategoria(r.categoria);
    const dentro = todos.filter(r.filtro);

    if (dentro.length < N_MINIMO) {
      throw new Error(
        `Recorte "${r.slug}" pegou ${dentro.length} produto(s), abaixo do mínimo de ${N_MINIMO}. ` +
          `Com menos que isso a página não compara nada — corrija o filtro, amplie a categoria ou remova o recorte.`,
      );
    }

    if (dentro.length === todos.length) {
      throw new Error(
        `Recorte "${r.slug}" pegou a categoria "${r.categoria}" inteira (${todos.length} de ${todos.length}). ` +
          `Isso é a página da categoria com outro endereço — conteúdo duplicado, e das duas o buscador escolhe uma.`,
      );
    }

    const corrido = r.texto.join(" ");
    if (corrido.length < TEXTO_MINIMO) {
      throw new Error(
        `Recorte "${r.slug}" tem ${corrido.length} caracteres de texto, abaixo do mínimo de ${TEXTO_MINIMO}. ` +
          `Sem texto próprio a página é uma consulta salva, não uma página. Se não há o que dizer sobre o recorte, ele não devia existir.`,
      );
    }
  }
}

verificar();

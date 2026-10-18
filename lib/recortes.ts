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
  /**
   * De onde veio a sugestão. Os sete primeiros recortes (19/09/2026) saíram
   * das sugestões da busca da Amazon; os de 17/10/2026, do autocomplete do
   * Google. A página escreve a fonte e a data, porque "é o que as pessoas
   * digitam" sem dizer onde é afirmação sem fonte.
   */
  fonteSugestao?: "amazon" | "google";
  /** Data da consulta à sugestão (ISO). */
  consultadaEm?: string;
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
      "A KitchenAid fecha o argumento por cima. A linha dela inteira vai de **275 a 350 W** — abaixo de qualquer batedeira comum de Britânia ou Philco, que começam em 350 e chegam a 550. E a maior de todas, a Profissional de 7,6 L, tem 325 W: vinte e cinco a **menos** que a Bowl-Lift de 5,6 L da mesma marca.",
      "O que a Profissional tem de sobra aparece noutro campo, que só essa marca publica: **2 kg de farinha e 4 kg de massa de pão**, contra 1,1 e 1,8 da Artisan. A capacidade de trabalho dobra enquanto o watt cai. Nenhuma outra marca desta base publica quanta massa a batedeira leva — e é essa a pergunta de quem compra uma planetária.",
      "Duas marcas publicam o tipo em campo de especificação. As outras deixam a palavra só no nome ou no texto de diferenciais — a KitchenAid descreve “movimento planetário com 59 pontos de contato” em prosa, e é de lá que sai a classificação dela aqui. Fichas que não declaram em lugar nenhum ficam de fora deste recorte.",
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
  // ---------------------------------------------------------------------
  // Doze recortes de 17/10/2026, a partir do autocomplete do Google (não da
  // busca da Amazon, como os sete acima). Levantamento em docs/estado: os
  // sites que ranqueiam em "melhor air fryer" têm um guia por tamanho, marca
  // e tipo; este site tinha um por categoria. Cada recorte abaixo responde a
  // uma sugestão literal do autocomplete, com as fichas que já existem.
  // ---------------------------------------------------------------------
  {
    slug: "air-fryers-12-litros",
    categoria: "cozinha",
    titulo: "Air fryer de 12 litros: oven, forno e o que cabe no cesto",
    subtitulo:
      "As de 10 litros ou mais. Seis fichas, e só duas dizem quanto cabe de comida — e as duas discordam sobre o que “capacidade” significa.",
    buscaQueOrigina: "air fryer 12 litros",
    posicaoNaSugestao: "a sugestão mais repetida para “air fryer” (com Mondial, Electrolux, Oster, Philco e WAP atrás)",
    fonteSugestao: "google",
    consultadaEm: "2026-10-17",
    criterio: "Fichas com capacidade total declarada de 10 litros ou mais.",
    filtro: (p) => typeof p.specs.capacidadeTotalL === "number" && p.specs.capacidadeTotalL >= 10,
    texto: [
      "“Air fryer 12 litros” é o complemento que o Google mais sugere para “air fryer”, antes de qualquer marca. É a prateleira das air fryers de porta frontal, chamadas de oven ou forno — e é onde o número do nome mais se afasta do que cabe dentro.",
      "Os 12 litros são a caixa. O que cabe de comida é o cesto, a bandeja ou a grade, e **só duas das seis fichas desta lista declaram esse segundo número** — e discordam sobre o que ele é. A Mondial AFON-12L escreve 12 litros de capacidade total e **5 litros úteis**, com **400 g de batata por vez** no manual. A Philips Walita AI551 escreve 12 litros nos dois campos: para ela, a capacidade útil é a caixa inteira.",
      "O número da Mondial é o mais revelador da categoria: 400 g de batata numa air fryer de 12 litros é **menos do que a AFN-40 da mesma marca**, de 4 litros, declara aceitar — 500 g. A oven tem espaço para um frango, não para mais batata: a altura da câmara serve à peça inteira, e a grade plana serve a uma camada só.",
      "Nas outras quatro fichas — Philco PFR2200P e PAF15C, Oster OFRT780 e WAP Barbecue Digital — a capacidade útil não existe em campo nenhum. A Philco PAF15C declara 15 litros e nada mais sobre o que cabe; a WAP tem 10 litros num formato próprio, cesto com chapa e tampa superior, que não é oven.",
      "A tomada decide antes do cesto. Das seis, **duas só existem em 127 V** (Mondial AFON-12L e Philco PFR2200P), **uma só em 220 V** (WAP) e três são bivolt. Numa air fryer de 1.600 a 2.000 W, ligar na tensão errada não é desempenho pior: é a resistência queimada.",
      "O último campo que separa a lista é a garantia: Philips Walita e WAP declaram **24 meses**; Mondial, Philco e Oster, 12. E a Oster OFRT780 é a única das seis que não publica temperatura máxima.",
    ],
  },
  {
    slug: "air-fryers-ate-5-litros",
    categoria: "cozinha",
    titulo: "Air fryer pequena, de 3,5 a 5,5 litros: quanta batata cabe",
    subtitulo:
      "As de cesto compacto, de 1.400 a 1.900 W. Quatro das seis fichas dizem quantos gramas de batata cabem por vez — mais do que as grandes dizem.",
    buscaQueOrigina: "air fryer 4 litros",
    posicaoNaSugestao: "sugerida junto com “air fryer 5 litros”, “4 5 litros” e “5l mondial” para “air fryer”",
    fonteSugestao: "google",
    consultadaEm: "2026-10-17",
    criterio: "Fichas com capacidade total declarada de até 5,5 litros.",
    filtro: (p) => typeof p.specs.capacidadeTotalL === "number" && p.specs.capacidadeTotalL > 0 && p.specs.capacidadeTotalL <= 5.5,
    texto: [
      "Depois de “12 litros”, o que o Google mais sugere para “air fryer” é o tamanho oposto: 4 litros, 5 litros, “4 5 litros”. É a air fryer de cesto, para uma ou duas pessoas, e é a faixa em que a ficha responde melhor à pergunta que importa.",
      "A pergunta é quanta comida cabe, e aqui **quatro das seis fichas respondem em gramas de batata**: 500 g na Oster OFRT520 (4,6 L) e na Mondial AFN-40 (4 L), 800 g na Mondial AFN-50 (5 L) e na Britânia BFR50 (5,5 L). Nas air fryers grandes da mesma base, de 10 litros para cima, só uma ficha em seis publica esse número — e publica 400 g.",
      "Ou seja: a Mondial AFN-50, de 5 litros, declara aceitar **o dobro de batata** da Mondial AFON-12L, de 12 litros. A caixa pequena com cesto fundo leva mais batata em camada do que a caixa grande com grade plana. É o tipo de conta que o litro do nome esconde e a ficha, quando publica, mostra.",
      "Nenhuma das seis declara capacidade útil em litros — o campo que separaria caixa de cesto. A Elgin Facilita Fry, de 3,5 L, é a única que fala em pessoas (“1 a 2”), e é também a única que não declara garantia nem temperatura máxima.",
      "A tomada importa tanto quanto nas grandes: **Philco PAF40A e Mondial AFN-50 só existem em 220 V**, a Oster OFRT520 só em 127 V, e as outras três são bivolt. A potência vai de 1.400 W (Elgin) a 1.900 W (AFN-50), e o painel é analógico, de botão giratório, em quatro; duas não dizem.",
    ],
  },
  {
    slug: "air-fryers-127v",
    categoria: "cozinha",
    titulo: "Air fryer 127 V (110 V): as que só ligam na tensão baixa",
    subtitulo:
      "Sete fichas que não funcionam em 220 V, escritas de dois jeitos — “127 V” e “110 V” — para a mesma tomada. É o espelho da lista de 220 V.",
    buscaQueOrigina: "air fryer 127v",
    posicaoNaSugestao: "sugerida para “air fryer”, ao lado de “220v”",
    fonteSugestao: "google",
    consultadaEm: "2026-10-17",
    criterio: "Fichas cuja tensão declarada é só 127 V ou 110 V, sem 220 V.",
    filtro: (p) => typeof p.specs.tensao === "string" && !p.specs.tensao.includes("220"),
    texto: [
      "A lista de 220 V existe desde setembro, e esta é o complemento dela: as air fryers que **só** ligam na tensão baixa. Comprar uma destas para uma tomada de 220 é a resistência queimada na primeira vez, e o anúncio nem sempre deixa isso à vista.",
      "São sete fichas, e a tensão está escrita de dois jeitos. **Três dizem “110 V”** — as três da Philips Walita, NA341, NA230 e NA130 — e **quatro dizem “127 V”**: Mondial AFON-12L, Philco PFR2200P e PAF65A, Oster OFRT520. É a mesma tomada: a rede residencial brasileira de tensão baixa é nominalmente 127 V, e “110” é como boa parte do mercado continua chamando.",
      "A lista tem de tudo: a oven de 12 litros da Mondial, a de 7,2 litros com visor da Walita, a compacta de 4,6 litros da Oster. O que elas têm em comum não é tamanho nem preço — é não existir em versão de 220 V no catálogo que a base leu. Para quem mora em estado de 220 V, essas sete saem da escolha antes de qualquer outro campo.",
      "A Philips Walita é o caso mais interessante: as três fichas dela aqui declaram **24 meses de garantia**, contra 12 das outras quatro, e as três são as únicas desta base que publicam o campo “110 V” em vez de “127 V” — o fabricante que mais documenta usa o nome antigo.",
      "Das vinte air fryers da base, dez são bivolt, três só 220 V e estas sete só 127 V. A ficha não diz se a bivolt troca de tensão sozinha ou por chave; onde o fabricante não escreve, este site não afirma.",
    ],
  },
  {
    slug: "air-fryers-com-visor",
    categoria: "cozinha",
    titulo: "Air fryer com visor (janela de vidro): quem declara na ficha",
    subtitulo:
      "Cinco fichas declaram a janela para ver a comida sem abrir. Quinze não dizem nada — e “não diz” não é “não tem”.",
    buscaQueOrigina: "air fryer com visor de vidro",
    posicaoNaSugestao: "sugerida para “air fryer com”, ao lado de “cesto de vidro” e “dois cestos”",
    fonteSugestao: "google",
    consultadaEm: "2026-10-17",
    criterio: "Fichas em que o fabricante declara visor (janela) para ver o alimento.",
    filtro: (p) => p.specs.visor === true,
    texto: [
      "“Air fryer com visor de vidro” é uma das sugestões do Google para “air fryer com”, e é um recurso que muda o uso: ver a batata sem abrir a gaveta, que perde o calor toda vez.",
      "É também um campo que **quase nenhuma ficha publica**. Das vinte air fryers da base, cinco declaram o visor; as outras quinze não dizem que têm nem que não têm. Pela regra deste site, ausência de menção é “não informa”, e por isso esta lista tem cinco — não porque as outras não tenham janela, mas porque o fabricante não escreveu.",
      "Três das cinco são Philips Walita: NA341 (7,2 L), NA230 (6,2 L) e a oven AI551 (12 L). As outras duas são Philco, PAF65A (6,5 L) e PAF95A (9,5 L). Nas duas marcas o visor vem junto com painel digital de toque — a AI551 é a única que não declara o tipo de painel.",
      "A NA341 é a ficha mais completa da categoria inteira, e dá para ver por que: além do visor, declara **4,7 litros úteis** dentro dos 7,2 da caixa e **1 kg de batata por vez** — o maior número de batata da base, numa air fryer que não é a maior. A NA230 declara 6,2 litros úteis para 6,2 de caixa, o que diz mais sobre como a Walita preenche o campo do que sobre o cesto.",
      "Duas das cinco, NA341 e NA230, só existem em 110 V; a PAF65A, só em 127 V; AI551 e PAF95A são bivolt. A garantia é de 24 meses nas três Walita e de 12 nas duas Philco.",
    ],
  },
  {
    slug: "monitores-144hz",
    categoria: "monitores",
    titulo: "Monitor 144 Hz ou mais: taxa, resposta e as três réguas",
    subtitulo:
      "Doze fichas de 144 a 320 Hz. Nove são Full HD, e o tempo de resposta vem medido por três métodos que não se comparam entre si.",
    buscaQueOrigina: "monitor 144hz",
    posicaoNaSugestao: "sugerida para “monitor”, com “144hz 1ms”, “144hz 24 polegadas” e “144hz 27 polegadas” atrás",
    fonteSugestao: "google",
    consultadaEm: "2026-10-17",
    criterio: "Fichas com taxa de atualização declarada de 144 Hz ou mais.",
    filtro: (p) => typeof p.specs.taxaHz === "number" && p.specs.taxaHz >= 144,
    texto: [
      "“Monitor 144hz” é a sugestão do Google que mais se desdobra: 144hz 1ms, 144hz 24 polegadas, 144hz 27 polegadas, 144hz curvo. Cento e quarenta e quatro virou o número de entrada do monitor para jogo — e nesta base ele é o piso, não o teto.",
      "As doze fichas vão de 144 a **320 Hz**. Quatro ficam nos 144 (LG 24G411A e 27G411B, AOC 24G50F e 27G50F), três nos 165 (os Odyssey G5 da Samsung), duas nos 180 (LG 24GS60F e 27GS60F), e depois 200 (LG 27G523B), 240 (Dell SE2426HG) e 320 (Alienware AW2525HM).",
      "O segundo número do anúncio, o “1 ms”, é onde a ficha engana mais. Os valores aqui vão de 0,5 a 1 ms, e foram medidos por **três réguas diferentes**: GtG em seis fichas, MPRT em quatro e MBR em duas. A LG declara o MBR dos dois G411 como um modo que, pela própria LG, **escurece a tela e desliga o FreeSync** enquanto está ligado. O “0,5 ms” da AOC é MPRT. O “0,5 ms” da Dell é GtG. Não são o mesmo meio milissegundo.",
      "**Nove das doze são Full HD.** Com 144 Hz ou mais, o painel de 27 polegadas em 1920 × 1080 é o mais comum da lista — e é a combinação menos nítida, como a lista de 27 polegadas explica. As exceções são os três Odyssey: QHD em 27 e 32, e UWQHD no de 34, todos VA.",
      "Dois campos que decidem a mesa e poucos olham: **ajuste de altura**, declarado em três (AOC 24G50F e 27G50F, Alienware), negado em seis e não informado nos três Samsung; e **garantia**, de 12 meses em oito, **36 meses** em Dell e Alienware, e sem declaração em dois LG (27GS60F e 27G523B).",
    ],
  },
  {
    slug: "monitores-ate-100hz",
    categoria: "monitores",
    titulo: "Monitor para trabalho: os de 60 a 100 Hz, pela ficha",
    subtitulo:
      "Seis fichas sem pretensão de jogo. Quatro declaram 5 ms GtG, nenhuma declara sincronização, e só uma declara ajuste de altura.",
    buscaQueOrigina: "melhor monitor para trabalho",
    posicaoNaSugestao: "sugerida para “melhor monitor”, ao lado de “para ps5” e “custo benefício”",
    fonteSugestao: "google",
    consultadaEm: "2026-10-17",
    criterio: "Fichas com taxa de atualização declarada de até 100 Hz.",
    filtro: (p) => typeof p.specs.taxaHz === "number" && p.specs.taxaHz > 0 && p.specs.taxaHz <= 100,
    texto: [
      "“Melhor monitor para trabalho” aparece no autocomplete junto com “para ps5” e “custo-benefício”, e é a busca que menos se importa com hertz. Esta lista é o avesso da de 144 Hz: as fichas que ficam em 100 Hz ou menos.",
      "São seis. Quatro de 100 Hz — LG 24MS500 e 27MS500, Samsung Essential S3 24 e S4 24 —, uma de 75 (LG 20U401A, de 20 polegadas e HD+, a única TN da base) e uma de 60: o AOC U27B3A, **o único monitor 4K desta base**, que troca taxa por resolução.",
      "Para trabalho, o que a ficha declara importa mais do que o que ela destaca. **Quatro das seis publicam 5 ms GtG** — a régua honesta, e um número que nenhum anúncio de monitor gamer imprime. **Nenhuma das seis declara sincronização** (FreeSync ou G-SYNC), exceto o AOC 4K, que declara Adaptive-Sync. E o brilho fica em 250 nits em quatro delas, 350 no AOC, e não informado no LG de 20 polegadas.",
      "O campo que mais decide um dia de trabalho é o **ajuste de altura**, e aqui só a Samsung S4 24 declara que tem. LG 24MS500, 27MS500, 20U401A e a S3 declaram que não; o AOC também não. Monitor fixo em altura é pescoço — e a ficha avisa, para quem lê a linha.",
      "A garantia é de 12 meses em quatro; o LG 27MS500 e o AOC U27B3A não a declaram. Entre as seis, o único com resolução acima do Full HD é o 4K da AOC, a 60 Hz, que para texto e planilha rende 163 pontos por polegada contra 82 de um Full HD de 27 — conta nossa, a partir dos dois campos publicados.",
    ],
  },
  {
    slug: "monitores-lg",
    categoria: "monitores",
    titulo: "Monitor LG: 24 e 27 polegadas, de 75 a 200 Hz, pela ficha",
    subtitulo:
      "Oito fichas, todas IPS e Full HD menos uma. A LG é a única marca da base que declara, em todos os modelos, que o monitor NÃO tem ajuste de altura.",
    buscaQueOrigina: "monitor 24 polegadas lg",
    posicaoNaSugestao: "sugerida para “monitor 24 polegadas” e “monitor 27 polegadas”, junto com Samsung e AOC",
    fonteSugestao: "google",
    consultadaEm: "2026-10-17",
    criterio: "Fichas de monitor cujo fabricante é a LG.",
    filtro: (p) => p.marca === "LG",
    texto: [
      "Quando a busca chega a “monitor 24 polegadas”, o Google completa com três marcas: LG, Samsung e AOC. A LG é a que tem mais fichas nesta base, oito, e a que publica a “Especificação chave” no fim de cada página — o que torna a leitura campo a campo mais fácil do que na concorrência.",
      "As oito vão de 75 a 200 Hz. A linha MS (24MS500 e 27MS500) fica nos 100 Hz com 5 ms GtG, sem sincronização. A linha G (24G411A, 27G411B, 24GS60F, 27GS60F, 27G523B) vai de 144 a 200 Hz. E o 20U401A, de 20 polegadas e HD+, é o único TN e o único abaixo de Full HD — **sete das oito são Full HD e IPS**.",
      "O campo em que a LG se distingue não é um número: é um “não”. **As oito fichas declaram ajuste de altura, e as oito declaram que não têm.** Samsung deixa o campo em branco em quatro dos seis modelos. Dizer que não tem é informação; deixar em branco é silêncio — e a nota de transparência deste site conta a diferença.",
      "O tempo de resposta é a armadilha da marca. Os dois G411 declaram **1 ms MBR**, e a própria LG escreve que o MBR é um modo de redução de desfoque que escurece a tela e desativa o FreeSync e o DAS enquanto está ativo. Os GS60F e o G523B declaram 1 ms GtG, que é outra medida. O mesmo “1 ms” aparece nas cinco fichas e significa duas coisas.",
      "O brilho declarado vai de 250 a 300 nits, sem informação no 20U401A. A garantia é de 12 meses em seis fichas; o 27GS60F e o 27G523B não a declaram, e são justamente dois dos modelos mais novos da lista.",
    ],
  },
  {
    slug: "monitores-samsung",
    categoria: "monitores",
    titulo: "Monitor Samsung: Essential ou Odyssey, pela ficha",
    subtitulo:
      "Seis fichas em dois mundos: os Essential S3 e S4, IPS de 100 a 120 Hz, e os Odyssey G5, VA de 165 Hz que só declaram o tempo de resposta em MPRT.",
    buscaQueOrigina: "monitor 24 polegadas samsung",
    posicaoNaSugestao: "sugerida para “monitor 24 polegadas”, junto com LG e AOC",
    fonteSugestao: "google",
    consultadaEm: "2026-10-17",
    criterio: "Fichas de monitor cujo fabricante é a Samsung.",
    filtro: (p) => p.marca === "Samsung",
    texto: [
      "A Samsung vende, nesta base, dois monitores que não se parecem. Os **Essential** — S3 24 de 100 Hz, S3 24 de 120 Hz e S4 24 — são IPS, Full HD, 5 ms GtG, 250 nits, sem sincronização declarada. Os **Odyssey G5** — 27, 32 e 34 polegadas — são VA, 165 Hz, QHD ou UWQHD, com FreeSync, e dois deles curvos em 1000R.",
      "O que separa as duas linhas na ficha, além dos números, é a régua do tempo de resposta. Os Essential declaram **5 ms GtG**. Os Odyssey declaram **1 ms MPRT**, e a Samsung não publica o GtG deles em lugar nenhum — a ficha deste site registra isso ao lado do número. Cinco milissegundos GtG e um milissegundo MPRT não estão na mesma escala, e a diferença entre as linhas é menor do que “5 contra 1” sugere.",
      "O ajuste de altura é o campo que a Samsung menos preenche: **só o S4 24 declara que tem**; o S3 de 100 Hz declara que não; o S3 de 120 Hz e os três Odyssey deixam em branco. Num monitor de 34 polegadas curvo, saber se a base sobe não é detalhe.",
      "O brilho vai de 250 nits (Essential e G5 34) a 300 (G5 27 e 32). A garantia é de 12 meses nas seis. E a Samsung Shop, de onde as fichas saem, tem uma API de catálogo que devolve a tabela inteira — é a fonte mais estável da categoria, e por isso os números aqui são os mais fáceis de conferir.",
      "Para quem procura “monitor 24 polegadas samsung”, a resposta da ficha é a linha Essential: três modelos de 24, todos IPS e Full HD, separados pela taxa (100 ou 120 Hz) e pela altura ajustável, que só o S4 tem por escrito.",
    ],
  },
  {
    slug: "celulares-carga-sem-fio",
    categoria: "celular",
    titulo: "Celular com carga sem fio (indução): quem declara a potência",
    subtitulo:
      "Sete fichas declaram a potência da carga sem fio, de 15 a 25 W — e as sete são da Apple. O que os Android da base dizem, e não dizem, sobre o mesmo campo.",
    buscaQueOrigina: "qual celular carrega por indução",
    posicaoNaSugestao: "sugerida para “qual celular”, com “celular com carregamento por indução” para “celular com”",
    fonteSugestao: "google",
    consultadaEm: "2026-10-17",
    criterio: "Fichas em que o fabricante declara a potência da carga sem fio, em watts.",
    filtro: (p) => typeof p.specs.cargaSemFioW === "number",
    texto: [
      "“Qual celular carrega por indução” é uma pergunta que o Google completa sozinho, e a resposta pela ficha é mais estreita do que a resposta pelo mercado: **sete fichas da base declaram a potência da carga sem fio, e as sete são iPhones**.",
      "A Apple publica o número em todas: **25 W** no iPhone 16, 17, 18 Pro, 18 Pro Max e Duo, **20 W** no iPhone Air e **15 W** no 17e. É o mesmo fabricante que não publica a capacidade da bateria em mAh — publica, no lugar, as horas de vídeo, de 22 a 44 nesta lista.",
      "Do lado Android, a lista está vazia, e vale dizer por quê. O Galaxy A17 declara, com todas as letras, que **não tem** carga sem fio — ausência escrita, que a ficha registra como “não se aplica”. O Galaxy A57 tem um campo “carregamento sem fio” preenchido com “45W” na tabela da Samsung Shop, ao lado de um campo de carga rápida preenchido com “5000mAh”: dois valores trocados de lugar, e este site não adivinha qual é qual. Os Motorola e o POCO não mencionam o campo.",
      "Então esta lista não diz que só o iPhone carrega sem fio. Diz que só a Apple **escreve quantos watts**. Para quem compra pensando no carregador de mesa, a potência importa — 15 W e 25 W são quase o dobro de diferença no tempo de carga —, e é o número que o anúncio Android costuma deixar para a caixa.",
      "Dois detalhes das sete fichas: nenhuma declara garantia no Brasil, e as sete declaram IP68 com **6 metros por 30 minutos** — a profundidade mais alta publicada na base, o quádruplo do 1,5 m que a Motorola declara para o mesmo selo.",
    ],
  },
  {
    slug: "celulares-ip68",
    categoria: "celular",
    titulo: "Celular IP68: o mesmo selo, de 1,5 a 6 metros declarados",
    subtitulo:
      "Catorze fichas com IP68. O selo é um só; a profundidade e o tempo que cada fabricante escreve embaixo dele vão de “não diz” a 6 metros por 30 minutos.",
    buscaQueOrigina: "celular à prova d'água",
    posicaoNaSugestao: "a pergunta que acompanha “é bom?” nas buscas por modelo, como “moto g35 é resistente a água”",
    fonteSugestao: "google",
    consultadaEm: "2026-10-17",
    criterio: "Fichas em que a proteção declarada inclui IP68.",
    filtro: (p) => typeof p.specs.protecaoAgua === "string" && p.specs.protecaoAgua.includes("IP68"),
    texto: [
      "IP68 é o selo que o anúncio chama de “à prova d'água”, e catorze das vinte fichas de celular da base o declaram. O que a norma garante é imersão contínua acima de um metro, sob condições que **cada fabricante define** — e é nessa definição que as fichas se separam.",
      "A Apple escreve **6 metros por 30 minutos** nas sete fichas de iPhone. A Motorola escreve **1,5 metro por 30 minutos, em água doce**, no Moto g56 e no Edge 60 Fusion, e acrescenta o IP69 — jato de água quente — nos dois e no g86. A Samsung (Galaxy A57, A37 e S25 FE) e a Xiaomi (POCO X8 Pro) declaram “IP68” e **nenhuma profundidade**.",
      "São quatro vezes de diferença entre o que a Apple e a Motorola prometem embaixo do mesmo selo, e um silêncio no caso da Samsung — que pode significar o mesmo 1,5 m da norma mínima ou qualquer coisa acima. Pela ficha, não dá para saber, e este site não completa.",
      "O rodapé da Motorola acrescenta o que mais importa para quem compra: a exposição fora desses parâmetros **não é coberta pela garantia**, e a resistência diminui com o desgaste. A Apple escreve o equivalente nas páginas de especificação. É a letra pequena que transforma “à prova d'água” em “resiste a uma queda na piscina, uma vez”.",
      "Seis fichas ficam fora da lista, e três delas pelo motivo certo: o Galaxy A17 e o A07 declaram **IP54**, o Moto g06 e o g17 declaram **IP64** (respingo, não imersão), e o Moto g35 declara que **não é resistente a água nem a imersão** — escrito, no rodapé da página oficial. Ausência declarada é informação; as outras ficam fora por silêncio.",
    ],
  },
  {
    slug: "celulares-samsung",
    categoria: "celular",
    titulo: "Celular Samsung: Galaxy A e S25 FE, o que a ficha não diz",
    subtitulo:
      "Cinco fichas da Samsung Shop. Nenhuma declara brilho de pico, quatro não declaram taxa de atualização, e duas deixam a carga sem número.",
    buscaQueOrigina: "melhor celular da samsung",
    posicaoNaSugestao: "sugerida para “melhor celular”, ao lado de “da motorola” e “da xiaomi”",
    fonteSugestao: "google",
    consultadaEm: "2026-10-17",
    criterio: "Fichas de celular cujo fabricante é a Samsung.",
    filtro: (p) => p.marca === "Samsung",
    texto: [
      "“Melhor celular da Samsung” é uma das três marcas que o Google completa para “melhor celular”. A resposta deste site não é um modelo: é o que as cinco fichas da marca — Galaxy A07, A17, A37, A57 e S25 FE — publicam e deixam de publicar.",
      "O que elas publicam bem: **capacidade da bateria em mAh** (4.900 a 5.000), peso, dimensões, proteção contra água e **12 meses de garantia**, escritos na página de cada produto. É mais do que a Apple declara em qualquer ficha da base, que não publica mAh nem garantia.",
      "O que elas não publicam é o que decide a tela. **Nenhuma das cinco declara brilho de pico**, e **quatro não declaram taxa de atualização** — os 90 Hz do A17 só estão na ficha porque a listagem da Amazon informou, e por isso vêm marcados como varejo. A Motorola, na mesma faixa, publica os dois números.",
      "A carga é o campo mais estranho da marca. A17 e A07 declaram 25 W com fio; a A37, 45 W. **A57 e S25 FE ficam sem número**: na tabela da Samsung Shop do A57, o campo de carga sem fio traz “45W” e o de carga rápida traz “5000mAh” — dois valores no lugar errado, e este site não escolhe por conta própria qual é qual.",
      "A proteção separa a linha ao meio: A17 e A07 declaram **IP54** (respingo e poeira); A37, A57 e S25 FE declaram IP68, sem profundidade. E o eSIM existe em A37 e A57, não existe no A17 e no A07, e fica sem resposta no S25 FE, cuja ficha diz só “Dual SIM”.",
    ],
  },
  {
    slug: "celulares-motorola",
    categoria: "celular",
    titulo: "Celular Motorola: da linha Moto g ao Edge, pela ficha",
    subtitulo:
      "Seis fichas, do Moto g06 de 10 W ao Edge 60 Fusion de 68 W, todas com carregador na caixa declarado. As diferenças estão no corpo da página, não só na tabela.",
    buscaQueOrigina: "melhor celular da motorola",
    posicaoNaSugestao: "sugerida para “melhor celular”, com “moto g 06”, “g 17”, “g 35”, “g 56” e “g 86” para “moto g”",
    fonteSugestao: "google",
    consultadaEm: "2026-10-17",
    criterio: "Fichas de celular cujo fabricante é a Motorola.",
    filtro: (p) => p.marca === "Motorola",
    texto: [
      "“Melhor celular da Motorola” e “qual Moto g comprar” são buscas que o Google completa sozinho, e a linha inteira está nesta base: Moto g06, g17, g35, g56 e g86, mais o Edge 60 Fusion. Seis fichas que respondem à pergunta em quatro campos.",
      "**Carga.** Vai de 10 W (g06) a 20 (g17 e g35), 33 (g56 e g86) e **68 W** (Edge), e as seis declaram que o carregador vem na caixa — no conteúdo da embalagem, listado peça por peça. É o campo em que a Motorola mais se distingue da Apple, que vende o adaptador à parte.",
      "**Água.** O g06 e o g17 declaram IP64, respingo; o g35 declara, em nota de rodapé, que **não é resistente a água nem a imersão**; g56, g86 e Edge declaram IP68 com 1,5 m por 30 minutos e IP69. Três níveis de proteção numa linha só, e os três escritos.",
      "**Tela.** O brilho vai de 1.000 nits (g35 e g56) e 1.050 (g17) a **4.500 nits** no g86 e no Edge; o g06 não declara. A taxa é de 120 Hz em cinco e 60 no g17. O eSIM existe de g35 para cima; g06 e g17 têm dois nano SIM físicos — e no g35, g56, g86 e Edge a segunda entrada é do cartão de memória, então o segundo número vai por eSIM.",
      "O aviso que vale para as seis: **a tabela técnica da Motorola não é a ficha inteira.** Vidro, brilho, estabilização óptica, resistência a água e a capacidade certificada da bateria (5.100 mAh, para os 5.200 “comuns” do g56 e do g86) moram no corpo da página e nas notas de rodapé. As seis fichas foram relidas em outubro de 2026 com corpo e rodapé, e três delas ganharam campos que a tabela sozinha não dava.",
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

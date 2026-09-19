/**
 * A taxonomia é o esqueleto do site: cada análise, comparativo e guia pertence
 * a exatamente uma categoria. Comece com poucas e só abra uma nova quando houver
 * três peças para ela — categoria vazia é página fina aos olhos do Google.
 */
export type Categoria = {
  slug: string;
  nome: string;
  descricao: string;
  /** Pergunta que o leitor faz antes de comprar. Guia o ângulo das análises. */
  dorPrincipal: string;
  /**
   * Por que a categoria fechou no número em que fechou. Só preencher quando ela
   * parou porque a documentação acabou — não quando ainda está em apuração, que
   * é outra coisa e não deve ser anunciada como parada. A contagem não entra
   * aqui: a página conta os produtos sozinha, para os dois nunca divergirem.
   */
  porQueParou?: string;
};

export const categorias: Categoria[] = [
  {
    slug: "energia",
    nome: "Energia e carregamento",
    descricao: "Powerbanks, carregadores, cabos e tudo que mantém o celular vivo fora de casa.",
    dorPrincipal: "Vai aguentar o dia inteiro sem virar peso morto na mochila?",
    porQueParou:
      "Carregador e powerbank são o território do vendedor sem marca. Na lista geral de Carregadores da Amazon, sete dos trinta mais vendidos tinham fabricante identificável; foi preciso descer para Carregadores Portáteis, onde são vinte e dois, e é de lá que vem a maior parte destes. A Geonav, quarta do ranking, estava com o site fora do ar na apuração — volta quando voltar.",
  },
  {
    slug: "audio",
    nome: "Áudio",
    descricao: "Fones sem fio, fones com fio, caixas de som e microfones.",
    dorPrincipal: "O cancelamento de ruído funciona no ônibus ou só no vídeo do fabricante?",
  },
  {
    slug: "perifericos",
    nome: "Periféricos",
    descricao: "Teclados, mouses, webcams e o que fica entre você e o computador.",
    dorPrincipal: "Aguenta oito horas por dia sem cansar a mão?",
    porQueParou:
      "Mousepad ficou de fora de propósito: ocupa um terço da lista de mais vendidos e não tem campo comparável além do tamanho. Do resto do ranking, Logitech e Multilaser são as que publicam ficha aberta, campo a campo. HP, Dell, Redragon, C3Tech e Fortrek aparecem bem colocadas e não têm página de produto com especificação legível — sem isso não há ficha, só o título do anúncio, que não é fonte.",
  },
  {
    slug: "monitores",
    nome: "Monitores",
    descricao: "Monitores de computador, com a taxa, o painel e o tempo de resposta como o fabricante declara — e em que condição.",
    dorPrincipal: "O \"1 ms\" é GtG ou MPRT, e os 144 Hz precisam de overclock?",
  },
  {
    slug: "armazenamento",
    nome: "Armazenamento",
    descricao:
      "Pen drives, SSDs internos e externos, HDs portáteis e cartões — com a velocidade de escrita ao lado da de leitura, quando o fabricante publica as duas.",
    dorPrincipal: "O número da caixa é de leitura. Quanto tempo leva para copiar para dentro?",
    porQueParou:
      "Duas marcas, SanDisk e Kingston, são as que publicam ficha aberta e campo a campo. A Seagate divulga especificação só em PDF de imagem, sem texto dentro. Toshiba, Western Digital, ADATA e Multilaser continuam em apuração. Preferimos parar aqui a completar a lista com fichas que a documentação não sustenta.",
  },
  {
    slug: "conectividade",
    nome: "Redes e Wi-Fi",
    descricao:
      "Roteadores, repetidores, sistemas mesh e adaptadores — com o número do nome desmontado banda por banda.",
    dorPrincipal: "O \"AX3000\" do nome é a soma das duas bandas. Quanto sai de verdade em uma?",
  },
  {
    slug: "casa-conectada",
    nome: "Casa conectada",
    descricao: "Tomadas inteligentes, lâmpadas, câmeras e assistentes de voz.",
    dorPrincipal: "Funciona com o aplicativo que você já usa ou obriga a instalar mais um?",
    porQueParou:
      "Casa inteligente não é uma lista de mais vendidos na Amazon Brasil: tomada e lâmpada aparecem em Elétrica e Iluminação, câmera em Proteção e Segurança. Em cada uma dessas listas, os aparelhos conectados são três a cinco entre vinte — o resto é extensão, adaptador e luva. Estes são os que sobraram com fabricante e ficha publicada.",
  },
  {
    slug: "smartwatches",
    nome: "Smartwatches",
    descricao:
      "Relógios e pulseiras inteligentes, com a autonomia separada entre uso típico e uso intenso — quando a marca publica os dois.",
    dorPrincipal: "\"Até 25 dias\" em que uso? Só uma marca aqui publica o número do uso pesado.",
    porQueParou:
      "Fechou em nove, com três marcas. A Samsung tem três no ranking e publica a ficha só no HTML da página de produto, com rótulo e valor separados no DOM — precisa de navegador, não de fetch, e ficou para a próxima. A Apple tem duas e a página de especificação responde, mas não deu tempo nesta rodada. O resto do ranking é Bettdow, PEJE e Haiz: marca branca sem página de fabricante.",
  },
  {
    slug: "celular",
    nome: "Celulares",
    descricao: "Smartphones, com o que a ficha oficial declara e o que ela deixa de fora.",
    dorPrincipal: "A bateria do anúncio é em horas de vídeo — quantos mAh a marca não diz?",
  },
  {
    slug: "tablets",
    nome: "Tablets",
    descricao: "Tablets Android e iPad, com o que vem na caixa e o que a ficha promete de atualização.",
    dorPrincipal: "A caneta vem na caixa ou só é \"compatível\"?",
  },
  {
    slug: "cozinha",
    nome: "Airfryers",
    descricao: "Fritadeiras sem óleo de cesto e de forno, com os litros da caixa separados dos litros do cesto.",
    dorPrincipal: "Os litros do anúncio são de cesto ou de caixa?",
  },
  {
    slug: "cafeteiras",
    nome: "Cafeteiras",
    descricao: "Cafeteiras elétricas de filtro, com as \"xícaras\" do anúncio convertidas em litros.",
    dorPrincipal: "A xícara do anúncio tem 40 ml — quantas canecas de verdade isso dá?",
  },
  {
    slug: "lavadoras",
    nome: "Máquinas de lavar",
    descricao:
      "Lavadoras de carga superior, com o consumo de água por ciclo ao lado dos quilos do anúncio.",
    dorPrincipal: "Duas máquinas de 15 kg: uma gasta 110 litros por lavagem e a outra, 160.",
    porQueParou:
      "Fechou em oito. A lista de mais vendidos mistura cinco produtos diferentes — lavadora automática, lava e seca, secadora, centrífuga e tanquinho semiautomático —, e cada um pede o seu esquema; aqui entraram só as automáticas de carga superior. A Suggar aparece no ranking e o site dela responde 404. O modelo de 16 kg da Brastemp que está na lista é o branco, e o que achei no catálogo da marca é o cinza, com outros recursos: sem casar o código, não entra.",
  },
  {
    slug: "lavaloucas",
    nome: "Lava-louças",
    descricao:
      "Lava-louças de piso e de bancada, com o consumo de água por ciclo ao lado dos serviços do anúncio.",
    dorPrincipal: "Nenhuma ficha da categoria publica os dois consumos: ou a água, ou a energia.",
    porQueParou:
      "Fechou em onze. Electrolux, Brastemp e Philco publicam ficha e entraram inteiras. A Midea aparece bem colocada com títulos que dizem só a capacidade e a cor, sem código de modelo — e o catálogo dela tem vários modelos da mesma capacidade, então não dá para casar. Samsung, EOS e Praxis também estão no ranking sem ficha alcançável.",
  },
  {
    slug: "geladeiras",
    nome: "Geladeiras",
    descricao:
      "Geladeiras de uma e duas portas, inverse e French Door — com os litros do anúncio separados entre geladeira e freezer.",
    dorPrincipal: "Os 377 litros do anúncio somam geladeira e freezer. Quanto é só geladeira?",
    porQueParou:
      "Fechou em nove. Consul, Brastemp e Electrolux publicam ficha completa e as três entraram inteiras. A lista de mais vendidos mistura geladeira com freezer e frigobar, que são outros produtos e pedem outro esquema; a Hisense aparece nela e o site brasileiro da marca responde 404; e os dois modelos B= Smart da Brastemp não foram encontrados no catálogo dela com o código do anúncio. Voltam quando casar.",
  },
  {
    slug: "microondas",
    nome: "Micro-ondas",
    descricao:
      "Micro-ondas de bancada, com os litros da caixa separados dos litros que dá para usar — quando o fabricante publica os dois.",
    dorPrincipal: "Os 21 litros do anúncio viram 11 de uso. Quantos você está comprando de verdade?",
    porQueParou:
      "Fechou em 17 porque só cinco marcas do ranking publicam ficha. Midea e Fischer aparecem entre as mais vendidas e não têm página com especificação alcançável; o site da Panasonic responde 403 e a loja dela, que é a fonte usada aqui, responde. Britânia e Philco entram com cinco campos cada — é pouco, mas é o que elas publicam, e a nota de transparência delas mostra isso melhor do que a ausência mostraria.",
  },
  {
    slug: "ventiladores",
    nome: "Ventiladores",
    descricao:
      "Ventiladores de coluna, mesa e torre — com o diâmetro da hélice separado do diâmetro da grade, que é o número do anúncio.",
    dorPrincipal: "O \"50 cm\" do anúncio é a grade. A hélice, que move o ar, tem 40.",
    porQueParou:
      "Fechou em dez. O nó de ventiladores é dividido em oito — coluna, mesa, torre, parede, teto, chão, circulador e de grampo — e aqui entraram coluna, mesa e torre. Mondial, Britânia, Arno, WAP e Mallory publicam ficha e entraram; a Ventisol aparece bem colocada nos três nós e o site dela não responde à API. Vários modelos do ranking não casaram com o catálogo do fabricante pelo código, e não entram sem isso.",
  },
  {
    slug: "espremedores",
    nome: "Espremedores de frutas",
    descricao:
      "Espremedores de cítricos, com a rotação alternada e o número de cones ao lado da potência que todo anúncio estampa.",
    dorPrincipal: "De 30 a 260 W para a mesma laranja. O que os watts a mais compram?",
    porQueParou:
      "Fechou em nove. A lista de mais vendidos junta quatro produtos diferentes — espremedor de cítricos, centrífuga de alimentos, prensa a frio e até centrífuga de roupa e triturador de pia —, e aqui entraram só os de cítricos. Tramontina e Cuisinart aparecem no ranking e não têm catálogo brasileiro alcançável; o Mondial E-04 não foi encontrado no catálogo da marca com o código do anúncio.",
  },
  {
    slug: "chaleiras",
    nome: "Chaleiras elétricas",
    descricao:
      "Chaleiras elétricas de 1,7 a 2 litros, com a potência de cada tensão separada e o tempo de fervura quando a marca publica.",
    dorPrincipal: "Quanto tempo leva para ferver? Uma marca em nove responde.",
    porQueParou:
      "Fechou em nove, uma de cada marca — todas as do ranking que têm ficha de fabricante. Metade da lista de mais vendidos é de vendedor sem marca, com títulos que só repetem \"inox, desligamento automático\"; sem página de fabricante não há ficha. Agratto, Black+Decker e BEST aparecem no ranking e não responderam.",
  },
  {
    slug: "torradeiras",
    nome: "Torradeiras",
    descricao:
      "Torradeiras elétricas de duas fatias, com os níveis de tostagem ao lado do que cada marca deixa de dizer sobre eles.",
    dorPrincipal: "O nível 4 de uma marca não é o nível 4 da outra. Nenhuma diz o que cada um faz.",
    porQueParou:
      "Fechou em doze, com sete marcas — todas as do ranking que têm ficha de fabricante. Ficaram de fora a Ariete e a Smeg, que não têm catálogo brasileiro aberto, e os itens do nó que não são torradeira: torneira elétrica, torrador de café e prensa de sanduíche.",
  },
  {
    slug: "sanduicheiras",
    nome: "Sanduicheiras e grills",
    descricao:
      "Sanduicheiras, grills de abertura 180°, máquinas de waffle e churrasqueiras de mesa — com a pergunta da loja no lugar da potência da caixa.",
    dorPrincipal: "Cabem dois sanduíches de uma vez ou só um? Quase nenhuma ficha responde.",
  },
  {
    slug: "liquidificadores",
    nome: "Liquidificadores",
    descricao: "Liquidificadores de bancada, com a capacidade do copo separada da que dá para bater de verdade.",
    dorPrincipal: "O copo tem 3 litros — mas quantos cabem sem transbordar?",
  },
];

export function categoria(slug: string): Categoria | undefined {
  return categorias.find((c) => c.slug === slug);
}

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

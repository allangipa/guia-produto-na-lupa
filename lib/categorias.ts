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
};

export const categorias: Categoria[] = [
  {
    slug: "energia",
    nome: "Energia e carregamento",
    descricao: "Powerbanks, carregadores, cabos e tudo que mantém o celular vivo fora de casa.",
    dorPrincipal: "Vai aguentar o dia inteiro sem virar peso morto na mochila?",
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
    descricao: "SSDs externos, pendrives, cartões de memória e HDs portáteis.",
    dorPrincipal: "A velocidade anunciada aparece no uso ou só na caixa?",
  },
  {
    slug: "conectividade",
    nome: "Hubs, adaptadores e redes",
    descricao: "Hubs USB-C, adaptadores, roteadores e repetidores Wi-Fi.",
    dorPrincipal: "Resolve a falta de porta sem esquentar e sem derrubar a velocidade?",
  },
  {
    slug: "casa-conectada",
    nome: "Casa conectada",
    descricao: "Tomadas inteligentes, lâmpadas, câmeras e assistentes de voz.",
    dorPrincipal: "Funciona com o aplicativo que você já usa ou obriga a instalar mais um?",
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
    slug: "liquidificadores",
    nome: "Liquidificadores",
    descricao: "Liquidificadores de bancada, com a capacidade do copo separada da que dá para bater de verdade.",
    dorPrincipal: "O copo tem 3 litros — mas quantos cabem sem transbordar?",
  },
];

export function categoria(slug: string): Categoria | undefined {
  return categorias.find((c) => c.slug === slug);
}

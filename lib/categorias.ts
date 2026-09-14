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
    nome: "Monitores e suportes",
    descricao: "Monitores, braços articulados e suportes de notebook.",
    dorPrincipal: "Vale o pulo de tamanho ou de resolução para o que você faz?",
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
    slug: "cozinha",
    nome: "Cozinha",
    descricao: "Airfryers, liquidificadores e o que mais liga na tomada da bancada.",
    dorPrincipal: "Os litros do anúncio são de cesto ou de caixa?",
  },
];

export function categoria(slug: string): Categoria | undefined {
  return categorias.find((c) => c.slug === slug);
}

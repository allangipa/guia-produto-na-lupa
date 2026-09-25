export const site = {
  nome: "Guia Produto na Lupa",
  descricao:
    "Comparação de fichas técnicas oficiais de tecnologia, acessórios e casa, para quem já está quase comprando e quer saber o que o fabricante deixa de fora.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://guiaprodutonalupa.com.br",
  /**
   * Quem responde pelo conteúdo é a publicação, não uma pessoa: este site não
   * testa produtos e não tem repórter em campo, então assinar com nome próprio
   * sugeriria uma experiência de primeira mão que não existe. O Google não exige
   * autor-pessoa; exige saber quem responde e por qual método — daí o /sobre
   * descrever o processo, e o e-mail de contato ser real.
   */
  editor: {
    nome: "Guia Produto na Lupa",
    resumo:
      "Publicação independente que compara fichas técnicas oficiais, na mesma unidade, e mede a transparência de cada fabricante.",
    contato: "contato@guiaprodutonalupa.com.br",
    url: "/sobre",
  },
  /**
   * ID de Associado da Amazon.com.br, aprovado em 14/09/2026. Não é segredo —
   * vai em toda URL de loja do site — então fica no código, com a variável de
   * ambiente só para sobrescrever em outro deploy.
   */
  // `||`, não `??`: no GitHub Actions a variável existe e chega vazia, e o
  // `??` deixava o vazio vencer o padrão — os botões subiram sem a tag.
  amazonTag: process.env.NEXT_PUBLIC_AMAZON_TAG || "guiaprodutona-20",
  /**
   * Medição de audiência. Vazio = desligada, e o site sobe sem script nenhum.
   *
   * A escolha foi por uma ferramenta **sem cookie e sem dado pessoal**, e o
   * motivo não é ideológico: com cookie, a LGPD exige banner de consentimento,
   * e banner é exatamente a camada que aparece sozinha e interrompe — o que
   * este site não faz nem quando é o próprio site pedindo. Some também o
   * custo de manter o banner correto.
   *
   * Sem o ID a tag não é renderizada, então o padrão é não medir nada.
   */
  /**
   * Token de verificacao do Google Search Console.
   *
   * Vazio = a meta tag nao e renderizada, e o site sobe sem ela. Preencher em
   * Settings > Secrets and variables > Actions > Variables, como
   * NEXT_PUBLIC_GOOGLE_VERIFICATION — assim o token entra direto no GitHub,
   * sem passar por conversa nenhuma.
   *
   * Nao e segredo: a tag existe para ficar visivel no HTML, e e so isso que o
   * Google le para confirmar que o dominio e de quem diz ser. Fica em variavel
   * e nao no codigo porque o repositorio e publico e o token e de uma conta.
   *
   * Sem Search Console o site nao tem numero nenhum de busca: nem impressao,
   * nem posicao media, nem quais paginas ja aparecem. Toda a auditoria de SEO
   * feita aqui e raciocinio sobre a estrutura, nao leitura de desempenho.
   */
  verificacaoGoogle: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || "",
  umami: {
    id: process.env.NEXT_PUBLIC_UMAMI_ID || "",
    script: process.env.NEXT_PUBLIC_UMAMI_SCRIPT || "https://cloud.umami.is/script.js",
  },
} as const;

/**
 * A Amazon exige que o link carregue o ID de afiliado.
 * O Mercado Livre exige o contrário: o link gerado no painel
 * deve ser usado sem nenhuma modificação — por isso ele passa intacto.
 */
/**
 * AS LOJAS QUE O SITE PODE APONTAR, E COMO CADA UMA SE ESCREVE.
 *
 * Existe porque o botao vai deixar de ser so da Amazon. Decisao do Allan em
 * 25/09/2026: "no botao que hoje so tem comprar na amazon, nos outros vai
 * estar comprar na loja que contem o produto".
 *
 * A PREPOSICAO E CAMPO, E NAO SE ADIVINHA
 *
 * Em portugues o artigo muda com o nome: e "na Amazon", "no Mercado Livre",
 * "nas Casas Bahia". Montar a frase com um "na" fixo produziria "na Mercado
 * Livre" na primeira loja nova que entrasse. Cada loja declara a sua.
 *
 * O LINK DE CADA PROGRAMA TEM REGRA PROPRIA
 *
 * A Amazon EXIGE que o link carregue a tag de afiliado; o Mercado Livre exige
 * o contrario, que o link gerado no painel passe sem nenhuma modificacao. Por
 * isso `link` e opcional: ausente significa "passa intacto", que e o
 * comportamento seguro por padrao. Loja nova so ganha transformacao se o
 * programa dela pedir por escrito.
 *
 * A ORDEM E DECLARADA, E NAO E NEUTRA
 *
 * Quando um produto tem mais de uma loja, a primeira leva o botao solido e as
 * outras ficam com o contorno - a regra da casa e que exista UMA cor de acao
 * por pagina. A ordem esta aqui em numero para ser mudada numa linha, e hoje
 * a Amazon vem primeiro porque e o unico programa aprovado com meta de vendas
 * em prazo. Mudar o numero muda o site inteiro.
 */
export type DefinicaoLoja = {
  /** Como a loja se chama na frase do botao. */
  nome: string;
  /** "na", "no", "nas" ou "nos" — o artigo que antecede o nome. */
  preposicao: string;
  /** Menor vem primeiro, e o primeiro leva o botao solido. */
  ordem: number;
  /** So quando o programa exigir. Ausente = o link passa intacto. */
  link?: (url: string) => string;
};

export const LOJAS: Record<string, DefinicaoLoja> = {
  amazon: { nome: "Amazon", preposicao: "na", ordem: 1, link: linkAmazon },
  mercadolivre: { nome: "Mercado Livre", preposicao: "no", ordem: 2 },
  magalu: { nome: "Magazine Luiza", preposicao: "na", ordem: 3 },
  americanas: { nome: "Americanas", preposicao: "na", ordem: 4 },
  casasbahia: { nome: "Casas Bahia", preposicao: "nas", ordem: 5 },
  shopee: { nome: "Shopee", preposicao: "na", ordem: 6 },
  aliexpress: { nome: "AliExpress", preposicao: "no", ordem: 7 },
  kabum: { nome: "KaBuM!", preposicao: "na", ordem: 8 },
};

/** "Comprar na Amazon", "Comprar no Mercado Livre", "Comprar nas Casas Bahia". */
export function rotuloCompra(chave: string): string {
  const l = LOJAS[chave];
  if (!l) return "Comprar na loja";
  return `Comprar ${l.preposicao} ${l.nome}`;
}

/** O link pronto para a loja, com a transformacao que o programa dela exige. */
export function linkDaLoja(chave: string, url: string): string {
  const l = LOJAS[chave];
  return l?.link ? l.link(url) : url;
}

/**
 * As lojas que este produto tem, na ordem declarada em LOJAS.
 *
 * Chave desconhecida nao e ignorada em silencio: `verificarLojas()`, em
 * lib/conteudo.ts, quebra o build. Um "magazineluiza" onde se esperava
 * "magalu" sumiria da tela sem erro nenhum, e o link de afiliado sumiria
 * junto.
 */
export function lojasDe(lojas: Record<string, string | undefined>) {
  return Object.entries(lojas)
    .filter(([chave, url]) => url && LOJAS[chave])
    .sort((a, b) => LOJAS[a[0]].ordem - LOJAS[b[0]].ordem)
    .map(([chave, url]) => ({ chave, url: url as string }));
}

export function linkAmazon(url: string): string {
  if (!site.amazonTag) return url;
  try {
    const u = new URL(url);
    u.searchParams.set("tag", site.amazonTag);
    return u.toString();
  } catch {
    return url;
  }
}

/**
 * A imagem que aparece quando alguem cola o link numa conversa.
 *
 * Existia em 1 das 566 paginas: todo link compartilhado do site saia como um
 * retangulo vazio no WhatsApp e nas redes, com 463 fotos licenciadas de
 * fabricante paradas nas fichas. Nao muda ranking — muda quantas pessoas
 * clicam no link que alguem passou adiante.
 *
 * Devolve `{}` quando nao ha foto, de proposito: pagina sem imagem propria
 * herda so o que o layout define, e o site nao inventa uma arte generica para
 * fingir que tem.
 *
 * `metadataBase` no layout resolve o caminho relativo para absoluto, que e o
 * que as redes exigem.
 */
export function ogImagem(img?: { src: string; alt: string }) {
  return img ? { images: [{ url: img.src, alt: img.alt }] } : {};
}

/**
 * O <title> que vai para o resultado de busca.
 *
 * O <title> e o <h1> sao coisas diferentes e nao precisam ser iguais: o
 * primeiro e o anuncio no Google, o segundo e o comeco da leitura. O site
 * usava o mesmo texto nos dois, e 320 das 566 paginas passavam de 65
 * caracteres — cortadas no meio no resultado, o que custa clique.
 *
 * Em 290 delas a culpa era so do sufixo " | Guia Produto na Lupa", que come 22
 * caracteres. Entao o sufixo passa a ser condicional: entra quando cabe, sai
 * quando nao cabe. A marca aparece no dominio e na trilha; titulo truncado nao
 * ajuda ninguem.
 *
 * Devolve `{ absolute }` para escapar do `title.template` do layout, que e
 * estatico e nao sabe medir.
 *
 * As paginas de titulo editorial longo — comparativo e analise — nao se
 * resolvem por aqui: cortar frase por regra produz titulo feio. Essas tem
 * `tituloCurto` escrito a mao no frontmatter.
 */
export const LIMITE_TITULO = 60;
const SUFIXO = ` | ${site.nome}`;

export function tituloSeo(t: string) {
  return t.length + SUFIXO.length <= LIMITE_TITULO ? t : { absolute: t };
}

/** Passa de `LIMITE_TITULO` mesmo sem o sufixo? Entao precisa de titulo curto. */
export function tituloLongoDemais(t: string) {
  return t.length > LIMITE_TITULO;
}

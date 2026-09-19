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

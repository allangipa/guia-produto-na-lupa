export const site = {
  nome: "Guia Produto na Lupa",
  descricao:
    "Análises de tecnologia e acessórios escritas para quem já está quase comprando e quer saber onde o produto falha.",
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
  amazonTag: process.env.NEXT_PUBLIC_AMAZON_TAG ?? "guiaprodutona-20",
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

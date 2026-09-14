export const site = {
  nome: "Guia Produto na Lupa",
  descricao:
    "Análises de tecnologia e acessórios escritas para quem já está quase comprando e quer saber onde o produto falha.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://guiaprodutonalupa.com.br",
  autor: {
    nome: "Allan Vitor",
    bio: "Escreve sobre tecnologia e acessórios desde 2026.",
    url: "/sobre",
  },
  amazonTag: process.env.NEXT_PUBLIC_AMAZON_TAG ?? "",
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

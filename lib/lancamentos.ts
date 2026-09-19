/**
 * Lançamentos em destaque na home.
 *
 * Um lançamento aqui é um produto da base que o fabricante ainda está pondo à
 * venda — pré-venda aberta ou marcada. As datas vêm da página oficial e ficam
 * escritas com a fonte, como qualquer outro dado do site. Nada de contagem
 * regressiva: o site diz a data e para por aí.
 *
 * Quando a data de loja passar, tirar daqui; o produto continua na categoria.
 */
export type Lancamento = {
  /** `slug` em `dados/<categoria>.json`. */
  slugProduto: string;
  titulo: string;
  resumo: string;
  /** Estado curto para a pastilha: "Pré-venda aberta", "Pré-venda em 16/10". */
  etapa: string;
  preVenda: string;
  nasLojas: string;
  comparativoSlug?: string;
  fonte: { titulo: string; url: string; consultadaEm: string };
};

/**
 * Se a data de "nas lojas" já passou.
 *
 * A regra acima — tirar daqui quando a data passar — continua valendo, mas ela
 * depende de alguém lembrar, e enquanto ninguém lembrava a home seguia
 * anunciando pré-venda de um aparelho que já estava à venda. O iPhone 18 Pro
 * entrou nas lojas em 18/09/2026 e no dia 19 a faixa ainda dizia "Pré-venda
 * aberta". Agora a etiqueta vira sozinha na passagem do dia.
 *
 * Data inválida devolve `false`: no escuro, o site não afirma que já está à
 * venda — prefere errar para o lado de não prometer.
 */
export function jaNasLojas(l: Lancamento, hoje = new Date()): boolean {
  const [d, m, a] = l.nasLojas.split("/").map(Number);
  if (!d || !m || !a) return false;
  return Date.UTC(a, m - 1, d) <= hoje.getTime();
}

export const lancamentos: Lancamento[] = [
  {
    slugProduto: "iphone-18-pro",
    titulo: "iPhone 18 Pro e 18 Pro Max",
    resumo:
      "Chip A20 Pro, câmera principal de 48 MP com abertura variável, teleobjetiva de 4x e USB 3. Pela ficha da Apple, 34 horas de vídeo no Pro e 43 no Pro Max — com 211 g e 8,75 mm, mais pesado e mais grosso que o iPhone 17.",
    etapa: "Pré-venda aberta",
    preVenda: "Aberta",
    nasLojas: "18/09/2026",
    comparativoSlug: "iphone-18-pro-vs-iphone-17",
    fonte: {
      titulo: "apple.com/br/iphone-18-pro",
      url: "https://www.apple.com/br/iphone-18-pro/",
      consultadaEm: "2026-09-14",
    },
  },
  {
    slugProduto: "iphone-duo",
    titulo: "iPhone Duo",
    resumo:
      "O primeiro iPhone dobrável: 7,6 polegadas aberto, 5,4 fechado, Touch ID no botão lateral e só eSIM. 254 gramas — o mais pesado da linha.",
    etapa: "Pré-venda em 16/10",
    preVenda: "16/10/2026, 9h",
    nasLojas: "23/10/2026",
    fonte: {
      titulo: "apple.com/br/iphone-duo",
      url: "https://www.apple.com/br/iphone-duo/",
      consultadaEm: "2026-09-14",
    },
  },
];

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type Loja = {
  amazon?: string;
  mercadolivre?: string;
};

export type Criterio = {
  nome: string;
  nota: number; // 0 a 10
  comentario: string;
};

/**
 * De onde uma fonte fala, e por isso quanto ela vale como confirmação.
 *
 * A distinção existe para não cair na armadilha mais comum deste tipo de site:
 * cinco lojas anunciando o mesmo número não são cinco confirmações, são o texto
 * do fabricante copiado cinco vezes. Só `regulador` e `laboratorio` confirmam
 * de verdade, porque mediram ou registraram por conta própria.
 *
 * No Brasil, `regulador` é sobretudo a homologação da Anatel — pública,
 * independente e com dado técnico que às vezes contradiz o marketing.
 */
export type TipoFonte = "fabricante" | "regulador" | "laboratorio" | "varejo";

export const FONTES_INDEPENDENTES: TipoFonte[] = ["regulador", "laboratorio"];

export const rotuloTipoFonte: Record<TipoFonte, string> = {
  fabricante: "Fabricante",
  regulador: "Órgão regulador",
  laboratorio: "Laboratório independente",
  varejo: "Varejo",
};

/**
 * Página de onde o dado saiu. O site não testa produto: a única coisa que
 * separa uma análise daqui de uma cópia da loja é o leitor poder conferir cada
 * número na origem. Por isso `fontes` é obrigatório e o build quebra sem ele.
 */
export type Fonte = {
  /** Identificador curto, usado para apontar divergência e confirmação. */
  id?: string;
  titulo: string;
  url: string;
  tipo: TipoFonte;
  /** O que especificamente foi tirado desta página. */
  oQueSaiuDaqui: string;
  /** Data da consulta, ISO. Ficha técnica muda sem aviso. */
  consultadaEm: string;
};

/**
 * Imagem só entra com licença conhecida: press kit do fabricante, Product
 * Advertising API da Amazon ou banco com licença aberta. Crédito e origem são
 * obrigatórios porque foto de produto é obra protegida — salvar do Google
 * Imagens é infração, e nas lojas ainda viola os termos do programa de afiliado.
 */
export type Imagem = {
  src: string;
  alt: string;
  credito: string;
  origem: string;
};

export type Produto = {
  nome: string;
  marca: string;
  linhaResumo: string;
  imagem?: Imagem;
  lojas: Loja;
};

export type Review = {
  tipo: "review";
  slug: string;
  categoria: string;
  titulo: string;
  subtitulo: string;
  publicadoEm: string;
  atualizadoEm: string;
  produto: Produto;
  nota: number;
  criterios: Criterio[];
  para: string[];
  naoPara: string[];
  pros: string[];
  contras: string[];
  /** O que o fabricante não informa. A lacuna fica escrita; nunca se preenche com estimativa. */
  lacunas: string[];
  fontes: Fonte[];
  corpo: string;
};

export type Comparativo = {
  tipo: "comparativo";
  slug: string;
  categoria: string;
  titulo: string;
  subtitulo: string;
  publicadoEm: string;
  atualizadoEm: string;
  concorrentes: Produto[];
  linhas: { criterio: string; valores: string[] }[];
  vencedores: { perfil: string; produto: string; porque: string }[];
  lacunas: string[];
  fontes: Fonte[];
  corpo: string;
};

/**
 * Guia = página pilar da categoria ("melhores powerbanks"). É a que ranqueia
 * para a busca genérica e distribui link para as análises e comparativos.
 */
export type Guia = {
  tipo: "guia";
  slug: string;
  categoria: string;
  titulo: string;
  subtitulo: string;
  publicadoEm: string;
  atualizadoEm: string;
  /** Um pick por perfil de leitor, com link para a análise completa quando existir. */
  escolhas: {
    perfil: string;
    produto: string;
    porque: string;
    reviewSlug?: string;
    lojas: Loja;
  }[];
  lacunas: string[];
  fontes: Fonte[];
  corpo: string;
};

const RAIZ = path.join(process.cwd(), "content");

function ler<T>(pasta: string, tipo: "review" | "comparativo" | "guia"): T[] {
  const dir = path.join(RAIZ, pasta);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => {
      const bruto = fs.readFileSync(path.join(dir, f), "utf8");
      const { data, content } = matter(bruto);
      return {
        ...(data as object),
        tipo,
        slug: f.replace(/\.mdx$/, ""),
        corpo: content,
      } as T;
    })
    .sort((a, b) =>
      String((b as { publicadoEm: string }).publicadoEm).localeCompare(
        String((a as { publicadoEm: string }).publicadoEm),
      ),
    );
}

export function todosOsReviews(): Review[] {
  return ler<Review>("reviews", "review");
}

export function todosOsComparativos(): Comparativo[] {
  return ler<Comparativo>("comparativos", "comparativo");
}

export function todosOsGuias(): Guia[] {
  return ler<Guia>("guias", "guia");
}

export function guia(slug: string): Guia | undefined {
  return todosOsGuias().find((g) => g.slug === slug);
}

export function conteudoDaCategoria(slug: string) {
  return {
    guias: todosOsGuias().filter((g) => g.categoria === slug),
    reviews: todosOsReviews().filter((r) => r.categoria === slug),
    comparativos: todosOsComparativos().filter((c) => c.categoria === slug),
  };
}

export function review(slug: string): Review | undefined {
  return todosOsReviews().find((r) => r.slug === slug);
}

export function comparativo(slug: string): Comparativo | undefined {
  return todosOsComparativos().find((c) => c.slug === slug);
}

export function dataLegivel(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

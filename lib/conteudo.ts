import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { todosOsProdutos } from "./produtos";
import { aindaNaoSaiu } from "./specs";
import { LIMITE_TITULO, LOJAS } from "./site";

/**
 * As lojas de um produto, por chave: `{ amazon: "...", magalu: "..." }`.
 *
 * Era um tipo fechado com dois campos ate 25/09/2026. Abriu porque o site vai
 * apontar para varios parceiros, e cada loja nova exigia mexer no tipo, no
 * componente do botao e na home.
 *
 * As chaves validas moram em LOJAS, em lib/site.ts. `verificarLojas()`, no fim
 * deste arquivo, quebra o build quando aparece uma que nao esta la — senao um
 * "magazineluiza" escrito onde se esperava "magalu" sumiria da tela sem erro,
 * e o link de afiliado sumiria junto.
 */
export type Loja = Record<string, string | undefined>;

export type Criterio = {
  nome: string;
  nota: number; // 0 a 10
  /**
   * Quanto este criterio vale na nota final, de 0 a 1. A soma dos cinco tem
   * que dar 1 — `verificarCriterios()` quebra o build se nao der.
   *
   * O campo existe porque a /metodologia sempre prometeu que "cada criterio
   * tem seu peso, e o peso fica escrito na analise", e ate 25/09/2026 nao
   * havia onde escrever. A promessa era verdadeira no texto e falsa no
   * codigo.
   */
  peso: number;
  comentario: string;
};

/**
 * Os pesos da nota final, e por que cada um e o que e.
 *
 * Nao sao arbitrarios: saem da tese do site, que e julgar o que o fabricante
 * DOCUMENTA, e nao o produto em uso.
 *
 *   30%  O que a especificacao entrega — e a promessa principal do produto.
 *   25%  Transparencia da documentacao — e o eixo deste site. Pesa mais aqui
 *        do que pesaria em qualquer publicacao que testa produto, e e de
 *        proposito: marca que publica dado desfavoravel ganha por isso.
 *   20%  Compatibilidade e limites — e o que decide se o produto serve para
 *        VOCE, e o que mais gera arrependimento de compra.
 *   15%  Garantia e suporte no Brasil — importa, mas quase toda marca
 *        publica o minimo legal, entao separa pouco.
 *   10%  Materiais e construcao declarados — pesa menos porque e o criterio
 *        que a documentacao sustenta pior: a maioria das fichas nao diz
 *        quase nada, e um criterio em que quase todos empatam em branco
 *        carrega pouca informacao.
 *
 * Mudar um numero aqui muda as notas de todas as analises de uma vez, que e
 * exatamente o que se quer de um criterio publicado.
 */
export const PESOS_CRITERIOS: Record<string, number> = {
  "O que a especificação entrega": 0.3,
  "Transparência da documentação": 0.25,
  "Compatibilidade e limites": 0.2,
  "Garantia e suporte no Brasil": 0.15,
  "Materiais e construção declarados": 0.1,
};

/**
 * A nota final, calculada — nunca digitada.
 *
 * Ate 25/09/2026 a `nota` era escrita a mao no frontmatter, e tinha
 * derivado: em seis das oito analises ela era a media simples (que a
 * /metodologia jurava nao ser), e no Philips TAT1109 estava 1,4 ACIMA da
 * media dos proprios criterios — 4,2 publicado contra 2,8 apurado, no
 * produto pior avaliado da base.
 *
 * Numero que e funcao de outros numeros nao se digita. Agora ele e derivado
 * na leitura do arquivo, e nao ha como divergir.
 */
export function notaPonderada(criterios: Criterio[]): number {
  const soma = criterios.reduce((s, c) => s + c.nota * c.peso, 0);
  return Math.round(soma * 10) / 10;
}

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
  /**
   * O <title> do resultado de busca, quando o titulo editorial nao cabe nele.
   *
   * O <h1> continua sendo o `titulo` inteiro — quem abre a pagina le a frase
   * completa. Isto aqui e so o anuncio no Google, que corta perto de 60
   * caracteres. Cortar a frase por regra automatica produz titulo truncado
   * feio; escrever um curto a mao produz titulo que funciona.
   *
   * Obrigatorio quando `titulo` passa de 60 caracteres: o `verificar()` no fim
   * do arquivo quebra o build sem ele, para nao voltar a ter 320 paginas com o
   * titulo cortado no meio.
   */
  tituloCurto?: string;
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
  /**
   * O <title> do resultado de busca, quando o titulo editorial nao cabe nele.
   *
   * O <h1> continua sendo o `titulo` inteiro — quem abre a pagina le a frase
   * completa. Isto aqui e so o anuncio no Google, que corta perto de 60
   * caracteres. Cortar a frase por regra automatica produz titulo truncado
   * feio; escrever um curto a mao produz titulo que funciona.
   *
   * Obrigatorio quando `titulo` passa de 60 caracteres: o `verificar()` no fim
   * do arquivo quebra o build sem ele, para nao voltar a ter 320 paginas com o
   * titulo cortado no meio.
   */
  tituloCurto?: string;
  subtitulo: string;
  publicadoEm: string;
  atualizadoEm: string;
  concorrentes: Produto[];
  linhas: { criterio: string; valores: string[] }[];
  vencedores: { perfil: string; produto: string; porque: string }[];
  lacunas: string[];
  fontes: Fonte[];
  /**
   * Arte de capa do comparativo, opcional.
   *
   * Existe para o compartilhamento: é o que aparece quando alguém cola o link
   * no WhatsApp ou numa rede. Segue a mesma exigência de `credito` e `origem`
   * das fotos de produto — quando a arte monta render de fabricante, o crédito
   * diz de quem é o render, não só quem montou a peça.
   */
  imagem?: Imagem;
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
  /**
   * O <title> do resultado de busca, quando o titulo editorial nao cabe nele.
   *
   * O <h1> continua sendo o `titulo` inteiro — quem abre a pagina le a frase
   * completa. Isto aqui e so o anuncio no Google, que corta perto de 60
   * caracteres. Cortar a frase por regra automatica produz titulo truncado
   * feio; escrever um curto a mao produz titulo que funciona.
   *
   * Obrigatorio quando `titulo` passa de 60 caracteres: o `verificar()` no fim
   * do arquivo quebra o build sem ele, para nao voltar a ter 320 paginas com o
   * titulo cortado no meio.
   */
  tituloCurto?: string;
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
  // A `nota` do frontmatter, se houver, e ignorada: a nota vem dos criterios.
  return ler<Review>("reviews", "review").map((r) => ({
    ...r,
    nota: notaPonderada(r.criterios),
  }));
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

/**
 * O ASIN dentro de um link da Amazon, ou `undefined`.
 *
 * É o único identificador que aparece igual nos dois lados: na base de
 * produtos e no conteúdo editorial.
 */
export function asinDe(url?: string): string | undefined {
  return url?.match(/\/dp\/([A-Z0-9]{10})/)?.[1];
}

/**
 * O conteúdo editorial que apresenta um produto — análise, comparativo ou guia.
 *
 * Existe porque a ficha de produto era um beco sem saída: 434 páginas sem link
 * para as 14 comparações e as análises que falam delas. Quem chegava pela busca
 * numa ficha não tinha como descobrir que havia um comparativo do mesmo produto,
 * e o buscador também não.
 *
 * A ligação é pelo **ASIN**, não pelo nome. Casar por nome falha: o mesmo monitor
 * é "LG UltraGear 24G411A 24\"" no comparativo e "LG UltraGear 24G411A" na base,
 * e há nomes com aspas escapadas e polegadas que nenhuma normalização resolve.
 * Pelo ASIN, as 75 referências do conteúdo casam com a base — todas.
 *
 * Só conta produto **apresentado**: concorrente do comparativo, produto da
 * análise, escolha do guia. Link que aparece só na lista de fontes não entra,
 * porque citar a página de um produto não é falar dele.
 */
export function conteudoDoProduto(amazonUrl?: string) {
  const alvo = asinDe(amazonUrl);
  const vazio = { reviews: [] as Review[], comparativos: [] as Comparativo[], guias: [] as Guia[] };
  if (!alvo) return vazio;
  return {
    reviews: todosOsReviews().filter((r) => asinDe(r.produto.lojas.amazon) === alvo),
    comparativos: todosOsComparativos().filter((c) =>
      c.concorrentes.some((x) => asinDe(x.lojas.amazon) === alvo),
    ),
    guias: todosOsGuias().filter((g) =>
      g.escolhas.some((e) => asinDe(e.lojas.amazon) === alvo),
    ),
  };
}

/**
 * A foto oficial que a base tem para o produto de um conteúdo, achada pelo ASIN.
 *
 * O frontmatter dos MDX não carrega imagem — o produto lá é só nome, marca,
 * linha de resumo e lojas. A foto, com crédito e origem, vive em `dados/`. Sem
 * esta ponte, comparativos, análises e guias saiam sem `og:image`: 32 páginas
 * compartilhadas como retângulo vazio, com a foto parada a um ASIN de distância.
 *
 * Aceita vários produtos e devolve a primeira foto encontrada, porque num
 * comparativo qualquer um dos dois serve de capa.
 */
export function fotoDaBase(
  lojas: (Loja | undefined)[],
  nomes: string[] = [],
): Imagem | undefined {
  const base = todosOsProdutos();
  for (const l of lojas) {
    const alvo = asinDe(l?.amazon);
    if (!alvo) continue;
    const achado = base.find((p) => asinDe(p.lojas.amazon) === alvo);
    if (achado?.imagem) return achado.imagem;
  }
  // Reserva: nome exato. Produto sem link de loja — os WAP, por exemplo — nao
  // tem ASIN para casar, e o nome no MDX e o mesmo que esta em `dados/` porque
  // os dois sao escritos aqui. Exato de proposito: normalizar nome foi testado
  // e erra em 56 de 131 referencias.
  for (const n of nomes) {
    const achado = base.find((p) => p.nome === n);
    if (achado?.imagem) return achado.imagem;
  }
  return undefined;
}

/**
 * A data em que um produto chega às lojas, quando ela ainda não passou.
 *
 * Existe para a seção "Onde comprar cada um" de um guia. Escolha sem link
 * aparecia ali como nome pelado, sem botão e sem explicação, o que parece
 * defeito — e às vezes não é falta de pesquisa, é produto que ainda não saiu.
 * Casada por nome exato, como a reserva de `fotoDaBase`: o nome no MDX e o de
 * `dados/` são escritos no mesmo lugar.
 */
export function chegadaDe(nome: string): string | undefined {
  const achado = todosOsProdutos().find((p) => p.nome === nome);
  return achado && aindaNaoSaiu(achado) ? achado.nasLojasEm : undefined;
}

export function review(slug: string): Review | undefined {
  return todosOsReviews().find((r) => r.slug === slug);
}

export function comparativo(slug: string): Comparativo | undefined {
  return todosOsComparativos().find((c) => c.slug === slug);
}

/**
 * Cobra `tituloCurto` em todo conteudo cujo titulo nao cabe no resultado de
 * busca. Quebra o build de proposito, pela mesma razao dos outros
 * `verificar()` do projeto: titulo cortado no meio nao aparece errado na tela,
 * so no Google — ninguem descobre olhando o site.
 */
function verificarTitulos() {
  const longos: string[] = [];
  const curtoAindaLongo: string[] = [];
  const tudo = [
    ...todosOsComparativos().map((c) => ({ o: "comparativo", ...c })),
    ...todosOsReviews().map((r) => ({ o: "review", ...r })),
    ...todosOsGuias().map((g) => ({ o: "guia", ...g })),
  ];
  for (const x of tudo) {
    if (x.titulo.length > LIMITE_TITULO && !x.tituloCurto) {
      longos.push(`${x.o} "${x.slug}" (${x.titulo.length} caracteres)`);
    }
    if (x.tituloCurto && x.tituloCurto.length > LIMITE_TITULO) {
      curtoAindaLongo.push(`${x.o} "${x.slug}" (${x.tituloCurto.length})`);
    }
  }
  if (longos.length) {
    throw new Error(
      `Conteudo com titulo acima de ${LIMITE_TITULO} caracteres e sem \`tituloCurto\` no frontmatter: ` +
        `${longos.join("; ")}. O <h1> continua com o titulo inteiro; o \`tituloCurto\` e so o <title> do Google, ` +
        `que corta perto dai.`,
    );
  }
  if (curtoAindaLongo.length) {
    throw new Error(
      `\`tituloCurto\` acima de ${LIMITE_TITULO} caracteres: ${curtoAindaLongo.join("; ")}.`,
    );
  }
}

verificarTitulos();

/**
 * Os criterios de toda analise batem com os pesos publicados.
 *
 * Sem isto, o campo `peso` seria mais uma coisa escrita a mao que pode
 * divergir em silencio — que e exatamente o defeito que ele veio corrigir.
 *
 * Quebra o build quando: falta criterio, sobra criterio, o nome nao e um dos
 * cinco, o peso nao e o publicado em PESOS_CRITERIOS, ou a soma nao da 1.
 */
function verificarCriterios() {
  const canonicos = Object.keys(PESOS_CRITERIOS);
  const problemas: string[] = [];

  for (const r of ler<Review>("reviews", "review")) {
    const nomes = (r.criterios ?? []).map((c) => c.nome);

    for (const n of canonicos) {
      if (!nomes.includes(n)) problemas.push(`"${r.slug}" nao tem o criterio "${n}"`);
    }
    for (const n of nomes) {
      if (!canonicos.includes(n)) problemas.push(`"${r.slug}" tem criterio desconhecido "${n}"`);
    }
    for (const c of r.criterios ?? []) {
      const esperado = PESOS_CRITERIOS[c.nome];
      if (esperado === undefined) continue;
      if (typeof c.peso !== "number") {
        problemas.push(`"${r.slug}" > "${c.nome}" esta sem \`peso\``);
      } else if (Math.abs(c.peso - esperado) > 0.0001) {
        problemas.push(
          `"${r.slug}" > "${c.nome}" tem peso ${c.peso}, e o publicado e ${esperado}`,
        );
      }
      if (typeof c.nota !== "number" || c.nota < 0 || c.nota > 10) {
        problemas.push(`"${r.slug}" > "${c.nome}" tem nota fora de 0 a 10`);
      }
    }
    const soma = (r.criterios ?? []).reduce((s, c) => s + (c.peso ?? 0), 0);
    if (Math.abs(soma - 1) > 0.0001) {
      problemas.push(`"${r.slug}" tem pesos somando ${soma.toFixed(3)}, e tem de somar 1`);
    }
  }

  if (problemas.length) {
    throw new Error(
      "Criterios de analise fora da regra publicada em /metodologia: " +
        problemas.join("; ") +
        ". Os pesos moram em PESOS_CRITERIOS, em lib/conteudo.ts.",
    );
  }
}

verificarCriterios();

/**
 * Toda chave de loja usada no conteudo existe em LOJAS.
 *
 * Sem isto, uma chave errada nao daria erro nenhum: o botao simplesmente nao
 * apareceria, e a pagina iria ao ar sem link de afiliado. E o tipo `Loja` e
 * aberto de proposito, entao o TypeScript tambem nao pegaria.
 */
function verificarLojas() {
  const validas = Object.keys(LOJAS);
  const ruins = new Map<string, string[]>();

  const anota = (chave: string, onde: string) => {
    if (validas.includes(chave)) return;
    ruins.set(chave, [...(ruins.get(chave) ?? []), onde]);
  };

  for (const r of ler<Review>("reviews", "review")) {
    for (const c of Object.keys(r.produto?.lojas ?? {})) anota(c, `analise "${r.slug}"`);
  }
  for (const c of ler<Comparativo>("comparativos", "comparativo")) {
    for (const x of c.concorrentes ?? []) {
      for (const k of Object.keys(x.lojas ?? {})) anota(k, `comparativo "${c.slug}"`);
    }
  }
  for (const g of ler<Guia>("guias", "guia")) {
    for (const e of g.escolhas ?? []) {
      for (const k of Object.keys(e.lojas ?? {})) anota(k, `guia "${g.slug}"`);
    }
  }
  for (const p of todosOsProdutos()) {
    for (const k of Object.keys(p.lojas ?? {})) anota(k, `produto "${p.slug}"`);
  }

  if (ruins.size) {
    const lista = [...ruins.entries()]
      .map(([chave, ondes]) => `"${chave}" em ${[...new Set(ondes)].slice(0, 3).join(", ")}`)
      .join("; ");
    throw new Error(
      `Chave de loja desconhecida: ${lista}. As chaves validas sao ${validas.join(", ")}, ` +
        `e moram em LOJAS, no lib/site.ts. Loja nova entra la primeiro, com nome, preposicao e ordem.`,
    );
  }
}

verificarLojas();

export function dataLegivel(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

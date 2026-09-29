import type { Produto } from "./specs";
import type { Foco } from "./simulador";
import { calcularBtu, RESPOSTAS_AR } from "./simulador-ar";
import { mesesNaCasa } from "./simulador-refil";
import { COBERTURA, KIT_VENDIDO } from "./simulador-wifi";

/**
 * O texto e a tabela de cada página do simulador, desde 29/09/2026. Só roda
 * no build.
 *
 * A ferramenta é JavaScript; o buscador lê o HTML. Cada página leva, além do
 * questionário, uma tabela montada da base na hora do build — é o conteúdo que
 * o Google indexa e que responde à busca mesmo para quem não clica em nada.
 * Nenhum número daqui é digitado: sai das fichas ou da conta que a própria
 * ferramenta faz, e a tabela muda sozinha quando a base muda.
 */

/**
 * A descrição vai para o resultado de busca, e o Google corta perto de 155
 * caracteres. O build para se passar de 160 — descrição cortada no meio da
 * frase custa clique.
 */
export const LIMITE_DESCRICAO = 160;

export type PaginaFerramenta = {
  /** Título da aba e do resultado de busca. */
  seo: string;
  h1: string;
  descricao: string;
  intro: string[];
  /** Guia e categoria que a página indica no fim. */
  guia: { slug: string; nome: string };
  categoria: { slug: string; nome: string };
};

export const PAGINAS: Record<Foco, PaginaFerramenta> = {
  ar: {
    seo: "Calculadora de BTU: quantos BTUs o seu cômodo precisa",
    h1: "Calculadora de BTU para ar-condicionado",
    descricao:
      "Calcule os BTUs do ar-condicionado pelo tamanho do cômodo, pessoas, sol e aparelhos, com a conta da LG, e veja os splits que atendem.",
    intro: [
      "A conta não é nossa: é a do simulador de capacidade da LG — 600 BTU por metro quadrado, mais 600 por pessoa, mais 15% com muito sol e 20% no Norte, Nordeste e Centro-Oeste, mais a carga de TV, computador e geladeira.",
      "Quando o fabricante do split declara a área que o aparelho atende, ela aparece ao lado do resultado. Hoje só a Electrolux escreve a área na ficha; Midea e Elgin vendem por BTU e deixam a conversão para o comprador.",
    ],
    guia: { slug: "ar-condicionado", nome: "Guia de ar-condicionado" },
    categoria: { slug: "ar-condicionado", nome: "Ar-condicionado" },
  },
  nobreak: {
    seo: "Qual nobreak comprar: calcule a potência pelos seus aparelhos",
    h1: "Calculadora de nobreak",
    descricao:
      "Some os watts dos seus aparelhos e veja qual nobreak aguenta a carga — em watts, não em VA —, com forma de onda e PFC tirados da ficha oficial.",
    intro: [
      "O número grande da caixa é o VA; o que o aparelho consome é watt. Nesta base, os nobreaks de 600 VA que publicam o watt declaram entre 250 e 300 W. O simulador soma a carga em watts, compara com o watt que o fabricante declara e avisa quando a ficha só publica o VA.",
      "Para fonte de computador com PFC ativo, o simulador só indica nobreak de onda senoidal. A tabela abaixo mostra o que cada ficha declara sobre isso — e onde ela não diz nada.",
    ],
    guia: { slug: "nobreak-para-casa", nome: "Guia de nobreak para casa" },
    categoria: { slug: "nobreaks", nome: "Nobreaks" },
  },
  airfryer: {
    seo: "Qual tamanho de air fryer comprar: quanta batata cabe",
    h1: "Qual air fryer para a sua família",
    descricao:
      "Qual tamanho de air fryer para quantas pessoas: o litro do nome é a caixa; decide o cesto e quanta batata o fabricante diz que cabe.",
    intro: [
      "O litro que vai no nome da air fryer é a capacidade da caixa. O que cabe de comida é o cesto — e poucas fichas dizem quanto de batata ele leva de uma vez.",
      "O simulador pergunta quantas pessoas comem e escolhe pelo que o fabricante declara, não pelo litro do nome. A tabela abaixo põe os três números lado a lado.",
    ],
    guia: { slug: "airfryers", nome: "Guia de air fryers" },
    categoria: { slug: "cozinha", nome: "Airfryers" },
  },
  purificador: {
    seo: "Quanto tempo dura o refil do purificador de água",
    h1: "Quanto dura o refil do purificador de água",
    descricao:
      "Calcule de quanto em quanto tempo trocar o refil do purificador de água pelo consumo da sua casa, em litros, e não pelo prazo em meses.",
    intro: [
      "O prazo de troca em meses é o litro dividido por um consumo diário que nenhuma ficha escreve. A Consul dá 1.500 litros em 6 meses — 250 litros por mês; a IBBL dá os mesmos 6 meses a refis de 2.000 e 3.000 litros.",
      "O simulador faz a conta com o litro, que é o número que o fabricante declara, e o consumo que você informa. A tabela abaixo mostra a duração em três consumos diferentes.",
    ],
    guia: { slug: "purificadores", nome: "Guia de purificadores de água" },
    categoria: { slug: "purificadores", nome: "Purificadores de água" },
  },
  cooktop: {
    seo: "Disjuntor do cooktop de indução: corrente e instalação",
    h1: "Cooktop de indução: a corrente e o disjuntor",
    descricao:
      "Veja a corrente que o cooktop de indução puxa na sua tensão e o disjuntor que o fabricante declara — a conta que a maioria das fichas não faz.",
    intro: [
      "Corrente é potência dividida por tensão: um cooktop de 7.400 W puxa 34 ampères a 220 V. Acima de 20 A não há tomada no padrão brasileiro, e a ligação é direta, num circuito só dele.",
      "O simulador dá a corrente e o disjuntor que o fabricante declara, quando declara. O dimensionamento do disjuntor e do fio é trabalho do eletricista, pela NBR 5410 — e a página diz isso em vez de fingir que sabe.",
    ],
    guia: { slug: "cooktops-inducao", nome: "Guia de cooktops de indução" },
    categoria: { slug: "cooktops", nome: "Cooktops de indução" },
  },
  seguranca: {
    seo: "Simulador de câmeras de segurança: DVR, HD, cabo e fonte",
    h1: "Monte o sistema de câmeras de segurança",
    descricao:
      "Monte o sistema de câmeras de segurança peça por peça — câmeras, DVR, HD, cabo, conectores e fonte —, com as fichas da Intelbras e da Hikvision.",
    intro: [
      "Cada resposta vira uma peça ou uma quantidade: os pontos definem as câmeras e os canais do gravador, a distância define os metros de cabo, e cada cabo leva um conector em cada ponta. Peça que o site ainda não apurou aparece na lista com a especificação que o projeto exige e sem link.",
      "O detalhe da imagem é conta, não promessa: na distância informada, a cena tem uma largura que depende do ângulo declarado, e os pixels da câmera se repartem por ela, nos degraus da norma IEC 62676-4. Em 1080p Lite o DVR grava metade da largura da câmera, e o detalhe gravado cai à metade.",
    ],
    guia: { slug: "dvr-para-casa", nome: "Guia de DVR para casa" },
    categoria: { slug: "cftv", nome: "CFTV" },
  },
  wifi: {
    seo: "Wi-Fi não chega em toda a casa: mesh, repetidor ou roteador",
    h1: "Wi-Fi para a casa inteira: mesh, repetidor ou roteador",
    descricao:
      "Mesh, repetidor ou roteador? Veja quantas unidades a sua casa pede pela cobertura em m² que cada fabricante declara para o kit.",
    intro: [
      "A área da casa é comparada com a cobertura que o fabricante declara para cada número de unidades. Quando o anúncio vende menos unidades do que a conta pede, a unidade que falta entra na lista.",
      "Nenhum roteador nem repetidor desta base declara área, e a lista diz isso em vez de estimar. A tabela abaixo mostra os únicos números de cobertura publicados.",
    ],
    guia: { slug: "conectividade", nome: "Guia de conectividade" },
    categoria: { slug: "conectividade", nome: "Conectividade" },
  },
  automacao: {
    seo: "Simulador de automação residencial: o que comprar",
    h1: "Monte a automação residencial da sua casa",
    descricao:
      "Monte a casa inteligente — interruptor, tomada, lâmpada, sensor, fechadura e portão — num app só, Zigbee ou Wi-Fi, com ou sem fio neutro.",
    intro: [
      "A primeira escolha é o aplicativo: o simulador procura o que cobre mais peças do projeto, para a casa não ficar com três apps no celular, e avisa onde uma peça obriga a um segundo. Central (hub) só entra quando a ficha de uma peça a exige.",
      "Fio neutro e funcionamento sem internet só contam quando o fabricante escreve — e a lista diz quantas peças escrevem. A tabela abaixo mostra o que a base tem de cada tipo.",
    ],
    guia: { slug: "casa-conectada", nome: "Guia de casa conectada" },
    categoria: { slug: "casa-conectada", nome: "Casa conectada" },
  },
};

for (const [foco, p] of Object.entries(PAGINAS)) {
  if (p.descricao.length > LIMITE_DESCRICAO) {
    throw new Error(`Descrição do simulador "${foco}" tem ${p.descricao.length} caracteres; o limite é ${LIMITE_DESCRICAO}.`);
  }
}

export type Tabela = {
  titulo: string;
  nota: string;
  cabecalho: string[];
  /** A primeira célula de cada linha pode levar à ficha. */
  linhas: { slug?: string; celulas: string[] }[];
};

const NI = "Não informado";
const n = (v: number, casas = 1) => v.toLocaleString("pt-BR", { maximumFractionDigits: casas });
const num = (v: unknown) => (typeof v === "number" ? v : null);
const txt = (v: unknown) => (typeof v === "string" ? v : "");
const ou = (v: number | null, sufixo = "", casas = 1) => (v == null ? NI : `${n(v, casas)}${sufixo}`);
const sim = (v: unknown) => (v === true ? "Sim" : v === false ? "Não" : NI);
/** Algumas fichas não trazem a marca no nome ("High Wall Eco Inverter 3"). */
const nome = (p: Produto) => (p.nome.toLowerCase().includes(p.marca.toLowerCase()) ? p.nome : `${p.marca} ${p.nome}`);
const porMarca = (a: Produto, b: Produto) => a.marca.localeCompare(b.marca) || a.nome.localeCompare(b.nome);

export function tabelasDoFoco(foco: Foco, base: Record<string, Produto>): Tabela[] {
  const produtos = (cat: string) => Object.values(base).filter((p) => p.categoria === cat).sort(porMarca);

  switch (foco) {
    case "ar": {
      const areas = [9, 12, 15, 20, 25, 30];
      return [
        {
          titulo: "BTUs por tamanho de cômodo, pela conta da LG",
          nota: `Com ${RESPOSTAS_AR.pessoas} pessoas, ${RESPOSTAS_AR.tvs} TV, sem sol forte e fora do Norte, Nordeste e Centro-Oeste. No Norte, Nordeste e Centro-Oeste a conta sobe 20%, e com muito sol, mais 15% — o simulador acima faz a conta exata com o seu cômodo.`,
          cabecalho: ["Área do cômodo", "BTUs pela conta"],
          linhas: areas.map((a) => ({
            celulas: [`${a} m²`, `${n(calcularBtu({ ...RESPOSTAS_AR, areaM2: a }).total)} BTU/h`],
          })),
        },
        {
          titulo: "A área que cada fabricante declara",
          nota: "Área em branco quer dizer que a ficha oficial não publica a área que o aparelho atende.",
          cabecalho: ["Modelo", "Capacidade", "Área declarada", "Ciclo"],
          linhas: produtos("ar-condicionado")
            .sort((a, b) => (num(a.specs.capacidadeBtus) ?? 0) - (num(b.specs.capacidadeBtus) ?? 0) || porMarca(a, b))
            .map((p) => ({
              slug: p.slug,
              celulas: [nome(p), ou(num(p.specs.capacidadeBtus), " BTU/h"), txt(p.specs.areaRecomendadaM2) || NI, txt(p.specs.ciclo) || NI],
            })),
        },
      ];
    }
    case "nobreak":
      return [
        {
          titulo: "VA, watt e forma de onda de cada nobreak",
          nota: "O watt é o que decide se o nobreak aguenta a carga. Onde a ficha só publica o VA, o simulador não adivinha o watt.",
          cabecalho: ["Modelo", "Potência (VA)", "Potência (W)", "Forma de onda", "Compatível com PFC"],
          linhas: produtos("nobreaks")
            .sort((a, b) => (num(a.specs.potenciaVa) ?? 0) - (num(b.specs.potenciaVa) ?? 0) || porMarca(a, b))
            .map((p) => ({
              slug: p.slug,
              celulas: [nome(p), ou(num(p.specs.potenciaVa), " VA"), ou(num(p.specs.potenciaW), " W"), txt(p.specs.formaOnda) || NI, sim(p.specs.compativelPfc)],
            })),
        },
      ];
    case "airfryer":
      return [
        {
          titulo: "O litro do nome, o cesto e a batata",
          nota: "Capacidade total é a caixa; útil é o cesto. A batata é o que o fabricante declara que cabe de uma vez.",
          cabecalho: ["Modelo", "Capacidade total", "Capacidade útil", "Batata por vez"],
          linhas: produtos("cozinha")
            .sort((a, b) => (num(a.specs.capacidadeTotalL) ?? 0) - (num(b.specs.capacidadeTotalL) ?? 0) || porMarca(a, b))
            .map((p) => ({
              slug: p.slug,
              celulas: [nome(p), ou(num(p.specs.capacidadeTotalL), " L"), ou(num(p.specs.capacidadeUtilL), " L"), ou(num(p.specs.batataMaxKg), " kg", 2)],
            })),
        },
      ];
    case "purificador": {
      const consumos = [5, 8, 12];
      const comRefil = produtos("purificadores").filter((p) => num(p.specs.vidaUtilFiltroL) != null);
      const sem = produtos("purificadores").length - comRefil.length;
      return [
        {
          titulo: "Quanto o refil dura em litros e em meses",
          nota: `Duração = litros declarados ÷ (consumo diário × 30,4 dias). ${sem} dos ${produtos("purificadores").length} purificadores da base não declaram a vida útil do refil em litros e ficam fora da tabela.`,
          cabecalho: ["Modelo", "Refil declarado", "Prazo declarado", ...consumos.map((c) => `A ${c} L/dia`)],
          linhas: comRefil
            .sort((a, b) => (num(a.specs.vidaUtilFiltroL) ?? 0) - (num(b.specs.vidaUtilFiltroL) ?? 0) || porMarca(a, b))
            .map((p) => ({
              slug: p.slug,
              celulas: [
                nome(p),
                ou(num(p.specs.vidaUtilFiltroL), " L", 0),
                ou(num(p.specs.vidaUtilFiltroMeses), " meses", 0),
                ...consumos.map((c) => `${n(mesesNaCasa(p, c)!)} meses`),
              ],
            })),
        },
      ];
    }
    case "cooktop":
      return [
        {
          titulo: "Potência, corrente e disjuntor de cada cooktop",
          nota: "Corrente = potência declarada ÷ tensão. Só calculada na tensão que a ficha declara. Acima de 20 A não há tomada no padrão brasileiro.",
          cabecalho: ["Modelo", "Bocas", "Potência total", "Corrente a 127 V", "Corrente a 220 V", "Disjuntor declarado"],
          linhas: produtos("cooktops")
            .sort((a, b) => (num(a.specs.bocas) ?? 0) - (num(b.specs.bocas) ?? 0) || porMarca(a, b))
            .map((p) => {
              const w = num(p.specs.potenciaTotalW);
              const t = txt(p.specs.tensao);
              const a = (v: 127 | 220) => (!t.includes(String(v)) ? `Só ${v === 127 ? 220 : 127} V` : w == null ? NI : `${n(w / v)} A`);
              return {
                slug: p.slug,
                celulas: [nome(p), ou(num(p.specs.bocas), "", 0), ou(w, " W", 0), t ? a(127) : NI, t ? a(220) : NI, ou(num(p.specs.disjuntorA), " A", 0)],
              };
            }),
        },
      ];
    case "seguranca":
      return [
        {
          titulo: "Os gravadores da base e o que eles gravam",
          nota: "\"1080p Lite\" é 960 × 1080, metade da largura da câmera Full HD — a definição é do rodapé do datasheet da Intelbras.",
          cabecalho: ["Modelo", "Canais", "Gravação em 1920 × 1080", "HD máximo"],
          linhas: produtos("cftv")
            .filter((p) => txt(p.specs.tipo) === "Gravador DVR")
            .sort((a, b) => (num(a.specs.canais) ?? 0) - (num(b.specs.canais) ?? 0) || porMarca(a, b))
            .map((p) => ({
              slug: p.slug,
              celulas: [nome(p), ou(num(p.specs.canais), "", 0), txt(p.specs.gravacao1080p) || NI, ou(num(p.specs.hdMaxTb), " TB", 0)],
            })),
        },
      ];
    case "wifi":
      return [
        {
          titulo: "A cobertura que cada fabricante declara",
          nota: "Só os kits mesh desta base publicam área. A coluna do anúncio diz quantas unidades vêm no produto que o site linka.",
          cabecalho: ["Modelo", "1 unidade", "2 unidades", "3 unidades", "Unidades no anúncio"],
          linhas: Object.entries(COBERTURA)
            .filter(([slug]) => base[slug])
            .map(([slug, c]) => ({
              slug,
              celulas: [nome(base[slug]), ...[1, 2, 3].map((u) => (c[u] ? `${n(c[u])} m²` : NI)), ou(KIT_VENDIDO[slug] ?? null, "", 0)],
            })),
        },
      ];
    case "automacao": {
      const porTipo = new Map<string, Produto[]>();
      for (const p of produtos("casa-conectada")) {
        const t = txt(p.specs.tipo) || "Outros";
        porTipo.set(t, [...(porTipo.get(t) ?? []), p]);
      }
      const conta = (ps: Produto[], f: (p: Produto) => boolean) => String(ps.filter(f).length);
      return [
        {
          titulo: "O que a base tem de cada peça",
          nota: "Zigbee e Wi-Fi como a ficha declara a conexão. \"Sem internet\" conta só quem escreve que funciona sem a nuvem; ficha que não diz nada não entra na conta.",
          cabecalho: ["Peça", "Fichas", "Zigbee", "Wi-Fi", "Sem internet declarado"],
          linhas: [...porTipo.entries()]
            .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
            .map(([tipo, ps]) => ({
              celulas: [
                tipo,
                String(ps.length),
                conta(ps, (p) => /zigbee/i.test(txt(p.specs.conexao))),
                conta(ps, (p) => /wi-?fi/i.test(txt(p.specs.conexao))),
                conta(ps, (p) => p.specs.funcionaSemNuvem === true),
              ],
            })),
        },
      ];
    }
  }
}

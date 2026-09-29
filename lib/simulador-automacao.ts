import type { Produto } from "./specs";
import { OPCOES_POR_ITEM, type Item } from "./simulador-lista";

/**
 * O motor do projeto de automação do /simulador: respostas entram, lista de
 * compras sai. Puro — roda no navegador. A especificação está em
 * docs/simulador.md; as regras de número são as das outras frentes: número do
 * fabricante diz "declara", regra nossa vem rotulada, topologia é contagem.
 *
 * UM APLICATIVO SÓ
 *
 * Automação que mistura marcas vira três aplicativos no celular, e sensor de
 * uma marca não aciona lâmpada da outra sem um assistente no meio. Por isso a
 * primeira escolha é o ecossistema — o aplicativo do fabricante que cobre mais
 * peças do projeto com ficha na base —, e cada peça sai dele quando ele tem.
 * Quando não tem, a peça vem de outra marca e a lista diz que ali entra um
 * segundo aplicativo.
 *
 * O QUE DEPENDE DE NÚMERO QUE NINGUÉM PUBLICA
 *
 * Neutro na caixa do interruptor e funcionamento sem internet são as duas
 * perguntas que mais decidem uma compra de automação, e as duas que as fichas
 * mais deixam em branco. O motor não supõe: se a ficha não diz que o
 * interruptor dispensa neutro, a lista manda conferir; se não diz que funciona
 * sem internet, a lista diz que a marca não declara.
 */

export type ComoLuz = "lampada" | "interruptor";
export type Assistente = "alexa" | "google" | "apple" | "nenhum";
export type Ambiente = "sala" | "quarto" | "casa";

export type RespostasAutomacao = {
  /** Só dá o título e o ponto de partida das quantidades; o leitor ajusta. */
  ambiente: Ambiente;
  /** Pontos de luz a controlar. */
  luzes: number;
  comoLuz: ComoLuz;
  corNaLuz: boolean;
  /** Teclas na caixa do interruptor — quantas luzes cada caixa comanda. */
  teclas: 1 | 2 | 3;
  neutro: "sim" | "nao" | "naoSei";
  /** Aparelhos na tomada para ligar e desligar pelo celular. */
  tomadas: number;
  /** A carga do aparelho mais forte que vai na tomada, em W. */
  cargaTomada: 1000 | 2400 | 3500;
  medir: boolean;
  /** Cômodos com ar-condicionado ou TV para comandar pelo celular. */
  controleRemoto: number;
  portas: number;
  movimento: number;
  vazamento: number;
  fumaca: number;
  portao: boolean;
  fechadura: boolean;
  cortinas: number;
  camerasInternas: number;
  camerasExternas: number;
  assistente: Assistente;
  /** Se já há na casa um alto-falante com o assistente escolhido. */
  temAssistente: boolean;
  semInternet: boolean;
};

export const RESPOSTAS_AUTOMACAO: RespostasAutomacao = {
  ambiente: "sala",
  luzes: 2,
  comoLuz: "lampada",
  corNaLuz: false,
  teclas: 1,
  neutro: "naoSei",
  tomadas: 1,
  cargaTomada: 1000,
  medir: false,
  controleRemoto: 0,
  portas: 0,
  movimento: 0,
  vazamento: 0,
  fumaca: 0,
  portao: false,
  fechadura: false,
  cortinas: 0,
  camerasInternas: 0,
  camerasExternas: 0,
  assistente: "alexa",
  temAssistente: true,
  semInternet: false,
};

/**
 * Ponto de partida de cada ambiente. É sugestão de quantidade, não regra: a
 * tela preenche e o leitor muda o que quiser.
 */
export const PARTIDA: Record<Ambiente, Partial<RespostasAutomacao>> = {
  sala: { luzes: 2, tomadas: 1, controleRemoto: 1, portas: 0, movimento: 1, vazamento: 0, fumaca: 0, cortinas: 0, camerasInternas: 0, camerasExternas: 0, portao: false, fechadura: false },
  quarto: { luzes: 1, tomadas: 1, controleRemoto: 1, portas: 0, movimento: 0, vazamento: 0, fumaca: 0, cortinas: 1, camerasInternas: 0, camerasExternas: 0, portao: false, fechadura: false },
  casa: { luzes: 8, tomadas: 3, controleRemoto: 2, portas: 2, movimento: 2, vazamento: 1, fumaca: 1, cortinas: 0, camerasInternas: 1, camerasExternas: 1, portao: true, fechadura: true },
};

const NOME_AMBIENTE: Record<Ambiente, string> = {
  sala: "da sala",
  quarto: "do quarto",
  casa: "da casa",
};

export const GRUPOS_AUTOMACAO = [
  { grupo: "central", titulo: "Central" },
  { grupo: "luzes", titulo: "Luzes" },
  { grupo: "tomadas", titulo: "Tomadas e aparelhos" },
  { grupo: "sensores", titulo: "Sensores e câmeras" },
  { grupo: "voz", titulo: "Comando de voz" },
  { grupo: "acessos", titulo: "Portão, porta e cortina" },
];

/** Os tipos como estão no campo `tipo` das fichas de casa conectada. */
export const TIPOS = {
  tomada: "Tomada inteligente",
  lampada: "Lâmpada inteligente",
  interruptor: "Interruptor inteligente",
  rele: "Relé inteligente",
  ir: "Controle infravermelho",
  porta: "Sensor de porta e janela",
  movimento: "Sensor de movimento",
  vazamento: "Sensor de vazamento",
  fumaca: "Sensor de fumaça",
  hub: "Hub",
  portao: "Módulo de portão",
  fechadura: "Fechadura digital",
  cortina: "Motor de cortina",
  presenca: "Sensor de presença",
  cameraInterna: "Câmera Wi-Fi interna",
  cameraExterna: "Câmera Wi-Fi externa",
  voz: "Alto-falante inteligente",
} as const;

/**
 * Se a ficha é do tipo pedido. Controle infravermelho e central podem morar no
 * mesmo aparelho ("Hub com controle infravermelho", o Tapo H110): ele conta
 * para os dois papéis.
 */
export function eDoTipo(p: Produto, tipo: string): boolean {
  const t = txt(p.specs.tipo);
  if (tipo === TIPOS.ir) return /infravermelho/i.test(t);
  if (tipo === TIPOS.hub) return t.startsWith("Hub");
  // Sensor de presença (radar) detecta também quem está parado: serve onde se
  // pede sensor de movimento.
  if (tipo === TIPOS.movimento) return t === TIPOS.movimento || t === TIPOS.presenca;
  return t === tipo;
}

const n = (v: number) => v.toLocaleString("pt-BR");
const txt = (v: unknown) => (typeof v === "string" ? v : "");
const num = (v: unknown) => (typeof v === "number" ? v : null);

export type ProjetoAutomacao = {
  titulo: string;
  motivos: string[];
  avisos: string[];
  itens: Item[];
};

type Pedido = { tipo: string; qtd: number };

/**
 * O aplicativo da ficha. Quando ela não o nomeia (a Smart Plug da Positivo não
 * nomeia; o interruptor da mesma marca nomeia), vale o app mais comum entre as
 * fichas da marca — e, sem nenhum, a marca, que é o que o comprador procura na
 * loja de aplicativos. Marca com dois apps de verdade (Intelbras: Mibo Cam na
 * câmera, Mibo Smart no resto) fica com os dois.
 */
let APP_DA_MARCA: Map<string, string> = new Map();
const appDe = (p: Produto) => txt(p.specs.appProprio) || APP_DA_MARCA.get(p.marca) || p.marca;
function nomearApps(base: Produto[]) {
  const conta = new Map<string, Map<string, number>>();
  for (const p of base) {
    const a = txt(p.specs.appProprio);
    if (!a) continue;
    const m = conta.get(p.marca) ?? new Map<string, number>();
    m.set(a, (m.get(a) ?? 0) + 1);
    conta.set(p.marca, m);
  }
  APP_DA_MARCA = new Map(
    [...conta].map(([marca, m]) => [marca, [...m].sort((x, y) => y[1] - x[1])[0][0]]),
  );
}

const NOME_ASSISTENTE: Record<Assistente, string> = {
  alexa: "Alexa",
  google: "Google",
  apple: "Apple Home",
  nenhum: "",
};
const PADRAO_ASSISTENTE: Record<Assistente, RegExp> = {
  alexa: /Alexa/i,
  google: /Google/i,
  apple: /Apple|Siri|HomeKit/i,
  nenhum: /./,
};

function declaraAssistente(p: Produto, a: Assistente): boolean | null {
  if (a === "nenhum") return true;
  const t = txt(p.specs.assistentes);
  if (!t) return null;
  return PADRAO_ASSISTENTE[a].test(t);
}

/**
 * Ordem de preferência entre candidatas do mesmo tipo: o aplicativo escolhido
 * primeiro; depois quem declara funcionar sem internet, se o leitor pediu;
 * depois quem declara o assistente pedido; depois a garantia declarada maior.
 */
function ordenar(lista: Produto[], app: string | null, r: RespostasAutomacao): Produto[] {
  const pontos = (p: Produto) =>
    (app && appDe(p) === app ? 8 : 0) +
    (r.semInternet && p.specs.funcionaSemNuvem === true ? 4 : 0) +
    (declaraAssistente(p, r.assistente) === true ? 2 : 0);
  return [...lista].sort(
    (a, b) => pontos(b) - pontos(a) || (num(b.specs.garantiaMeses) ?? 0) - (num(a.specs.garantiaMeses) ?? 0),
  );
}

/** Os pedidos do projeto, por tipo de peça — é com eles que se escolhe o app. */
function pedidos(r: RespostasAutomacao): Pedido[] {
  const luzTipo = r.comoLuz === "lampada" ? TIPOS.lampada : TIPOS.interruptor;
  return [
    { tipo: luzTipo, qtd: r.luzes },
    { tipo: TIPOS.tomada, qtd: r.tomadas },
    { tipo: TIPOS.ir, qtd: r.controleRemoto },
    { tipo: TIPOS.porta, qtd: r.portas },
    { tipo: TIPOS.movimento, qtd: r.movimento },
    { tipo: TIPOS.vazamento, qtd: r.vazamento },
    { tipo: TIPOS.fumaca, qtd: r.fumaca },
    { tipo: TIPOS.portao, qtd: r.portao ? 1 : 0 },
    { tipo: TIPOS.fechadura, qtd: r.fechadura ? 1 : 0 },
    { tipo: TIPOS.cortina, qtd: r.cortinas },
    { tipo: TIPOS.cameraInterna, qtd: r.camerasInternas },
    { tipo: TIPOS.cameraExterna, qtd: r.camerasExternas },
  ].filter((x) => x.qtd > 0);
}

/**
 * O aplicativo que cobre mais tipos pedidos com ficha na base. Empate vai para
 * o que tem mais fichas que declaram funcionar sem internet, e depois para o
 * que declara o assistente pedido em mais fichas.
 */
export function escolherApp(r: RespostasAutomacao, base: Produto[]): { app: string | null; cobertos: number; total: number } {
  nomearApps(base);
  const ped = pedidos(r);
  const apps = [...new Set(base.map(appDe))];
  const nota = (app: string) => {
    const doApp = base.filter((p) => appDe(p) === app);
    const cobertos = ped.filter((x) => doApp.some((p) => eDoTipo(p, x.tipo))).length;
    const semNuvem = doApp.filter((p) => p.specs.funcionaSemNuvem === true).length;
    const assist = doApp.filter((p) => declaraAssistente(p, r.assistente) === true).length;
    return { app, cobertos, semNuvem, assist };
  };
  const notas = apps
    .map(nota)
    .sort((a, b) => b.cobertos - a.cobertos || b.semNuvem - a.semNuvem || b.assist - a.assist);
  const melhor = notas[0];
  return { app: melhor && melhor.cobertos > 0 ? melhor.app : null, cobertos: melhor?.cobertos ?? 0, total: ped.length };
}

export function montarProjetoAutomacao(r: RespostasAutomacao, baseTodas: Record<string, Produto>): ProjetoAutomacao {
  const base = Object.values(baseTodas).filter((p) => p.categoria === "casa-conectada");
  const itens: Item[] = [];
  const avisos: string[] = [];
  const motivos: string[] = [];
  const { app, cobertos, total } = escolherApp(r, base);
  const usados: Produto[] = [];

  if (app) {
    motivos.push(
      cobertos === total
        ? `Todas as peças com ficha saem do mesmo aplicativo, ${app}: o projeto inteiro fica num app só.`
        : `O aplicativo ${app} é o que cobre mais peças do projeto com ficha no site: ${n(cobertos)} de ${n(total)} tipos. As outras vêm de outro aplicativo, e a lista diz onde ele entra.`,
    );
  }
  if (r.assistente !== "nenhum") {
    const quem = { alexa: "a Alexa", google: "o Google Assistente", apple: "a Apple Home (Siri)", nenhum: "" }[r.assistente];
    motivos.push(`Você quer comandar por voz com ${quem}: a lista confere isso em cada ficha.`);
  }
  if (r.semInternet) {
    motivos.push("Você quer que funcione sem internet: a lista dá preferência a quem declara isso por escrito e avisa onde a marca não declara.");
  }

  /** A melhor peça da base para o tipo, com os filtros do caso. */
  const escolher = (tipo: string, filtro: (p: Produto) => boolean = () => true) =>
    ordenar(base.filter((p) => eDoTipo(p, tipo) && filtro(p)), app, r);

  /** O que a ficha não garante para as duas perguntas do leitor. */
  const conferir = (p: Produto): string[] => {
    const c: string[] = [];
    if (app && appDe(p) !== app && !eDoTipo(p, TIPOS.voz)) {
      c.push(`É de outro aplicativo (${appDe(p)}): entra um segundo app no celular, e automação entre as duas marcas só por assistente de voz, se as duas declararem o mesmo.`);
    }
    const a = declaraAssistente(p, r.assistente);
    if (a === false) c.push(`A ${p.marca} não lista ${NOME_ASSISTENTE[r.assistente]} entre os assistentes compatíveis deste modelo.`);
    if (a === null) c.push(`A ${p.marca} não informa com quais assistentes de voz este modelo funciona.`);
    if (r.semInternet && p.specs.funcionaSemNuvem !== true) {
      c.push(`A ${p.marca} não declara que ${p.nome} funciona sem internet.`);
    }
    return c;
  };

  const item = (
    id: string,
    grupo: string,
    papel: string,
    qtd: number,
    lista: Produto[],
    porque: (p: Produto) => string,
    semFicha: { especificacao: string; porque: string },
    extra: Partial<Item> = {},
  ) => {
    const [p, alt] = lista;
    if (!p) {
      itens.push({ id, grupo, papel, qtd, ...semFicha, ...extra });
      return null;
    }
    usados.push(p);
    const c = [...(extra.confira ?? []), ...conferir(p)];
    itens.push({
      id,
      grupo,
      papel,
      qtd,
      produto: p.slug,
      porque: porque(p),
      ...extra,
      confira: c.length ? c : undefined,
      alternativa: alt && alt.slug !== p.slug ? { produto: alt.slug, motivo: diferenca(p, alt) } : undefined,
      outras: lista.slice(2, OPCOES_POR_ITEM).map((o) => ({ produto: o.slug, motivo: diferenca(p, o) })),
    });
    return p;
  };

  // LUZES -------------------------------------------------------------------
  if (r.luzes > 0 && r.comoLuz === "lampada") {
    item(
      "lampada",
      "luzes",
      "Lâmpada inteligente",
      r.luzes,
      escolher(TIPOS.lampada, (p) => !r.corNaLuz || p.specs.corRgb === true),
      (p) =>
        `Troca a lâmpada e mantém o interruptor. A ${p.marca} declara ${num(p.specs.fluxoLumens) ? `${n(num(p.specs.fluxoLumens)!)} lúmens` : "a lâmpada sem fluxo luminoso"}${p.specs.corRgb === true ? " e cor" : ""}.`,
      {
        especificacao: `Lâmpada inteligente${r.corNaLuz ? " que muda de cor" : ""}, na rosca do soquete que você tem.`,
        porque: "Troca a lâmpada e mantém o interruptor.",
      },
      {
        confira: [
          "O interruptor de parede tem de ficar ligado: desligado, a lâmpada fica sem energia e o aplicativo não a alcança.",
        ],
      },
    );
  }
  if (r.luzes > 0 && r.comoLuz === "interruptor") {
    const caixas = Math.ceil(r.luzes / r.teclas);
    const comTeclas = (p: Produto) => num(p.specs.teclas) === r.teclas;
    const semNeutro = (p: Produto) => p.specs.precisaNeutro === false;
    let lista =
      r.neutro === "sim"
        ? escolher(TIPOS.interruptor, comTeclas)
        : escolher(TIPOS.interruptor, (p) => comTeclas(p) && semNeutro(p));
    const confiraNeutro: string[] = [];
    // Sem neutro e sem interruptor desse número de teclas que dispense o fio:
    // vale o que dispensa com MAIS teclas — sobra tecla, mas a caixa sem neutro
    // funciona. O de teclas mais próximas vem primeiro.
    if (r.neutro !== "sim" && !lista.length) {
      const maiores = escolher(TIPOS.interruptor, (p) => semNeutro(p) && (num(p.specs.teclas) ?? 0) > r.teclas).sort(
        (a, b) => (num(a.specs.teclas) ?? 0) - (num(b.specs.teclas) ?? 0),
      );
      if (maiores.length) {
        lista = maiores;
        confiraNeutro.push(
          `Nenhum interruptor da base de ${r.teclas} ${r.teclas === 1 ? "tecla" : "teclas"} declara dispensar o neutro. O indicado dispensa e tem ${n(num(maiores[0].specs.teclas)!)} teclas: sobra ${num(maiores[0].specs.teclas)! - r.teclas === 1 ? "uma" : "mais de uma"}, e a caixa sem neutro funciona.`,
        );
      }
    }
    if (r.neutro !== "sim" && !lista.length) {
      const comNeutro = escolher(TIPOS.interruptor, comTeclas);
      if (comNeutro.length) {
        confiraNeutro.push(
          r.neutro === "nao"
            ? "Nenhum interruptor da base com esse número de teclas declara que dispensa o neutro, e o indicado não declara isso. Antes de comprar, confira na ficha dele; se precisar, um eletricista puxa o fio até a caixa."
            : "Nenhum interruptor da base com esse número de teclas declara que dispensa o neutro. Confira se há fio neutro na caixa antes de comprar — um eletricista confirma em minutos.",
        );
        lista.push(...comNeutro);
      }
    }
    if (r.neutro !== "sim" && !base.some((p) => eDoTipo(p, TIPOS.interruptor) && p.specs.precisaNeutro === false)) {
      const comResposta = base.filter((p) => eDoTipo(p, TIPOS.interruptor) && typeof p.specs.precisaNeutro === "boolean").length;
      avisos.push(
        `Nenhum interruptor com ficha no site declara dispensar o fio neutro: ${comResposta ? `os ${n(comResposta)} que respondem à pergunta declaram precisar dele` : "nenhum responde à pergunta"}. ${r.neutro === "nao" ? "Sem neutro na caixa," : "Se a caixa não tiver neutro,"} o caminho sem obra é a lâmpada inteligente, que mantém o interruptor da parede — ajuste o passo das luzes e escolha trocar a lâmpada.`,
      );
    }
    item(
      "interruptor",
      "luzes",
      `Interruptor inteligente de ${r.teclas} ${r.teclas === 1 ? "tecla" : "teclas"}`,
      caixas,
      lista,
      (p) =>
        `${n(r.luzes)} ${r.luzes === 1 ? "luz" : "luzes"} em caixas de ${r.teclas} ${r.teclas === 1 ? "tecla" : "teclas"}: ${n(caixas)} ${caixas === 1 ? "interruptor" : "interruptores"}. ${p.specs.precisaNeutro === false ? `A ${p.marca} declara que ele dispensa o fio neutro.` : p.specs.precisaNeutro === true ? `A ${p.marca} declara que ele precisa de fio neutro na caixa.` : `A ${p.marca} não informa se ele precisa de fio neutro.`}${num(p.specs.cargaMaxW) ? ` A ficha declara carga de até ${n(num(p.specs.cargaMaxW)!)} W.` : ""}`,
      {
        especificacao: `Interruptor inteligente de ${r.teclas} ${r.teclas === 1 ? "tecla" : "teclas"}${r.neutro === "sim" ? "" : ", que declare dispensar o fio neutro"}.`,
        porque: `${n(r.luzes)} ${r.luzes === 1 ? "luz" : "luzes"} em caixas de ${r.teclas}: ${n(caixas)} ${caixas === 1 ? "interruptor" : "interruptores"}.`,
      },
      {
        regra: "Uma tecla por luz; o número de interruptores é o de luzes dividido pelas teclas de cada caixa, arredondado para cima.",
        confira: [
          ...confiraNeutro,
          ...(r.neutro === "naoSei" && !confiraNeutro.length
            ? ["Você não sabe se há neutro na caixa. O indicado declara dispensar; se houver, qualquer um da base serve."]
            : []),
          "A instalação mexe na fiação da parede: desligue o disjuntor do circuito antes, ou chame um eletricista.",
        ],
      },
    );
  }

  // TOMADAS -----------------------------------------------------------------
  if (r.tomadas > 0) {
    const maiorCarga = Math.max(0, ...base.filter((p) => p.specs.tipo === TIPOS.tomada).map((p) => num(p.specs.cargaMaxW) ?? 0));
    if (r.cargaTomada > maiorCarga) {
      itens.push({
        id: "tomada",
        grupo: "tomadas",
        papel: "Aparelho de alta potência",
        qtd: r.tomadas,
        especificacao: "Relé inteligente de potência instalado no quadro ou na caixa, com a carga do aparelho dentro do que ele declara.",
        porque: `A tomada inteligente de maior carga da base declara ${n(maiorCarga)} W, abaixo do aparelho que você marcou.`,
        confira: ["Aparelho dessa potência pede circuito próprio: quem instala é o eletricista."],
      });
    } else {
      item(
        "tomada",
        "tomadas",
        "Tomada inteligente",
        r.tomadas,
        escolher(TIPOS.tomada, (p) => (num(p.specs.cargaMaxW) ?? 0) >= r.cargaTomada && (!r.medir || p.specs.medeConsumo === true)),
        (p) =>
          `Liga e desliga pelo celular o que estiver na tomada. A ${p.marca} declara carga máxima de ${n(num(p.specs.cargaMaxW)!)} W, acima dos ${n(r.cargaTomada)} W do aparelho mais forte que você marcou${p.specs.medeConsumo === true ? ", e medição de consumo" : ""}.`,
        {
          especificacao: `Tomada inteligente com carga máxima declarada de pelo menos ${n(r.cargaTomada)} W${r.medir ? " e medição de consumo" : ""}.`,
          porque: "Nenhuma tomada da base declara essa carga com os recursos pedidos.",
        },
      );
    }
  }

  // CONTROLE REMOTO ---------------------------------------------------------
  if (r.controleRemoto > 0) {
    item(
      "ir",
      "tomadas",
      "Controle infravermelho",
      r.controleRemoto,
      escolher(TIPOS.ir),
      (p) =>
        `Aprende o controle remoto do ar-condicionado e da TV e comanda pelo celular. Um por cômodo: o infravermelho precisa enxergar o aparelho e não atravessa parede.${num(p.specs.alcanceM) ? ` A ${p.marca} declara alcance de ${n(num(p.specs.alcanceM)!)} m.` : ` A ${p.marca} não informa o alcance.`}`,
      {
        especificacao: "Controle universal infravermelho com aplicativo, um por cômodo.",
        porque: "O infravermelho precisa enxergar o aparelho e não atravessa parede: um por cômodo.",
      },
      { regra: "Um controle por cômodo com aparelho a comandar." },
    );
  }

  // SENSORES ----------------------------------------------------------------
  const sensor = (id: string, tipo: string, papel: string, qtd: number, porque: string) => {
    if (qtd <= 0) return;
    item(
      id,
      "sensores",
      papel,
      qtd,
      escolher(tipo),
      (p) =>
        `${porque}${txt(p.specs.alimentacao) ? ` Alimentação declarada: ${txt(p.specs.alimentacao)}.` : ""}${p.specs.precisaHub === true ? " A ficha pede a central da marca, que entra na lista." : ""}`,
      { especificacao: `${papel} com aplicativo.`, porque },
    );
  };
  sensor("porta", TIPOS.porta, "Sensor de porta e janela", r.portas, "Um por porta ou janela: avisa no celular quando abre.");
  sensor("movimento", TIPOS.movimento, "Sensor de movimento", r.movimento, "Um por ambiente: avisa, ou acende a luz, quando alguém passa.");
  sensor("vazamento", TIPOS.vazamento, "Sensor de vazamento", r.vazamento, "Um por ponto de risco — atrás da máquina de lavar, embaixo da pia.");
  sensor("fumaca", TIPOS.fumaca, "Sensor de fumaça", r.fumaca, "Um por ambiente, no teto.");

  // ACESSOS -----------------------------------------------------------------
  if (r.portao) {
    item(
      "portao",
      "acessos",
      "Módulo de portão",
      1,
      escolher(TIPOS.portao),
      (p) => `Liga no motor do portão que já existe e abre pelo celular. Compatibilidade com o motor: confira na ficha da ${p.marca}.`,
      {
        especificacao: "Módulo Wi-Fi para portão eletrônico, compatível com o motor instalado.",
        porque: "Aproveita o motor que já existe: o módulo manda o mesmo sinal do botão de parede.",
      },
      { confira: ["A compatibilidade com o motor do portão: a central dele precisa ter a entrada que o módulo usa."] },
    );
  }
  if (r.fechadura) {
    item(
      "fechadura",
      "acessos",
      "Fechadura digital",
      1,
      escolher(TIPOS.fechadura),
      (p) =>
        `Abre por aplicativo e pelos meios que a ficha lista. ${txt(p.specs.alimentacao) ? `Alimentação declarada: ${txt(p.specs.alimentacao)}.` : ""}`,
      {
        especificacao: "Fechadura digital com aplicativo, compatível com a espessura da sua porta.",
        porque: "Nenhuma fechadura da base atende.",
      },
      { confira: ["A espessura da porta e o tipo de fechadura que ela substitui: de embutir ou de sobrepor."] },
    );
  }
  if (r.cortinas > 0) {
    item(
      "cortina",
      "acessos",
      "Motor de cortina",
      r.cortinas,
      escolher(TIPOS.cortina),
      (p) => `Motor com trilho, para cortina que ainda não é motorizada. ${txt(p.specs.alimentacao) ? `Alimentação declarada: ${txt(p.specs.alimentacao)}.` : ""}`,
      {
        especificacao: "Motor de cortina com aplicativo, para o trilho e o peso da sua cortina.",
        porque: "Nenhum motor de cortina da base atende.",
      },
      { confira: ["O comprimento da janela contra o trilho do kit, e o peso da cortina contra o que o motor declara."] },
    );
  }

  const camera = (id: string, tipo: string, papel: string, qtd: number) => {
    if (qtd <= 0) return;
    item(
      id,
      "sensores",
      papel,
      qtd,
      escolher(tipo),
      (p) =>
        `Câmera Wi-Fi que grava sem gravador. ${txt(p.specs.armazenamentoVideo) ? `Onde grava, pela ficha: ${txt(p.specs.armazenamentoVideo)}.` : ""}`,
      { especificacao: `${papel} com aplicativo e gravação em cartão.`, porque: "Nenhuma câmera Wi-Fi da base atende." },
      { confira: ["Para um projeto de câmeras completo — gravador, HD, cabo —, use o simulador de câmeras de segurança."] },
    );
  };
  camera("camera-interna", TIPOS.cameraInterna, "Câmera Wi-Fi interna", r.camerasInternas);
  camera("camera-externa", TIPOS.cameraExterna, "Câmera Wi-Fi externa", r.camerasExternas);

  if (r.assistente !== "nenhum" && !r.temAssistente) {
    const qual = { alexa: "com a Alexa (linha Echo)", google: "com o Google Assistente (linha Nest)", apple: "com a Siri (HomePod)", nenhum: "" }[r.assistente];
    // O alto-falante é do assistente, não do aplicativo das peças: a ordem
    // aqui ignora o app escolhido e filtra pelo assistente que a ficha declara.
    const falantes = ordenar(
      base.filter((p) => eDoTipo(p, TIPOS.voz) && declaraAssistente(p, r.assistente) === true),
      null,
      r,
    );
    item(
      "voz",
      "voz",
      "Alto-falante inteligente",
      1,
      falantes,
      (p) => `É por ele que o comando de voz chega às peças. A ${p.marca} declara ${txt(p.specs.assistentes) || "o assistente"}.`,
      {
        especificacao: `Um alto-falante inteligente ${qual}.`,
        porque: "É por ele que o comando de voz chega às peças. Nenhum alto-falante com ficha no site declara esse assistente.",
      },
    );
  }

  // CENTRAL -----------------------------------------------------------------
  // Hub só entra quando uma peça escolhida o exige na ficha, e sai do mesmo
  // aplicativo dela. Quantidade de peças que ele aceita, só se declarada.
  const precisam = usados.filter((p) => p.specs.precisaHub === true);
  const porApp = new Map<string, number>();
  for (const it of itens) {
    const p = precisam.find((x) => x.slug === it.produto);
    if (p) porApp.set(appDe(p), (porApp.get(appDe(p)) ?? 0) + it.qtd);
  }
  for (const [a, pecas] of porApp) {
    // Se a central já está na lista em outro papel (o H110 como controle
    // infravermelho), ela serve às duas coisas: não se compra outra.
    const jaNaLista = usados.find((p) => eDoTipo(p, TIPOS.hub) && appDe(p) === a);
    if (jaNaLista) {
      motivos.push(`O ${jaNaLista.nome}, que já está na lista, é também a central de que ${pecas === 1 ? "a peça" : `as ${n(pecas)} peças`} do aplicativo ${a} precisam: não se compra outra.`);
      continue;
    }
    const hubs = ordenar(base.filter((p) => eDoTipo(p, TIPOS.hub) && appDe(p) === a), a, r);
    const h = hubs[0];
    const cabe = h ? num(h.specs.dispositivosHub) : null;
    if (h && cabe != null && pecas > cabe) {
      avisos.push(`São ${n(pecas)} peças ligadas à central ${h.nome}, e a ${h.marca} declara até ${n(cabe)}. O projeto pede mais de uma central.`);
    }
    itens.unshift(
      h
        ? {
            id: `hub-${a}`,
            grupo: "central",
            papel: "Central (hub)",
            qtd: cabe != null && pecas > cabe ? Math.ceil(pecas / cabe) : 1,
            produto: h.slug,
            porque: `${n(pecas)} ${pecas === 1 ? "peça da lista pede" : "peças da lista pedem"} a central da ${h.marca} na ficha. ${cabe != null ? `A marca declara até ${n(cabe)} dispositivos por central.` : "A marca não informa quantos dispositivos a central aceita."}`,
            confira: conferir(h).length ? conferir(h) : undefined,
          }
        : {
            id: `hub-${a}`,
            grupo: "central",
            papel: "Central (hub)",
            qtd: 1,
            especificacao: `A central do aplicativo ${a}, que as fichas dos sensores exigem.`,
            porque: "O site ainda não tem a ficha da central dessa marca.",
          },
    );
  }

  // AVISOS DO PROJETO -------------------------------------------------------
  const noWifi = itens
    .filter((it) => it.produto && /Wi-?Fi/i.test(txt(baseTodas[it.produto]?.specs.conexao)))
    .reduce((s, it) => s + it.qtd, 0);
  if (noWifi > 0) {
    avisos.push(
      `${noWifi === 1 ? "É 1 aparelho novo" : `São ${n(noWifi)} aparelhos novos`} no Wi-Fi de 2,4 GHz, ${noWifi === 1 ? "ocupando" : "cada um ocupando"} uma conexão do roteador. Se a rede já anda cheia, o simulador de Wi-Fi mostra o que a casa pede.`,
    );
  }
  if (r.semInternet) {
    const declaram = usados.filter((p) => p.specs.funcionaSemNuvem === true).length;
    avisos.push(
      declaram === usados.length && usados.length
        ? "Todas as peças com ficha declaram funcionar sem a nuvem do fabricante."
        : `${n(declaram)} de ${n(usados.length)} peças com ficha declaram funcionar sem a nuvem do fabricante. As outras não dizem — e sem essa frase escrita, a regra é supor que param com a internet.`,
    );
  }
  if (!itens.length) {
    avisos.push("Nenhuma peça marcada: volte e diga o que quer automatizar.");
  }

  return {
    titulo: `O projeto ${NOME_AMBIENTE[r.ambiente]}${app ? `, no aplicativo ${app}` : ""}`,
    motivos,
    avisos,
    itens,
  };
}

/** O que a segunda colocada tem de diferente — em campos da ficha. */
function diferenca(p: Produto, alt: Produto): string {
  const partes: string[] = [];
  if (appDe(alt) !== appDe(p)) partes.push(`outro aplicativo (${appDe(alt)})`);
  if (alt.specs.funcionaSemNuvem === true && p.specs.funcionaSemNuvem !== true) partes.push("declara funcionar sem internet");
  if (alt.specs.precisaNeutro === false && p.specs.precisaNeutro !== false) partes.push("declara dispensar o neutro");
  if (alt.specs.medeConsumo === true && p.specs.medeConsumo !== true) partes.push("mede consumo");
  const ga = num(alt.specs.garantiaMeses);
  const gp = num(p.specs.garantiaMeses);
  if (ga != null && (gp == null || ga > gp)) partes.push(`${n(ga)} meses de garantia declarados`);
  return partes.length ? partes.join(", ") : `mesma função, da ${alt.marca}`;
}

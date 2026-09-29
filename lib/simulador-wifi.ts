import type { Produto } from "./specs";
import { menorQueCabe, type Item } from "./simulador-lista";

/**
 * O motor do projeto de Wi-Fi do /simulador: respostas entram, lista de
 * compras sai. Puro — roda no navegador. A especificação está em
 * docs/simulador.md; as regras de número são as mesmas das câmeras: número do
 * fabricante diz "declara", regra nossa vem rotulada, topologia é contagem.
 *
 * O QUE A BASE PERMITE, E O QUE NÃO PERMITE
 *
 * Só quatro sistemas mesh declaram cobertura em m², e cada um por um número de
 * unidades diferente do kit que vende (ver COBERTURA). Nenhum roteador e nenhum
 * repetidor declara área. Nenhuma ficha diz se as unidades aceitam retorno por
 * cabo, e por isso a pergunta "já tem cabo entre os cômodos", que estava no
 * roteiro, ficou de fora: ela não mudaria nada na lista com honestidade.
 */

export type Objetivo = "casa" | "comodo" | "roteador";

export type RespostasWifi = {
  objetivo: Objetivo;
  areaM2: number;
  andares: number;
  paredes: "alvenaria" | "concreto" | "drywall";
  externa: boolean;
  areaExternaM2: number;
  planoMbps: 300 | 500 | 1000;
  aparelhos: number;
  /** Aparelhos que vão ligados por cabo perto do roteador principal. */
  cabeados: number;
  /** Computadores sem Wi-Fi, ou com Wi-Fi antigo, que vão precisar de adaptador. */
  computadores: number;
};

export const RESPOSTAS_WIFI: RespostasWifi = {
  objetivo: "casa",
  areaM2: 120,
  andares: 1,
  paredes: "alvenaria",
  externa: false,
  areaExternaM2: 30,
  planoMbps: 500,
  aparelhos: 15,
  cabeados: 1,
  computadores: 0,
};

export const GRUPOS_WIFI = [
  { grupo: "rede", titulo: "Rede" },
  { grupo: "computadores", titulo: "Computadores" },
  { grupo: "cabos", titulo: "Cabos e portas" },
];

export const NOME_OBJETIVO: Record<Objetivo, string> = {
  casa: "Wi-Fi na casa inteira (mesh)",
  comodo: "Sinal num cômodo (repetidor)",
  roteador: "Troca do roteador",
};

/**
 * Cobertura declarada por número de unidades, lida das fontes de cada ficha
 * (29/09/2026). O campo `coberturaM2` guarda um número só; aqui fica a tabela
 * inteira, porque é ela que diz quantas unidades uma casa pede.
 *   Deco X10: 190 m² com 1 unidade, 360 com 2, 520 com 3 (tplink-deco-x10-oficial)
 *   Deco X50 e Deco BE22: 600 m² com 3 unidades
 *   Halo H80X: 460 m² com 2 unidades
 * O Deco BE65 fala em "cobertura ampliada para a casa toda", sem número.
 */
export const COBERTURA: Record<string, Record<number, number>> = {
  "tplink-deco-x10": { 1: 190, 2: 360, 3: 520 },
  "tplink-deco-x50": { 3: 600 },
  "tplink-deco-be22": { 3: 600 },
  "mercusys-halo-h80x": { 2: 460 },
};
/** Unidades no anúncio que o site linka — o kit que se compra com um clique. */
export const KIT_VENDIDO: Record<string, number> = {
  "tplink-deco-x10": 2,
  "tplink-deco-x50": 2,
  "tplink-deco-be22": 2,
  "mercusys-halo-h80x": 2,
  "tplink-deco-be65": 1,
};
/**
 * Aparelhos cujas portas detectam sozinhas qual é a WAN: uma delas vai para o
 * modem, e sobram as outras. Nos roteadores TP-Link e Mercusys a ficha separa
 * 1 WAN e 3 LAN, e o campo `portasLan` já conta só as LAN.
 */
const WAN_AUTOMATICA = new Set([
  "tplink-deco-x10",
  "tplink-deco-x50",
  "tplink-deco-be22",
  "tplink-deco-be65",
  "mercusys-halo-h80x",
  "huawei-wifi-ax2s",
]);

/** Regra do simulador: a banda de 5 GHz declarada precisa ser o dobro do plano. */
export const FATOR_PLANO = 2;
const SWITCHES = [5, 8, 16, 24];

const n = (v: number) => v.toLocaleString("pt-BR");
const num = (v: unknown) => (typeof v === "number" ? v : null);

function portasLivres(p: Produto): number {
  const lan = num(p.specs.portasLan) ?? 0;
  return WAN_AUTOMATICA.has(p.slug) ? Math.max(0, lan - 1) : lan;
}

function atendePlano(p: Produto, plano: number): boolean {
  return (num(p.specs.velocidade5ghzMbps) ?? 0) >= plano * FATOR_PLANO;
}

const regraPlano = (plano: number) =>
  `Para um plano de ${n(plano)} Mb/s, só entra aparelho que declara pelo menos ${n(plano * FATOR_PLANO)} Mb/s na banda de 5 GHz. O número da caixa é o teto teórico do rádio, não o que chega no celular.`;

export type ProjetoWifi = {
  titulo: string;
  motivos: string[];
  itens: Item[];
  avisos: string[];
};

export function montarProjetoWifi(r: RespostasWifi, base: Record<string, Produto>): ProjetoWifi {
  const rede = Object.values(base).filter((p) => p.categoria === "conectividade");
  const itens: Item[] = [];
  const avisos: string[] = [];
  const motivos: string[] = [];
  let principal: Produto | undefined;

  if (r.objetivo === "casa") {
    principal = escolherMesh(rede, r, itens, avisos, motivos);
  } else if (r.objetivo === "roteador") {
    principal = escolherRoteador(rede, r, itens, avisos, motivos);
  } else {
    escolherRepetidor(rede, r, itens, avisos, motivos);
  }

  if (principal) cabosEPortas(principal, r, itens);
  adaptadores(rede, r, itens, avisos);

  const semGarantia = [...new Set(itens.map((i) => i.produto).filter(Boolean))]
    .map((s) => base[s!])
    .filter((p) => p && num(p.specs.garantiaMeses) == null);
  if (semGarantia.length) {
    avisos.push(
      `Nenhum dos aparelhos indicados traz o prazo de garantia na página do fabricante (${semGarantia.map((p) => p.modelo).join(", ")}). Confira na nota fiscal ou no manual antes de comprar.`,
    );
  }

  return { titulo: `O seu projeto: ${NOME_OBJETIVO[r.objetivo]}`, motivos, itens, avisos };
}

function escolherMesh(
  rede: Produto[],
  r: RespostasWifi,
  itens: Item[],
  avisos: string[],
  motivos: string[],
): Produto | undefined {
  const area = r.areaM2 + (r.externa ? r.areaExternaM2 : 0);
  const minimoUnidades = Math.max(1, r.andares);
  motivos.push(
    `Casa de ${n(area)} m²${r.externa ? ` (${n(r.areaExternaM2)} deles fora)` : ""} em ${r.andares === 1 ? "um andar" : `${n(r.andares)} andares`}: o sistema mesh espalha unidades pela casa em vez de depender de um roteador só.`,
  );
  if (r.andares > 1) {
    motivos.push(
      `Regra do simulador: pelo menos uma unidade por andar, porque a laje fica entre elas e nenhum fabricante declara cobertura atravessando andar.`,
    );
  }

  type Opcao = { p: Produto; unidades: number; cobertura: number; extras: number };
  const mesh = rede.filter((p) => p.specs.tipo === "Sistema mesh");
  const noPlano = mesh.filter((p) => atendePlano(p, r.planoMbps));
  const noAparelhos = noPlano.filter((p) => {
    const d = num(p.specs.dispositivosSimultaneos);
    return d == null || d >= r.aparelhos;
  });
  const opcoes: Opcao[] = [];
  for (const p of noAparelhos) {
    const tabela = COBERTURA[p.slug];
    if (!tabela) continue;
    const kit = KIT_VENDIDO[p.slug] ?? 1;
    // Quem compra o kit tem pelo menos as unidades dele: a cobertura citada é
    // a do kit quando o fabricante a declara, mesmo que menos unidades bastem.
    const unidades = Object.keys(tabela)
      .map(Number)
      .sort((a, b) => a - b)
      .find((u) => u >= Math.max(minimoUnidades, tabela[kit] ? kit : 1) && tabela[u] >= area);
    if (unidades == null) continue;
    opcoes.push({ p, unidades, cobertura: tabela[unidades], extras: Math.max(0, unidades - kit) });
  }
  // Regra do simulador: o que cobre com o kit anunciado vem antes do que
  // precisa de unidade avulsa; entre eles, o de menor velocidade declarada que
  // atende o plano — o resto é capacidade que a conexão da casa não usa.
  opcoes.sort(
    (a, b) =>
      a.extras - b.extras ||
      (num(a.p.specs.velocidade5ghzMbps) ?? 0) - (num(b.p.specs.velocidade5ghzMbps) ?? 0),
  );

  const escolha = opcoes[0];
  if (!escolha) {
    const motivo = !noPlano.length
      ? regraPlano(r.planoMbps)
      : `Nenhum sistema mesh da base declara cobertura para ${n(area)} m² com pelo menos ${n(minimoUnidades)} ${minimoUnidades === 1 ? "unidade" : "unidades"}. A maior cobertura declarada é de 600 m², com três unidades.`;
    avisos.push(motivo);
    itens.push({
      id: "mesh",
      grupo: "rede",
      papel: "Sistema mesh",
      qtd: 1,
      especificacao: `Sistema mesh com cobertura declarada de pelo menos ${n(area)} m²${minimoUnidades > 1 ? ` e ${n(minimoUnidades)} unidades` : ""}, com ${n(r.planoMbps * FATOR_PLANO)} Mb/s ou mais em 5 GHz.`,
      porque: motivo,
    });
    return undefined;
  }

  const { p, unidades, cobertura, extras } = escolha;
  const s = p.specs;
  const kit = KIT_VENDIDO[p.slug] ?? unidades;
  const confira: string[] = [
    `A ${p.marca} não diz em que condição mediu a cobertura: quantas paredes, de quê, com que interferência.${r.paredes === "concreto" ? " Com parede ou laje de concreto, a ficha não permite saber quanto dos metros declarados sobra." : ""}`,
  ];
  if (num(s.dispositivosSimultaneos) == null) {
    confira.push(`A ${p.marca} não declara quantos aparelhos o sistema aguenta ao mesmo tempo; você tem ${n(r.aparelhos)}.`);
  }
  const alt = opcoes.find((o) => o.p.slug !== p.slug);
  itens.push({
    id: "mesh",
    grupo: "rede",
    papel: `Sistema mesh (kit de ${n(kit)})`,
    qtd: 1,
    produto: p.slug,
    porque: `A ${p.marca} declara ${n(cobertura)} m² com ${n(unidades)} ${unidades === 1 ? "unidade" : "unidades"}, e a casa tem ${n(area)}. ${s.padraoWifi}, ${n(num(s.velocidade5ghzMbps)!)} Mb/s declarados em 5 GHz${num(s.dispositivosSimultaneos) ? `, até ${n(num(s.dispositivosSimultaneos)!)} aparelhos` : ""}.`,
    regra: regraPlano(r.planoMbps),
    confira,
    alternativa: alt
      ? {
          produto: alt.p.slug,
          motivo: `declara ${n(alt.cobertura)} m² com ${n(alt.unidades)} unidades e ${n(num(alt.p.specs.velocidade5ghzMbps)!)} Mb/s em 5 GHz${alt.extras ? `, mas pede ${n(alt.extras)} unidade avulsa além do kit` : ""}`,
        }
      : undefined,
  });
  if (extras > 0) {
    itens.push({
      id: "mesh-extra",
      grupo: "rede",
      papel: "Unidade extra do mesmo sistema",
      qtd: extras,
      especificacao: `Unidade avulsa do ${p.modelo}, para completar ${n(unidades)}.`,
      porque: `O anúncio é do kit de ${n(kit)}; a cobertura de ${n(cobertura)} m² que a ${p.marca} declara é com ${n(unidades)} unidades.`,
    });
  }
  return p;
}

function escolherRoteador(
  rede: Produto[],
  r: RespostasWifi,
  itens: Item[],
  avisos: string[],
  motivos: string[],
): Produto | undefined {
  motivos.push("Você quer trocar o roteador, não espalhar unidades pela casa.");
  if (r.andares > 1 || r.areaM2 > 190) {
    avisos.push(
      `Nenhum roteador da base declara cobertura em m². A referência mais próxima é o Deco X10, que declara 190 m² para uma unidade; com ${r.andares > 1 ? `${n(r.andares)} andares` : `${n(r.areaM2)} m²`}, um sistema mesh é a indicação pelas suas respostas.`,
    );
  }
  const roteadores = rede.filter((p) => p.specs.tipo === "Roteador");
  const opcoes = roteadores
    .filter((p) => atendePlano(p, r.planoMbps))
    .sort(
      (a, b) =>
        Number(portasLivres(b) >= r.cabeados) - Number(portasLivres(a) >= r.cabeados) ||
        (num(a.specs.velocidade5ghzMbps) ?? 0) - (num(b.specs.velocidade5ghzMbps) ?? 0),
    );
  const p = opcoes[0];
  if (!p) {
    avisos.push(regraPlano(r.planoMbps));
    return undefined;
  }
  const alt = opcoes.find((o) => o.slug !== p.slug);
  const s = p.specs;
  itens.push({
    id: "roteador",
    grupo: "rede",
    papel: "Roteador",
    qtd: 1,
    produto: p.slug,
    porque: `${s.padraoWifi}, ${n(num(s.velocidade5ghzMbps)!)} Mb/s declarados em 5 GHz e ${n(portasLivres(p))} portas livres para aparelhos por cabo${s.portaGigabit ? ", todas gigabit" : ""}. Entre os roteadores da base que atendem o plano, é o de menor velocidade declarada.`,
    regra: regraPlano(r.planoMbps),
    confira: [
      `A ${p.marca} não declara cobertura em m² nem quantos aparelhos o roteador aguenta; você tem ${n(r.aparelhos)}.`,
    ],
    alternativa: alt
      ? {
          produto: alt.slug,
          motivo: `${n(num(alt.specs.velocidade5ghzMbps)!)} Mb/s em 5 GHz e ${n(portasLivres(alt))} portas livres${alt.specs.mesh === true && p.specs.mesh !== true ? ", e aceita juntar unidades mesh depois" : ""}`,
        }
      : undefined,
  });
  return p;
}

function escolherRepetidor(
  rede: Produto[],
  r: RespostasWifi,
  itens: Item[],
  avisos: string[],
  motivos: string[],
) {
  motivos.push(
    "O roteador da casa funciona e falta sinal num ponto: o repetidor recebe o Wi-Fi e o retransmite dali.",
  );
  // Regra do simulador: planos de 300 Mb/s para cima pedem repetidor de duas
  // bandas; entre eles, primeiro o de porta gigabit, depois o mais rápido.
  const opcoes = rede
    .filter((p) => p.specs.tipo === "Repetidor" && num(p.specs.velocidade5ghzMbps) != null)
    .sort(
      (a, b) =>
        Number(b.specs.portaGigabit === true) - Number(a.specs.portaGigabit === true) ||
        (num(b.specs.velocidade5ghzMbps) ?? 0) - (num(a.specs.velocidade5ghzMbps) ?? 0),
    );
  const p = opcoes[0];
  if (!p) return;
  const alt = opcoes[1];
  itens.push({
    id: "repetidor",
    grupo: "rede",
    papel: "Repetidor",
    qtd: 1,
    produto: p.slug,
    porque: `Duas bandas, ${n(num(p.specs.velocidade5ghzMbps)!)} Mb/s declarados em 5 GHz${p.specs.portaGigabit ? " e a única porta gigabit entre os repetidores da base — a TV ou o videogame do cômodo podem ir por cabo nele" : ""}.`,
    confira: [
      `A ${p.marca} não declara cobertura em m² nem quantos aparelhos o repetidor aguenta.`,
      "Instale no meio do caminho, onde o Wi-Fi do roteador ainda chega forte — repetidor retransmite o sinal que recebe.",
    ],
    alternativa: alt
      ? {
          produto: alt.slug,
          motivo: `${n(num(alt.specs.velocidade5ghzMbps)!)} Mb/s em 5 GHz${alt.specs.portaGigabit ? "" : " e porta de 100 Mb/s, abaixo do seu plano"}`,
        }
      : undefined,
  });
  avisos.push(
    "Repetidor resolve um ponto, não a casa: se o sinal fraco aparecer em mais de um cômodo, refaça escolhendo \"O Wi-Fi não chega bem em vários lugares\".",
  );
}

function cabosEPortas(principal: Produto, r: RespostasWifi, itens: Item[]) {
  const livres = portasLivres(principal);
  itens.push({
    id: "cabo-modem",
    grupo: "cabos",
    papel: "Cabo de rede do modem ao aparelho principal",
    qtd: 1,
    especificacao: `Cabo de rede Cat5e ou Cat6${r.planoMbps >= 1000 ? " — abaixo de Cat5e o cabo não passa de 100 Mb/s" : ""}.`,
    porque: "Liga a internet da operadora ao Wi-Fi novo.",
    confira: [`A ficha do ${principal.modelo} não diz se a caixa traz um cabo.`],
  });
  if (r.cabeados > 0) {
    itens.push({
      id: "cabos-aparelhos",
      grupo: "cabos",
      papel: "Cabo de rede para cada aparelho",
      qtd: r.cabeados,
      especificacao: "Cabo de rede Cat5e ou Cat6, no comprimento até cada aparelho.",
      porque: `${n(r.cabeados)} ${r.cabeados === 1 ? "aparelho" : "aparelhos"} por cabo, perto do ${principal.modelo}.`,
    });
  }
  if (r.cabeados > livres) {
    // Topologia: o switch ocupa uma porta do roteador para se ligar a ele.
    const precisa = r.cabeados - livres + 1;
    const portas = menorQueCabe(SWITCHES, precisa);
    itens.push({
      id: "switch",
      grupo: "cabos",
      papel: "Switch de rede",
      qtd: 1,
      especificacao: `Switch gigabit de ${n(portas)} portas.`,
      porque: `O ${principal.modelo} tem ${n(livres)} ${livres === 1 ? "porta livre" : "portas livres"} depois da que vai para o modem, e você quer ligar ${n(r.cabeados)} por cabo. O switch ocupa uma porta e multiplica as outras.`,
    });
    itens.push({
      id: "cabo-switch",
      grupo: "cabos",
      papel: "Cabo de rede do aparelho principal ao switch",
      qtd: 1,
      especificacao: "Cabo de rede Cat5e ou Cat6, curto.",
      porque: "Liga o switch ao Wi-Fi.",
    });
  }
}

function adaptadores(rede: Produto[], r: RespostasWifi, itens: Item[], avisos: string[]) {
  if (r.computadores <= 0) return;
  // Regra do simulador: o adaptador de maior velocidade declarada em 5 GHz; a
  // alternativa é o de antena externa, para computador longe do roteador.
  const opcoes = rede
    .filter((p) => p.specs.tipo === "Adaptador Wi-Fi USB" && num(p.specs.velocidade5ghzMbps) != null)
    .sort((a, b) => (num(b.specs.velocidade5ghzMbps) ?? 0) - (num(a.specs.velocidade5ghzMbps) ?? 0));
  const p = opcoes[0];
  if (!p) return;
  const alt = opcoes[1];
  const v5 = num(p.specs.velocidade5ghzMbps)!;
  itens.push({
    id: "adaptador",
    grupo: "computadores",
    papel: "Adaptador Wi-Fi USB",
    qtd: r.computadores,
    produto: p.slug,
    porque: `O de maior velocidade declarada entre os adaptadores da base: ${n(v5)} Mb/s em 5 GHz, ${p.specs.padraoWifi}. Um por computador sem Wi-Fi ou com Wi-Fi antigo.`,
    confira: [`A ${p.marca} não diz quantas antenas ele tem nem o ganho delas.`],
    alternativa: alt
      ? {
          produto: alt.slug,
          motivo: `tem antena externa (${String(alt.specs.antenas)}), útil longe do roteador, mas ${n(num(alt.specs.velocidade5ghzMbps)!)} Mb/s em 5 GHz`,
        }
      : undefined,
  });
  if (v5 < r.planoMbps) {
    avisos.push(
      `Nenhum adaptador USB da base declara mais que ${n(v5)} Mb/s em 5 GHz, abaixo do seu plano de ${n(r.planoMbps)}. Para o computador receber o plano inteiro, o caminho é o cabo.`,
    );
  }
}

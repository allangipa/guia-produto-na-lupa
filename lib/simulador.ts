/**
 * A primeira pergunta do /simulador: qual projeto montar.
 *
 * Até 29/09/2026 este arquivo guardava a matriz de indicações da primeira
 * versão (28/09): três perguntas e dois cards por combinação. As frentes
 * viraram questionários completos, com lista de compras, e a matriz saiu. A
 * especificação de cada um está em docs/simulador.md.
 *
 * O projeto vai no endereço (`/simulador?projeto=ar`), para a ficha, a home e
 * o cabeçalho levarem direto à ferramenta certa.
 */

export type Foco = "wifi" | "automacao" | "seguranca" | "ar" | "nobreak" | "airfryer" | "purificador" | "cooktop";

export const FOCOS: { valor: Foco; rotulo: string }[] = [
  { valor: "wifi", rotulo: "Rede Wi-Fi" },
  { valor: "automacao", rotulo: "Automação residencial" },
  { valor: "seguranca", rotulo: "Câmeras de segurança" },
  { valor: "ar", rotulo: "Ar-condicionado" },
  { valor: "nobreak", rotulo: "Nobreak" },
  { valor: "airfryer", rotulo: "Air fryer" },
  { valor: "purificador", rotulo: "Refil do purificador" },
  { valor: "cooktop", rotulo: "Cooktop e instalação" },
];

/** A pergunta que cada projeto responde — na home e no aviso das fichas. */
export const CHAMADAS: Record<Foco, string> = {
  wifi: "O Wi-Fi não chega em toda a casa? Mesh, repetidor ou roteador, com os cabos.",
  automacao: "Luz, tomada, sensor e fechadura num aplicativo só — com ou sem fio neutro.",
  seguranca: "Câmeras, gravador, HD, cabo e conectores, peça por peça.",
  ar: "Quantos BTUs o seu cômodo pede, pela conta da LG.",
  nobreak: "Some os watts dos seus aparelhos e veja o nobreak que aguenta.",
  airfryer: "Quanta batata cabe de uma vez — o litro do nome não diz.",
  purificador: "Quanto o refil dura na sua casa, em litros, e não em meses.",
  cooktop: "A corrente que o cooktop puxa e o disjuntor que a ficha declara.",
};

export const hrefDoFoco = (f: Foco) => `/simulador?projeto=${f}`;

export const ehFoco = (v: string | null): v is Foco => FOCOS.some((f) => f.valor === v);

/** Qual projeto do simulador atende quem está numa ficha desta categoria. */
export const FOCO_DA_CATEGORIA: Record<string, Foco> = {
  "ar-condicionado": "ar",
  nobreaks: "nobreak",
  cozinha: "airfryer",
  purificadores: "purificador",
  cooktops: "cooktop",
  cftv: "seguranca",
  conectividade: "wifi",
  "casa-conectada": "automacao",
};

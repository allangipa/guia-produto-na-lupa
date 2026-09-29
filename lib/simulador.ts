/**
 * A primeira pergunta do /simulador: qual projeto montar.
 *
 * Até 29/09/2026 este arquivo guardava a matriz de indicações da primeira
 * versão (28/09): três perguntas e dois cards por combinação. As três frentes
 * viraram questionários completos, com lista de compras — câmeras em
 * lib/simulador-cameras.ts, Wi-Fi em lib/simulador-wifi.ts e automação em
 * lib/simulador-automacao.ts —, e a matriz saiu. A especificação de cada um
 * está em docs/simulador.md.
 */

export type Foco = "wifi" | "automacao" | "seguranca";

export const FOCOS: { valor: Foco; rotulo: string }[] = [
  { valor: "wifi", rotulo: "Rede Wi-Fi" },
  { valor: "automacao", rotulo: "Automação residencial" },
  { valor: "seguranca", rotulo: "Câmeras de segurança" },
];

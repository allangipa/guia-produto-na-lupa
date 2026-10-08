import { LIMITE_TITULO } from "./site";

/**
 * <title> da ficha de produto no formato de busca (08/10/2026).
 *
 * O Search Console mostrou que quase toda busca que traz o site e
 * "modelo + ficha tecnica". O titulo mantem esse par e acrescenta, por
 * categoria, as duas ou tres palavras que o autocomplete do Google junta ao
 * modelo ("bateria", "btus", "litros"...). Tudo dentro de 60 caracteres: os
 * termos saem do fim ate caber; sem espaco nem para "ficha tecnica", fica so o
 * nome, que e o que a pessoa digitou.
 */
const TERMOS: Record<string, string[]> = {
  "ar-condicionado": ["BTUs", "área", "consumo"],
  armazenamento: ["velocidade", "capacidade"],
  aspiradores: ["potência", "sucção", "autonomia"],
  audio: ["bateria", "Bluetooth"],
  batedeiras: ["potência", "tigela", "velocidades"],
  cafeteiras: ["xícaras", "potência", "capacidade"],
  "casa-conectada": ["app", "Alexa", "sem nuvem"],
  celular: ["bateria", "tela", "câmera"],
  cftv: ["canais", "1080p", "HD"],
  chaleiras: ["litros", "potência", "temperatura"],
  conectividade: ["velocidade", "bandas", "portas"],
  cooktops: ["bocas", "potência", "disjuntor"],
  cozinha: ["litros reais", "potência", "temperatura"],
  energia: ["mAh reais", "Wh", "portas"],
  "escovas-secadoras": ["potência", "temperatura", "pontas"],
  espremedores: ["potência", "jarra", "cones"],
  ferros: ["vapor", "base", "reservatório"],
  furadeiras: ["torque", "potência", "bateria"],
  geladeiras: ["litros", "consumo", "degelo"],
  "lavadoras-alta-pressao": ["pressão", "vazão", "motor"],
  lavadoras: ["kg", "água", "energia"],
  lavaloucas: ["serviços", "consumo", "programas"],
  liquidificadores: ["litros reais", "potência", "velocidades"],
  microondas: ["litros", "potência", "grill"],
  mixers: ["potência", "velocidades", "copo"],
  monitores: ["Hz", "resposta", "painel"],
  nobreaks: ["potência", "autonomia", "PFC"],
  perifericos: ["conexão", "garantia"],
  processadores: ["potência", "jarra", "peças"],
  purificadores: ["refil", "água gelada", "vazão"],
  sanduicheiras: ["sanduíches", "chapa", "potência"],
  secadores: ["potência", "motor", "temperatura"],
  smartwatches: ["bateria", "tela", "GPS"],
  tablets: ["tela", "bateria", "chip"],
  torradeiras: ["fatias", "níveis", "potência"],
  ventiladores: ["diâmetro", "vazão", "consumo"],
};

function lista(termos: string[]) {
  if (termos.length <= 1) return termos.join("");
  return `${termos.slice(0, -1).join(", ")} e ${termos[termos.length - 1]}`;
}

export function tituloProduto(nome: string, categoria: string): string {
  // termo que ja esta no nome ("144 Hz", "10.000 mAh") nao se repete
  const n = nome.toLowerCase();
  const termos = (TERMOS[categoria] ?? []).filter((t) => !n.includes(t.toLowerCase().split(" ")[0]));
  while (termos.length) {
    const t = termos.length === 1
      ? `${nome}: ficha técnica e ${termos[0]}`
      : `${nome}: ficha técnica, ${lista(termos)}`;
    if (t.length <= LIMITE_TITULO) return t;
    termos.pop();
  }
  const base = `${nome}: ficha técnica`;
  return base.length <= LIMITE_TITULO ? base : nome;
}

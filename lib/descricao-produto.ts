import { camposDa, destaquesDa, rotuloCurto, transparencia, valorLegivel, type Campo, type Produto } from "./specs";

/**
 * Meta description da ficha de produto, desde 18/10/2026.
 *
 * Até ali a description era o `resumo`, a frase crítica do topo da ficha
 * ("A mesma página publica 'Vácuo (Pa): 2400' e 'Vácuo (mbar): 2400'"). Boa
 * para quem já está na página, ruim no Google: o Search Console de 18/10
 * mostrou as fichas com 76% das impressões do site (4.257 de 5.634), posição
 * média perto de 9 e CTR de 0,47%, contra 2,1% dos comparativos — cuja
 * description segue a regra de 08/10 (números da ficha na frente, depois o
 * que a página entrega). Quem buscou "moto g35 ficha técnica" lia no
 * resultado uma crítica sobre medidas, e não os números que pediu.
 *
 * Agora: o nome, até três números que o fabricante publicou (os destaques da
 * categoria primeiro, como no topo da ficha), e a entrega do site — quantos
 * campos a marca publica e a promessa de mostrar o que ela não informa. Tudo
 * sai da base; nada é digitado. O `resumo` continua no topo da página e no
 * cartão de compartilhamento.
 */

const LIMITE = 155;

/** Valor curto o bastante para caber numa linha de resultado de busca. */
function trecho(p: Produto, c: Campo): string | null {
  const v = p.specs[c.chave];
  if (v === null || v === undefined || typeof v === "boolean") return null;
  const texto = valorLegivel(v, c);
  if (texto.length > 26) return null;
  const rotulo = rotuloCurto(c);
  // "Tela" vira "tela", mas "PFC ativo" e "IP" ficam como estão.
  const r = /^[A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç]/.test(rotulo) ? rotulo[0].toLowerCase() + rotulo.slice(1) : rotulo;
  // Número sem unidade lê melhor antes do rótulo: "16 canais", "14 serviços".
  if (typeof v === "number" && !c.unidade) return `${texto} ${r}`;
  return `${r} ${texto}`;
}

function juntar(itens: string[]): string {
  if (itens.length <= 1) return itens.join("");
  return `${itens.slice(0, -1).join(", ")} e ${itens[itens.length - 1]}`;
}

export function descricaoProduto(p: Produto): string {
  const campos = camposDa(p.categoria);
  const t = transparencia(p, campos);

  const chaves = [
    ...destaquesDa(p.categoria),
    ...campos.filter((c) => c.contaTransparencia).map((c) => c.chave),
  ].filter((k, i, todas) => todas.indexOf(k) === i && !p.naoSeAplica?.includes(k));

  // Número antes de texto: "bateria 5.000 mAh" diz mais na busca que
  // "formato Barra". A ordem da categoria vale dentro de cada grupo.
  const numerico = (c: Campo) => typeof p.specs[c.chave] === "number";
  const numeros = chaves
    .map((k) => campos.find((c) => c.chave === k))
    .filter((c): c is Campo => Boolean(c))
    .sort((a, b) => Number(numerico(b)) - Number(numerico(a)))
    .map((c) => trecho(p, c))
    .filter((s): s is string => Boolean(s))
    .slice(0, 3);

  const caudas = [
    `Ficha oficial com ${t.preenchidos} de ${t.total} campos publicados pela ${p.marca}, a fonte de cada número e o que ela não informa.`,
    `Ficha oficial: ${t.preenchidos} de ${t.total} campos, com fonte, e o que a ${p.marca} não informa.`,
    `Ficha oficial: ${t.preenchidos} de ${t.total} campos, com fonte.`,
  ];

  // Números antes da cauda longa: com pouco espaço, encurta-se a frase do
  // site primeiro e só depois se perde um número da ficha.
  for (let n = numeros.length; n >= 0; n--) {
    for (const cauda of caudas) {
      const abertura = n ? `${p.nome}: ${juntar(numeros.slice(0, n))}.` : `${p.nome}.`;
      const d = `${abertura} ${cauda}`;
      if (d.length <= LIMITE) return d;
    }
  }
  return p.resumo.length <= LIMITE ? p.resumo : `${p.resumo.slice(0, LIMITE - 1).replace(/\s+\S*$/, "")}…`;
}

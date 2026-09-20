import manifesto from "./variantes.json";

// Sem `node:fs` aqui de proposito: este modulo e importado por componente
// de cliente (o menu de departamentos), e qualquer import de Node quebra o
// empacotamento. A verificacao que le o disco mora em ./variantes-conferir.

type Variante = { larguras: number[]; original: number };

const MAPA = manifesto as Record<string, Variante>;

/**
 * O `srcset` de uma foto de produto, montado a partir do que
 * `npm run imagens` gerou em public/produtos/240/ e /480/.
 *
 * Devolve `undefined` para o que nao tem versao menor — SVG de marca, foto
 * hospedada na Amazon, foto pequena demais para render degrau. Nesse caso o
 * componente emite um `<img>` comum, que e o comportamento certo: `srcset`
 * com uma fonte so nao ajuda ninguem.
 */
export function srcSetDe(src: string): string | undefined {
  const v = MAPA[src];
  if (!v || v.larguras.length === 0) return undefined;
  const corte = src.lastIndexOf("/");
  const pasta = src.slice(0, corte);
  const arquivo = src.slice(corte + 1);
  const degraus = v.larguras.map((w) => `${pasta}/${w}/${arquivo} ${w}w`);
  return [...degraus, `${src} ${v.original}w`].join(", ");
}


import fs from "node:fs";
import path from "node:path";
import manifesto from "./variantes.json";

type Variante = { larguras: number[]; original: number };

const MAPA = manifesto as Record<string, Variante>;

/**
 * Quebra o build quando o manifesto e as fotos discordam.
 *
 * Sao duas discordancias possiveis, e nenhuma das duas aparece na tela de
 * quem escreve:
 *
 * 1. Foto nova em `dados/` que ninguem passou pelo `npm run imagens`. Ela nao
 *    esta no manifesto, a pagina serve o arquivo de 1200 px para um circulo de
 *    104 px, e tudo continua parecendo certo — so mais lento. Por isso toda
 *    foto entra no manifesto, inclusive a que nao rendeu degrau: ausencia
 *    passa a significar uma coisa so.
 *
 * 2. Degrau listado no manifesto sem arquivo no disco. Ai o navegador escolhe
 *    um endereco que devolve 404 e a foto some — e some justamente no celular,
 *    que e onde o degrau pequeno seria escolhido.
 */
export function verificarVariantes(srcs: string[]) {
  const ausentes = srcs.filter((s) => s.startsWith("/produtos/") && !MAPA[s]);
  if (ausentes.length) {
    throw new Error(
      `Fotos fora do manifesto de variantes: ${ausentes.slice(0, 5).join(", ")}` +
        `${ausentes.length > 5 ? ` e mais ${ausentes.length - 5}` : ""}. ` +
        `Rode \`npm run imagens\` — sem isso elas seriam servidas em tamanho ` +
        `cheio no celular.`,
    );
  }

  const publico = path.join(process.cwd(), "public");
  const semArquivo: string[] = [];
  for (const [src, v] of Object.entries(MAPA)) {
    const corte = src.lastIndexOf("/");
    const pasta = src.slice(1, corte);
    const arquivo = src.slice(corte + 1);
    for (const w of v.larguras) {
      if (!fs.existsSync(path.join(publico, pasta, String(w), arquivo))) {
        semArquivo.push(`/${pasta}/${w}/${arquivo}`);
      }
    }
  }
  if (semArquivo.length) {
    throw new Error(
      `Degraus no manifesto sem arquivo no disco: ` +
        `${semArquivo.slice(0, 5).join(", ")}` +
        `${semArquivo.length > 5 ? ` e mais ${semArquivo.length - 5}` : ""}. ` +
        `O navegador escolheria um endereco que devolve 404. Rode ` +
        `\`npm run imagens\`.`,
    );
  }
}

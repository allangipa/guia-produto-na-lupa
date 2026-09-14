import fs from "node:fs";
import path from "node:path";
import type { DadosAmazon } from "./specs";

/**
 * Leitura dos dados sincronizados da Amazon (Creators API), gravados por
 * `scripts/amazon-sync.mjs` em `dados/amazon/<ASIN>.json`.
 *
 * Só de servidor: usa `node:fs`. A interface nunca chama isto diretamente —
 * `lib/produtos.ts` anexa o resultado ao produto na leitura da base, e os
 * componentes leem `produto.amazon` como dado comum.
 *
 * A pasta pode não existir (API ainda não liberada) — nesse caso tudo devolve
 * `undefined` e o site segue como está, com silhueta e sem preço.
 */

const DIR = path.join(process.cwd(), "dados", "amazon");

export function asinDe(url: string | undefined): string | null {
  const m = String(url ?? "").match(/\/dp\/([A-Z0-9]{10})/i);
  return m ? m[1].toUpperCase() : null;
}

export function dadosAmazon(asin: string | null): DadosAmazon | undefined {
  if (!asin) return undefined;
  const arquivo = path.join(DIR, `${asin}.json`);
  if (!fs.existsSync(arquivo)) return undefined;
  try {
    return JSON.parse(fs.readFileSync(arquivo, "utf8")) as DadosAmazon;
  } catch {
    return undefined;
  }
}

/** Quando a base foi sincronizada pela última vez, se foi. */
export function ultimaSincronizacao():
  | { consultadoEm: string; total: number; origem: string }
  | undefined {
  const arquivo = path.join(DIR, "_indice.json");
  if (!fs.existsSync(arquivo)) return undefined;
  try {
    return JSON.parse(fs.readFileSync(arquivo, "utf8"));
  } catch {
    return undefined;
  }
}

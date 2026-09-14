#!/usr/bin/env node
/**
 * Converte as fotos de produto para WebP e aponta as fichas para os novos
 * arquivos.
 *
 * Os PNGs oficiais dos fabricantes chegam pesados — o da JBL passa de 900 KB.
 * WebP com qualidade 82 corta perto de 70% sem diferença visível numa foto de
 * produto sobre fundo liso. Como o site é estático e não otimiza imagem em
 * tempo de execução, a conversão tem que acontecer aqui, antes do build.
 *
 *   npm run imagens
 *
 * Idempotente: pula o que já é WebP e só remove o PNG depois de gravar o WebP
 * com sucesso. Limita o lado maior a 1200 px, que é mais do que qualquer
 * card ou ficha exibe.
 */

import { readdir, readFile, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const RAIZ = process.cwd();
const DIR_IMG = path.join(RAIZ, "public", "produtos");
const DIR_DADOS = path.join(RAIZ, "dados");

async function converter() {
  const arquivos = (await readdir(DIR_IMG)).filter((f) => /\.(png|jpe?g)$/i.test(f));
  const trocas = new Map(); // "/produtos/x.png" -> "/produtos/x.webp"

  for (const f of arquivos) {
    const origem = path.join(DIR_IMG, f);
    const nomeWebp = f.replace(/\.(png|jpe?g)$/i, ".webp");
    const destino = path.join(DIR_IMG, nomeWebp);

    const antes = (await readFile(origem)).length;
    await sharp(origem)
      .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(destino);
    const depois = (await readFile(destino)).length;

    await unlink(origem);
    trocas.set(`/produtos/${f}`, `/produtos/${nomeWebp}`);
    console.log(
      `${f} → ${nomeWebp}: ${Math.round(antes / 1024)} KB → ${Math.round(depois / 1024)} KB (${Math.round((1 - depois / antes) * 100)}% menor)`,
    );
  }
  return trocas;
}

async function apontarFichas(trocas) {
  if (trocas.size === 0) return;
  const arquivos = (await readdir(DIR_DADOS)).filter((f) => f.endsWith(".json"));
  for (const f of arquivos) {
    const caminho = path.join(DIR_DADOS, f);
    let texto = await readFile(caminho, "utf8");
    let mudou = false;
    for (const [de, para] of trocas) {
      if (texto.includes(`"${de}"`)) {
        texto = texto.split(`"${de}"`).join(`"${para}"`);
        mudou = true;
      }
    }
    if (mudou) {
      await writeFile(caminho, texto, "utf8");
      console.log(`fichas atualizadas em dados/${f}`);
    }
  }
}

const trocas = await converter();
await apontarFichas(trocas);
if (trocas.size === 0) console.log("Nada a converter: tudo já é WebP.");

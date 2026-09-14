"use client";

import { useState } from "react";
import Image from "next/image";
// `import type` some na compilação — o componente é cliente e `lib/conteudo`
// lê arquivo, então só o tipo pode atravessar essa fronteira.
import type { Imagem } from "@/lib/conteudo";

/**
 * A galeria de fotos oficiais da ficha.
 *
 * Não é carrossel: nada gira sozinho, não há seta que empurra o próximo nem
 * intervalo de tempo. É um seletor — a foto grande troca quando o leitor
 * escolhe uma miniatura, e o estado inicial já mostra a principal. A proibição
 * do projeto é contra mecanismo de pressão de venda e movimento automático,
 * não contra o leitor ver o produto de mais de um ângulo.
 *
 * Com uma foto só, a fileira de miniaturas não aparece e o resultado é
 * exatamente o que existia antes.
 */
export function GaleriaProduto({
  fotos,
  nome,
}: {
  fotos: Imagem[];
  nome: string;
}) {
  const [atual, setAtual] = useState(0);
  const foto = fotos[atual] ?? fotos[0];
  if (!foto) return null;

  return (
    <div>
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-superficie">
        <Image
          key={foto.src}
          src={foto.src}
          alt={foto.alt}
          fill
          priority={atual === 0}
          sizes="(max-width: 1024px) 100vw, 480px"
          className="object-contain p-4"
        />
        <span className="absolute bottom-1.5 right-2 rounded bg-papel/85 px-1.5 py-0.5 text-[0.62rem] text-tinta-suave backdrop-blur">
          {foto.credito}
        </span>
      </div>

      {fotos.length > 1 && (
        <div
          role="group"
          aria-label={`Fotos oficiais do ${nome}`}
          className="flex gap-2 border-t border-linha p-2.5"
        >
          {fotos.map((f, i) => (
            <button
              key={f.src}
              type="button"
              onClick={() => setAtual(i)}
              aria-current={i === atual}
              aria-label={f.alt}
              className={`relative aspect-square w-16 shrink-0 overflow-hidden rounded border bg-superficie transition-colors ${
                i === atual
                  ? "border-acao ring-1 ring-acao"
                  : "border-linha hover:border-acao/60"
              }`}
            >
              <Image
                src={f.src}
                alt=""
                fill
                sizes="64px"
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

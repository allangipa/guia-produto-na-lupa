"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
// `import type` some na compilação — o componente é cliente e `lib/conteudo`
// lê arquivo, então só o tipo pode atravessar essa fronteira.
import type { Imagem } from "@/lib/conteudo";
import { Icone } from "@/components/icones";

/**
 * A galeria de fotos oficiais da ficha, no formato de loja: trilho de
 * miniaturas à esquerda, foto grande à direita, e a foto abre em tela cheia
 * no clique — com as miniaturas do outro lado, para trocar sem sair.
 *
 * Não é carrossel: nada gira sozinho, não há intervalo de tempo nem seta que
 * empurra o próximo sem o leitor pedir. A proibição do projeto é contra
 * mecanismo de pressão de venda e movimento automático, não contra o leitor
 * ver o produto de perto — que numa ficha sem teste é metade do que ele tem.
 *
 * A tela cheia também não é pop-up no sentido proibido: não aparece sozinha,
 * não interrompe leitura e não vende nada. Abre no clique e fecha no Esc, no
 * botão ou no clique fora.
 *
 * Com uma foto só, o trilho não aparece e o resultado é o que existia antes.
 */
export function GaleriaProduto({
  fotos,
  nome,
}: {
  fotos: Imagem[];
  nome: string;
}) {
  const [atual, setAtual] = useState(0);
  const [aberta, setAberta] = useState(false);
  const foco = useRef<HTMLElement | null>(null);
  const fechar = useRef<HTMLButtonElement | null>(null);

  const total = fotos.length;
  const ir = useCallback(
    (passo: number) => setAtual((i) => (i + passo + total) % total),
    [total],
  );

  // Teclado só enquanto a tela cheia está aberta: Esc fecha, setas trocam.
  useEffect(() => {
    if (!aberta) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberta(false);
      else if (e.key === "ArrowRight") ir(1);
      else if (e.key === "ArrowLeft") ir(-1);
    };
    document.addEventListener("keydown", aoTeclar);
    // Trava a rolagem do fundo, senão a página corre atrás da tela cheia.
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    fechar.current?.focus();
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = antes;
      // Devolve o foco a quem abriu, senão o leitor de tela volta para o topo.
      foco.current?.focus();
    };
  }, [aberta, ir]);

  const foto = fotos[atual] ?? fotos[0];
  if (!foto) return null;

  const Miniaturas = ({ vertical }: { vertical: boolean }) => (
    <div
      role="group"
      aria-label={`Fotos oficiais do ${nome}`}
      className={
        vertical
          ? "flex shrink-0 flex-col gap-2 overflow-y-auto"
          : "rolo flex gap-2 overflow-x-auto"
      }
    >
      {fotos.map((f, i) => (
        <button
          key={f.src}
          type="button"
          onClick={() => setAtual(i)}
          aria-current={i === atual}
          aria-label={f.alt}
          className={`relative aspect-square w-14 shrink-0 overflow-hidden rounded border bg-superficie transition-colors ${
            i === atual
              ? "border-acao ring-1 ring-acao"
              : "border-linha hover:border-acao/60"
          }`}
        >
          <Image src={f.src} alt="" fill sizes="56px" className="object-contain p-1" />
        </button>
      ))}
    </div>
  );

  return (
    <>
      <div className="flex gap-2.5 p-2.5">
        {total > 1 && (
          <div className="hidden max-h-[22rem] sm:block">
            <Miniaturas vertical />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={(e) => {
              foco.current = e.currentTarget;
              setAberta(true);
            }}
            aria-label={`Abrir a foto em tela cheia: ${foto.alt}`}
            className="group relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded bg-superficie"
          >
            <Image
              key={foto.src}
              src={foto.src}
              alt={foto.alt}
              fill
              priority={atual === 0}
              sizes="(max-width: 1024px) 100vw, 420px"
              className="object-contain p-3"
            />
            <span className="absolute bottom-1.5 right-2 rounded bg-papel/85 px-1.5 py-0.5 text-[0.62rem] text-tinta-suave backdrop-blur">
              {foto.credito}
            </span>
            <span className="pointer-events-none absolute left-2 top-2 flex items-center gap-1 rounded bg-papel/85 px-1.5 py-0.5 text-[0.65rem] text-tinta-suave opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              <Icone nome="lupa" className="h-3 w-3" />
              Ampliar
            </span>
          </button>

          {total > 1 && (
            <div className="mt-2.5 sm:hidden">
              <Miniaturas vertical={false} />
            </div>
          )}
        </div>
      </div>

      {aberta && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Fotos do ${nome}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) setAberta(false);
          }}
          className="fixed inset-0 z-50 flex flex-col gap-3 bg-tinta/90 p-4 backdrop-blur-sm sm:flex-row sm:p-6"
        >
          <div className="relative min-h-0 flex-1">
            <Image
              src={foto.src}
              alt={foto.alt}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:w-[5.5rem]">
            <button
              ref={fechar}
              type="button"
              onClick={() => setAberta(false)}
              className="self-end rounded-full bg-papel px-3 py-1.5 text-[0.8rem] font-medium text-tinta hover:bg-papel/90 sm:self-stretch"
            >
              Fechar
            </button>
            {total > 1 && (
              <div className="min-h-0 overflow-auto">
                <div className="hidden sm:block">
                  <Miniaturas vertical />
                </div>
                <div className="sm:hidden">
                  <Miniaturas vertical={false} />
                </div>
              </div>
            )}
          </div>

          <p className="absolute bottom-2 left-4 right-4 text-center text-[0.72rem] text-white/70 sm:left-6 sm:right-28 sm:text-left">
            {foto.alt} · {foto.credito}
          </p>
        </div>
      )}
    </>
  );
}

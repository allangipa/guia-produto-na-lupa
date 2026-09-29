"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { PERFIS, chaveDo, type Perfil } from "@/lib/simulador";
import { Opcoes } from "@/components/simulador-campos";

/**
 * O simulador simples, que hoje só atende automação: uma pergunta e uma
 * indicação. Câmeras e Wi-Fi saíram daqui em 29/09/2026 para os questionários
 * completos (`simulador-cameras.tsx`, `simulador-wifi.tsx`), que montam a lista
 * de compras do projeto; automação segue neste formato até ganhar o dela
 * (docs/simulador.md).
 *
 * Os resultados chegam prontos do servidor, um por combinação, e aqui só se
 * escolhe qual mostrar.
 *
 * O botão de gerar NÃO é sólido: a cor de ação é exclusiva do CTA de loja.
 */
export function SetupSimulator({
  resultados,
}: {
  resultados: Record<string, ReactNode>;
}) {
  const [perfil, setPerfil] = useState<Perfil | "">("");
  const [chave, setChave] = useState<string | null>(null);
  const tituloResultado = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (chave) tituloResultado.current?.focus();
  }, [chave]);

  const completo = Boolean(perfil);

  if (chave && resultados[chave]) {
    return (
      <div className="surgir">
        <h2 ref={tituloResultado} tabIndex={-1} className="titulo-ui text-2xl outline-none">
          O seu projeto recomendado
        </h2>
        <p className="mt-1 text-[0.9rem] text-tinta-suave">
          {PERFIS.find((p) => p.valor === perfil)?.rotulo}
        </p>
        {resultados[chave]}
        <button
          type="button"
          onClick={() => {
            setPerfil("");
            setChave(null);
          }}
          className="botao botao-secundario mt-8"
        >
          Refazer a simulação
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (completo) setChave(chaveDo("automacao", perfil as Perfil));
      }}
      className="painel surgir space-y-6 p-5 sm:p-7"
    >
      <Opcoes titulo="O que pesa mais" valor={perfil} opcoes={PERFIS} aoMudar={setPerfil} />
      <button
        type="submit"
        disabled={!completo}
        className="botao botao-secundario w-full !py-3.5 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        Ver o projeto recomendado
      </button>
    </form>
  );
}

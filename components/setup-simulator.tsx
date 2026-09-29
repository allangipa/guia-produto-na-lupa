"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  TAMANHOS,
  PERFIS,
  chaveDo,
  type Foco,
  type Tamanho,
  type Perfil,
} from "@/lib/simulador";
import { Opcoes } from "@/components/simulador-campos";

/**
 * O simulador simples, de Wi-Fi e automação: duas perguntas e uma indicação.
 * Câmeras saíram daqui em 29/09/2026 para o questionário completo de
 * `simulador-cameras.tsx`, que monta a lista de compras do projeto; as outras
 * duas frentes seguem este formato até ganharem o delas (docs/simulador.md).
 *
 * Os resultados chegam prontos do servidor, um por combinação, e aqui só se
 * escolhe qual mostrar.
 *
 * O botão de gerar NÃO é sólido: a cor de ação é exclusiva do CTA de loja.
 */
export function SetupSimulator({
  foco,
  resultados,
}: {
  foco: Exclude<Foco, "seguranca">;
  resultados: Record<string, ReactNode>;
}) {
  const [tamanho, setTamanho] = useState<Tamanho | "">("");
  const [perfil, setPerfil] = useState<Perfil | "">("");
  const [chave, setChave] = useState<string | null>(null);
  const tituloResultado = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (chave) tituloResultado.current?.focus();
  }, [chave]);

  const pedeTamanho = foco === "wifi";
  const completo = Boolean(perfil && (!pedeTamanho || tamanho));

  if (chave && resultados[chave]) {
    return (
      <div className="surgir">
        <h2 ref={tituloResultado} tabIndex={-1} className="titulo-ui text-2xl outline-none">
          O seu projeto recomendado
        </h2>
        <p className="mt-1 text-[0.9rem] text-tinta-suave">
          {pedeTamanho && `${TAMANHOS.find((t) => t.valor === tamanho)?.rotulo} · `}
          {PERFIS.find((p) => p.valor === perfil)?.rotulo}
        </p>
        {resultados[chave]}
        <button
          type="button"
          onClick={() => {
            setTamanho("");
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
        if (completo) setChave(chaveDo(foco, perfil as Perfil, (tamanho || "ate50") as Tamanho));
      }}
      className="painel surgir space-y-6 p-5 sm:p-7"
    >
      {pedeTamanho && (
        <Opcoes
          titulo="Tamanho do ambiente"
          valor={tamanho}
          opcoes={TAMANHOS}
          aoMudar={setTamanho}
        />
      )}
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

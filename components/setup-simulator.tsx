"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  FOCOS,
  TAMANHOS,
  PERFIS,
  chaveDo,
  type Foco,
  type Tamanho,
  type Perfil,
} from "@/lib/simulador";

/**
 * As três perguntas e a troca para o resultado.
 *
 * Os resultados chegam prontos do servidor, um por combinação, e aqui só se
 * escolhe qual mostrar: a leitura da base e a montagem dos cards ficam no
 * build, e o navegador não recebe ficha nenhuma além das que aparecem.
 *
 * O botão de gerar NÃO é sólido. A cor de ação é exclusiva do CTA de loja, e
 * o único CTA desta página é o que aparece depois do resultado.
 *
 * A transição é a do leitor: nada anda sozinho, só a troca que ele pediu. O
 * foco vai para o título do resultado ao gerar e volta para a primeira
 * pergunta ao refazer, para quem navega por teclado não ficar perdido.
 */
export function SetupSimulator({
  resultados,
}: {
  resultados: Record<string, ReactNode>;
}) {
  const [foco, setFoco] = useState<Foco | "">("");
  const [tamanho, setTamanho] = useState<Tamanho | "">("");
  const [perfil, setPerfil] = useState<Perfil | "">("");
  const [chave, setChave] = useState<string | null>(null);

  const tituloResultado = useRef<HTMLHeadingElement>(null);
  const primeiraPergunta = useRef<HTMLSelectElement>(null);
  const jaInteragiu = useRef(false);

  useEffect(() => {
    if (!jaInteragiu.current) return;
    if (chave) tituloResultado.current?.focus();
    else primeiraPergunta.current?.focus();
  }, [chave]);

  const pedeTamanho = foco === "wifi";
  const completo = Boolean(foco && perfil && (!pedeTamanho || tamanho));

  function gerar(e: React.FormEvent) {
    e.preventDefault();
    if (!foco || !perfil || (pedeTamanho && !tamanho)) return;
    jaInteragiu.current = true;
    setChave(chaveDo(foco, perfil, (tamanho || "ate50") as Tamanho));
  }

  function refazer() {
    jaInteragiu.current = true;
    setFoco("");
    setTamanho("");
    setPerfil("");
    setChave(null);
  }

  const campo =
    "mt-1.5 w-full rounded-lg border border-linha bg-papel px-3 py-2.5 text-tinta focus:border-acao focus:outline-none";

  if (chave && resultados[chave]) {
    return (
      <div key="resultado" className="surgir">
        <h2
          ref={tituloResultado}
          tabIndex={-1}
          className="titulo-ui text-2xl outline-none"
        >
          O seu projeto recomendado
        </h2>
        <p className="mt-1 text-[0.9rem] text-tinta-suave">
          {FOCOS.find((f) => f.valor === foco)?.rotulo}
          {pedeTamanho &&
            ` · ${TAMANHOS.find((t) => t.valor === tamanho)?.rotulo}`}
          {` · ${PERFIS.find((p) => p.valor === perfil)?.rotulo}`}
        </p>
        {resultados[chave]}
        <button
          type="button"
          onClick={refazer}
          className="botao botao-secundario mt-8"
        >
          Refazer a simulação
        </button>
      </div>
    );
  }

  return (
    <form key="formulario" onSubmit={gerar} className="painel surgir p-5 sm:p-7">
      <div className="grid gap-5 sm:grid-cols-3">
        <label className="block text-[0.9rem] font-medium">
          Foco do projeto
          <select
            ref={primeiraPergunta}
            value={foco}
            onChange={(e) => setFoco(e.target.value as Foco)}
            className={campo}
            required
          >
            <option value="" disabled>
              Escolha
            </option>
            {FOCOS.map((f) => (
              <option key={f.valor} value={f.valor}>
                {f.rotulo}
              </option>
            ))}
          </select>
        </label>

        <label
          className={`block text-[0.9rem] font-medium ${pedeTamanho ? "" : "text-ausente"}`}
        >
          Tamanho do ambiente
          <select
            value={pedeTamanho ? tamanho : ""}
            onChange={(e) => setTamanho(e.target.value as Tamanho)}
            className={`${campo} disabled:cursor-not-allowed disabled:opacity-60`}
            disabled={!pedeTamanho}
            required={pedeTamanho}
            aria-describedby="nota-tamanho"
          >
            <option value="" disabled>
              {foco && !pedeTamanho ? "Não muda o resultado" : "Escolha"}
            </option>
            {TAMANHOS.map((t) => (
              <option key={t.valor} value={t.valor}>
                {t.rotulo}
              </option>
            ))}
          </select>
          <span
            id="nota-tamanho"
            className="mt-1 block text-[0.75rem] font-normal text-tinta-suave"
          >
            Só para Wi-Fi: é o único caso em que o fabricante declara área.
          </span>
        </label>

        <label className="block text-[0.9rem] font-medium">
          O que pesa mais
          <select
            value={perfil}
            onChange={(e) => setPerfil(e.target.value as Perfil)}
            className={campo}
            required
          >
            <option value="" disabled>
              Escolha
            </option>
            {PERFIS.map((p) => (
              <option key={p.valor} value={p.valor}>
                {p.rotulo}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="submit"
        disabled={!completo}
        className="botao botao-secundario mt-6 w-full !py-3.5 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        Ver o projeto recomendado
      </button>
    </form>
  );
}

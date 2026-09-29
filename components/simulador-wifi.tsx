"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Produto } from "@/lib/specs";
import {
  FATOR_PLANO,
  GRUPOS_WIFI,
  RESPOSTAS_WIFI,
  montarProjetoWifi,
  type Objetivo,
  type RespostasWifi,
} from "@/lib/simulador-wifi";
import { Numero, Opcoes } from "@/components/simulador-campos";
import { ListaDeCompras } from "@/components/simulador-lista";

/**
 * O questionário de Wi-Fi do /simulador. A lógica mora em
 * lib/simulador-wifi.ts; aqui só há pergunta e tela.
 *
 * Os passos dependem da primeira resposta: quem quer resolver um cômodo não
 * responde área nem andar da casa, porque nenhum repetidor da base declara
 * cobertura e a resposta não mudaria a lista.
 */

type Passo = "objetivo" | "casa" | "internet" | "cabos";
const TITULOS: Record<Passo, string> = {
  objetivo: "O que você quer resolver",
  casa: "Como é a casa",
  internet: "A internet e os aparelhos",
  cabos: "Cabos e computadores",
};

export function SimuladorWifi({ base }: { base: Record<string, Produto> }) {
  const [r, setR] = useState<RespostasWifi>(RESPOSTAS_WIFI);
  const [i, setI] = useState(0);
  const [pronto, setPronto] = useState(false);
  const titulo = useRef<HTMLHeadingElement>(null);
  const interagiu = useRef(false);

  const passos: Passo[] =
    r.objetivo === "comodo"
      ? ["objetivo", "internet"]
      : ["objetivo", "casa", "internet", "cabos"];
  const passo = passos[Math.min(i, passos.length - 1)];
  const ultimo = i >= passos.length - 1;

  const muda = <K extends keyof RespostasWifi>(k: K) => (v: RespostasWifi[K]) =>
    setR((a) => ({ ...a, [k]: v }));
  const projeto = useMemo(() => (pronto ? montarProjetoWifi(r, base) : null), [pronto, r, base]);

  useEffect(() => {
    if (interagiu.current) titulo.current?.focus();
  }, [i, pronto]);

  const ir = (n: number) => {
    interagiu.current = true;
    setI(n);
  };

  if (projeto) {
    return (
      <ListaDeCompras
        titulo={projeto.titulo}
        motivos={projeto.motivos}
        avisos={projeto.avisos}
        itens={projeto.itens}
        grupos={GRUPOS_WIFI}
        nota={`A velocidade de 5 GHz exigida é ${FATOR_PLANO} vezes o plano, e as portas livres descontam a que vai para o modem.`}
        base={base}
        tituloRef={titulo}
        aoAjustar={() => {
          interagiu.current = true;
          setPronto(false);
        }}
        aoRefazer={() => {
          interagiu.current = true;
          setR(RESPOSTAS_WIFI);
          setI(0);
          setPronto(false);
        }}
      />
    );
  }

  return (
    <div className="painel surgir p-5 sm:p-7" key={passo}>
      <ol className="flex flex-wrap gap-x-4 gap-y-1 text-[0.8rem]" aria-label="Passos">
        {passos.map((p, n) => (
          <li
            key={p}
            aria-current={p === passo ? "step" : undefined}
            className={p === passo ? "font-semibold text-tinta" : "text-tinta-suave"}
          >
            <span className="dados">{n + 1}</span>. {TITULOS[p]}
          </li>
        ))}
      </ol>
      <h2 ref={titulo} tabIndex={-1} className="titulo-ui mt-4 text-xl outline-none">
        {TITULOS[passo]}
      </h2>

      <div className="mt-5 space-y-6">
        {passo === "objetivo" && (
          <Opcoes<Objetivo>
            titulo="Qual é o problema hoje?"
            valor={r.objetivo}
            opcoes={[
              { valor: "casa", rotulo: "O Wi-Fi não chega bem em vários lugares", detalhe: "Leva a sistema mesh, com unidades pela casa" },
              { valor: "comodo", rotulo: "Falta sinal num cômodo só", detalhe: "O resto funciona: leva a repetidor" },
              { valor: "roteador", rotulo: "Quero trocar o roteador da operadora", detalhe: "Casa pequena, um aparelho só" },
            ]}
            aoMudar={muda("objetivo")}
          />
        )}

        {passo === "casa" && (
          <>
            <div className="grid gap-6 sm:grid-cols-2">
              <Numero
                titulo="Área da casa"
                ajuda="Só a parte coberta, somando os andares."
                valor={r.areaM2}
                min={20}
                max={2000}
                passo={10}
                unidade="m²"
                aoMudar={muda("areaM2")}
              />
              <Numero titulo="Andares" valor={r.andares} min={1} max={4} aoMudar={muda("andares")} />
            </div>
            <Opcoes
              titulo="As paredes são de quê?"
              ajuda="Nenhum fabricante diz em que condição mediu a cobertura; a lista avisa quando isso pesa."
              valor={r.paredes}
              opcoes={[
                { valor: "alvenaria", rotulo: "Tijolo e reboco" },
                { valor: "concreto", rotulo: "Concreto ou laje" },
                { valor: "drywall", rotulo: "Drywall" },
              ]}
              aoMudar={muda("paredes")}
            />
            <Opcoes
              titulo="Precisa de sinal fora de casa?"
              ajuda="Quintal, piscina, garagem."
              valor={r.externa}
              opcoes={[
                { valor: true, rotulo: "Sim" },
                { valor: false, rotulo: "Não" },
              ]}
              aoMudar={muda("externa")}
            />
            {r.externa && (
              <Numero
                titulo="Área de fora que precisa de sinal"
                valor={r.areaExternaM2}
                min={5}
                max={1000}
                passo={10}
                unidade="m²"
                aoMudar={muda("areaExternaM2")}
              />
            )}
          </>
        )}

        {passo === "internet" && (
          <>
            <Opcoes
              titulo="Velocidade do plano de internet"
              valor={r.planoMbps}
              opcoes={[
                { valor: 300, rotulo: "Até 300 Mega" },
                { valor: 500, rotulo: "500 Mega" },
                { valor: 1000, rotulo: "1 Giga ou mais" },
              ]}
              aoMudar={muda("planoMbps")}
            />
            <Numero
              titulo="Aparelhos conectados ao mesmo tempo"
              ajuda="Celulares, TVs, câmeras, lâmpadas, assistentes. Conte tudo que fica no Wi-Fi."
              valor={r.aparelhos}
              min={1}
              max={300}
              passo={5}
              aoMudar={muda("aparelhos")}
            />
          </>
        )}

        {passo === "cabos" && (
          <div className="grid gap-6 sm:grid-cols-2">
            <Numero
              titulo="Aparelhos por cabo, perto do roteador"
              ajuda="TV, videogame, computador de mesa."
              valor={r.cabeados}
              min={0}
              max={24}
              aoMudar={muda("cabeados")}
            />
            <Numero
              titulo="Computadores sem Wi-Fi, ou com Wi-Fi antigo"
              ajuda="Cada um leva um adaptador USB."
              valor={r.computadores}
              min={0}
              max={10}
              aoMudar={muda("computadores")}
            />
          </div>
        )}
      </div>

      <div className="mt-7 flex flex-wrap gap-3">
        {i > 0 && (
          <button type="button" onClick={() => ir(i - 1)} className="botao botao-secundario">
            Voltar
          </button>
        )}
        {!ultimo ? (
          <button type="button" onClick={() => ir(i + 1)} className="botao botao-secundario border-tinta">
            Continuar
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              interagiu.current = true;
              setPronto(true);
            }}
            className="botao botao-secundario border-tinta"
          >
            Montar a lista de compras
          </button>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Produto } from "@/lib/specs";
import {
  AREA_MAXIMA_M2,
  GRUPOS_AR,
  RESPOSTAS_AR,
  calcularBtu,
  montarProjetoAr,
  type Ciclo,
  type Regiao,
  type RespostasAr,
} from "@/lib/simulador-ar";
import { Numero, Opcoes } from "@/components/simulador-campos";
import { ListaDeCompras } from "@/components/simulador-lista";

/**
 * A calculadora de ar-condicionado do /simulador. A conta mora em
 * lib/simulador-ar.ts e é a do simulador da LG; aqui só há pergunta e tela.
 * O BTU aparece enquanto a pessoa responde, com cada parcela à vista.
 */

type Passo = "comodo" | "uso";
const TITULOS: Record<Passo, string> = {
  comodo: "O cômodo",
  uso: "Quem e o que fica lá",
};
const PASSOS: Passo[] = ["comodo", "uso"];

export function SimuladorAr({ base }: { base: Record<string, Produto> }) {
  const [r, setR] = useState<RespostasAr>(RESPOSTAS_AR);
  const [i, setI] = useState(0);
  const [pronto, setPronto] = useState(false);
  const titulo = useRef<HTMLHeadingElement>(null);
  const interagiu = useRef(false);
  const passo = PASSOS[i];
  const ultimo = i === PASSOS.length - 1;

  const muda = <K extends keyof RespostasAr>(k: K) => (v: RespostasAr[K]) =>
    setR((a) => ({ ...a, [k]: v }));
  const conta = calcularBtu(r);
  const projeto = useMemo(() => (pronto ? montarProjetoAr(r, base) : null), [pronto, r, base]);

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
        grupos={GRUPOS_AR}
        nota="A conta é a do simulador de capacidade da LG Brasil, e não uma regra nossa. A área que o fabricante do split declara aparece ao lado, quando ele declara."
        base={base}
        tituloRef={titulo}
        aoAjustar={() => {
          interagiu.current = true;
          setPronto(false);
        }}
        aoRefazer={() => {
          interagiu.current = true;
          setR(RESPOSTAS_AR);
          setI(0);
          setPronto(false);
        }}
      />
    );
  }

  return (
    <div className="painel surgir p-5 sm:p-7" key={passo}>
      <ol className="flex flex-wrap gap-x-4 gap-y-1 text-[0.8rem]" aria-label="Passos">
        {PASSOS.map((p, n) => (
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
        {passo === "comodo" && (
          <>
            <Numero
              titulo="Área do cômodo"
              ajuda="Largura vezes comprimento. Um quarto de 3 × 4 m tem 12 m²."
              valor={r.areaM2}
              min={1}
              max={AREA_MAXIMA_M2}
              unidade="m²"
              aoMudar={muda("areaM2")}
            />
            <Opcoes
              titulo="O cômodo pega muito sol?"
              ajuda="Sol da tarde na parede ou na janela, ou cômodo no último andar."
              valor={r.muitoSol}
              opcoes={[
                { valor: true, rotulo: "Muito sol" },
                { valor: false, rotulo: "Pouco sol" },
              ]}
              aoMudar={muda("muitoSol")}
            />
            <Opcoes<Regiao>
              titulo="Em que região do país?"
              valor={r.regiao}
              opcoes={[
                { valor: "quente", rotulo: "Norte, Nordeste ou Centro-Oeste" },
                { valor: "outra", rotulo: "Sul ou Sudeste" },
              ]}
              aoMudar={muda("regiao")}
            />
            <Opcoes<Ciclo>
              titulo="Só esfriar, ou também esquentar no inverno?"
              valor={r.ciclo}
              opcoes={[
                { valor: "frio", rotulo: "Só frio" },
                { valor: "quenteFrio", rotulo: "Quente e frio" },
              ]}
              aoMudar={muda("ciclo")}
            />
          </>
        )}

        {passo === "uso" && (
          <div className="grid gap-6 sm:grid-cols-2">
            <Numero titulo="Pessoas no cômodo" valor={r.pessoas} max={20} aoMudar={muda("pessoas")} />
            <Numero titulo="TVs" valor={r.tvs} max={5} aoMudar={muda("tvs")} />
            <Numero titulo="Computadores" valor={r.computadores} max={10} aoMudar={muda("computadores")} />
            <Numero titulo="Geladeiras ou frigobares" valor={r.geladeiras} max={3} aoMudar={muda("geladeiras")} />
          </div>
        )}
      </div>

      <div className="mt-6 rounded-lg bg-superficie px-4 py-3 text-[0.9rem]">
        <p>
          Pela conta do simulador da LG: <span className="dados font-semibold">{conta.total.toLocaleString("pt-BR")} BTU/h</span>
        </p>
        <p className="mt-1 text-[0.8rem] text-tinta-suave">{conta.passos.join(" → ")}</p>
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
            Ver os aparelhos que atendem
          </button>
        )}
      </div>
    </div>
  );
}

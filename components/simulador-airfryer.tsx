"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Produto } from "@/lib/specs";
import {
  GRUPOS_AIRFRYER,
  RESPOSTAS_AIRFRYER,
  montarProjetoAirfryer,
  type Batata,
  type Pessoas,
  type RespostasAirfryer,
} from "@/lib/simulador-airfryer";
import { Opcoes } from "@/components/simulador-campos";
import { ListaDeCompras } from "@/components/simulador-lista";

/**
 * A air fryer pelo tamanho da família, no /simulador. A lógica mora em
 * lib/simulador-airfryer.ts: a escolha é pela batata que o manual declara, e
 * as pessoas só pesam onde o fabricante as declara.
 */
export function SimuladorAirfryer({ base }: { base: Record<string, Produto> }) {
  const [r, setR] = useState<RespostasAirfryer>(RESPOSTAS_AIRFRYER);
  const [pronto, setPronto] = useState(false);
  const titulo = useRef<HTMLHeadingElement>(null);
  const interagiu = useRef(false);
  const projeto = useMemo(() => (pronto ? montarProjetoAirfryer(r, base) : null), [pronto, r, base]);
  const muda = <K extends keyof RespostasAirfryer>(k: K) => (v: RespostasAirfryer[K]) =>
    setR((a) => ({ ...a, [k]: v }));

  useEffect(() => {
    if (interagiu.current) titulo.current?.focus();
  }, [pronto]);

  if (projeto) {
    return (
      <ListaDeCompras
        titulo={projeto.titulo}
        motivos={projeto.motivos}
        avisos={projeto.avisos}
        itens={projeto.itens}
        grupos={GRUPOS_AIRFRYER}
        nota="A batata por vez é a do manual de cada fabricante. O litro do nome não diz quanto cabe."
        base={base}
        tituloRef={titulo}
        aoAjustar={() => {
          interagiu.current = true;
          setPronto(false);
        }}
        aoRefazer={() => {
          interagiu.current = true;
          setR(RESPOSTAS_AIRFRYER);
          setPronto(false);
        }}
      />
    );
  }

  return (
    <div className="painel surgir p-5 sm:p-7">
      <h2 ref={titulo} tabIndex={-1} className="titulo-ui text-xl outline-none">
        A air fryer para a sua casa
      </h2>
      <p className="mt-1 text-[0.88rem] text-tinta-suave">
        O litro do nome não diz quanto cabe: há air fryer de 12 litros cujo manual
        aceita menos batata que uma de 4. Por isso a pergunta é pela comida.
      </p>
      <div className="mt-5 space-y-6">
        <Opcoes<Pessoas>
          titulo="Quantas pessoas comem em casa?"
          ajuda="Poucos fabricantes dizem para quantas pessoas a air fryer serve; onde dizem, conta."
          valor={r.pessoas}
          opcoes={[
            { valor: "1-2", rotulo: "1 ou 2" },
            { valor: "3-4", rotulo: "3 ou 4" },
            { valor: "5-6", rotulo: "5 ou 6" },
            { valor: "7+", rotulo: "7 ou mais" },
          ]}
          aoMudar={muda("pessoas")}
        />
        <Opcoes<Batata>
          titulo="Quanta batata frita você quer fazer de uma vez?"
          ajuda="É a medida que os manuais usam para dizer quanto cabe."
          valor={r.batataKg}
          opcoes={[
            { valor: 0.5, rotulo: "Até 500 g" },
            { valor: 0.8, rotulo: "Até 800 g" },
            { valor: 1, rotulo: "1 kg ou mais" },
          ]}
          aoMudar={muda("batataKg")}
        />
        <Opcoes
          titulo="As peças precisam ir na lava-louças?"
          valor={r.lavaLoucas}
          opcoes={[
            { valor: true, rotulo: "Sim" },
            { valor: false, rotulo: "Tanto faz" },
          ]}
          aoMudar={muda("lavaLoucas")}
        />
      </div>
      <div className="mt-7">
        <button
          type="button"
          onClick={() => {
            interagiu.current = true;
            setPronto(true);
          }}
          className="botao botao-secundario border-tinta"
        >
          Ver as air fryers que atendem
        </button>
      </div>
    </div>
  );
}

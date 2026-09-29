"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Produto } from "@/lib/specs";
import {
  GRUPOS_COOKTOP,
  RESPOSTAS_COOKTOP,
  montarProjetoCooktop,
  type RespostasCooktop,
  type Tensao,
} from "@/lib/simulador-cooktop";
import { Opcoes } from "@/components/simulador-campos";
import { ListaDeCompras } from "@/components/simulador-lista";

/**
 * O cooktop de indução e a instalação, no /simulador. A lógica mora em
 * lib/simulador-cooktop.ts: a lista dá a corrente e o disjuntor declarado, e
 * deixa o dimensionamento do circuito com o eletricista.
 */
export function SimuladorCooktop({ base }: { base: Record<string, Produto> }) {
  const [r, setR] = useState<RespostasCooktop>(RESPOSTAS_COOKTOP);
  const [pronto, setPronto] = useState(false);
  const titulo = useRef<HTMLHeadingElement>(null);
  const interagiu = useRef(false);
  const projeto = useMemo(() => (pronto ? montarProjetoCooktop(r, base) : null), [pronto, r, base]);

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
        grupos={GRUPOS_COOKTOP}
        nota="A corrente é a potência declarada dividida pela tensão da casa. O disjuntor e o fio quem dimensiona é o eletricista."
        base={base}
        tituloRef={titulo}
        aoAjustar={() => {
          interagiu.current = true;
          setPronto(false);
        }}
        aoRefazer={() => {
          interagiu.current = true;
          setR(RESPOSTAS_COOKTOP);
          setPronto(false);
        }}
      />
    );
  }

  return (
    <div className="painel surgir p-5 sm:p-7">
      <h2 ref={titulo} tabIndex={-1} className="titulo-ui text-xl outline-none">
        O cooktop e a instalação que ele pede
      </h2>
      <p className="mt-1 text-[0.88rem] text-tinta-suave">
        Só 3 dos 16 cooktops da base dizem qual disjuntor precisam. O simulador faz
        a conta da corrente com a potência que o fabricante declara.
      </p>
      <div className="mt-5 space-y-6">
        <Opcoes<Tensao>
          titulo="Qual é a tensão na cozinha?"
          ajuda="Está no quadro de luz ou na conta de energia. Na dúvida, um eletricista confirma."
          valor={r.tensao}
          opcoes={[
            { valor: 127, rotulo: "127 V" },
            { valor: 220, rotulo: "220 V" },
          ]}
          aoMudar={(v) => setR((a) => ({ ...a, tensao: v }))}
        />
        <Opcoes<RespostasCooktop["bocas"]>
          titulo="Quantas bocas?"
          valor={r.bocas}
          opcoes={[
            { valor: 1, rotulo: "1, portátil" },
            { valor: 2, rotulo: "2" },
            { valor: 4, rotulo: "4" },
            { valor: 5, rotulo: "5 ou mais" },
          ]}
          aoMudar={(v) => setR((a) => ({ ...a, bocas: v }))}
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
          Ver os cooktops e a instalação
        </button>
      </div>
    </div>
  );
}

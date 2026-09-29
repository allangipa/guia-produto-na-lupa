"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Produto } from "@/lib/specs";
import { GRUPOS_REFIL, RESPOSTAS_REFIL, montarProjetoRefil, type RespostasRefil } from "@/lib/simulador-refil";
import { Numero, Opcoes } from "@/components/simulador-campos";
import { ListaDeCompras } from "@/components/simulador-lista";

/**
 * O refil do purificador no /simulador. A lógica mora em
 * lib/simulador-refil.ts: a duração sai dos litros declarados e do consumo
 * que a pessoa informa, não do prazo em meses da ficha.
 */
export function SimuladorRefil({ base }: { base: Record<string, Produto> }) {
  const [r, setR] = useState<RespostasRefil>(RESPOSTAS_REFIL);
  const [pronto, setPronto] = useState(false);
  const titulo = useRef<HTMLHeadingElement>(null);
  const interagiu = useRef(false);
  const projeto = useMemo(() => (pronto ? montarProjetoRefil(r, base) : null), [pronto, r, base]);

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
        grupos={GRUPOS_REFIL}
        nota="A duração do refil sai dos litros que o fabricante declara e do consumo que você informou. O prazo em meses da ficha supõe um consumo que nenhuma ficha escreve."
        base={base}
        tituloRef={titulo}
        aoAjustar={() => {
          interagiu.current = true;
          setPronto(false);
        }}
        aoRefazer={() => {
          interagiu.current = true;
          setR(RESPOSTAS_REFIL);
          setPronto(false);
        }}
      />
    );
  }

  return (
    <div className="painel surgir p-5 sm:p-7">
      <h2 ref={titulo} tabIndex={-1} className="titulo-ui text-xl outline-none">
        Quanto dura o refil na sua casa
      </h2>
      <p className="mt-1 text-[0.88rem] text-tinta-suave">
        As fichas prometem “6 meses”, mas o refil é medido em litros. Informe
        quanta água a casa usa, e o simulador faz a conta.
      </p>
      <div className="mt-5 space-y-6">
        <Numero
          titulo="Litros de água filtrada por dia"
          ajuda="Beber, café, cozinhar. Se a casa usa galão, um de 20 L por semana dá cerca de 3 L por dia."
          valor={r.litrosDia}
          min={1}
          max={60}
          unidade="litros"
          aoMudar={(v) => setR((a) => ({ ...a, litrosDia: v }))}
        />
        <Opcoes
          titulo="Precisa de água gelada?"
          valor={r.gelada}
          opcoes={[
            { valor: true, rotulo: "Sim" },
            { valor: false, rotulo: "Natural serve" },
          ]}
          aoMudar={(v) => setR((a) => ({ ...a, gelada: v }))}
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
          Ver quanto dura cada refil
        </button>
      </div>
    </div>
  );
}

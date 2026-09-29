"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Produto } from "@/lib/specs";
import {
  GRUPOS_NOBREAK,
  RESPOSTAS_NOBREAK,
  cargaTotal,
  montarProjetoNobreak,
  type Pfc,
  type RespostasNobreak,
} from "@/lib/simulador-nobreak";
import { Numero, Opcoes } from "@/components/simulador-campos";
import { ListaDeCompras } from "@/components/simulador-lista";

/**
 * O nobreak para qualquer carga do /simulador. A lógica mora em
 * lib/simulador-nobreak.ts; aqui só há pergunta e tela. Os watts são os da
 * etiqueta, digitados pela pessoa: o site não tem fonte para um valor típico.
 */
export function SimuladorNobreak({ base }: { base: Record<string, Produto> }) {
  const [r, setR] = useState<RespostasNobreak>(RESPOSTAS_NOBREAK);
  const [pronto, setPronto] = useState(false);
  const titulo = useRef<HTMLHeadingElement>(null);
  const interagiu = useRef(false);
  const projeto = useMemo(() => (pronto ? montarProjetoNobreak(r, base) : null), [pronto, r, base]);
  const carga = cargaTotal(r);

  useEffect(() => {
    if (interagiu.current) titulo.current?.focus();
  }, [pronto]);

  const mudaAparelho = (i: number, campo: "watts" | "qtd") => (v: number) =>
    setR((a) => ({ ...a, aparelhos: a.aparelhos.map((x, j) => (j === i ? { ...x, [campo]: v } : x)) }));

  if (projeto) {
    return (
      <ListaDeCompras
        titulo={projeto.titulo}
        motivos={projeto.motivos}
        avisos={projeto.avisos}
        itens={projeto.itens}
        grupos={GRUPOS_NOBREAK}
        nota="Os watts são os que você informou, da etiqueta de cada aparelho. Só entram nobreaks que declaram watts."
        base={base}
        tituloRef={titulo}
        aoAjustar={() => {
          interagiu.current = true;
          setPronto(false);
        }}
        aoRefazer={() => {
          interagiu.current = true;
          setR(RESPOSTAS_NOBREAK);
          setPronto(false);
        }}
      />
    );
  }

  return (
    <div className="painel surgir p-5 sm:p-7">
      <h2 ref={titulo} tabIndex={-1} className="titulo-ui text-xl outline-none">
        O que vai ficar ligado no nobreak
      </h2>
      <p className="mt-1 text-[0.88rem] text-tinta-suave">
        Os watts estão na etiqueta do aparelho ou da fonte dele — às vezes como
        “Potência” ou “Consumo”. Se a etiqueta só trouxer volts e ampères,
        multiplique os dois.
      </p>

      <div className="mt-5 space-y-6">
        {r.aparelhos.map((a, i) => (
          <fieldset key={a.nome} className="grid gap-4 sm:grid-cols-2">
            <legend className="mb-2 text-[0.95rem] font-medium">{a.nome}</legend>
            <Numero titulo="Quantos" valor={a.qtd} max={10} aoMudar={mudaAparelho(i, "qtd")} />
            <Numero
              titulo="Watts de cada um"
              valor={a.watts}
              max={2000}
              passo={10}
              unidade="W"
              aoMudar={mudaAparelho(i, "watts")}
            />
          </fieldset>
        ))}
        <Opcoes
          titulo="Tem computador de mesa na lista?"
          valor={r.temComputador}
          opcoes={[
            { valor: true, rotulo: "Tem" },
            { valor: false, rotulo: "Não tem" },
          ]}
          aoMudar={(v) => setR((x) => ({ ...x, temComputador: v }))}
        />
        {r.temComputador && (
          <Opcoes<Pfc>
            titulo="A fonte do computador tem PFC ativo?"
            ajuda="Está escrito na etiqueta da fonte: “Active PFC”. Nobreak de onda não senoidal pode não servir para ela."
            valor={r.pfc}
            opcoes={[
              { valor: "sim", rotulo: "Tem" },
              { valor: "nao", rotulo: "Não tem" },
              { valor: "naoSei", rotulo: "Não sei" },
            ]}
            aoMudar={(v) => setR((x) => ({ ...x, pfc: v }))}
          />
        )}
      </div>

      <div className="mt-6 rounded-lg bg-superficie px-4 py-3 text-[0.9rem]">
        Soma dos aparelhos: <span className="dados font-semibold">{carga.toLocaleString("pt-BR")} W</span>
      </div>

      <div className="mt-7">
        <button
          type="button"
          disabled={carga <= 0}
          onClick={() => {
            interagiu.current = true;
            setPronto(true);
          }}
          className="botao botao-secundario border-tinta disabled:opacity-40"
        >
          Ver os nobreaks que aguentam
        </button>
      </div>
    </div>
  );
}

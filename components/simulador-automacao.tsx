"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Produto } from "@/lib/specs";
import {
  GRUPOS_AUTOMACAO,
  PARTIDA,
  RESPOSTAS_AUTOMACAO,
  montarProjetoAutomacao,
  type Ambiente,
  type Assistente,
  type ComoLuz,
  type RespostasAutomacao,
} from "@/lib/simulador-automacao";
import { Numero, Opcoes } from "@/components/simulador-campos";
import { ListaDeCompras } from "@/components/simulador-lista";

/**
 * O questionário de automação do /simulador. A lógica mora em
 * lib/simulador-automacao.ts; aqui só há pergunta e tela.
 *
 * Os passos dependem do primeiro: quem não marca luz não responde sobre
 * interruptor e neutro, e quem não marca tomada não responde sobre carga.
 */

type Passo = "oque" | "sensores" | "luzes" | "tomadas" | "controle";
const TITULOS: Record<Passo, string> = {
  oque: "O que você quer comandar",
  sensores: "O que você quer vigiar",
  luzes: "As luzes",
  tomadas: "As tomadas",
  controle: "Voz e internet",
};

export function SimuladorAutomacao({ base }: { base: Record<string, Produto> }) {
  const [r, setR] = useState<RespostasAutomacao>(RESPOSTAS_AUTOMACAO);
  const [i, setI] = useState(0);
  const [pronto, setPronto] = useState(false);
  const titulo = useRef<HTMLHeadingElement>(null);
  const interagiu = useRef(false);

  const passos: Passo[] = [
    "oque",
    "sensores",
    ...(r.luzes > 0 ? (["luzes"] as Passo[]) : []),
    ...(r.tomadas > 0 ? (["tomadas"] as Passo[]) : []),
    "controle",
  ];
  const passo = passos[Math.min(i, passos.length - 1)];
  const ultimo = i >= passos.length - 1;

  const muda = <K extends keyof RespostasAutomacao>(k: K) => (v: RespostasAutomacao[K]) =>
    setR((a) => ({ ...a, [k]: v }));
  const projeto = useMemo(() => (pronto ? montarProjetoAutomacao(r, base) : null), [pronto, r, base]);

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
        grupos={GRUPOS_AUTOMACAO}
        nota="As peças saem do aplicativo que cobre mais itens do projeto, para a casa ficar num app só. Central só entra quando a ficha de uma peça a exige."
        base={base}
        tituloRef={titulo}
        aoAjustar={() => {
          interagiu.current = true;
          setPronto(false);
        }}
        aoRefazer={() => {
          interagiu.current = true;
          setR(RESPOSTAS_AUTOMACAO);
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
        {passo === "oque" && (
          <>
            <Opcoes<Ambiente>
              titulo="Qual ambiente você quer automatizar?"
              ajuda="Preenche as quantidades abaixo com um ponto de partida. Mude o que quiser."
              valor={r.ambiente}
              opcoes={[
                { valor: "sala", rotulo: "Sala" },
                { valor: "quarto", rotulo: "Quarto" },
                { valor: "casa", rotulo: "A casa toda" },
              ]}
              aoMudar={(v) => setR((a) => ({ ...a, ...PARTIDA[v], ambiente: v }))}
            />
            <div className="grid gap-6 sm:grid-cols-2">
              <Numero
                titulo="Luzes"
                ajuda="Cada ponto de luz que você quer acender pelo celular ou pela voz."
                valor={r.luzes}
                max={40}
                aoMudar={muda("luzes")}
              />
              <Numero
                titulo="Aparelhos na tomada"
                ajuda="Abajur, ventilador, cafeteira: o que liga e desliga na tomada."
                valor={r.tomadas}
                max={20}
                aoMudar={muda("tomadas")}
              />
              <Numero
                titulo="Cômodos com ar ou TV"
                ajuda="Para comandar pelo celular o que hoje usa controle remoto."
                valor={r.controleRemoto}
                max={10}
                aoMudar={muda("controleRemoto")}
              />
              <Numero
                titulo="Cortinas"
                valor={r.cortinas}
                max={10}
                aoMudar={muda("cortinas")}
              />
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <Opcoes
                titulo="Abrir o portão pelo celular?"
                ajuda="Portão que já tem motor."
                valor={r.portao}
                opcoes={[
                  { valor: true, rotulo: "Sim" },
                  { valor: false, rotulo: "Não" },
                ]}
                aoMudar={muda("portao")}
              />
              <Opcoes
                titulo="Fechadura digital na porta?"
                valor={r.fechadura}
                opcoes={[
                  { valor: true, rotulo: "Sim" },
                  { valor: false, rotulo: "Não" },
                ]}
                aoMudar={muda("fechadura")}
              />
            </div>
          </>
        )}

        {passo === "sensores" && (
          <div className="grid gap-6 sm:grid-cols-2">
            <Numero
              titulo="Câmeras dentro de casa"
              ajuda="Câmera Wi-Fi, que grava sem gravador."
              valor={r.camerasInternas}
              max={10}
              aoMudar={muda("camerasInternas")}
            />
            <Numero
              titulo="Câmeras fora de casa"
              valor={r.camerasExternas}
              max={10}
              aoMudar={muda("camerasExternas")}
            />
            <Numero
              titulo="Portas e janelas"
              ajuda="Avisa no celular quando abre."
              valor={r.portas}
              max={30}
              aoMudar={muda("portas")}
            />
            <Numero
              titulo="Ambientes com sensor de movimento"
              ajuda="Avisa, ou acende a luz, quando alguém passa."
              valor={r.movimento}
              max={20}
              aoMudar={muda("movimento")}
            />
            <Numero
              titulo="Pontos com risco de vazamento"
              ajuda="Atrás da máquina de lavar, embaixo da pia."
              valor={r.vazamento}
              max={10}
              aoMudar={muda("vazamento")}
            />
            <Numero
              titulo="Ambientes com sensor de fumaça"
              valor={r.fumaca}
              max={10}
              aoMudar={muda("fumaca")}
            />
          </div>
        )}

        {passo === "luzes" && (
          <>
            <Opcoes<ComoLuz>
              titulo="Trocar a lâmpada ou o interruptor?"
              valor={r.comoLuz}
              opcoes={[
                {
                  valor: "lampada",
                  rotulo: "A lâmpada",
                  detalhe: "Sem obra. O interruptor da parede precisa ficar ligado.",
                },
                {
                  valor: "interruptor",
                  rotulo: "O interruptor",
                  detalhe: "Mexe na fiação, e serve para qualquer lâmpada.",
                },
              ]}
              aoMudar={muda("comoLuz")}
            />
            {r.comoLuz === "lampada" && (
              <Opcoes
                titulo="A luz precisa mudar de cor?"
                valor={r.corNaLuz}
                opcoes={[
                  { valor: true, rotulo: "Sim, colorida" },
                  { valor: false, rotulo: "Só branca" },
                ]}
                aoMudar={muda("corNaLuz")}
              />
            )}
            {r.comoLuz === "interruptor" && (
              <>
                <Opcoes<1 | 2 | 3>
                  titulo="Quantas teclas em cada caixa de interruptor?"
                  ajuda="Cada tecla comanda uma luz."
                  valor={r.teclas}
                  opcoes={[
                    { valor: 1, rotulo: "Uma" },
                    { valor: 2, rotulo: "Duas" },
                    { valor: 3, rotulo: "Três" },
                  ]}
                  aoMudar={muda("teclas")}
                />
                <Opcoes<RespostasAutomacao["neutro"]>
                  titulo="Tem fio neutro na caixa do interruptor?"
                  ajuda="Muitos interruptores inteligentes precisam dele, e nem toda caixa tem. Um eletricista confirma em minutos."
                  valor={r.neutro}
                  opcoes={[
                    { valor: "sim", rotulo: "Tem" },
                    { valor: "nao", rotulo: "Não tem" },
                    { valor: "naoSei", rotulo: "Não sei" },
                  ]}
                  aoMudar={muda("neutro")}
                />
              </>
            )}
          </>
        )}

        {passo === "tomadas" && (
          <>
            <Opcoes<RespostasAutomacao["cargaTomada"]>
              titulo="Qual é o aparelho mais forte que vai na tomada?"
              ajuda="A potência está na etiqueta do aparelho, em watts."
              valor={r.cargaTomada}
              opcoes={[
                { valor: 1000, rotulo: "Até 1.000 W", detalhe: "Abajur, ventilador, TV, carregador" },
                { valor: 2400, rotulo: "Até 2.400 W", detalhe: "Cafeteira, air fryer, micro-ondas" },
                { valor: 3500, rotulo: "Mais que isso", detalhe: "Aquecedor, ar portátil" },
              ]}
              aoMudar={muda("cargaTomada")}
            />
            <Opcoes
              titulo="Quer ver no celular quanto cada aparelho gasta?"
              valor={r.medir}
              opcoes={[
                { valor: true, rotulo: "Sim" },
                { valor: false, rotulo: "Não precisa" },
              ]}
              aoMudar={muda("medir")}
            />
          </>
        )}

        {passo === "controle" && (
          <>
            <Opcoes<Assistente>
              titulo="Vai comandar por voz?"
              valor={r.assistente}
              opcoes={[
                { valor: "alexa", rotulo: "Alexa" },
                { valor: "google", rotulo: "Google Assistente" },
                { valor: "apple", rotulo: "Apple (Siri)" },
                { valor: "nenhum", rotulo: "Só pelo celular" },
              ]}
              aoMudar={muda("assistente")}
            />
            {r.assistente !== "nenhum" && (
              <Opcoes
                titulo="Já tem um alto-falante inteligente em casa?"
                ajuda="Echo, Nest ou HomePod: é por ele que o comando de voz chega às peças."
                valor={r.temAssistente}
                opcoes={[
                  { valor: true, rotulo: "Já tenho" },
                  { valor: false, rotulo: "Ainda não" },
                ]}
                aoMudar={muda("temAssistente")}
              />
            )}
            <Opcoes<RespostasAutomacao["protocolo"]>
              titulo="Prefere Zigbee, com central, ou Wi-Fi direto?"
              ajuda="No Zigbee as peças falam com uma central, e não com o roteador: sobra Wi-Fi para o resto da casa. No Wi-Fi direto não há central para comprar."
              valor={r.protocolo}
              opcoes={[
                { valor: "zigbee", rotulo: "Zigbee", detalhe: "Uma central para as peças" },
                { valor: "wifi", rotulo: "Wi-Fi direto", detalhe: "Cada peça no roteador" },
                { valor: "tantoFaz", rotulo: "Tanto faz", detalhe: "O simulador escolhe pelo aplicativo" },
              ]}
              aoMudar={muda("protocolo")}
            />
            <Opcoes
              titulo="Precisa continuar funcionando se a internet cair?"
              ajuda="Poucas fichas dizem, por escrito, que o aparelho funciona sem o servidor da marca. A lista dá preferência a quem diz."
              valor={r.semInternet}
              opcoes={[
                { valor: true, rotulo: "Sim" },
                { valor: false, rotulo: "Não é essencial" },
              ]}
              aoMudar={muda("semInternet")}
            />
          </>
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

"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Produto } from "@/lib/specs";
import {
  GRUPOS,
  MARGEM_CABO,
  NOME_SISTEMA,
  RESPOSTAS_INICIAIS,
  montarProjeto,
  sistemaRecomendado,
  type Item,
  type Respostas,
  type Sistema,
} from "@/lib/simulador-cameras";
import { Numero, Opcoes } from "@/components/simulador-campos";
import { Foto } from "@/components/foto";
import { LojaCta, DivulgacaoComissao } from "@/components/loja-cta";

/**
 * O questionário de câmeras do /simulador e a lista de compras que sai dele.
 * A lógica mora em lib/simulador-cameras.ts; aqui só há pergunta e tela.
 *
 * Cinco passos, e cada pergunta aparece só quando muda a lista: a de
 * resolução some quando não há cabo (as câmeras Wi-Fi da base são todas
 * 1080p), a de conector exposto some quando não há câmera externa.
 *
 * O CTA é UM bloco, depois da lista inteira: a pessoa vê o projeto completo,
 * inclusive o que ainda não tem ficha, antes de ver qualquer botão de loja.
 */

const PASSOS = ["Pontos", "Instalação", "Sistema", "Gravação", "Detalhes"];
const sim = [
  { valor: true, rotulo: "Sim" },
  { valor: false, rotulo: "Não" },
];

export function SimuladorCameras({ base }: { base: Record<string, Produto> }) {
  const [r, setR] = useState<Respostas>(RESPOSTAS_INICIAIS);
  const [passo, setPasso] = useState(0);
  const [pronto, setPronto] = useState(false);
  const titulo = useRef<HTMLHeadingElement>(null);
  const interagiu = useRef(false);

  const muda = <K extends keyof Respostas>(k: K) => (v: Respostas[K]) =>
    setR((atual) => ({ ...atual, [k]: v }));

  const recomendado = sistemaRecomendado(r);
  const sistema: Sistema = r.sistema ?? recomendado.sistema;
  const cabeado = sistema !== "wifi";
  const total = r.internos + r.externos;
  const projeto = useMemo(() => (pronto ? montarProjeto(r, base) : null), [pronto, r, base]);

  useEffect(() => {
    if (interagiu.current) titulo.current?.focus();
  }, [passo, pronto]);

  const ir = (p: number) => {
    interagiu.current = true;
    setPasso(p);
  };

  if (projeto) {
    return (
      <Lista
        projeto={projeto}
        base={base}
        tituloRef={titulo}
        aoAjustar={() => {
          interagiu.current = true;
          setPronto(false);
        }}
        aoRefazer={() => {
          interagiu.current = true;
          setR(RESPOSTAS_INICIAIS);
          setPasso(0);
          setPronto(false);
        }}
      />
    );
  }

  return (
    <div className="painel surgir p-5 sm:p-7" key={passo}>
      <ol className="flex flex-wrap gap-x-4 gap-y-1 text-[0.8rem]" aria-label="Passos">
        {PASSOS.map((nome, i) => (
          <li
            key={nome}
            aria-current={i === passo ? "step" : undefined}
            className={i === passo ? "font-semibold text-tinta" : "text-tinta-suave"}
          >
            <span className="dados">{i + 1}</span>. {nome}
          </li>
        ))}
      </ol>
      <h2 ref={titulo} tabIndex={-1} className="titulo-ui mt-4 text-xl outline-none">
        {
          [
            "Quantas câmeras, e onde",
            "Como é a casa",
            "O sistema indicado",
            "Por quanto tempo gravar",
            "Os detalhes da instalação",
          ][passo]
        }
      </h2>

      <div className="mt-5 space-y-6">
        {passo === 0 && (
          <>
            <div className="grid gap-6 sm:grid-cols-2">
              <Numero titulo="Pontos dentro de casa" valor={r.internos} max={16} aoMudar={muda("internos")} />
              <Numero titulo="Pontos fora de casa" valor={r.externos} max={16} aoMudar={muda("externos")} />
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {r.externos > 0 && (
                <Numero
                  titulo="Lá fora, até onde ver à noite"
                  ajuda="A distância do ponto mais longe que a câmera externa precisa enxergar no escuro."
                  valor={r.visaoNoturnaM}
                  min={1}
                  max={60}
                  unidade="metros"
                  aoMudar={muda("visaoNoturnaM")}
                />
              )}
              {r.internos > 0 && (
                <Numero
                  titulo="Dentro, até onde ver à noite"
                  ajuda="O comprimento do maior cômodo com câmera."
                  valor={r.visaoNoturnaInternaM}
                  min={1}
                  max={30}
                  unidade="metros"
                  aoMudar={muda("visaoNoturnaInternaM")}
                />
              )}
            </div>
          </>
        )}

        {passo === 1 && (
          <>
            <Opcoes
              titulo="Dá para passar cabo até as câmeras?"
              valor={r.cabo}
              opcoes={[
                { valor: "sim", rotulo: "Sim", detalhe: "Tem conduíte, forro ou caminho livre" },
                { valor: "obra", rotulo: "Só com obra" },
                { valor: "nao", rotulo: "Não" },
              ]}
              aoMudar={(v) => setR((a) => ({ ...a, cabo: v, sistema: undefined }))}
            />
            {r.cabo !== "nao" && (
              <Opcoes
                titulo="Resolução"
                ajuda="Acima de 1080p a indicação passa para o sistema IP."
                valor={r.resolucao}
                opcoes={[
                  { valor: "1080p", rotulo: "1080p (Full HD)" },
                  { valor: "4mp", rotulo: "4 MP" },
                  { valor: "5mp", rotulo: "5 MP ou mais" },
                ]}
                aoMudar={(v) => setR((a) => ({ ...a, resolucao: v, sistema: undefined }))}
              />
            )}
            <Opcoes
              titulo="A internet da casa é estável?"
              valor={r.internetEstavel}
              opcoes={[
                { valor: true, rotulo: "Sim" },
                { valor: false, rotulo: "Cai com frequência" },
              ]}
              aoMudar={muda("internetEstavel")}
            />
            <Opcoes
              titulo="Precisa continuar gravando se a internet cair?"
              valor={r.gravarSemInternet}
              opcoes={sim}
              aoMudar={muda("gravarSemInternet")}
            />
          </>
        )}

        {passo === 2 && (
          <>
            <div className="border-l-[3px] border-tinta bg-realce px-4 py-3">
              <p className="font-medium">Pelas suas respostas: {NOME_SISTEMA[recomendado.sistema]}</p>
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-[0.9rem] text-tinta-suave">
                {recomendado.motivos.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
            <Opcoes
              titulo="Montar o projeto com"
              valor={sistema}
              opcoes={(["wifi", "dvr", "nvr"] as Sistema[]).map((s) => ({
                valor: s,
                rotulo: NOME_SISTEMA[s] + (s === recomendado.sistema ? " (indicado)" : ""),
                detalhe:
                  s === "wifi" && r.cabo !== "nao" && r.resolucao !== "1080p"
                    ? "As câmeras Wi-Fi da base são todas 1080p"
                    : undefined,
              }))}
              aoMudar={(v) => setR((a) => ({ ...a, sistema: v === recomendado.sistema ? undefined : v }))}
            />
          </>
        )}

        {passo === 3 && (
          <>
            <Opcoes
              titulo="Por quantos dias guardar as imagens"
              valor={r.dias}
              opcoes={[
                { valor: 7, rotulo: "7 dias" },
                { valor: 15, rotulo: "15 dias" },
                { valor: 30, rotulo: "30 dias" },
              ]}
              aoMudar={muda("dias")}
            />
            <Opcoes
              titulo="Gravar"
              valor={r.modo}
              opcoes={[
                { valor: "continuo", rotulo: "O tempo todo" },
                { valor: "movimento", rotulo: "Só quando houver movimento" },
              ]}
              aoMudar={muda("modo")}
            />
          </>
        )}

        {passo === 4 && !cabeado && (
          <>
            {r.externos > 0 && (
              <Opcoes
                titulo="O Wi-Fi chega com força nos pontos de fora?"
                valor={r.wifiChegaLonge}
                opcoes={[
                  { valor: "sim", rotulo: "Sim" },
                  { valor: "nao", rotulo: "Não" },
                  { valor: "naoSei", rotulo: "Não sei" },
                ]}
                aoMudar={muda("wifiChegaLonge")}
              />
            )}
            <Opcoes
              titulo="Tem tomada perto de cada câmera?"
              valor={r.tomadaPerto}
              opcoes={sim}
              aoMudar={muda("tomadaPerto")}
            />
          </>
        )}

        {passo === 4 && cabeado && (
          <>
            <div className="grid gap-6 sm:grid-cols-2">
              <Numero
                titulo="Cabo até o gravador, em média"
                ajuda="Metros de cada câmera até onde fica o gravador."
                valor={r.distanciaMediaM}
                min={1}
                max={300}
                unidade="metros"
                aoMudar={muda("distanciaMediaM")}
              />
              <Numero
                titulo="Do ponto mais longe"
                valor={r.distanciaMaxM}
                min={1}
                max={300}
                unidade="metros"
                aoMudar={muda("distanciaMaxM")}
              />
            </div>
            {sistema === "dvr" && (
              <>
                <Opcoes
                  titulo="Que cabo usar"
                  valor={r.caboPreferido}
                  opcoes={[
                    { valor: "coaxial", rotulo: "Coaxial", detalhe: "Vídeo e energia no mesmo cabo" },
                    { valor: "utp", rotulo: "Cabo de rede (UTP)", detalhe: "Com balun; bom se o cabo já está passado" },
                  ]}
                  aoMudar={muda("caboPreferido")}
                />
                <Opcoes
                  titulo="Tem tomada perto de cada câmera?"
                  ajuda="Sem tomada, uma fonte só alimenta todas a partir do gravador."
                  valor={r.tomadaPerto}
                  opcoes={sim}
                  aoMudar={muda("tomadaPerto")}
                />
              </>
            )}
            {r.externos > 0 && (
              <Opcoes
                titulo="As emendas de fora ficam expostas à chuva?"
                valor={r.conectoresExpostos}
                opcoes={sim}
                aoMudar={muda("conectoresExpostos")}
              />
            )}
            <div className="grid gap-6 sm:grid-cols-2">
              <Opcoes titulo="Ver as câmeras pelo celular" valor={r.celular} opcoes={sim} aoMudar={muda("celular")} />
              <Opcoes titulo="Ver num monitor no local" valor={r.monitorLocal} opcoes={sim} aoMudar={muda("monitorLocal")} />
              <Opcoes titulo="Continuar gravando sem energia (nobreak)" valor={r.nobreak} opcoes={sim} aoMudar={muda("nobreak")} />
              <Opcoes titulo="Deixar canal livre para crescer" valor={r.folga} opcoes={sim} aoMudar={muda("folga")} />
            </div>
            <Opcoes
              titulo="Quem instala"
              valor={r.instalador}
              opcoes={[
                { valor: "profissional", rotulo: "Um instalador" },
                { valor: "eu", rotulo: "Eu mesmo", detalhe: "Entram as ferramentas na lista" },
              ]}
              aoMudar={muda("instalador")}
            />
          </>
        )}
      </div>

      {passo === 0 && total === 0 && (
        <p className="mt-4 text-[0.88rem] text-tinta-suave">Escolha pelo menos um ponto.</p>
      )}

      <div className="mt-7 flex flex-wrap gap-3">
        {passo > 0 && (
          <button type="button" onClick={() => ir(passo - 1)} className="botao botao-secundario">
            Voltar
          </button>
        )}
        {passo < PASSOS.length - 1 ? (
          <button
            type="button"
            onClick={() => ir(passo + 1)}
            disabled={total === 0}
            className="botao botao-secundario border-tinta disabled:cursor-not-allowed disabled:opacity-50"
          >
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

function Lista({
  projeto,
  base,
  tituloRef,
  aoAjustar,
  aoRefazer,
}: {
  projeto: ReturnType<typeof montarProjeto>;
  base: Record<string, Produto>;
  tituloRef: React.RefObject<HTMLHeadingElement | null>;
  aoAjustar: () => void;
  aoRefazer: () => void;
}) {
  const comFicha = projeto.itens.filter((i) => i.produto);
  const semFicha = projeto.itens.length - comFicha.length;
  const paraComprar = [...new Set(comFicha.map((i) => i.produto!))].map((s) => base[s]);

  return (
    <div className="surgir">
      <h2 ref={tituloRef} tabIndex={-1} className="titulo-ui text-2xl outline-none">
        O seu projeto: {NOME_SISTEMA[projeto.sistema]}
      </h2>
      <p className="mt-1 text-[0.9rem] text-tinta-suave">
        <span className="dados text-tinta">{projeto.itens.length}</span> itens na lista ·{" "}
        <span className="dados text-tinta">{comFicha.length}</span> com ficha no site ·{" "}
        <span className="dados text-tinta">{semFicha}</span> ainda sem ficha
      </p>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-[0.9rem]">
        {projeto.motivos.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>

      {projeto.avisos.length > 0 && (
        <div className="mt-5 border-l-[3px] border-atencao bg-papel px-4 py-3 text-[0.9rem]">
          <p className="font-medium">Atenção</p>
          <ul className="mt-1 space-y-1">
            {projeto.avisos.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      {GRUPOS.map(({ grupo, titulo }) => {
        const itens = projeto.itens.filter((i) => i.grupo === grupo);
        if (!itens.length) return null;
        return (
          <section key={grupo} className="mt-8">
            <h3 className="titulo-ui text-[1.1rem]">{titulo}</h3>
            <ul className="mt-3 space-y-3">
              {itens.map((i) => (
                <Linha key={i.id} item={i} base={base} />
              ))}
            </ul>
          </section>
        );
      })}

      {paraComprar.length > 0 && (
        <section className="painel mt-10 p-5 sm:p-6">
          <h3 className="titulo-ui text-[1.1rem]">Onde comprar as peças com ficha</h3>
          <DivulgacaoComissao plural={paraComprar.length > 1} />
          {paraComprar.map((p) => (
            <div key={p.slug} className="mt-5">
              <p className="font-medium">{p.nome}</p>
              <LojaCta lojas={p.lojas} produto={p.nome} posicao="simulador" divulgacao={false} />
            </div>
          ))}
          {semFicha > 0 && (
            <p className="mt-2 text-[0.85rem] text-tinta-suave">
              As outras {semFicha} peças da lista ainda não têm ficha apurada no
              site. A especificação delas está acima, e o link entra aqui quando a
              ficha entrar.
            </p>
          )}
        </section>
      )}

      <p className="mt-8 text-[0.82rem] text-tinta-suave">
        Número com “declara” é do fabricante, com fonte na ficha do produto.
        “Regra do simulador” é conta nossa, com o valor à vista.
        {projeto.sistema !== "wifi" &&
          ` A margem de cabo é de ${MARGEM_CABO * 100}%, e os conectores contam as pontas: dois por cabo.`}
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={aoAjustar} className="botao botao-secundario">
          Ajustar as respostas
        </button>
        <button type="button" onClick={aoRefazer} className="botao botao-secundario">
          Refazer do zero
        </button>
      </div>
    </div>
  );
}

function Linha({ item: i, base }: { item: Item; base: Record<string, Produto> }) {
  const p = i.produto ? base[i.produto] : undefined;
  const alt = i.alternativa ? base[i.alternativa.produto] : undefined;
  return (
    <li className="painel flex gap-4 p-4">
      <div className="flex w-16 shrink-0 flex-col items-center gap-2">
        <span className="dados rounded-md bg-realce px-2 py-1 text-[0.95rem] font-semibold">
          {i.qtd}
          {i.unidade === "m" ? " m" : "×"}
        </span>
        {p?.imagem && (
          <div className="relative h-14 w-14">
            <Foto
              src={p.imagem.src}
              alt={p.imagem.alt}
              tamanhos="56px"
              className="absolute inset-0 h-full w-full object-contain"
            />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[0.8rem] text-tinta-suave">
          {i.papel}
          {i.unidade === "pares" && " · pares"}
        </p>
        {p ? (
          <Link
            href={`/produtos/${p.slug}`}
            className="titulo-ui text-[1.05rem] underline decoration-linha underline-offset-4 hover:decoration-acao"
          >
            {p.nome}
          </Link>
        ) : (
          <p className="text-[0.98rem] font-medium">
            {i.especificacao}{" "}
            <span className="pastilha-neutra ml-1 align-middle text-[0.7rem]">ainda sem ficha no site</span>
          </p>
        )}
        <p className="mt-1.5 text-[0.9rem]">{i.porque}</p>
        {i.regra && (
          <p className="mt-1.5 text-[0.82rem] text-tinta-suave">
            <strong className="font-medium">Regra do simulador:</strong> {i.regra}
          </p>
        )}
        {i.confira && i.confira.length > 0 && (
          <div className="mt-2 text-[0.85rem]">
            <p className="font-medium text-ausente">Confira antes de comprar</p>
            <ul className="mt-0.5 list-disc pl-5 text-tinta-suave">
              {i.confira.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        )}
        {alt && i.alternativa && (
          <p className="mt-2 text-[0.85rem] text-tinta-suave">
            Alternativa na base:{" "}
            <Link href={`/produtos/${alt.slug}`} className="underline underline-offset-4">
              {alt.nome}
            </Link>{" "}
            — {i.alternativa.motivo}.
          </p>
        )}
      </div>
    </li>
  );
}

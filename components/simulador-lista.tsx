"use client";

import Link from "next/link";
import type { Produto } from "@/lib/specs";
import type { Item } from "@/lib/simulador-lista";
import { Foto } from "@/components/foto";
import { LojaCta, DivulgacaoComissao } from "@/components/loja-cta";

/**
 * A lista de compras do /simulador, comum a todas as frentes (câmeras, Wi-Fi).
 * Quem monta a lista é o motor de cada frente; aqui só se desenha.
 *
 * O CTA é UM bloco, depois da lista inteira: a pessoa vê o projeto completo,
 * inclusive o que ainda não tem ficha, antes de ver qualquer botão de loja.
 */
export function ListaDeCompras({
  titulo,
  motivos,
  avisos,
  itens: todos,
  grupos,
  nota,
  base,
  tituloRef,
  aoAjustar,
  aoRefazer,
}: {
  titulo: string;
  motivos: string[];
  avisos: string[];
  itens: Item[];
  grupos: { grupo: string; titulo: string }[];
  /** Regra do projeto que vale mencionar no rodapé da lista. */
  nota?: string;
  base: Record<string, Produto>;
  tituloRef: React.RefObject<HTMLHeadingElement | null>;
  aoAjustar: () => void;
  aoRefazer: () => void;
}) {
  const comFicha = todos.filter((i) => i.produto);
  const semFicha = todos.length - comFicha.length;
  const paraComprar = [...new Set(comFicha.map((i) => i.produto!))].map((s) => base[s]);

  return (
    <div className="surgir">
      <h2 ref={tituloRef} tabIndex={-1} className="titulo-ui text-2xl outline-none">
        {titulo}
      </h2>
      <p className="mt-1 text-[0.9rem] text-tinta-suave">
        <span className="dados text-tinta">{todos.length}</span> {todos.length === 1 ? "item" : "itens"} na lista ·{" "}
        <span className="dados text-tinta">{comFicha.length}</span> com ficha no site ·{" "}
        <span className="dados text-tinta">{semFicha}</span> ainda sem ficha
      </p>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-[0.9rem]">
        {motivos.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>

      {avisos.length > 0 && (
        <div className="mt-5 border-l-[3px] border-atencao bg-papel px-4 py-3 text-[0.9rem]">
          <p className="font-medium">Atenção</p>
          <ul className="mt-1 space-y-1">
            {avisos.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      {grupos.map(({ grupo, titulo: tituloGrupo }) => {
        const itens = todos.filter((i) => i.grupo === grupo);
        if (!itens.length) return null;
        return (
          <section key={grupo} className="mt-8">
            <h3 className="titulo-ui text-[1.1rem]">{tituloGrupo}</h3>
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
        {nota && ` ${nota}`}
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

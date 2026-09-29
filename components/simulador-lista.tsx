"use client";

import Link from "next/link";
import type { Produto } from "@/lib/specs";
import type { Item } from "@/lib/simulador-lista";
import { Foto } from "@/components/foto";
import { LojaCta, DivulgacaoComissao } from "@/components/loja-cta";

/**
 * A lista de compras do /simulador, comum a todas as frentes (câmeras, Wi-Fi,
 * automação).
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
  // Por peça do projeto: a indicada primeiro, depois as outras que atendem.
  // Um produto só aparece uma vez no bloco, mesmo se servir a duas peças —
  // regra do site: um botão por produto por página.
  const vistos = new Set<string>();
  const porPeca = comFicha
    .map((i) => ({
      item: i,
      produtos: [i.produto!, ...opcoes(i).map((o) => o.produto)]
        .filter((s) => base[s] && !vistos.has(s) && (vistos.add(s), true))
        .map((s) => base[s]),
    }))
    .filter((x) => x.produtos.length);
  const paraComprar = porPeca.flatMap((x) => x.produtos);

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
          {porPeca.map(({ item, produtos }) => (
            <div key={item.id} className="mt-6 border-t border-linha pt-4 first:border-t-0 first:pt-0">
              <p className="text-[0.8rem] font-semibold uppercase tracking-[0.06em] text-tinta-suave">
                {item.papel}
                {produtos.length > 1 && ` · ${produtos.length} opções que atendem`}
              </p>
              {produtos.map((p, n) => (
                <div key={p.slug} className="mt-3">
                  <p className="font-medium">
                    {p.nome}
                    {n === 0 && produtos.length > 1 && (
                      <span className="pastilha-neutra ml-2 align-middle text-[0.7rem]">indicada</span>
                    )}
                  </p>
                  <LojaCta lojas={p.lojas} produto={p.nome} posicao="simulador" divulgacao={false} />
                </div>
              ))}
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
  const outras = opcoes(i)
    .map((o) => ({ p: base[o.produto], motivo: o.motivo }))
    .filter((o) => o.p);
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
        {outras.length > 0 && (
          <div className="mt-2 text-[0.85rem] text-tinta-suave">
            <p>{outras.length === 1 ? "Outra opção na base que atende:" : `Outras ${outras.length} opções na base que atendem:`}</p>
            <ul className="mt-0.5 list-disc pl-5">
              {outras.map(({ p: o, motivo }) => (
                <li key={o.slug}>
                  <Link href={`/produtos/${o.slug}`} className="underline underline-offset-4">
                    {o.nome}
                  </Link>{" "}
                  — {motivo}.
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </li>
  );
}

/** A alternativa e as outras opções do item, na ordem, sem repetir. */
function opcoes(i: Item) {
  const todas = [...(i.alternativa ? [i.alternativa] : []), ...(i.outras ?? [])];
  return todas.filter((o, n) => o.produto !== i.produto && todas.findIndex((x) => x.produto === o.produto) === n);
}

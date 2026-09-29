"use client";

import { useId } from "react";

/**
 * Os dois tipos de campo do simulador.
 *
 * Opção marcada usa tinta e realce, nunca a cor de ação: verde é só do botão
 * de loja, e um questionário inteiro de opções verdes apagaria o único CTA da
 * página.
 */
export function Opcoes<T extends string | number | boolean>({
  titulo,
  ajuda,
  valor,
  opcoes,
  aoMudar,
}: {
  titulo: string;
  ajuda?: string;
  valor: T | "";
  opcoes: { valor: T; rotulo: string; detalhe?: string }[];
  aoMudar: (v: T) => void;
}) {
  const nome = useId();
  return (
    <fieldset>
      <legend className="text-[0.95rem] font-medium">{titulo}</legend>
      {ajuda && <p className="mt-0.5 text-[0.82rem] text-tinta-suave">{ajuda}</p>}
      <div className="mt-2 grid gap-2 sm:grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]">
        {opcoes.map((o) => {
          const marcada = o.valor === valor;
          return (
            <label
              key={String(o.valor)}
              className={`flex cursor-pointer flex-col rounded-lg border px-3.5 py-2.5 text-[0.9rem] transition-colors ${
                marcada
                  ? "border-tinta bg-realce font-medium"
                  : "border-linha bg-papel hover:border-tinta-suave"
              }`}
            >
              <span className="flex items-center gap-2">
                <input
                  type="radio"
                  name={nome}
                  checked={marcada}
                  onChange={() => aoMudar(o.valor)}
                  className="accent-[var(--color-tinta)]"
                />
                {o.rotulo}
              </span>
              {o.detalhe && (
                <span className="mt-0.5 pl-6 text-[0.78rem] font-normal text-tinta-suave">
                  {o.detalhe}
                </span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function Numero({
  titulo,
  ajuda,
  valor,
  min = 0,
  max,
  unidade,
  aoMudar,
}: {
  titulo: string;
  ajuda?: string;
  valor: number;
  min?: number;
  max: number;
  unidade?: string;
  aoMudar: (v: number) => void;
}) {
  const id = useId();
  const ajusta = (v: number) => aoMudar(Math.min(max, Math.max(min, v)));
  const botao =
    "flex h-10 w-10 items-center justify-center rounded-lg border border-linha bg-papel text-lg hover:border-tinta-suave disabled:opacity-40";
  return (
    <div>
      <label htmlFor={id} className="text-[0.95rem] font-medium">
        {titulo}
      </label>
      {ajuda && <p className="mt-0.5 text-[0.82rem] text-tinta-suave">{ajuda}</p>}
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          aria-label={`Menos — ${titulo}`}
          onClick={() => ajusta(valor - 1)}
          disabled={valor <= min}
          className={botao}
        >
          −
        </button>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={valor}
          onChange={(e) => ajusta(Number(e.target.value) || 0)}
          className="dados h-10 w-20 rounded-lg border border-linha bg-papel text-center text-tinta focus:border-tinta focus:outline-none"
        />
        <button
          type="button"
          aria-label={`Mais — ${titulo}`}
          onClick={() => ajusta(valor + 1)}
          disabled={valor >= max}
          className={botao}
        >
          +
        </button>
        {unidade && <span className="text-[0.88rem] text-tinta-suave">{unidade}</span>}
      </div>
    </div>
  );
}

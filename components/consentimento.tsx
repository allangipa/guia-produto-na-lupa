"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { site } from "@/lib/site";

/**
 * Faixa de consentimento do Google AdSense, e o carregador do script dele.
 *
 * Existe desde 02/10/2026, quando o Allan decidiu monetizar o site com AdSense,
 * igual aos outros sites dele (Vestígio Oculto, Arquitetura do Impossível,
 * Xadrez Bélico, viagemnalupa). Até ali a regra era "sem cookie, sem banner";
 * o histórico está no CLAUDE.md, seção "AdSense".
 *
 * Comportamento, o mesmo da referência do Arquitetura do Impossível:
 *
 * - O `adsbygoogle.js` NUNCA vai escrito no HTML: entra só por aqui, por JS.
 * - Sem escolha gravada, carrega de imediato (`BLOQUEIA = false`) e mostra a
 *   faixa. "Entendi" grava e mantém; "Recusar anúncios" grava, esconde e
 *   remove o script; nas próximas visitas ele não carrega.
 * - A escolha fica em localStorage (`gp-consentimento`), sempre em try/catch:
 *   navegação privada sem armazenamento só faz a faixa voltar na próxima vez.
 * - Europa/Reino Unido/Suíça: se a mensagem GDPR certificada do Google
 *   aparecer (`__tcfapi`) e disser que o GDPR se aplica, esta faixa sai da
 *   frente e quem pergunta é o Google.
 *
 * "Entendi" é sólido em tinta, não na cor de ação: o verde é só do botão de
 * loja, e a faixa aparece em toda página, inclusive nas que têm esse botão.
 *
 * A faixa não é pop-up no sentido que o site proíbe: não cobre o conteúdo,
 * não tem contagem, não volta depois de respondida e fecha com um toque.
 */

const CHAVE = "gp-consentimento";
const BLOQUEIA = false;
const ID_SCRIPT = "ads-google";

type Escolha = "aceitar" | "recusar";

function ler(): string | null {
  try {
    return localStorage.getItem(CHAVE);
  } catch {
    return null;
  }
}

function gravar(v: Escolha) {
  try {
    localStorage.setItem(CHAVE, v);
  } catch {
    // Sem armazenamento: vale para esta página, e a faixa volta na próxima.
  }
}

function carrega() {
  if (!site.adsense.pub || document.getElementById(ID_SCRIPT)) return;
  const s = document.createElement("script");
  s.id = ID_SCRIPT;
  s.async = true;
  s.crossOrigin = "anonymous";
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${site.adsense.pub}`;
  document.head.appendChild(s);
}

function remove() {
  document.getElementById(ID_SCRIPT)?.remove();
}

type Tcf = (
  cmd: string,
  versao: number,
  cb: (tc: { gdprApplies?: boolean } | null, ok: boolean) => void,
) => void;

export function Consentimento() {
  const [visivel, setVisivel] = useState(false);
  const respondido = useRef(false);

  useEffect(() => {
    const escolha = ler();
    if (escolha === "aceitar" || (escolha === null && !BLOQUEIA)) carrega();
    if (escolha !== null) return;

    setVisivel(true);

    // Mensagem GDPR do Google: polling de 250 ms por até 10 s.
    let n = 0;
    const t = window.setInterval(() => {
      const tcf = (window as unknown as { __tcfapi?: Tcf }).__tcfapi;
      if (typeof tcf === "function") {
        window.clearInterval(t);
        tcf("addEventListener", 2, (tc, ok) => {
          if (ok && tc?.gdprApplies && !respondido.current) setVisivel(false);
        });
      } else if (++n > 40) {
        window.clearInterval(t);
      }
    }, 250);
    return () => window.clearInterval(t);
  }, []);

  function escolher(v: Escolha) {
    respondido.current = true;
    gravar(v);
    setVisivel(false);
    if (v === "aceitar") carrega();
    else remove();
  }

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Aviso de cookies"
      hidden={!visivel}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-linha bg-papel shadow-[0_-8px_24px_rgba(0,0,0,0.12)]"
    >
      <div className="mx-auto flex max-w-[var(--largura-ferramenta)] flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-3.5">
        <p className="max-w-[70ch] text-[0.88rem] leading-snug text-tinta-suave">
          Este site usa cookies do Google AdSense para exibir anúncios e medir
          audiência. Não pedimos cadastro nem e-mail. Detalhes na{" "}
          <Link href="/privacidade" className="text-tinta underline">
            política de privacidade
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => escolher("recusar")}
            className="botao botao-secundario !py-2 text-[0.85rem]"
          >
            Recusar anúncios
          </button>
          <button
            type="button"
            onClick={() => escolher("aceitar")}
            className="botao bg-tinta !py-2 text-[0.85rem] text-papel hover:opacity-90"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}

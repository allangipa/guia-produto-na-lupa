"use client";

import { useEffect, useState } from "react";

/**
 * Alternador de tema.
 *
 * Três estados, não dois: claro, escuro e "o que o sistema mandar" — que é o
 * padrão. Quem nunca tocou no botão segue o sistema operacional; quem tocou,
 * manda. A escolha fica em `localStorage`, porque num site estático não existe
 * servidor para lembrar dela.
 */

type Tema = "sistema" | "claro" | "escuro";

const CHAVE = "tema";

/**
 * Roda antes da primeira pintura, no `<head>`. Sem isso a página aparece clara
 * por um instante antes do React assumir, e o "flash branco" na madrugada é
 * exatamente o tipo de detalhe que faz um site parecer amador.
 */
export const scriptAntiFlash = `(function(){try{var t=localStorage.getItem("${CHAVE}");if(t==="claro"||t==="escuro"){document.documentElement.setAttribute("data-tema",t)}}catch(e){}})();`;

function aplicar(tema: Tema) {
  const raiz = document.documentElement;
  if (tema === "sistema") raiz.removeAttribute("data-tema");
  else raiz.setAttribute("data-tema", tema);
}

export function AlternadorTema() {
  const [tema, setTema] = useState<Tema>("sistema");
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    try {
      const salvo = localStorage.getItem(CHAVE) as Tema | null;
      if (salvo === "claro" || salvo === "escuro") setTema(salvo);
    } catch {
      // Navegação privada ou cookies bloqueados: segue o sistema, sem quebrar.
    }
    setMontado(true);
  }, []);

  function trocar() {
    const proximo: Tema =
      tema === "sistema" ? "escuro" : tema === "escuro" ? "claro" : "sistema";
    setTema(proximo);
    aplicar(proximo);
    try {
      if (proximo === "sistema") localStorage.removeItem(CHAVE);
      else localStorage.setItem(CHAVE, proximo);
    } catch {
      // Sem persistência, vale só para esta navegação. Melhor que erro.
    }
  }

  // Antes de montar não dá para saber o tema salvo: renderizar um rótulo
  // qualquer causaria divergência entre servidor e cliente.
  const rotulo = !montado
    ? "Tema"
    : tema === "sistema"
      ? "Tema: sistema"
      : tema === "escuro"
        ? "Tema: escuro"
        : "Tema: claro";

  return (
    <button
      type="button"
      onClick={trocar}
      aria-label={`${rotulo}. Clique para alternar.`}
      className="pilula !py-2 text-[0.8rem]"
    >
      {rotulo}
    </button>
  );
}

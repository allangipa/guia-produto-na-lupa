"use client";

import { useEffect } from "react";
import { ehFoco, hrefDoFoco } from "@/lib/simulador";

/**
 * Até 29/09/2026 as ferramentas moravam todas em /simulador, escolhidas por
 * `?projeto=ar`. Esses links já circularam — ficha, home, cabeçalho e o que
 * alguém tenha copiado —, e continuam chegando na ferramenta certa. A página é
 * estática: o endereço só pode ser lido no navegador.
 */
export function RedirecionaProjeto() {
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("projeto");
    if (ehFoco(p)) window.location.replace(hrefDoFoco(p));
  }, []);
  return null;
}

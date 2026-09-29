"use client";

import { useState, type ReactNode } from "react";
import type { Produto } from "@/lib/specs";
import { FOCOS, type Foco } from "@/lib/simulador";
import { Opcoes } from "@/components/simulador-campos";
import { SetupSimulator } from "@/components/setup-simulator";
import { SimuladorCameras } from "@/components/simulador-cameras";

/**
 * A primeira pergunta do /simulador, que escolhe qual questionário abre.
 * Câmeras tem o completo, com lista de compras; Wi-Fi e automação ainda têm o
 * simples. Trocar de foco zera o questionário, com `key`, para nenhuma
 * resposta de uma frente vazar para a outra.
 */
export function Simulador({
  resultados,
  baseCameras,
}: {
  resultados: Record<string, ReactNode>;
  baseCameras: Record<string, Produto>;
}) {
  const [foco, setFoco] = useState<Foco | "">("");
  return (
    <div className="space-y-6">
      <Opcoes titulo="Qual é o projeto?" valor={foco} opcoes={FOCOS} aoMudar={setFoco} />
      {foco === "seguranca" && <SimuladorCameras key={foco} base={baseCameras} />}
      {(foco === "wifi" || foco === "automacao") && (
        <SetupSimulator key={foco} foco={foco} resultados={resultados} />
      )}
    </div>
  );
}

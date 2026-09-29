"use client";

import { useState } from "react";
import type { Produto } from "@/lib/specs";
import { FOCOS, type Foco } from "@/lib/simulador";
import { Opcoes } from "@/components/simulador-campos";
import { SimuladorCameras } from "@/components/simulador-cameras";
import { SimuladorWifi } from "@/components/simulador-wifi";
import { SimuladorAutomacao } from "@/components/simulador-automacao";
import { SimuladorAr } from "@/components/simulador-ar";
import { SimuladorNobreak } from "@/components/simulador-nobreak";
import { SimuladorAirfryer } from "@/components/simulador-airfryer";
import { SimuladorRefil } from "@/components/simulador-refil";

/**
 * A primeira pergunta do /simulador, que escolhe qual questionário abre.
 * As três frentes têm o questionário completo, com lista de compras. Trocar de foco zera o questionário, com `key`, para nenhuma
 * resposta de uma frente vazar para a outra.
 */
export function Simulador({ base }: { base: Record<string, Produto> }) {
  const [foco, setFoco] = useState<Foco | "">("");
  return (
    <div className="space-y-6">
      <Opcoes titulo="Qual é o projeto?" valor={foco} opcoes={FOCOS} aoMudar={setFoco} />
      {foco === "seguranca" && <SimuladorCameras key={foco} base={base} />}
      {foco === "wifi" && <SimuladorWifi key={foco} base={base} />}
      {foco === "automacao" && <SimuladorAutomacao key={foco} base={base} />}
      {foco === "ar" && <SimuladorAr key={foco} base={base} />}
      {foco === "nobreak" && <SimuladorNobreak key={foco} base={base} />}
      {foco === "airfryer" && <SimuladorAirfryer key={foco} base={base} />}
      {foco === "purificador" && <SimuladorRefil key={foco} base={base} />}
    </div>
  );
}

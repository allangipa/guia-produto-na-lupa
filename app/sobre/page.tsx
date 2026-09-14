import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sobre",
  description: "Quem escreve as análises deste site.",
  alternates: { canonical: "/sobre" },
};

export default function Sobre() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="font-titulo text-3xl tracking-tight">Quem escreve</h1>
      <div className="prosa mt-8">
        <p>
          [SUBSTITUIR] Este texto é o que mais pesa na confiança do leitor e na
          leitura de E-E-A-T pelo Google. Escreva em primeira pessoa, com nome,
          foto real, o que você usa no dia a dia e por que começou o site.
        </p>
        <p>
          {site.autor.nome} — {site.autor.bio}
        </p>
        <h2>Contato</h2>
        <p>[SUBSTITUIR] e-mail de contato para correções e sugestões de pauta.</p>
      </div>
    </div>
  );
}

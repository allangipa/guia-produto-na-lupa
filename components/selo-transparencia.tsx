import { camposDa, transparencia, faixaTransparencia } from "@/lib/specs";
import type { Produto } from "@/lib/specs";

/**
 * Quanto da ficha o fabricante publica, no formato de selo.
 *
 * O selo existia só no card de produto e no comparador. Ficava de fora
 * justamente da análise e do comparativo — as duas páginas em que a tese do
 * site é o assunto. Quem lê "a Philco não informa" no meio do texto não tem
 * como saber se aquilo é um deslize ou o padrão da ficha inteira; o número
 * responde isso antes do primeiro parágrafo.
 *
 * O rótulo diz "da ficha", nunca "do produto": a nota mede a documentação do
 * fabricante, não a qualidade do aparelho. E a cor vem de `faixaTransparencia`,
 * que é a mesma régua do resto do site — nunca a cor de ação, que pertence ao
 * botão de compra.
 */
export function SeloTransparencia({
  produto,
  className = "",
}: {
  produto: Produto;
  className?: string;
}) {
  const campos = camposDa(produto.categoria);
  if (!campos.length) return null;
  const t = transparencia(produto, campos);
  if (!t.total) return null;
  const faixa = faixaTransparencia(t.nota);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.72rem] font-semibold ${faixa.classe} ${className}`}
      title={`${faixa.rotulo}: ${t.preenchidos} de ${t.total} campos comparáveis desta categoria estão preenchidos na ficha oficial`}
    >
      <span className="dados">{t.nota}%</span>
      <span className="font-normal">da ficha publicada</span>
    </span>
  );
}

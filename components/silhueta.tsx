/**
 * A silhueta do produto em escala, contra um cartão de crédito.
 *
 * Existe por dois motivos. O primeiro é honesto: sem foto licenciada, uma ficha
 * só de números fica visualmente muda — e foto de produto tem dono, então
 * inventar uma não é opção. O segundo é que isto responde melhor que a foto a
 * pergunta que decide a compra de uma bateria externa: cabe no bolso?
 *
 * Nada aqui é estimado. O desenho sai das dimensões que o próprio fabricante
 * publica; quando ele não publica, não há desenho — e a ausência aparece, como
 * em todo o resto do site.
 */

/** Cartão de crédito: 85,6 × 53,98 mm pela ISO/IEC 7810 ID-1. */
const CARTAO = { largura: 85.6, altura: 53.98 };

/** "167 × 83,2 × 24,3" → [167, 83.2, 24.3] */
function medidas(texto: string | null | undefined): number[] | null {
  if (!texto) return null;
  const n = texto
    .split(/[×x]/)
    .map((p) => Number(p.trim().replace(",", ".")))
    .filter((v) => Number.isFinite(v) && v > 0);
  return n.length >= 2 ? n : null;
}

export function Silhueta({
  dimensoes,
  rotulo = true,
}: {
  dimensoes: string | null | undefined;
  rotulo?: boolean;
}) {
  const m = medidas(dimensoes);
  if (!m) return null;

  // A face maior é a que encosta na mesa e a que o bolso sente.
  const [a, b] = [m[0], m[1]].sort((x, y) => y - x);
  const espessura = m[2];

  const maiorLado = Math.max(a, CARTAO.largura);
  const maiorAltura = Math.max(b, CARTAO.altura);
  const margem = 6;
  const vbL = maiorLado + margem * 2;
  const vbA = maiorAltura + margem * 2;

  const cabeNoCartao = a <= CARTAO.largura && b <= CARTAO.altura;

  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${vbL} ${vbA}`}
        className="block h-auto w-full max-w-[16rem]"
        role="img"
        aria-label={`Silhueta em escala: ${a} por ${b} milímetros, comparada a um cartão de crédito`}
      >
        {/* O produto vem primeiro, preenchido. O cartão vai por cima: quando o
            produto é maior que ele nos dois lados — que é o caso comum — um
            contorno desenhado por baixo desaparece sob o preenchimento, e a
            escala deixa de existir. Foi exatamente o que aconteceu na primeira
            versão deste componente. */}
        <rect
          x={margem}
          y={vbA - margem - b}
          width={a}
          height={b}
          rx={espessura ? Math.min(espessura / 3, 6) : 3}
          className="fill-realce stroke-acao"
          strokeWidth={1.4}
        />
        <rect
          x={margem}
          y={vbA - margem - CARTAO.altura}
          width={CARTAO.largura}
          height={CARTAO.altura}
          rx={3}
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
          strokeDasharray="4 3"
          className="text-tinta-suave"
        />
        <text
          x={margem + 3}
          y={vbA - margem - CARTAO.altura + 8}
          className="fill-tinta-suave"
          style={{ fontSize: 6.5, fontFamily: "var(--font-texto)" }}
        >
          cartão
        </text>
      </svg>

      {rotulo && (
        <figcaption className="mt-2 text-[0.78rem] text-tinta-suave">
          <span className="dados">{dimensoes} mm</span>
          {espessura ? ` · ${cabeNoCartao ? "menor que um cartão de crédito" : "maior que um cartão de crédito"}` : ""}
        </figcaption>
      )}
    </figure>
  );
}

/**
 * A silhueta do produto em escala, contra um cartão de crédito.
 *
 * Sem foto licenciada, uma ficha só de números fica visualmente muda — e foto
 * de produto tem dono. O desenho sai das dimensões que o próprio fabricante
 * publica, e responde melhor que a foto à pergunta que decide a compra: cabe
 * no bolso? Quando o fabricante não publica dimensão, não há desenho — a
 * ausência aparece, como em todo o resto do site.
 *
 * Desenhado com contraste de verdade: preenchimento sólido da cor de ação,
 * sombra projetada leve e o cartão por cima em traço escuro. A primeira versão
 * era um contorno fino sobre fundo da mesma cor e sumia — principalmente no
 * tema escuro.
 */

/** Cartão de crédito: 85,6 × 53,98 mm pela ISO/IEC 7810 ID-1. */
const CARTAO = { largura: 85.6, altura: 53.98 };

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
  className = "max-w-[15rem]",
}: {
  dimensoes: string | null | undefined;
  rotulo?: boolean;
  className?: string;
}) {
  const m = medidas(dimensoes);
  if (!m) return null;

  const [a, b] = [m[0], m[1]].sort((x, y) => y - x);
  const espessura = m[2];

  const margem = 8;
  const vbL = Math.max(a, CARTAO.largura) + margem * 2;
  const vbA = Math.max(b, CARTAO.altura) + margem * 2 + 4;
  const cabeNoCartao = a <= CARTAO.largura && b <= CARTAO.altura;
  const raio = espessura ? Math.min(espessura / 2.5, 7) : 4;

  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${vbL} ${vbA}`}
        className={`block h-auto w-full ${className}`}
        role="img"
        aria-label={`Silhueta em escala: ${a} por ${b} milímetros, comparada a um cartão de crédito`}
      >
        {/* Sombra projetada: dá volume sem pedir foto. */}
        <rect
          x={margem + 2}
          y={vbA - margem - b + 3}
          width={a}
          height={b}
          rx={raio}
          className="fill-tinta"
          opacity={0.12}
        />
        <rect
          x={margem}
          y={vbA - margem - b}
          width={a}
          height={b}
          rx={raio}
          className="fill-acao"
          opacity={0.9}
        />
        {/* Reflexo sutil na face superior, para não parecer um bloco chapado. */}
        <rect
          x={margem + 2}
          y={vbA - margem - b + 2}
          width={a - 4}
          height={Math.max(b * 0.28, 4)}
          rx={Math.max(raio - 1.5, 2)}
          fill="#ffffff"
          opacity={0.14}
        />
        {/* O cartão de crédito por cima: é a régua. */}
        <rect
          x={margem}
          y={vbA - margem - CARTAO.altura}
          width={CARTAO.largura}
          height={CARTAO.altura}
          rx={3}
          fill="none"
          className="stroke-tinta"
          strokeWidth={1.1}
          strokeDasharray="3.5 2.5"
          opacity={0.7}
        />
        <text
          x={margem + 3.5}
          y={vbA - margem - CARTAO.altura + 7.5}
          className="fill-tinta"
          opacity={0.8}
          style={{ fontSize: 5.6, fontFamily: "var(--font-texto)", fontWeight: 600, letterSpacing: 0.4 }}
        >
          CARTÃO
        </text>
      </svg>

      {rotulo && (
        <figcaption className="mt-2 text-[0.78rem] text-tinta-suave">
          <span className="dados">{dimensoes} mm</span>
          {espessura
            ? ` · ${cabeNoCartao ? "menor que um cartão de crédito" : "maior que um cartão de crédito"}`
            : ""}
        </figcaption>
      )}
    </figure>
  );
}

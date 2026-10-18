/**
 * A marca do site, desde 17/10/2026: o emblema renderizado (lupa com
 * deerstalker, sem rosto, sem texto) e o nome em texto vivo ao lado.
 *
 * Antes era um SVG só, com o nome convertido em contornos de Fraunces. O
 * Allan pediu uma identidade "de alta resolução", como a dos outros sites
 * dele, e um emblema que sirva de foto de perfil no Instagram — a mesma
 * imagem que está em `public/marca/emblema-*.webp` e nos ícones do app.
 *
 * O nome é HTML, não imagem, de propósito: fica nítido em qualquer densidade,
 * troca de cor com o tema sem precisar de dois arquivos, e é o próprio texto
 * que o leitor de tela anuncia. "GUIA" pequeno em Archivo, "Produto na Lupa"
 * em Fraunces — a mesma divisão que o site usa entre interface e título.
 * Nada aqui é verde: a cor de ação continua exclusiva do botão de loja.
 *
 * `tom="escuro"` é para fundo sólido escuro (o rodapé em acao-forte), onde o
 * texto vira branco; o emblema é o mesmo nos dois, porque já nasce escuro.
 */
export function Marca({ tom = "papel", nome = "Guia Produto na Lupa" }: { tom?: "papel" | "escuro"; nome?: string }) {
  const escuro = tom === "escuro";
  return (
    <span className="flex items-center gap-2.5 sm:gap-3">
      <img
        src="/marca/emblema-256.webp"
        alt=""
        aria-hidden
        width={256}
        height={256}
        className="h-9 w-9 shrink-0 rounded-full sm:h-11 sm:w-11 md:h-12 md:w-12"
      />
      <span className="flex flex-col" aria-label={nome}>
        <span
          className={`titulo-ui text-[0.58rem] uppercase leading-none tracking-[0.26em] sm:text-[0.66rem] ${escuro ? "text-white/70" : "text-tinta-suave"}`}
        >
          Guia
        </span>
        <span
          className={`mt-0.5 font-titulo text-[1.12rem] font-semibold leading-none tracking-[-0.02em] sm:text-[1.38rem] md:text-[1.5rem] ${escuro ? "text-white" : "text-tinta"}`}
        >
          Produto na Lupa
        </span>
      </span>
    </span>
  );
}

import Link from "next/link";

/**
 * Duas declarações acima da dobra, e as duas são obrigatórias por motivos
 * diferentes: o link de afiliado, porque Amazon, Mercado Livre e CDC exigem;
 * a origem dos dados, porque o leitor precisa saber que a análise nasceu de
 * pesquisa, não de bancada — dizer isso na cara é o que permite ser levado a
 * sério no resto da página.
 */
export function Divulgacao({ atualizadoEm }: { atualizadoEm: string }) {
  return (
    <p className="text-[0.85rem] text-tinta-suave">
      <Link
        href="/metodologia"
        className="underline decoration-linha underline-offset-4 hover:decoration-acao"
      >
        Dados oficiais do fabricante
      </Link>{" "}
      · Atualizada em {atualizadoEm} · Contém links de afiliado
    </p>
  );
}

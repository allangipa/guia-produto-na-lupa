/**
 * O `id` de um título, para âncora, a partir do texto dele.
 *
 * Usada em dois lugares que precisam concordar: o `h2` do MDX
 * (`components/mdx.tsx`), que grava o `id` no HTML, e o índice "Neste guia"
 * (`app/guias/[slug]/page.tsx`), que lê os `## ` do fonte e monta os links.
 * Se as duas saídas divergirem, o link aponta para o nada — por isso a função
 * é uma só e remove a marcação inline antes de converter.
 */
export function limparMarkdown(texto: string): string {
  return texto
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .trim();
}

export function ancoraDe(texto: string): string {
  return limparMarkdown(texto)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** O texto de um nó React, para o `h2` do MDX gerar o id do que renderiza. */
export function textoDe(no: unknown): string {
  if (no == null || typeof no === "boolean") return "";
  if (typeof no === "string" || typeof no === "number") return String(no);
  if (Array.isArray(no)) return no.map(textoDe).join("");
  if (typeof no === "object" && "props" in no) {
    return textoDe((no as { props?: { children?: unknown } }).props?.children);
  }
  return "";
}

/**
 * Só **negrito**, e escapando o resto antes. O texto que passa por aqui é
 * nosso — vem de `dados/`, de `lib/` ou das fichas —, mas passar string por
 * `dangerouslySetInnerHTML` sem escapar é o tipo de atalho que sobrevive até o
 * dia em que a origem do texto muda.
 *
 * Só use isto em campo que é impresso na página e não vai para `description`,
 * `title` nem JSON-LD. Em metadado, asterisco não vira negrito: vira asterisco
 * no resultado do Google. É a diferença entre o `oQueSaiuDaqui`, que passa por
 * aqui, e o `resumo`, que `verificarResumos` proíbe de ter marcação.
 */
export function negrito(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

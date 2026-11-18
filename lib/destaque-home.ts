/**
 * O herói da home, desde 17/11/2026: o guia da categoria que mais recebe
 * visita, e não o lançamento do momento.
 *
 * Pedido do Allan depois da comparação com Zoom e TechTudo: o herói mostrava o
 * iPhone Duo, e quem chega pelo Google procura casa e cozinha. No Search
 * Console de 02 a 31/10/2026 a página com mais cliques e impressões do site foi
 * o comparativo Electrolux LED13 × LET13 (8 cliques, 272 impressões somando as
 * duas grafias da URL), seguida da lava-louças LB08E × LL08S (3 e 131) — as
 * duas primeiras são de lavar, e a de roupa lidera.
 *
 * A escolha é manual e datada, de propósito: site estático não lê o Search
 * Console no build. Para trocar, mude o slug do guia aqui e a data da medição;
 * o comparativo é opcional. Guia que não existir derruba o herói para o
 * simulador (ver app/page.tsx), e o build não quebra.
 *
 * Os lançamentos (lib/lancamentos.ts) continuam na home, na faixa própria mais
 * abaixo, com a mesma janela de 30 dias.
 */
export const DESTAQUE_DA_HOME = {
  guia: "lavadoras",
  comparativo: "electrolux-led13-vs-let13",
  /** O que a pastilha do herói diz. */
  rotulo: "O guia mais procurado do site",
  medidoEm: "2026-10-31",
} as const;

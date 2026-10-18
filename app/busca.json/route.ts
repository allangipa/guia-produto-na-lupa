import { indiceDeBusca } from "@/lib/indice";

/**
 * O índice de busca como arquivo, gerado no build: `/busca.json`.
 *
 * Até 17/10/2026 o índice viajava como prop do componente de busca, e por isso
 * ia serializado dentro de TODO HTML do site — 280 KB em cada uma das mil
 * páginas, 926 itens, antes de qualquer pixel. O Lighthouse em 4G lento dava
 * FCP de 3,8 s e LCP de 7,2 s na home, cujo HTML tinha 934 KB. Agora o
 * componente busca este arquivo no primeiro toque no campo
 * (`components/busca.tsx`), e o HTML sai sem ele.
 *
 * `force-static` é o que o `output: export` exige para gerar o arquivo.
 */
export const dynamic = "force-static";

export function GET() {
  return Response.json(indiceDeBusca());
}

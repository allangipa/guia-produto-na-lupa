import { Foto } from "@/components/foto";
// O `Produto` daqui é o do frontmatter — nome, marca e lojas —, e não a ficha
// completa de `lib/specs`. São dois tipos com o mesmo nome, e o comparativo
// carrega o primeiro.
import type { Produto, Imagem } from "@/lib/conteudo";

/**
 * As fotos dos concorrentes, lado a lado, no topo do comparativo.
 *
 * Existe porque até 26/09/2026 o comparativo não tinha foto nenhuma: abria com
 * título, subtítulo e uma parede de texto. A ficha do mesmo produto tinha foto
 * grande, e a página que carrega o botão de compra não tinha. Quem chega numa
 * comparação precisa ver os dois objetos antes de ler sobre eles — é o que
 * transforma um documento em comparação.
 *
 * A foto não vem do frontmatter: nenhum dos 44 comparativos declarava `imagem`
 * por concorrente. Ela vem da base, casada pelo ASIN ou pelo nome exato, do
 * mesmo jeito que a imagem de compartilhamento já fazia nesta mesma página.
 *
 * O crédito fica embaixo do par, uma vez só. Repetir "Imagem: WAP" duas vezes
 * lado a lado é ruído quando as duas fotos são da mesma marca, e quando não são
 * os dois créditos cabem na mesma linha.
 */
export function FrenteAFrente({
  concorrentes,
  fotos,
}: {
  concorrentes: Produto[];
  fotos: (Imagem | undefined)[];
}) {
  // Sem as duas fotos não há confronto: uma só desequilibra a página e sugere
  // que o outro produto é menos importante. Melhor não mostrar nenhuma.
  if (fotos.length !== concorrentes.length || fotos.some((f) => !f)) return null;

  const creditos = [...new Set(fotos.map((f) => f!.credito))];

  return (
    <figure className="mt-8">
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {concorrentes.map((p, i) => (
          <div key={p.nome} className="cartao overflow-hidden">
            <div className="flex aspect-[4/3] items-center justify-center bg-superficie p-3">
              <Foto
                src={fotos[i]!.src}
                alt={fotos[i]!.alt}
                tamanhos="(max-width: 640px) 44vw, 240px"
                prioridade
                className="max-h-full w-auto object-contain"
              />
            </div>
            <div className="px-3 py-2.5">
              <span className="text-[0.68rem] font-semibold uppercase tracking-[0.07em] text-tinta-suave">
                {p.marca}
              </span>
              <p className="mt-0.5 titulo-ui text-[0.9rem] leading-snug">{p.nome}</p>
            </div>
          </div>
        ))}
      </div>
      <figcaption className="mt-2 text-[0.75rem] text-tinta-suave">
        {creditos.join(" · ")}
      </figcaption>
    </figure>
  );
}

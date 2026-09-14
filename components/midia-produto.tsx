import Image from "next/image";
import type { Produto } from "@/lib/specs";
import { Silhueta } from "@/components/silhueta";

/**
 * O espaço da imagem do produto, em toda tela onde um produto aparece.
 *
 * Razão fixa para a grade não dançar quando metade dos produtos tiver foto e
 * metade ainda não. Enquanto `produto.imagem` estiver vazio — foto de produto
 * tem dono, e a via correta é a Product Advertising API depois da conta de
 * afiliado — o espaço é ocupado pela silhueta em escala, sobre um fundo claro
 * e limpo, como em qualquer loja.
 */
export function MidiaProduto({
  produto,
  prioridade = false,
  razao = "aspect-[4/3]",
}: {
  produto: Produto;
  prioridade?: boolean;
  razao?: string;
}) {
  const img = produto.imagem;

  return (
    <div
      className={`relative ${razao} w-full overflow-hidden bg-superficie`}
    >
      {img ? (
        <>
          <Image
            src={img.src}
            alt={img.alt}
            fill
            priority={prioridade}
            sizes="(max-width: 640px) 100vw, 320px"
            className="object-contain p-4"
          />
          <span className="absolute bottom-1.5 right-2 rounded bg-papel/85 px-1.5 py-0.5 text-[0.62rem] text-tinta-suave backdrop-blur">
            {img.credito}
          </span>
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center p-5">
          <Silhueta
            dimensoes={produto.specs.dimensoesMm as string}
            rotulo={false}
            className="max-w-[11.5rem]"
          />
          {!produto.specs.dimensoesMm && (
            <span className="text-[0.72rem] text-ausente">
              sem dimensões publicadas
            </span>
          )}
        </div>
      )}
    </div>
  );
}

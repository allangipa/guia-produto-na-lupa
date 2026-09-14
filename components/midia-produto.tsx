import Image from "next/image";
import type { Produto } from "@/lib/specs";
import { Silhueta } from "@/components/silhueta";

/**
 * O espaço da imagem do produto, em toda tela onde um produto aparece.
 *
 * Existe para que a chegada das fotos não vire um redesenho. Hoje o site não
 * tem nenhuma imagem licenciada — foto de produto tem dono, e a via correta é a
 * Product Advertising API, que só libera depois da conta de afiliado aprovada.
 * Até lá o espaço é ocupado pela silhueta em escala.
 *
 * A razão é fixa de propósito: quando metade dos produtos tiver foto e metade
 * ainda não, a grade não pode dançar. O dia em que `produto.imagem` começar a
 * ser preenchido, as fotos entram em card, ficha e comparador de uma vez, sem
 * mexer em layout nenhum.
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
      className={`relative ${razao} w-full overflow-hidden bg-superficie gradiente-acao`}
    >
      {img ? (
        <>
          <Image
            src={img.src}
            alt={img.alt}
            fill
            priority={prioridade}
            sizes="(max-width: 640px) 100vw, 380px"
            className="object-contain p-4"
          />
          {/* Crédito sobre a própria imagem: licença de press kit costuma exigir
              atribuição visível, e escondê-la num rodapé não cumpre. */}
          <span className="absolute bottom-1.5 right-2 rounded bg-papel/80 px-1.5 py-0.5 text-[0.65rem] text-tinta-suave backdrop-blur">
            {img.credito}
          </span>
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center p-5">
          <Silhueta
            dimensoes={produto.specs.dimensoesMm as string}
            rotulo={false}
          />
        </div>
      )}
    </div>
  );
}

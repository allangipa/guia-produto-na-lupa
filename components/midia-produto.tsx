import { Foto } from "@/components/foto";
import type { Produto } from "@/lib/specs";
import { Silhueta } from "@/components/silhueta";
import { Icone } from "@/components/icones";
import { iconeDaCategoria } from "@/lib/specs";

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
  tamanhos = "(max-width: 640px) 89vw, 250px",
}: {
  produto: Produto;
  prioridade?: boolean;
  razao?: string;
  tamanhos?: string;
}) {
  const img = produto.imagem;
  const amazon = produto.amazon;
  const imgAmazon = amazon?.imagens?.grande ?? amazon?.imagens?.media ?? null;

  return (
    <div
      className={`relative ${razao} w-full overflow-hidden bg-superficie`}
    >
      {imgAmazon ? (
        <>
          {/* Imagem licenciada pela Creators API, servida do CDN da Amazon —
              hotlink é o uso previsto pela licença; não se copia o arquivo.
              <img> puro porque o site é estático e não otimiza imagem. */}
          <img
            src={imgAmazon.url}
            alt={amazon?.titulo ?? produto.nome}
            width={imgAmazon.largura ?? undefined}
            height={imgAmazon.altura ?? undefined}
            loading={prioridade ? "eager" : "lazy"}
            className="absolute inset-0 h-full w-full object-contain p-4"
          />
          <span className="absolute bottom-1.5 right-2 rounded bg-papel/85 px-1.5 py-0.5 text-[0.62rem] text-tinta-suave backdrop-blur">
            {amazon?.origem === "simulacao" ? "imagem simulada" : "Imagem: Amazon"}
          </span>
        </>
      ) : img ? (
        <>
          {/* O `sizes` anterior dizia `100vw` no celular, e a foto aparece em
              333 px na grade de categoria e 230 na prateleira da home. O
              navegador acredita no que a gente declara, entao errar para
              menos deixa a foto menos nitida no retina e errar para mais
              anula o ganho. Por isso cada chamada passa a sua largura, e
              todas saem de medicao na tela. */}
          <Foto
            src={img.src}
            alt={img.alt}
            tamanhos={tamanhos}
            prioridade={prioridade}
            credito={img.credito}
            className="absolute inset-0 h-full w-full object-contain p-4"
          />
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-5">
          {produto.specs.dimensoesMm ? (
            <Silhueta
              dimensoes={produto.specs.dimensoesMm as string}
              rotulo={false}
              className="max-w-[11.5rem]"
            />
          ) : (
            <>
              {/* Sem dimensão publicada não há silhueta possível. O ícone da
                  categoria ocupa o lugar para a área não parecer quebrada —
                  e o texto diz por que está vazia.

                  "Não publicadas" só vale quando ninguém publicou. Se a ficha
                  tem divergência neste campo, a medida existe: foi descartada
                  por não fechar, e a seção de divergências mostra qual é. */}
              <Icone
                nome={iconeDaCategoria(produto.categoria)}
                className="h-16 w-16 text-acao opacity-30"
              />
              <span className="text-[0.7rem] text-ausente">
                {produto.divergencias?.some((d) => d.campo === "dimensoesMm")
                  ? "dimensões sem valor confiável"
                  : "dimensões não publicadas"}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

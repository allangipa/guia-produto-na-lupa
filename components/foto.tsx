import { srcSetDe } from "@/lib/variantes";

/**
 * Uma foto de produto, no tamanho que a tela precisa e nao mais que isso.
 *
 * O site e estatico e nao otimiza imagem em tempo de execucao, entao as
 * versoes menores sao geradas antes, pelo `npm run imagens`. Aqui so se
 * escolhe entre elas.
 *
 * `tamanhos` e a largura em que a foto aparece de fato — nao a do arquivo. E
 * o unico numero que o navegador tem para escolher o degrau antes de saber o
 * layout, e errar nele para mais anula o ganho: declarar `100vw` num circulo
 * de 104 px faz o navegador baixar a versao grande de novo. Os valores usados
 * no site saem de medicao, nao de estimativa.
 */
export function Foto({
  src,
  alt,
  tamanhos,
  prioridade = false,
  className,
  credito,
}: {
  src: string;
  alt: string;
  tamanhos: string;
  prioridade?: boolean;
  className?: string;
  credito?: string;
}) {
  const srcSet = srcSetDe(src);
  return (
    <>
      <img
        src={src}
        srcSet={srcSet}
        sizes={srcSet ? tamanhos : undefined}
        alt={alt}
        loading={prioridade ? "eager" : "lazy"}
        decoding={prioridade ? "sync" : "async"}
        fetchPriority={prioridade ? "high" : undefined}
        className={className}
      />
      {credito && (
        <span className="absolute bottom-1.5 right-2 rounded bg-papel/85 px-1.5 py-0.5 text-[0.62rem] text-tinta-suave backdrop-blur">
          {credito}
        </span>
      )}
    </>
  );
}

import Image from "next/image";
import type { Imagem } from "@/lib/conteudo";

/**
 * Foto de produto com crédito visível e obrigatório.
 *
 * O tipo `Imagem` exige `credito` e `origem` justamente para que não exista
 * caminho fácil para publicar imagem sem licença: se você não sabe de onde ela
 * veio, não consegue preencher o frontmatter, e sem o frontmatter o build quebra.
 *
 * Fontes aceitas: press kit do fabricante, Product Advertising API da Amazon
 * (que licencia a imagem para o afiliado) e bancos com licença aberta. Foto
 * salva da página da loja ou do Google Imagens não entra — é obra protegida, e
 * nas lojas ainda viola os termos do programa.
 *
 * `unoptimized` vem de next.config.ts: site estático não tem servidor para
 * redimensionar imagem em tempo real.
 */
export function FotoProduto({
  imagem,
  prioridade = false,
}: {
  imagem: Imagem;
  prioridade?: boolean;
}) {
  return (
    <figure className="my-8">
      <div className="overflow-hidden rounded-lg border border-linha bg-superficie">
        <Image
          src={imagem.src}
          alt={imagem.alt}
          width={1200}
          height={800}
          priority={prioridade}
          className="h-auto w-full object-contain"
        />
      </div>
      <figcaption className="mt-2 text-[0.8rem] text-tinta-suave">
        {imagem.credito} · {imagem.origem}
      </figcaption>
    </figure>
  );
}

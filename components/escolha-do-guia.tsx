import Link from "next/link";
import { Foto } from "@/components/foto";
import { Icone } from "@/components/icones";
import { SeloTransparencia } from "@/components/selo-transparencia";
import {
  camposDa,
  destaquesDa,
  iconeDo,
  rotuloCurto,
  valorLegivel,
} from "@/lib/specs";
import type { Produto as Ficha } from "@/lib/specs";
import type { Imagem } from "@/lib/conteudo";

/**
 * Uma escolha do guia, como cartão.
 *
 * Era um `<dl>` de duas colunas — perfil à esquerda, nome e parágrafo à
 * direita — até 26/09/2026. Allan: "fica parecendo mais blog com texto, não dá
 * o visual de informação de produto porque não mostra os produtos". A
 * referência do nicho (RTINGS) usa um bloco por recomendação, com foto, rótulo
 * do perfil, nome e veredito; os dados daqui já tinham essa forma, faltava a
 * renderização.
 *
 * NÃO tem botão de compra, e isso é de propósito. Seria o movimento óbvio e é o
 * que a concorrência faz, mas contraria a regra de afiliado do projeto: os CTAs
 * de um guia contam como UM bloco e ficam juntos em "Onde comprar cada um",
 * depois do corpo e das lacunas, porque o botão vem depois da entrega de valor.
 * Seis botões espalhados pelo texto transformariam o guia em página de venda.
 * O cartão leva para a ficha ou para a análise, que são páginas de leitura.
 */
export function EscolhaDoGuia({
  perfil,
  produto,
  porque,
  reviewSlug,
  foto,
  ficha,
}: {
  perfil: string;
  produto: string;
  porque: string;
  reviewSlug?: string;
  foto?: Imagem;
  ficha?: Ficha;
}) {
  const destino = reviewSlug
    ? `/reviews/${reviewSlug}`
    : ficha
      ? `/produtos/${ficha.slug}`
      : undefined;

  // Os mesmos números que o card de produto mostra na home, para o leitor ver a
  // ficha sem sair do guia.
  const campos = ficha ? camposDa(ficha.categoria) : [];
  const destaques = ficha
    ? destaquesDa(ficha.categoria)
        .map((chave) => campos.find((c) => c.chave === chave))
        .filter((c) => c && ficha.specs[c.chave] !== null && ficha.specs[c.chave] !== undefined)
        .slice(0, 3)
    : [];

  return (
    <li className="cartao group relative grid gap-0 sm:grid-cols-[11rem_1fr]">
      <div className="flex items-center justify-center bg-superficie p-4 sm:rounded-l-[var(--raio-card)]">
        {foto ? (
          <Foto
            src={foto.src}
            alt={foto.alt}
            tamanhos="(max-width: 640px) 90vw, 170px"
            className="h-32 w-auto max-w-full object-contain sm:h-36"
          />
        ) : (
          <span className="text-[0.75rem] text-tinta-suave">sem foto oficial</span>
        )}
      </div>

      <div className="p-4 sm:p-5">
        <span className="pastilha pastilha-neutra">{perfil}</span>

        <p className="mt-2.5 font-titulo text-lg leading-snug">
          {destino ? (
            <Link href={destino} className="after:absolute after:inset-0 group-hover:text-acao-forte">
              {produto}
            </Link>
          ) : (
            produto
          )}
        </p>

        {ficha && <SeloTransparencia produto={ficha} className="mt-2" />}

        <p className="mt-2.5 max-w-[58ch] text-[0.93rem] leading-snug text-tinta-suave">
          {porque}
        </p>

        {destaques.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[0.8rem]">
            {destaques.map((campo) => (
              <li key={campo!.chave} className="flex items-center gap-1.5" title={campo!.rotulo}>
                <Icone nome={iconeDo(campo!.chave)} className="h-3.5 w-3.5 shrink-0 text-acao" />
                <span className="text-tinta-suave">{rotuloCurto(campo!)}</span>
                <span className="dados font-semibold">
                  {valorLegivel(ficha!.specs[campo!.chave], campo!)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

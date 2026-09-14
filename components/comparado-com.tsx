import Link from "next/link";
import Image from "next/image";
import type { Campo, Produto } from "@/lib/specs";
import { transparencia, valorLegivel, rotuloCurto } from "@/lib/specs";

/**
 * O comparativo curto que abre na própria ficha, sem o leitor pedir.
 *
 * A comparação é a razão de existir deste site, e até aqui ela morava em outra
 * página — o visitante tinha que saber que o comparador existia e ir até lá.
 * Esta tabela põe o produto aberto ao lado de três vizinhos com os mesmos
 * campos e a mesma régua.
 *
 * Duas escolhas que valem explicar:
 *
 * O vencedor da linha é marcado com `bg-realce` e peso, nunca com a cor de
 * ação — ela é exclusiva do CTA, e uma tabela salpicada de verde apaga o único
 * botão da página. Só marca quando o campo declara `melhor`: em "material da
 * jarra" ou "tensão" não existe vencedor, e fingir que existe seria inventar
 * juízo onde o dado não sustenta.
 *
 * Célula vazia é "Não informa", em cinza de ausência — a mesma constatação que
 * a nota de transparência mede. Aqui ela fica lado a lado com quem informou, o
 * que é a forma mais direta de mostrar a lacuna.
 */

function melhorDaLinha(
  campo: Campo,
  valores: (string | number | boolean | null)[],
): number | null {
  if (!campo.melhor || campo.tipo !== "numero") return null;
  const numeros = valores.map((v) => (typeof v === "number" ? v : null));
  const validos = numeros.filter((n): n is number => n !== null);
  if (validos.length < 2) return null;
  const alvo =
    campo.melhor === "maior" ? Math.max(...validos) : Math.min(...validos);
  // Empate geral não tem vencedor: destacar todo mundo não informa nada.
  if (validos.every((n) => n === alvo)) return null;
  return numeros.findIndex((n) => n === alvo);
}

function Cabecalho({
  p,
  campos,
  atual,
}: {
  p: Produto;
  campos: Campo[];
  atual: boolean;
}) {
  const t = transparencia(p, campos);
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="relative aspect-square w-full overflow-hidden rounded bg-superficie">
        {p.imagem ? (
          <Image
            src={p.imagem.src}
            alt=""
            fill
            sizes="120px"
            className="object-contain p-2"
          />
        ) : null}
      </div>
      {atual ? (
        <span className="text-[0.7rem] font-semibold uppercase tracking-[0.06em] text-tinta-suave">
          Esta ficha
        </span>
      ) : (
        <span className="text-[0.7rem] uppercase tracking-[0.06em] text-tinta-suave">
          {p.marca}
        </span>
      )}
      <span className="line-clamp-2 text-[0.85rem] font-medium leading-snug">
        {atual ? (
          p.nome
        ) : (
          <Link href={`/produtos/${p.slug}`} className="hover:text-acao-forte">
            {p.nome}
          </Link>
        )}
      </span>
      <span className="dados mt-auto text-[0.72rem] text-tinta-suave">
        {t.nota}% da ficha
      </span>
    </div>
  );
}

export function ComparadoCom({
  produto,
  concorrentes,
  campos,
  linhas,
  criterio,
}: {
  produto: Produto;
  concorrentes: Produto[];
  campos: Campo[];
  linhas: Campo[];
  criterio: string;
}) {
  if (!concorrentes.length || !linhas.length) return null;
  const todos = [produto, ...concorrentes];

  return (
    <section className="painel mt-8 p-6">
      <h2 className="titulo-ui text-xl">Comparado com parecidos</h2>
      <p className="mt-1 max-w-[62ch] text-[0.9rem] text-tinta-suave">
        {criterio} Os campos são os mesmos para todos, e o que aparece em cinza
        é o que o fabricante não publica.
      </p>

      <div className="rolo mt-5 overflow-x-auto">
        <table className="w-full min-w-[42rem] border-collapse text-[0.88rem]">
          <thead>
            <tr>
              <th className="w-[10rem] border-b border-linha p-2 text-left align-bottom">
                <span className="sr-only">Campo</span>
              </th>
              {todos.map((p, i) => (
                <th
                  key={p.slug}
                  scope="col"
                  className={`border-b border-linha p-2 text-left align-top ${
                    i === 0 ? "bg-realce/50" : ""
                  }`}
                >
                  <Cabecalho p={p} campos={campos} atual={i === 0} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {linhas.map((campo) => {
              const valores = todos.map((p) => p.specs[campo.chave] ?? null);
              const vencedor = melhorDaLinha(campo, valores);
              return (
                <tr key={campo.chave} className="border-b border-linha">
                  <th
                    scope="row"
                    className="p-2 text-left align-middle font-normal text-tinta-suave"
                  >
                    {rotuloCurto(campo)}
                  </th>
                  {valores.map((v, i) => {
                    const ausente = v === null || v === undefined;
                    const ganhou = vencedor === i;
                    return (
                      <td
                        key={todos[i].slug}
                        className={`dados p-2 align-middle ${
                          ganhou ? "bg-realce font-semibold" : ""
                        } ${ausente ? "text-ausente" : ""} ${
                          i === 0 && !ganhou ? "bg-realce/50" : ""
                        }`}
                      >
                        {valorLegivel(v, campo)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-[0.78rem] text-tinta-suave">
        Fundo destacado marca o melhor valor da linha, e só nas linhas em que
        &ldquo;melhor&rdquo; quer dizer alguma coisa. Nenhum destes produtos foi
        testado: os números são os que cada fabricante publica.
      </p>
    </section>
  );
}

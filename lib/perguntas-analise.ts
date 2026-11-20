import type { Review } from "@/lib/conteudo";

export type PerguntaDaAnalise = { pergunta: string; resposta: string };

/** "Quer abafar o ônibus" -> "quer abafar o ônibus", para caber depois de "quem". */
const minuscula = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const semPonto = (s: string) => s.trim().replace(/[.;]+$/, "");
/** "a; b; c" -> "a; b; e c". */
function lista(itens: string[]) {
  const v = itens.map((x) => minuscula(semPonto(x)));
  if (v.length <= 1) return v.join("");
  return `${v.slice(0, -1).join("; ")}; e ${v[v.length - 1]}`;
}

/**
 * "Perguntas sobre <produto>", desde 19/11/2026.
 *
 * As quatro perguntas que chegam pela busca numa análise ("vale a pena?",
 * "para quem serve?", "quem não deve comprar?", "o que a ficha não diz?") já
 * estão respondidas no frontmatter: `veredito`, `pros`, `para`, `naoPara` e
 * `lacunas`. As perguntas são MONTADAS desses campos, e não escritas à parte —
 * resposta digitada duas vezes diverge na primeira correção, e este site
 * corrige ficha toda semana.
 *
 * `perguntas:` no frontmatter é opcional e SOMA às quatro: é para a dúvida
 * específica do produto, que nenhum campo responde.
 *
 * A página emite FAQPage (`schemaPerguntas`), verdadeiro porque o par
 * pergunta/resposta está visível. Nada de preço, nada de "testamos".
 */
export function perguntasDaAnalise(r: Review): PerguntaDaAnalise[] {
  const nome = r.produto.nome;
  const saida: PerguntaDaAnalise[] = [];

  if (r.veredito) {
    const pros = r.pros.slice(0, 2).map(semPonto);
    saida.push({
      pergunta: `${nome} vale a pena?`,
      resposta:
        `Pela documentação oficial, ${minuscula(semPonto(r.veredito))}.` +
        (pros.length ? ` Pontos fortes da ficha: ${pros.map(minuscula).join("; ")}.` : "") +
        " O site não testa produtos; a resposta sai da ficha do fabricante.",
    });
  }
  if (r.para.length) {
    saida.push({
      pergunta: `Para quem ${nome} serve?`,
      resposta: `Serve para quem ${lista(r.para)}.`,
    });
  }
  if (r.naoPara.length) {
    saida.push({
      pergunta: `Quem não deve comprar ${nome}?`,
      resposta: `Não é a melhor escolha para quem ${lista(r.naoPara)}.`,
    });
  }
  if (r.lacunas.length) {
    const quantas = r.lacunas.length;
    const mostradas = r.lacunas.slice(0, 4).map((x) => `${semPonto(x)}.`);
    saida.push({
      pergunta: `O que o fabricante não informa sobre ${nome}?`,
      resposta:
        `A documentação oficial deixa ${quantas === 1 ? "um ponto" : `${quantas} pontos`} sem resposta` +
        (quantas > 4 ? ", e os quatro primeiros são: " : ": ") +
        mostradas.join(" "),
    });
  }
  return [...saida, ...(r.perguntas ?? [])];
}

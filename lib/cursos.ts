/**
 * CURSOS E E-BOOKS DE AFILIADO (HOTMART)
 *
 * Decisão do Allan em 23/10/2026: curso também é produto, e entra no site com
 * o mesmo método da ficha — o que a página de venda publica, com a fonte, e o
 * que ela deixa de fora. A página de venda faz o papel da documentação do
 * fabricante; o produtor, o do fabricante.
 *
 * O curso não tem nota (a nota de cinco critérios é de aparelho) e não tem
 * página própria: aparece só como passo seguinte de uma peça que já existe,
 * para quem quer fazer o serviço sozinho. Ninguém aqui leu o guia nem fez o
 * curso, e o texto não pode sugerir que sim.
 *
 * Critério de entrada, por extenso, em docs/hotmart.md.
 */
export type Curso = {
  id: string;
  nome: string;
  produtor: string;
  /** Quem é o produtor, conferível fora da página de venda. */
  produtorQuem: string;
  /** Decide as frases do bloco: "leu este guia" ou "fez este curso". */
  tipo: "guia" | "curso";
  formato: string;
  /** O que a página de venda publica, campo a campo. */
  publica: { campo: string; valor: string }[];
  /** O que a página de venda não informa. Nunca preencher com estimativa. */
  lacunas: string[];
  /** Hotlink da Hotmart, copiado do painel de afiliado. Passa intacto. */
  hotmart: string;
  fonte: { titulo: string; url: string; consultadaEm: string };
};

export const CURSOS: Record<string, Curso> = {
  "guia-definitivo-cftv-v1": {
    id: "guia-definitivo-cftv-v1",
    nome: "Guia Definitivo do CFTV — Volume 1: Sistemas Analógicos",
    produtor: "Claudemir Martins",
    produtorQuem:
      "Começou como técnico eletricista e foi gerente de treinamento da Samsung Techwin para a América Latina, segundo a página de venda e as revistas do setor que ela cita. Vende pela Hotmart desde 2014.",
    tipo: "guia",
    formato: "E-book em PDF",
    publica: [
      { campo: "Escopo", valor: "Só CFTV analógico: DVR e câmeras AHD, TVI, CVI, CVBS e SDI. A própria página diz que não cobre câmera IP nem acesso remoto." },
      { campo: "Conteúdo", valor: "Cabos e distâncias, coaxial e crimpagem, fontes e corrente, aterramento e loop de terra, tipos de câmera, lentes, resolução, DVR (configuração, reset e senha), WDR e BLC, quadros por segundo e um projeto de exemplo." },
      { campo: "Garantia", valor: "7 dias" },
      { campo: "Acesso", valor: "Download, com as versões novas na mesma página" },
    ],
    lacunas: [
      "Quantas páginas o guia tem. A página diz \"centenas\".",
      "A data e o número da versão atual. A página diz que há atualizações, mas não diz quando saiu a última.",
      "CNPJ ou razão social do vendedor.",
    ],
    hotmart: "https://go.hotmart.com/R108162981L",
    fonte: {
      titulo: "Página de venda do Guia Definitivo do CFTV vol. 1 (aprendacftv.com)",
      url: "https://aprendacftv.com/guia-definitivo-do-cftv-v1/",
      consultadaEm: "2026-10-23",
    },
  },
};

export function curso(id: string): Curso | undefined {
  return CURSOS[id];
}

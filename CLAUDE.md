# Guia Produto na Lupa — contexto do projeto

Site de análises de tecnologia e acessórios, monetizado por afiliados da Amazon e
do Mercado Livre. Irmão do viagemnalupa.com.br, que é HTML estático puro e
compartilha a mesma família tipográfica.

**O site não testa produtos e não tem autor-pessoa.** Allan é o dono, mas não
aparece no site: nada é assinado com nome próprio, não há foto dele, e nenhuma
página diz ou sugere que alguém usou o produto. A autoria é da publicação
(`Organization` no JSON-LD, `site.editor` em `lib/site.ts`). Toda análise nasce
da documentação oficial do fabricante — ficha técnica, manual, termos de garantia.

No ar em https://guiaprodutonalupa.com.br

## Stack

Next.js 16 (App Router), React 19, Tailwind 4, TypeScript. `output: "export"` —
o build gera HTML estático em `out/`. Conteúdo em MDX no próprio repositório,
lido por `gray-matter` + `next-mdx-remote/rsc`. Sem CMS, sem banco.

## Publicação

Repositório `allangipa/guia-produto-na-lupa`, público. Push na `main` dispara
`.github/workflows/deploy.yml`, que builda e publica no GitHub Pages. Domínio
registrado na Hostinger, com quatro registros A do `@` apontando para os IPs do
GitHub Pages e CNAME de `www` para `allangipa.github.io`. O `ftp` na zona DNS é
da Hostinger e fica como está.

`public/.nojekyll` é obrigatório: sem ele o Pages ignora a pasta `_next` e o site
sobe sem CSS.

Repositório local em `C:\Users\allan\OneDrive\Documentos\GitHub\guia-produto-na-lupa`.
Fica dentro do OneDrive — confira `git fetch` antes de editar, sob risco de a cópia
local estar atrás do remoto.

## Estrutura de conteúdo

```
/                      home: guias, análises recentes, categorias
/categorias/<slug>     hub da categoria (noindex enquanto vazia)
/guias/<slug>          pilar "melhores X" — um pick por perfil de leitor
/comparativos/<slug>   duelo direto, vencedor definido por perfil
/reviews/<slug>        análise individual
/metodologia           critérios de nota e como o site ganha dinheiro
/sobre                 o que o site é, o método e o que ele não faz
```

Fluxo pretendido: a busca chega pelo guia, o guia manda para o comparativo ou a
análise, e o clique de afiliado acontece na análise, com o leitor já decidido.

Categorias em `lib/categorias.ts` (nove: tecnologia, acessórios e casa).
Cada peça declara `categoria:` no frontmatter. Só abrir categoria nova quando
houver três peças para ela; nunca publicar guia sem análise ou comparativo para
linkar.

Tipos do frontmatter em `lib/conteudo.ts` — se faltar campo, o build quebra.

## Regras editoriais (inegociáveis)

- **Nunca afirmar uso, teste ou medição.** Ninguém aqui teve o produto na mão.
  Está proibido escrever "usei", "testamos", "no uso", "depois de três semanas",
  "confirmado na prática" ou qualquer variação. Se um texto só faz sentido para
  quem tocou no produto, ele não pode existir neste site.
- **Todo dado sai de uma fonte listada.** Cada peça declara `fontes:` no
  frontmatter — página oficial, manual ou termos de garantia, com URL, o que
  saiu de lá e a data da consulta. O campo é obrigatório: sem ele o build quebra.
- **Número de fabricante é promessa, não fato.** Escrever "a marca declara X",
  nunca "o produto faz X".
- **A lacuna fica escrita.** O que a documentação oficial não informa vai para
  `lacunas` e aparece como "O que o fabricante não informa". Num site que não
  testa, essa seção é o produto editorial — é o único lugar com trabalho que o
  fabricante não fez por nós. Nunca preencher com estimativa.
- **Imagem só com licença conhecida.** Press kit do fabricante, Product
  Advertising API da Amazon ou banco com licença aberta. O tipo `Imagem` exige
  `credito` e `origem` para que não exista caminho fácil. Foto salva da página da
  loja ou do Google Imagens é infração de direito autoral e, nas lojas, violação
  dos termos do programa de afiliado.
- **Avaliação de comprador é matéria-prima, nunca conteúdo republicado.** Ler as
  avaliações das lojas e escrever a síntese com palavras próprias é legítimo;
  copiar texto ou nota de terceiro viola os termos das lojas e o direito autoral
  de quem escreveu. Nota de terceiro **nunca** entra em `aggregateRating` nem em
  nenhuma nota do site — isso rende ação manual do Google. O campo `relatos`
  exige `mencoes` e `totalLidas`: relato sem denominador é opinião fingindo ser
  dado.
- **Varejo não confirma nada.** Cinco lojas com o mesmo número são o texto do
  fabricante copiado cinco vezes. Só `regulador` (Anatel, INMETRO) e
  `laboratorio` contam como confirmação independente em `confirmadoPor`.
- Contras antes dos prós, no mesmo peso visual.
- Toda análise tem "não compre se você" — o veredito de exclusão é o que dá
  autoridade.
- Sem preço em texto: a Amazon só autoriza exibir preço via Product Advertising
  API, com horário da consulta.
- Nota editorial de 0 a 10 por critério ponderado, documentada em `/metodologia`.
  Os critérios avaliam só o que a documentação oficial permite julgar — não
  existe nota de durabilidade real, desempenho real ou conforto.

## Regras técnicas de afiliado

- Link da Amazon recebe a tag via `lib/site.ts`; o do Mercado Livre passa intacto,
  como o programa exige (nada de encurtador ou redirect interno).
- `rel="sponsored nofollow"` em todo link de loja.
- Máximo de três CTAs por página, sempre depois de uma entrega de valor.
- JSON-LD com `Product` + `Review` usando a nota editorial. **Sem
  `aggregateRating`** até existir avaliação real de leitores no site.
- Divulgação de afiliado acima da dobra em toda página de conteúdo.

## Identidade visual

Uma única cor de ação no site inteiro: verde-petróleo `#0F6E6C`. Tinta `#14181B`,
superfície `#F1F4F3`, linha `#DDE3E1`. Botão sólido só em CTA.

**Direção visual atual: loja de tecnologia clara.** Página com fundo cinza-claro
(`fundo`) e objetos brancos elevados sobre ele (`papel` + `.cartao`/`.painel`
com sombra). Cabeçalho em duas linhas: marca, busca grande central, ações;
abaixo, pílulas de navegação (`.pilula`). Home abre em produto: banner curto
com a tese e três números, depois uma prateleira por categoria com cinco cards
por linha. Cards levam mídia em cima (silhueta em escala enquanto não há foto
licenciada), badge de transparência por faixa (`faixa-bom/medio/baixo` — cor de
dado sobre a documentação, nunca sobre o produto) e três specs com ícone
(`components/icones.tsx`, `iconeDo`, `rotuloCurto`, `destaquesDa` em
`lib/specs.ts`). Títulos de interface em Archivo (`.titulo-ui`); Fraunces só
na marca, no banner e no texto corrido.

Os papéis de cor são separados e não se misturam — a regra da cor única só
funciona se nada além do CTA for verde:

- `acao` / `acao-forte` — **exclusivas do CTA**. Vencedor de linha em tabela usa
  `bg-realce` + peso, nunca cor de ação: dez marcas verdes num comparativo
  apagam o único botão da página.
- `ausente` — dado que o fabricante não publica. Neutro de propósito: ausência é
  constatação sobre a documentação, não defeito do produto.
- `atencao` — contras e divergência real entre fontes. Nunca para dado faltante.

Modo escuro com três estados (sistema, claro, escuro) em `components/tema.tsx`.
Os tokens mudam de valor, nunca de nome, para nenhum componente precisar saber
em que tema está. O script anti-flash no `<head>` roda antes da primeira pintura.

Duas larguras, e só duas: `--largura-prosa` (48rem) para texto corrido e
`--largura-ferramenta` (72rem) para buscador, comparador e categoria. A classe
`.dados` traz `tabular-nums`, sem o qual coluna de número não alinha as casas.

Fraunces nos títulos, Archivo na interface, IBM Plex Mono nos números — as mesmas
do viagemnalupa, de propósito, para os dois sites lerem como uma rede.

Marca: lupa com deerstalker, sem rosto. SVGs em `public/marca/` (símbolo e marca
horizontal, cada um em cor, mono e fundo escuro). `app/icon.svg` é o favicon.

Proibido no projeto: carrossel, contador regressivo, selo de oferta, pop-up,
banner lateral, qualquer animação automática. O site tem que parecer publicação,
não loja.

**A lista acima proíbe mecanismo de pressão de venda — e só isso.** Profundidade,
elevação, sombra, superfície colorida, faixa escura, ícone, gradiente e densidade
alta são permitidos e desejáveis: o site precisa parecer desenhado. Uma versão
anterior deste guia foi lida como "não ter estilo nenhum", e o resultado foi uma
página de filete de 1px sobre fundo branco, que ninguém confunde com publicação —
confunde com documento sem folha de estilo.

## Estado atual e próximos passos

- Conteúdo hoje é só demonstração, com produtos fictícios: um review, um
  comparativo e um guia, todos na categoria `energia`. **Apagar antes de publicar
  de verdade.** Servem como referência do formato: frontmatter com `fontes`,
  texto sem afirmação de uso e lacunas do que o fabricante omite.
- `contato@guiaprodutonalupa.com.br` está publicado em `/sobre`, `/metodologia` e
  no rodapé de toda análise. **A caixa precisa existir de verdade** — é o único
  canal de correção de um site sem autor-pessoa, e endereço morto derruba a
  credibilidade que o resto da estrutura tenta construir.
- Nenhuma análise tem imagem ainda. O suporte está pronto (`produto.imagem` +
  `components/foto-produto.tsx`), esperando press kit de fabricante real.
- A base tem duas categorias abertas, as duas tiradas dos mais vendidos da
  Amazon Brasil, não de palpite. **Fones de ouvido** (`dados/audio.json`): dez
  modelos, cada um com ASIN, link de loja e foto oficial. **Cozinha**
  (`dados/cozinha.json`, esquema `camposCozinha`): quatro airfryers — Walita
  NA341 e NA130, Mondial AFON-12L-BI, Philco PFR2200P — com guia e comparativo.
  A regra da categoria é separar `capacidadeTotalL` (a caixa) de
  `capacidadeUtilL` (o cesto), e registrar em `divergencias` quando a listagem
  da Amazon contradiz o fabricante (a NA341 tem duas: temperatura mínima e
  timer). Páginas da Philips/Walita, Philco e Mondial só entregam a tabela
  técnica com JavaScript — ler pelo navegador (`window.__STATE__` nas lojas
  VTEX), nunca por fetch simples. Powerbank foi aposentado porque os modelos
  catalogados não eram vendidos no Brasil; o esquema `camposEnergia` ficou em
  `lib/specs.ts`. Próximas categorias, na ordem da fila: tablets, periféricos,
  máquinas de lavar, casa conectada.
- **Fotos: imagem oficial do site do fabricante, hospedada em
  `public/produtos/`, decisão consciente do Allan.** Nunca da Amazon (contrato
  de Associados) nem do Google Imagens. Crédito visível sobre a imagem, página
  de origem em `imagem.origem`, remoção a pedido prometida em `/privacidade`.
  `npm run imagens` converte PNG/JPG para WebP (sharp) e reaponta as fichas —
  rodar sempre depois de baixar foto nova.
- Toda peça editorial (guia, comparativo, análise) precisa existir em pelo menos
  uma unidade: `output: export` recusa rota dinâmica vazia.
- `relatos` e `divergencias` **estão implementados e vazios**. Os componentes
  foram testados com dados temporários e renderizam certo, mas nenhum produto
  real tem esses campos ainda: Mercado Livre exige login para mostrar avaliações
  e a Anatel ainda não foi consultada. Preencher é pesquisa, não código.
- **Amazon Associates aprovado em 14/09/2026.** ID `guiaprodutona-20`, fixado
  como padrão em `lib/site.ts` (a variável de ambiente só sobrescreve). Prazo:
  **três vendas qualificadas até 13/03/2027**, senão a conta é encerrada. A
  Product Advertising API — que traz foto e preço licenciados — só libera depois
  das primeiras vendas; até lá, nada de preço em texto.
- O rodapé carrega a declaração exigida pelo contrato: "Como Associado da
  Amazon, … recebe por compras qualificadas". Não remover nem parafrasear.
- **Integração com a Creators API está pronta e desligada.**
  `scripts/amazon-sync.mjs` lê os ASINs de `dados/*.json`, chama `getItems`
  (OAuth via Login with Amazon, `x-marketplace: www.amazon.com.br`, lotes de
  10) e grava `dados/amazon/<ASIN>.json`; `lib/produtos.ts` anexa o resultado
  em `produto.amazon`, e mídia, card e ficha passam a mostrar foto licenciada
  (hotlink do CDN da Amazon) e preço com horário da consulta. O workflow chama
  o script antes do build e roda também todo dia às 06:00 UTC. **Para ligar:**
  criar os secrets `AMAZON_CLIENT_ID` e `AMAZON_CLIENT_SECRET` no GitHub.
  Sem eles, o script sai com 0 e nada muda. A pasta `dados/amazon/` é
  ignorada pelo git; `npm run amazon:simular` gera dados fictícios marcados
  para testar a interface, e o script recusa `--simular` em CI. Acesso à API
  exige 10 vendas qualificadas nos últimos 30 dias; cota inicial 1 req/s e
  8.640/dia.
- Falta ligar analytics. O evento `clique_afiliado` já dispara com loja, produto e
  posição do botão, pronto para Plausible ou GA4.
- Falta cadastrar o sitemap no Search Console.
- Confirmar no painel do Mercado Livre a janela de cookie vigente: as fontes
  públicas se contradizem (24 h e 30 dias).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

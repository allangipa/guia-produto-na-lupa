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

Repositório local em
`C:\Users\allan\GitHub\Site Guia Produto na Lupa\guia-produto-na-lupa`.
**Fora do OneDrive desde 14/09/2026**, e é para continuar assim.

O motivo, registrado para ninguém tentar voltar atrás: dentro do OneDrive o
`npm run build` falhava de forma intermitente com `EBUSY`. O OneDrive abria para
upload os arquivos que o Next acabava de escrever em `out/` e `.next/`, e o Next
quebrava ao tentar apagá-los na etapa de export. Confirmado pelo Restart Manager
do Windows: o dono do handle era o processo do OneDrive, e o arquivo travado
mudava a cada build — disputa de sincronização, não arquivo defeituoso.
Apontar `out/` para fora com `New-Item -ItemType Junction` também não resolve:
o OneDrive desfaz o ponto de reparo ao reiniciar e traz a pasta de volta para
dentro da sincronização. Testado e descartado.

A pasta tem espaços no caminho. Em PowerShell, use `-LiteralPath` e aspas; o
Git aceita o caminho entre aspas normalmente.

Ao lado do repositório, na mesma pasta `Site Guia Produto na Lupa`, está o
material inicial de 13/09/2026 — zips, artes da marca e o scaffold do Next, 102
arquivos, sem `.git`. É arquivo morto, não é cópia de trabalho. Não editar nada
ali achando que é o site.

Sai daqui um risco antigo de brinde: a cópia local não fica mais atrás do
remoto por causa de sincronização de nuvem. O Git é o único sincronizador.

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
- **Produto anunciado não é produto à venda.** Quem ainda não chegou às lojas
  leva `nasLojasEm` (data ISO da página do fabricante) em `dados/*.json`. O
  helper `aindaNaoSaiu` em `lib/specs.ts` compara com a data do build e então:
  o produto **sai da prateleira da home** (o lugar dele é o herói e "Próximos
  lançamentos"), ganha a pastilha "Nas lojas em DD/MM" no card e um aviso no
  topo da ficha. O aviso da ficha não depende de haver link de loja — o iPhone
  Duo não tem nenhum. `LojaCta` aceita `nasLojasEm` para guias e comparativos,
  onde o botão fica longe do cabeçalho do produto. **Quando a data passar,
  apagar o campo**; ele só existe enquanto é verdade.
- **Foto é foto, não é peça de publicidade.** A galeria do fabricante quase
  sempre mistura as duas coisas, e a segunda não entra: quadro com frase de
  venda impressa ("1400W DE POTÊNCIA", "JARRA INQUEBRÁVEL", "12 em 1"), selo
  de garantia, e principalmente **alegação de mercado**. Em 14/09/2026 as
  fotos principais do AOC 24G50F e do 27G50F eram o banner institucional da
  marca — monitor de tela apagada ao lado de um selo dourado "#1" e do texto
  "marca líder em monitores gamers no Brasil e no mundo". Num site cuja regra
  diz que "mais vendido é dado, não adjetivo", isso é o erro mais caro
  possível: alegação sem fonte, impossível de conferir, com aparência de dado.
  Foram trocadas por foto de produto da mesma página.
  **Auditar a folha de contato das fotos principais quando entrar marca nova.**
  Continuam na base, conscientemente, dois tipos mais brandos: nome e tamanho
  do modelo no papel de parede da tela (Samsung, Motorola, Lenovo), que é
  fotografia de produto normal; e as tarjas de especificação da LG e das
  Philco ("12L", "6,5L", "1ms (MBR)", "144Hz O/C"). **Estas últimas são
  dívida**, porque repetem justamente os números que o site existe para
  qualificar — o "12L" é a caixa, não o cesto; o "1 ms" é MBR, não GtG. Trocar
  quando houver foto limpa do fabricante; hoje Philco e LG não publicam uma.
- **"Mais vendido" é dado, não adjetivo.** A frase só pode aparecer onde o
  ranking da Amazon consultado está escrito com data e fonte — hoje isso é o
  subtítulo dos guias, que listam a lista e a data em `fontes`. Na home a
  prateleira chama "Fichas de *Categoria*": ela mostra cinco de dez, na ordem
  do arquivo, e em Celulares os primeiros são lançamentos em pré-venda, então
  "os mais vendidos" ali afirmaria mais do que o dado sustenta. O título
  errado esteve no ar entre o redesenho e a correção, no mesmo 14/09/2026.
  Para voltar a usar a frase na home seria preciso gravar
  `rankingAmazon { posicao, lista, consultadoEm }` em cada produto e ordenar
  a prateleira por ele.

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

**Direção visual atual: loja de tecnologia clara**, refeita em 14/09/2026
sobre a referência de layout de e-commerce que o Allan mandou (MegaMart):
cabeçalho com a **marca horizontal em tamanho de marca** (`marca-horizontal.svg`,
h-11/h-12 — o símbolo sozinho era "pequeno demais"), busca grande, chips de
categoria em toda largura; **herói escuro** (`.faixa`) com o lançamento do
momento — produto, datas do fabricante e CTA, sem carrossel e sem contagem;
tira com a tese e três números; fileira de **categorias em círculo** com a
foto do primeiro produto; uma prateleira por categoria (cinco cards, título
"Fichas de *Categoria*" com a palavra em cor de ação e traço embaixo);
tiles de **marcas que mais publicam a ficha**; rodapé **sólido
em `acao-forte`**. O trilho lateral (estilo Mercado Livre) foi removido a
pedido do Allan por duplicar os chips do cabeçalho; o conteúdo usa a
largura inteira. O que a referência tem e aqui não entra: carrossel com
setas, "% OFF", preço riscado, contador. Página com fundo cinza-claro
(`fundo`) e objetos brancos elevados sobre ele (`papel` + `.cartao`/`.painel`
com sombra). As classes `.so-claro/.so-escuro` usam `display` e anulam o
`hidden` do Tailwind — para esconder por largura, envolver num wrapper. Cards levam mídia em cima (silhueta em escala enquanto não há foto
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
  (`dados/cozinha.json`, esquema `camposCozinha`): dez airfryers, as dez
  primeiras do ranking de Air Fryers da Amazon Brasil em 14/09/2026 (Walita
  NA341, NA230 e NA130, Mondial AFON-12L e AFN-50, Philco PFR2200P, PAF40A e
  PAF65A, Oster OFRT520, WAP Barbecue), com guia e comparativo. A Elgin
  Facilita Fry (5ª do ranking) ficou de fora por decisão do Allan: a Elgin
  não lista o modelo no próprio site, e sem página oficial não há foto
  licenciável — **produto sem foto oficial não entra**. Fryer analógica leva
  `naoSeAplica: ["funcoesPredefinidas"]`. Meta da categoria: 20, quando o
  Search Console mostrar tráfego.
  A regra da categoria é separar `capacidadeTotalL` (a caixa) de
  `capacidadeUtilL` (o cesto), e registrar em `divergencias` quando a listagem
  da Amazon contradiz o fabricante (a NA341 tem duas: temperatura mínima e
  timer). Páginas da Philips/Walita, Philco e Mondial só entregam a tabela
  técnica com JavaScript — ler pelo navegador (`window.__STATE__` nas lojas
  VTEX), nunca por fetch simples. Powerbank foi aposentado porque os modelos
  catalogados não eram vendidos no Brasil; o esquema `camposEnergia` ficou em
  `lib/specs.ts`. Próximas categorias, na ordem da fila: tablets, periféricos,
  máquinas de lavar, casa conectada.
- **Celulares** (`dados/celular.json`, esquema `camposCelular`) abriu em
  14/09/2026 com a linha iPhone de 2026: 18 Pro, 18 Pro Max, 17, Air e Duo,
  tudo das páginas de especificações da Apple Brasil (`apple.com/br/.../specs/`,
  HTML estático — lê por fetch). `bateriaMah`, `memoriaRamGb` e `garantiaMeses`
  contam para a transparência de propósito: a Apple nunca publica os três, e
  isso é dado. Em 14/09 entraram cinco Android dos mais vendidos (Galaxy A17
  e A57, Moto g06 e g86, POCO X8 Pro), lidos nas lojas oficiais (Samsung Shop
  e Motorola são VTEX — `window.__STATE__`; Xiaomi é `mi.com/br/.../specs`).
  As tabelas das lojas oficiais têm erro: a Samsung troca os campos de carga
  do A57 (fica `null`, com a explicação na fonte), a Amazon lista "371
  quilogramas" para o g06. Android sem carga sem fio leva
  `naoSeAplica: ["cargaSemFioW"]` — ausência declarada não é omissão. Fotos vêm do Apple Store (`store.storeimages.cdn-apple.com`),
  só com a URL exata — mudar `wid`/`hei` dá 404. Pro Max usa a mesma foto do
  Pro. O Duo não tem ASIN ainda (pré-venda em 16/10); `lojas: {}` é aceito e o
  CTA some sozinho.
- **Tablets** (`dados/tablets.json`, esquema `camposTablet`) abriu em 14/09
  com dez modelos do ranking de Tablets da Amazon: Galaxy Tab A11+, S10 Lite,
  S10 FE e A11, Redmi Pad 2, Xiaomi Pad 7, Lenovo Idea Tab e Idea Tab Plus,
  Huawei MatePad SE 11 e iPad (A16). Ficaram de fora VAIO TL10 (sem página
  no site da VAIO) e Positivo. Fontes: Samsung Shop tem uma API JSON pública
  (`shop.samsung.com/br/api/catalog_system/pub/products/search?ft=...`,
  sem "+" na busca) que devolve `allSpecifications` — mais confiável que o
  `__STATE__`; Xiaomi só publica Redmi Pad 2 e Pad 7 em `mi.com/global`, e
  isso fica escrito na fonte; Lenovo abre só no navegador. Campo que
  diferencia a categoria: `canetaInclusa` (na caixa, não "compatível") e
  `atualizacoes` (só a Lenovo declara). Quando o fabricante se contradiz
  (Xiaomi Pad 7: "sem adaptador" e "adaptador" na mesma página), o campo fica
  `null` com a explicação na fonte.
- **Monitores** (`dados/monitores.json`, esquema `camposMonitor`) fechou a
  fase 1 em 14/09 com dez do ranking de Monitores da Amazon: LG 24G411A,
  27G411B, 24MS500, 24GS60F e 20U401A; AOC 24G50F, 27G50F e 22B35HM23;
  Samsung Essential S3 24" 120 Hz e Odyssey G5 32". Ficaram de fora Haiz,
  BRX e 3green (sem página oficial) e o Samsung S3 100 Hz (LS24D300, que a
  Samsung Shop não lista mais — entrou o LS24F320 de 120 Hz no lugar).
  Fontes: LG tem a "Especificação chave" no fim da página (abrir no
  navegador, rolar, **não clicar em nada** — um botão "mais" leva para outra
  página); AOC linka de aoc.com.br para `detalhesdoproduto.com.br/a/...`,
  páginas de campanha sem brilho/contraste/portas; Samsung pela API JSON.
  O par de campos `tempoRespostaMs` + `medidaResposta` existe porque GtG e
  MPRT/MBR não são a mesma medida — a LG escreve que o MBR de 1 ms escurece
  a tela e desliga o FreeSync, e isso vai para a ficha.
- **Liquidificadores** (`dados/liquidificadores.json`, esquema
  `camposLiquidificador`) abriu em 14/09 com dez do ranking de Liquidificadores
  de Bancada da Amazon: Mondial L-99 FB, L-550-B e L-900 FB; Oster OLIQ610;
  Britânia BLQ1300P; Walita RI2242 e RI2110; Philco PH900; Electrolux
  EBL1000; Arno LQ19. O campo que define a categoria é `capacidadeUtilL`,
  como na airfryer — seis das dez publicam. Fontes: todas VTEX
  (`window.__STATE__`), com o mesmo padrão `?map=ft` para achar a URL.
  Divergências fartas: a Amazon lê o nome do modelo como potência (Philco
  PH900 → "900 W", real 1200), lista a capacidade útil como se fosse a do
  copo (Walita RI2242 → "2 L", real 3 L de copo) e erra a potência da
  Mondial (500 vs 550 W); a Electrolux se contradiz na própria página
  ("1000W" no título, "a partir de 900 W" na tabela) e o campo fica `null`.
  A categoria `cozinha` passou a se chamar **Airfryers** na tela, mantendo a
  URL `/categorias/cozinha/` que o Google já indexou.
- **Cafeteiras** (`dados/cafeteiras.json`, esquema `camposCafeteira`) abriu em
  14/09 com dez **elétricas de filtro** do ranking da Amazon: Oster OCAF300,
  OCAF600 e OCAF650; Electrolux ECM10, ECM20, ECM22, ECM25 e ECM30; Mondial
  C-30-18X-FB; Britânia BCF19B. Só filtro de propósito — cápsula (Nespresso,
  TRES) tem ficha de outro tipo (pressão em bar, reservatório) e vira
  categoria própria; italiana/moka não tem ficha elétrica nenhuma. O eixo é
  a **xícara de 40 ml**: os campos `capacidadeL`, `xicaras` e `mlPorXicara`
  andam juntos porque "38 xícaras" é 1,5 L. Só Oster (escreve o asterisco
  "*xícara de 40ml") e Britânia (publica litros e cafezinhos na mesma tabela)
  permitem a conversão. A Mondial tem um campo "Quantidade em ML por xícara"
  preenchido com "Não se aplica"; a Electrolux não publica potência do ECM30.
  Site da Black+Decker Brasil está fora do ar — os dois modelos deles ficaram
  de fora por falta de foto oficial.
- **`/transparencia`** é o ranking por marca: média das notas de transparência
  dos produtos de cada fabricante, com os campos mais omitidos e uma tabela
  por categoria. Calculado no build a partir de `dados/*.json` — não tem
  texto editorial por marca, de propósito: a nota mede documentação, não
  produto, e a página repete isso. Linkado no trilho, no cabeçalho, no
  rodapé e no sitemap.
- **Lançamentos na home** vêm de `lib/lancamentos.ts`: produto da base em
  pré-venda, com datas declaradas pelo fabricante e a fonte escrita. Sem
  contagem regressiva. Quando a data de loja passar, tirar da lista — o
  produto continua na categoria.
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

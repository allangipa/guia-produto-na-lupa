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

### O `out/` gerado no Windows não serve para publicar

O build local grava errado os arquivos de prefetch do roteador, e só no
Windows. Verificado em 20/09/2026, Next 16.3.5.

O cliente do Next pede `__next.categorias.$d$slug.__PAGE__.txt` — nome único,
com pontos no lugar das barras. Quem monta esse nome é
`convertSegmentPathToStaticExportFilename`, em
`shared/lib/segment-cache/segment-value-encoding.js`, e ela faz
`segmentPath.replace(/\//g, '.')`: troca **barra normal**. No Windows, o
`path.relative` que alimenta essa função devolve `\`, a troca não acha nada, e
o `path.join` seguinte transforma as barras invertidas em pastas. Resultado:
`__next.categorias/$d$slug/__PAGE__.txt`, que o navegador nunca pede.

Sintoma: cerca de cinco 404 por página no console, só ao servir o `out/` local.
Repare que `__next._full.txt` sai correto — ele tem um separador só, e por isso
o defeito passa despercebido numa olhada rápida.

Não afeta o site publicado: o `deploy.yml` builda em `ubuntu-latest`, onde o
separador é `/`. Conferido no ar em 20/09/2026 — o nome achatado responde 200,
a pasta aninhada dá 404, e nenhuma página no domínio tem 404 de prefetch.

Duas consequências práticas:

1. **Nunca subir um `out/` buildado aqui.** Publicação é só por push na `main`.
2. Esses 404 no servidor local são ruído conhecido. Não gastar tempo com eles
   de novo, e não "consertar" nada no repositório por causa deles — o defeito
   é do Next, não nosso.

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
- **A categoria fecha no número que a documentação permite, não numa meta.**
  Decisão do Allan em 18/09/2026, ao ver que o ranking de acessórios é
  dominado por vendedor de marca branca sem página de fabricante: *"uma
  categoria com 12 fichas bem apuradas vale mais que 20 com 8 que não se
  sustentam"*. Encher a categoria com produto sem documentação faz a nota de
  transparência virar ficção — ela mede o que o fabricante publica, e sem
  fabricante não há o que medir. Quando uma categoria parar abaixo do alvo,
  **escrever na página quantos produtos ela tem e por que parou ali**: é a
  mesma transparência que o site cobra das marcas. Antes de concluir que não
  dá, procurar o nó mais fundo da árvore de mais vendidos da Amazon — o nó
  genérico de Carregadores tinha 7 marcas em 30, e o de Carregadores
  Portáteis, 22 em 30.
- Contras antes dos prós, no mesmo peso visual.
- Toda análise tem "não compre se você" — o veredito de exclusão é o que dá
  autoridade.
- Sem preço em texto: a Amazon só autoriza exibir preço via Product Advertising
  API, com horário da consulta.
- Nota editorial de 0 a 10 por critério ponderado, documentada em `/metodologia`.
  Os critérios avaliam só o que a documentação oficial permite julgar — não
  existe nota de durabilidade real, desempenho real ou conforto.

  **Os pesos, desde 25/09/2026, e eles são públicos:**

      30%  O que a especificação entrega
      25%  Transparência da documentação   ← o eixo do site
      20%  Compatibilidade e limites
      15%  Garantia e suporte no Brasil
      10%  Materiais e construção declarados

  Transparência pesa mais aqui do que pesaria numa publicação que testa
  produto, de propósito. Materiais pesa menos porque é o critério que a
  documentação sustenta pior: quase toda ficha é omissa ali, e critério em que
  todos empatam em branco carrega pouca informação.

  **A nota não se digita.** É derivada dos critérios em `notaPonderada()`, e
  `nota:` não existe mais no frontmatter. Os pesos moram em `PESOS_CRITERIOS`,
  em `lib/conteudo.ts`, e `verificarCriterios()` quebra o build quando falta
  critério, sobra critério, o nome não é um dos cinco, o peso não é o publicado
  ou a soma não dá 1.

  **Por que isso existe:** até 25/09 a `/metodologia` prometia que "a nota não
  é média simples" e que "o peso fica escrito na análise", e as duas frases
  eram falsas. Não havia campo de peso em lugar nenhum, e em seis das oito
  análises a nota era exatamente a média simples. Pior: o Philips TAT1109 tinha
  critérios somando 2,80 e nota publicada de 4,2 — 50% de inflação no produto
  pior avaliado da base, e inflado na direção do fabricante. Hoje vale 3,0.
  Número que é função de outros números não se escreve à mão.
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
- **Um CTA por produto por página**, e todo CTA depois de uma entrega de valor.
  Exceção declarada: o review repete o mesmo produto duas vezes, depois do
  veredito e depois dos prós e contras.
- **Máximo de três blocos de CTA por página.** Num guia, os botões das escolhas
  contam como **um** bloco: ficam todos juntos em "Onde comprar cada um", depois
  do corpo e das lacunas.
- **Dentro de um produto com mais de uma loja**, só o primeiro botão é sólido;
  as outras lojas levam contorno, porque são alternativas para a mesma compra.
  **Entre produtos diferentes, todos os botões são sólidos.** Na seção "Onde
  comprar cada um" de um guia cada botão é a resposta para um perfil de leitor;
  pôr quatro com contorno diria que aquelas quatro recomendações valem menos.

  Tentado ao contrário em 26/09/2026, com a regra de "uma cor de ação por
  página" aplicada ao bloco inteiro, e desfeito no mesmo dia — o Allan viu na
  tela que o "Comprar na Amazon" tinha duas aparências no site.
- A linha de comissão (`DivulgacaoComissao`) aparece **uma vez por bloco**, não
  uma vez por botão. Nunca uma tela com botão e sem ela.
- JSON-LD com `Product` + `Review` usando a nota editorial. **Sem
  `aggregateRating`** até existir avaliação real de leitores no site.
- Divulgação de afiliado acima da dobra em toda página de conteúdo.

#### Por que o teto virou "três blocos" e não "três botões"

A regra dizia "máximo de três CTAs por página", e foi escrita no primeiro commit
do repositório, antes de o formato de guia existir. Em 25/09/2026 a contagem
mostrou que **os 27 guias passavam dela**, de 4 a 8 CTAs, e que os outros tipos
de página ficavam em 2.

A causa não era descuido: um guia rende um botão por escolha, e a escolha é o
produto. Um botão a mais num review é pressão sobre o mesmo produto; um botão a
mais num guia é o próximo produto da lista. O número antigo tratava as duas
coisas como iguais.

Decisão do Allan: reescrever a regra em vez de cortar 64 dos 145 botões. Nenhuma
regra externa entra aqui — o Operating Agreement da Amazon não limita quantidade
de link, e a política do Google mira página de afiliado sem conteúdo próprio, não
contagem de botão. O que a regra protegia era o leitor: não ser interrompido
antes da entrega e não ser empurrado pelo mesmo botão três vezes. Os limites
acima protegem isso, e o de cor sólida resolve o que a contagem nem via — oito
botões verdes em fila apagavam os oito.

### Auditoria semanal dos links — `npm run afiliados`

Decisão do Allan em 25/09/2026: rodar **uma vez por semana**, "para não ficarmos
com produtos no nosso site que não existem na Amazon ou outro afiliado".

`scripts/afiliados-cobertura.mjs` checa cinco coisas, e sai com código 1 nas
quatro que são erro de fato:

1. **Link publicado que não existe na base.** Um ASIN dentro de um `lojas:` de MDX
   que não corresponde a produto nenhum de `dados/`. Foi o que aconteceu em
   25/09/2026 com o WAP GTW Inox 50: ASIN escrito de memória, pego antes do
   commit. **Link de afiliado se copia da base, nunca se digita.**
2. **ASIN repetido** em dois produtos — quase sempre link colado na ficha errada.
3. **Conteúdo com link desatualizado.** O front matter carrega o link em cópia,
   não por referência: quando um produto ganha link na base depois de a peça sair
   no ar, a escolha publicada fica com `lojas: {}` e sem botão, enquanto a página
   do produto tem um. Aconteceu duas vezes em 25/09/2026, no comparativo
   WAP Magic × GTW Inox 50 e na escolha do Arno Drygliss FS31.
4. **Chave de loja** fora de `LOJAS` em `lib/site.ts`. O build já quebra nesse
   caso, mas com mensagem que não diz qual produto.
5. **Cobertura**, que não é erro e sim fila de pesquisa: quantos produtos estão
   sem link, por categoria, e quais deles já foram citados em conteúdo publicado
   — esses são os que doem, porque o leitor viu a recomendação e não tem onde
   comprar. Produto com `nasLojasEm` no futuro e produto com `buscaDeLoja` dos
   últimos trinta dias saem da fila: o primeiro não pode ter link, o segundo já
   foi procurado.

Produto sem link **continua na base**. As contas dos guias ("13 das 24 publicam
sucção") medem o mercado, não o nosso estoque de comissão; tirar da amostra o que
não dá comissão trocaria em silêncio a pergunta que o site faz.

## Identidade visual

Uma única cor de ação no site inteiro: verde-petróleo `#0F6E6C`. Tinta `#14181B`,
superfície `#F1F4F3`, linha `#DDE3E1`. Botão sólido só em CTA.

**Direção visual atual: loja de tecnologia clara**, refeita em 14/09/2026
sobre a referência de layout de e-commerce que o Allan mandou (MegaMart):
cabeçalho com a **marca horizontal em tamanho de marca** (`marca-horizontal.svg`,
h-11/h-12 — o símbolo sozinho era "pequeno demais"), busca grande, chips de
categoria em toda largura; **herói escuro** (`.faixa`) com o lançamento do
momento — um produto só, com datas do fabricante e CTA, sem rodízio e sem
contagem;
tira com a tese e três números; fileira de **categorias em círculo** com a
foto do primeiro produto; uma prateleira por categoria (cinco cards, título
"Fichas de *Categoria*" com a palavra em cor de ação e traço embaixo);
tiles de **marcas que mais publicam a ficha**; rodapé **sólido
em `acao-forte`**. O trilho lateral (estilo Mercado Livre) foi removido a
pedido do Allan por duplicar os chips do cabeçalho; o conteúdo usa a
largura inteira. O que a referência tem e aqui não entra: herói que troca
sozinho, "% OFF", preço riscado, contador. Página com fundo cinza-claro
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

Proibido no projeto: **movimento automático de qualquer tipo**, contador
regressivo, selo de oferta, pop-up e banner lateral. O site tem que parecer
publicação, não loja.

**O que está proibido é o automático, não o mecanismo** — decisão do Allan em
14/09/2026, corrigindo uma versão anterior desta lista que proibia "carrossel"
sem qualificar. Carrossel operado pelo leitor pode: seta que avança porque
alguém clicou, trilho que rola porque alguém arrastou, miniatura que troca a
foto porque alguém escolheu. O que não pode é a peça andar sozinha: sem
intervalo de tempo, sem avanço automático, sem laço infinito, sem nada que
mude na tela enquanto a pessoa está lendo. A diferença não é estética, é de
quem está no controle — carrossel automático existe para mostrar o que o site
quer mostrar, não o que o leitor pediu.

Mesma lógica para "pop-up": o proibido é a camada que aparece sozinha e
interrompe. Camada aberta pelo leitor, que fecha no Esc, no botão e no clique
fora, é ferramenta.

**A galeria da ficha (`components/galeria-produto.tsx`)** segue essa regra:
trilho de miniaturas à esquerda, foto grande à direita, e tela cheia no clique
com as miniaturas do outro lado — o padrão da Amazon, pedido pelo Allan.
Nada gira sozinho e a tela cheia não aparece sozinha nem vende nada. Numa
ficha que não testa produto, ver a foto de perto é metade do que o leitor tem.
Setas do teclado trocam a foto, a rolagem do fundo trava enquanto está aberta
e o foco volta para o botão que abriu. Abaixo de `sm` o trilho desce para
baixo da foto, senão sobraria menos de 300 px para a imagem.

**A lista acima proíbe mecanismo de pressão de venda — e só isso.** Profundidade,
elevação, sombra, superfície colorida, faixa escura, ícone, gradiente e densidade
alta são permitidos e desejáveis: o site precisa parecer desenhado. Uma versão
anterior deste guia foi lida como "não ter estilo nenhum", e o resultado foi uma
página de filete de 1px sobre fundo branco, que ninguém confunde com publicação —
confunde com documento sem folha de estilo.

## Estado atual e próximos passos

- **O conteúdo de demonstração com produtos fictícios já foi apagado.** Tudo
  que está publicado tem fonte oficial declarada.
- **Inventário em 26/09/2026: 423 produtos em 27 categorias, 27 guias,
  44 comparativos e 18 análises.**

  Esta linha já esteve errada aqui duas vezes. Em 14/09 dizia "70 produtos, 7
  guias, 8 comparativos e 1 review"; em 25/09 foi corrigida para 463 produtos
  mas manteve "7 guias e 14 comparativos", que já eram 27 e 44. **Conferir
  contando os arquivos antes de confiar nesta linha**, e atualizá-la ao mexer
  na base:

      python -c "import json,glob;print(sum(len(json.load(open(f,encoding='utf-8'))) for f in glob.glob('dados/*.json')))"

  O funil desenhado em "Estrutura de conteúdo" é guia → comparativo → análise,
  com o clique de afiliado acontecendo na análise, com o leitor já decidido.

  **O gargalo de largura fechou.** As 27 categorias têm peça editorial — em
  25/09 eram 12. O que sobrou é profundidade: 18 análises para 44 comparativos,
  e o funil desenhado acima termina na análise.

  **Antes de abrir categoria nova, escrever análise.** Guia ranqueia para
  "melhores X" e comparativo para "X ou Y", mas quem está a um passo de
  comprar pesquisa o modelo — e é essa página que converte.

  E há uma leitura do Allan que vale registrar, de 25/09: **ele prefere
  comparativo a análise**, porque "não temos os produtos em mãos". A regra não
  proíbe a análise — as 18 publicadas nasceram só de documentação, como os
  comparativos —, mas o comparativo é ficha contra ficha e não sugere posse em
  momento nenhum. Ao propor peça nova, propor comparativo por padrão.

- **Dez produtos da base estão sem o campo `categoria`.** Aparecem na contagem
  de 423 e não na de 413 por categoria. Não foram investigados; fica anotado.
- **Produto sem link de afiliado sai da base.** Decisão do Allan em 26/09/2026,
  depois que a caça de links levou a cobertura de 76% para 91%: "os que não
  estão no site da Amazon pode apagar no site". Saíram 40 produtos, 120 arquivos
  de imagem e as entradas deles em `lib/variantes.json` — imagem e manifesto
  andam juntos, senão o guard de `variantes-conferir.ts` quebra o build.

  **Apagar produto é reescrever texto publicado.** Os guias contam fichas ("13
  das 24 publicam vazão"), e cada remoção muda todo número de contagem da
  categoria. Os 40 exigiram 60 reescritas em 5 guias, 2 comparativos e 1
  análise, mais a troca de uma escolha publicada — o WAP Turbo 1600 era o pick
  de "maior sucção" e saiu da base, e o lugar passou para o WAP GTW 55. Ao
  apagar produto, rodar a conferência de números antes de commitar.

  A exceção é produto em pré-venda, que não pode ter link por não ter sido
  lançado: `nasLojasEm` no futuro fica. Hoje é só o iPhone Duo.

  **O que isso custou, e fica registrado para não se esquecer:** a amostra
  passou a ser "o que a Amazon vende", e não "o mercado". Em secadores isso
  encolheu a Taiff de 20 para 10 fichas, e a força do achado "0 de 20 publica
  peso" caiu junto. Allan ofereceu repor com produtos novos em vez de apagar;
  fica como trabalho seguinte, começando por secadores e batedeiras, que foram
  as que mais encolheram.
- `contato@guiaprodutonalupa.com.br` está publicado em `/sobre`, `/metodologia` e
  no rodapé de toda análise. **A caixa precisa existir de verdade** — é o único
  canal de correção de um site sem autor-pessoa, e endereço morto derruba a
  credibilidade que o resto da estrutura tenta construir.
- Nenhuma análise tem imagem ainda. O suporte está pronto (`produto.imagem` +
  `components/foto-produto.tsx`), esperando press kit de fabricante real.
- **As duas primeiras categorias**, abertas em 14/09/2026 e mantidas aqui como
  referência de método — as duas saíram dos mais vendidos da Amazon Brasil, não
  de palpite. Hoje são 27; o que segue descreve como as primeiras nasceram, e a
  regra de escolher por ranking continua valendo para as próximas. **Fones de ouvido** (`dados/audio.json`): dez
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
- **Aspiradores** (`dados/aspiradores.json`, esquema `camposAspirador`) tem
  **TRÊS campos de capacidade**, e não um: `capacidadeTotalL` (o balde),
  `capacidadeUtilL` (o que cabe de sólido) e `capacidadeUtilLiquidosL`. São
  três porque aspirador de pó e água tem duas capacidades úteis diferentes, e
  três dos quatro que publicam separam as duas — forçar um número só seria
  escolher pelo fabricante.

  Até 25/09/2026 havia um campo só, `capacidadeReservatorioL`, e o site
  repetia o número do nome do produto. A reapuração das 24 fichas mostrou a
  razão entre o que cabe e o que o nome anuncia:

      Britânia BAS87        20 L no nome,   5 L úteis  →  25%
      WAP Cyclone Max      2,5 L no nome,   1 L útil   →  40%
      WAP Robot W1000      600 ml,        260 de pó    →  43%
      WAP GTW Inox 50       50 L no nome,  31 L úteis  →  62%
      WAP Turbo 1600        25 L no nome,  17 L úteis  →  68%
      os quatro robôs                                  → 100%

  O W1000 é o que mais engana: os 600 ml são a **soma** do tanque de água (350)
  com o depósito de pó (260).

  **O achado da categoria é sobre quem publica sucção.** Watt é o que o motor
  consome; vácuo é o que o bocal faz. Dos 24, dezessete declaram vácuo: **WAP
  em 15 de 15, Midea em 2 de 2, e Electrolux, Philco e Britânia em 0 de 7.**
  Sem esse número não dá para saber se um Philco de 2.000 W puxa mais que um
  WAP de 450 — e puxa menos: 22.000 Pa do WAP Magic contra 20.000 do GTW Inox
  70 Duo, que tem 2.000 W.

  Sete fichas ficaram só com o total migrado, sem útil, porque a página oficial
  não respondeu. Ver a lista em "Páginas de fabricante que morreram".

- **Páginas de fabricante que morreram, ou publicam a ficha errada.** Levantado
  em 25/09/2026 ao reapurar aspiradores, e vale como aviso para qualquer
  categoria — fonte oficial não é permanente:

      britania-bas1010p   devolve o título genérico da loja
      electrolux-stk17    idem
      philco-pas1810      redireciona para a página de categoria
      philco-pas4000v     abre, mas não renderiza linha de capacidade
      midea-powerdust     a ficha traz "Capacidade BTU: 9.000 BTU" —
                          especificação de ar-condicionado numa página
                          de aspirador

  Quando a fonte cai, o campo fica em branco e a lacuna fica escrita. Não se
  substitui por varejo: cinco lojas com o mesmo número são o texto do
  fabricante copiado cinco vezes.

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
- **`divergencias` está em uso, e virou um dos melhores campos da base.** Em
  26/09/2026 são **94 registros em 24 categorias** — cozinha 12, secadores 11,
  batedeiras 9, liquidificadores 7. Aparecem na ficha sob o título "Onde as
  fontes não batem", via `components/divergencias.tsx`.

  A regra que se firmou no uso: **o valor publicado pelo fabricante fica na
  ficha, e a contradição fica à vista ao lado dele.** Corrigir o fabricante a
  partir da nossa leitura — de uma foto, de outro trecho da página, do bom senso
  — seria substituir a fonte pela nossa interpretação. A exceção é número
  impossível, que não é dado: aí o campo fica vazio e a divergência explica por
  quê, para ninguém "preencher a lacuna" depois com o valor descartado. Os dois
  casos estão no `arno-mini-chef-400`, um de cada.
- `relatos` **está implementado e vazio**. O componente foi testado com dados
  temporários e renderiza certo, mas nenhum produto real tem o campo: Mercado
  Livre exige login para mostrar avaliações e a Anatel ainda não foi consultada.
  Preencher é pesquisa, não código.
- **Amazon Associates aprovado em 14/09/2026.** ID `guiaprodutona-20`, fixado
  como padrão em `lib/site.ts` (a variável de ambiente só sobrescreve).

  **O prazo foi cumprido.** O painel de ganhos em 25/09/2026 mostrava **3
  produtos pedidos e 3 enviados**, R$ 44,57 em comissão, 44 cliques e 6,82% de
  conversão no mês. As três vendas qualificadas que a conta precisava até
  13/03/2027 aconteceram em duas semanas, e a conta deixou de estar em risco.

  A taxa de 6,82% é alta para conteúdo de afiliado, mas 44 cliques é amostra
  pequena demais para cravar — a direção é boa, o número não é medida.

  **A Product Advertising API continua fechada.** São dois limiares diferentes:
  3 vendas para manter a conta (cumprido) e **10 vendas qualificadas nos
  últimos 30 dias** para liberar a API. Até lá, nada de preço em texto.

- **O botão diz "Comprar na Amazon", e não "Ver preço".** Decisão do Allan em
  25/09/2026, depois de olhar o Promobit. A cláusula da Amazon é sobre EXIBIR
  preço e sobre não se passar pela loja — não há regra sobre o verbo. A linha
  de divulgação abaixo do botão continua dizendo que o preço muda e que quem
  manda é o da loja; é ela que impede o botão de virar promessa. O motivo está
  escrito no docstring de `components/loja-cta.tsx`.
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
- **Medição de audiência: fiação pronta, desligada.** `site.umami` em
  `lib/site.ts` lê `NEXT_PUBLIC_UMAMI_ID`; sem ele o layout não renderiza
  script nenhum e o site sobe sem medir nada. A variável já está declarada no
  workflow. Para ligar: criar o site em `cloud.umami.is` e pôr o ID em
  *Settings → Secrets and variables → Actions → Variables*.
  `components/loja-cta.tsx` dispara o clique de afiliado para Umami, Plausible
  e `dataLayer` ao mesmo tempo, e cada um só age se existir — trocar de
  ferramenta não exige mexer em componente.
  **Escolha sem cookie de propósito:** com cookie, a LGPD exige banner de
  consentimento, e banner é a camada que aparece sozinha e interrompe, que é
  o que este site não faz nem quando é ele mesmo pedindo.
  **O que o Search Console já resolve, não precisa de script:** impressão,
  clique, posição e termo de busca por página. A pergunta "qual categoria tem
  tráfego" se responde lá, de graça. O que ele não dá, e só a medição dá, é
  clique no botão de afiliado.
  **A Hostinger não serve:** ela é só registradora e DNS deste domínio; o
  tráfego vai direto para o GitHub Pages e não passa por ela.
- Falta cadastrar o sitemap no Search Console.
- Confirmar no painel do Mercado Livre a janela de cookie vigente: as fontes
  públicas se contradizem (24 h e 30 dias).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

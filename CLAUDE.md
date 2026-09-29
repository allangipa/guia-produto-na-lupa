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

  **Nota não se cita por posição.** Escrever "a segunda mais alta do site" numa
  análise cria uma afirmação que a próxima análise torna falsa, sem ninguém
  tocar no arquivo. Aconteceu em 26/09/2026: a ST27 dizia "a segunda mais alta",
  a torradeira WAP entrou com 6,98 e empurrou a ST27 para terceiro no mesmo
  commit. Onde a comparação importa, **nomear o produto** ("empatada com a da
  cafeteira Oster OCAF300") — isso só fica falso se aquele produto mudar.
  E conferir por código, porque a nota exibida arredonda: 6,875 e 6,900 aparecem
  as duas como "6,9" e não são a mesma posição.

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
- **Inventário em 29/09/2026: 709 produtos em 36 categorias, 36 guias,
  56 comparativos e 44 análises.**

  Esta linha já esteve errada aqui duas vezes. Em 14/09 dizia "70 produtos, 7
  guias, 8 comparativos e 1 review"; em 25/09 foi corrigida para 463 produtos
  mas manteve "7 guias e 14 comparativos", que já eram 27 e 44. **Conferir
  contando os arquivos antes de confiar nesta linha**, e atualizá-la ao mexer
  na base:

      python -c "import json,glob;print(sum(len(json.load(open(f,encoding='utf-8'))) for f in glob.glob('dados/*.json')))"

  O funil desenhado em "Estrutura de conteúdo" é guia → comparativo → análise,
  com o clique de afiliado acontecendo na análise, com o leitor já decidido.

  **Os dois gargalos fecharam.** As 30 categorias têm guia, comparativo **e
  análise** — em 25/09 só 12 tinham qualquer peça, e em 26/09 ainda havia 17
  categorias sem análise nenhuma. Hoje são 38 análises para 50 comparativos, e
  o funil desenhado acima termina na análise em toda categoria.

  **Antes de abrir categoria nova, escrever análise.** Guia ranqueia para
  "melhores X" e comparativo para "X ou Y", mas quem está a um passo de
  comprar pesquisa o modelo — e é essa página que converte. A regra continua
  valendo para a próxima categoria que abrir: ela nasce com as três peças.

  E há uma leitura do Allan que vale registrar, de 25/09: **ele prefere
  comparativo a análise**, porque "não temos os produtos em mãos". A regra não
  proíbe a análise — as 18 publicadas nasceram só de documentação, como os
  comparativos —, mas o comparativo é ficha contra ficha e não sugere posse em
  momento nenhum. Ao propor peça nova, propor comparativo por padrão.

- **A peça editorial leva de volta para a ficha, desde 26/09/2026.** O caminho
  ficha → peça foi aberto mais cedo no mesmo dia; a volta não existia. Medido
  antes: os 27 guias linkavam para a ficha das escolhas deles, e **nenhum dos 44
  comparativos e nenhuma das 19 análises** linkava para ficha nenhuma. A peça
  citava o número, dizia de qual fonte ele saiu, e não dava ao leitor como
  chegar aos outros vinte campos da mesma ficha.

  `components/leva-a-ficha.tsx` entra depois das lacunas nas duas: quem acabou
  de ler "o que o fabricante não informa" tem como pergunta seguinte o que ele
  informa. O rótulo carrega o contador de campos ("15 de 22 campos") porque
  "ver a ficha" não diz o que se ganha ao clicar — e o contador fala na mesma
  unidade do selo de transparência do topo da página.

  **Não é CTA e não usa cor de ação**, logo não conta para o teto de três blocos
  por página. Num site que não testa produto a ficha campo a campo não é
  apêndice: é a matéria-prima do texto, e é onde moram as divergências entre
  fontes e a data de cada consulta. Mandar o leitor conferir é parte do método.

- **Escovas secadoras abriu em 26/09/2026, com 26 fichas de quatro marcas.**
  Saiu do nó "Escovas Rotativas" do ranking da Amazon, onde 27 dos 30 mais
  vendidos são de marca com página oficial. Mondial 7, Philco 8, Britânia 7,
  Cadence 4.

  **Não entra aqui a escova alisadora** (esquenta as cerdas, não sopra ar, 47 a
  75 W) nem a escova térmica passiva. São três produtos com a mesma palavra no
  nome, lado a lado no mesmo ranking, e as fichas não se comparam.

  **O achado da categoria é que a ficha quase não existe.** Vinte e uma das 26
  declaram exatamente 1.300 W, e os campos que decidiriam a compra estão todos
  em zero: pontas na caixa (0 de 26), diâmetro da escova (0), revestimento (0),
  jato de ar frio (0), comprimento do cabo (0). O "4 em 1" mora no nome do
  produto — e a Britânia BEC05T diz "4 em 1" no título e "3-em-1" no próprio
  endereço da página.

  **Philco e Britânia publicam 2,9 campos de 16, em média; Mondial 5,7 e
  Cadence 6,0.** O contraste está dentro da própria casa: as mesmas Philco e
  Britânia publicam temperatura, velocidade, grade removível, íons e cabo na
  ficha de SECADOR. O molde existe e não foi aplicado à escova.

  A Cadence usa **quatro unidades diferentes no campo "Consumo"** das quatro
  escovas que vende — 39 kWh/mês, 36 kWh/mês, "1,2 KW/H" e "1,2 kWh" —, e a
  ESC710 e a ESC720 têm a mesma potência e discordam entre si por um fator de
  trinta.

- **Abrir categoria nova exige mexer em quatro lugares**, e dois deles quebram
  o build com mensagem clara: `lib/specs.ts` (o Campo[] e o registro em
  `camposPorCategoria`), `lib/categorias.ts` (a entrada e a ordem),
  **`lib/departamentos.ts`** (sem isso a categoria não aparece na navegação e o
  build para) e `dados/<slug>.json`. Mais as três peças editoriais que a regra
  do projeto pede.

- **Processadores abriu em 26/09/2026, com 17 fichas de quatro marcas.**
  Mondial 7, Philco 4, Britânia 3, Arno 3.

  **O achado é o "X em 1".** A Mondial vende o MESMO MPN-01 como 5 em 1, 7 em 1
  e 9 em 1, em duas cores — seis páginas — e as seis fichas são idênticas campo
  a campo, incluindo a frase que descreve as funções. As FOTOS oficiais mostram
  conjuntos de acessórios diferentes, então os produtos diferem de verdade; o
  que não existe é a diferença escrita em campo. **Isso torna a falta pior, não
  melhor** — e é assim que o guia escreve.

  A Arno é o contraponto na mesma categoria: vende MP62 "16 funções" e MP72
  "24 funções" e lista o conteúdo da embalagem peça por peça, quatro contra
  sete. Só 3 fichas em 17 listam, e as três são Arno.

  **Philco e Britânia não têm campo de potência em processador.** Nenhuma das
  sete fichas delas. O watt vive no título. Campos preenchidos: Mondial 11,0 e
  Arno 10,0 contra Philco 2,8 e Britânia 2,7 — a maior distância entre marcas
  já medida neste site.

  Mas elas ganham um crédito que o guia dá: **as cinco únicas fichas que
  declaram trava de segurança são Philco ou Britânia.** Num motor que gira
  lâmina exposta, é o campo mais consequente — e Mondial e Arno não o têm.

- **Mixers abriu em 26/09/2026, com 20 fichas de quatro marcas.** Mondial 7,
  Britânia 5, Philco 5, Elgin 3. **Mixer não é batedeira** — dividem o mesmo nó
  do ranking da Amazon e não têm um campo em comum. A batedeira tem tigela e
  fica na bancada; o mixer vai dentro da panela.

  **O eixo da categoria é o par total × útil do copo**, que é o mesmo truque da
  air fryer (caixa × cesto) e do aspirador (balde × útil). Nove fichas declaram
  o mesmo copo de 1.050 ml; **duas dizem quanto cabe dentro** — 800 ml, 24% a
  menos — e as duas são Philco. O caso mais claro é a PMX1000: jarra de 1,2 L
  com 600 ml úteis, e copo de 950 ml com os mesmos 600. A jarra é 26% maior por
  fora e não rende um mililitro a mais.

  **A Mondial responde 12,0 campos de 16 nesta categoria** — e é também a que
  mais se contradiz: o M-15 em três cores tem três fichas que discordam sobre
  haver botão de liga-desliga e sobre o aparelho triturar ou misturar.

  **Aqui estava escrito que 12,0 era "o número mais alto já medido neste site em
  qualquer categoria", e era falso** — conferido em 26/09/2026 contra a base
  inteira. A Apple responde 19,3 campos de 23 em celulares, a Motorola 18,5, a
  Samsung 18,3 de 24 em tablets e a LG 16,9 de 21 em monitores. Eletroportátil
  publica menos que eletrônico, e média de marca não se compara entre categorias
  com número de campos diferente. **Superlativo de categoria se confere contra
  `dados/*.json` inteiro antes de escrever.**

- **O campo "consumo" é armadilha de mercado, e o site já caiu nela.** Em
  26/09/2026, quatro fichas de sanduicheira publicavam `consumoKwh` com um
  valor que era exatamente a potência dividida por mil — Cadence SAN400 e
  SAN260, Oster OGRL230 e OGRL610. Não é consumo: consumo depende de quanto
  tempo o aparelho fica ligado. Era o watt renomeado, e **este site o
  republicou como se fosse um segundo dado**. Os quatro campos foram
  esvaziados com a divergência escrita.

  Em 26/09/2026 o mesmo padrão apareceu em **cinco de doze torradeiras**, de
  três marcas — Electrolux ETS10 e TOP70, Oster OTOR600 e OTOR650 e Cadence
  TOR200 —, e os cinco campos foram esvaziados do mesmo jeito. O guia da
  categoria creditava a Oster por "publicar até o consumo separado, 0,75 e
  0,65 kW/h", elogiando o número falso; o trecho foi reescrito. **A contagem
  pune quem acerta:** a WAP WTE1, ficha mais completa da categoria, não tem o
  campo, e por isso parecia publicar um dado menos que as cinco erradas.

  O erro é do mercado, não de uma marca: Philco, Britânia, Arno, Electrolux,
  Oster e Cadence fazem isso, em secador, batedeira, sanduicheira, grelha,
  torradeira e ferro — a Philips Walita traz "Consumo 1,47" para 1470 W e
  "Consumo 1,4" para 1400 W. Mas a
  mesma Cadence publica "36,00 kWh/mês" no grill GRL200 e "24,00 kWh/mês" na
  sanduicheira SAN405, que são contas certas — as duas formas convivem no
  mesmo catálogo, com fator de trinta entre elas. **Ao apurar qualquer
  categoria, conferir se o campo de consumo é potência/1000 antes de
  publicá-lo.**

  Em 26/09/2026 o padrão reapareceu em **ferro, torradeira e cooktop**, e a
  Oster OTOP100 acrescentou uma variação nova: **"37,50kWh (127V) / 60,00W
  (220V)"**. A primeira metade é uma conta certa — 1.250 W por trinta horas —, e
  a segunda é o mesmo cálculo com a unidade trocada por watt. Quando o campo
  parecer uma conta de verdade, **conferir as duas metades**: as trinta horas
  não estão escritas em lugar nenhum da ficha.

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
  peso" caiu junto.

  **Os 40 saíram de CINCO categorias, não duas** — secadores 17, batedeiras 10,
  aspiradores 8, lavadoras de alta pressão 3 e ferros 2. As duas primeiras foram
  repostas de manhã e as outras três só à tarde, depois que o Allan pediu a
  reposição de novo e a conferência mostrou que faltavam. **Ao apagar produto,
  anotar todas as categorias afetadas**, senão as menores somem da conta.

  **As cinco estão repostas em 26/09/2026**, com marca nova em vez de
  mais modelos das mesmas, e voltaram ao tamanho de antes da remoção:
  **batedeiras 26 → 40** (7 Mondial, 3 Oster, 1 Philco, 1 Electrolux, 2 Arno) e
  **secadores 28 → 45** (7 GA.MA Italy, 4 Mondial, 2 Philco, 2 Britânia,
  2 Elgin); **aspiradores 16 → 24** (2 Mondial, 2 Britânia, 2 WAP, 1 Electrolux,
  1 Kärcher); **lavadoras de alta pressão 23 → 26** (3 Kärcher); **ferros 22 → 24**
  (2 Philips Walita). Entraram cinco marcas que a base não tinha: Mondial e Oster
  em batedeiras, GA.MA Italy e Elgin em secadores, Kärcher em lavadoras e
  aspiradores, Philips Walita em ferros. O casamento foi feito pela página oficial
  primeiro e pelo ASIN depois — a Amazon vende variantes de cor que o
  fabricante não documenta, e essas ficaram de fora.

  **A reposição achou o que a remoção tinha deixado para trás.** O guia de
  batedeiras ainda contava Philco 10 e Britânia 10 na tabela de marcas; o de
  secadores dizia "quarenta e cinco" no subtítulo e "28" nas lacunas, na mesma
  página, e a seção de contradições descrevia três produtos que já tinham
  saído da base. Os dois comparativos de secadores estavam inteiros com os
  números de antes. **Ao mexer no tamanho de uma categoria, reconferir também
  os comparativos e as análises dela, não só o guia.**
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

- **Purificadores de AR foram investigados em 26/09/2026 e NÃO abrem.** Fica
  registrado para não se gastar a pesquisa de novo.

  **Zero das sete marcas brasileiras com catálogo vende um purificador de ar
  documentado** — Electrolux, Philco, Britânia, Midea, Mondial, WAP e Consul,
  todas zero. A Electrolux vende o **filtro HEPA de reposição** para um
  purificador de ar que não lista mais: o consumível sobreviveu à página do
  produto.

  **Existe uma ficha documentada no país**: a Xiaomi Smart Air Purifier 4 Lite,
  em `mi.com/br`, e ela é boa — área de cobertura de 25 a 43 m², **PM CADR de
  360 m³/h** e ruído de ≤ 61 dB(A). O CADR é o eixo que a categoria teria: mede
  o ar limpo entregue por hora, contra os m² que o anúncio estampa. Uma marca
  não é categoria: sem segunda ficha não há comparativo nem contagem, e a nota
  de transparência mediria uma amostra de um.

  **O ranking é de importador sem página.** LEVOIT, Purivortex, MOOKA,
  FULMINARE, Tailulu, Priestley e Ropo lideram; `levoit.com.br` e
  `coway.com.br` não resolvem. O nó mistura quatro produtos — purificador,
  umidificador/aromatizador, ozonizador e desumidificador — e vários anúncios
  declaram a área em **pés quadrados** ("1.035 pés²", "1.680 pés²"), listagem
  americana traduzida sem adaptar.

  **Quando reabrir a investigação:** se alguma das marcas brasileiras voltar a
  listar purificador de ar, ou se a Xiaomi passar de um modelo. O esquema já
  está desenhado na cabeça do problema: CADR, área em m², ruído, classe do
  filtro (H11/H13), vida útil do refil e consumo.

- **CFTV (câmeras e gravadores) abriu em 29/09/2026 com 21 fichas e as três
  peças**: guia `dvr-para-casa`, comparativo MHDX 1304 × Hikvision
  DS-7204HGHI-K1 e análise do MHDX 1316. Foi apurada para o /simulador montar o
  projeto de câmeras com produto de verdade (DVR, câmera, HD em TB, fonte em A).
  10 DVRs (7 Intelbras, 3 Hikvision) e 11 câmeras cabeadas Intelbras.

  **Desde 29/09/2026 a categoria tem também os acessórios do projeto**: 9 HDs
  de vigilância (WD Purple 1–8 TB, Seagate SkyHawk 1–6 TB), 4 cartões microSD
  WD Purple (Intelbras) e 7 fontes Intelbras (EF 1201L a EF 1210+, e as fontes
  nobreak EFB 1201 e EFB 0501). Ficaram em CFTV, e não em `armazenamento`, porque
  o guia de armazenamento conta "7 fichas" em quase todo parágrafo. Achados:
  **as duas marcas de HD prometem 64 câmeras e 180 TB/ano, e as duas coisas
  não cabem no mesmo ano** (a WD define a câmera como 3,2 Mb/s: 64 delas escrevem
  ~807 TB/ano); **a EF 1205 promete 20 câmeras de 300 mA com 5 A de saída**
  (6 A — campo vazio, divergência); as fontes saem com 12,8 V ± 5% e parte das
  câmeras Intelbras declara aceitar até 13,2 V; os dois datasheets de HD não
  declaram rotação. O cartão WD Purple de 32 GB é o 1º mais vendido de microSD
  na Amazon; o datasheet declara 500 ciclos de gravação, e o simulador calcula a
  vida útil com isso.

  **O modo Full HD só vale para câmera da lista.** A Intelbras publica, num PDF
  à parte, as câmeras compatíveis com a gravação em 1080p cheio da linha 13xx.
  Das seis câmeras 1080p da base, a VHD 3220 Full Color+ (B e D) e a VHD 1230
  Full Color MIC não estão — com elas o gravador grava 1080p Lite mesmo com o
  modo ligado. O datasheet do MHDX 1304 diz o contrário ("todas as câmeras
  intelbras com resolução full hd"); os do 1308 e do 1316 remetem à lista, e
  vale a lista. O simulador avisa (`MODO_FULL_HD_13XX` em
  `lib/simulador-cameras.ts`) — ao entrar câmera Intelbras nova, conferir se
  ela está no PDF.

  **O eixo é o "1080p" que o DVR grava.** A Intelbras define no rodapé do
  datasheet: 1080p Lite é **960 × 1080**, metade da largura da câmera Full HD.
  A série 1000-C e os três Hikvision K1 não gravam 1920 × 1080 em canal
  nenhum. A linha MHDX 13xx grava — no "modo Full HD", que **desliga a
  detecção de pessoas e as câmeras IP a mais** (escrito no datasheet). O MHDX
  1316 grava 1080p cheio em só 8 dos 16 canais, a 10 qps. O campo
  `gravacao1080p` guarda isso por extenso, e o simulador pergunta ao leitor o
  que ele prioriza e diz como configurar.

  **Os dois DVRs Intelbras mais bem ranqueados na Amazon estão
  descontinuados** pela tabela comparativa da própria Intelbras (MHDX 1004-C
  e 1016-C), e a página de produto deles redireciona para Ajuda e Downloads.

  **A Amazon não tem nó de DVR.** O MHDX 1008-C ranqueia em Interfones
  Residenciais, o 1308 em DVD Players e Gravadores. Posição em nós diferentes
  não se compara; a seleção seguiu séries completas de 4/8/16 canais. Nas
  câmeras cabeadas, as 20 mais bem colocadas que apareceram nas buscas são
  todas Intelbras.

  **Onde mora cada dado Intelbras:** datasheet em PDF (`backend.intelbras.com`,
  baixa por curl; o `www` devolve 403 fora do navegador e os links de PDF só
  aparecem depois de a página renderizar), garantia no manual (1 ano = 90 dias
  legais + 9 contratuais), **HD máximo na "Tabela comparativa de gravadores
  2025"** (o datasheet remete a outro documento) e **distância máxima de cabo
  coaxial no manual da câmera**, não no datasheet. Hikvision: página
  `hikvision.com/pt-br` em HTML estático (curl funciona), duas das três em
  inglês; garantia na tabela de Troca Expressa — **24 meses para DVR série 72,
  o dobro da Intelbras**. Leia tabela de datasheet pelo PDF renderizado quando
  o layout em colunas embaralhar: aconteceu com três câmeras e com o iMHDX 3108.

  Datasheets que se contradizem, registrados em `divergencias`: VHD 3220 D é
  "câmera bullet analógica" no título e dome na tabela; as Full Color+ se
  chamam "analógica" no título e declaram HDCVI/AHD/HDTVI; as 3220 Full Color+
  têm "Full Color" no nome e "Função Luz Branca: –" na tabela (campo vazio).

- **O simulador de automação ficou completo em 29/09/2026**, e casa conectada
  foi de 8 para 44 fichas: Intelbras 19 (linha Mibo Smart — interruptores Wi-Fi e
  Zigbee, relés ECW, controle MCR, central Zigbee MCA 1002, sensores, módulo de
  portão, detector de fumaça, acionador de cortina, fechaduras MFR), Positivo 10,
  TP-Link Tapo 5, Nova Digital 4, Ekaza 1. Campos novos: `precisaHub`,
  `precisaNeutro`, `teclas`, `alimentacao`, `alcanceM`, `dispositivosHub`.

  **A regra do motor é "um aplicativo só"**: escolhe o app que cobre mais peças
  do projeto e avisa onde entra um segundo. App vem do campo `appProprio`; ficha
  que não nomeia herda o app mais comum da marca (a Intelbras tem dois de
  verdade: Mibo Cam na câmera, Mibo Smart no resto).

  **Achado que vira resposta na tela: nenhum interruptor com ficha declara
  dispensar o neutro.** Os que respondem declaram precisar; para quem não tem
  neutro, a lista manda para a lâmpada inteligente. **Funcionar sem internet é
  raro por escrito**: MCR 1001 e MCP 1001 declaram PRECISAR de internet; a
  central MCA 1002 declara que os Zigbee seguem sem ela.

  **Ficaram de fora, e por quê:** Nova Digital LITE, WS-US8, NFZB-3 e o hub
  HNZ-PRO3 (fotos oficiais com selo "Powered by tuya"/"Works with Alexa"); Elgin
  (foto com celular e logo montados ao lado do produto — **decisão pendente do
  Allan**); Nova Digital ZC-GM42 (foto com a caixa); Tapo H100 e interruptores
  Tapo (sem anúncio nacional ou só 100–120 V); sensores 433 MHz da Positivo (sem
  anúncio); Tuya/Zemismart/Sonoff (sem página oficial no Brasil).

  **Cada peça da lista mostra até 3 opções da base** (`OPCOES_POR_ITEM` em
  `lib/simulador-lista.ts`), decisão do Allan: a indicada com o porquê, as outras
  com o que muda, para o visitante ter escolha. No bloco de compra, agrupadas por
  peça, cada produto uma vez. **Sem link para busca geral da Amazon** — mostraria
  produto sem ficha. O Allan confirmou em 29/09/2026 que a comissão vale para
  outra compra feita na Amazon depois do clique no link do site.

- **Nobreaks abriu em 29/09/2026, com 18 fichas de sete marcas** — Intelbras 4,
  Ragtech 4, TS Shara 3, SMS 3, JBR 2, NHS 1, Coletek 1 — e as três peças: guia
  `nobreak-para-casa`, comparativo Attiv 600 × Attiv Seno 700 e análise do XNB
  720. Apurada para o /simulador pôr nobreak de verdade no projeto de câmeras.
  Saiu do nó No-Breaks para Computador da Amazon (16364776011), que mistura
  nobreak com DPS, estabilizador e bateria avulsa.

  **O eixo é VA contra watt.** 14 das 18 declaram fator de potência 0,5: o
  "600 VA" entrega 300 W. **Só 9 declaram os watts**; nas outras nove, os watts
  do anúncio não saem do fabricante — a Amazon lista "Potência máxima: 1400
  Watt" para os TS Shara de 1400 VA, e o título do Ragtech NEP 3200 diz
  2.240 W que a Ragtech não publica. O NHS Mini 4 declara 600 VA, fator 0,5 e
  "250 W contínuos": a conta dá 300, que a ficha chama de pico.

  **O segundo eixo é a onda e a fonte com PFC ativo.** 13 das 18 não são
  senoide, com cinco nomes para a mesma coisa (semissenoidal, senoidal por
  aproximação, senoidal modificada, PWM, retangular). Só 3 autorizam fonte PFC
  por escrito, 4 desaconselham e 11 não dizem. A ficha do Attiv 600 lista
  "computador desktop" como ideal e avisa no rodapé contra fonte PFC.
  **Não escrever "a maioria das fontes tem PFC ativo"**: não há fonte listada
  que sustente; a frase da casa é "muitas fontes têm, e a etiqueta diz".

  **Autonomia só vale com a carga.** 5 de 18 dão a carga em watts; 6 dão em
  aparelhos; 7 não dão nada. O manual do XNB 720 tem 16 cenários, 6 de CFTV
  (60 min com 8 câmeras de IR ligado) — e dá ao XNB 1440, com o dobro de
  bateria, menos minutos em dois cenários. O simulador indica o XNB 720 quando
  ele cabe, por ser o único que declara watts e autonomia com câmeras.

  **Ficaram de fora:** Ragtech NEP 600 e NEP 1200 (17º do ranking), porque a
  única foto na página da Ragtech é a caixa com frase de venda. A Coletek SAFE
  1200 tem duas versões com o mesmo nome e as mesmas fotos (7 e 9 Ah); o
  anúncio é a SAFE1200BK, conferida pelo número da peça. A JBR é importadora
  (o manual diz), o site é `jbrenergy.com.br` e os PDFs ficam no Google Drive.
  Desde 29/09/2026 o simulador pergunta também **o que precisa dar para ver**
  em cada distância (degraus DORI da IEC 62676-4) e escolhe a câmera pelos
  pixels por metro que o ângulo e a resolução declarados dão ali — e avisa
  quando o DVR em 1080p Lite grava metade disso. Ver `docs/simulador.md`.

- **Cooktops de indução abriu em 26/09/2026, com dezesseis de seis marcas** —
  Electrolux 4, Midea 3, Dako 3, Oster 3, Philco 2, Britânia 1. Dako é marca
  nova na base. Todas as fichas vieram de catálogo VTEX
  (`/api/catalog_system/pub/products/search?ft=`), inclusive `www.dako.com.br`.

  **O eixo é a soma das zonas contra a potência total.** A Electrolux IE4TW é a
  única de quatro bocas que publica zona por zona: 1.900, 1.800, 1.800 e
  1.900 W, que somam **exatamente** os 7.400 W declarados — e cada uma vai a
  2.000 W em boost, o que daria 8.000. Não é erro de conta da marca: a central
  de potência reparte o que tem, e o boost de uma boca sai de outra. **O que
  nenhuma das dezesseis fichas escreve é essa frase**, e sem ela quem lê quatro
  zonas de 2.000 W conclui que pode usar as quatro assim.

  A Electrolux IC30 leva ao extremo: **três campos de potência com 3.700 W,
  3.600 W e 1.800 W na mesma ficha**, mais "1.800W a 2.800W (x2)", que colocaria
  duas zonas em 5.600 contra um total de 3.600. Publicamos o do campo chamado
  total.

  **Seis das dezesseis não publicam um único watt**, e duas delas são Electrolux
  de quatro bocas — a mesma marca da IE4TW, mesmo ano, mesmo modelo de página.
  A IE60P também não traz prazo de garantia.

  **Cegueira complementar, de novo** — o mesmo padrão de ar-condicionado,
  purificadores e furadeiras. Electrolux publica potência por zona (2 de 4) e
  zona flexível em campo (1 de 4), e nunca disjuntor nem detector de panela.
  Dako publica detector de panela (3 de 3) e disjuntor (2 de 3), e nunca a
  potência de zona nenhuma. Dako responde 13,3 campos de 16 por ficha, contra
  10,8 da Electrolux e **4,0 de Philco e Britânia**.

  **Três fichas em dezesseis dizem qual disjuntor a instalação pede:** Dako
  Select 40 A, Dako Diplomata 32 A, Midea CYAD11 20 A. Num aparelho de 7.400 W
  a 220 V são 34 ampères, e treze fichas deixam o comprador descobrir na hora.
  A Dako Supreme, do mesmo catálogo e com os mesmos 7.200 W da Select, **não
  traz o campo** — nem o de acabamento da mesa.

  Achados avulsos que valem para outras categorias:

  - A Midea E3 Even Pro declara **7.400 W nos três campos de tensão**, 127 V,
    220 V e bivolt, com "Tipo de tomada: Não Informado". A 127 V seriam 58 A. O
    campo de tensão ficou vazio: não dá para saber pela página em que tensão o
    produto é vendido.
  - A Midea FreeZone tem o campo **"Potência (220v)" preenchido com "220v"** e o
    campo "Frequência (Hz)" com **"A obter dados. Aguarde alguns segundos e
    experimente cortar ou copiar novamente"** — a mensagem de erro da área de
    transferência do Windows. Os dois juntos dizem como a ficha foi montada.
  - A Philco PCT05IFP declara **9300w no endereço da página** e em campo nenhum.
    Mesmo caso do "3-em-1" na URL da Britânia BEC05T.
  - **Philco e Britânia trazem "Tripla chama: Não"** nas três fichas — campo de
    queimador a gás num cooktop que não tem chama. O molde do fogão foi
    aplicado à indução e trouxe a ausência de um recurso irrelevante enquanto
    deixou de fora potência, níveis, timer e trava. As fotos oficiais mostram
    que a Philco PCT10A e a Britânia BCTE10A são **o mesmo aparelho com
    logotipos diferentes**: mesmo painel, mesmos seis programas na serigrafia.
  - A Dako tem o campo **"Potência dos Queimadores" preenchido com "9 níveis"**
    na Diplomata e na Select — o único campo que diria a potência de zona,
    ocupado pela contagem do controle, que já está no campo de baixo.
  - **As três Oster repetem a armadilha do consumo.** OTOP402: 6.000 W e
    "Consumo 6.0kW/h". OTOP202: 1.800/3.000 W e "1,8kW/h / 3.0kW/h". A OTOP100
    é o caso novo: **"37,50kWh (127V) / 60,00W (220V)"** — a primeira metade é
    uma conta certa de 1.250 W por 30 horas, a segunda é 60 kWh escrito em
    **watt**. Nenhuma das três declara as trinta horas.
  - A Midea CYAD11 declara nos campos avulsos **"Produto Profundidade (cm): 380"**
    — milímetro com rótulo de centímetro, um cooktop portátil de 3,8 metros. O
    campo consolidado da mesma página diz 4 × 29,5 × 38 cm.

  **Zona flexível: 1 ficha em 12 declara em campo** (Electrolux IE8FB). Outros
  quatro produtos trazem "Zona Flex", "FreeZone" ou "Zona Flexível" no nome e em
  campo nenhum — mesma régua do "X em 1" dos processadores.

  **A Britânia BCT04P ficou de fora**: única de quatro bocas da marca, sem
  anúncio na Amazon. Sai pela regra de 26/09. Cooktop a gás e vitrocerâmico
  elétrico também não entram: não têm zona, nem nível de potência, nem dependem
  de panela ferrosa.

  **Erro pego antes de publicar:** a ficha em `/cooktop-de-inducao-4-zonas-com-
  unicook-flexivel-preto-electrolux--ie8fb-/p` é o modelo **IE8FB**
  (B083X6799Y), e eu tinha pareado com o ASIN do IE80P (B082FQCN5W). São
  produtos diferentes no mesmo catálogo. **Link de afiliado se confere contra o
  título do anúncio, não contra o slug da página do fabricante.**

  **Foto rejeitada na auditoria:** a principal da Oster OTOP202 e a da Philco
  PCT05IFP eram peças de campanha com texto de venda sobreposto ("COOKTOP 2 EM
  1... Pode ser utilizado no formato embutido", "FUNÇÃO TURBO", "AQUECIMENTO POR
  INDUÇÃO"). Trocadas por foto de produto da mesma página. As três Dako, marca
  nova, passaram limpas.

- **Furadeiras e parafusadeiras abriu em 26/09/2026, com treze de quatro marcas** —
  Mondial 5, WAP 4, Bosch 2, Philco 2. Departamento novo: **Ferramentas**.

  **O eixo é torque contra voltagem, e a prova está numa ficha só.** A Mondial
  vende a FPF-05 com o nome **"Parafusadeira Recarregável 48V"** e a tabela
  técnica da mesma página declara **"Voltagem da bateria: 4,8V"** — o mesmo
  número com a vírgula apagada. O anúncio na Amazon escreve 4,8V: o varejo
  acertou e o nome do fabricante não. Para escala, ela declara 3 Nm; a
  parafusadeira a bateria mais forte da base tem 12 V e declara 30 Nm.

  **E o watt também não mede força.** Dois produtos da mesma linha da WAP:
  WF-700K10 com **700 W e 40 Nm**, EFPI-1000 com **1.000 W e 9 Nm**. Os dois
  giram a 3.000 rpm; o que muda é a redução, e o watt não registra redução.

  **Cegueira complementar de novo:** torque aparece em 5 de 13 fichas (Mondial 2,
  WAP 3) e diâmetro de perfuração em 5 de 13 (WAP 3, Bosch 2). **Só a WAP
  WF-700K10 publica os dois.** A Bosch, referência técnica da categoria, publica
  CINCO diâmetros de perfuração por produto — madeira, concreto, aço, tijolo e
  alvenaria — e nenhum torque nas furadeiras de tomada: ela reserva o torque para
  as parafusadeiras a bateria.

  **A maior concentração de campo-com-valor-errado já encontrada:** Mondial
  PI-10MA com "Torque: Sim", Mondial FI-RH-01M com "Velocidade: Sim", Philco
  PPF120MF com "Tensão da bateria: Bivolt" — bateria não é bivolt, o valor é do
  carregador. Três divergências em treze fichas, mais a do 48V.

  **Fontes:** Mondial, WAP e Philco por API VTEX. **Bosch exige o número de
  pedido de cada produto** (`/br/pt/products/<slug>-<numero>`) e um clique em
  "Mostrar mais" para abrir a faixa de perfuração — não responde a consulta em
  lote, e por isso entraram só dois modelos. **Black+Decker, DeWalt, Makita e
  Vonder** aparecem no ranking e não têm catálogo que responda. **Martelete não
  entra:** encaixe SDS e energia de impacto em joules, outra ficha.

  **Os anúncios sem marca lideram as duas listas** e declaram "48V", "36V",
  "Torque 32Nm" e "Torque 55Nm" nos títulos. Sem página de fabricante não entram
  — e o guia diz isso, apontando que a única ficha da categoria que explica de
  onde sai um "48V" é a da Mondial, que diz 4,8.

- **Purificadores de água abriu em 26/09/2026, com dezessete de cinco marcas** —
  Electrolux 5, Consul 5, IBBL 3, Midea 2, Philco 2.

  **O eixo é a vida útil do refil, e ela vem em duas unidades que brigam.** Oito
  fichas em dezessete publicam. A Consul é coerente: 1.500 L em 6 meses e 2.250 L
  em 9 meses dão os mesmos **250 litros por mês** nos cinco modelos. A IBBL dá os
  **mesmos 6 meses** a um refil de 2.000 litros e a dois de 3.000 — para fechar, a
  casa de um beberia 333 L/mês e a do outro 500. **Nenhuma das 17 publica o
  consumo diário que o prazo assume.** O litro é o número honesto; o mês é o litro
  já dividido por uma suposição não escrita.

  **O segundo eixo é reservatório × taxa de reposição**, o mesmo desenho da air
  fryer. Compressor repõe 1,2 a 1,4 L/h; pastilha eletrônica repõe 0,2 a 0,27 —
  seis vezes menos, com o mesmo rótulo "água gelada". O Electrolux PA31G leva
  **4 horas** para reencher 0,8 litro.

  **As marcas são cegas em lugares complementares**, como no ar-condicionado:
  Consul publica o refil em 5 de 5 e a taxa de resfriamento em 0 de 5; Electrolux
  publica a taxa em 5 de 5 e o refil em 0 de 5. Quem quer os dois não tem ninguém.

  **Philco é o piso da base:** 4 campos de 19. Não publica reservatório, taxa,
  refil, classe de filtragem, consumo, peso nem medidas — num aparelho que filtra
  a água que a casa bebe.

  **Fontes:** todas VTEX — `loja.electrolux.com.br`, `www.consul.com.br` (71
  campos, a mais rica), `www.midea.com.br`, `www.ibbl.com.br` (a profundidade
  varia muito entre modelos da mesma marca: Viváx 17 campos, Novo E-Due 30),
  `www.philco.com.br`. A **ABNT NBR 16098** entra como fonte `regulador`: P de
  partícula, C de cloro, B de bactéria, cada letra com o nível. **Ficaram de
  fora** bebedouro de garrafão, que não liga na rede, e os filtros de parede e
  torneira da Lorenzetti, cujo site não responde à API.

  **Campo com valor de outro campo, de novo:** as cinco Electrolux trazem
  "Consumo de energia (kW/h): 0,075 Kw" — potência num campo de energia, com uma
  unidade que não existe. Campo vazio, divergência escrita.

- **Ar-condicionado abriu em 26/09/2026, com quinze splits de três marcas** —
  Electrolux 6, Midea 5, Elgin 4 — e é a categoria mais bem documentada da base:
  13,7 campos de 17, com a ficha da Electrolux chegando a 104 campos na origem.

  **O eixo é a área em metros quadrados.** O anúncio vende BTU; a pergunta de quem
  compra é se serve para o cômodo. **Seis fichas em quinze publicam a área, e as
  seis são da linha MaxComfort da Electrolux.** A régua de mercado — 600 a 800 BTU
  por m², que a própria LG publica na página dela — tem 33% entre os extremos.

  **Cada marca publica um terço, e um terço diferente.** Área: só Electrolux.
  IDRS, o índice sazonal oficial do INMETRO: só Midea, 4 de 15. Garantia do
  compressor: só Electrolux. Ruído: 5 Electrolux e 1 Elgin. Só dois campos são
  unânimes: faixa do INMETRO e vazão de ar. Não dá para comparar as quinze pelo
  mesmo critério, e isso é o guia.

  **A garantia aqui não é 12 meses.** Electrolux declara 5 anos no produto e 10 no
  compressor, em campos separados; Elgin, 3 anos; Midea preenche o campo com
  "90 dias (Prazo Legal)" e chega a 2 anos com a estendida. E a **foto oficial da
  Midea traz um adesivo de "10 anos de garantia no compressor"** que não existe em
  campo nenhum da tabela — registrado como divergência nas cinco fichas dela, sem
  adotar o prazo: ler garantia num adesivo seria trocar a fonte pela nossa leitura.

  **Campo preenchido com valor de outro campo, de novo.** A Electrolux tem
  "Eficiência EER: 80%" — EER é razão, não porcentagem — e o mesmo campo aparece
  no catálogo dela com "550 W", "350 W", "3,24" e a letra "A". A Midea põe o
  consumo anual no campo de IDRS no modelo de 12.000 e deixa o de consumo vazio.
  A Elgin declara os mesmos 600 m³/h de vazão em três capacidades diferentes.

  **Fontes:** Electrolux e Midea têm API VTEX rica (`loja.electrolux.com.br`,
  `www.midea.com.br`); Elgin também, com 25 campos. **LG e Samsung ficaram de
  fora**: a página brasileira da LG entrega quatro linhas de "Especificação chave"
  e o botão de ver todas não abre tabela legível; a loja da Samsung publica treze
  campos, quase todos de título e descrição. **Climatizador é outra categoria** —
  sete dos trinta mais vendidos do nó são climatizador, que não tem compressor,
  BTU nem etiqueta de condicionador de ar. Mesmo caso da escova alisadora.

- **Kärcher e Philips Walita entraram em 26/09/2026, e as duas surpreenderam.**

  A **Kärcher** é líder do segmento de lavadora de alta pressão e **publica
  menos que as marcas brasileiras**: a Prática Black não traz potência nem
  tensão na tabela, o aspirador VCL 2 não traz potência, e o VCL 1 Stick tem
  **uma única linha** de dados técnicos — por isso ficou de fora. O prazo de
  garantia não está em página de produto nenhuma; está só nos termos
  (`/br/servicos/garantia.html`), que dizem "1 ano, sendo 3 meses de garantia
  total obrigatória e mais 9 meses de garantia complementar". As páginas
  carregam o aviso "Pode conter conteúdo gerado por inteligência artificial".

  Duas fichas da Kärcher declaram **"Cor: Amarelo"** enquanto a foto principal
  da mesma página e o anúncio na Amazon mostram preto — amarelo é a cor
  institucional da marca e parece ser o padrão do catálogo. Fica registrado como
  divergência porque **é por cor e tensão que se confere se o ASIN corresponde à
  ficha**, e foi assim que dois casamentos errados foram pegos neste dia.

  A **Philips Walita** publica em `walita.com.br`, que é VTEX com
  `window.__STATE__` e tem API de catálogo (`?ft=DST2020`, sem "+"). O modelo
  **mais caro documenta menos**: Série 5000 com 10 campos contra 15 do Série
  2000. O vapor contínuo de 25 g/min e o jato de 180 g estão no título do
  anúncio da própria marca e **não na tabela dela**.

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
      philips.com.br      as páginas de produto do Brasil carregam o título
                          certo e então redirecionam para /c-w/error-404.
                          A fonte que funciona é walita.com.br
      mondial AP-37       9º mais vendido do ranking e sem página no site
                          da Mondial — só os acessórios dele têm ficha

  Quando a fonte cai, o campo fica em branco e a lacuna fica escrita. Não se
  substitui por varejo: cinco lojas com o mesmo número são o texto do
  fabricante copiado cinco vezes.

- **`/transparencia`** é o ranking por marca: média das notas de transparência
  dos produtos de cada fabricante, com os campos mais omitidos e uma tabela
  por categoria. Calculado no build a partir de `dados/*.json` — não tem
  texto editorial por marca, de propósito: a nota mede documentação, não
  produto, e a página repete isso. Linkado no trilho, no cabeçalho, no
  rodapé e no sitemap.
- **`/simulador`, desde 28/09/2026**: três perguntas (foco, tamanho, perfil)
  e uma indicação de Wi-Fi, automação ou câmera. A matriz mora em
  `lib/simulador.ts`, o formulário em `components/setup-simulator.tsx`
  (client) e os cards são montados no servidor, um por combinação.

  Nasceu de um roteiro pronto de "setup simulator" que o Allan colou, e **o
  roteiro não entrou como veio**, porque quebrava as regras da casa:
  recomendava produto sem ficha (Deco M4, UniFi U6, relés Zemismart, DVR, HD
  SkyHawk), justificava no indicativo ("elimine zonas mortas", "imune a
  inibidores de sinal") e apontava o botão para `href="#"`. O que ficou:

  - **Só recomenda produto da base com link de loja**, e o build quebra se
    uma indicação sair da base ou perder o link. Ao apagar produto de
    conectividade ou casa conectada, conferir a matriz.
  - **A justificativa lê os campos da ficha** ("a marca declara X"), não
    número digitado.
  - **O tamanho só é perguntado para Wi-Fi**, o único caso em que a
    documentação liga produto a área. Perguntar a metragem para escolher
    tomada seria personalização fingida.
  - **"Custo-benefício × Premium" virou "O essencial × Mais recursos
    declarados"**: sem preço em texto, o site não sabe o que é barato.
  - **Cobertura só conta se for a do kit à venda.** Deco X50 e BE22 declaram
    600 m² para o kit de três e o anúncio é o de duas; por isso o essencial
    acima de 150 m² é o Halo H80X (460 m² do kit anunciado).
  - O que o roteiro pedia e a base não tem fica escrito em "O que ficou de
    fora, e por quê" — Zigbee/relé/medidor DIN, DVR/bullet/HD de vigilância,
    e o BE65, que não declara cobertura.
  - O botão de gerar é `botao-secundario`: verde só no CTA de loja. Os cards
    formam **um** bloco de CTA, com uma linha de comissão.

  **Em 29/09/2026 virou montador de projeto, começando pelas câmeras.** O Allan
  achou a primeira versão pobre ("teve um que só apareceu uma tomada") e
  definiu: o simulador monta o projeto e **sugere tudo o que o cliente vai
  precisar comprar** — no caso das câmeras, além delas, gravador, HD, cabo,
  conectores, fonte. **A especificação inteira está em `docs/simulador.md`**:
  o questionário de cada frente, as regras de cálculo, o que está feito e a
  fila de fichas a apurar. Ler antes de mexer no simulador.

  O que não é óbvio e está decidido:

  - **Peça sem ficha entra na lista** com a especificação mínima e sem link
    ("opção A", 28/09). Hoje o sistema cabeado sai quase todo assim: a base
    não tem DVR, câmera HDCVI, HD, fonte nem conector. A fila de apuração está
    no documento, começando por DVR Intelbras.
  - **Três espécies de número:** do fabricante ("declara"), regra do simulador
    (rotulada e com o valor à vista — margem de 10% no cabo, folga de canal) e
    topologia (dois conectores por cabo). Nada que dependa de número não
    publicado é calculado: o HD não sai em terabytes enquanto nenhum gravador
    da base declarar a taxa de gravação.
  - **Wi-Fi ganhou o questionário completo em 29/09/2026** (`lib/simulador-wifi.ts`):
    mesh, repetidor ou roteador conforme o problema; cobertura por número de
    unidades como cada fabricante declara, e unidade avulsa na lista quando o
    kit do anúncio não basta. Só automação segue na matriz simples de
    `lib/simulador.ts`. A lista de compras é um componente só para as frentes
    (`components/simulador-lista.tsx`).
  - **Desde 29/09 o sistema com DVR escolhe peças da categoria CFTV**: DVR pelo
    menor tamanho que cabe e que grava 1920 × 1080, câmera pela de menor
    consumo que atende alcance e cor, HD pelo bit rate declarado do DVR
    (1 Mb/s o dia inteiro = 10,8 GB), fonte pela soma do consumo declarado
    (+20%, regra rotulada), e a distância informada contra o limite de cabo
    coaxial do manual. HD, fonte, cabo e conectores seguem sem ficha.
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
  26/09/2026 são **206 registros em 31 categorias** — batedeiras 27,
  sanduicheiras 21, secadores 18, escovas secadoras 14, cozinha 12, mixers 12. Aparecem na ficha sob o título "Onde as
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
- **O sitemap está cadastrado no Search Console**, na propriedade de domínio
  `sc-domain:guiaprodutonalupa.com.br`. Reenviado em 26/09/2026 depois do
  commit dos cooktops: **795 páginas encontradas**, status "Processado". O
  `robots.txt` também aponta para ele.

  Reenviar o mesmo URL depois de um lote grande de páginas novas força uma
  releitura — antes do reenvio o painel ainda mostrava as 556 de uma leitura
  anterior do mesmo dia. Não é obrigatório (o Google relê sozinho), mas é
  barato e tira a dúvida.

  Havia uma segunda entrada, `.../sitemap.xm` sem o `l`, com status "Não foi
  possível buscar o sitemap" e 0 páginas — erro de digitação no envio.
  **Removida em 26/09/2026**, e a lista hoje tem uma linha só. Ao enviar
  sitemap, conferir o campo antes de clicar em enviar: foi assim que ela
  nasceu, e é a conferência de um segundo.
- Confirmar no painel do Mercado Livre a janela de cookie vigente: as fontes
  públicas se contradizem (24 h e 30 dias).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

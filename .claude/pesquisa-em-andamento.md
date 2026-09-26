# Expansão da base — notas de trabalho

Pedido do Allan em 17/09/2026: levar as sete categorias existentes a 20
produtos cada, e abrir mais 20 categorias com 20 produtos cada.

Alvo: 7 × 20 + 20 × 20 = **540 produtos**. Base atual: **70**.
Faltam **470**.

## Estado medido em 17/09/2026

| | |
|---|---|
| Produtos | 70, dez em cada um dos sete arquivos de `dados/` |
| Guias | 7 |
| Comparativos | 8 |
| Análises | 8 (o CLAUDE.md ainda diz 1 — desatualizado) |

Categorias com dados: `audio`, `cafeteiras`, `celular`, `cozinha`,
`liquidificadores`, `monitores`, `tablets`.

Categorias declaradas em `lib/categorias.ts` e ainda vazias: `energia`,
`perifericos`, `armazenamento`, `conectividade`, `casa-conectada`.

## IDs das listas de mais vendidos da Amazon Brasil

Apurados em 17/09/2026, navegando de `/gp/bestsellers/electronics`.
São a fonte para escolher o que entra — a regra da casa é ranking, não
palpite.

| lista | id |
|---|---|
| Fones de Ouvido e Acessórios | 24035344011 |
| Acessórios | 16243793011 |
| Acessórios de Alimentação | 16243805011 |
| Baterias e Carregadores Domésticos | 16243806011 |
| Celulares e Comunicação | 16243803011 |
| Computadores e Informática | 16243794011 |
| Câmeras e Foto | 16243796011 |
| Eletrônicos para Carros e Veículos | 16243797011 |
| GPS e Acessórios | 16243800011 |
| Sistema de Som e Hi-Fi para Casa | 24035345011 |
| TV, Áudio e Cinema em Casa | 16243809011 |
| Tablets | 16364762011 |
| Telefones e Acessórios | 16243804011 |
| Wearables | 16243802011 |
| e-Readers e Acessórios | 16243799011 |
| Áudio e Vídeo Portáteis | 16243801011 |
| Acessórios para Computador | 16364748011 |

## Áudio — candidatos para as dez vagas

Do ranking de Fones de Ouvido de 17/09/2026, tirando o que já está na
base e o que não tem marca com página oficial (P47 e genéricos não
entram: sem página do fabricante não há ficha nem foto licenciável).

| # | ASIN | produto |
|---|---|---|
| 5 | B07JQKQ91F | JBL C50HI |
| 6 | B0DB52X2ZW | Xiaomi Redmi Buds 6 Play |
| 10 | B0DL4S61RP | Philips TAE2146BK/00 |
| 13 | B000UXZQ42 | Logitech H390 |
| 15 | B0CRT6HQ82 | Anker soundcore Sport X20 |
| 17 | B0D7QTMLYM | Apple EarPods Lightning |
| 18 | B0C3V5X3QT | JBL Tune 520BT |
| 21 | B0DHL6RJ7H | JBL Wave Flex 2 |
| 24 | B0D4QTNPTP | QCY MeloBuds Pro |
| 25 | B0D2XRXNGY | Anker soundcore V20i |
| 26 | B0FVGQ8DD4 | Philips TAT2500BK/00 |
| 29 | B00YJJB7YG | Logitech H111 |
| 30 | B09C1K95LB | QCY T13 |

Treze candidatos para dez vagas — sobra margem para o que não tiver foto
oficial.

## `perifericos` — aberta em 18/09/2026 com 17

Dez mouses e sete teclados: **Logitech 15, Multilaser 2**. Todas as
fichas saíram de página de fabricante, com foto oficial.

### As marcas que ficaram de fora, e por quê

Do ranking, estas aparecem bem colocadas e **não deram ficha**:

- **HP** — `hp.com/br-pt/shop/<slug>-<peça>` existe e a busca do site
  devolve a URL certa (`mouse-sem-fio-hp-150-2s9l1aa`,
  `mouse-com-fio-hp-150-240j6aa`, `kit-de-mouse-e-teclado-hp-150-240j7aa`).
  O HTML tem 757 KB e **zero** especificação: é tudo montado por script.
  No navegador, a URL de produto redireciona para a home da loja.
- **Dell** — `dell.com/pt-br/shop/...` responde 200 a fetch com 1,5 MB e
  também sem ficha; `/apd/580-admt` devolveu 500. No navegador a página
  navegou sozinha para outro produto.
- **Redragon** — `redragon.com.br` responde, mas a home de 1,3 MB não tem
  um link de produto no HTML e a plataforma não é VTEX nem Shopify
  (`/products.json` dá 400, `/api/catalog_system/...` dá 404). É a marca
  com mais presença no ranking de teclado depois da Logitech — vale uma
  tentativa nova pelo navegador.
- **C3Tech** — o servidor derrubou a conexão (WinError 10054).
- **Fortrek** — `/products.json` e a API VTEX respondem 200 com os
  mesmos 33 KB para qualquer busca: não é API de verdade.

**Mousepad continua fora de propósito**: ocupa um terço do ranking e não
tem campo comparável além de tamanho.

### Multilaser é VTEX

`https://www.multilaser.com.br/api/catalog_system/pub/products/search?ft=<ref>`
devolve tudo, inclusive foto. Testado com `TC193` e `MO300`. A ficha traz
peso, três medidas em centímetros, comprimento de cabo, quantidade de
teclas e de botões — e **não traz prazo de garantia** em nenhum dos dois.

### Dois erros de dado da Logitech, registrados como divergência

- **K120**: a mesma tabela publica 450 × 155 × 23,5 mm e **50 g**.
- **K270**: publica largura 441,5 mm, profundidade 18 mm e **altura
  5,87 mm** — menos que a própria espessura declarada.

Nos dois, o campo ficou em branco com a divergência de fonte contra ela
mesma, no padrão do `electrolux-ebl1000`.

### A foto do M170 é off-white, e isso está escrito na ficha

A página brasileira do M170 serve arquivos nomeados **M171** e publica
off-white, rosa, azul, vermelho e azul-acinzentado — **não publica
preto**, que é a cor do anúncio ligado à ficha. Mesmo caso do TP-Link
EX3000/EX521. A nota da fonte diz isso.

## `perifericos` — notas da apuração

`camposPeriferico`, 14 campos, registrado nos quatro mapas. Cobre mouse,
teclado e combo. **Mousepad ficou de fora de propósito**: ocupa um terço
do ranking e não tem campo comparável além de tamanho.

**O ângulo**: DPI é o teto do sensor, não a sensibilidade de uso, e a
duração de pilha é promessa sem condição declarada. Os dois campos
existem com o texto de ajuda dizendo isso.

### Ranking: nó Teclados, Mouses e Periféricos = 16364777011

Sub-nós: Mouses 16364917011, Teclados 16364919011, Kits 16364980011.
Logitech é **13 dos 30 primeiros**; o resto é HP, Dell, Multilaser,
Maxprint, Fortrek, C3Tech — e muito mousepad.

Dezoito candidatos de mouse, teclado e combo já separados do ranking:
M170, G305, M240, Pebble Keys 2 K380s, MK250, Pebble 2 M350s, MK235,
G203, Lift Vertical, HP 150, Dell KM3322W, Multilaser TC193, M90,
Multi Classic Box, HP 100, M196, G703, K120.

### A Logitech trocou de site: o método caro abaixo ficou obsoleto

Descoberto em 18/09/2026. As páginas migraram de
`/pt-br/products/mice/<slug>.<peça>.html` para **`/pt-br/shop/p/<slug>`**,
e a lista completa sai do sitemap, sem depender da Amazon para achar URL:

```
https://www.logitech.com/pt-br/sitemap.xml   → 183 produtos pt-br
```

Duas rotas, nessa ordem:

1. **Fetch simples.** Algumas páginas trazem a ficha inteira serializada
   no HTML, em objetos `{facet:"…",value:"…"}`. O extrator está em
   `scratchpad/logi_ficha.py` — não é JSON (chaves sem aspas), então ele
   varre acompanhando profundidade de chaves. Funcionou no M170 e no
   Lift; **na maioria vem só o bloco Dimensões.**
2. **Navegador**, quando o fetch só traz dimensões. Clicar em
   "Especificações e compatibilidade" e ler o `innerText`. Devolve mais
   que o HTML: inclui **garantia e código de peça**, que o payload não
   tem. Três ações por produto, e dá para empilhar três produtos por
   `browser_batch`.

`robots.txt` proíbe `/api/` e `/*/product-refs/` — não raspar essas.

### Fichas de mouse já apuradas em 18/09/2026

Todas de `logitech.com/pt-br/shop/p/<slug>`. Falta a garantia das
marcadas com `?` (o corte de 1.250 caracteres ficou curto nelas).

| modelo | sensor / DPI | botões | pilha | conexão / alcance | mm (A×L×P) | g | garantia | cód |
|---|---|---|---|---|---|---|---|---|
| M170 | óptico suave / 1.000± | 3 | 1×AA inclusa, 12 meses | 2,4 GHz receptor USB / 10 m | 97,7×61,5×35,2 | 69,3 | ? | — |
| M190 | óptico avançado / 1.000 | 3 | 18 meses | receptor nano 2,4 GHz / 10 m | 115,4×66,1×40,3 | 89,9 | 1 ano | 910-005902 |
| M196 | óptico suave / 1.000 | **não declara** | 1×AA pré-instalada, 12 meses | Bluetooth LE / 10 m | 100×60×38 | 76 | 1 ano | 910-007456 |
| M240 Silent | óptico suave / nominal 1.000, 400–4.000 | 3 | 1×AA, 18 meses | Bluetooth LE / 10 m | 99×60×39 | 73,8 | ? | — |
| M330 Silent Plus | óptico alta precisão / 1.000± | 3 | 1×AA, 18 meses | 2,4 GHz Unifying / 10 m | 105,4×67,9×38,4 | 78 | 1 ano | 910-004905 |
| Pebble 2 M350s | óptico alta precisão / nominal 1.000, 400–4.000 | 3 | 1×AA alcalina, 24 meses | BLE + Logi Bolt, 3 aparelhos / 10 m | 106×58,7×26,62 | 76 | ? | — |
| Lift Vertical | óptico avançado / 400–4.000, nominal 1.000 | 6 | 1×AA, 24 meses | Logi Bolt + BLE / 10 m | 108×70×71 | 125 | ? | — |
| G203 | — / 200–8.000 | 6 programáveis | com fio, cabo 2,1 m | USB 1.000 Hz | 38,2×62,1×116,6 | 85 | 2 anos | 910-005793 |
| G305 | HERO / 200–12.000 | 6 | **250 horas** | LIGHTSPEED 1.000 Hz | 38,2×62,1×116,6 | 99 | 2 anos | 910-005281 |

**Achado da categoria**: a mesma Logitech declara autonomia em **meses**
na linha de escritório e em **horas** na linha gamer. 250 horas do G305
não convertem para meses sem saber quantas horas por dia — `duracaoPilhaMeses`
fica em branco nos gamers, e o motivo vai escrito na fonte. É o mesmo
tipo de incomparabilidade que a categoria existe para mostrar.

O G203 é o único com fio da lista, e a Logitech **não publica o sensor
dele** — só a resolução. O M196 não publica número de botões.

### Correcao de 25/09/2026: o G305 tinha 6 botoes e o JSON nao tinha

Ao escrever as pecas, conferi campo a campo a tabela acima contra
`dados/perifericos.json`. **Uma divergencia em nove produtos**: a apuracao
registrou 6 botoes no G305 e o JSON trazia `"botoes": null`.

Era perda na transcricao, nao omissao da Logitech. Corrigido no dado, e nao
no texto — o guia chegou a dizer "o M196 e o G305 nao dizem" antes da
conferencia. A nota de transparencia do G305 subiu de 64% para 73%, e a
media dos mouses de 91% para 92%.

Fica a rotina: **antes de publicar uma categoria, rodar a tabela das notas
contra o JSON.** Foi o que pegou isso.

### Paginas publicadas em 25/09/2026

`guias/perifericos.mdx`, `comparativos/logitech-g305-vs-m330-silent-plus.mdx`
e `comparativos/logitech-k120-vs-multilaser-tc193.mdx`. Os 44 numeros citados
foram conferidos por script contra o JSON.

O angulo que virou titulo nao estava nestas notas: **o campo `layout` esta
sem resposta nos 7 teclados**, e a palavra ABNT nao aparece uma vez nas 17
fichas. O K250 e o unico com o campo preenchido, e o valor e o formato
("Compacto com teclado numerico"), nao ABNT2 nem US. Cuidado ao escrever:
isso nao autoriza dizer que os teclados vem em layout americano — so que a
ficha nao confirma, e o guia diz isso explicitamente.

Outros padroes uteis: a Logitech documenta **mouse muito melhor que teclado**
(media 92% contra 74%, e nenhum teclado chega a 100%); **alcance sem fio: 12
declaram e os 12 dizem 10 m**; o **G305 perde ponto por publicar autonomia em
horas** (250 h) numa coluna que e em meses; e **bloco numerico: 2 de 7
declaram ter, nenhum declara nao ter.**

### Como tirar a ficha da Logitech — método antigo, mantido por referência

A ficha fica num acordeão fechado, **e o conteúdo não vem no HTML**:
`fetch` da página devolve 107 KB sem uma linha de especificação. As
listagens de categoria (`/pt-br/products/mice.html`) também são montadas
por script e não devolvem links por fetch.

O caminho que funciona, por produto: navegar, achar o botão
"Especificações e compatibilidade", clicar e ler o `innerText`. Dá para
encurtar para três ações fazendo o clique dentro do próprio JS:

```js
const b = [...document.querySelectorAll('button')]
  .find(x => /Especifica..es e compatibilidade/i.test(x.textContent||''));
if (b) b.click();
await new Promise(r => setTimeout(r, 1200));
const t = document.body.innerText;
t.slice(t.search(/Especifica..es e compatibilidade/i), ) // + 1400
```

Falta descobrir as URLs exatas: elas têm o código de peça no fim
(`m170-wireless-mouse.910-004940.html`), e o código sai da listagem da
Amazon ou da busca do site.

### Já apurado

**Logitech M170** (`/pt-br/products/mice/m170-wireless-mouse.910-004940.html`,
consultado em 18/09/2026): mouse sem fio 2,4 GHz com receptor USB,
rastreamento óptico, DPI 1.000, 3 botões, pilha 1 × AA inclusa com
duração declarada de 12 meses, alcance de 10 m, 97,7 × 61,5 × 35,2 mm,
69,3 g com pilha, garantia de 1 ano. ASIN `B074L9L5KZ`.

## `armazenamento` — esquema pronto, produtos em andamento

Esquema `camposArmazenamento` escrito em 18/09/2026, com 13 campos e
registrado em `camposPorCategoria`, `DESTAQUES_POR_CATEGORIA`,
`ICONE_POR_CAMPO` e `ROTULO_CURTO`. A descrição da categoria em
`lib/categorias.ts` foi ampliada para incluir SSD interno, que domina o
ranking e não cabia no texto antigo.

**O ângulo da categoria**: o setor publica leitura e cala escrita. O
número grande da embalagem é sempre leitura sequencial; a escrita costuma
ser metade ou um quinto, e na maioria das fichas não existe. `escritaMbs`
e `durabilidadeTbw` são os campos que separam quem documenta de quem não.

### Ranking: 21 dos 30 primeiros têm marca

Nó **Memória e Armazenamento de Dados = 16364752011**. Sub-nós:
Armazenamento Externo 16364778011, Interno 17028669011, de Rede
16364779011. Marcas: SanDisk, Kingston, Toshiba, Western Digital,
Seagate, ADATA, Multilaser. Os itens "Microsoft 365" do ranking são
software, não entram.

### Acesso por marca

- **Kingston** — 403 a fetch, abre no navegador. Ficha excelente: TBW por
  capacidade, MTBF, temperatura, peso, dimensões, garantia. URLs que
  funcionam: `/br/ssd/nv3-nvme-pcie-ssd`, `/br/ssd/a400-solid-state-drive`.
  As de pen drive que tentei (`/br/usb-flash-drives/datatraveler-exodia-usb-flash-drive`
  e `-exodia-m-`) deram 404 — achar o slug certo.
- **SanDisk** e **Seagate** — as URLs que chutei deram 404. Procurar antes.

### Já apurado, pronto para virar entrada

**Kingston NV3** (`/br/ssd/nv3-nvme-pcie-ssd`, consultado em 18/09/2026):
M.2 2280, NVMe PCIe 4.0 x4, NAND 3D, 22 × 80 × 2,3 mm, 7 g, MTBF
2.000.000 h, temperatura de operação 0–70 °C, garantia de 5 anos.
500 GB: 5.000/3.000 MB/s, TBW 160 TB. 1 TB: 6.000/4.000 MB/s, TBW 320 TB.
ASINs: 1 TB `B0DBR3DZWG`, 500 GB `B0DBR9RZLV`.

**Kingston A400** (`/br/ssd/a400-solid-state-drive`, 18/09/2026):
2,5 pol, SATA Rev. 3.0 (6 Gb/s), NAND 3D, 100 × 69,9 × 7 mm, 41 g,
MTBF 2.000.000 h, garantia de 3 anos, consumo de 0,195 W ocioso a
1,535 W em gravação. 480 GB: até 500/450 MB/s, TBW 160 TB.
ASIN `B01N0TQPQB` (480 GB).

## As 20 categorias novas — reconhecimento de 18/09/2026

As sete categorias existentes fecharam em 20. Faltam as 20 novas, e o
primeiro reconhecimento mudou o que eu esperava.

### Cinco já estão declaradas em `lib/categorias.ts` e vazias

`energia`, `perifericos`, `armazenamento`, `conectividade`,
`casa-conectada`. Destas, **só `energia` já tem esquema pronto**
(`camposEnergia`, 15 campos, com ícone e destaques registrados). As
outras quatro precisam de `camposX`, entrada em `camposPorCategoria`,
`ICONE_POR_CATEGORIA` e `DESTAQUES_POR_CATEGORIA`.

### O que muda em relação às sete primeiras

Nas sete categorias já feitas, o ranking da Amazon é de marcas reais —
LG, Samsung, Mondial, Philco, Walita. Em categoria de **acessório**, não
é: o ranking é dominado por vendedor de marca branca, com título do tipo
"Carregador Turbo 30W Compatível c/ iPhone" e nenhum fabricante por trás.

No nó de Carregadores (`16244083011`), dos 30 primeiros só 7 tinham marca
identificável. Foi preciso descer para o nó mais específico de
**Carregadores Portáteis (`16244305011`)**, onde 22 dos 30 primeiros têm
marca. A lição vale para as outras categorias de acessório: **procurar o
nó mais fundo da árvore antes de concluir que a categoria não dá 20.**

### Nós de mais vendidos apurados

| lista | id |
|---|---|
| Acessórios para Celular | 16243888011 |
| Carregadores | 16244083011 |
| **Carregadores Portáteis** | **16244305011** |
| Carregadores de Parede | 16244307011 |
| Carregadores por Indução | 16244308011 |
| Carregadores Veiculares | 16244303011 |
| Cabos e Adaptadores | 21213414011 |
| Cartões Micro SD | 16243925011 |
| Smartwatches e Acessórios | 16244073011 |
| Caixas de Som e Bases Portáteis | 16244069011 |
| Baterias e Carregadores Domésticos | 16243806011 (é de pilha descartável, não serve) |

### Como chegar na ficha de cada marca de `energia`

| marca | no ranking | caminho |
|---|---|---|
| Basike | 11 de 30 | **Shopify**: `basikebrasil.com.br/products/<handle>.js` devolve JSON com as specs no `body_html`. `collections/carregadores/products.json?limit=40` traz o catálogo inteiro de uma vez |
| i2GO | 5 | `i2go.com.br/produto/<slug>-<id>`, responde a fetch. Ficha rica: declara Wh, tempo de recarga e entrada/saída em V/A |
| Anker | 5 | `anker.com`, ainda não achei o padrão de URL |
| Geonav | 4 | `geonav.com.br` — **o site inteiro devolveu 503 em 18/09/2026**, no fetch e no navegador. Tem manual em PDF por modelo, mas é PDF de design, sem texto extraível |
| Xiaomi, UGREEN, Intelbras | 1 cada | na página 2 do ranking |

**Shopify é o novo VTEX**: `/products/<handle>.js` e
`/collections/<x>/products.json` fazem o mesmo papel. Vale testar em toda
marca que não for VTEX.

### Estado

Ficha completa levantada para 8 dos 20 de `energia`: seis Basike
(B 078, B 079, B 204, BA POW 177, BA POW 115, B203B) e dois i2GO
(Pocket 5000 USB-C, PRO 20000 PD 20W). Faltam Geonav (site fora),
Anker, Xiaomi.

## O EBUSY do `npm run build` tem nome: `python3.13`

O servidor estático que uso para conferir o build no navegador fica vivo
depois do `Stop-Process`, porque o filtro que eu usava era
`Name='python.exe'` e **o processo se chama `python3.13`**. Ele segura a
pasta `out/` e o export morre com
`EBUSY: resource busy or locked, rmdir .../out`.

A limpeza certa, antes de qualquer `npm run build` ou `npm run imagens`:

```powershell
Get-Process | Where-Object { $_.ProcessName -like "python*" } |
  Stop-Process -Force
```

Fechar também as abas `file://` do navegador — as duas coisas juntas
causavam o mesmo erro no turno passado.

## `microondas` — aberta em 18/09/2026 com 17

Nó **Fornos de Micro-Ondas = 17124786011**. **30 dos 30 com marca real**:
Electrolux 10, Philco 7, Midea 4, Panasonic 3, Mondial 3, Britânia 2,
Fischer 1. Fechou em 17, com cinco marcas.

### `loja.panasonic.com.br` é VTEX, e muda a categoria

`panasonic.com/br` responde **403**. A loja responde à API VTEX normal e
tem a ficha mais rica da categoria — inclusive **Volume Total e Volume
Útil em campos separados**, que nenhuma outra marca publica:

| modelo | caixa | útil | sobra | perde |
|---|---|---|---|---|
| NN-ST27LWRU | 21 L | 11 L | 52,4% | **47,6%** |
| NN-ST55LMRU | 27 L | 18 L | 66,7% | 33,3% |
| NN-ST67LSRU | 34 L | 23 L | 67,6% | 32,4% |

**Correcao de 25/09/2026.** A versao anterior desta tabela tinha uma coluna
so, chamada "sobra", com 48%, 67% e 68% — e o 48% era o que o ST27
**perde**, nao o que sobra. Uma coluna, duas contas.

O padrao que so apareceu depois de corrigir: **o menor e o que perde mais**,
quase metade contra um terco nos outros dois. Faz sentido fisico (parede e
magnetron quase nao encolhem quando o aparelho encolhe) e virou um dos eixos
do guia: comprar o pequeno e o pior negocio proporcional da tabela.

É o mesmo ângulo das airfryers, e foi de onde saiu a `dorPrincipal`.

### A potência não é a mesma grandeza em todas as fichas

Panasonic declara 700, 800 e 900 W. Philco, Britânia, Electrolux e
Mondial declaram 1.100 a 1.600 W. **Nenhuma diz se é consumo ou potência
de cozimento.** O que sustenta a leitura é a estrutura da ficha da
Panasonic: o campo dela vem num conjunto com "Potência Grill" e "Potência
Convecção", os dois marcados como não aplicáveis — são potências de
cozimento. As outras publicam um número solto.

Decisão: **um campo só**, `potenciaW`, com o número como publicado e o
texto de ajuda avisando que a coluna mistura duas leituras. Separar em
dois campos exigiria inferir qual é qual produto a produto, e isso a
documentação não permite.

### Electrolux publica muito e nunca o que importa

Sete fichas, com medida, peso, prato, selo energético, trava e painel —
e **nenhuma com volume útil ou níveis de potência**. Três páginas do
mesmo ME23 (S, B, P) trazem conjuntos de campos diferentes entre si: a do
branco não tem potência, peso, prato nem trava; a do preto é a única de
toda a marca que declara tipo de painel e grill.

O **MEO44** traz no campo de potência a faixa `1400-1650W`, que é filtro
de navegação e não valor do produto — campo em branco.

### Philco e Britânia: cinco campos, nenhum físico

Capacidade, potência, se é de embutir, modelo e garantia em dias. Sem
medida, peso, prato, níveis, trava, painel nem grill. Entram assim mesmo:
a nota de transparência mostra o tamanho do buraco melhor do que a
ausência das fichas mostraria.

### Quem ficou de fora

**Midea MasterCook** (4 no ranking): `midea.com.br` devolve HTML, não a
API. **Fischer** (1): não testado. **MI41T** e **MO-02-34-W** foram
colhidos mas **não casam com o ASIN do ranking** — o ranking traz o 31 L
inox e o 34 L espelhado, e eu tinha o branco dos dois. Não entraram.

### O numero do MODELO tambem nao e a capacidade — achado de 25/09/2026

Nao estava nestas notas e virou o titulo do guia. Comparando o numero que um
comprador leria como litros no nome do modelo contra o `capacidadeTotalL`:

**5 de 17 batem. 12 nao batem.**

A Electrolux faz as duas coisas na mesma linha de produtos, o que e o pior
dos mundos para quem aprende o padrao na prateleira:

| modelo | nome | ficha | |
|---|---|---|---|
| ME23S / ME23B / ME23P | 23 | 23 L | bate |
| ME36S | 36 | 36 L | bate |
| MT30S | 30 | 20 L | **dez a menos** |
| MS37R | 37 | 27 L | **dez a menos** |
| MEO44 | 44 | 34 L | **dez a menos** |

Os tres que erram, erram por **exatamente dez** — e outra serie de nomes, nao
promessa de volume. Philco e Britania erram sempre para cima, de 2 a 5 L.

Cuidado ao escrever: a Panasonic chama os modelos de ST27, ST55 e ST67, e
**55 e 67 nao sao leituras plausiveis de litragem** — ninguem le 67 como
litro. So o ST27 e armadilha, porque 27 e capacidade plausivel de
micro-ondas e o aparelho tem 21 L de caixa e 11 L uteis. Afirmar que a
Panasonic "infla" o numero nos tres seria sensacionalismo, e o guia diz
explicitamente que nao esta afirmando isso.

### Paginas publicadas em 25/09/2026

`guias/microondas.mdx`, `comparativos/panasonic-st67-vs-philco-pmo38e.mdx` e
`comparativos/panasonic-st27-vs-mondial-mo-01-21.mdx`. Os 46 numeros citados
foram conferidos por script contra `dados/microondas.json`.

Outros padroes que sairam da base e valem para as proximas categorias:
grill **6 declaram, 6 dizem que nao tem**; trava **8 declaram, 8 dizem que
tem e nenhuma diz que nao**; selo energetico **10 declaram, 10 sao A**;
niveis de potencia **4 declaram, todos dizem 10**. Campo que so aparece com
resposta boa nao permite ler o silencio de quem o omite.

## `smartwatches` — reconhecimento de 18/09/2026, **não aberta**

O nó certo é **Smartwatches = 16243897011**, e não o
`16244073011` ("Smartwatches e Acessórios"), que é 90% pulseira e capa.
Chegar nele: Wearables `16243802011` → sub-nó Smartwatches.

Ranking: Amazfit 7, Huawei 4, Samsung 3, Xiaomi/Redmi 2, Apple 2, e o
resto é Bettdow, PEJE e Haiz — marca branca sem página.

### Onde está o dado de cada marca

| marca | fonte | estado |
|---|---|---|
| **Huawei** | `consumer.huawei.com/br/wearables/<slug>/specs/` | **funciona**: tabela real com tela, resolução, PPI, material da caixa, sensores, peso, bateria. `band10` e `band11` respondem; `watch-fit-5` dá 404 — achar o slug |
| **Xiaomi** | `mi.com/br/product/<slug>/specs/` | **funciona** por fetch (62 KB, com mAh) |
| **Apple** | `apple.com/br/apple-watch-se/specs/` | **funciona** por fetch (182 KB) |
| **Amazfit** | `br.amazfit.com` é **Shopify** | `/collections/all/products.json?limit=40` lista o catálogo e casa com o ranking (Active Max, Balance 2, Bip 6, Bip Max, T-Rex 3, Active 2). Mas `/products/<handle>.js` devolve **texto de marketing, não ficha**: "até 14 dias de bateria", "tela AMOLED", sem resolução, peso nem resistência à água. **Falta achar a página de especificação da Amazfit** |
| **Samsung** | `shop.samsung.com/br` | a API VTEX que funcionava para celular devolve **206 com HTML** para smartwatch. Tentar `samsung.com/br/watches/<modelo>/specs/` |

### Por que não abri

Com fonte de ficha confirmada hoje: Huawei 2, Xiaomi 2, Apple 1 ou 2 —
cinco ou seis produtos. A Amazfit, que é o maior bloco do ranking com
sete, tem catálogo acessível e **ficha não**. Abrir com cinco seria
publicar uma comparação que não se sustenta.

O que destrava: achar a página de especificação da Amazfit e o caminho
da Samsung. Com os dois, a categoria fecha em 15 a 17 com cinco marcas.

### O que este reconhecimento custou, para não repetir

Três categorias foram medidas e descartadas no mesmo turno:
**purificadores de água** (cinco das trinta posições são anúncios
Electrolux de título genérico, sem código de modelo — não dá para casar
ASIN com ficha; Consul tem CPB33AV no catálogo e CPB33AB no anúncio;
Lorenzetti 404), **batedeiras** (três no nó misto) e, antes,
**lava e seca**, **fogão de piso** e **cooktop**.

O padrão que ficou: **em categoria de eletrônico, o ranking tem marca
mas a ficha mora em cinco sites diferentes**; em linha branca, o cluster
VTEX resolve quase tudo de uma vez. As categorias fáceis da cozinha
estão acabando.

## `sanduicheiras` — aberta em 18/09/2026 com 20

Nó **Sanduicheiras = 17124792011**, dentro de Eletroportáteis. **28 dos 30
mais vendidos têm marca real** — a melhor relação de documentação
encontrada até agora. Fechou com 20 fichas e oito marcas: Britânia 5,
Mondial 4, Oster 3, Philco 3, Cadence 2, Arno 1, Electrolux 1, Elgin 1.

### Todo o ramo de Eletroportáteis, apurado de uma vez

| lista | id |
|---|---|
| Eletroportáteis (raiz) | 17124722011 |
| **Sanduicheiras** | **17124792011** |
| Balanças de Cozinha | 17124791011 |
| Chaleiras | 17124790011 |
| Chapas e Grelhas Elétricas | 17124788011 |
| Cooktops | 17125447011 |
| Espremedores e Centrífugas | 17124789011 |
| Fornos de Micro-Ondas | 17124786011 |
| Torradeiras | 17124796011 |
| Purificadores de Água | 17125504011 |
| Moedores | 23696256011 |
| Eletroportáteis Especiais | 17124795011 |

São as próximas candidatas, e todas caem no mesmo cluster VTEX.

### Três famílias de fabricante, três metades da ficha

- **Britânia e Philco** (mesmo VTEX) publicam **Quantidade por vez** — o
  único campo que responde a pergunta de quem compra — mais trava de
  fechamento, formato e revestimento da chapa. Declaram a *unidade* das
  medidas ("Centímetros") e **nenhum valor**: nem dimensão, nem peso.
- **Mondial** publica recurso a recurso: luz indicadora, bandeja
  coletora, controle de temperatura, comprimento do cabo, tipo de chapa,
  peso. **Nenhuma medida.**
- **Cadence e Oster** (Newell) publicam medida, peso, consumo e tensão, e
  quase nenhum recurso.
- **Electrolux** é a exceção: 25 campos, incluindo placas removíveis,
  armazenamento vertical e material das placas. Não publica garantia nem
  quantidade por vez.

### A descrição do produto é fonte, e rende mais que a tabela

Em Cadence, Oster e Mondial, dados reais (abertura 180°, 2 sanduíches ao
mesmo tempo, trava na alça, chapa lisa e ondulada, controle de
temperatura) só existem na **descrição do produto**, não na tabela de
especificações. É fonte de fabricante e entra, com a origem dita na nota.

### Cinco divergências, todas da fonte contra ela mesma

- **Mondial S-12, S-20 e S-07**: a tabela marca "Controle de temperatura:
  Não" e a descrição da mesma página promete "controle de temperatura
  automático". Campo em branco nos três.
- **Mondial PG-02**: tabela 2.000 W, descrição 1.800 W.
- **Elgin BBQ Show**: campo de potência 2.000 W, descrição curta 1.800 W,
  e um terceiro campo listando os dois. Campo em branco nos dois.

### Potência que muda com a tomada

Philco PGR32 (1.250/1.500 W), Oster OGRL610 (1.200/1.600 W), OGRL640
(1.500/2.100 W) e **Arno GPTO, que é o inverso: 850 W em 127 V e 700 W em
220 V**. As fichas usam o valor da tensão do anúncio ligado, com as duas
escritas na fonte.

### Quem ficou de fora

**Elgin Brunch Time** (ASIN B0DCCFRMX8): a Elgin não tem esse nome no
catálogo — tem Fast Time, Duo Time, Snack Time, Best Time e Break Time.
Sem casar o modelo, não entra. O **Duo Time** casa (ELG-42SAN21) mas a
ficha dele na VTEX só tem a descrição curta, sem um campo de
especificação. Kian e Mallory aparecem no ranking e não têm página de
fabricante.

## A API VTEX resolve quase toda a linha branca

Descoberto em 18/09/2026, testando o padrão da Samsung Shop nas outras
lojas. **Toda loja VTEX responde a isto**, sem navegador e sem login:

```
https://<loja>/api/catalog_system/pub/products/search?ft=<modelo>
https://<loja>/api/catalog_system/pub/products/search/<slug-do-produto>/p
```

Volta `allSpecifications` inteiro mais `images[0].imageUrl`, que é a foto
oficial. Um fetch por produto, contra os seis a oito do método antigo.

Confirmado funcionando em: `oster.com.br`, `mondial.com.br`,
`britania.com.br`, `philco.com.br`, `loja.wap.ind.br`, `arno.com.br`,
`cadence.com.br`, `elgin.com.br`, `loja.electrolux.com.br`,
`walita.com.br` e `shop.samsung.com/br`.

Britânia e Philco dividem o mesmo VTEX (`philco.vteximg.com.br`) e o
mesmo esquema de campos — o mais completo do grupo, com reservatório em
litros, corta-pingos, timer, display e placa de aquecimento separados.
Oster e Cadence dividem o da Newell (`jcsbrasil.vteximg.com.br`) e são os
mais pobres: só potência, consumo, medidas, peso e garantia.

**Não é VTEX / não respondeu:** `blackedecker.com.br` (conexão recusada),
`aoc.com.br` (404 nos modelos brasileiros), `jbl.com.br` (403),
`lg.com/br` e `dell.com` (páginas montadas por script).

## Listas de mais vendidos da Cozinha

Apuradas em 18/09/2026, navegando de `/gp/bestsellers/kitchen`.

| lista | id |
|---|---|
| Café, Chá e Expresso | 17124716011 |
| **Cafeteiras** | **17124733011** |
| Eletroportáteis | 17124722011 |
| Panelas e Utensílios para Cozinhar | 24417675011 |
| Louça, Copos e Talheres | 17124723011 |
| Filtros, Bebedouros e Refrigeradores de Água | 17124726011 |
| Assadeiras, Formas e Recipientes de Forno | 17124715011 |
| Organização | 17124717011 |
| Utensílios Domésticos | 17124724011 |

O ranking da Amazon responde 503 a fetch simples, mas abre normalmente
no navegador. `/dp/<ASIN>` responde aos dois.

## Confira o código do modelo antes de escrever, sempre

Em 18/09/2026 quase incluí duas fritadeiras que já estavam na base. A
Amazon anuncia a Walita "Série 1000 XL 6,2L" e a "Série 2000 6,2L" por
nomes comerciais; os códigos, que só aparecem no fim do título da
listagem, são **NA130/00** e **NA230/00** — as duas já na base, sob
outro ASIN.

A conferência de ASIN repetido **não pega isto**: o mesmo produto tem
vários ASINs. O script de inclusão agora também rejeita `modelo` que já
exista no arquivo.

## Outras listas de mais vendidos apuradas

| lista | id |
|---|---|
| Fritadeiras | 17124787011 |
| Liquidificadores, Batedeiras e Processadores | 17124779011 |
| Celulares e Smartphones | 16243890011 |
| Tablets | 16364762011 |

A lista de liquidificadores é misturada — traz mixers, batedeiras e
processadores, que não cabem no esquema de liquidificador. Só cerca de
seis liquidificadores de verdade aparecem nos 30 primeiros; para fechar
20 é preciso ir à segunda página.

## Quando o resumo do fetch devolve só as chaves

Electrolux e Elgin devolvem `allSpecifications` como lista de nomes, e o
resumo do WebFetch às vezes lista as chaves sem os valores. A saída é
abrir a página no navegador e chamar a API de dentro dela:

```js
const r = await fetch('/api/catalog_system/pub/products/search?ft=EAF40')
            .then(x => x.json());
const p = r.find(x => x.productReference === 'EAF40');
const o = {}; for (const k of p.allSpecifications) o[k] = String(p[k]);
```

Mesma origem, sem CORS, e vem o par chave/valor cru.

## Campo derivado: a regra que vale para toda a base

Campo que o fabricante não escreve mas que sai de uma divisão exata
entre dois números que ele escreveu **pode** ser preenchido, com a conta
registrada na fonte. Se a divisão dá quebrado, o campo fica em branco.

Foi o que usei em `mlPorXicara`: Britânia BCF32B (1,2 L / 32 = 37,5) e
Philco PCF40B (1,6 L / 40 = 40) entram; WAP (39,5), Elgin (37,9) e Arno
(41,7) ficam em branco. Arredondar para os 40 ml do cafezinho seria
publicar um número que a marca não escreveu.

## Fontes por marca, o que já aprendi

- **JBL** — `jbl.com.br`. Responde **403 a fetch simples**; abrir no
  navegador. A ficha fica num acordeão fechado: clicar em
  "ESPECIFICAÇÕES" antes de ler. Publica também PDF de especificação em
  `/on/demandware.static/.../pdfs/`.
  Foto oficial no padrão
  `jbl.com.br/dw/image/v2/BFND_PRD/on/demandware.static/-/Sites-masterCatalog_Harman/...png?sw=535&sh=535`.
- Os padrões já registrados no CLAUDE.md continuam valendo: VTEX
  (`window.__STATE__`) para Philco, Mondial, Samsung Shop e Motorola;
  API JSON da Samsung Shop; Apple e Xiaomi por fetch.

## JBL C50HI — apurado, pronto para virar entrada

Página oficial consultada em 17/09/2026:
`https://www.jbl.com.br/fones-de-ouvido-intra-auriculares/JBL+C50HI.html`

| campo | valor |
|---|---|
| Item# | JBLC50HIBLKE |
| Driver | 8,6 mm |
| Sensibilidade a 1 kHz/1 mW | 101 ± 3 dBSPL |
| Resposta de frequência | 20 Hz – 20 kHz |
| Impedância de entrada | 30 ohms |
| Comprimento do cabo | 1,2 m |
| Plug | 3,5 mm |
| Microfone integrado | sim |
| Chamada sem as mãos | sim |
| Na caixa | fones, 3 tamanhos de ponteira (P/M/G), cartão de advertência e garantia |

**O que a JBL não informa nesta página:** peso, prazo de garantia em
meses, tipo de driver, se tem controle de volume no cabo.

Foto oficial:
`https://www.jbl.com.br/dw/image/v2/BFND_PRD/on/demandware.static/-/Sites-masterCatalog_Harman/default/dw8a930147/black-hero2-1605x1605px.png`

## Ritmo real, medido

Cada produto exige: achar a página oficial, abrir no navegador quando a
marca bloqueia fetch, expandir a ficha, extrair campo a campo, achar a
foto oficial, baixar, converter para WebP e escrever a entrada com
fontes e lacunas.

Deu **seis a oito chamadas de ferramenta por produto** na medição do
JBL C50HI, que é dos mais simples. Produto com divergência entre Amazon e
fabricante custa mais, porque a divergência tem de ser registrada.

470 produtos nesse ritmo é trabalho de muitas sessões, não de uma noite.
A ordem que faz sentido é a do próprio pedido: primeiro fechar as sete
categorias em 20, depois abrir as novas.

## Rodada de 18/09/2026 — as cinco ultimas categorias novas

Fechou as 20 categorias novas. Ferros de passar, aspiradores, lavadoras de
alta pressao, secadores de cabelo e batedeiras.

### Nos da Amazon mapeados nesta rodada
- Ferros a vapor: `home/17125435011`
- (os demais foram abertos direto pela API de catalogo do fabricante, sem
  passar pelo ranking — a densidade ja era obvia pelo catalogo.)

### O padrao que se repetiu em cinco categorias seguidas

**O campo "Consumo" nunca tem consumo.** Em ferros, todas as cinco marcas
escrevem a potencia em quilowatt: Arno 1,52 para 1.520 W, Philco 1,2 para
1.200 W, Oster "1,2 KWH" para 1.200 W. Em secadores, Britania e Cadence
fazem o mesmo. A coluna fica vazia na categoria inteira e a ajuda do campo
explica por que. **Verificar isso antes de usar o campo em qualquer
categoria nova.**

**O numero do anuncio nunca e o numero que importa**, e o que importa esta
publicado por uma ou duas marcas so:
- ferro: watt aquece a chapa; vazao de vapor (g/min) so a Arno publica em
  campo, e a Oster so no texto da descricao.
- aspirador: watt e o motor; succao (Pa) so WAP e Midea.
- lavadora: psi batiza o produto; vazao (L/h) decide o tempo — as tres
  marcas publicam, e e a unica categoria em que a comparacao fecha.
- secador: watt e a resistencia; vazao de ar ninguem publica. Zero em 69.
- batedeira: watt varia 57% dentro da linha sem nenhum outro campo mudar.

### Armadilha de unidade (nova, e seria)

WAP publica a mesma grandeza em mbar (linha de tomada) e em Pa (robos)
dentro do mesmo catalogo. 265 mbar = 26.500 Pa; um robo de "400 Pa" posto
ao lado parece mais forte e e 66x mais fraco. **Sempre normalizar e sempre
guardar o texto cru do fabricante num campo `...Declarada` ao lado.** O
mesmo vale para a Electrolux em lavadoras: campo chamado "Pressao maxima
(PSI/Libras)" com valor em MPa e o psi entre parenteses.

### Erro de processo que custou uma rodada de conserto

`npm run imagens` **quebra no primeiro arquivo cujo conteudo nao bate com a
extensao** (CDN entregando .webp num caminho .jpg), e **nao atualiza o JSON
quando quebra** — mas ja converteu e apagou os originais dos anteriores.
Resultado: 10 referencias apontando para .jpg que nao existe mais.

Conserto adotado e agora padrao: antes de publicar, **detectar a extensao
pelos bytes magicos** (`\xff\xd8\xff` jpg, `\x89PNG` png, `RIFF` webp) e
renomear. Esta em `publica_fotos_lav.py` / `_sec.py` / `_bat.py`.

### Folha de contato: compor sobre branco

PNG com transparencia achatado com `.convert("RGB")` ganha um fundo
arbitrario (verde, azul-petroleo) e parece foto ruim. Usar
`Image.alpha_composite` sobre branco antes de montar a folha, senao se
rejeita foto boa.

### Fotos recusadas nesta rodada
- Electrolux ESI50: fundo verde-escuro (pego indice 2, produto no branco)
- Oster GCSTBS5002 indice 3: selo UL/Inmetro
- WAP Robot W1000 indice 0: painel com celular e recortes
- WAP 5100 Turbo Ultra / Agil Ultra / Premium Ultra: selo promocional
  "ACOMPANHA MANGUEIRA DE DESOBSTRUCAO" queimado (indice 2 nos tres)
- Mondial SC-10: brilho de calor desenhado no bocal — **mantida**, porque
  as outras quatro da galeria sao paineis de marketing com texto.

### Marcas que continuam sem catalogo alcancavel
Black+Decker, Philips Walita (ferros), Taiff, Gama (secadores), Karcher.
Ventisol (ventiladores) segue sem responder.

## 19/09/2026 — a lista de "marcas sem catalogo" estava errada

**Reveja qualquer conclusao de "marca inalcancavel" antes de usa-la.** A lista
que eu vinha carregando foi montada a partir de sondagens que falharam, e pelo
menos duas entradas eram erro meu, nao ausencia de catalogo.

### O que estava errado

- **Taiff**: eu nunca tinha testado. Vi a marca no ranking da Amazon, anotei
  "sem catalogo alcancavel" e repeti isso por varias rodadas. `www.taiff.com.br`
  responde a API VTEX normalmente: **32 secadores**, fichas de 14 a 17 campos.
- **KitchenAid**: tambem nunca testado. `www.kitchenaid.com.br` responde, e as
  fichas de batedeira tem **41 a 78 campos** — as mais ricas do projeto.
- **Black+Decker**: testei `www.blackedecker.com.br` (com "e" no meio, de "e
  Decker") e deu timeout, do que conclui que nao havia catalogo. O host certo e
  `blackanddecker.com.br`, que existe e responde **403** — bloqueio de WAF. Isso
  e outra coisa: pede o caminho do navegador, como Logitech e Amazfit.

### Regra nova

Antes de escrever "sem catalogo alcancavel" em qualquer `porQueParou`:

1. testar **pelo menos duas grafias do dominio** (com e sem "and"/"e");
2. distinguir **404/timeout** (nao existe) de **403** (existe e bloqueia — vai
   de navegador);
3. se nunca foi testado, escrever "nao sondado", nao "inalcancavel".

Essa frase vai para a pagina publica e vira afirmacao sobre a marca. Errar nela
e afirmar que uma empresa nao publica ficha quando ela publica.

### O que a Taiff trouxe de novo para o schema

- **`registroInmetro`**: numero da certificacao compulsoria, consultavel em
  registro publico. Ate aqui a base tinha 433 fontes de fabricante e 293 de
  varejo e **zero de regulador**, apesar de `TipoFonte` prever `regulador` e
  `laboratorio`. E o primeiro dado do site conferivel fora de quem vende.
  Atencao: o numero vem da Taiff, entao a fonte e `fabricante`. Para ter fonte
  `regulador` de verdade e preciso consultar o registro do Inmetro — nao foi
  feito ainda.
- **Um registro para 14 modelos**: o 218.009/21 cobre de 1.700 a 3.100 W.
  Registro de familia existe e e legitimo, mas o numero nao identifica o modelo.

### Achados de campo da Taiff (o padrao de sempre)

- Titanium Progress 2400W: campo "Temperatura" = "5 - combinando temperaturas,
  velocidades e jato de ar frio". O 5 e de **combinacoes**, nao de temperaturas.
  E o campo "Potencia" esta vazio: os 2.400 W so existem no nome.
- Fox 3 2200W: seis cores do mesmo aparelho. Mocha, Red e Off-White declaram
  "5*" em Temperatura; Soft Green, Soft Rose e Kompress declaram "2".
- Black Ion 2000W: campo "Temperatura" = a letra **"e"**.
- Fox 3 Mocha: campo "Botao de Ar Frio" preenchido com "Bico direcionador de ar".
- Fox 3 Kompress: cabo de **1,80 m em 127 V e 3 m em 220 V** — o comprimento
  muda com a tensao. Nao e erro; e o unico caso assim na base.
- A "tampa traseira removivel magnetica" aparece no campo **Funcoes**, em prosa,
  nao em campo proprio. Foi de la que saiu o `gradeTraseiraRemovivel`.

### KitchenAid (19/09/2026) — o campo que faltava em batedeiras

`www.kitchenaid.com.br` responde a API VTEX. 40 itens em "batedeira", dos quais
9 sao maquinas (o resto e acessorio, tigela, batedor, combo). Cuidado: a ficha
tem 41 a 78 campos, mas a maioria e modulo de marketing (Foto/Titulo/Texto
modulo 1 a 8). Os campos de especificacao de verdade sao ~15.

**Campos que so a KitchenAid publica**, e que viraram schema:
- `capacidadeFarinhaKg` e `capacidadeMassaPaoKg` — quanto a maquina TRABALHA,
  nao quanto a tigela comporta. E o equivalente da vazao no aspirador: o numero
  que responde a pergunta real. Artisan 1,1 / 1,8 kg; Profissional 2 / 4 kg.
- `elevacaoTigela` — cabeca basculante contra tigela que sobe por alavanca.

**O achado que fecha a categoria**: a linha KitchenAid inteira vai de 275 a
350 W, ABAIXO de qualquer batedeira comum de Britania ou Philco (350 a 550 W).
E a maior da marca, a Profissional de 7,6 L, tem 325 W — menos que a Bowl-Lift
de 5,6 L, que tem 350. A capacidade de trabalho dobra enquanto o watt cai.

**Movimento planetario em prosa**: o campo "Tipo do produto" diz so "Batedeira".
A palavra planetario aparece em "Diferenciais" ("movimento planetario com 59
pontos de contato"). Mesmo padrao da tampa traseira da Taiff: o dado existe, em
campo de texto. So 4 das 9 fichas trazem — por isso so 4 entraram no recorte.

**Divergencias por cor, de novo** (igual ao Fox 3 da Taiff):
- Artisan: 4,83 L e 275 W em sete cores; 4,8 L e 300 W em Blue Salt e Butter.
- Artisan 220 V: 300 W em quatro fichas, 275 W em Contour Silver e Dried Rose.
- Artisan Black Matte: 1 kg de farinha; as irmas de mesma tigela, 1,1 kg.
- Artisan Beetroot: "Com elevacao"; as outras seis Artisan, "Sem elevacao". A
  foto oficial da propria pagina mostra cabeca basculante. Mesmo assim o valor
  publicado ficou na ficha — corrigir o fabricante a partir de leitura de foto
  seria trocar a fonte pela nossa interpretacao.
- Bowl-Lift 5,6 e 6,6 L: nao publicam farinha nem massa de pao. Sao justamente
  as maquinas feitas para massa pesada.

## `torradeiras` — aberta com 12, paginas publicadas em 25/09/2026

No **Torradeiras = 17124796011**, dentro de Eletroportateis. Fechou com 12
fichas e **sete marcas**, a melhor distribuicao de marca de qualquer
categoria aberta ate agora: Electrolux 2, Oster 2, Philco 2, Britania 2,
Mondial 2, Cadence 1, WAP 1.

A apuracao estava so no JSON — esta secao foi escrita ao publicar.

### O angulo: a fenda, e o campo preenchido com o texto de exemplo

Torradeira tem **uma pergunta so**: o seu pao cabe? Pao de forma tem uns
12 mm; pao frances cortado ao meio passa dos 30.

**Duas das 12 fichas publicam a espessura em numero:** Philco French Toast
com 35 mm e Britania Tosta Pane com 30 mm.

Outras duas trazem o campo **preenchido com texto que nao e medida**, e
estao registradas em `divergencias`:

- **Philco PTR03A** — o campo "Espessura dos paes" traz literalmente
  `"Exemplo: 30mm"`. E o **texto de amostra do formulario de cadastro**,
  publicado ao vivo na pagina do produto no lugar do valor. Campo em branco:
  adotar 30 mm seria adotar um exemplo.
- **Britania BTR05A** — o mesmo campo traz `"diferentes tamanhos e
  espessuras"`, frase de propaganda num campo numerico.

**A simetria e o achado**: cada uma das duas marcas faz as duas coisas. Num
modelo o campo vira medida, no modelo vizinho vira texto solto. Nao e
politica de marca, e cadastro produto a produto sem ninguem conferindo.

### A inversao: quem publica medida nao publica a medida que importa

```
publicam dimensoes E peso     Electrolux, Oster, Cadence, WAP
publicam espessura do pao     Philco, Britania
```

Os dois conjuntos **nao se cruzam em nenhum ponto**. Philco e Britania
publicam exatamente **seis campos** por torradeira (potencia, quantidade de
paes, espessura, bandeja, niveis, garantia em dias) e — o detalhe que resume
a categoria — **declaram a unidade das medidas, "centimetros", sem declarar
valor nenhum ao lado**.

### A potencia depende da tomada, e 3 de 8 dizem

Oito das 12 declaram bivolt. Tres publicam a potencia de cada tensao:

| modelo | 127 V | 220 V | queda |
|---|---|---|---|
| Oster OTOR600 | 750 W | 650 W | 13,3% |
| Oster OTOR650 | 750 W | 650 W | 13,3% |
| WAP WTE1 | 900 W | 800 W | 11,1% |

As outras cinco bivolt publicam **um numero so**, sem dizer a que tensao.
Cuidado ao escrever: isso **nao autoriza** afirmar que as cinco percam
potencia em 220 V — so que os dois fabricantes que mediram nas duas tensoes
acharam diferenca, e que a diferenca (100 W) e metade da faixa inteira da
categoria (700 a 900 W). O JSON guarda o valor de 127 V.

### Dois fabricantes publicam o que nao vende

Raro, e merece credito nominal quando aparecer de novo:

- **Electrolux ETS10** declara `desligamentoAutomatico: false` — campo de
  seguranca, na mesma marca cujo modelo de cima declara `true`.
- **Mondial T-13** declara `guardaFio: false`, enquanto a irma T-18 declara
  `true`.

Contraste com `bandejaRemovivel`: **12 de 12 declaram, e as 12 dizem que
tem**. Campo que so aparece com resposta boa nao permite ler o silencio.

### Outros numeros uteis

- **Fatias: 8 de 12 declaram, e as oito dizem "2".** As quatro que calam sao
  as duas Electrolux e as duas Oster. Torradeira de 4 fatias existe e custa
  mais — o silencio importa.
- **Niveis: 11 de 12.** So a Oster OTOR650 nao publica, e a OTOR600 da mesma
  linha publica 7. **Nenhuma das 12 diz o que muda entre um nivel e outro.**
- **Garantia: 11 declaram 12 meses; a WAP WTE1 declara 24**, a unica.
- **Cabo: Mondial 1,50 m nos dois modelos, o dobro dos 0,75 m das Electrolux.**
- **Peso: TOP70 1,87 kg (a mais pesada), Mondial T-18 0,70 kg (a mais leve).**
- **Zero de 12** publicam tempo de ciclo, temperatura em graus ou o
  comprimento da fenda.

### Paginas publicadas

`guias/torradeiras.mdx`, `comparativos/philco-french-toast-vs-britania-tosta-pane.mdx`
e `comparativos/electrolux-top70-vs-wap-wte1.mdx`. Os 53 numeros citados
foram conferidos por script contra `dados/torradeiras.json`.

**Uma imprecisao que o script nao pega e quase saiu publicada**: escrevi "o
modelo mais potente da lista" para o TOP70, e ha **tres empatados em 900 W**
(TOP70, French Toast e WTE1). Superlativo em categoria pequena pede conferir
empate — o script testava o valor, nao a unicidade.

## `lavaloucas` — aberta com 11, paginas publicadas em 25/09/2026

Onze maquinas e tres marcas: **Electrolux 6, Brastemp 4, Philco 1**. A
apuracao estava so no JSON — esta secao foi escrita ao publicar.

### O angulo: cada marca publica metade da conta, e nunca a mesma metade

Lava-louca se vende por economia, e o custo de um ciclo tem duas parcelas:
agua e energia. **Nenhuma das 11 fichas publica as duas.**

```
Electrolux (6)   publica AGUA (5 de 6)   nunca energia, nunca selo Inmetro
Brastemp   (4)   publica ENERGIA (4/4)   nunca agua
Philco     (1)   nenhuma das duas        so servicos, programas e garantia
```

Separacao limpa, **sem uma unica excecao**. Nao da para comparar custo de
operacao entre marcas com a documentacao oficial, e o guia diz isso em vez de
estimar o lado que falta.

### O campo de litros preenchido com "Sim"

**Electrolux LL08S** — o campo "Consumo de agua (L/ciclo)" esta preenchido com
a palavra **"Sim"**. Resposta de sim-ou-nao num campo de medida. Nos outros
cinco modelos da marca o mesmo campo traz numero, entao e cadastro daquele
produto, nao politica da casa. Campo em branco, registrado em `divergencias`.

**E o segundo caso do genero em duas categorias abertas no mesmo dia**: na
torradeira Philco PTR03A o campo de espessura traz `"Exemplo: 30mm"`. Marcas
diferentes, sistemas diferentes, a mesma falha — campo de especificacao
publicado sem ninguem conferir o que entrou. Vale procurar esse padrao nas
proximas categorias.

### A pequena gasta mais que a grande, nas duas marcas e nos dois recursos

**Agua (Electrolux):**

| modelo | servicos | L/ciclo | L por servico |
|---|---|---|---|
| LL14X | 14 | 9,5 | **0,68** |
| LS14E | 14 | 11 | 0,79 |
| LS10E | 10 | 9 | 0,90 |
| LL10X | 10 | 9,5 | 0,95 |
| **LB08E** | **8** | **12** | **1,50** |

A de 8 gasta **26,3% mais agua por ciclo** que a de 14, para lavar 43% menos
louca. Por servico, **2,2x mais**.

**Energia (Brastemp):** BLF08 (bancada) 0,95 kWh; BLF10 (piso) 0,83 kWh. A de
8 gasta **14,5% mais por ciclo** e **43,1% mais por servico**.

Duas marcas, dois recursos, o mesmo resultado. Explicacao fisica: ha um volume
minimo para encher bomba e molhar o braco giratorio, e ele nao encolhe na
proporcao da maquina.

### Outros achados

- **LL10X e LL14X gastam os mesmos 9,5 L** — 40% mais louca pela mesma agua.
  Recomendacao mais simples da categoria: se ha vao de 60 cm, leve a maior.
- **LS14E gasta 11 L contra 9,5 do LL14X**: mesma marca, mesma capacidade,
  15,8% mais agua, e a ficha nao explica.
- **Brastemp BLF10 publica energia por tensao**: 0,83 kWh em 127 V e 0,74 em
  220 V. Mesmo cuidado das torradeiras Oster e WAP. O JSON guarda o de 127 V.
- **Dois "nao" publicados, os dois na Electrolux**: o LB08E declara que NAO
  tem cesto de talheres (unico das 11) e o LL08S que NAO tem trava de painel
  (unico das 11). Credito nominal.
- **Ruido em decibeis: 0 de 11.** A palavra dB nao aparece no arquivo. E a
  especificacao classica da categoria no resto do mundo.
- **Duracao de ciclo: 0 de 11** publicam tabela. Tres modelos trazem o tempo
  no nome de um programa ("Lava & Seca 50 minutos") e nada dos outros.
- **O numero do nome bate com os servicos em 11 de 11** — o contrario de
  micro-ondas, onde 12 de 17 nao batiam. Vale registrar quando a categoria
  acerta.
- **Philco declara a unidade das medidas, "centimetros", sem valor nenhum** —
  exatamente o que a ficha dela faz em torradeiras. E comportamento da casa,
  nao da categoria.

### Paginas publicadas

`guias/lavaloucas.mdx`, `comparativos/electrolux-ll10x-vs-brastemp-blf10br.mdx`
e `comparativos/electrolux-lb08e-vs-ll08s.mdx`. Os 56 numeros citados foram
conferidos por script contra `dados/lavaloucas.json`.

### Resolvido: dois resumos com afirmacao sem fonte

O resumo do `electrolux-ls10e` terminava com *"Lavar a mesma louca na pia
passa de cem."* Cem litros e um numero e nao tinha fonte em `fontes`. Allan
decidiu em 25/09/2026: **retirar**. Trocado por dado da propria ficha
(programa Lava & Seca de 50 minutos e painel mecanico).

A varredura que fiz em seguida, em **todos os resumos de todas as
categorias**, achou mais um do mesmo tipo: o `wap-atacama-smart-2200` dizia
*"E a faixa que a maioria das casas compra"* — afirmacao de mercado sem
fonte, e ainda por cima em tensao com a nossa propria base, onde 1.500 psi
fica perto do piso da distribuicao. Retirado. A outra metade da frase ("a
mesma vazao da Mondial de 1.600 psi") **e verdade e sai da nossa base**, e
ficou.

Dois falsos positivos da varredura, que conferi e mantive:
- `philco-paf95a`: *"contra os 80 da maioria"* — verdade, 12 das 16 fichas de
  airfryer que declaram temperatura minima dizem 80 C.
- `logitech-g203`: *"costuma ser o dado que mais se pergunta"* — e contexto
  editorial, nao numero.

**Rotina para as proximas categorias**: varrer os resumos atras de
comparacao com baseline externo ("passa de", "a maioria", "na pia", "em
media"). Numero que compara com algo fora da ficha precisa de fonte, ou sai.
O script da varredura esta no scratchpad da sessao.

## `ventiladores` — aberta com 10, paginas publicadas em 25/09/2026

Dez ventiladores e cinco marcas: **Mondial 4, Mallory 2, Britania 2, WAP 1,
Arno 1**. A apuracao estava so no JSON — esta secao foi escrita ao publicar.
(A nota antiga de que "Ventisol segue sem responder" continua valendo: a marca
nao entrou.)

### O angulo: a grade tem 50 cm, a helice tem 40

O esquema tem **dois campos de diametro**, e e a chave da categoria:
`diametroDeclaradoCm` (a grade, a tela que protege a mao) e
`diametroHeliceCm` (a pa que gira).

**Tres fichas em dez publicam os dois**, e nas tres a diferenca e identica:

```
Mallory Max Control       grade 50    helice 40
Mallory EOLO              grade 50    helice 40
WAP Flow Turbo Coluna 50  grade 50    helice 40
```

O produto da WAP se chama "Ventilador 50 cm" na loja da propria WAP.

**Conta derivada publicada no guia**: o diametro cai 20%, mas a area varrida
cai **36%** (pi*25^2 = 1.963 cm2; pi*20^2 = 1.257 cm2). Apresentada como
"conta nossa", e com a ressalva de que area varrida nao e vazao.

### Os quatro grupos do diametro

| situacao | quantos | quem |
|---|---|---|
| grade **e** helice | 3 | Mallory x2, WAP |
| **um** diametro, sem dizer qual | 3 | Arno (40), Britania (40 e 30) |
| centimetros **so no nome** do produto | 3 | Mondial NVT-40C-8P, VTX-40C-8P, VT-30C-NB |
| torre, sem helice a mostra | 1 | Mondial Air Tower (naoSeAplica) |

A fonte da Britania e a do Arno registram literalmente "nao publica se o
diametro e da grade ou da helice". A da Mondial registra "os 40 cm do nome do
produto nao aparecem em campo nenhum".

**O par que mostra a armadilha**: WAP anunciado 50 (helice 40 declarada) x
Arno anunciado 40 (nao diz qual). Se os 40 do Arno forem da helice, os dois
tem a mesma pa. Se forem da grade, a helice dele fica perto de 30. A ficha nao
permite escolher, e o comparativo diz isso em vez de estimar.

### Vazao: 2 de 10, e o teste das pas

So as duas Mallory publicam m3/s. E elas permitem o teste que a categoria
inteira deveria permitir:

| | EOLO | Max Control |
|---|---|---|
| pas | 6 | **15** |
| helice | 40 cm | 40 cm |
| potencia | 126 W | 140 W |
| vazao | 1,00 m3/s | **1,11 m3/s** |

**150% mais pas, 11,0% mais ar — e 11,1% mais watts.** Dividindo vazao por
potencia os dois dao **0,0079 m3/s por W**, diferenca menor que 1%.

Cuidado ao escrever, e o guia toma esse cuidado: os dados **nao** provam que
as pas nao facam diferenca. Provam que a contagem de pas, sozinha, nao preve
o vento. Mesmo padrao dos 96 furos do ferro de passar.

### A TERCEIRA ficha do dia com o campo preenchido errado

Padrao que agora esta confirmado em tres categorias abertas no mesmo dia:

| categoria | produto | campo | valor publicado |
|---|---|---|---|
| Torradeiras | Philco PTR03A | Espessura do pao | `"Exemplo: 30mm"` |
| Lava-loucas | Electrolux LL08S | Consumo de agua (L/ciclo) | `"Sim"` |
| **Ventiladores** | **Mondial VT-30C-NB** | **Quantidade de pas** | `"*"` |

Texto de exemplo do formulario, resposta de sim-ou-nao, e um simbolo. Tres
marcas, tres sistemas de cadastro. **Vale procurar esse padrao em toda
categoria nova**, e vale como secao de guia sempre que aparecer.

No caso do Mondial, o nome do produto diz "6 pas Turbo" — adotar esse 6 seria
promover marketing a dado. Campo vazio.

### Outras anomalias registradas

- **Arno X-TREME 7**: a ficha publica **43 cm de altura** para um ventilador
  de coluna; o X-TREME 9 da mesma marca, mesma helice, publica 153 cm. Parece
  medida da caixa. Campo de dimensoes vazio.
- **Mondial VT-30C-NB**: medidas publicadas **sem unidade**, ao contrario dos
  outros modelos da marca.
- **Arno** declara "alcance de ar de ate 11 m" de **teste proprio**, sem
  metodo publicado — nao entrou na ficha. Decisao correta, manter.

### Numeros que so uma ficha traz

- **Rotacao**: so o Arno, 1.470 rpm.
- **Angulo de oscilacao em graus**: so a WAP, 90 de oscilacao e 45 de
  inclinacao. Cinco outras declaram so sim-ou-nao.
- **Garantia de 24 meses**: so o Arno. Os outros nove, 12.

### O que ninguem publica

**Ruido em decibeis: 0 de 10.** A palavra nao aparece no arquivo. E a
reclamacao numero um da categoria — aparelho que fica ligado a noite inteira.

**Em que velocidade mediram: 0 de 10.** As duas vazoes, os tres consumos em
kWh e a rotacao do Arno vem sem dizer se e velocidade 1, 3 ou turbo.

### Paginas publicadas

`guias/ventiladores.mdx`, `comparativos/mallory-max-control-vs-eolo.mdx` e
`comparativos/wap-flow-turbo-50-vs-arno-x-treme-7.mdx`. Os 56 numeros citados
foram conferidos por script contra `dados/ventiladores.json`, e a varredura de
resumos (rotina nova) voltou limpa.

**Deslize corrigido antes de publicar**: escrevi "45 W, o menor consumo da
lista" para o Air Tower. Watt e potencia, nao consumo — e o consumo em kWh so
existe em 3 das 10 fichas, nenhuma delas a do Air Tower. Era exatamente o erro
que o guia critica na secao de vazao. Trocado por "a menor potencia da lista".

## As cinco ultimas categorias sem nada publicado — abertas em 25/09/2026

`chaleiras`, `energia`, `espremedores`, `lavadoras` e `smartwatches`. Nenhuma
tinha secao de apuracao; as cinco foram escritas ao publicar. Guia + dois
comparativos cada, 15 pecas.

**Correcao de contagem**: eu vinha dizendo que faltavam 4 categorias. Eram
**10** sem guia — 5 sem nada publicado (estas) e 5 com comparativo e analise
mas sem guia (`aspiradores`, `conectividade`, `geladeiras`, `casa-conectada`,
`armazenamento`). Estava decrementando um numero herdado sem recalcular.

### `chaleiras` — 9 produtos, 9 marcas

Melhor distribuicao de marca do site: uma marca por produto.

**O angulo**: 6 das 9 publicam **duas potencias**, uma por tensao — 1.200 W em
127 V e **1.850 W em 220 V**, que sao **54% a mais**. Num aparelho cuja unica
funcao e ferver agua, a potencia e o produto inteiro. O numero do anuncio e
sempre o menor.

Proporcao muito melhor que a das torradeiras (3 de 12). A Midea publica ate a
**corrente** de cada versao, 14,57 A e 8,41 A.

**A ironia**: a **Britania BCH02PI** e a unica que declara mais de 1.200 W
(1.250) — e a unica que **nao publica nada sobre 220 V**, nem tensao, peso,
dimensao ou cabo.

**Tempo de fervura: 1 de 9** (WAP, 5 a 7 min). E o fim; o watt e o meio.

**Campos que so uma marca publica**, sem sobreposicao nenhuma: protecao a
seco (Elgin), corrente (Midea), liga do aco 304 (Oster), capacidade util
separada da total (Walita), ausencia de filtro (Electrolux).

**Tres fichas quebradas**: Mondial cabo de "0,50 cm" (unidade trocada), WAP
tres medidas com rotulos trocados (daria 15 cm de altura), Elgin dois valores
de potencia sem dizer a tensao.

**A "Premium Inox" da Mondial declara PP no campo de material** — o acabamento
e metalico, a jarra nao.

### `energia` — 8 power banks, 3 marcas

**O angulo**: existe um campo `capacidadeReal` no esquema, com texto de ajuda,
e ele esta **vazio nos oito**. As oito publicam a capacidade nominal da
celula; nenhuma diz quanto chega ao aparelho depois da conversao de tensao.

**Wh: 3 de 8.** E a unidade em que energia se mede e a que as companhias
aereas regulam. A Basike faz certo: "20.000 mAh (74 Wh a 3,7 V)", com a tensao
da conta. Cuidado: o guia **nao publica limiar de bagagem** por falta de
fonte; fala so de qual unidade e regulada.

**Anker**: o nome do produto diz **22,5 W** e a tabela tecnica da **mesma
pagina** diz **18 W** (5 V x 3,6 A). A ficha adota os 18.

Ciclos: 1 de 8. Quimica: 1 de 8. Garantia: 3 de 8, todas i2GO — a Basike nao
publica prazo em nenhum dos quatro.

### `espremedores` — 9 produtos, 6 marcas

**A categoria com mais ficha quebrada do site**: 4 em 9.

- **Mondial E-01**: o campo "Potencia" contem **as dimensoes do produto**.
  As medidas foram aproveitadas (unica fonte de dimensao da marca) e a
  potencia ficou vazia.
- **Electrolux ECP10**: o campo "Compativel com lava-loucas" traz **"800mlz"**.
- **Mondial E-02**: **seis campos** preenchidos com um traco.
- **Arno**: 46,8 cm de altura para um produto cuja caixa, na mesma pagina, tem
  20,8 cm — nao caberia dentro da propria embalagem.

**Potencia de 30 a 260 W (8,7x)**, e o de 260 W e o unico Britania que **nao**
gira nos dois sentidos, enquanto o de 35 W gira. Rotacao alternada e o recurso
que solta mais suco, e nao anda junto com watt.

**Bellagio 350 declara 35 W** — o 350 do nome nao e watt.

Philco publica "2 cones" no **nome do produto** e nao tem campo de cones.

### `lavadoras` — 8 maquinas, 3 marcas, todas de carga superior

**O angulo**: o mesmo 15 kg gasta **110 ou 160 litros** (Panasonic x
Electrolux LED15) — 45% a mais. E dentro da Electrolux, o mesmo 13 kg gasta
**150 ou 110** (LED13 x LET13) — 36%.

Litros por quilo, do melhor ao pior: **7,3 (Panasonic) a 12,4 (Brastemp)**,
**68,5% de diferenca**. Ressalva publicada: nenhuma diz em que condicao mediu.

**Brastemp publica energia como "kW/ano": 0,39 e 0,41** — a ordem de grandeza
e de um ciclo. Campo vazio. E publica a **capacidade como faixa de filtro**,
"12kg - 14kg"; os 14 kg saem do nome.

**LED15 e LED17**: dimensoes, peso e rotacao **identicos** para 15 e 17 kg.

**LES11**: dois campos de programas na mesma pagina, 10 e 8. Adotado o 8.

**LET13 declara NAO ter filtro de fiapos** — unica das 8. Credito.

### `smartwatches` — 9 aparelhos, 3 marcas (Amazfit 6)

**Categoria que inverte o padrao do site**: as marcas publicam varios regimes
de autonomia, nao escondem o numero ruim. O problema e **qual vai para a
caixa**.

- **Amazfit Active Max**: cinco regimes (25 tipico, 13 intenso, 10 always-on...)
- **Amazfit Bip 6**: **26 dias no modo economia e 6 em uso intenso** — 4,3x
- **Xiaomi**: **um regime so**, 18 dias
- **T-Rex 3**: 27 dias tipicos, o maior — e **nao publica uso intenso**

`autonomiaIntensaDias`: 4 de 9, todas Amazfit.

**Huawei publica dias e nao publica mAh** nas duas pulseiras — entao nao da
para coloca-las na reta mAh x dias, que nos outros sete e quase linear.

**Polegada e PPI nao andam juntas**: o Active 2 de **1,32"** tem **353 PPI**,
o maior; a Xiaomi de **2,0"** tem **250**, o menor, e e a unica LCD.

### O padrao do dia: campo publicado sem ninguem conferir

Sete casos, em cinco categorias abertas no mesmo dia. A tabela esta publicada
no guia de espremedores:

| categoria | campo | valor publicado |
|---|---|---|
| Torradeiras | Espessura do pao | "Exemplo: 30mm" |
| Lava-loucas | Consumo de agua (L/ciclo) | "Sim" |
| Ventiladores | Quantidade de pas | "*" |
| Chaleiras | Comprimento do cabo | "0,50 cm" |
| Espremedores | Potencia | as dimensoes do produto |
| Espremedores | Compativel com lava-loucas | "800mlz" |
| Espremedores | Seis campos | um traco |
| Lavadoras | Consumo de energia | "kW/ano" |

**Vale procurar em toda categoria nova, e rende secao de guia.**

### Conferencia

Cinco scripts, um por categoria, contra os JSON: chaleiras 46, energia 48,
espremedores 45, lavadoras 59, smartwatches 57. **255 verificacoes, zero
falha de conteudo** (houve quatro falsos negativos dos proprios testes, por
acento e maiuscula, conferidos a mao).

A varredura de resumos atras de comparacao sem fonte voltou limpa nas cinco.

Build em **624 paginas**.

### O que ainda falta

Cinco categorias **sem guia**, mas com comparativo e analise ja publicados:
`aspiradores` (24 produtos), `conectividade` (14), `geladeiras` (9),
`casa-conectada` (8), `armazenamento` (7).

**Pendencia anotada**: o texto de ajuda do campo `capacidadeReal`, em
lib/specs.ts, afirma "Costuma ser 60% a 65% da nominal" sem fonte. E a mesma
classe de problema dos resumos corrigidos hoje, noutra superficie. Nao
alterei; as pecas novas nao usam esse percentual.

## As cinco ultimas categorias sem guia — fechadas em 25/09/2026

`aspiradores`, `conectividade`, `geladeiras`, `casa-conectada` e
`armazenamento`. As cinco ja tinham comparativo e analise; faltava o guia.
**Com elas, as 27 categorias de dados do site tem guia.**

### Os angulos

- **aspiradores** (24, WAP 15): succao e a grandeza que importa e a divisao e
  por marca — WAP 15/15 e Midea 2/2 publicam; Electrolux, Philco e Britania
  **0 de 7 somados**. A ficha do STK17 tem mais de 50 campos e nenhum e
  succao. Util x balde varia de **25% a 96%**. Tres fichas quebradas: "6,5 kg"
  num campo de volume, "Vacuo (Pa) 2400" e "Vacuo (mbar) 2400" na mesma
  pagina, e 3,1 cm de comprimento num aparelho de 106 cm.
- **conectividade** (14): o nome soma as bandas e ninguem usa duas ao mesmo
  tempo. O BE11000 entrega **5.765 no melhor caso, 52% do nome**. Os dois
  unicos nomes honestos sao os de banda unica, Wi-Fi 4, 300 Mb/s. E o nome nem
  e a soma exata: AC600 soma 633 (arredonda para BAIXO) e AX3000 soma 2.976.
- **geladeiras** (9): a de 320 L gasta mais que a de 400, e a de 260 tambem.
  Por 100 L o melhor e o pior dobram (5,5 x 11,0). **9 de 9 respondem o alarme
  de porta aberta, 6 dizendo que nao tem** — raro. Campo de ruido do IF44
  publica **463 dB**.
- **casa-conectada** (8): 2 de 8 declaram se funcionam sem a nuvem — e as duas
  sao TP-Link, que **cala nos outros dois produtos dela**, inclusive na C200,
  a camera interna mais vendida do pais.
- **armazenamento** (7): **0 de 4 pen drives publicam velocidade de escrita**,
  e 2 dos 4 nao publicam velocidade nenhuma. O USB 3.2 Gen 1 le menos que o
  USB 3.0 (100 x 150), porque 3.2 Gen 1 e renomeacao do mesmo barramento.

### Resolvido em parte: aspiradores passou de 2 para 16 links em 24

Em 25/09/2026 levantei os ASINs. **14 dos 22 sem link foram encontrados e
confirmados**; a categoria foi de 2 para **16 de 24**.

Regra usada, a mesma do caso ESI80: so entra ASIN cujo titulo ou ficha da
Amazon confirme o modelo. Preferencia pela variante de **127 V**, que e a
convencao herdada do GTW Inox 50.

**As 8 que nao estao na Amazon Brasil** (buscadas com varias consultas, so
acessorio ou modelo vizinho aparece): `wap-turbo-1600`, `wap-turbo-2002`,
`wap-magic-clean`, `wap-ambiance-turbo`, `wap-robot-w100c`, `electrolux-eqp40`,
`philco-pas1810`, `midea-powerdust`.

**Dois casos que exigiram cuidado:**

- **GTW Inox 70 Duo**: o titulo da Amazon diz 2800 W e a nossa ficha diz 2000.
  Nao e contradicao — a tabela da propria pagina declara "2000W (127V) -
  2800W (220V)". So a variante de 220 V esta disponivel, e isso esta escrito
  na fonte, que aparece no bloco de Fontes da pagina do produto.
- **Midea M7**: o campo de modelo da listagem diz apenas "UNIDADE", sem o
  codigo VRA92PB. O casamento e por nome exato e marca, e a fonte diz isso.

**O pick do Turbo 1600 continua sem botao de proposito.** Ele e a maior succao
da lista (26.500 Pa) e nao esta na Amazon. Trocar o pick por um que da
comissao seria escolher pelo link, nao pelo merito — e e exatamente o que este
site nao faz. O guia foi de 2 para 4 botoes.

### ROTINA: auditoria de link de afiliado

Depois do ASIN que escrevi de memoria, todo commit que toca conteudo roda o
verificador: **todo link dentro de bloco `lojas:` tem que existir em
`dados/*.json`**. Hoje: **246 links, zero fora da base.**

E toda pagina de produto com `lojas` preenchido renderiza botao: conferido,
**16 de 16**.

### ERRO MEU, E A ROTINA QUE NASCEU DELE

Escrevi o ASIN do GTW Inox 50 **de memoria** no pick do guia: `B0DG4MHRSH`,
quando o real e `B0777TLJV2`. Era um link de afiliado **fabricado**, que
levaria o leitor ao produto errado. Peguei conferindo contra a base, antes do
commit.

Criei entao um verificador de todo o conteudo: **todo link dentro de bloco
`lojas:` tem que existir em `dados/*.json`**. Rodado no site inteiro: **244
links de afiliado, zero fora da base**. O do GTW era o unico, e ja esta certo.

**Rodar esse verificador antes de todo commit que toque conteudo.** Link de
afiliado nunca se escreve de cabeca; copia-se da base.

### Outra correcao antes de publicar

No guia de geladeiras eu atribui a economia do IF44 a motor Inverter. A
palavra "Inverter" aparece **so na URL da pagina**, em campo nenhum — e o
Deco... nao, o TF38 nao diz o que usa. Reescrevi: a ficha publica o resultado
(25,9 x 30,9 kWh) e nao publica a causa, e o tipo de compressor nao e campo em
nenhuma das nove.

### Conferencia

108 verificacoes nas cinco categorias, zero falha. Build em **629 paginas**.

## Mercado Livre: como o link de afiliado funciona — apurado em 25/09/2026

Fui atras dos 8 aspiradores que nao existem na Amazon. **Dois existem no
Mercado Livre e estao confirmados**; cinco nao existem; um foi recusado.

### Confirmados, esperando o link atribuido

| produto | pagina | o que confirmou |
|---|---|---|
| `wap-robot-w100c` | `/p/MLB19561637` | o campo **"Modelo alfanumerico FW008615"** e o modelo exato da nossa ficha. Tambem "Modelo Robot W100C" e 127/220V |
| `electrolux-eqp40` | `/p/MLB45695281` | "Modelo EQP40", "Capacidade em volume 3 L" (a ficha diz 3 L), 1800 W, HEPA, 127 V |

Cuidado no W100C: existe um **W100 sem o C** (MLB15711832) na mesma busca.

### Recusado

`midea-powerdust` — a busca traz "Aspirador Vertical Midea **VVA20 1.5L**". O
nosso e **VVA20P1 com 2 L**. Sufixo e capacidade diferentes: caso ESI80.

### Nao existem no Mercado Livre

`wap-turbo-1600` (busca devolve Power Speed Max AZ20), `wap-turbo-2002` (devolve
pecas de Audi A3 — o "2002" casa com o ano), `wap-magic-clean` (so o WAP Magic
de 450 W, que ja temos na Amazon), `wap-ambiance-turbo` (so enrolador de cabo e
extensao), `philco-pas1810` (so mangueira e bocal).

### O ACHADO TECNICO: nao da para montar tag do ML em codigo

O Allan pediu para tentar o molde da Amazon — uma funcao `link` no registro de
lojas que anexa a tag na URL. **Nao funciona para o Mercado Livre**, e a prova
esta na pagina:

- A barra confirma o cadastro: **"Afiliados | GANHOS 5% | Compartilhar"**, com
  links para `/afiliados/dashboard`, `/afiliados/tools` e `/afiliados/hub`.
- O unico parametro na pagina e `matt_tool=38524122`, e ele esta dentro do
  bloco `"share"` do permalink de "Compartilhe este produto", acompanhado de
  `ua=<token>`. E o compartilhamento **generico**, nao o afiliado, e o `ua` e
  token de sessao.
- O evento de share traz `"user_type":"affiliates"` e `internal_tags` com
  `is_affiliate`: e o botao **Compartilhar** que gera o link atribuido, no
  servidor, **um por produto**.
- Zero ocorrencias de `mercadolivre.com/sec/` antes do clique.

**Conclusao**: a Amazon tem tag constante (`?tag=guiaprodutona-20`) e por isso
cabe numa funcao. O ML gera link por produto e nao expoe nada constante.
Inventar um parametro mandaria o clique sem atribuicao e manteria a linha "o
site recebe comissao" falsa — o mesmo erro do ASIN escrito de memoria.

**E nao precisa de codigo**: o registro em `lib/site.ts` ja trata `mercadolivre`
sem funcao `link`, entao a URL gerada entra como esta. Basta o Allan clicar em
Compartilhar nas duas paginas acima e colar os links.

Nota operacional: o painel recusa acesso de ferramenta a `mercadolivre.com.br`
("This site is not approved for tool access"), entao eu nao clico nada la — e
gerar link de afiliado seria acao na conta dele de qualquer forma.

Se os dois entrarem, aspiradores fecha em **18 de 24**.


## CORRECAO: os links curtos do ML iam todos para o perfil — 25/09/2026

Publiquei o `meli.la/15LcAxu` como link do Electrolux EQP40 e **estava errado**.
Ele nao aponta para o produto: para em `mercadolivre.com.br/social/allangipa2008`,
o perfil de afiliado do Allan.

**Como me enganei.** Na primeira resolucao a aba acabou no EQP40 e eu li isso
como destino. Nao era: o perfil mostra itens em destaque, e a pagina navegou
para o card. Os parametros na URL final diziam isso com todas as letras —
`source=affiliate-profile`, `reco_client=home_affiliate-profile`,
`c_id=/home/card-featured/element`. **Eu li esses parametros e os citei**, mas
ao analisar o link seguinte, e nao voltei para reexaminar o primeiro.

Testado depois em aba limpa, sem navegacao anterior, com 9 segundos de espera:
os tres codigos curtos gerados ate agora — `15LcAxu`, `1C1kwQ4` e `1mcAWDY` —
**param todos no perfil**. Nenhum e link de produto.

**Regra que fica**: resolver link curto sempre em **aba nova**, esperar, e so
aceitar se a URL final casar com `/p/MLB` E a pagina trouxer um campo que
confirme o modelo. Aba reaproveitada sofre com redirecionamento atrasado — vi a
aba anterior ser sequestrada no meio de outra navegacao.

**O que falta descobrir**: qual controle do Mercado Livre gera link de produto.
A pagina do produto tem dois botoes "Compartilhar", os dois na extrema direita:
um na barra escura de Afiliados (y=12) e o do proprio produto (y=233). O
segundo gera link generico com `matt_tool=38524122`, que nao paga comissao. O
primeiro e o de afiliado, e aparentemente compartilha o perfil — talvez abra um
painel com opcao de produto. Alternativa a testar: a ferramenta em
`mercadolivre.com.br/afiliados/tools`, que monta link a partir de URL colada.

### E um erro meu de dado, que derrubou o build

Ao remover o link eu apaguei a chave `lojas` do EQP40 com `pop`. **A convencao
do site e `"lojas": {}`** — 462 dos 463 produtos tem a chave, vazia quando nao
ha link. Sem ela, `lib/conteudo.ts:368` faz `p.lojas.amazon` e estoura.

O build falhou em `/guias/liquidificadores` e `/guias/qual-iphone-2026`, paginas
que nao tem nada a ver com aspiradores, com "Cannot read properties of undefined
(reading 'amazon')" e **sem dizer qual produto**. Vale saber disso na proxima:
esse erro significa produto sem a chave `lojas`, em qualquer categoria.

Deixei o codigo como esta: ele e fragil, mas pegou um problema real de dado.

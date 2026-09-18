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

## `perifericos` — esquema pronto, produtos em andamento

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

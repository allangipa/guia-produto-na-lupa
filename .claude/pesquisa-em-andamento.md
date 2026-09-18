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

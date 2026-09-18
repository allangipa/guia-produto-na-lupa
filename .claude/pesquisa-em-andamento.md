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

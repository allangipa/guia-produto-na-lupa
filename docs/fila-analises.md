# Fila das próximas análises — guiaprodutonalupa.com.br (08/10/2026)

Critério: fichas de produto que **já aparecem no Google** (Search Console, 28 dias até
05/10) e **ainda não têm análise**, cruzadas com o que o Google autocompleta para o
modelo ("é bom", "vale a pena", "preço", "X ou Y"). Quem já tem impressão sobe mais
rápido quando ganha a análise, e a análise é onde o clique de afiliado acontece.

Ritmo sugerido: 2 por semana. A fila cobre 4 semanas.

## Análises (ordem de publicação)

| # | Produto | Impressões | O que o Google autocompleta | Por que agora |
|---|---|---|---|---|
| 1 | Motorola Moto g35 5G — **publicada em 08/10** (`/reviews/motorola-moto-g35/`, nota 6,4 depois da correção) | 155 | "moto g35 é bom", "ficha técnica", "256gb preço" | Página com mais impressões do site inteiro, 1 clique só: falta a análise para converter |
| 2 | Motorola Moto g86 5G | 90 | "moto g86 é bom", "ficha técnica", "preço" | 2ª página em impressões; já existe o comparativo Galaxy A57 vs Moto g86 para linkar |
| 3 | AOC AGON G50 24G50F | 37 | "aoc 24g50f review" | Monitores é o cluster mais forte (guia com 59 impressões, LG 27G411B 42, 27G523B 31); já existe o comparativo LG 24G411A vs AOC 24G50F |
| 4 | Electrolux LL14X (lava-louças) | 38 | "lava louças electrolux ll14x ou ls14e" | Busca de comparação direta; a LS14E está na base |
| 5 | Amazfit Bip Max | 25 | "é bom", "ficha técnica", "vs bip 6", "preço" | Quatro sinais de compra no autocomplete; Bip 6 está na base |
| 6 | Motorola Moto g06 | 25 | "moto g06 é bom", "ficha técnica", "preço" | Fecha a linha Moto g (g06, g35, g86) e permite um guia "qual Moto g comprar" |
| 7 | JBL Tune 530BT | 20 | "é bom", "vs 520bt", "preço" | Já existe comparativo com o Philips TAH2209; 520BT está na base |
| 8 | Kärcher K5 127V | 16 | "karcher k5 é boa", "ou wap combate turbo 2600" | Busca de comparação direta com produto que também tem impressões (Combate Turbo 2600, 11) |

Reserva, se sobrar fôlego: Philips Walita RI2242 (44 impressões, mas o autocomplete
não mostra intenção de compra), LG 27G411B (42, "review" fraco), iPhone 17 (23, só
"preço"), WAP Combate Turbo 2600 (11, "é boa"; entra junto com a Kärcher no comparativo).

## Comparativos que o próprio Google pediu (pares já na base)

Formato "X ou Y" aparece literalmente no autocomplete. Todos os pares têm as duas fichas
em `dados/`:

1. Kärcher K5 ou WAP Combate Turbo 2600
2. Electrolux LL14X ou LS14E
3. JBL Tune 530BT ou 520BT
4. Amazfit Bip Max ou Bip 6
5. LG 27G411B ou 27G523B (144 Hz ou 200 Hz)

## Como foi medido

- Páginas: tabela "Páginas" do Search Console ordenada por impressões (63 páginas com
  impressão), cruzada com `content/reviews/` (44 análises) e `dados/*.json` (752 fichas).
- Intenção de compra: autocomplete do Google (pt-BR, gl=br) para o nome do modelo,
  filtrando "é bom/é boa", "vale a pena", "review", "ficha técnica", "preço", "ou/vs".
- Dados brutos: `fila-candidatos.json` (pasta temporária da sessão de 08/10/2026).

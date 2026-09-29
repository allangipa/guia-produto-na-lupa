# Simulador de projeto — especificação

A página `/simulador` recebe respostas sobre a casa e devolve **a lista de
compras do projeto**: cada peça que a pessoa vai precisar comprar, com
quantidade, produto sugerido (quando o site tem ficha) e o porquê.

Decisões do Allan que moldam tudo abaixo:

- **28/09/2026** — o simulador monta um projeto e sugere os produtos que o
  cliente vai precisar comprar para ele, e não um produto avulso.
- **28/09/2026 ("opção A")** — peça sem ficha no site **entra na lista**, com a
  especificação mínima que o projeto exige e sem link. Esconder a peça faria a
  pessoa comprar câmera sem cartão; inventar produto quebraria a regra de só
  indicar o que tem fonte oficial.
- **29/09/2026** — o questionário completo começa pelas câmeras. Wi-Fi e
  automação seguem no formato simples até ganharem o delas.

## Estado

| Frente | Questionário | Motor | Onde |
|---|---|---|---|
| Câmeras de segurança | completo, 5 passos | lista de compras; no sistema DVR, peças da categoria CFTV | `lib/simulador-cameras.ts`, `components/simulador-cameras.tsx` |
| Rede Wi-Fi | completo, 2 a 4 passos | lista de compras com peças da categoria conectividade | `lib/simulador-wifi.ts`, `components/simulador-wifi.tsx` |
| Automação | completo, 3 a 5 passos | lista de compras com peças da categoria casa conectada, num app só | `lib/simulador-automacao.ts`, `components/simulador-automacao.tsx` |

## Regras que valem para as três frentes

1. **Três espécies de número, que não se misturam na tela.**
   - *Do fabricante* — sai da ficha, e a frase diz "declara".
   - *Regra do simulador* — conta nossa (margem de cabo, folga de canais). Aparece
     com o rótulo "Regra do simulador" e o valor à vista.
   - *Topologia* — como as peças se ligam (dois conectores por cabo, um balun
     em cada ponta). Não é estimativa.
2. **O que depende de número que ninguém publicou não é calculado.** A lista
   diz qual número falta e onde conferir ("Confira antes de comprar"). Nunca se
   chuta a taxa de gravação, o consumo da câmera ou a potência do nobreak.
3. **Toda indicação da base precisa existir e ter loja.** A página confere no
   build (`resolver()` e `baseCameras()` em `app/simulador/page.tsx`) e quebra
   se um slug sair da base — como acontece quando se apaga produto sem link.
4. **Um bloco de CTA só**, depois da lista inteira, com uma linha de comissão.
   A pessoa vê o projeto completo, inclusive o que não tem ficha, antes de
   qualquer botão. Botões de avançar e opções marcadas não usam a cor de ação.
5. **Pergunta que não muda a lista não é feita.** Resolução some quando o
   sistema é Wi-Fi (as câmeras Wi-Fi da base são todas 1080p); conector exposto
   some quando não há câmera externa.

## 1. Câmeras de segurança — implementado

### Questionário

**Passo 1 — Pontos**
- Pontos dentro de casa (0–16)
- Pontos fora de casa (0–16)
- Fora: até quantos metros ver à noite (se houver ponto externo)
- Dentro: comprimento do maior cômodo (se houver ponto interno)
- Fora e dentro: **o que precisa dar para ver nessa distância** — que passou
  alguém / o que a pessoa faz / quem é, se conheço / quem é, mesmo estranho.
  São os degraus DORI da IEC 62676-4: 25, 62,5, 125 e 250 pixels por metro.
  Desde 29/09/2026; a ideia veio do Di.Ca Next, calculadora de campo de visão
  da Intelbras (programa Windows, examinado sem instalar: câmera + altura +
  distância → PPM e o degrau DORI). Dele não entra nada além da geometria
  pública: nem imagem, nem base de câmeras, nem layout.

**Passo 2 — Instalação**
- Dá para passar cabo até as câmeras? sim / só com obra / não
- Resolução: 1080p / 4 MP / 5 MP+ (só se houver cabo)
- A internet é estável?
- Precisa continuar gravando se a internet cair?

**Passo 3 — Sistema.** Mostra o indicado e os motivos; a pessoa pode trocar.

| Condição | Sistema |
|---|---|
| sem cabo | Wi-Fi independente |
| só com obra e até 4 câmeras | Wi-Fi independente |
| cabo possível e 1080p | cabeado com DVR |
| cabo possível e acima de 1080p | cabeado IP (NVR + PoE) |

"Até 4 câmeras" é regra do simulador, e a tela diz isso.

**Passo 4 — Gravação:** 7 / 15 / 30 dias; contínua ou por movimento.

**Passo 5 — Detalhes**, conforme o sistema:
- *Wi-Fi:* o sinal chega nos pontos de fora? · tem tomada perto?
- *Cabeado:* distância média e máxima até o gravador · cabo coaxial ou UTP (DVR)
  · tomada perto (DVR) · emendas expostas à chuva · ver pelo celular · monitor
  no local · nobreak · canal livre para crescer · quem instala.

### Lista de compras

**Wi-Fi**

| Peça | Qtd. | Regra |
|---|---|---|
| Câmera externa | pontos de fora | proteção IP declarada e visão noturna ≥ pedida |
| Câmera interna | pontos de dentro | mesmo app da externa, se houver; senão a de maior visão noturna declarada |
| Cartão microSD | 1 por câmera | tamanho pela relação horas/GB declarada; sem ela, o maior aceito |
| Repetidor | 1 | se o sinal não chega fora (ou "não sei", com aviso para conferir) |
| Ponto de energia | 1 por câmera | se não há tomada perto |

A única relação horas/GB declarada na base é a da Tapo C500: 954 h em 512 GB
(fonte `tapo-c500-oficial`). Fica em `HORAS_POR_GB`, com a origem escrita.

**Cabeado com DVR — peças da base (desde 29/09/2026)**

| Peça | Como escolhe |
|---|---|
| DVR | menor número de canais da base que cabe (+1 com folga); dentro dele, o que grava 1920 × 1080 em todos os canais, depois em parte, depois menor consumo. A alternativa é o de outra marca no mesmo tamanho. |
| Câmera externa | bullet, 1080p, instalação externa, alcance noturno ≥ pedido, colorida se pedido, **pixels por metro na distância ≥ o degrau pedido**; a de menor consumo declarado. Se nenhuma chega ao degrau, a de ângulo mais fechado, com a distância em que ela chegaria. PPM = pixels de largura ÷ (2 × distância × tan(ângulo/2)), centro da imagem, câmera de frente; altura, inclinação e distorção ficam fora e a tela diz |
| Detalhe gravado | em 1080p Lite o DVR grava 960 px de largura: o PPM gravado é metade do ao vivo. Avisa quando a gravação cai abaixo do degrau pedido e diz se o modo Full HD resolve (e o que ele desliga) |
| Câmera interna | dome, mesmos filtros; a de menor consumo |
| HD | bit rate declarado do DVR × câmeras × 24 h × dias (1 Mb/s o dia todo = 10,8 GB); o menor HD da base que comporta, sem passar do máximo do DVR; no empate, o de menor consumo. Confere o que o gravador escreve por ano contra a carga de trabalho declarada do disco |
| Fonte | soma do consumo declarado das câmeras escolhidas ÷ 12 V, +20% (regra rotulada); a menor fonte da base com corrente acima disso. A promessa "alimenta N câmeras" da fonte não entra: ela supõe câmeras de 250 ou 300 mA |
| Cartão (Wi-Fi) | o cartão da base só entra se tiver o tamanho pedido; senão fica a especificação e o maior cartão da base vira alternativa, com quantos dias guarda. Vida útil pelos ciclos de gravação declarados |
| Distância | a informada contra o `alcanceCoaxialM` do manual da câmera escolhida |

Novas perguntas: imagem colorida à noite (passo 1) e, no DVR, o que importa mais
— 1080p cheio ou alerta de pessoas (passo 4). A segunda existe porque, na linha
MHDX 13xx, o modo que grava 1920 × 1080 desliga a detecção de pessoas; a lista
diz como configurar conforme a resposta.

**Cabeado (DVR ou NVR) — especificação quando não há ficha**

| Peça | Qtd. | Regra |
|---|---|---|
| Câmera bullet | pontos de fora | tecnologia do gravador, resolução, IP, visão noturna |
| Câmera dome | pontos de dentro | idem |
| Gravador | 1 | menor de 4/8/16/32 canais ≥ câmeras (+1 com folga) |
| HD de vigilância | 1 | câmeras × 24 h × dias × taxa declarada do gravador — **sem a taxa, não calcula** |
| Switch PoE (NVR) | 1 | menor de 4/8/16/24 portas ≥ câmeras; orçamento PoE ≥ soma declarada |
| Cabo | metros | câmeras × distância média × 1,10 (margem: regra do simulador) |
| BNC (DVR coaxial) | 2 por câmera | topologia |
| Balun (DVR com UTP) | 1 par por câmera | topologia |
| RJ45 (NVR) | 2 por câmera | topologia |
| P4 macho (DVR) | 1 por câmera | topologia |
| Fonte 12 V (DVR) | 1 por câmera com tomada perto; 1 centralizada sem | amperagem ≥ consumo declarado — confira |
| Caixa de passagem | 1 por ponto externo | se as emendas ficam expostas |
| Cabo gravador → roteador | 1 | se quer ver pelo celular |
| Monitor + HDMI | 1 + 1 | menor tela da base com HDMI declarado |
| Nobreak | 1 | da categoria `nobreaks`: watts declarados de gravador + HD + câmeras, +50% (regra rotulada); vale primeiro o que declara autonomia com gravador e câmeras (XNB 720), senão o menor que cabe; com fonte PFC ativo (EF 1210+), só onda senoidal |
| Ferramentas | 1 kit | se a pessoa instala |

Avisos: lance de cabo de rede acima de 100 m (padrão Ethernet); alcance do
coaxial depende da tecnologia do DVR; cartão máximo que não cobre os dias
pedidos; internet instável com gravação em nuvem.

## 2. Rede Wi-Fi — implementado em 29/09/2026

### Questionário

**Passo 1 — O que resolver:** o Wi-Fi não chega em vários lugares (mesh) /
falta sinal num cômodo só (repetidor) / trocar o roteador da operadora.

**Passo 2 — A casa** (não aparece para o repetidor): área em m², andares,
paredes (tijolo / concreto ou laje / drywall), sinal fora de casa e a área de
fora.

**Passo 3 — A internet:** plano (até 300 / 500 / 1 Giga+) e aparelhos
conectados ao mesmo tempo.

**Passo 4 — Cabos e computadores** (não aparece para o repetidor): aparelhos
por cabo perto do roteador e computadores sem Wi-Fi ou com Wi-Fi antigo.

**Ficou de fora do roteiro:** "já existe cabo de rede entre os cômodos". Nenhuma
ficha da base diz se as unidades mesh aceitam retorno por cabo; a pergunta não
mudaria a lista com honestidade.

### Regras

| Regra | Espécie |
|---|---|
| Cobertura por número de unidades, lida das fontes (`COBERTURA`): Deco X10 190/360/520 m² com 1/2/3; X50 e BE22 600 m² com 3; Halo H80X 460 m² com 2 | fabricante |
| Kit vendido pelo anúncio (`KIT_VENDIDO`); se a conta pede mais unidades, a avulsa entra na lista sem ficha | fabricante + topologia |
| Pelo menos uma unidade por andar | regra do simulador |
| 5 GHz declarado ≥ 2 × plano (`FATOR_PLANO`) | regra do simulador |
| Aparelhos declarados ≥ aparelhos da casa; quem não declara passa com "confira" | fabricante |
| Entre os que atendem: primeiro quem cobre com o kit anunciado, depois o de menor velocidade declarada | regra do simulador |
| Portas livres = LAN declaradas, menos a WAN quando a detecção é automática (`WAN_AUTOMATICA`); faltando porta, entra switch (que ocupa uma) | topologia |
| Repetidor: primeiro o de porta gigabit, depois o de maior 5 GHz | regra do simulador |
| Adaptador: o de maior 5 GHz; avisa quando fica abaixo do plano | fabricante |

Nenhum roteador ou repetidor da base declara área; o roteador avisa quando a
casa passa de 190 m² (a cobertura do Deco X10 com uma unidade, a única por
unidade declarada) ou de um andar.

## 3. Automação — implementado em 29/09/2026

Motor em `lib/simulador-automacao.ts`, tela em `components/simulador-automacao.tsx`.
Substituiu a matriz de dois cards de 28/09 (`lib/simulador.ts` ficou só com a
primeira pergunta, e `components/setup-simulator.tsx` saiu).

### Questionário

**Passo 1 — O que comandar:** luzes · aparelhos na tomada · cômodos com ar ou TV
(controle remoto) · cortinas · portão com motor · fechadura digital.

**Passo 2 — O que vigiar:** portas e janelas · ambientes com movimento · pontos
de vazamento · ambientes com fumaça.

**Passo 3 — Luzes** (se houver): trocar a lâmpada ou o interruptor? Lâmpada →
muda de cor? Interruptor → teclas por caixa (1/2/3) · tem neutro? (sim / não /
não sei).

**Passo 4 — Tomadas** (se houver): o aparelho mais forte (até 1.000 W, até
2.400 W, mais) · quer medir consumo?

**Passo 5 — Voz e internet:** Alexa / Google / só celular · precisa funcionar
sem internet?

### Regras

| Regra | Como |
|---|---|
| Um aplicativo só | o app (`appProprio`, ou a marca) que cobre mais tipos pedidos com ficha; empate vai para quem tem mais fichas que declaram funcionar sem nuvem, depois para o assistente pedido. Peça de outro app entra com aviso de segundo aplicativo |
| Ordem entre candidatas | mesmo app › declara funcionar sem nuvem (se pedido) › declara o assistente › maior garantia |
| Interruptores | luzes ÷ teclas, para cima (regra rotulada). Sem neutro ou "não sei" → só quem declara `precisaNeutro: false`; se ninguém declara, o que precisa, com aviso |
| Tomada | `cargaMaxW` ≥ o aparelho mais forte; `medeConsumo` se pedido. Acima da maior carga da base → relé de potência, sem ficha |
| Controle IR | um por cômodo: o infravermelho não atravessa parede |
| Central (hub) | só entra se uma peça escolhida tem `precisaHub: true`; do mesmo app; `dispositivosHub` confere a capacidade |
| Wi-Fi | aviso com o número de aparelhos novos no 2,4 GHz, e o link para o simulador de Wi-Fi |
| Sem internet | conta quantas peças declaram `funcionaSemNuvem`; as outras "a regra é supor que param" |
| Fechadura e cortina | sem ficha: especificação e o que conferir |

Campos novos em `camposCasaConectada` (29/09/2026): `precisaHub`,
`precisaNeutro`, `teclas`, `alimentacao`, `alcanceM`, `dispositivosHub`.

## Fila de fichas a apurar

Na ordem de quantos projetos cada uma completa. Mesmas regras de qualquer ficha
do site: página oficial, link na Amazon conferido pelo título do anúncio, foto
licenciada.

**Câmeras (fecha o cabeado)**
1. ~~DVR Intelbras~~ — **feito em 29/09/2026**: 7 Intelbras e 3 Hikvision, categoria `cftv`
2. ~~Câmeras HDCVI Intelbras, bullet e dome~~ — **feito**: 11 câmeras
3. ~~HD de vigilância~~ — **feito em 29/09/2026**: WD Purple 1, 2, 4, 6 e 8 TB; SkyHawk 1, 2, 4 e 6 TB
4. ~~Cartão microSD de vigilância~~ — **feito**: WD Purple 32, 64, 128 e 256 GB (Intelbras)
5. ~~Fonte 12 V~~ — **feito**: Intelbras EF 1201L, 1202, 1203, 1205 e 1210+, mais as fontes nobreak EFB 1201 e EFB 0501
6. NVR e câmeras IP Intelbras
7. Switch PoE
8. Cabo coaxial bipolar, UTP, conectores, balun
9. ~~Nobreak~~ — **feito em 29/09/2026**: categoria `nobreaks`, 18 fichas de 7 marcas.
   O motor soma só watts declarados — nunca o VA do nome — e só escolhe entre
   nobreaks que declaram watts (9 de 18). Com fonte perto de cada câmera, o
   nobreak segura só o gravador, e a lista diz isso. Autonomia não é calculada:
   só aparece quando o fabricante declara um cenário com câmeras.

**Automação:** hub, interruptor/relé, sensores e controle IR — em apuração em 29/09/2026 (Tapo, Positivo, Intelbras e outras com página oficial). Fechadura digital e motor de cortina ficam para depois.

**Wi-Fi:** switch, cabo de rede, unidade avulsa do Deco X10 e do Deco X50.

## Próximas ferramentas (pedido do Allan em 29/09/2026)

Ferramentas de ajuda à compra, no mesmo método: pergunta sobre a casa, conta à
vista, produto da base com fonte, lacuna escrita. Ordem proposta:

1. ~~**Ar-condicionado para o tamanho do cômodo.**~~ **Feito em 29/09/2026**
   (`lib/simulador-ar.ts`, `components/simulador-ar.tsx`, quarto projeto do
   /simulador). A conta é a do simulador de capacidade da LG Brasil, lida no
   código da página: 600 BTU/m² + 600 por pessoa, +20% no Norte, Nordeste e
   Centro-Oeste, +15% com muito sol, +400 por TV, +600 por computador e por
   geladeira; área até 100 m². Escolhe o menor tamanho da base que cobre a
   conta e, dentro dele, o menor consumo anual declarado; a área que a
   Electrolux declara aparece ao lado, porque as duas regras nem sempre batem.
2. ~~**Nobreak para qualquer carga.**~~ **Feito em 29/09/2026** (`lib/simulador-nobreak.ts`,
   `components/simulador-nobreak.tsx`, quinto projeto do /simulador). A pessoa
   digita os watts da etiqueta de cada aparelho — o site não tem fonte para um
   valor típico. Folga de 50% (a mesma do projeto de câmeras); só nobreaks que
   declaram watts; com PFC ativo, só quem declara servir; "não sei" põe esses
   primeiro. Autonomia só a declarada, com a carga do fabricante.
3. **Air fryer pelo tamanho da família.** Pela capacidade útil do cesto, não
   pela da caixa; só 6 de 10 fichas publicam o útil.
4. **Refil do purificador de água.** Consumo da casa em litros por dia contra a
   vida útil do refil em litros, e não o "6 meses" da ficha.
5. **Disjuntor do cooktop de indução.** Potência declarada ÷ tensão; só 3 de 16
   fichas escrevem o disjuntor.

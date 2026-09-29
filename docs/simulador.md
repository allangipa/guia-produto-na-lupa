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
| Automação | simples (perfil) | matriz fixa | idem |

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
| Câmera externa | bullet, 1080p, instalação externa, alcance noturno ≥ pedido, colorida se pedido; a de menor consumo declarado |
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
| Nobreak | 1 | potência ≥ gravador + fonte/switch — confira |
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

## 3. Automação — a fazer

1. O que automatizar: luzes, tomadas, IR (ar/TV), portão, cortina, fechadura,
   sensores (porta, movimento, fumaça, vazamento) — e quantos de cada
2. Luzes: trocar a lâmpada ou o interruptor? Interruptor → tem neutro na caixa?
3. Tomadas: o que vai ligar → `cargaMaxW`
4. Assistente: Alexa / Google / nenhum → `assistentes`
5. Funcionar sem internet → `funcionaSemNuvem`
6. Medir consumo → `medeConsumo`

Regra de protocolo: muitos dispositivos ou exigência de funcionar sem internet
→ Zigbee, e entra o hub.

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
9. Nobreak (categoria própria: serve a câmera, roteador e computador)

**Automação:** hub Zigbee, interruptor/relé, sensores, controle IR.

**Wi-Fi:** switch, cabo de rede, unidade avulsa do Deco X10 e do Deco X50.

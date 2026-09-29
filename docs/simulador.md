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
| Câmeras de segurança | completo, 5 passos | lista de compras | `lib/simulador-cameras.ts`, `components/simulador-cameras.tsx` |
| Rede Wi-Fi | simples (tamanho + perfil) | matriz fixa | `lib/simulador.ts`, `components/setup-simulator.tsx` |
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

**Cabeado (DVR ou NVR)**

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

## 2. Rede Wi-Fi — a fazer

1. Área em m² e número de andares
2. Paredes: alvenaria / concreto ou laje / drywall
3. Área externa que precisa de sinal
4. Velocidade do plano (até 300 / 500 / 1 Gb+) → porta gigabit em todo o caminho
5. Aparelhos conectados ao mesmo tempo → `dispositivosSimultaneos`
6. O que ligar por cabo (TV, videogame, PC) → pontos cabeados
7. Já existe cabo de rede entre os cômodos → mesh com retorno por cabo
8. Computador sem Wi-Fi ou com Wi-Fi antigo → adaptador USB

Lista: mesh (unidades pela cobertura declarada **do kit à venda**), adaptador,
switch se faltar porta, cabos com metragem, RJ45, unidade extra para a área
externa.

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
1. DVR Intelbras (4 e 8 canais) — precisa declarar a taxa de gravação e o HD máximo
2. Câmeras HDCVI Intelbras, bullet e dome
3. HD de vigilância (Seagate SkyHawk, WD Purple)
4. Cartão microSD de vigilância (fecha também o Wi-Fi)
5. NVR e câmeras IP Intelbras
6. Switch PoE
7. Fonte 12 V, cabo coaxial bipolar, UTP, conectores, balun
8. Nobreak

**Automação:** hub Zigbee, interruptor/relé, sensores, controle IR.

**Wi-Fi:** switch, cabo de rede.

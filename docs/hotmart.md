# Hotmart no Guia Produto na Lupa — proposta (18/10/2026)

Rascunho para o Allan decidir. Nada disto está no site nem no código.

## Onde entra

Curso e e-book não são produto físico: não têm ficha de fabricante, e a nota
de cinco critérios (`PESOS_CRITERIOS`) não se aplica a eles. Por isso a Hotmart
**não ganha análise, nota nem categoria própria**. Entra só como passo seguinte
de uma peça que já existe, quando o leitor quer fazer o serviço sozinho:

| Peça do site                         | Tipo de produto Hotmart                 |
|--------------------------------------|-----------------------------------------|
| Simulador e guias de câmeras         | Curso de instalação de CFTV             |
| Simulador de automação residencial   | Curso de Home Assistant / Alexa         |
| Simulador de rede Wi-Fi              | Curso de configuração de Wi-Fi e mesh   |
| Cooktop, nobreak, ar-condicionado    | Curso de elétrica residencial (NBR 5410)|
| Air fryer                            | E-book de receitas (baixo valor, por último) |

Teste: de 3 a 5 produtos em Câmeras e Casa conectada, por dois meses, com o clique
medido em `components/loja-cta.tsx` como já é feito com a Amazon.

## Critério de seleção (para publicar em /metodologia)

As mesmas regras da casa, traduzidas para curso:

1. **Produtor identificável pelo nome e com histórico verificável.** Nome
   completo publicado e uma trajetória que dá para conferir fora da página de
   venda (cargo em empresa do setor, artigos assinados, anos de Hotmart com
   avaliações). CNPJ não é exigido: decisão do Allan em 23/10/2026, porque
   nenhum dos cinco primeiros candidatos publica CNPJ. Produtor anônimo, com
   nome de fantasia sem pessoa por trás, não entra.
2. **Ementa publicada.** Módulos e aulas listados na página de venda. Promessa
   de resultado ("fature R$ X") não conta como ementa.
3. **Garantia escrita.** Prazo em dias na página. O mínimo legal é 7 dias
   (art. 49 do CDC); vale registrar quando o produtor oferece mais.
4. **Norma técnica, quando o assunto pede.** Elétrica cita a NBR 5410 e a NR-10.
   Curso de elétrica que ensina a "fazer sozinho" sem falar de segurança e de
   quando chamar um eletricista não entra.
5. **Data de atualização.** Curso de software (Home Assistant, roteador) sem
   data, ou com data de mais de dois anos, não entra.
6. **Nada de alegação de mercado sem fonte.** "Mais vendido", "nº 1" e renda
   prometida na página de venda não são repetidos no site.

## Como escrever

- Nunca "fizemos o curso" ou "o curso ensina bem". Escrever "a ementa
  publicada lista X", da mesma forma que "a marca declara X".
- Lacuna escrita, como na ficha: carga horária, data de atualização, se o
  certificado tem reconhecimento ou não. A seção "O que o produtor não informa"
  é a contribuição do site.
- A nota e a avaliação de alunos da Hotmart não entram em `aggregateRating`
  nem em nota nenhuma (mesma regra das avaliações de lojas).
- Imagem só do material de divulgação que o produtor libera para afiliados,
  com `credito` e `origem`.

## Ajustes técnicos, se aprovado

- Nova loja `hotmart` em `LOJAS` (`lib/site.ts`). O hotlink da Hotmart passa
  intacto, como o do Mercado Livre, com `rel="sponsored nofollow"`.
- Texto de divulgação próprio na linha de comissão, porque a Hotmart paga
  comissão sobre produto digital e não sobre compra na loja.
- Cada produto Hotmart conta como um bloco de CTA no teto de três por página.
- Página de privacidade: incluir a Hotmart entre os programas de afiliado.

## Mercado de Afiliação, logado (23/10/2026)

Conta do Allan é **Pessoa Física**. Alguns produtos aceitam só CNPJ (o próprio
Hotmart Pages e Send, por exemplo) — conferir em cada um.

O que a busca mostrou:

- CFTV: 120 produtos. Automação residencial: 128. Eletricista residencial: 133.
  Home Assistant: 12. Wi-Fi/roteador: 6, quase tudo e-book de segurança de
  rede ou promessa de renda — **Wi-Fi fica de fora por enquanto**.
- A grande maioria tem **zero avaliações**. Avaliação não entra no site, mas
  ajuda a cortar a fila: produto sem nenhuma, de produtor sem histórico, não
  vale a apuração.
- O curso de Home Assistant da pesquisa pública (5,0, 26 avaliações) **não
  aparece no mercado de afiliação**: sem programa de afiliados aberto.

Candidatos mais fortes:

| Curso | Produtor | Preço máx. | Comissão até | Afiliação | Cookie | Avaliações |
|---|---|---|---|---|---|---|
| Instalador de Câmeras de Vigilância (ID 143939) | Claudemir Martins (Hotmart desde 2014) | R$ 497 | R$ 223,65 | 1 clique | eterno | 4,5 (14) |
| Técnico de CFTV Express (ID 110677) | Claudemir Martins | R$ 697 | R$ 313,75 | 1 clique | eterno | 3,7 (7) |
| Como configurar acesso remoto a DVRs, NVRs e câmeras (ID 113594) | Claudemir Martins | R$ 137 | R$ 61,47 | 1 clique | eterno | 4,0 (7) |
| Guia Definitivo do CFTV vol. 1 (ID 166681) / vol. 3 | Claudemir Martins | R$ 67 / R$ 97 | R$ 29,94 / R$ 34,76 | 1 clique | eterno | 4,4 (32) / 4,2 (9) |
| Expert em Automação Residencial (ID 856438) | DIERtech (desde 2020) | R$ 997 | R$ 359,12 | por aprovação | eterno | 5,0 (5) |
| Automação Residencial por Wi-Fi | — | R$ 27 | R$ 16,68 | — | — | 5,0 (5) |
| Integrador de Automação Residencial | — | R$ 249 | R$ 11,19 | — | — | 5,0 (4) |
| Eletricista Residencial Prático | — | R$ 200 | R$ 23,36 | — | — | 4,9 (7) |

"—" = não conferido ainda na página de detalhes.

Notas:

- Claudemir Martins é o produtor mais sólido achado: 12 anos de Hotmart, uma
  linha inteira de CFTV em três idiomas, material de divulgação (4 banners,
  1 vídeo). O curso de **acesso remoto a DVR/NVR** casa direto com as fichas
  de DVR Intelbras que o site já tem.
- O *Técnico de CFTV Express* descreve o curso em tom de venda e não publica
  carga horária nem ementa no mercado; precisa abrir a página de vendas.
- DIERtech publica e-mail de suporte (Gmail), mas não CNPJ no mercado.
  Curso para eletricistas e engenheiros, não para o morador.

## Fichas das páginas de venda (23/10/2026)

Fonte de cada ficha: a página de vendas que o botão "Página de vendas" do
Mercado de Afiliação abre, consultada em 23/10/2026. Os quatro de Claudemir
Martins ficam em aprendacftv.com ("Copyright - Aprenda CFTV.com").

Produtor dos quatro primeiros: Claudemir Martins, que a página apresenta como
ex-técnico eletricista e ex-gerente de treinamento da Samsung Techwin para a
América Latina, com recortes de revistas do setor (IP News, Digital Security,
Revista Segurança Brasileira). **Nenhuma das páginas publica CNPJ ou razão
social**, nem e-mail ou canal de contato.

### Técnico de CFTV Express — go.hotmart.com/W4672876F

| Campo | O que a página publica |
|---|---|
| Formato | Vídeo, em portal próprio |
| Ementa | **Sim**: boas-vindas + 13 módulos (introdução, tipos de câmera, componentes, tecnologias CVBS/TVI/CVI/AHD/SDI, lentes, cabos e crimpagem, DVR, instalação prática, princípios de imagem, NVR/IP, software de gravação, compatibilidade/protocolos, menus de câmera IP) |
| Número de aulas | Não informa ("dezenas de vídeos") |
| Carga horária | Não informa |
| Garantia | 15 dias |
| Acesso | Vitalício |
| Certificado | De conclusão, gerado pelo sistema; sem reconhecimento declarado |
| Atualização | Diz que recebe vídeos novos; sem data de nenhuma |
| Bônus | Curso de acesso remoto (R$ 137) e um segundo curso de R$ 497 |
| Preço | R$ 697 à vista ou 12 × R$ 67,91 |

Alegações que o site não repetiria: renda extra "em apenas 15 dias", "95% de
quem trabalha na área não sabe desses conceitos", reportagem do G1 de 2017
sobre desemprego, contador de "oferta termina em" parado em zero.

**Veredito pelo critério: passa no 2, 3 e 5 em parte; falha no 1 (sem CNPJ) e
no 6 (promessa de renda).** É o melhor dos quatro em ementa.

### Como configurar acesso remoto a DVRs, NVRs e câmeras — go.hotmart.com/F4777504L

| Campo | O que a página publica |
|---|---|
| Formato | Vídeo, em portal próprio, de 224p a 1080p |
| Ementa | **Não**: só a lista de temas que aparece como bônus na página do Express (redirecionamento de portas, NAT, DVR, roteador, celular) |
| Número de aulas / carga horária | Não informa |
| Garantia | 15 dias |
| Acesso | Sem limite de tempo |
| Certificado | De conclusão |
| Atualização | Diz que é atualizado; sem data |
| Preço | R$ 137 ou 12 × R$ 13,35 |

**Problema grave: um dos depoimentos é assinado "John Doe, UI/UX Designer"** —
o nome-modelo de template, deixado na página. Depoimento de mentira na
página de venda.

**Veredito: não entra.** Sem ementa e com depoimento falso.

### Guia Definitivo do CFTV — Volume 1 — go.hotmart.com/L6315539C

| Campo | O que a página publica |
|---|---|
| Formato | E-book em PDF |
| Ementa | **Sim, detalhada**: ~35 capítulos (luz, cabos e distâncias, coaxial e crimpagem, fontes e corrente, aterramento e loop de terra, tipos de câmera, lentes e guia de lentes, CCD/CMOS, TVL e resolução digital, DVR, reset e recuperação de senha, AHD/TVI/CVI/CVBS/SDI, WDR/BLC, balanço de branco, fps, obturador, projeto exemplo) |
| Páginas | Não informa ("centenas de páginas") |
| Escopo | **Só CFTV analógico**: a própria página diz que IP fica para outro volume |
| Garantia | 7 dias |
| Acesso | Download; novas versões pela mesma página |
| Atualização | Diz que há versões novas; sem data nem número de versão |
| Preço | R$ 67 à vista ("de R$ 97") |

Alegações: "qualquer pessoa pode aprender CFTV a partir do zero", contador de
oferta parado em zero. Bem mais contido que os cursos.

**Veredito: o mais próximo de entrar.** Ementa e escopo honestos (diz o que
não cobre). Falta CNPJ. Ressalva para o site: é analógico, e as fichas de
DVR/câmera do site são quase todas híbridas ou IP.

### Instalador de Câmeras de Vigilância — go.hotmart.com/E5667129B

Redireciona para `cursos.aprendacftv.com/instalador`, que **não abriu** em
23/10/2026: falha de TLS no terminal e no navegador do app. Sem a página não
há ficha. **Conferir num navegador comum**; se continuar fora do ar, não
entra (link de afiliado para página quebrada).

### Expert em Automação Residencial (DIERtech) — go.hotmart.com/U34935349C

Redireciona para `diertech.com/expert`, que **não abriu** em 23/10/2026: o
domínio não resolve pelo DNS local e responde 400 pelo IP. Nenhum resultado
de busca menciona o curso ou a empresa fora da Hotmart. A afiliação é por
aprovação, então o produtor teria de aceitar. **Conferir num navegador
comum** antes de pedir afiliação.

### Resumo

| Curso | Ementa | Garantia | CNPJ | Alegação de renda | Entra? |
|---|---|---|---|---|---|
| Guia Definitivo do CFTV vol. 1 | Sim | 7 dias | Não | Branda | **Quase** — falta CNPJ |
| Técnico de CFTV Express | Sim | 15 dias | Não | Forte | Não, como está |
| Acesso remoto a DVR/NVR | Não | 15 dias | Não | Sim | Não (depoimento falso) |
| Instalador de Câmeras | ? | ? | ? | ? | Página fora do ar |
| Expert em Automação | ? | ? | ? | ? | Página fora do ar |

Nenhum publica CNPJ. **Em 23/10/2026 o Allan afrouxou o critério 1** (ver
acima) e escolheu seguir com o **Guia Definitivo do CFTV vol. 1**. Claudemir
Martins passa pelo novo critério: nome completo, trajetória de gerente de
treinamento da Samsung Techwin citada em revistas do setor, e na Hotmart
desde 2014.

## Afiliação ativa

**Guia Definitivo do CFTV vol. 1** — afiliado em 23/10/2026 (conta PF; o
Allan aceitou os termos do programa). Condições na confirmação: afiliação
aberta, **50% de comissão**, último clique, cookie eterno, aceita PF e PJ.

| Link | Para onde vai |
|---|---|
| `https://go.hotmart.com/R108162981L` | **Página de vendas** (aprendacftv.com, com `?ref=`) — o link que o site usa |
| `https://go.hotmart.com/R108162981L?dp=1` | Página do produto no marketplace da Hotmart |
| `https://go.hotmart.com/R108162981L?ap=c00e` | Página com vídeo de amostra do guia |
| `https://go.hotmart.com/R108162981L?ap=9f90` | Checkout direto (não usar: pula a página que o leitor precisa ler) |

O hotlink passa **intacto**, como o do Mercado Livre — a Hotmart exige o
formato original para rastrear a comissão.

### Onde entra no site

O guia é de **CFTV analógico** (DVR, câmeras AHD/TVI/CVI, coaxial, fonte,
aterramento). O encaixe é com o que o site já tem de DVR:

- `content/guias/dvr-para-casa.mdx` — depois das lacunas, como "quer instalar
  você mesmo?";
- resultado do simulador de câmeras (`components/simulador-cameras.tsx`),
  quando o projeto sai com DVR;
- `content/reviews/intelbras-mhdx-1316.mdx` e o comparativo MHDX 1304 ×
  Hikvision DS-7204HGHI-K1 só se couber sem passar do teto de três blocos.

Não entra em peça de câmera IP/NVR (XNB 720): o próprio guia diz que não
cobre IP.

## Pesquisa inicial no marketplace (18/10/2026)

Candidatos para apurar, ainda sem nenhuma aprovação:

- CFTV: [Curso Instalação de Câmeras CFTV 2.0](https://www.hotmart.com/product/curso-instalador-de-cameras-cftv/G16930040Q),
  [Curso Completo de CFTV (Parkseg)](https://hotmart.com/pt-br/marketplace/produtos/hagsxd-curso-completo-de-cftv-fundamentos-instalacao-e-configuracao-epgge/L100525110V),
  [Curso técnico em CFTV (Proseg)](https://hotmart.com/pt-br/marketplace/produtos/curso-tecnico-em-cftv/G105970964R),
  [Academia da Segurança Eletrônica](https://hotmart.com/pt-br/marketplace/produtos/academia-da-seguranca-eletronica-do-zero-a-primeira-instalacao/W105755743J)
- Automação: [Home Assistant – A Transformação da sua Casa](https://hotmart.com/pt-br/marketplace/produtos/cursodehomeassistant/F84684136L),
  [Automação de A a Z (e-book)](https://hotmart.com/pt-br/marketplace/produtos/automacao-de-a-a-z/H84329003R)
- Wi-Fi: [Wi-Fi na Prática](https://hotmart.com/pt-br/marketplace/produtos/curso-wi-fi-na-pratica-configure-redes-como-um-profissional-do-zero-ao-avancado/C104125263M)
- Elétrica: [Curso de Eletricista Residencial Monofásica Avançado](https://hotmart.com/pt-br/marketplace/produtos/curso-de-eletricista-residencial-monofasica-avancado/B99982273L) (NBR 5410, DR/DPS),
  [Elétrica Residencial e Predial: do Zero ao Primeiro Orçamento](https://hotmart.com/pt-br/marketplace/produtos/hagsxd-curso-de-eletrica-predial-ku41s/B104290185V),
  [Eletrificação 4.0](https://hotmart.com/pt-br/marketplace/produtos/eletrificacao-4-0-domine-instalacoes-eletricas-e-ia-aplicadas/O103082464X)

Primeiro teste do critério: a página do *CFTV 2.0* não publica CNPJ, carga
horária, data de atualização nem prazo de garantia, e mostra só um selo
"Bem Avaliado", sem nota. **Pelo critério acima, ele não entra.** A Hotmart
mostra a comissão e as regras de divulgação de cada produto só na área de
afiliado, com login; essas informações precisam ser conferidas lá.

# Guia Produto na Lupa — contexto do projeto

Site de análises de tecnologia e acessórios, monetizado por afiliados da Amazon e
do Mercado Livre. Dono e autor: Allan Vitor. Irmão do viagemnalupa.com.br, que é
HTML estático puro e compartilha a mesma família tipográfica.

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

Repositório local em `C:\Users\allan\OneDrive\Documentos\GitHub\guia-produto-na-lupa`.
Fica dentro do OneDrive — confira `git fetch` antes de editar, sob risco de a cópia
local estar atrás do remoto.

## Estrutura de conteúdo

```
/                      home: guias, análises recentes, categorias
/categorias/<slug>     hub da categoria (noindex enquanto vazia)
/guias/<slug>          pilar "melhores X" — um pick por perfil de leitor
/comparativos/<slug>   duelo direto, vencedor definido por perfil
/reviews/<slug>        análise individual
/metodologia           critérios de nota e como o site ganha dinheiro
/sobre                 quem escreve (ainda com texto placeholder)
```

Fluxo pretendido: a busca chega pelo guia, o guia manda para o comparativo ou a
análise, e o clique de afiliado acontece na análise, com o leitor já decidido.

Categorias em `lib/categorias.ts` (oito, do nicho de tecnologia e acessórios).
Cada peça declara `categoria:` no frontmatter. Só abrir categoria nova quando
houver três peças para ela; nunca publicar guia sem análise ou comparativo para
linkar.

Tipos do frontmatter em `lib/conteudo.ts` — se faltar campo, o build quebra.

## Regras editoriais (inegociáveis)

- **A lacuna fica escrita.** Dado não verificado vai para o campo `lacunas`, nunca
  vira estimativa com cara de teste. Mesma regra do viagemnalupa.
- **Nunca inventar uso ou medição.** Só afirmar o que veio de uso real do Allan,
  de dado do fabricante (identificado como promessa) ou de padrão repetido de
  reclamação de compradores.
- Contras antes dos prós, no mesmo peso visual.
- Toda análise tem "não compre se você" — o veredito de exclusão é o que dá
  autoridade.
- Sem preço em texto: a Amazon só autoriza exibir preço via Product Advertising
  API, com horário da consulta.
- Nota editorial de 0 a 10 por critério ponderado, documentada em `/metodologia`.

## Regras técnicas de afiliado

- Link da Amazon recebe a tag via `lib/site.ts`; o do Mercado Livre passa intacto,
  como o programa exige (nada de encurtador ou redirect interno).
- `rel="sponsored nofollow"` em todo link de loja.
- Máximo de três CTAs por página, sempre depois de uma entrega de valor.
- JSON-LD com `Product` + `Review` usando a nota editorial. **Sem
  `aggregateRating`** até existir avaliação real de leitores no site.
- Divulgação de afiliado acima da dobra em toda página de conteúdo.

## Identidade visual

Uma única cor de ação no site inteiro: verde-petróleo `#0F6E6C`. Tinta `#14181B`,
superfície `#F1F4F3`, linha `#DDE3E1`. Botão sólido só em CTA.

Fraunces nos títulos, Archivo na interface, IBM Plex Mono nos números — as mesmas
do viagemnalupa, de propósito, para os dois sites lerem como uma rede.

Marca: lupa com deerstalker, sem rosto. SVGs em `public/marca/` (símbolo e marca
horizontal, cada um em cor, mono e fundo escuro). `app/icon.svg` é o favicon.

Proibido no projeto: carrossel, contador regressivo, selo de oferta, pop-up,
banner lateral, qualquer animação automática. O site tem que parecer publicação,
não loja.

## Estado atual e próximos passos

- Conteúdo hoje é só demonstração, com produtos fictícios: um review, um
  comparativo e um guia, todos na categoria `energia`. **Apagar antes de publicar
  de verdade.**
- `/sobre` está com texto placeholder e precisa ser escrito em primeira pessoa,
  com foto real — é o que mais pesa em E-E-A-T.
- Não se inscrever no Amazon Associates antes de ter de cinco a dez análises
  reais: o programa avalia o site no cadastro e exige vendas qualificadas em
  prazo depois da aprovação.
- Variável `NEXT_PUBLIC_AMAZON_TAG` ainda vazia no repositório.
- Falta ligar analytics. O evento `clique_afiliado` já dispara com loja, produto e
  posição do botão, pronto para Plausible ou GA4.
- Falta cadastrar o sitemap no Search Console.
- Confirmar no painel do Mercado Livre a janela de cookie vigente: as fontes
  públicas se contradizem (24 h e 30 dias).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

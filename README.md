# Guia Produto na Lupa

Site de análises de tecnologia e acessórios em Next.js 16 (App Router) + Tailwind 4.
Conteúdo em MDX versionado no repositório, páginas geradas estaticamente.

## Rodar

```bash
npm install
cp .env.example .env.local   # preencha NEXT_PUBLIC_AMAZON_TAG quando tiver o ID
npm run dev                  # http://localhost:3000
npm run build && npm start   # build de produção
```

## Estrutura do site

```
/                          home: guias em destaque, análises recentes, categorias
/categorias/<slug>         hub da categoria (noindex enquanto estiver vazia)
/guias/<slug>              pilar: "melhores X" — um pick por perfil de leitor
/comparativos/<slug>       duelo direto A vs. B com vencedor por perfil
/reviews/<slug>            análise individual: veredito, notas, prós, contras, lacunas
/metodologia               como as notas são dadas e como o site ganha dinheiro
/sobre                     quem escreve (E-E-A-T)
```

O fluxo de autoridade e de conversão é o mesmo: a busca chega pelo guia
("melhor powerbank"), o guia manda para o comparativo ou para a análise, e a
análise é onde o clique acontece — já com o leitor decidido.

Cada peça de conteúdo declara `categoria:` no frontmatter. As categorias vivem em
`lib/categorias.ts`; só abra uma nova quando tiver três peças para ela.

## Onde mexe o quê

| Quero mudar | Arquivo |
| --- | --- |
| Nome, URL, contato, ID de afiliado | `lib/site.ts` e `.env.local` |
| Fontes oficiais de uma peça | bloco `fontes:` no frontmatter do `.mdx` |
| Foto de produto e crédito | `produto.imagem` no frontmatter + `components/foto-produto.tsx` |
| Cores, fontes, tipografia do texto | `app/globals.css` (bloco `@theme`) |
| Escrever uma análise | `content/reviews/<slug>.mdx` |
| Escrever um comparativo | `content/comparativos/<slug>.mdx` |
| Escrever um guia de compra | `content/guias/<slug>.mdx` |
| Categorias do site | `lib/categorias.ts` |
| Marca (SVGs) | `public/marca/` e `app/icon.svg` |
| Botões das lojas | `components/loja-cta.tsx` |
| Tabela comparativa | `components/tabela-comparativa.tsx` |
| JSON-LD (Product/Review) | `lib/schema.tsx` |

O arquivo `.mdx` tem duas partes: o *frontmatter* (os dados estruturados que
alimentam veredito, notas, prós, contras, lacunas e schema) e o corpo em
markdown (a prosa). Os campos estão tipados em `lib/conteudo.ts` — se faltar um,
o TypeScript reclama no build.

## Decisões que não são acidente

- **Sem preço no texto.** A Amazon só autoriza exibir preço via Product
  Advertising API, com horário da consulta. Até ligar a API, o botão manda o
  leitor ver o preço na origem.
- **Link do Mercado Livre passa intacto.** O programa exige o link como foi
  gerado no painel; nada de encurtador, redirect interno ou `?utm=` colado por
  cima. O clique é medido por evento no analytics, não por URL intermediária.
- **`rel="sponsored nofollow"` em todo link de loja.** Exigência do Google para
  link comercial.
- **Sem `aggregateRating` no JSON-LD.** Só entra quando existir avaliação real de
  leitores no site. Inventar `ratingCount` para ganhar estrelinha é o caminho mais
  curto para ação manual.
- **Máximo de três CTAs por página**, sempre depois de uma entrega de valor.
- **Uma cor de ação no site inteiro.** Se só o botão é verde, ele não precisa
  piscar.

## Publicação (GitHub Pages + DNS na Hostinger)

O site é estático (`output: "export"`), então o mesmo fluxo do viagemnalupa serve
aqui — com uma diferença: o build roda no GitHub, não na sua máquina.

1. Crie um repositório novo (`guia-produto-na-lupa`) e suba este projeto. Um site
   por repositório: não misture com o repositório do viagemnalupa.
2. No repositório: Settings → Pages → Source = **GitHub Actions**.
3. Em Settings → Secrets and variables → Actions → Variables, crie
   `NEXT_PUBLIC_SITE_URL` (ex.: `https://guiaprodutonalupa.com.br`) e
   `NEXT_PUBLIC_AMAZON_TAG`.
4. Ajuste `public/CNAME` para o domínio que você vai usar e faça push na `main`.
   O workflow `.github/workflows/deploy.yml` builda e publica sozinho.
5. No painel da Hostinger, em Domínios → DNS, aponte o domínio:

| Caso | Tipo | Nome | Valor |
| --- | --- | --- | --- |
| Domínio próprio (apex) | A | @ | 185.199.108.153 |
| | A | @ | 185.199.109.153 |
| | A | @ | 185.199.110.153 |
| | A | @ | 185.199.111.153 |
| | CNAME | www | SEU-USUARIO.github.io |
| Subdomínio do viagemnalupa | CNAME | produto | SEU-USUARIO.github.io |

6. Settings → Pages → Custom domain: digite o domínio, salve, espere o check
   verde e marque **Enforce HTTPS**.

Detalhe que quebra o site silenciosamente: o GitHub Pages ignora pastas iniciadas
por `_`, e o Next gera `_next/`. Por isso o workflow cria `out/.nojekyll` — sem
esse arquivo o site sobe sem CSS nenhum.

Se um dia preferir publicar da sua máquina, `npm run build` gera a pasta `out/`
pronta para upload no Gerenciador de Arquivos da Hostinger.

## Antes de publicar de verdade

1. Trocar o conteúdo de demonstração em `content/` (produtos fictícios).
2. Criar de verdade a caixa `contato@guiaprodutonalupa.com.br`. Ela já está
   publicada em `/sobre`, em `/metodologia` e no rodapé de toda análise, e é o
   único canal de correção de um site que não tem autor-pessoa.
3. Preencher `NEXT_PUBLIC_AMAZON_TAG` e conferir no painel do Mercado Livre a
   janela de cookie vigente — as fontes públicas se contradizem (24 h e 30 dias).
4. Ligar um analytics (Plausible ou GA4). O evento `clique_afiliado` já dispara
   com loja, produto e posição do botão — é o que mostra qual CTA converte.
5. Cadastrar o sitemap no Search Console.

## Fontes

Carregadas por `<link>` do Google Fonts em `app/layout.tsx`: Fraunces (títulos),
Archivo (interface) e IBM Plex Mono (números). São as mesmas do Viagem na Lupa,
de propósito — identidade de rede. Para tirar a dependência externa, baixe os
`.woff2` para `public/fonts` e troque por `next/font/local`.

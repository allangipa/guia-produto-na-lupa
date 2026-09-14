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
| Nome, URL, autor, ID de afiliado | `lib/site.ts` e `.env.local` |
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

## Antes de publicar de verdade

1. Trocar o conteúdo de demonstração em `content/` (produtos fictícios).
2. Escrever `/sobre` em primeira pessoa, com foto real. É a página que mais pesa
   em confiança e em E-E-A-T.
3. Preencher `NEXT_PUBLIC_AMAZON_TAG` e conferir no painel do Mercado Livre a
   janela de cookie vigente — as fontes públicas se contradizem (24 h e 30 dias).
4. Ligar um analytics (Plausible ou GA4). O evento `clique_afiliado` já dispara
   com loja, produto e posição do botão — é o que mostra qual CTA converte.
5. Hospedar na Vercel, apontar o domínio e cadastrar o sitemap no Search Console.

## Fontes

Carregadas por `<link>` do Google Fonts em `app/layout.tsx`: Fraunces (títulos),
Archivo (interface) e IBM Plex Mono (números). São as mesmas do Viagem na Lupa,
de propósito — identidade de rede. Para tirar a dependência externa, baixe os
`.woff2` para `public/fonts` e troque por `next/font/local`.

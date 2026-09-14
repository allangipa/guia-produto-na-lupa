import type { Metadata } from "next";
import "./globals.css";
import { site } from "@/lib/site";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TrilhoDoSite } from "@/components/trilho-do-site";
import { scriptAntiFlash } from "@/components/tema";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.nome} — análises de tecnologia e acessórios`,
    template: `%s | ${site.nome}`,
  },
  description: site.descricao,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: site.nome,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // `suppressHydrationWarning` no <html>: o script anti-flash escreve data-tema
  // antes da hidratação, de propósito — é a única forma de evitar o flash branco
  // num site estático. O React precisa saber que essa diferença é esperada.
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Antes de qualquer pintura: evita o flash branco de quem escolheu escuro. */}
        <script dangerouslySetInnerHTML={{ __html: scriptAntiFlash }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,500;9..144,600&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-acao focus:px-4 focus:py-2 focus:text-papel"
        >
          Pular para o conteúdo
        </a>
        <SiteHeader />
        {/* Trilho lateral no desktop, como o de departamentos das lojas; no
            celular ele some e as pílulas do cabeçalho assumem. */}
        <div className="mx-auto grid max-w-[calc(var(--largura-ferramenta)+16rem)] lg:grid-cols-[15rem_1fr] lg:gap-6 lg:px-5">
          <TrilhoDoSite />
          <main id="conteudo" className="min-w-0">
            {children}
          </main>
        </div>
        <SiteFooter />
      </body>
    </html>
  );
}

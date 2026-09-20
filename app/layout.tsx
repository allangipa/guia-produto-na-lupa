import type { Metadata } from "next";
import { Archivo, Fraunces, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { scriptAntiFlash } from "@/components/tema";

/**
 * As fontes sao baixadas no build e servidas do proprio dominio.
 *
 * Antes vinham de fonts.googleapis.com e fonts.gstatic.com: dois dominios de
 * terceiros, cada um com DNS e TLS proprios, antes de o texto aparecer na
 * fonte certa. Medimos 129 kB em quatro arquivos, atras de dois handshakes
 * que no celular custam mais que os bytes.
 *
 * `display: "swap"` mantem o texto legivel na fonte de sistema enquanto a
 * definitiva nao chega — o leitor le antes, e a troca nao mexe no layout
 * porque as metricas de fallback sao calculadas pelo next/font.
 */
const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--fonte-texto",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
  variable: "--fonte-titulo",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--fonte-dado",
});

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
  // So aparece quando a variavel existe: sem token, nenhuma tag vazia no HTML.
  ...(site.verificacaoGoogle
    ? { verification: { google: site.verificacaoGoogle } }
    : {}),
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
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${archivo.variable} ${fraunces.variable} ${plexMono.variable}`}
    >
      <head>
        {/* Antes de qualquer pintura: evita o flash branco de quem escolheu escuro. */}
        <script dangerouslySetInnerHTML={{ __html: scriptAntiFlash }} />
        {/* Medição de audiência, só quando há ID configurado. `defer` porque
            nada na página depende dela — contador que atrasa a primeira
            pintura mede pior justamente quem ia embora antes de carregar. */}
        {site.umami.id && (
          <script defer src={site.umami.script} data-website-id={site.umami.id} />
        )}
      </head>
      <body>
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-acao focus:px-4 focus:py-2 focus:text-papel"
        >
          Pular para o conteúdo
        </a>
        <SiteHeader />
        {/* Sem trilho lateral: os chips do cabeçalho são a navegação, em
            toda largura, como na referência de loja. */}
        <main id="conteudo" className="min-w-0">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}

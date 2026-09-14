import type { NextConfig } from "next";

/**
 * Exportação estática: o build gera HTML puro em ./out, que sobe em qualquer
 * hospedagem de arquivos — a mesma do viagemnalupa.com.br. Sem servidor Node.
 */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;

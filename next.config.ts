import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  // Cache Components / Partial Prefetching ficam desligados: o runtime do Workers não implementa
  // setTimeout como o Next exige e as páginas travam (testado com OpenNext 1.20). Reavaliar depois.
  // ADR-01: na Cloudflare não há otimizador de imagens do Next.
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

// Disponibiliza os bindings da Cloudflare (getCloudflareContext) no `next dev`.
initOpenNextCloudflareForDev();

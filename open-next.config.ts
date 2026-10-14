import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Sem cache incremental (ISR) por enquanto: o app é quase todo dinâmico (sessão).
// Quando houver páginas estáticas com revalidate, ligue o cache em R2 aqui.
export default defineCloudflareConfig({});

# Placar

> A casa é de todo mundo. O placar também.

App de tarefas da casa com placar semanal (PWA). Next.js 16 + Supabase, hospedado na Cloudflare via OpenNext.

## Rodando localmente

Pré-requisitos: Node 22+, pnpm 10, Docker.

```bash
pnpm install
cp .env.example .env.local   # variáveis do app e dos testes
cp .env.example .env         # credenciais do Google lidas pelo Supabase CLI
make db-up                   # sobe o Supabase local e mostra as chaves
# copie a Publishable key e a Secret key para o .env.local
make dev                     # http://localhost:3000
```

Testes: `make test` (Vitest + pgTAP) e `make e2e` (Playwright). Veja todos os comandos com `make help`.

Documentação: [AGENTS.md](AGENTS.md) (stack, ADRs e convenções), [docs/roadmap.md](docs/roadmap.md), [docs/flows.md](docs/flows.md) e [docs/progress.md](docs/progress.md).

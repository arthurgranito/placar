# Placar — guia para agentes e pessoas desenvolvedoras

**Placar** é o app de tarefas da casa com placar semanal, feito como PWA para quem divide a casa (casais, repúblicas, amigos que dividem apê). A casa cadastra as tarefas com peso e frequência, cada pessoa marca o que fez com um toque, e o app mostra o **placar da semana** comparado com a **divisão combinada**. Slogan: _"A casa é de todo mundo. O placar também."_

- Escopo e ordem de construção: [`docs/roadmap.md`](docs/roadmap.md) (ADRs, modelo de dados, fases).
- Comportamento de cada tela, mensagens exatas e erros: [`docs/flows.md`](docs/flows.md) (F01…F56).
- Estado de cada fase e desvios: [`docs/progress.md`](docs/progress.md).
- Para implementar uma fase, use a skill `implementar-fase` (`.claude/skills/implementar-fase`).

## Stack

| Camada     | Escolha                                                                                   |
| ---------- | ----------------------------------------------------------------------------------------- |
| App        | Next.js 16 (App Router, `src/`), React 19, TypeScript `strict`                            |
| UI         | Tailwind CSS v4 + shadcn/ui (`src/components/ui`, estilo new-york), sonner para toasts    |
| Backend    | Supabase: Postgres + RLS, Auth (só Google), Storage. Cliente via `@supabase/ssr`          |
| Hospedagem | Cloudflare Workers com `@opennextjs/cloudflare` (`wrangler.jsonc`, `open-next.config.ts`) |
| Testes     | Vitest + Testing Library (unit), pgTAP (`supabase/tests`), Playwright (`e2e/`)            |
| Qualidade  | ESLint (next + prettier), Prettier (+ plugin Tailwind), `.editorconfig`, GitHub Actions   |
| Pacotes    | pnpm (Node 22+)                                                                           |

## Comandos (Makefile)

| Comando         | O que faz                                                                  |
| --------------- | -------------------------------------------------------------------------- |
| `make dev`      | Next em modo dev em http://localhost:3000 (precisa do `make db-up`)        |
| `make db-up`    | Sobe o Supabase local (Docker) e mostra URL e chaves                       |
| `make db-reset` | Recria o banco local: migrations + `supabase/seed.sql`                     |
| `make types`    | Regenera `src/lib/supabase/database.types.ts` a partir do banco local      |
| `make test`     | Vitest + pgTAP                                                             |
| `make e2e`      | Playwright (sobe o `next dev` sozinho; precisa do banco e do `.env.local`) |
| `make lint`     | ESLint + checagem do Prettier                                              |
| `make deploy`   | Build OpenNext + deploy na Cloudflare (precisa de `wrangler login`)        |

Outros: `make typecheck`, `make build`, `make cf-build` (build da Cloudflare, pega incompatibilidades de runtime), `make preview` (worker local em http://localhost:8787), `make db-test`, `make check` (lint + typecheck + test + build + cf-build). `make help` lista tudo.

Primeiro uso: `pnpm install`, `cp .env.example .env.local` e `cp .env.example .env`, `make db-up`, copie a _Publishable key_ e a _Secret key_ para o `.env.local`, `make dev`.

## Decisões de arquitetura (resumo dos ADRs)

1. **ADR-01 — Cloudflare, não Vercel.** Nada de APIs exclusivas da Vercel (`@vercel/*`, `next/og` com edge da Vercel, ISR da Vercel). Imagens com `images.unoptimized`. Cuidado com libs que dependem de APIs do Node no runtime do Workers (prefira Web Crypto, `fetch`). Rode `make cf-build` em toda fase.
2. **ADR-02 — Regras no banco.** Tudo que afeta pontos, sequência ou permissão fica no Postgres (constraints, triggers, funções), porque o navegador fala direto com o PostgREST. Toda tabela nasce com RLS e testes pgTAP.
3. **ADR-03 — Só Google e 18+.** Login exclusivo com Google; autodeclaração 18+ no onboarding (`confirm_adult()`).
4. **ADR-04 — Dia e semana lógicos da casa.** Calculados no banco (`household_day`, `household_week_start`) com o fuso e a virada da casa; nunca calcule datas no cliente para gravar.
5. **ADR-05 — Placar contra a divisão combinada.** Cada pessoa é comparada com a própria meta (`share_target`), não com as outras. Metas só mudam com aceite de todos.
6. **ADR-06 — Cards no navegador, com consentimento.** Canvas no cliente; nome/avatar de outro membro só com `show_in_cards = true`.
7. **ADR-07 — Premium por casa.** Uma pessoa paga, a casa toda ganha.
8. **ADR-08 — Uma casa por pessoa no MVP.** `UNIQUE(household_members.user_id)`.

## Regra de tom: "time, não culpa"

Vale para todo texto de tela, toast, push, e-mail e card. A casa é um time.

- Nenhuma mensagem compara pessoas de forma humilhante nem aponta culpado.
- Falar de alguém abaixo da meta é sempre **"falta X para chegar"**, nunca "fulano está devendo".
- Na dúvida, fale da casa ("a casa está 92% equilibrada"), não de uma pessoa contra a outra.
- Textos de interface em **português do Brasil**.

## Convenções

- **Textos do `docs/flows.md` são contrato.** Copie mensagens e rótulos literalmente; os testes e2e conferem as strings.
- **Supabase:** `@/lib/supabase/server` em Server Components, Server Actions e Route Handlers; `@/lib/supabase/client` em Client Components. Para saber quem está logado no servidor, use `requireProfile()` (`src/lib/auth/session.ts`), que valida o token com `getUser()`.
- **Proxy (antigo middleware):** no Next 16 o arquivo é `src/proxy.ts`. Ele só renova a sessão e barra rotas protegidas sem login (`src/lib/auth/paths.ts`); a autorização de verdade está nas páginas e na RLS.
- **Redirects pós-login** passam por `safeNextPath()` (evita open redirect).
- **Server Actions** validam a entrada com Zod e revalidam a sessão; esconder botão não é segurança.
- **Banco:** migrations versionadas em `supabase/migrations` (nunca edite uma migration já aplicada fora do local; crie outra). Funções `security definer` sempre com `set search_path = ''`. Grants por coluna quando o cliente só pode editar parte da linha. Depois de mudar o schema: `make types`.
- **Testes:** cada regra de banco tem pgTAP; cada fluxo com tela tem e2e cobrindo caminho feliz e erros; teste sempre com um usuário de outra casa quando houver dados da casa. Os e2e não usam o Google: criam usuários pela API admin do Supabase local (`e2e/support/supabase.ts`).
- **TODOs de fases futuras:** `// TODO(fase N): o quê`. Não puxe escopo de fases futuras.
- **Segredos:** nunca faça commit de `.env*`. Variável nova vai para `.env.example` com comentário de onde vem. Chave secreta do Supabase só no servidor/testes.
- **Commits:** Conventional Commits em português (`feat(db): ...`, `fix(auth): ...`). Uma branch por fase.

## Particularidades do Next 16 neste projeto

- `cacheComponents` e `partialPrefetching` estão **desligados**: com eles ligados o worker trava no runtime da Cloudflare (o `setTimeout` do Workers não se comporta como o Next exige). Reavalie quando o OpenNext suportar.
- Next fixado em **16.3.x**: o 16.4 gera um manifesto (`preview-props.json`) que o OpenNext 1.20 ainda não conhece. Só suba o Next depois de confirmar `make cf-build` + `make preview`.
- O `proxy.ts` roda no runtime Node; no OpenNext isso ainda é marcado como experimental (aviso no build). Funciona no preview local; acompanhe ao subir versões.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

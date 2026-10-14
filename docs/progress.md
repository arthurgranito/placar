# Placar — Progresso do roadmap

Estado de cada fase do [`docs/roadmap.md`](roadmap.md). Atualizado pela skill `implementar-fase`.

**Legenda:** ⬜ não iniciada · 🟡 em andamento · 🔍 aguardando sua verificação · ✅ concluída

| Fase | Nome | Status | Data | Custo mensal depois | Observações |
| --- | --- | --- | --- | --- | --- |
| 0 | Fundação do projeto | ✅ | 2026-10-14 | R$ 0 | Fundação feita do zero; a transição do Marcador não se aplica. Branch `feat/fundacao`. |
| 1 | Login com Google e perfil | ✅ | 2026-10-14 | R$ 0 | Fundação feita do zero; a transição do Marcador não se aplica. `profiles` já nasce no formato do Placar. TODO(fase 3): RLS de leitura dos membros da mesma casa. |
| 2 | Transição do Marcador para o Placar | ✅ | 2026-10-14 | R$ 0 | Fundação feita do zero; a transição do Marcador não se aplica. Entregue o que sobra da fase: onboarding /bem-vindo (F02), /casa/nova provisória, confirm_adult(), pgTAP de profiles e e2e do onboarding. TODO(fase 4): destino /hoje e F02-3a. |
| 3 | Esquema da casa, RLS e seeds | ⬜ | | R$ 0 | |
| 4 | Criar casa, convidar e entrar | ⬜ | | R$ 0 | |
| 5 | Tarefas | ⬜ | | R$ 0 | |
| 6 | Hoje, marcar feito e atividade da casa | ⬜ | | R$ 0 | |
| 7 | Placar semanal e divisão combinada | ⬜ | | R$ 0 | |
| 8 | Casa em dia, congelamento e conquistas | ⬜ | | R$ 0 | |
| 9 | PWA instalável e offline | ⬜ | | R$ 0 | |
| 10 | Cards de story | ⬜ | | R$ 0 | |
| 11 | Lembretes, cutucadas e resultado da semana (web push) | ⬜ | | R$ 0 | |
| 12 | Lista de compras compartilhada | ⬜ | | R$ 0 | |
| 13 | Aposta da semana e Wrapped do mês | ⬜ | | R$ 0 | |
| 14 | Segurança, LGPD e observabilidade | ⬜ | | R$ 0 | |
| 15 | Lançamento beta | ⬜ | | ≈ R$ 142–170 | |
| 16 | Premium da casa | ⬜ | | ≈ R$ 142–170 + % do Stripe | Só depois de 300+ casas ativas por semana. |

## TODOs deixados para outras fases

| Onde | O quê | Fase |
| --- | --- | --- |
| `supabase/migrations/20261014190000_profiles.sql` | Política de leitura dos perfis dos membros da mesma casa (`is_member`) | 3 |
| `src/app/auth/callback/route.ts` | Com casa, destino padrão pós-login vira `/hoje` (F03) | 4 |
| `src/app/bem-vindo/actions.ts` | F02-3a: quem já é membro de uma casa vai direto para `/hoje` | 4 |
| `src/app/sair/route.ts` | Pedir ao service worker para limpar caches com dados pessoais (F04) | 9 |
| callback e onboarding | Eventos `signup`, `login`, `onboarding_completed` | 14 |

## Desvios

- **Fases 0 a 2 feitas do zero (2026-10-14).** O roadmap assume que este repositório veio do "Marcador", mas aqui só havia docs e skills. A fundação foi construída do zero já como Placar, e a Fase 2 não teve o que remover: só entregou o onboarding novo. O texto "Ponto de partida" do roadmap continua descrevendo o cenário antigo.
- **Next.js 16.3.8, não 16.4.1.** O 16.4.1 (lançado em 2026-10-14) gera `.next/server/preview-props.json`, que o `@opennextjs/cloudflare` 1.20.11 não conhece: o worker devolve 500 (`Unexpected loadManifest(...)`). Subir quando o OpenNext suportar.
- **`cacheComponents` e `partialPrefetching` desligados.** Com eles, o worker trava no workerd (aviso do Next sobre `setTimeout` do runtime). As páginas usam renderização dinâmica comum.
- **`src/proxy.ts` em vez de `middleware.ts`.** É o nome novo no Next 16 (roda em Node). O OpenNext avisa que o middleware em Node é experimental na Cloudflare; testado no `make preview` (redirects e sessão funcionando).
- **Provedor de e-mail ligado no Supabase local.** Necessário para os e2e entrarem com usuários criados pela API admin. A interface só oferece Google; em produção, desligue o provedor "Email" no painel (anotar no checklist da Fase 15).
- **`ensure_profile()` (RPC extra).** Implementa o F01-4e ("o callback cria o profile se ele estiver faltando"), já que o cliente não tem permissão de insert em `profiles`.
- **Logout por POST.** O F04 fala em `GET /sair`; a rota aceita GET e POST, e o botão usa POST (formulário) para nenhum prefetch deslogar a pessoa.
- **`/termos` provisória.** Criada para o link do checkbox 18+; o texto final vem na Fase 14 e a revisão jurídica na 15.
- **Preview por PR antecipado da Fase 15 (2026-10-14).** Branch `chore/preview`. Todo PR roda os testes (`preview.yml` chama o `ci.yml`, que deixou de rodar sozinho em `pull_request`), aplica as migrations no Supabase de desenvolvimento na nuvem (`supabase link` + `supabase db push`, sem seed), faz o build do OpenNext apontando para ele e sobe uma versão de preview com `wrangler versions upload --preview-alias pr-N`, comentando a URL no PR (`https://pr-N-placar.<subdominio>.workers.dev`). O seed no dev é manual: workflow `seed-dev` (digite `dev` para confirmar). PRs de fork só rodam os testes (não recebem secrets). O secret `SUPABASE_DEV_ANON_KEY` alimenta `NEXT_PUBLIC_SUPABASE_ANON_KEY` e também `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, que é a que o app lê. Na Fase 15 falta o resto: projeto de produção, migrations só na `main` e domínio próprio.

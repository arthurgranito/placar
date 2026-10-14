# Placar — Skills, subagentes, MCPs e sessões na nuvem

Guia para deixar o Claude Code pronto para o Placar. Siga na ordem: **skills → subagentes → MCPs → nuvem → Fase 2**.

---

## 1. Instalar as skills

1. **Apague as versões antigas** (do Marcador) em `.claude/skills/implementar-fase`, `.claude/skills/card-compartilhavel` e `.claude/skills/post-instagram`.
2. **Descompacte os três arquivos `.skill` novos** (são zip) dentro de `.claude/skills/`.
3. **Copie `resumo.md`, `roadmap.md`, `flows.md` e este guia** para `docs/` (substituindo os do Marcador).
4. **Faça commit.** As skills e os docs precisam estar no repositório para funcionar nas sessões na nuvem.

| Skill | Para quê |
|---|---|
| `implementar-fase` | Executa uma fase do roadmap de ponta a ponta: plano, fatias com testes, verificação e conferência na tela. Já traz a lista de fases do Placar e as regras de "teste com usuário de outra casa" e "tom de time". |
| `card-compartilhavel` | Cards do placar, da casa em dia, das conquistas, da aposta e do Wrapped, com a regra de consentimento de nomes e o layout compacto para casas grandes. |
| `post-instagram` | Posts, Reels, carrosséis e calendário no tom "time, não guerra", com o verificador de legendas. |

---

## 2. Atualizar os subagentes

A skill `implementar-fase` continua na conversa principal (ela para no plano para esperar o seu OK, e subagentes não conseguem fazer perguntas). Os subagentes fazem o trabalho de apoio.

Cole este prompt **uma vez** no Claude Code:

```
Reescreva os 5 subagentes de projeto em .claude/agents/ para o Placar (app de tarefas da casa com placar semanal; leia AGENTS.md e docs/roadmap.md antes). Substitua o conteúdo antigo de cada arquivo. Todos com frontmatter válido começando em "---".

1) testador.md
- name: testador
- description: Roda a verificação completa do Placar e devolve só as falhas. Use proativamente depois de qualquer mudança de código e antes de concluir uma fase.
- tools: Read, Grep, Glob, Bash · model: sonnet
- Corpo: descobrir os comandos no Makefile/package.json; rodar sem parar no primeiro erro: lint, typecheck, unit, `supabase test db`, e2e, `next build` e o build da Cloudflare (opennextjs-cloudflare); para cada falha, devolver etapa, comando, arquivo:linha, mensagem em até 15 linhas e causa provável; com tudo verde, uma linha ✅ por etapa. Nunca alterar arquivos nem pular ou desligar testes.

2) revisor-seguranca.md
- name: revisor-seguranca
- description: Revisa migrations, RLS, funções SQL, server actions, rotas /api, Realtime e webhooks do Placar procurando vazamento entre casas, segredos expostos e regras de negócio contornáveis pelo cliente. Use proativamente quando uma mudança tocar supabase/migrations, server actions, rotas /api ou assinaturas do Realtime.
- tools: Read, Grep, Glob, Bash · model: opus · memory: project
- Corpo: consultar a memória; ler `git diff main...HEAD`; rodar `supabase test db`; checklist:
  (a) toda tabela com RLS e política por operação usando is_member/is_admin; nenhuma leitura entre casas, nem pelo Realtime;
  (b) household_members só entra pela RPC join_household (token válido, prazo, vaga do plano, 18+, uma casa por pessoa);
  (c) task_completions: done_by = auth.uid(), dia lógico calculado no banco, só hoje/ontem, desfazer só o próprio registro até 24h, pontos copiados do peso;
  (d) plan/premium_until/is_adult_confirmed nunca graváveis pelo cliente (grant por coluna);
  (e) funções security definer com search_path vazio e checagem de membro;
  (f) tokens de convite com 32+ caracteres aleatórios;
  (g) rotas de cron com segredo e webhook do Stripe com verificação de assinatura e idempotência;
  (h) rate limit em cutucadas, reações, convite e entrada;
  (i) cards respeitando show_in_cards;
  (j) service role só no servidor.
  Devolver Crítico / Importante / Sugestão com arquivo:linha e a correção proposta; não alterar código; ao terminar, salvar na memória os padrões recorrentes.

3) verificador-fluxos.md
- name: verificador-fluxos
- description: Confere se o código implementa o que docs/flows.md descreve: passos, alternativos, erros e mensagens exatas. Use antes de concluir uma fase ou quando pedirem para validar fluxos (ex.: "F21").
- tools: Read, Grep, Glob, Bash · model: sonnet
- Corpo: receber uma fase ou IDs de fluxo; com uma fase, rodar `python .claude/skills/implementar-fase/scripts/extrair_fase.py <N>`; para cada passo, alternativo e erro, achar no código onde é tratado e procurar o texto literal das mensagens com grep; devolver uma tabela item | ✅ implementado / ⚠️ diferente / ❌ ausente | arquivo:linha | observação, mais os totais. Mensagem com texto diferente conta como ⚠️. Também marcar ⚠️ qualquer texto de tela que fuja do tom "time, não culpa". Não alterar arquivos.

4) designer-cards.md
- name: designer-cards
- description: Cria e ajusta os cards de story do Placar (placar da semana, casa em dia, conquista, aposta, Wrapped) em src/features/cards e corrige problemas de geração e compartilhamento.
- tools: Read, Edit, Write, Bash, Grep, Glob · model: inherit · skills: [card-compartilhavel]
- mcpServers (inline, só para ele):
    - playwright:
        type: stdio
        command: npx
        args: ["-y", "@playwright/mcp@latest"]
- Corpo: seguir a skill; editar só src/features/cards/, os testes relacionados e public/fonts/; template novo sem brief claro → devolver o brief proposto sem implementar; garantir o teste da regra de consentimento (show_in_cards); ao terminar, abrir http://localhost:3000/dev/cards com o Playwright, exportar os PNGs, gerar a prancha com o prancha.py da skill (--area-segura) e devolver o caminho, os casos de borda cobertos e um roteiro curto para conferir no celular.

5) social-media.md
- name: social-media
- description: Escreve posts, roteiros de Reels, carrosséis e calendários de Instagram/TikTok do Placar. Use para qualquer pedido de conteúdo para redes sociais.
- tools: Read, Write, Edit, Grep, Glob, Bash · model: sonnet · skills: [post-instagram] · memory: project · mcpServers: [posthog]
- Corpo: seguir a skill; ler docs/progress.md e marketing/posts.md antes; salvar em marketing/semana-AAAA-MM-DD.md; validar todas as legendas com checar_legenda.py e corrigir os ❌; quando faltar informação, escrever as suposições no topo do arquivo; para análise de resultados, consultar no PostHog (só leitura) os eventos household_created por utm_campaign dos últimos 30 dias; registrar os aprendizados na memória.

Mostre os 5 arquivos finais e confirme que todos têm name e description.
```

Depois, reinicie o Claude Code e confira com `claude agents`.

**Como chamar os subagentes:** pelo nome ("use o testador") ou com `@`, por exemplo `@"revisor-seguranca (agent)" revisa a fase 3`.

---

## 3. MCPs

Rode na raiz do repositório. Adicione cada um **na fase em que ele passa a ser útil**, porque cada MCP ocupa contexto em toda conversa.

| MCP | Para quê no Placar | Quando |
|---|---|---|
| Supabase (local) | ver tabelas, rodar SQL, testar RLS e funções de dia/semana lógicos | já (Fase 2) |
| Cloudflare (docs) | documentação de Workers, Cron Triggers e OpenNext | já |
| Playwright | galeria de cards e conferência visual (inline no `designer-cards`) | Fase 10 |
| Sentry | erros de produção | Fase 14 |
| PostHog | casas criadas, convites aceitos, cards compartilhados, UTM | Fase 14 |
| Cloudflare (observability) | logs do app publicado e dos crons | Fase 15 |
| Stripe | produtos e webhooks em modo de teste | Fase 16 |

```bash
# Fase 2 em diante
claude mcp add --scope project --transport http supabase-local http://localhost:54321/mcp
claude mcp add --scope project --transport http cloudflare-docs https://docs.mcp.cloudflare.com/mcp

# Fase 14
claude mcp add --scope project --transport http sentry https://mcp.sentry.dev/mcp
claude mcp add --scope project --transport http posthog https://mcp.posthog.com/mcp

# Fase 15
claude mcp add --scope project --transport http cloudflare-observability https://observability.mcp.cloudflare.com/mcp

# Fase 16 (autorize em MODO DE TESTE)
claude mcp add --scope project --transport http stripe https://mcp.stripe.com
```

- **Supabase local:** só funciona com o `supabase start` rodando, e não pede login.
- **Supabase na nuvem** (opcional, a partir da Fase 15): **só o projeto de desenvolvimento e em modo somente leitura**, nunca a produção:
  ```bash
  claude mcp add --scope project --transport http supabase-dev "https://mcp.supabase.com/mcp?project_ref=SEU_REF_DE_DEV&read_only=true"
  ```
- **GitHub:** não precisa de MCP; o Claude Code já usa o `gh` pelo terminal.

**Autenticar e conferir:**
1. Abra o Claude Code e aprove os servidores do `.mcp.json`.
2. Rode `/mcp` e faça o login dos que pedirem.
3. No terminal, `claude mcp list` mostra o estado de cada um.
4. Teste: "use o supabase-local e liste as tabelas com RLS ligado".

---

## 4. Sessões na nuvem (claude.ai/code)

As sessões na nuvem rodam numa máquina virtual com o repositório clonado do GitHub e consomem os mesmos limites de uso da sua conta. Vão junto com o clone: `CLAUDE.md`/`AGENTS.md`, `.claude/skills`, `.claude/agents` e `.mcp.json`. Fica de fora o que só existe no seu computador (`~/.claude`, MCPs sem `--scope project`, `.env.local`). A máquina tem Docker, então o `supabase start` funciona lá.

**Configuração (uma vez):**
1. **GitHub:** o repositório no GitHub, com o app do Claude instalado nele (isso também libera o conserto automático de PRs quando o CI falha).
2. **Ambiente "placar"** em claude.ai/code:
   - **Rede:** "Custom", incluindo a lista padrão. O Placar não chama APIs externas no desenvolvimento. Se algum download for bloqueado (por exemplo, o navegador do Playwright), adicione o domínio que o erro mostrar.
   - **Segredos:** nada de chaves em variável de ambiente; use "API credentials" (Pro/Max).
3. **Primeira sessão, para preparar a máquina:**
   ```
   Prepare este repo para sessões na nuvem: crie um SessionStart hook em .claude/settings.json que, só quando CLAUDE_CODE_REMOTE=true, roda pnpm install, instala o Chromium do Playwright e sobe o Supabase local. Teste e me diga quanto tempo leva e se algum domínio foi bloqueado.
   ```
4. **Ver o app:** você não abre o `localhost` da nuvem. Configure, na Fase 15 ou antes se preferir, o **preview por PR na Cloudflare** apontando para um Supabase de desenvolvimento na nuvem. Nas fases muito visuais, traga a sessão para o seu computador com `claude --teleport`.

**Ciclo de cada fase:**
1. Abra a sessão com "implemente a fase N usando a skill implementar-fase".
2. Aprove ou corrija o plano (dá para fazer pelo celular).
3. Acompanhe o PR, com o conserto automático do CI ligado.
4. Confira o app no preview.
5. Diga "fase N confirmada" e faça o merge.

**Para os créditos renderem:**
- uma sessão por fase, com `/compact` quando a conversa ficar longa;
- fases em sequência;
- em paralelo, só o que é independente (posts, cards).

---

## 5. Próximo passo

Com as skills instaladas e os subagentes atualizados, abra uma sessão (local ou na nuvem) e peça:

```
Implemente a fase 2 usando a skill implementar-fase.
```

A Fase 2 faz a transição do Marcador para o Placar: remove o que era de leitura, ajusta o perfil (18+ e "aparecer nos cards") e renomeia o produto.
# Placar — tarefas da casa com placar (resumo do projeto)

> "Placar" é nome provisório.

**Ideia:** PWA para quem divide a casa (casais, repúblicas, amigos que dividem apê). A casa cadastra as tarefas com peso e frequência, cada pessoa marca o que fez com um toque, e o app mostra o **placar da semana** comparado com a **divisão combinada**. Inclui sequência de "casa em dia", conquistas, apostas da semana e cards bem-humorados para o story.

**Restrições:** até R$ 200/mês · 5–15 h/semana · fundador solo · PWA · crescimento orgânico (Instagram e TikTok) · público 18+ no MVP.

## Por que esta ideia
- **A dor é real e diária.** Segundo o IBGE, as mulheres dedicam 21,3 h/semana a afazeres domésticos e cuidados, contra 10,9 h dos homens. "Quem faz mais em casa" é briga clássica e debate que viraliza sozinho.
- **Os concorrentes são gringos e focados em faxina.** Tody, Sweepy e OurHome organizam limpeza; nenhum é brasileiro nem foca em justiça entre as pessoas e humor. O Tody tem só 39 avaliações na loja brasileira.
- **O crescimento já vem no produto.** O app só funciona com a outra pessoa, então todo usuário novo convida pelo menos mais um. O card do placar é conteúdo de casal pronto.
- **Reaproveita o que já foi feito:** login, perfil, PWA, deploy e as skills.

## O ciclo central
A pessoa faz uma tarefa → marca "feito" (1 toque) → ganha pontos pelo peso → o placar da semana atualiza → a outra pessoa reage (👏 ❤️ 😂 🤨) → na segunda de manhã sai o resultado da semana → card para o story.

## MVP — 5 funções
1. **Casa e convite:** criar a casa a partir de um modelo de tarefas (casal, república, família) e convidar pelo WhatsApp.
2. **Tarefas:** cômodo, peso (leve, média, pesada, muito pesada), frequência, responsável fixo, rodízio ou "quem puder", incluindo as tarefas de **carga mental** (planejar compras, marcar médico).
3. **Hoje + marcar feito:** lista do dia, um toque para marcar, desfazer, tarefa extra e reações.
4. **Placar semanal com divisão combinada:** os pontos comparados com a meta que a casa combinou (50/50 ou personalizada, aceita por todos), mais o resultado da semana, que sai na segunda de manhã.
5. **Cards para o story:** placar da semana, casa em dia, conquistas e Wrapped do mês, com o nome de cada pessoa só se ela permitir.

## Monetização
- **Grátis** para casas de até 2 pessoas.
- **Premium da casa** (R$ 9,90/mês ou R$ 59,90/ano, pago por uma pessoa e valendo para todos): até 8 membros, histórico completo, planejador automático da divisão, estatísticas por cômodo, temas de card e Wrapped completo.
- **Depois:** afiliados na lista de compras compartilhada.

## Stack e custos
Next.js + TypeScript como PWA na Cloudflare (OpenNext) · Supabase (Postgres + RLS + Auth Google) · cards gerados no navegador.
- R$ 0/mês até o lançamento.
- ≈ R$ 142–170/mês depois (Supabase Pro + domínio).

## Riscos
- **Se a outra pessoa não entrar, o app morre.** O convite precisa ser irresistível, e uma pessoa sozinha precisa ver valor desde o primeiro dia.
- **O placar pode aumentar a briga.** O tom tem que ser de humor e de time, nunca de culpa, e o placar compara cada pessoa com a meta combinada, não com o outro.
- **Notificações no iPhone** só funcionam com o PWA instalado.
- **Privacidade:** o nome de cada pessoa só aparece em card com a autorização dela.

## Validação (8 semanas)
- % de casas com 2+ membros ativos.
- Retenção da casa em 4 semanas.
- % de semanas fechadas que viram card compartilhado.
- Convites aceitos por casa criada.
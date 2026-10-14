---
name: post-instagram
description: Cria posts de Instagram do Placar (app de tarefas da casa com placar semanal para casais e repúblicas) para crescimento orgânico — roteiros de Reels, carrosséis, posts estáticos e sequências de stories, com legenda, até 5 hashtags, CTA, texto alternativo e link com UTM — e monta calendários semanais de conteúdo. Use esta skill SEMPRE que o usuário pedir post, reels, roteiro, carrossel, legenda, ideia de conteúdo, calendário editorial, "o que postar essa semana", divulgação do app, lançamento de feature nas redes ou adaptação de conteúdo para TikTok, mesmo que ele não mencione Instagram explicitamente.
---

# Post de Instagram do Placar

O Placar cresce só por tráfego orgânico, e cada casa nova já traz pelo menos duas pessoas. Por isso, o post precisa alcançar quem **ainda não segue** a conta e fazer alguém pensar "preciso mostrar isso pra quem mora comigo". As métricas que importam são o **compartilhamento** (manda pro parceiro, pra república) e a **casa criada**, não a curtida.

Antes de criar, procure no repositório:
- **`docs/progress.md`**, para saber quais funções já existem. **Nunca divulgue o que não foi lançado**: prometer uma função que a pessoa não encontra ao instalar queima a confiança.
- **`marketing/posts.md`, se existir**, para não repetir gancho nem tema das últimas 4 semanas.

## Passo 1 — Definir o objetivo do post

| Objetivo | Quando usar | Formato mais forte | CTA |
|---|---|---|---|
| **Alcance** (não seguidores) | a maior parte dos posts | Reel de 15 a 35 s | "manda pra quem mora com você" |
| **Salvamento** (autoridade) | cronogramas, listas, métodos | Carrossel de 7 a 10 slides | "salva pra montar a divisão de vocês" |
| **Conversa** (comunidade) | enquetes, debates leves | Carrossel curto ou stories | pergunta específica nos comentários |
| **Instalação** | lançamento, placar real, Wrapped | Reel mostrando o app de verdade | "link na bio" |

Se o usuário não disser o objetivo, escolha pelo contexto e diga qual escolheu.

## Passo 2 — Escolher o pilar de conteúdo

| Pilar | % da semana | Exemplos |
|---|---|---|
| **Humor de quem divide a casa** | ~40% | "POV: 'eu lavei a louça' (era um copo)", a louça de molho "pra amolecer", o lixo que ninguém vê, a briga do papel higiênico na república |
| **Prova com o produto** | ~25% | placar real da semana, "fizemos 30 dias de casa em dia", aposta resolvida, Wrapped da casa |
| **Desafio e comunidade** | ~15% | #SemanaEquilibrada, "mostra o placar da sua casa", repost de cards dos usuários (com permissão por DM) |
| **Utilidade** | ~10% | cronograma de faxina por cômodo, como dividir de forma justa quando um trabalha mais horas, a lista da carga mental |
| **Bastidores do app** | ~10% | build in public: "fiz um app porque eu e minha namorada brigávamos pela louça" (só se for verdade) |

Os ganchos, as estruturas e os exemplos completos estão em `references/formatos-e-ganchos.md`. Leia esse arquivo antes de escrever.

## Passo 3 — Escrever no tom da marca

- **Voz de quem mora junto:** pt-BR informal, frases curtas, humor que todo mundo reconhece.
- **Time, não guerra.** O Placar é sobre a casa funcionar, não sobre um ganhar do outro.
  - **Nada de "guerra dos sexos"** ("homem não faz nada", "marido inútil"). Esse tipo de post aliena metade do público, dá briga nos comentários e contradiz o produto.
  - **A carga mental entra com dado e respeito** (ex.: o dado do IBGE), nunca como ataque.
  - **Inclusão:** casais de qualquer formato, repúblicas e amigos dividindo apê. Varie quem "aparece fazendo mais" nos roteiros.
- **Emoji como tempero:** no máximo 1 a 3 por legenda. 🏠🧹🍝 são os da casa.
- **Específico ganha de genérico:** "a panela 'de molho' há 3 dias" ganha de "divida as tarefas".
- **Sem jargão de app:** "placar", "casa em dia", "divisão combinada"; nada de "gamificação" nem "streak".

## Passo 4 — Respeitar as regras da plataforma

- **Hashtags: no máximo 5 por post ou Reel** (limite atual do Instagram, aplicado aos poucos desde dez/2025). Use de 3 a 5:
  - 1 ou 2 de comunidade: `#organizacaodacasa`, `#vidadecasal`, `#republica`;
  - 1 ou 2 de nicho, ligadas ao tema: `#faxina`, `#cargamental`, `#cronogramadelimpeza`;
  - 1 da marca: `#placarapp`.

  Nunca use genéricas como `#reels`, `#explore` ou `#fyp`.
- **Palavras-chave na legenda, no texto da tela e na fala** ("dividir tarefas de casa", "divisão de tarefas", "organização da casa").
- **Legenda:** até 2.200 caracteres, mas só a 1ª linha (~125 caracteres) aparece antes do "mais". **A 1ª linha é o gancho.**
- **Medidas:**
  - Reel: 9:16, 1080×1920, texto dentro da área segura (skill `card-compartilhavel`).
  - Carrossel e post estático: 4:5, 1080×1350.
- **Texto alternativo** em toda imagem e todo carrossel.
- **Direitos e privacidade:**
  - nada de letra de música;
  - nada de cenas de terceiros sem autorização;
  - cards de usuários só com permissão explícita, guardada por escrito (DM), **e** com o consentimento de todos que aparecem no card;
  - áudios em alta: indique "áudio em alta do momento", e o usuário escolhe no app.
- **Publicidade:** parceria paga ou permuta com criadores (ex.: Premium vitalício em troca de post) precisa de identificação clara (#publi, "parceria paga" ou o recurso de parceria do Instagram), conforme o CONAR. Avise o usuário sempre que o post envolver um criador.

## Passo 5 — Produzir a ficha do post

```markdown
### <Título interno> · <formato> · <objetivo> · <pilar>

**Gancho (0–2 s / slide 1 / 1ª linha):** <texto>

**Roteiro / slides:**
| Tempo ou slide | Texto na tela | Fala ou narração | Visual / cena |
|---|---|---|---|

**Legenda:**
<1ª linha = gancho>
<corpo curto com a palavra-chave>
<1 CTA>
<3 a 5 hashtags>

**Texto alternativo:** <descrição>
**Link com UTM (se o CTA for instalação):** ver abaixo
**Áudio:** <original / narração / "áudio em alta de humor">
**Melhor dia e horário:** <sugestão + "confira nos Insights">
**Como gravar em 10 minutos:** <passos práticos, de preferência dentro de casa e com o próprio app>
**Quem aparece:** <pessoas e se autorizaram>
```

**UTM:**
- Formato: `https://<domínio>/?utm_source=instagram&utm_medium=<reel|carrossel|stories|bio>&utm_campaign=<slug-do-post>`.
- Use esse link no link da bio enquanto o post estiver ativo.
- O PostHog atribui cada `household_created` ao post que o gerou.

Antes de entregar, valide cada legenda:

```bash
python <caminho-da-skill>/scripts/checar_legenda.py legenda.txt
```

Corrija tudo o que vier com ❌. Os ⚠️ são decisão sua; explique-os se mantiver.

## Passo 6 — Calendário semanal

Use `assets/calendario-semana.md` como base. As regras:
- **De 3 a 5 posts por semana, com pelo menos 2 Reels.**
- **Pilares distribuídos** conforme o Passo 2, sem repetir o mesmo pilar em dias seguidos.
- **Pelo menos 1 post de prova com produto** (card real exportado do app).
- **Segunda-feira é dia de placar:** o resultado da semana chega por push às 9h, então é o melhor dia para chamar a audiência a postar o placar dela.
- **Datas fortes:**
  - começo do ano (metas da casa);
  - volta às aulas e mudança de república (fevereiro e agosto);
  - Dia dos Namorados (12/06);
  - Dia Internacional da Mulher (08/03), com dado e cuidado (carga mental), **sem** guerra dos sexos;
  - férias e casa cheia (dezembro e julho);
  - faxina de fim de ano.
- **Reaproveitamento no TikTok:** gancho mais rápido, texto na tela maior; hashtags como `#casal`, `#republica` e `#organizacao`.

## Passo 7 — Medir e aprender

Sete dias depois de cada post, registre:
- alcance de **não seguidores**;
- salvamentos;
- **compartilhamentos** (a métrica que mais importa aqui);
- cliques no link;
- **casas criadas com o UTM do post**.

Quando o usuário trouxer os números, compare por **gancho** e por **pilar** e proponha mais do que funcionou.

Se existir `marketing/posts.md`, registre ali cada post publicado: data, formato, gancho e números.
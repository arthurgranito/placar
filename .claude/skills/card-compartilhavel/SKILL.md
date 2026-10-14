---
name: card-compartilhavel
description: Cria, altera e depura os cards de story do Placar (imagens 1080×1920 geradas no navegador com canvas para postar no Instagram/TikTok) — placar da semana, casa em dia, conquistas, aposta da semana, telas do Wrapped do mês — incluindo paletas, versões Premium, a regra de consentimento de nomes (show_in_cards) e o pipeline de compartilhar (fontes, avatares, Web Share, fallback de download). Use esta skill SEMPRE que o pedido envolver card, story, imagem para compartilhar, template visual, Wrapped, "algo pra pessoa postar", ou problemas como avatar que não aparece, fonte errada no card, canvas em branco, botão compartilhar que não abre o Instagram, ou card cortado no story — mesmo que o usuário não fale "card" explicitamente.
---

# Card compartilhável

No Placar, o card é o canal de crescimento: cada placar postado mostra o app para outros casais e outras repúblicas. Um card só cumpre esse papel se:
- **a pessoa tiver vontade de postar;**
- **ninguém da casa se sentir exposto ou humilhado por ele;**
- **ele chegar inteiro ao story.**

Esta skill cobre o design (o que dá vontade de postar sem criar briga) e a engenharia (o que faz o card funcionar em qualquer celular).

Antes de começar, leia `AGENTS.md`, o ADR-06 do `docs/roadmap.md`, os fluxos F36 e F37 do `docs/flows.md` e o código atual em `src/features/cards/`. Se o motor ainda não existir, use `references/motor-canvas.md` como base.

## Passo 1 — Escrever o brief do card

Um card sem propósito claro vira um painel de estatísticas, e ninguém posta painel. Antes de desenhar, responda em 5 linhas:

1. **Momento:** quando ele aparece? Por exemplo: segunda de manhã com o resultado da semana, numa conquista, ou quando a aposta é resolvida.
2. **Dado herói:** qual é o **único** número ou fato do card? Por exemplo: "92% equilibrada", "🔥 30 dias em dia", "Rei da louça".
3. **Emoção:** o que a casa quer que os amigos sintam? Orgulho de time, humor, "olha como a gente se organiza".
4. **Quem aparece:** quais pessoas da casa aparecem, e se todas autorizaram (Passo 2).
5. **Quem vê:** seguidores que **não usam o app**. O card precisa fazer sentido sem contexto e despertar "quero isso na minha casa".

Mostre o brief ao usuário quando for um template novo. Para ajuste pequeno, siga direto.

## Passo 2 — Seguir as regras de design

**Tom de time (regra número 1):**
- O herói do card é a **casa** (equilíbrio, sequência, conquista coletiva), não um ranking de pessoas.
- **Nunca** use palavras como "perdedor", "devendo", "preguiçoso" ou "vergonha", nem coroas para um e caveiras para o outro.
- A aposta é a única brincadeira com quem "pagou", e é sempre no tom combinado pela própria casa ("João faz o jantar de sexta 🍝").
- Quando houver percentuais por pessoa, mostre-os **contra a meta combinada** ("Ana 52% · meta 50%"), não um contra o outro.

**Consentimento de nomes (ADR-06):**
- O nome e o avatar de outro membro só aparecem se `profiles.show_in_cards = true`. Senão, use "parceiro(a)" (casa de 2) ou "colega de casa", com um avatar genérico na cor da pessoa.
- Quem posta sempre tem "Versão sem nomes" na pré-visualização.
- Essa checagem é feita **na montagem dos dados**, antes do `desenhar`, e tem teste unitário obrigatório.

**Hierarquia:**
- **Um dado herói por card**, com pelo menos 220 px de altura. O resto é contexto.
- **No máximo 3 níveis de texto:** herói, contexto (de 44 a 64 px) e detalhe (de 30 a 40 px). Nada abaixo de 28 px, porque fica ilegível depois da compressão.
- **Barras de pessoas:** cada barra tem pelo menos 56 px de altura, na cor da pessoa, com a meta marcada por um traço de pelo menos 4 px.

**Área segura (1080×1920):**
- Nada importante nos **250 px de cima** nem nos **250 px de baixo**.
- Margem lateral mínima de **72 px**.
- Confira com `scripts/sobrepor_area_segura.py`.

**Legibilidade e compressão:**
- **Contraste:** pelo menos 4,5:1 para o texto de contexto.
- **Traço:** nada de linhas com menos de 3 px nem de gradientes sutis demais, porque a compressão do Instagram os destrói.
- **Emoji:** só decorativo (🏠 🔥 🧹 🍝), nunca estrutural.

**Marca:**
- Rodapé discreto: "placar.app · Monte o placar da sua casa", com opacidade de 60 a 70%.
- O Premium **não** remove a marca; ela é o motor de crescimento.

**Texto em pt-BR:**
- **Números:** formate com `Intl.NumberFormat('pt-BR')`.
- **Plural certo:** "1 dia"/"2 dias", "1 tarefa"/"12 tarefas", "1 ponto"/"8 pontos".
- **Nome da casa longo:** reduz de tamanho até um mínimo e depois corta com reticências (`ajustarTexto`, `reticencias`).

**Paletas:**
- Cada template tem pelo menos **2 paletas** (clara e escura), em tokens `bg`, `fg`, `muted`, `accent` e `surface`.
- As **cores das pessoas** vêm de `household_members.color`, e cada uma precisa ter contraste suficiente com o `bg` das duas paletas. O motor escurece ou clareia a cor quando faltar contraste.

## Passo 3 — Implementar no contrato do motor

Todo template segue o contrato `CardTemplate` de `references/motor-canvas.md`. Leia esse arquivo antes de escrever código, porque ele traz os utilitários (ajuste de texto, barras, avatar com fallback, área segura, fontes) e as armadilhas de cada navegador.

O que cada template precisa ter:
- `id`, `nome`, `premium`, `paletas` e `fontes`.
- `desenhar(ctx, dados, paleta, assets)` **pura e síncrona**.
- `fixtures` com os casos do Passo 4.
- O registro em `src/features/cards/templates/index.ts`.

**Templates do Placar:**

| id | Momento | Dado herói |
|---|---|---|
| `placar-semana` | resultado da semana (F30) | equilíbrio da casa (%) |
| `casa-em-dia` | marcos da sequência 7/30/100/365 | dias seguidos |
| `conquista` | conquista nova (F34) | ícone + nome |
| `aposta` | aposta resolvida (F39) | o que vale + quem paga |
| `wrapped-1…6` | Wrapped do mês (F37) | um dado por tela |

**Premium:** os temas extras são paletas marcadas `premium: true`. O cadeado e o paywall (F50) ficam na pré-visualização, nunca no `desenhar`.

## Passo 4 — Cobrir os casos de borda com fixtures

Modelos prontos estão em `assets/fixtures-borda.json`.

| Caso | Exemplo | O que costuma quebrar |
|---|---|---|
| Casa de 1 pessoa | só quem criou | barras sem sentido; o card mostra só a casa |
| Casa de 2 | 50/50, 70/30 com meta 50/50, 40/60 com meta 40/60 | o tom (quem ficou abaixo) |
| Casa de 8 (Premium) | república cheia | barras apertadas; nomes longos |
| Membro sem consentimento | `show_in_cards = false` | nome vazando |
| Nome da casa muito longo | 40 caracteres com emoji | estoura a linha |
| Nomes longos e acentos | "Maria Conceição", "Zé" | glifos e largura |
| Semana zerada | 0 pontos | divisão por zero e frase negativa |
| Números extremos | sequência 0, 1, 365; 400 pontos | plural e largura |
| Paleta clara e escura | as duas | contraste da cor das pessoas |
| Sem avatar | inicial na cor da pessoa | buraco no layout |

## Passo 5 — Garantir o pipeline de compartilhar

1. **Avatares só do Storage do próprio projeto**, com `crossOrigin = 'anonymous'`. Os avatares do Google, se forem usados, precisam ser copiados para o Storage no F05, porque uma imagem de outra origem contamina o canvas.
2. **Fontes carregadas antes de desenhar.**
3. **PNG gerado antes do toque em "Compartilhar"**, porque o Safari exige um gesto recente para o `navigator.share`.
4. **`canShare({files})` antes de `share`**, com fallback de download. `AbortError` não conta como erro nem como compartilhamento.
5. **Navegador interno do Instagram/TikTok:** ofereça "Salvar imagem" e a dica de abrir no navegador.
6. **Eventos:** `card_generated {template, paleta}` e `card_shared {template, metodo}`.

## Passo 6 — Testar e revisar visualmente

1. **Unitários:** utilitários, plural, formatação e **a regra de consentimento** (um membro com `show_in_cards = false` nunca aparece pelo nome, em nenhum template).
2. **Galeria `/dev/cards`** (fora de produção): todos os templates × paletas × fixtures.
3. **Regressão visual:** Playwright com `toHaveScreenshot` em cada card da galeria.
4. **Exportação real:** um e2e gera o PNG e confere 1080×1920.
5. **Revisão humana:** exporte os PNGs e monte a prancha com `scripts/prancha.py --area-segura`. Revise o **tom** de cada card como se você fosse a pessoa da casa que ficou abaixo da meta.
6. **Celular real:** compartilhe ao menos um card num story, no iPhone e no Android.

## Scripts

```bash
python <skill>/scripts/prancha.py pasta_dos_pngs/ -o prancha.png --colunas 4 --area-segura
python <skill>/scripts/sobrepor_area_segura.py card.png -o card-conferencia.png
```

## Formato da entrega

- O que mudou, em 2 a 4 linhas, com o brief se for template novo.
- O caminho da prancha de revisão.
- Os casos de borda cobertos, a confirmação de que a regra de consentimento tem teste e algum caso que ficou feio de propósito, com o porquê.
- O roteiro curto para conferir no celular.
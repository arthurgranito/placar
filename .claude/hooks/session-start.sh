#!/bin/bash
# SessionStart do Placar: prepara a máquina das sessões na nuvem (claude.ai/code).
# Só roda quando CLAUDE_CODE_REMOTE=true; no seu computador não faz nada.
# Etapas: pnpm install → Chromium do Playwright → Docker → supabase start → .env.local.
# Idempotente e não interativo. Falhas de etapas opcionais viram aviso, não derrubam a sessão.
set -uo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}" || exit 1
inicio=$(date +%s)
log() { echo "[session-start] $*" >&2; }
persist() { [ -n "${CLAUDE_ENV_FILE:-}" ] && echo "export $1" >>"$CLAUDE_ENV_FILE"; }
avisos=()

# 1) Dependências --------------------------------------------------------------
log "pnpm install"
if ! pnpm install --prefer-offline >&2; then
  log "ERRO: pnpm install falhou"
  exit 1
fi

# 2) Chromium do Playwright -----------------------------------------------------
# Tenta baixar a versão que o @playwright/test do projeto espera. Se a rede bloquear
# (cdn.playwright.dev), usa o Chromium pré-instalado da imagem via PLAYWRIGHT_CHROMIUM_EXECUTABLE
# (lido pelo playwright.config.ts).
log "Chromium do Playwright"
if env -u PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD pnpm exec playwright install chromium >&2 2>/dev/null; then
  log "Chromium do Playwright instalado"
else
  chrome=$(ls -d "${PLAYWRIGHT_BROWSERS_PATH:-/opt/pw-browsers}"/chromium-*/chrome-linux*/chrome 2>/dev/null | sort -V | tail -1)
  if [ -n "$chrome" ]; then
    persist "PLAYWRIGHT_CHROMIUM_EXECUTABLE=$chrome"
    avisos+=("download do Chromium bloqueado; usando $chrome")
  else
    avisos+=("sem Chromium para o Playwright (download bloqueado e nada pré-instalado)")
  fi
fi

# 3) Docker ---------------------------------------------------------------------
if ! docker info >/dev/null 2>&1; then
  log "subindo o dockerd"
  SUDO=""
  [ "$(id -u)" -ne 0 ] && SUDO="sudo -n"
  # O daemon precisa do proxy de saída da sessão para baixar imagens.
  $SUDO env HTTPS_PROXY="${HTTPS_PROXY:-}" HTTP_PROXY="${HTTPS_PROXY:-}" NO_PROXY="localhost,127.0.0.1" \
    sh -c 'nohup dockerd >/tmp/dockerd.log 2>&1 &'
  for _ in $(seq 1 30); do docker info >/dev/null 2>&1 && break; sleep 1; done
fi
if ! docker info >/dev/null 2>&1; then
  log "AVISO: Docker indisponível; pulando o Supabase local (veja /tmp/dockerd.log)"
  avisos+=("Docker indisponível: Supabase local não subiu")
else
  # 4) Supabase local -----------------------------------------------------------
  # O registry padrão (public.ecr.aws) serve as camadas por um CloudFront que a rede da nuvem
  # pode bloquear. Nesse caso usa o mirror.gcr.io; kong e postgrest não estão lá com o nome
  # supabase/*, então vêm das imagens oficiais e ganham a tag que a CLI procura.
  if [ -z "${SUPABASE_INTERNAL_IMAGE_REGISTRY:-}" ]; then
    # Teste com uma imagem minúscula que não compartilha camadas com as do Supabase.
    sonda=public.ecr.aws/docker/library/hello-world:latest
    if timeout 60 docker pull -q "$sonda" >/dev/null 2>&1; then
      docker image rm -f "$sonda" >/dev/null 2>&1
      export SUPABASE_INTERNAL_IMAGE_REGISTRY=public.ecr.aws
    else
      export SUPABASE_INTERNAL_IMAGE_REGISTRY=mirror.gcr.io
      avisos+=("public.ecr.aws bloqueado; imagens do Supabase vindas do mirror.gcr.io")
    fi
  fi
  persist "SUPABASE_INTERNAL_IMAGE_REGISTRY=$SUPABASE_INTERNAL_IMAGE_REGISTRY"

  if [ "$SUPABASE_INTERNAL_IMAGE_REGISTRY" = "mirror.gcr.io" ]; then
    postgrest=$(pnpm exec supabase services 2>/dev/null |
      grep -o '"name":"postgrest/postgrest","local":"[^"]*"' | sed 's/.*"local":"\([^"]*\)"/\1/')
    for par in "library/kong:2.8.1 supabase/kong:2.8.1" "postgrest/postgrest:${postgrest:-v16.4} supabase/postgrest:${postgrest:-v16.4}"; do
      set -- $par
      if ! docker image inspect "mirror.gcr.io/$2" >/dev/null 2>&1; then
        docker pull -q "mirror.gcr.io/$1" >/dev/null && docker tag "mirror.gcr.io/$1" "mirror.gcr.io/$2"
      fi
    done
  fi

  log "supabase start (registry: $SUPABASE_INTERNAL_IMAGE_REGISTRY)"
  # Studio e postgres-meta ficam ligados: são eles que servem o MCP em http://localhost:54321/mcp.
  if pnpm exec supabase start -x imgproxy,vector,logflare,edge-runtime,supavisor,mailpit >&2; then
    # 5) .env.local com as chaves locais (só se ainda não existir) ------------------
    if [ ! -f .env.local ]; then
      eval "$(pnpm exec supabase status -o env 2>/dev/null | grep -E '^(API_URL|PUBLISHABLE_KEY|SECRET_KEY)=')"
      {
        echo "NEXT_PUBLIC_SUPABASE_URL=${API_URL:-http://127.0.0.1:54321}"
        echo "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${PUBLISHABLE_KEY:-}"
        echo "SUPABASE_SECRET_KEY=${SECRET_KEY:-}"
      } >.env.local
      log ".env.local criado com as chaves do Supabase local"
    fi
  else
    avisos+=("supabase start falhou (veja a saída acima)")
  fi
fi

log "pronto em $(($(date +%s) - inicio))s"
for a in "${avisos[@]}"; do log "AVISO: $a"; done
exit 0

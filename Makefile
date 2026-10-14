# Placar — atalhos do dia a dia. Rode `make help` para a lista.
.DEFAULT_GOAL := help
SHELL := /bin/bash

PNPM := pnpm
SUPABASE := $(PNPM) exec supabase

.PHONY: help install dev db-up db-down db-reset db-test types test e2e lint typecheck build cf-build preview deploy check

help: ## Lista os comandos
	@grep -E '^[a-z0-9-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2}'

install: ## Instala as dependências (pnpm)
	$(PNPM) install

dev: ## Sobe o Next em modo dev (http://localhost:3000); precisa do `make db-up`
	$(PNPM) run dev

db-up: ## Sobe o Supabase local (Docker) e mostra URL e chaves
	$(SUPABASE) start
	$(SUPABASE) status

db-down: ## Para o Supabase local
	$(SUPABASE) stop

db-reset: ## Recria o banco local: migrations + seed
	$(SUPABASE) db reset

db-test: ## Roda os testes pgTAP (supabase/tests)
	$(SUPABASE) test db

types: ## Regenera os tipos TypeScript do banco local
	$(PNPM) run db:types

test: ## Testes unitários (Vitest) + testes do banco (pgTAP)
	$(PNPM) run test
	$(SUPABASE) test db

e2e: ## Testes e2e (Playwright); precisa do `make db-up` e do .env.local
	$(PNPM) run e2e

lint: ## ESLint + Prettier (checagem)
	$(PNPM) run lint

typecheck: ## TypeScript (tsc --noEmit)
	$(PNPM) run typecheck

build: ## Build do Next
	$(PNPM) run build

cf-build: ## Build da Cloudflare (OpenNext): pega incompatibilidades de runtime
	$(PNPM) run cf:build

preview: ## Build da Cloudflare + preview local no workerd (http://localhost:8787)
	$(PNPM) run preview

deploy: ## Build e deploy na Cloudflare (precisa de `wrangler login`)
	$(PNPM) run deploy

check: lint typecheck test build cf-build ## Verificação completa antes do PR (sem e2e)

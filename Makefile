SHELL := /usr/bin/env bash
.ONESHELL:
.DEFAULT_GOAL := help

-include .env
export

.PHONY: help install dev dev-web dev-api dev-ext build build-web build-api build-ext \
        typecheck lint zip-ext deploy-ydb deploy-api deploy-web deploy clean

help:  ## Показать список целей
	@grep -E '^[a-zA-Z_-]+:.*## ' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

install:  ## Установить зависимости
	pnpm install

dev-web:  ## Запустить сайт на :3000
	pnpm dev:web

dev-api:  ## Запустить локальный эмулятор backend на :8787 (in-memory DB)
	pnpm dev:api

dev-ext:  ## Собрать расширение с watch
	pnpm dev:ext

build: build-web build-api build-ext  ## Собрать всё

build-web:
	pnpm build:web

build-api:
	pnpm build:api

build-ext:
	pnpm build:ext

typecheck:  ## Typecheck всех пакетов
	pnpm -r run typecheck

lint:
	pnpm lint

zip-ext:  ## Упаковать extension в zip для Chrome Web Store
	bash infra/scripts/deploy-extension.sh

deploy-ydb:  ## Применить схему YDB
	bash infra/scripts/apply-ydb-schema.sh

deploy-api: build-api  ## Опубликовать Cloud Function
	bash infra/scripts/deploy-api.sh

deploy-web: build-web  ## Залить сайт в Object Storage
	bash infra/scripts/deploy-web.sh

deploy: deploy-ydb deploy-api deploy-web zip-ext  ## Полный production-деплой

clean:
	pnpm clean
	rm -rf apps/extension/dist apps/web/out apps/web/.next apps/api/dist bezbrehni-extension.zip

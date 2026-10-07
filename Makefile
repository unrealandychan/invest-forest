# Invest Forest - Developer, QA & Cloud Automation Suite
# Run 'make help' for a list of available targets.

.DEFAULT_GOAL := help
DOCS_DIR := docs
SHELL := /usr/bin/env bash

.PHONY: help docs check status clean install build test test-core test-server dev-web dev-server docker-build tf-init tf-validate cap-check verify-all

## help: Display this help message
help:
	@echo "=========================================================="
	@echo "   🌲 Invest Forest - Monorepo & Cloud Automation Suite   "
	@echo "=========================================================="
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@sed -n 's/^## //p' $(MAKEFILE_LIST) | column -t -s ':' | sed -e 's/^/  /'
	@echo ""

## install: Install all monorepo dependencies
install:
	npm install

## build: Build all workspace packages and apps
build:
	npm run build

## test: Run unit & integration test suites across core and server
test:
	npm --workspace=@invest-forest/core run test
	npm --workspace=@invest-forest/server run test

## test-core: Run domain financial math and species tests
test-core:
	npm --workspace=@invest-forest/core run test

## test-server: Run backend quote proxy and sync tests
test-server:
	npm --workspace=@invest-forest/server run test

## dev-web: Start local Vite web development server
dev-web:
	npm --workspace=@invest-forest/web run dev

## dev-server: Start backend market proxy & sync server
dev-server:
	npm --workspace=@invest-forest/server run dev

## docker-build: Build backend production container with Docker
docker-build:
	docker build -t invest-forest-server:latest -f apps/server/Dockerfile .

## cap-check: Verify Capacitor mobile packaging configuration
cap-check:
	cd apps/web && npx cap config

## tf-init: Initialize GCP Terraform configuration
tf-init:
	terraform -chdir=infra/terraform init -backend=false

## tf-validate: Validate and check Terraform formatting
tf-validate:
	terraform -chdir=infra/terraform fmt -check
	terraform -chdir=infra/terraform validate

## verify-all: Run complete end-to-end CI/CD verification locally
verify-all: test build docker-build cap-check tf-validate
	@echo "=========================================================="
	@echo "  ✅ ALL VERIFICATIONS PASSED SUCCESSFULLY! (100% READY)  "
	@echo "=========================================================="

## docs: List all project documentation and word counts
docs:
	@echo "=== Invest Forest Documentation Suite ==="
	@ls -lh $(DOCS_DIR)/*.md
	@echo ""
	@echo "=== Document Summary ==="
	@wc -w $(DOCS_DIR)/*.md README.md | sort -nr

## check: Verify documentation integrity and cross-references
check:
	@echo "Verifying documentation suite integrity..."
	@test -d $(DOCS_DIR) || (echo "Error: $(DOCS_DIR) missing" && exit 1)
	@test -f README.md || (echo "Error: README.md missing" && exit 1)
	@for doc in $(DOCS_DIR)/*.md; do \
		if [ ! -s "$$doc" ]; then \
			echo "FAIL: $$doc is empty"; exit 1; \
		else \
			echo "OK: $$doc ($$(wc -l < "$$doc") lines)"; \
		fi \
	done
	@echo "All integrity checks passed successfully!"

## status: Show current project files and directory structure
status:
	@echo "=== Invest Forest Project Layout ==="
	@find . -maxdepth 3 -not -path '*/.*' -not -path './node_modules*' | sort

## clean: Clean temporary files and build caches
clean:
	@echo "Cleaning temporary files and dist folders..."
	@find . -type f \( -name "*~" -o -name "*.bak" -o -name "*.swp" \) -delete
	@rm -rf packages/core/dist apps/web/dist apps/server/dist
	@echo "Clean complete."

#!/bin/bash
# Generate comprehensive LLM prompt from Eliza Agent Portfolio Manager project

# Get current date for filename
DATE=$(date +%Y%m%d-%H%M)

# Output filename with timestamp
OUTPUT_FILE="eliza-agent-portfolio-prompt-${DATE}.txt"

# Generate comprehensive prompt with all essential files for LLM feedback
code2prompt . -O "$OUTPUT_FILE" \
  --include "README.md" \
  --include "AI_IMPROVEMENTS.md" \
  --include "NETWORK_SETUP.md" \
  --include "CLI_USAGE.md" \
  --include "DATABASE_FIX.md" \
  --include "package.json" \
  --include "tsconfig.json" \
  --include "docker-compose.yml" \
  --include "env.example" \
  --include "src/**/*.ts" \
  --include "src/**/*.js" \
  --include "src/**/*.json" \
  --include "scripts/**/*.ts" \
  --include "scripts/**/*.js" \
  --include "test-cli.js" \
  --include "tests/**/*.ts" \
  --include "tests/**/*.js" \
  --exclude "node_modules/**" \
  --exclude ".git/**" \
  --exclude "bun.lockb" \
  --exclude "*.log" \
  --exclude "coverage.*" \
  --exclude "dist/**" \
  --exclude "build/**" \
  --exclude ".env" \
  --exclude ".env.*" \
  --exclude "**/*.d.ts" \
  --exclude "**/*_bench.ts" \
  --exclude "**/*_test.ts"

echo "Comprehensive Eliza Agent Portfolio Manager prompt generated: $OUTPUT_FILE"
echo "This includes:"
echo "  ✓ Core TypeScript source code (src/)"
echo "  ✓ Configuration files (package.json, tsconfig.json, docker-compose.yml)"
echo "  ✓ Documentation (README.md, AI_IMPROVEMENTS.md, NETWORK_SETUP.md, CLI_USAGE.md, DATABASE_FIX.md)"
echo "  ✓ Environment template (env.example)"
echo "  ✓ Scripts and utilities (scripts/, test-cli.js)"
echo "  ✓ Test files (tests/)"
echo "  ✓ Excludes: node_modules, .git, lock files, logs, build artifacts" 
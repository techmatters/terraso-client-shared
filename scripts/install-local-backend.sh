#!/usr/bin/env bash
#
# install-local-backend.sh
#
# Temporarily installs terraso-backend from the local filesystem (../terraso-backend)
# instead of from GitHub. Use this when you're making changes to terraso-backend
# and want to test them locally without pushing to GitHub.
#
# This script:
#   1. Swaps the terraso-backend dependency to file:../terraso-backend
#   2. Runs npm install
#   3. Restores the original package.json and package-lock.json (so git status stays clean)
#
# The installed node_modules will use your local backend until the next
# regular npm install.
#
# Usage:
#   npm run install:local-backend
#
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LIB_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$LIB_ROOT"

# Check that local backend exists
if [[ ! -d "../terraso-backend" ]]; then
  echo "❌ Error: ../terraso-backend directory not found"
  exit 1
fi

echo "📦 Installing terraso-backend from local filesystem..."

# Backup original package.json and package-lock.json
cp package.json package.json.bak
cp package-lock.json package-lock.json.bak

# Swap to local backend
sed -i '' 's|"terraso-backend": "github:techmatters/terraso-backend#[^"]*"|"terraso-backend": "file:../terraso-backend"|' package.json

# Run npm install
npm install

# Restore original package.json and package-lock.json
mv package.json.bak package.json
mv package-lock.json.bak package-lock.json

echo "✅ Local backend installed. package.json restored to original."
echo "   Run 'npm run generate-types' or 'npm run build' to regenerate types."

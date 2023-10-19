#!/bin/sh

npm run generate-types
echo "$(pwd)"
echo "$INIT_CWD"
if [ "$(pwd)" != "$INIT_CWD" ]; then
  npx tsc --outDir .
  npx babel src --extensions ".ts,.tsx" --out-dir .
  cp -r src/assets .
fi

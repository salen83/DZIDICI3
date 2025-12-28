#!/bin/bash
set -e

echo "🔧 React performance optimization started..."

# 1️⃣ Forsiraj production build
if [ -f node_modules/react-scripts/config/webpack.config.js ]; then
  sed -i 's/sourceMap: true/sourceMap: false/g' node_modules/react-scripts/config/webpack.config.js || true
fi

# 2️⃣ Disable console.log u production
find src -type f -name "*.js" -exec sed -i 's/console.log/\/\/console.log/g' {} +

# 3️⃣ React.memo hint (ne dira logiku)
grep -rl "function Screen" src | while read file; do
  # Dodaj import samo ako ne postoji
  if ! grep -q "^import React" "$file"; then
    sed -i '1s/^/import React from "react";\n/' "$file"
  fi

  # Wrapuj export sa React.memo samo ako nije već
  if ! grep -q "React.memo" "$file"; then
    sed -i 's/export default/export default React.memo(/' "$file"
    echo ")" >> "$file"
  fi
done

echo "✅ Optimization finished"

---
name: Usa yarn 4 come package manager
description: In questo progetto usare sempre yarn 4, non npm
type: feedback
---

Usa sempre `yarn` (versione 4) al posto di `npm` per tutti i comandi di package management.

**Why:** Preferenza esplicita dell'utente per questo progetto.

**How to apply:** Sostituire `npm install` con `yarn install`, `npm run <script>` con `yarn <script>`, `npx <cmd>` con `yarn dlx <cmd>` o `yarn <cmd>`. Configurare package.json con `packageManager: "yarn@4.x.x"`.

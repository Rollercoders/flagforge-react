# flagforge-react — basic example

A minimal app that demonstrates every public API of `flagforge-react` against a real FlagForge instance.

## Setup

1. Copy `.env.example` to `.env.local` and fill in your values, or export the variables in your shell:

```sh
export VITE_FLAGFORGE_HOST=https://flagforge.myapp.com
export VITE_FLAGFORGE_API_KEY=ff_xxxx
export VITE_FLAGFORGE_FLAGS=flag-a,flag-b,flag-c
```

- `VITE_FLAGFORGE_HOST` — base URL of your FlagForge instance
- `VITE_FLAGFORGE_API_KEY` — your API key
- `VITE_FLAGFORGE_FLAGS` — comma-separated flag names to use in the demo

## Run

From the repo root:

```sh
yarn install
cd examples/basic
yarn dev
```

Open [http://localhost:5173](http://localhost:5173).

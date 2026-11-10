# fe_mini_eshop

Frontend for the FAPI order flow (Vite + React + TypeScript).  
Talks to `be_mini_eshop` JSON API.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

App: http://localhost:5173  
API (local): http://localhost:8000

## Tests

```bash
npm test
```

Covers local price/VAT calculation, form validation, and API error mapping.

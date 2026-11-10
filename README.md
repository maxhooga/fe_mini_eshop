# fe_mini_eshop

Frontend for the FAPI order flow: order form → thank-you page.  
Stack: **Vite + React + TypeScript**. Talks to `be_mini_eshop` JSON API.

## Requirements

- Node.js 20+
- Running backend API (`be_mini_eshop` on `http://localhost:8000` by default)

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

App: http://localhost:5173

## Environment

Copy `.env.example` to `.env` (gitignored):

```bash
cp .env.example .env
```

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8000` | Base URL of the backend API |

Example:

```env
VITE_API_URL=http://localhost:8000
```

For a deployed backend, set the public API URL, e.g. `https://your-api.onrender.com`.  
If the frontend runs on another origin, allow it in backend `CORS_ALLOWED_ORIGINS`.

After changing `.env`, restart `npm run dev`.

## Scripts

| Command | What it does |
|---------|----------------|
| `npm install` | Install dependencies |
| `npm run dev` | Vite dev server on `:5173` |
| `npm test` | Run Vitest |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Preview the production build |

## Pages

| Path | Description |
|------|-------------|
| `/` | Order form (customer + multi-item cart, live VAT total) |
| `/thank-you/:orderId` | Order recap from `GET /api/orders/:id` (DPH + ČNB EUR) |

## API used

| Method | Path | Used for |
|--------|------|----------|
| `GET` | `/api/products` | Product catalog |
| `POST` | `/api/orders` | Create order |
| `GET` | `/api/orders/{id}` | Thank-you page |

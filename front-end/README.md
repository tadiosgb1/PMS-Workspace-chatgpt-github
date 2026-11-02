# Property Management System — Frontend

The frontend is a Vue 3 single-page application built with Vite. It provides public pages and authenticated property-management workflows, including properties, tenants, rentals, payments, maintenance, subscriptions, reports, coworking/workspaces, brokers, and motor inventory.

For the complete project overview, feature list, architecture notes, and deployment guidance, see the [repository README](../README.md).

## Technology

- Vue 3 and Vue Router
- Vite
- Vuex
- Axios
- Tailwind CSS
- Vue I18n
- ApexCharts and Chart.js

## Requirements

- Node.js (current LTS recommended)
- npm
- Access to a compatible backend API for authenticated and data-driven features

## Setup

Run these commands from this directory:

```bash
npm install
cp .env.example .env
```

Open `.env` and replace the example.invalid URLs with the URLs for your own backend environment. The example file intentionally contains placeholders, not a working backend address.

The application reads these Vite variables:

| Variable | Purpose |
| --- | --- |
| `VITE_APP_BASE_URL_LOCAL` | API base URL used outside production mode |
| `VITE_APP_BASE_URL_PRODUCTION` | API base URL used in production mode |
| `VITE_BASE_SERVER_URL` | Base server origin used by parts of the application |

Do not commit `.env`. It is ignored by Git. Do not place passwords, private API keys, or other secrets in `VITE_` variables: Vite exposes them to client-side code.

## Development

```bash
npm run dev
```

Mode-specific development servers:

```bash
npm run dev:admin
npm run dev:client
```

The admin server uses port 3000 and the client server uses port 3001.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the default Vite development server |
| `npm run dev:admin` | Start the admin development server |
| `npm run dev:client` | Start the client development server |
| `npm run build` | Create the default production build |
| `npm run build:admin` | Build using admin mode |
| `npm run build:client` | Build using client mode |
| `npm run preview` | Preview the default production build |
| `npm run preview:admin` | Preview the admin build |
| `npm run preview:client` | Preview the client build |

## Build

```bash
npm run build
```

Use `npm run build:admin` or `npm run build:client` for a mode-specific build. The generated static files can be deployed to a static host or web server configured to serve the Vue application routes.

## Notes

- API helpers are located in `src/utils/utils.js`.
- The API client uses the configured environment variables and reads the access token from browser local storage when present.
- After editing `.env`, restart the Vite development server.
- Backend endpoints, payloads, permissions, and response formats must match the backend API contract.

# Property Management System (PMS)

A Vue 3 web application for managing property operations and related business workflows. The frontend uses Vite, Vue Router, Vuex, Tailwind CSS, and an Axios-based API client to communicate with a backend service.

## Contents

- [Overview](#overview)
- [Main features](#main-features)
- [Technology stack](#technology-stack)
- [Project structure](#project-structure)
- [Requirements](#requirements)
- [Getting started](#getting-started)
- [Environment configuration](#environment-configuration)
- [Available scripts](#available-scripts)
- [API integration and authentication](#api-integration-and-authentication)
- [Development notes](#development-notes)
- [Production build](#production-build)

## Overview

PMS provides a browser-based workspace for property management and administrative tasks. Its frontend includes public pages such as the home, pricing, registration, and login pages, alongside authenticated dashboard views for operational management.

The application supports multilingual UI content for **Amharic**, **English**, and **Tigrigna**. Amharic is configured as the default locale, with English as the fallback.

> This repository contains the frontend application. A compatible backend API and valid environment configuration are required for data-driven features and authentication.

## Main features

Application areas available in the frontend include:

- **Dashboard** — authenticated workspace and dashboard views.
- **Properties** — property records, property details, rental listings, property pictures, and properties for sale.
- **Property zones** — zone management and zone details.
- **Rentals and payments** — rent records, rent details, rent payments, overdue rents, and payment management.
- **Tenants and contacts** — tenant, contact, and client-related workflows.
- **Users and access control** — user management, owners, managers, staff, groups, permissions, and access-denied handling.
- **Maintenance** — maintenance request views.
- **Subscriptions and plans** — plan management, subscriptions, and subscription payments.
- **Reports** — reporting views for clients, subscriptions, properties, off-plan properties, revenues, workspaces, and other operational data.
- **Coworking and workspaces** — coworking spaces, workspace rentals, and workspace payments.
- **Brokers and brands** — broker records and details, and brand management.
- **Off-plan property workflows** — off-plan properties, applications, milestones, bank financing, payments, and payment plans.
- **Motor inventory** — motor listings, searchable/filterable inventory, motor details, create/edit forms, and motor image management.
- **Authentication** — login, registration, password recovery/reset, and email activation pages.

The features visible to a user depend on backend availability, account permissions, and configured roles.

## Technology stack

- [Vue 3](https://vuejs.org/) — user interface framework
- [Vite](https://vitejs.dev/) — development server and build tool
- [Vue Router](https://router.vuejs.org/) — client-side routing
- [Vuex](https://vuex.vuejs.org/) — application state management
- [Axios](https://axios-http.com/) — HTTP requests to the backend API
- [Tailwind CSS](https://tailwindcss.com/) — utility-first styling
- [Vue I18n](https://vue-i18n.intlify.dev/) — internationalization
- [ApexCharts](https://apexcharts.com/) and Chart.js — charts and reporting visualizations
- Font Awesome, Leaflet, Swiper, and supporting UI/export libraries

## Project structure

The main frontend application lives in `front-end/`.

```text
PMS-Workspace-chatgpt-github/
└── front-end/
    ├── public/                 # Static public assets
    ├── src/
    │   ├── assets/             # Styles and other assets
    │   ├── components/         # Shared Vue components
    │   ├── composables/        # Reusable composition logic
    │   ├── globals/            # Global application setup
    │   ├── locales/            # Translation files
    │   ├── router/             # Vue Router configuration
    │   ├── store/              # Vuex store and API plugin
    │   ├── utils/              # API helpers and utilities
    │   └── views/
    │       ├── opened/         # Public/authentication pages
    │       └── closed/         # Authenticated dashboard pages
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── ...
```

## Requirements

Install the following before running the project:

- Node.js (a current LTS release is recommended)
- npm
- Access to a compatible PMS backend API
- Credentials for an account with access to the application

## Getting started

### 1. Clone the repository

```bash
git clone https://github.com/tadiosgb1/PMS-Workspace-chatgpt-github.git
cd PMS-Workspace-chatgpt-github/front-end
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the API

Create or update a local `.env` file in the `front-end/` directory. See [Environment configuration](#environment-configuration) below. Use the API URLs appropriate for your development environment.

### 4. Start the development server

For the default Vite development server:

```bash
npm run dev
```

The Vite configuration uses port **3000** by default. Open the local URL printed in the terminal.

The project also provides mode-specific commands:

```bash
npm run dev:admin
npm run dev:client
```

The admin mode is configured for port **3000** and the client mode for port **3001**. Both commands bind to `0.0.0.0` and use strict port checking.

## Environment configuration

The API client reads these Vite environment variables:

| Variable | Purpose |
| --- | --- |
| `VITE_APP_BASE_URL_LOCAL` | API base URL used outside production mode, including normal development mode |
| `VITE_APP_BASE_URL_PRODUCTION` | API base URL used when building/running in production mode |
| `VITE_BASE_SERVER_URL` | Base server URL used by parts of the application that need the server origin |

Example template (replace the example values with your own backend URLs):

```dotenv
VITE_APP_BASE_URL_LOCAL=http://localhost:8000/api
VITE_APP_BASE_URL_PRODUCTION=https://your-api.example.com/api
VITE_BASE_SERVER_URL=https://your-api.example.com
```

The local URL above is only an example. Use the actual URL and API prefix provided by your backend team.

**Important:** Vite exposes variables prefixed with `VITE_` to frontend code. Do not put passwords, private API keys, or other secrets in these variables. Do not commit local credentials or sensitive environment configuration to source control.

After changing environment variables, restart the development server.

## Available scripts

Run these commands from the `front-end/` directory:

| Command | Description |
| --- | --- |
| `npm run dev` | Start the default Vite development server |
| `npm run dev:admin` | Start the admin mode on port 3000 |
| `npm run dev:client` | Start the client mode on port 3001 |
| `npm run build` | Create the default production build |
| `npm run build:admin` | Create a production build using admin mode |
| `npm run build:client` | Create a production build using client mode |
| `npm run preview` | Preview the default production build locally |
| `npm run preview:admin` | Preview the admin build on port 3000 |
| `npm run preview:client` | Preview the client build on port 3001 |

## API integration and authentication

- API requests are made through Axios helper functions in `src/utils/utils.js`.
- The base API URL is selected using the Vite mode and the environment variables described above.
- The API helpers support GET, GET-by-ID, POST, PUT, PATCH, and DELETE requests.
- The API client reads the `access` token from browser local storage and sends it as a Bearer token when present.
- Some create/edit workflows upload files using `multipart/form-data`; the browser should generate the multipart boundary.
- Vue Router defines public pages and authenticated dashboard routes. Access to individual features may also depend on application roles and permissions.

Backend endpoint names, payload formats, permissions, and response shapes are defined by the backend/API contract. Confirm these with the backend implementation when integrating or troubleshooting.

## Development notes

- Use the `@/` alias to import files from `front-end/src/`.
- Translation resources are imported from `src/locales/`.
- Keep API URLs and environment-specific settings in local environment configuration rather than hard-coding new URLs into components.
- Before opening a pull request, run the relevant build command and manually test the pages and API flows affected by the change.
- If a feature does not load data, verify the API URL, backend availability, authentication token, and user permissions before debugging the view itself.

## Production build

Build the default frontend:

```bash
npm run build
```

Or build a specific mode:

```bash
npm run build:admin
npm run build:client
```

Vite writes the generated production assets to its build output directory (normally `dist/`). Deploy the output using your chosen static hosting/web-server setup, and ensure the backend API URL, routing fallback, and access-control configuration match the deployment environment.

## Contributing

1. Create a branch for your change.
2. Keep changes focused and follow the existing Vue/component conventions.
3. Verify the relevant build and user flows.
4. Submit a pull request with a clear summary and testing notes.

## License

No project-specific license was confirmed while preparing this README. Add the appropriate license and ownership details before redistributing the project.

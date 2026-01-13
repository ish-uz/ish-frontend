# ISH Frontend

React + TypeScript + Vite frontend application for ISH - job marketplace for Uzbekistan.

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

Build for production:

```bash
npm run build
```

### Preview

Preview the production build:

```bash
npm run preview
```

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **React Router** - Routing
- **Axios** - HTTP client

## Project Structure (Feature-Sliced Design)

```
ish-frontend/
├── src/
│   ├── app/                    # Global states and providers
│   │   ├── context/            # Context API (AuthContext, ThemeContext)
│   │   ├── hooks/              # Global hooks (useAuth, useCurrentUser)
│   │   └── providers/          # Context providers
│   │
│   ├── assets/                 # Static files (images, icons, fonts)
│   │
│   ├── components/            # Global reusable UI components
│   │   ├── Header.tsx          # Navigation (used on all pages)
│   │   ├── Footer.tsx          # Footer (used on all pages)
│   │   └── ui/                 # shadcn/ui components (Button, Input, Card, etc.)
│   │
│   ├── features/               # Application features/domains
│   │   ├── auth/               # Authentication and registration
│   │   │   ├── components/     # Local components for auth
│   │   │   ├── hooks/          # Local hooks for auth
│   │   │   ├── services/       # API requests for auth
│   │   │   └── pages/          # LoginPage, RegisterPage
│   │   │
│   │   ├── jobs/               # Job vacancies
│   │   │   ├── components/    # JobCard, JobList, JobFilters
│   │   │   ├── hooks/          # useJobs, useJobDetail
│   │   │   ├── services/       # jobService
│   │   │   └── pages/          # JobsPage, JobDetailPage
│   │   │
│   │   ├── profiles/           # Employee profiles
│   │   │   ├── components/     # ProfileCard, ProfileHeader
│   │   │   ├── hooks/          # useProfile, useProfiles
│   │   │   ├── services/      # profileService
│   │   │   └── pages/          # ProfilesPage, ProfileDetailPage
│   │   │
│   │   ├── companies/          # Companies
│   │   │   ├── components/     # CompanyCard, CompanyHeader
│   │   │   ├── hooks/          # useCompany, useCompanies
│   │   │   ├── services/      # companyService
│   │   │   └── pages/          # CompaniesPage, CompanyDetailPage
│   │   │
│   │   └── landing/            # Landing page
│   │       └── components/   # HeroSection, MainBlocks, StatsSection, etc.
│   │
│   ├── pages/                  # Main routes/pages
│   │   ├── HomePage.tsx        # Home page (landing)
│   │   ├── NotFoundPage.tsx    # 404 page
│   │   └── index.ts           # Page exports
│   │
│   ├── routes/                 # Route configuration
│   │   └── AppRouter.tsx       # React Router configuration
│   │
│   ├── services/               # Global API services
│   │   ├── api.ts              # Axios instance with interceptors
│   │   └── index.ts           # Service exports
│   │
│   ├── types/                  # TypeScript types and interfaces
│   │   └── index.ts           # User, Job, Company, Profile, etc.
│   │
│   ├── constants/              # Application constants
│   │   └── index.ts           # Roles, statuses, routes
│   │
│   ├── utils/                  # Helper functions
│   │   └── index.ts           # formatDate, validators, formatters
│   │
│   ├── lib/                    # Libraries and utilities
│   │   └── utils.ts           # cn() for shadcn/ui
│   │
│   ├── styles/                 # Global styles
│   │   └── globals.css         # Tailwind directives and CSS variables
│   │
│   ├── App.tsx                  # Main application component
│   └── main.tsx                # Entry point (ReactDOM.createRoot)
│
├── index.html                  # HTML template
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
├── components.json             # shadcn/ui configuration
└── package.json                # Dependencies and scripts
```

## Architecture Principles

### Feature-Sliced Design (FSD)

The project follows Feature-Sliced Design principles:

1. **`app/`** - Global states, providers, contexts
2. **`components/`** - Global reusable UI components
3. **`features/`** - Isolated features with their own components, hooks, services
4. **`pages/`** - Pages that compose features
5. **`shared/`** - Shared utilities, types, constants (services, types, utils, constants)

### Import Rules

- Features can import from `shared/` (services, types, utils, constants)
- Features can import from `components/` (global UI components)
- Features CANNOT import from each other
- Pages import features and components

## Features

- ✅ TypeScript for type safety
- ✅ Tailwind CSS for styling
- ✅ shadcn/ui components
- ✅ React Router for routing
- ✅ Axios with interceptors for API requests
- ✅ Feature-Sliced Design architecture
- ✅ Responsive design
- ✅ Uzbek language interface

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3000/api
```

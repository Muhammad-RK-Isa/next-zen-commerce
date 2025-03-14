Core backend service for Next Zen Commerce built with Hono and Bun.

## Overview

The core service provides essential backend functionality for the Next Zen Commerce platform, exposing RESTful endpoints and health checks.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed
- Project dependencies installed (`pnpm install` from root)

### Environment Variables

Copy the `.env.example` file to `.env` and update the values as needed.

### Development

Run the development server with hot reloading:

```bash
pnpm dev
```

### Build

Build for production:

```bash
pnpm build
```

### Production

Start the production server:

```bash
pnpm start
```

## Available Endpoints

- `/` - Service info
- `/health` - Health check endpoint

## Scripts

- `build` - Builds the application for production
- `clean` - Cleans build artifacts and dependencies
- `dev` - Starts development server with hot reloading
- `start` - Runs the production build
- `typecheck` - Runs TypeScript type checking
- `with-env` - Helper to run commands with environment variables

```

```

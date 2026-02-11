# Cat Facts Next.js App

A server-side rendered Next.js application that displays a random cat fact on every page load.

## Features

- Server-side rendering (SSR) for optimal performance
- Fetches data from the Cat Facts API on every page load
- Beautiful gradient UI with responsive design
- Random cat fact selection from the API response
- One-click refresh button to get new facts

## Getting Started

### Development Server

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Build for Production

```bash
npm run build
npm start
```

## How It Works

The application uses Next.js App Router with server components. The `page.tsx` file:

1. Fetches data from `https://catfact.ninja/fact` on every request
2. Uses `cache: 'no-store'` to ensure fresh data on every page load
3. Returns a random cat fact from the API
4. Renders the fact server-side before sending HTML to the client

## API

This app uses the [catfact.ninja API](https://catfact.ninja/) which returns a random cat fact on each request.

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Server-Side Rendering
- Sentry (Error Monitoring & Performance Tracking)

## Sentry Setup

This project is configured with Sentry for error monitoring and performance tracking.

### Initial Configuration

1. **Create a Sentry account** at [sentry.io](https://sentry.io) if you don't have one

2. **Create a new Sentry project** for Next.js

3. **Set up environment variables**:

   Copy the example files and fill in your Sentry credentials:
   ```bash
   cp .env.local.example .env.local
   cp .env.sentry-build-plugin.example .env.sentry-build-plugin
   ```

   Update `.env.local` with your DSN:
   ```bash
   NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@your-instance.ingest.sentry.io/your-project-id
   ```

   Update `.env.sentry-build-plugin` with your auth token:
   ```bash
   SENTRY_AUTH_TOKEN=your-auth-token-here
   SENTRY_ORG=your-org-slug
   SENTRY_PROJECT=your-project-slug
   ```

4. **Get your credentials from Sentry**:
   - **DSN**: Go to Settings → Projects → [Your Project] → Client Keys (DSN)
   - **Auth Token**: Go to Settings → Account → API → Auth Tokens → Create New Token
   - **Organization Slug**: Found in your Sentry URL (sentry.io/organizations/YOUR-ORG-SLUG/)
   - **Project Slug**: Found in your project settings

### Testing Sentry

After configuration, test that Sentry is working by triggering an error in your application.

### Features Enabled

- **Error Tracking**: Automatically captures unhandled errors and exceptions
- **Performance Monitoring**: Tracks application performance and slow transactions
- **Session Replay**: Records user sessions (configurable sample rate)
- **Source Maps**: Automatically uploads source maps during build for better stack traces
- **Breadcrumbs**: Tracks user actions leading up to errors

### Configuration Files

- `sentry.client.config.ts` - Client-side Sentry configuration
- `sentry.server.config.ts` - Server-side Sentry configuration
- `sentry.edge.config.ts` - Edge runtime Sentry configuration
- `instrumentation.ts` - Server instrumentation hook
- `next.config.ts` - Next.js config with Sentry webpack plugin

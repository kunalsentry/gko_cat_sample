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

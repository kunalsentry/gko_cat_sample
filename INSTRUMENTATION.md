# Performance Monitoring & Logging Instrumentation

This document describes the performance monitoring and logging setup for the Cat Facts application.

## Overview

The application is fully instrumented with Sentry for:
- **Performance Monitoring**: Track API response times, page load metrics, and custom operations
- **Structured Logging**: Consistent logging with breadcrumbs and context
- **Error Tracking**: Automatic error capture with rich context

## Components

### 1. Structured Logger (`lib/logger.ts`)

A centralized logging utility that integrates with Sentry:

```typescript
import { apiLogger } from '@/lib/logger';

// Info logging
apiLogger.info('Operation started', { key: 'value' });

// Error logging with exception
apiLogger.error('Operation failed', error, { context: 'data' });

// Performance tracking
await apiLogger.startSpan('operation-name', 'operation-type', async () => {
  // Your code here
});
```

**Features:**
- Automatic Sentry breadcrumb creation
- Structured data logging with timestamps
- Built-in performance span tracking
- Error context capture

**Available Loggers:**
- `apiLogger` - For API/backend operations
- `uiLogger` - For UI interactions
- `perfLogger` - For performance-specific logging

### 2. Performance Metrics (`app/ClientMetrics.tsx`)

Automatically captures Web Vitals and performance metrics on page load:

**Metrics Tracked:**
- DNS Lookup Time
- TCP Connection Time
- Time to First Byte (TTFB)
- Download Time
- DOM Interactive Time
- DOM Complete Time
- Load Complete Time

All metrics are automatically sent to Sentry for aggregation and analysis.

### 3. API Performance Tracking (`app/page.tsx`)

The cat fact API fetch is fully instrumented:

```typescript
await apiLogger.startSpan('fetch-cat-fact', 'http.client', async () => {
  // API call with timing and error tracking
});
```

**Tracked Data:**
- API response time
- Cat fact length
- Success/failure status
- Error details and context

**Custom Measurements:**
- `api_response_time` - Time taken for API response
- `fact_length` - Length of the cat fact in characters

**Tags:**
- `cat_fact_length` - "long" or "short" based on character count
- `api` - API endpoint being called
- `status_code` - HTTP response status

### 4. User Interaction Tracking

**Refresh Button** (`app/RefreshButton.tsx`):
- Logs user clicks
- Creates Sentry breadcrumbs for interaction tracking

**Test Buttons** (`app/SentryTestButtons.tsx`):
- Collapsible test panel on the main page
- Three test scenarios:
  1. Client-side error
  2. Server-side error (API route)
  3. Manual message capture

## Logs in Action

### Console Output

All logs follow this format:
```
[CONTEXT] Message { data: 'value' }
```

Example from the cat facts page:
```
[API] Rendering cat facts home page
[API] Starting fetch-cat-fact
[API] Fetching new cat fact from API { url: 'https://catfact.ninja/fact', method: 'GET' }
[API] Successfully fetched cat fact { factLength: 44, duration: '2ms', factPreview: '...' }
[API] Completed fetch-cat-fact { duration: '4ms' }
[API] Page render complete { factLength: 44 }
```

### Sentry Dashboard

In your Sentry dashboard, you'll see:

1. **Performance Tab:**
   - Transaction: `GET /`
   - Custom spans: `fetch-cat-fact`
   - Measurements: `api_response_time`, `fact_length`, `ttfb`, etc.

2. **Issues Tab:**
   - Errors with full stack traces
   - Breadcrumbs showing user journey
   - Context data (API status, timing, etc.)

3. **Breadcrumbs:**
   - Navigation events (page loads)
   - API calls (start, success, failure)
   - UI interactions (button clicks)
   - Performance metrics collection

## Testing the Instrumentation

### 1. Normal Operation
Visit http://localhost:3000 and check:
- Console shows structured logs
- Sentry receives performance data
- API timing is tracked

### 2. Error Scenarios
Click "Show Sentry Tests" on the main page:
- **Throw Client Error**: Tests client-side error capture
- **Test Server Error**: Tests API route error capture
- **Send Test Message**: Tests manual event capture

### 3. Performance Monitoring
Refresh the page multiple times:
- Check Sentry Performance tab for transaction times
- View custom measurements (API response time, etc.)
- Analyze trends over multiple page loads

## Configuration

### Environment Variables
```bash
NEXT_PUBLIC_SENTRY_DSN=your-dsn-here
```

### Sentry Config Files
- `sentry.client.config.ts` - Client-side configuration
- `sentry.server.config.ts` - Server-side configuration
- `sentry.edge.config.ts` - Edge runtime configuration
- `instrumentation.ts` - Server instrumentation hook

## Best Practices

1. **Use the Logger**: Always use the structured logger instead of `console.log`
   ```typescript
   // Good
   apiLogger.info('Operation completed', { duration: '5ms' });

   // Avoid
   console.log('Operation completed');
   ```

2. **Add Context**: Include relevant data with every log
   ```typescript
   apiLogger.error('API failed', error, {
     endpoint: '/api/endpoint',
     status: 500,
     duration: '100ms',
   });
   ```

3. **Track Performance**: Use `startSpan` for operations you want to measure
   ```typescript
   await logger.startSpan('operation-name', 'operation-type', async () => {
     // Your code
   });
   ```

4. **Set Tags**: Use tags for filtering in Sentry
   ```typescript
   Sentry.setTag('feature', 'cat-facts');
   ```

5. **Capture Context**: Add breadcrumbs for important user actions
   ```typescript
   Sentry.addBreadcrumb({
     category: 'user-action',
     message: 'User clicked button',
     data: { button: 'submit' },
   });
   ```

## Metrics Reference

### Custom Measurements
| Measurement | Unit | Description |
|-------------|------|-------------|
| `api_response_time` | millisecond | Time for API to respond |
| `fact_length` | character | Length of cat fact text |
| `dns_lookup` | millisecond | DNS resolution time |
| `tcp_connection` | millisecond | TCP handshake time |
| `ttfb` | millisecond | Time to first byte |
| `dom_interactive` | millisecond | DOM interactive state |
| `dom_complete` | millisecond | DOM complete state |

### Tags
| Tag | Values | Description |
|-----|--------|-------------|
| `cat_fact_length` | long, short | Fact text length category |
| `api` | catfact.ninja | API provider |
| `endpoint` | /fact | API endpoint called |
| `status_code` | 200, 500, etc. | HTTP response code |
| `logger_context` | API, UI, Performance | Logger category |

## Troubleshooting

### Logs not appearing in Sentry
- Check `NEXT_PUBLIC_SENTRY_DSN` is set
- Verify network requests to Sentry (check browser DevTools)
- Ensure Sentry is initialized (check for Sentry scripts in page source)

### Performance data missing
- Enable tracing: `tracesSampleRate: 1.0` in Sentry config
- Check instrumentation hook is enabled in `next.config.ts`
- Verify transactions appear in Sentry Performance tab

### Breadcrumbs not showing
- Breadcrumbs are attached to errors/transactions
- Trigger an error to see breadcrumbs leading up to it
- Check Sentry issue details for breadcrumb trail

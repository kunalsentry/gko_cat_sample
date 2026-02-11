# Sentry Metrics & MCP Server Guide

This document describes the custom metrics tracking and Sentry MCP server integration.

## Sentry MCP Server

The `.mcp.json` file configures Claude Code to use the Sentry MCP server, enabling direct Sentry integration within your development environment.

### Configuration

```json
{
  "mcpServers": {
    "sentry": {
      "command": "npx",
      "args": ["-y", "@sentry/mcp-server@latest"],
      "env": {
        "SENTRY_ORG": "kunal-test-org",
        "SENTRY_PROJECT": "gko_cat"
      }
    }
  }
}
```

### What It Enables

- Query Sentry issues directly from Claude Code
- Analyze error trends and patterns
- Get real-time insights about your application health
- Automated debugging assistance with Sentry context

---

## Custom Metrics

The application now tracks comprehensive custom metrics using `Sentry.metrics`.

### Metrics Categories

#### 1. Log Metrics

Track log events by severity level:

```typescript
// Automatically tracked by logger
log.info: 1       // Info log counter
log.warn: 1       // Warning log counter
log.error: 1      // Error log counter
```

**Tags:**
- `context`: Logger context (API, UI, Performance)
- `level`: Log level (info, warn, error)

---

#### 2. Error Metrics

Track error occurrences and types:

```typescript
errors.total: 1   // Total errors
```

**Tags:**
- `context`: Error context
- `error_type`: Error class name (TypeError, Error, etc.)

---

#### 3. Operation Metrics

Track operation lifecycle and performance:

```typescript
operation.{name}.started: 1      // Operation initiated
operation.{name}.success: 1      // Operation succeeded
operation.{name}.failed: 1       // Operation failed
operation.{name}.duration: 186   // Operation duration (ms)
```

**Example:** `operation.fetch-cat-fact.duration: 186ms`

**Tags:**
- `context`: Operation context

---

#### 4. API Metrics

Track API performance and outcomes:

```typescript
// Counter metrics
api.api_calls.success: 1
api.api_calls.failed: 1
api.api_calls.exception: 1

// Distribution metrics
api.response_time: 186ms
api.fact_length: 92 characters
api.failed_request_duration: 500ms

// Gauge metrics
api.current_fact_length: 92
```

**Tags:**
- `endpoint`: API endpoint path (/fact)
- `status`: Request status (success, failed)
- `status_code`: HTTP status code (200, 500, etc.)
- `api`: API provider (catfact.ninja)
- `category`: Data category (long, short)
- `error_type`: Exception type name

---

#### 5. Page Metrics

Track page views and render success:

```typescript
api.page.views: 1               // Page view counter
api.page.renders.success: 1     // Successful render counter
```

**Tags:**
- `page`: Page identifier (home)

---

## Using Custom Metrics

### In Your Code

The `Logger` class provides helper methods for tracking metrics:

```typescript
import { apiLogger } from '@/lib/logger';

// Track a counter
apiLogger.trackCounter('custom.event', 1, {
  event_type: 'user_action',
});

// Track a gauge (current value)
apiLogger.trackGauge('active.connections', 42, {
  server: 'api-1',
});

// Track a distribution (for percentiles)
apiLogger.trackDistribution('request.size', 1024, 'byte', {
  endpoint: '/api/data',
});
```

### Automatic Tracking

Many metrics are tracked automatically:

1. **Logger calls** → `log.{level}` counters
2. **Errors** → `errors.total` counter
3. **startSpan operations** → Operation lifecycle metrics
4. **API calls** (in page.tsx) → API performance metrics
5. **Page loads** → Page view counters

---

## Viewing Metrics in Sentry

### Dashboard Location

1. Go to your Sentry project: https://kunal-test-org.sentry.io/projects/gko_cat/
2. Navigate to **Insights** → **Custom Metrics**
3. Or use the Metrics Explorer

### Query Examples

**Average API response time:**
```
avg(api.response_time){endpoint:/fact}
```

**Error rate:**
```
sum(errors.total) / sum(log.info)
```

**P95 cat fact fetch duration:**
```
p95(operation.fetch-cat-fact.duration)
```

**Success rate:**
```
sum(api.api_calls.success) / (sum(api.api_calls.success) + sum(api.api_calls.failed))
```

---

## Metrics Best Practices

### 1. Use the Right Metric Type

- **Counter (`increment`)**: Count occurrences (clicks, errors, events)
- **Gauge (`gauge`)**: Current value (memory usage, queue size)
- **Distribution (`distribution`)**: Statistical analysis (latency, size)

### 2. Add Meaningful Tags

```typescript
// Good - useful for filtering
apiLogger.trackCounter('cache.hit', 1, {
  cache_type: 'redis',
  region: 'us-east-1',
});

// Bad - not useful
apiLogger.trackCounter('cache.hit', 1, {
  timestamp: Date.now().toString(),  // Too unique!
});
```

### 3. Keep Tag Cardinality Low

- **Good**: status (success/failed), region (us-east/us-west)
- **Bad**: user_id, request_id (millions of unique values)

### 4. Use Consistent Naming

Follow the pattern: `{context}.{category}.{name}`

```typescript
api.request.duration      ✅
api_request_duration      ❌
duration                  ❌
```

---

## Metric Reference

| Metric | Type | Unit | Description |
|--------|------|------|-------------|
| `log.{level}` | Counter | count | Log events by level |
| `errors.total` | Counter | count | Total errors |
| `operation.{name}.started` | Counter | count | Operations started |
| `operation.{name}.success` | Counter | count | Operations succeeded |
| `operation.{name}.failed` | Counter | count | Operations failed |
| `operation.{name}.duration` | Distribution | millisecond | Operation timing |
| `api.response_time` | Distribution | millisecond | API response time |
| `api.fact_length` | Distribution | character | Cat fact length |
| `api.current_fact_length` | Gauge | character | Current fact length |
| `api.api_calls.success` | Counter | count | Successful API calls |
| `api.api_calls.failed` | Counter | count | Failed API calls |
| `api.api_calls.exception` | Counter | count | API exceptions |
| `api.failed_request_duration` | Distribution | millisecond | Failed request timing |
| `api.page.views` | Counter | count | Page views |
| `api.page.renders.success` | Counter | count | Successful renders |

---

## Troubleshooting

### Metrics not appearing in Sentry

1. **Check DSN is configured**: Verify `NEXT_PUBLIC_SENTRY_DSN` in `.env.local`
2. **Wait for aggregation**: Metrics may take 1-2 minutes to appear
3. **Check sample data**: Make sure you've triggered the events
4. **Verify metrics are enabled**: Ensure Sentry plan supports custom metrics

### "metrics.increment is not a function" error

This error means `Sentry.metrics` is not available in the current context. The logger now handles this gracefully with try-catch blocks, but if you see this:

1. Make sure you're using the latest version of `@sentry/nextjs`
2. Check that metrics are being called through the Logger class, not directly
3. Verify the code is running in a supported environment (server-side)

### High cardinality warnings

If Sentry warns about high cardinality:

1. Review your tags - remove tags with too many unique values
2. Use fixed categories instead of dynamic values
3. Consider using distributions instead of counters with tags

---

## Next Steps

1. **Set up alerts** based on metrics (error rate spikes, slow response times)
2. **Create dashboards** with your most important metrics
3. **Add more custom metrics** for business-specific events
4. **Use metrics for SLO tracking** (uptime, performance targets)

## Resources

- [Sentry Metrics Documentation](https://docs.sentry.io/product/metrics/)
- [Sentry MCP Server](https://github.com/getsentry/sentry-mcp)
- [Best Practices for Metrics](https://docs.sentry.io/product/metrics/best-practices/)

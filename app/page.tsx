import * as Sentry from '@sentry/nextjs';
import RefreshButton from './RefreshButton';
import SentryTestButtons from './SentryTestButtons';
import { apiLogger } from '@/lib/logger';

interface CatFactResponse {
  fact: string;
  length: number;
}

async function getCatFact(): Promise<string> {
  // Use structured logger with performance tracking
  return await apiLogger.startSpan('fetch-cat-fact', 'http.client', async () => {
    const startTime = Date.now();

    apiLogger.info('Fetching new cat fact from API', {
      url: 'https://catfact.ninja/fact',
      method: 'GET',
    });

    try {
      const res = await fetch('https://catfact.ninja/fact', {
        cache: 'no-store', // Ensures fresh data on every request
      });

      // Randomly introduce latency on 30% of requests
      const shouldDelay = Math.random() < 0.3;
      if (shouldDelay) {
        const delayMs = Math.floor(Math.random() * 4000) + 1000; // 1-5 seconds
        apiLogger.warn('Introducing artificial latency for performance testing', {
          delayMs,
          delaySeconds: (delayMs / 1000).toFixed(2),
        });
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }

      const duration = Date.now() - startTime;

      if (!res.ok) {
        const error = new Error(`Cat Facts API returned status ${res.status}`);

        apiLogger.error('API request failed', error, {
          status: res.status,
          statusText: res.statusText,
          duration: `${duration}ms`,
        });

        // Track failure metrics
        apiLogger.trackCounter('api_calls.failed', 1, {
          endpoint: '/fact',
          status_code: res.status.toString(),
          api: 'catfact.ninja',
        });

        apiLogger.trackDistribution('failed_request_duration', duration, 'millisecond', {
          status_code: res.status.toString(),
        });

        // Capture with additional context
        Sentry.captureException(error, {
          tags: {
            api: 'catfact.ninja',
            endpoint: '/fact',
            status_code: res.status,
          },
          contexts: {
            response: {
              status: res.status,
              statusText: res.statusText,
              duration,
            },
          },
        });

        throw error;
      }

      const data: CatFactResponse = await res.json();

      apiLogger.info('Successfully fetched cat fact', {
        factLength: data.length,
        duration: `${duration}ms`,
        factPreview: data.fact.substring(0, 50) + '...',
      });

      // Set custom measurements for Sentry performance monitoring
      Sentry.setMeasurement('api_response_time', duration, 'millisecond');
      Sentry.setMeasurement('fact_length', data.length, 'character');
      Sentry.setTag('cat_fact_length', data.length > 100 ? 'long' : 'short');

      // Track custom metrics with Sentry.metrics
      apiLogger.trackDistribution('response_time', duration, 'millisecond', {
        endpoint: '/fact',
        status: 'success',
      });

      apiLogger.trackDistribution('fact_length', data.length, 'character', {
        category: data.length > 100 ? 'long' : 'short',
      });

      apiLogger.trackCounter('api_calls.success', 1, {
        endpoint: '/fact',
        api: 'catfact.ninja',
      });

      // Track gauge for current fact length
      apiLogger.trackGauge('current_fact_length', data.length, {
        endpoint: '/fact',
      });

      return data.fact;
    } catch (error) {
      const duration = Date.now() - startTime;

      apiLogger.error('Exception during cat fact fetch', error, {
        duration: `${duration}ms`,
        url: 'https://catfact.ninja/fact',
      });

      // Track exception metrics
      apiLogger.trackCounter('api_calls.exception', 1, {
        endpoint: '/fact',
        error_type: error instanceof Error ? error.name : 'unknown',
      });

      return 'Failed to load cat fact. Please refresh the page to try again.';
    }
  });
}

export default async function Home() {
  apiLogger.info('Rendering cat facts home page');

  // Track page view
  apiLogger.trackCounter('page.views', 1, {
    page: 'home',
  });

  Sentry.addBreadcrumb({
    category: 'navigation',
    message: 'Home page render started',
    level: 'info',
  });

  const catFact = await getCatFact();

  apiLogger.info('Page render complete', {
    factLength: catFact.length,
  });

  // Track successful page renders
  apiLogger.trackCounter('page.renders.success', 1, {
    page: 'home',
  });

  return (
    <main style={{
      maxWidth: '800px',
      width: '100%',
      padding: '40px',
      background: 'white',
      borderRadius: '20px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '30px',
      }}>
        <h1 style={{
          fontSize: '3rem',
          marginBottom: '10px',
          color: '#667eea',
        }}>
          🐱
        </h1>
        <h2 style={{
          fontSize: '2rem',
          color: '#333',
          marginBottom: '10px',
        }}>
          Cat Fact of the Moment
        </h2>
        <p style={{
          color: '#666',
          fontSize: '0.9rem',
        }}>
          Refresh the page for a new fact
        </p>
      </div>

      <div style={{
        padding: '30px',
        background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
        borderRadius: '15px',
        border: '2px solid #667eea20',
      }}>
        <p style={{
          fontSize: '1.25rem',
          lineHeight: '1.8',
          color: '#444',
          textAlign: 'center',
        }}>
          {catFact}
        </p>
      </div>

      <div style={{
        marginTop: '30px',
        textAlign: 'center',
      }}>
        <RefreshButton />
      </div>

      <SentryTestButtons />

      <div style={{
        marginTop: '30px',
        textAlign: 'center',
        color: '#999',
        fontSize: '0.8rem',
      }}>
        <p>Data provided by Cat Facts API</p>
      </div>
    </main>
  );
}

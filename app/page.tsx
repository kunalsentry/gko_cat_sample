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

      const duration = Date.now() - startTime;

      if (!res.ok) {
        const error = new Error(`Cat Facts API returned status ${res.status}`);

        apiLogger.error('API request failed', error, {
          status: res.status,
          statusText: res.statusText,
          duration: `${duration}ms`,
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

      return data.fact;
    } catch (error) {
      const duration = Date.now() - startTime;

      apiLogger.error('Exception during cat fact fetch', error, {
        duration: `${duration}ms`,
        url: 'https://catfact.ninja/fact',
      });

      return 'Failed to load cat fact. Please refresh the page to try again.';
    }
  });
}

export default async function Home() {
  apiLogger.info('Rendering cat facts home page');

  Sentry.addBreadcrumb({
    category: 'navigation',
    message: 'Home page render started',
    level: 'info',
  });

  const catFact = await getCatFact();

  apiLogger.info('Page render complete', {
    factLength: catFact.length,
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

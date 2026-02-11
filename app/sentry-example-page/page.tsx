'use client';

import * as Sentry from '@sentry/nextjs';

export default function SentryExamplePage() {
  return (
    <main style={{
      maxWidth: '800px',
      width: '100%',
      padding: '40px',
      background: 'white',
      borderRadius: '20px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      margin: '0 auto',
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '30px',
      }}>
        <h1 style={{
          fontSize: '2rem',
          color: '#333',
          marginBottom: '20px',
        }}>
          Sentry Error Testing
        </h1>
        <p style={{
          color: '#666',
          marginBottom: '30px',
        }}>
          Click the buttons below to test different types of errors that will be sent to Sentry.
        </p>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
      }}>
        <button
          onClick={() => {
            throw new Error('Sentry Client-side Test Error - Button Click');
          }}
          style={{
            padding: '15px 30px',
            fontSize: '1rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          Throw Test Error
        </button>

        <button
          onClick={async () => {
            const response = await fetch('/api/sentry-example-api');
            const data = await response.json();
            console.log(data);
          }}
          style={{
            padding: '15px 30px',
            fontSize: '1rem',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          Test Server-side Error (API Route)
        </button>

        <button
          onClick={() => {
            Sentry.captureMessage('Sentry Test Message - Manual Capture', 'info');
            alert('Test message sent to Sentry! Check your Sentry dashboard.');
          }}
          style={{
            padding: '15px 30px',
            fontSize: '1rem',
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          Send Test Message
        </button>
      </div>

      <div style={{
        marginTop: '40px',
        padding: '20px',
        background: '#f5f5f5',
        borderRadius: '10px',
      }}>
        <h3 style={{ color: '#333', marginBottom: '10px' }}>Instructions:</h3>
        <ol style={{ color: '#666', lineHeight: '1.8' }}>
          <li>Make sure you've configured your Sentry DSN in .env.local</li>
          <li>Click any button above to trigger an error or send a message</li>
          <li>Check your Sentry dashboard to see the captured event</li>
          <li>The first button throws a client-side error</li>
          <li>The second button triggers a server-side API error</li>
          <li>The third button sends a test message to Sentry</li>
        </ol>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <a
          href="/"
          style={{
            color: '#667eea',
            textDecoration: 'none',
            fontWeight: '600',
          }}
        >
          ← Back to Home
        </a>
      </div>
    </main>
  );
}

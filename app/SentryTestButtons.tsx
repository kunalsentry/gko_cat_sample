'use client';

import * as Sentry from '@sentry/nextjs';
import { useState } from 'react';

export default function SentryTestButtons() {
  const [showTests, setShowTests] = useState(false);

  return (
    <div style={{ marginTop: '20px', textAlign: 'center' }}>
      <button
        onClick={() => setShowTests(!showTests)}
        style={{
          padding: '8px 20px',
          fontSize: '0.9rem',
          background: '#f0f0f0',
          color: '#666',
          border: '1px solid #ddd',
          borderRadius: '20px',
          cursor: 'pointer',
          fontWeight: '500',
        }}
      >
        {showTests ? '− Hide' : '+ Show'} Sentry Tests
      </button>

      {showTests && (
        <div style={{
          marginTop: '20px',
          padding: '20px',
          background: '#f9f9f9',
          borderRadius: '10px',
          border: '1px solid #e0e0e0',
        }}>
          <p style={{
            fontSize: '0.85rem',
            color: '#666',
            marginBottom: '15px',
          }}>
            Test Sentry error monitoring and performance tracking:
          </p>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}>
            <button
              onClick={() => {
                throw new Error('Sentry Client-side Test Error');
              }}
              style={{
                padding: '10px 20px',
                fontSize: '0.9rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              Throw Client Error
            </button>

            <button
              onClick={async () => {
                try {
                  const response = await fetch('/api/sentry-example-api');
                  await response.json();
                } catch (error) {
                  console.error('API error:', error);
                }
              }}
              style={{
                padding: '10px 20px',
                fontSize: '0.9rem',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              Test Server Error
            </button>

            <button
              onClick={() => {
                Sentry.captureMessage('Sentry Test Message - User clicked test button', 'info');
                alert('Test message sent to Sentry!');
              }}
              style={{
                padding: '10px 20px',
                fontSize: '0.9rem',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              Send Test Message
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

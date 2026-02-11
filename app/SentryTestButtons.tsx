'use client';

import * as Sentry from '@sentry/nextjs';
import { useState } from 'react';

export default function SentryTestButtons() {
  const [showTests, setShowTests] = useState(false);

  const handleToggle = () => {
    const newState = !showTests;
    setShowTests(newState);

    // Track test panel toggle with breadcrumb
    Sentry.addBreadcrumb({
      category: 'ui.interaction',
      message: `Test panel ${newState ? 'shown' : 'hidden'}`,
      level: 'info',
      data: {
        component: 'SentryTestButtons',
        action: newState ? 'show' : 'hide',
      },
    });
  };

  return (
    <div style={{ marginTop: '20px', textAlign: 'center' }}>
      <button
        onClick={handleToggle}
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
                // Track test button click
                Sentry.addBreadcrumb({
                  category: 'test',
                  message: 'User triggered client-side test error',
                  level: 'info',
                  data: {
                    test_type: 'client_error',
                    source: 'test_button',
                  },
                });

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
                // Track test button click
                Sentry.addBreadcrumb({
                  category: 'test',
                  message: 'User triggered server-side test error',
                  level: 'info',
                  data: {
                    test_type: 'server_error',
                    source: 'test_button',
                  },
                });

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
                // Capture structured log with custom attributes
                Sentry.logger.info('Test message button clicked', {
                  action: 'test_message_sent',
                  component: 'SentryTestButtons',
                  timestamp: new Date().toISOString(),
                  userAction: 'manual_test',
                  source: 'test_button',
                });

                alert('Test log sent to Sentry!');
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

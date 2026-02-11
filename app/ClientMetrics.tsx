'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function ClientMetrics() {
  useEffect(() => {
    console.log('[Cat Facts] Client-side metrics initialized');

    // Add breadcrumb for page load
    Sentry.addBreadcrumb({
      category: 'navigation',
      message: 'Page loaded on client',
      level: 'info',
    });

    // Capture Web Vitals and other performance metrics
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Wait for the page to be fully loaded
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

          if (perfData) {
            const metrics = {
              dns: perfData.domainLookupEnd - perfData.domainLookupStart,
              tcp: perfData.connectEnd - perfData.connectStart,
              ttfb: perfData.responseStart - perfData.requestStart,
              download: perfData.responseEnd - perfData.responseStart,
              domInteractive: perfData.domInteractive,
              domComplete: perfData.domComplete,
              loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
            };

            console.log('[Cat Facts] Performance metrics:', {
              'DNS Lookup': `${metrics.dns.toFixed(2)}ms`,
              'TCP Connection': `${metrics.tcp.toFixed(2)}ms`,
              'Time to First Byte': `${metrics.ttfb.toFixed(2)}ms`,
              'Download Time': `${metrics.download.toFixed(2)}ms`,
              'DOM Interactive': `${metrics.domInteractive.toFixed(2)}ms`,
              'DOM Complete': `${metrics.domComplete.toFixed(2)}ms`,
              'Load Complete': `${metrics.loadComplete.toFixed(2)}ms`,
            });

            // Send metrics to Sentry
            Sentry.setMeasurement('dns_lookup', metrics.dns, 'millisecond');
            Sentry.setMeasurement('tcp_connection', metrics.tcp, 'millisecond');
            Sentry.setMeasurement('ttfb', metrics.ttfb, 'millisecond');
            Sentry.setMeasurement('download_time', metrics.download, 'millisecond');
            Sentry.setMeasurement('dom_interactive', metrics.domInteractive, 'millisecond');
            Sentry.setMeasurement('dom_complete', metrics.domComplete, 'millisecond');

            // Add breadcrumb with performance data
            Sentry.addBreadcrumb({
              category: 'performance',
              message: 'Page performance metrics collected',
              level: 'info',
              data: {
                ttfb: `${metrics.ttfb.toFixed(2)}ms`,
                domComplete: `${metrics.domComplete.toFixed(2)}ms`,
              },
            });
          }
        }, 0);
      });
    }

    // Track client-side errors
    const handleError = (event: ErrorEvent) => {
      console.error('[Cat Facts] Client-side error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    };

    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  return null; // This component doesn't render anything
}

'use client';

import { useEffect } from 'react';

export function RegisterServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Check if there's an existing service worker and unregister it first
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        console.log('Existing service worker registrations:', registrations.length);
      });

      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);

          // Check for updates immediately
          registration.update();

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            console.log('New service worker found, installing...');

            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                console.log('Service Worker state changed to:', newWorker.state);

                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker available, but old one is still controlling
                  console.log('New service worker installed, reloading page...');
                  window.location.reload();
                }

                if (newWorker.state === 'activated') {
                  console.log('New service worker activated!');
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });

      // Add a manual unregister function to window for debugging
      (window as any).unregisterServiceWorker = async () => {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
          console.log('Service worker unregistered');
        }
        window.location.reload();
      };

      console.log('To manually unregister service worker, run: window.unregisterServiceWorker()');
    }
  }, []);

  return null;
}

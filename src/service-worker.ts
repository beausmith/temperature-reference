/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope;

clientsClaim();

precacheAndRoute(self.__WB_MANIFEST);

const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
registerRoute(
  ({ request, url }: { request: Request; url: URL }) => {
    if (request.mode !== 'navigate') {
      return false;
    }

    if (url.pathname.startsWith('/_')) {
      return false;
    }

    if (url.pathname.match(fileExtensionRegexp)) {
      return false;
    }

    return true;
  },
  createHandlerBoundToURL(import.meta.env.BASE_URL + 'index.html')
);

registerRoute(
  ({ url }) => url.origin === self.location.origin && url.pathname.endsWith('.png'),
  new StaleWhileRevalidate({
    cacheName: 'images',
    plugins: [
      // Cap the image cache and let entries expire after 30 days so stale
      // images don't live forever.
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  })
);

// Activate a newly installed service worker immediately instead of waiting for
// every tab to close. Combined with clientsClaim() above, the new worker takes
// control of open pages right away; the page reloads itself on controllerchange.
self.addEventListener('install', () => {
  self.skipWaiting();
});

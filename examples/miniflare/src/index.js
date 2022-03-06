import { handleRequest } from 'express-flare';
import router from './routes';

// eslint-disable-next-line no-restricted-globals
addEventListener('fetch', (event) => {
  event.respondWith(handleRequest({
    event,
    router,
    cacheTime: 0,
    parseCookie: true,
  }));
});

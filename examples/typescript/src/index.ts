import { handleRequest, router } from 'express-flare';

router.use((req, res, next) => {
  console.log('First middleware');

  next();
});

router.get('/', async (req, res) => {
  res.json({ success: true });
});

addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(handleRequest({
    event,
    router,
  }))
})

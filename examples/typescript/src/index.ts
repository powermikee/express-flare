import { handleRequest, router } from '../../../src/index';

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

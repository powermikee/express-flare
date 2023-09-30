const { handleRequest, router } = require('../src/index');

let middlewares = [];

router.error((error, req, res, next) => {
  if (error) {
    return res.status(400).json({ success: false });
  }

  next();
});

router.use((req, res, next) => {
  req.middleware1 = true;

  req.userId = 1;

  middlewares.push('mw1');

  req.middlewares = middlewares;

  next();
});

router.use((req, res, next) => {
  middlewares.push('mw2');

  req.middlewares = middlewares;

  next();
});

router.get('/', (req, res) => {
  res.send('Works!');
});

router.get('/json', (req, res) => {
  res.json({ worked: true });
});

router.get('/test/another/2', (req, res) => {
  res.json({ exact: true });
});

router.get('/test/another/:id', (req, res) => {
  res.json({ nested: 'worked' });
});

router.get('/test/:id/:name', (req, res) => {
  const { id, name } = req.params;

  res.json({ id, name });
});

router.get('/test', (req, res) => {
  const { id, name } = req.query;

  res.json({ id, name });
});

router.get('/middleware', (req, res) => {
  const { middleware1 } = req;

  res.json({ middleware1 });
});

router.get('/middleware-time', (req, res, next) => {
  middlewares.push('mw3');

  req.middlewares = middlewares;

  next();
}, (req, res) => {
  const { middlewares: mw } = req;

  res.json({
    middlewares: mw,
  });
});

router.get('/cache', (req, res) => {
  res.json({ success: true });
}, 4000);

router.post('/cache', (req, res) => {
  const url = `${req.origin}/cache#${req.userId}`;

  caches.default.delete(url);

  res.json({ success: true });
});

router.get('/error', (req, res, next) => {
  next('failed');
}, (req, res) => {
  res.json({ success: true });
});

router.post('/post', (req, res) => {
  const body = req.bodyContent;

  res.json({ body });
});

router.put('/put', (req, res) => {
  const body = req.bodyContent;

  res.json({ body });
});

router.delete('/delete', (req, res) => {
  res.json({ success: true });
});

router.patch('/patch', (req, res) => {
  res.json({ success: true });
});

router.get('/get-cookies', (req, res) => {
  const { cookie1, cookie2 } = req.cookie;

  res.json({ cookie1, cookie2 });
});

router.get('/set-cookies', (req, res) => {
  res.setCookie('id', '1234').json({ success: true });
});

router.put('/random', (req, res) => {
  res.json({ notWildcard: true });
});

router.get('/*', (req, res) => {
  res.json({ wildcardGet: true });
});

router.all('*', (req, res) => {
  res.json({ wildcardAll: true });
});

router.get('/chained', (req, res) => {
  res
    .status(200)
    .setHeader('Access-Control-Request-Method', 'GET')
    .setHeader('x-header', 'customHeader')
    .json({ success: true });
});

router.get('/end', (req, res) => {
  res.end('Done!');
});

router.get('/redirect', (req, res) => {
  res.redirect(`${req.origin}/end`, 301);
});

router.get('/render', (req, res) => {
  res.render('<div>Test page</div>');
});

// eslint-disable-next-line
addEventListener('fetch', (event) => {
  middlewares = [];

  event.respondWith(handleRequest({
    event,
    router,
    cacheTime: 0,
    getCacheKey: (req) => `${req.url}#${req.userId}`,
  }));
});

# Express-flare

Cloudflare Workers are absolutely incredible!

One of the hardest things of building in workers though is handling API routes.

```Express-flare``` was created to fill in the gaps and make creating APIs in cloudflare workers a joy.

Express-flare is heavily influenced by express and even has compatibility with many express middleware plugins.

## Getting started

Install express-flare:
```
npm i express-flare
```

Replace your handler and pass in your router:
```js
import { handleRequest, router } from 'express-flare';

router.get('/', (req, res) => {
  res.json({ success: true });
});

router.post('/', (req, res) => {
  const body = req.bodyContent;

  res.json({ success: true });
});

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest({
    event,
    router,
  }));
});
```

If you are not using import simply replace with require:
```js
const { handleRequest, router } = require('express-flare');
```

```Express-flare``` also works with the newer worker modules:
```js
import { handleRequest, router } from 'express-flare';

router.get('/', (req, res) => {
  res.json({ success: true });
});

export default {
  async fetch(request, env, context) {
    try {
      return await handleRequest({
        request,
        env,
        context,
        router,
      });
    } catch (e) {
      return new Response(e.message)
    }
  },
}
```

## HTTP Methods
Express-flare has full support for all major express http methods.

If you are familiar with express it should be extremely easy to get started. 

You should be to copy and paste most of your express code and it should just work.

Examples:

```js
router.get('/red', async (req, res) => {
  res.json({ worked: true });
});

router.post('/test/another', (req, res) => {
  res.json({ worked: true });
});

router.delete('/test', (req, res) => {
  res.json({ worked: true });
});

router.patch('/name', (req, res) => {
  res.json({ worked: true });
});

router.put('/test/other', (req, res) => {
  res.json({ worked: true });
});

router.all('*', (req, res) => {
  res.json({ worked: true });
});
```

## Url and query params

Route params and query params work the same as express.

```js
// example: /stores/23
router.get('/stores/:id', async (req, res) => {
  const { id } = req.params;

  res.json({ worked: true });
});

// example: /stores/product/5
router.get('/stores/product/:id', async (req, res) => {
  const { id } = req.params;

  res.json({ worked: true });
});

// example: /stores?name=chicago
router.get('/stores', async (req, res) => {
  const { name } = req.query;
  
  res.json({ worked: true });
});
```

## Response methods

Here are some examples of supported response methods.

### res.status(statusCode: number):

```js
router.get('/test', async (req, res) => {
  res.status(200).json({ worked: true });
});
```

### res.json(json: object):
This method will also add the json content headers.

```js
router.get('/test', async (req, res) => {
  res.json({ worked: true });
});
```

### res.send(text: string):

```js
router.get('/test', async (req, res) => {
  res.send('All done!');
});
```

### res.redirect(url: string, statusCode: number):

Cloudflare requires absolute URLs for redirects. So relative paths like ```/stores``` won't work.

Express-flare provides the url base in ```req.origin``` for convenience.

```js
router.get('/test', async (req, res) => {
  res.redirect(`${req.origin}/stores`, 301);
});
```

### res.end(text: string):

```js
router.get('/test', async (req, res) => {
  res.end('Failed');
});
```

### res.setHeader(name: string, value: string):

```js
router.get('/test', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
});
```

### res.setCookie(name: string, value: string):

```js
router.get('/test', async (req, res) => {
  res.setCookie('name', 'value');
});
```

### res.removeHeader(name: string):

```js
router.get('/test', async (req, res) => {
  res.removeHeader('Content-Type');
});
```

### Method chaining:

```js
router.get('/test', async (req, res) => {
  res
    .status(200)
    .setHeader('Access-Control-Allow-Origin', '*')
    .send('Worked!');
});
```

## Getting POST body

For convenience ```express-flare``` will parse the body content and return a value to ```req.bodyContent```. 

This is what you need is most cases and works similar to express.

If you want access to the original unparsed body stream you can access ```req.body```.

```js
router.post('/test', async (req, res) => {
  const body = req.bodyContent;

  res.send('Success!');
});
```

## Cookies

Get cookie:
```js
router.get('/test', async (req, res) => {
  const { jwt } = req.cookies;

  res.send('Success!');
});
```

Set cookie:
```js
router.get('/test', async (req, res) => {
  res.setCookie('name', 'value').send('Success!');
});
```

## Middleware

Express-flare has full support for express style middleware.

### Global middleware

**Note:** when you call ```router.use()``` you must call ```next()``` or return a response eg. ```res.send()``` or your routing will fail.

```js
router.use((req, res, next) => {
  console.log('middleware');

  next();
});

router.get('/', async (req, res) => {
  res.json({ success: true });
});
```

Global middleware will run sequentially, ```next()``` moves the routing to the next middleware.

```js
router.use((req, res, next) => {
  console.log('First');

  // update req object
  req.user = 'Mike';

  next();
});

router.use((req, res, next) => {
  console.log('Second');

  if(!req.user) {
    res.status(400).send('No user found!');
  } else {
    next();
  }
});

router.get('/', (req, res) => {
  console.log('Last');

  res.json({ success: true });
});
```

### Route middleware

The main difference with ```express-flare``` to express is that route middleware will always run after global middleware no matter how you order it.

This was an intentional change since many people get confused with how the ordering in express works.

```js
router.use((req, res, next) => {
  console.log('First');

  next();
});

router.get('/', (req, res, next) => {
  console.log('Third');

  next();
}, (req, res) => {
  console.log('Last');

  res.json({ success: true });
});

router.use((req, res, next) => {
  console.log('Second');

  next();
});
```

### Thirdparty middleware

Express-flare has been tested with several express middleware plugins.

Example:

```js
import cors from 'cors';
import jwt from 'express-jwt';

router.use(cors());

router.use(jwt({
  secret: 'shhhhhhared-secret', 
  algorithms: ['HS256'],
}));

router.get('/', (req, res) => {
  if (!req.user.admin) {
    return res.status(401).send('Unauthorized');
  }

  res.json({ success: true });
});

// also works with route based middleware
app.get('/protected', jwt({ 
  secret: 'shhhhhhared-secret', 
  algorithms: ['HS256'],
}), (req, res) => {
  if (!req.user.admin) {
    return res.status(401).send('Failed');
  }

  res.status(200).send('Yayyy!');
});
```

## Wildcard routes

Express-flare only supports the top level wildcard routes with ```*``` but not for example ```/stores/*```.

Works with any http method or ```router.all()```.

```js
// will get called with any GET 
router.get('*', (req, res) => {
  console.log('Last');

  res.json({ success: true });
});

// will get called with all routes and methods
router.all('*', (req, res) => {
  res.json({ success: true });
});

// for more specific filtering
router.all('*', (req, res) => {
  if(req.pathname.startsWith('/help') && req.method === 'POST') {
    req.json({ success: false });
  } else {
    res.json({ success: true });
  }
});
```

## Edge caching

One of the most awesome things about workers is the use of the caching API. 

https://developers.cloudflare.com/workers/runtime-apis/cache/

Express-flare handles caching for you, so you don't have to.

All caching is defined in seconds.

There are 2 ways to set the cache. 

### Global caching

Global caching will apply to all GET routes and is in seconds.

Internally workers will use the url as a cache key.

**Note: the cache API will not work on worker.dev domains.**

**You need to add a custom domain to Cloudflare for caching to work.**

https://www.andressevilla.com/how-to-setup-cloudflare-workers-on-a-custom-domain/

Global cache example:

```js
addEventListener('fetch', (event) => {
  event.respondWith(handleRequest({
    event,
    router,
    cacheTime: 3600,
  }));
});
```

### Route based caching

Route based caching will always supercede global caching. 

So for example with the below route, it would have a cache of 4000 seconds and all other GETs would use the above global cache time of 3600.

Example: 
```js
router.get('/test', async (req, res) => {
  res.json({ worked: true });
}, 4000);
```

## Typescript support

Express-flare has full support for typescript using JSdoc types. 

Take a look at the codebase to see how we added types. (We got the pattern from Preact)

JSdoc offers a great solution without the need for a TS build step. Meaning fast!

```js
/** @param { CallbackType } callback */
const use = (callback) => {
  if (callback) {
    routes.middleware.push(callback);
  }
};
```

## Worker fetch params
For convenience ```express-flare``` will pass all worker params to your routes via ```req```.

Example:
```js
router.get('/test', async (req, res) => {
  const { event } = req;

  res.json({ worked: true });
}, 4000);

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest({
    event,
    router,
  }));
});
```

## Environment variables and secrets

Fetch params are particularly useful with modules where you need to pass env vars or secrets.

Example:
```js
router.get('/test', async (req, res) => {
  const { env } = req;

  if(!env.JWT) {
    res.json({ allowed: false });
  }

  res.json({ success: true });
}, 4000);

export default {
  async fetch(request, env, context) {
    try {
      return await handleRequest({
        request,
        env,
        context,
        router,
      });
    } catch (e) {
      return new Response(e.message)
    }
  },
}
```

## Contributing

There's obviously lots that can be added. Create a PR and send any features you wish to contribute :smiley:
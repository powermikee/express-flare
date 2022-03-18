# Express-flare

**Express inspired routing for Cloudflare Workers.**

Cloudflare Workers are absolutely incredible!

One of the most complex things of building in workers is handling API routes.

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
router.get('/red', (req, res) => {
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
router.get('/stores/:id', (req, res) => {
  const { id } = req.params;

  res.json({ worked: true });
});

// example: /stores/product/5
router.get('/stores/product/:id', (req, res) => {
  const { id } = req.params;

  res.json({ worked: true });
});

// example: /stores?name=chicago
router.get('/stores', (req, res) => {
  const { name } = req.query;
  
  res.json({ worked: true });
});
```

## Response methods

Here are some examples of supported response methods.

### res.status(statusCode: number):

```js
router.get('/test', (req, res) => {
  res.status(200).json({ worked: true });
});
```

### res.json(json: object):
This method will also add the json content headers.

```js
router.get('/test', (req, res) => {
  res.json({ worked: true });
});
```

### res.send(text: string):

```js
router.get('/test', (req, res) => {
  res.send('All done!');
});
```

### res.redirect(url: string, statusCode: number):

Cloudflare requires absolute URLs for redirects. So relative paths like ```/stores``` won't work.

Express-flare provides the url base in ```req.origin``` for convenience.

```js
router.get('/test', (req, res) => {
  res.redirect(`${req.origin}/stores`, 301);
});
```

### res.end(text: string):

```js
router.get('/test', (req, res) => {
  res.end('Failed');
});
```

### res.setHeader(name: string, value: string):

```js
router.get('/test', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
});
```

### res.setCookie(name: string, value: string, options: object):

```js
router.get('/test', (req, res) => {
  res.setCookie('name', 'value');
});

router.get('/another', (req, res) => {
  res.setCookie('name', 'value', {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7 // 1 week
  });
});
```

### res.removeHeader(name: string):

```js
router.get('/test', (req, res) => {
  res.removeHeader('Content-Type');
});
```

### Method chaining:

```js
router.get('/test', (req, res) => {
  res
    .status(200)
    .setHeader('Access-Control-Allow-Origin', '*')
    .send('Worked!');
});
```

## Getting POST body

For convenience ```express-flare``` will parse the body content and return a value to ```req.bodyContent```. 

This is what you need in most cases and works similar to express.

If you want access to the original unparsed body stream you can access ```req.body```.

```js
router.post('/test', (req, res) => {
  const body = req.bodyContent;

  res.send('Success!');
});
```

## Cookies

Get cookie:
```js
router.get('/test', (req, res) => {
  const { jwt } = req.cookies;

  res.send('Success!');
});
```

Set cookie:
```js
router.get('/test', (req, res) => {
  res.setCookie('name', 'value').send('Success!');
});

router.get('/test', (req, res) => {
  res.setCookie('name', 'value', {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7 // 1 week
  }).send('Success!');
});
```

```express-flare``` uses the cookie package internally:

https://www.npmjs.com/package/cookie

Setting cookies has the following options:

**domain: string**

Specifies the value for the Domain Set-Cookie attribute. By default, no domain is set, and most clients will consider the cookie to apply to only the current domain.

**encode: function**

Specifies a function that will be used to encode a cookie's value. Since value of a cookie has a limited character set (and must be a simple string), this function can be used to encode a value into a string suited for a cookie's value.

The default function is the global encodeURIComponent, which will encode a JavaScript string into UTF-8 byte sequences and then URL-encode any that fall outside of the cookie range.

**expires: Date**

Specifies the Date object to be the value for the Expires Set-Cookie attribute. By default, no expiration is set, and most clients will consider this a "non-persistent cookie" and will delete it on a condition like exiting a web browser application.

note the cookie storage model specification states that if both expires and maxAge are set, then maxAge takes precedence, but it is possible not all clients by obey this, so if both are set, they should point to the same date and time.

**httpOnly: boolean**
Specifies the boolean value for the HttpOnly Set-Cookie attribute. When truthy, the HttpOnly attribute is set, otherwise it is not. By default, the HttpOnly attribute is not set.

note be careful when setting this to true, as compliant clients will not allow client-side JavaScript to see the cookie in document.cookie.

**maxAge: number**
Specifies the number (in seconds) to be the value for the Max-Age Set-Cookie attribute. The given number will be converted to an integer by rounding down. By default, no maximum age is set.

note the cookie storage model specification states that if both expires and maxAge are set, then maxAge takes precedence, but it is possible not all clients by obey this, so if both are set, they should point to the same date and time.

**path: string**

Specifies the value for the Path Set-Cookie attribute. By default, the path is considered the "default path".

**sameSite: boolean**

Specifies the boolean or string to be the value for the SameSite Set-Cookie attribute.

true will set the SameSite attribute to Strict for strict same site enforcement.
false will not set the SameSite attribute.
'lax' will set the SameSite attribute to Lax for lax same site enforcement.
'none' will set the SameSite attribute to None for an explicit cross-site cookie.
'strict' will set the SameSite attribute to Strict for strict same site enforcement.
More information about the different enforcement levels can be found in the specification.

note This is an attribute that has not yet been fully standardized, and may change in the future. This also means many clients may ignore this attribute until they understand it.

**secure: boolean**

Specifies the boolean value for the Secure Set-Cookie attribute. When truthy, the Secure attribute is set, otherwise it is not. By default, the Secure attribute is not set.

note be careful when setting this to true, as compliant clients will not send the cookie back to the server in the future if the browser does not have an HTTPS connection.

## Middleware

Express-flare has full support for express style middleware.

### Global middleware

**Note:** when you call ```router.use()``` you must call ```next()``` or return a response eg. ```res.send()``` or your routing will fail.

```js
router.use((req, res, next) => {
  console.log('middleware');

  next();
});

router.get('/', (req, res) => {
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
    return res.status(400).send('No user found!');
  }
    
  next();
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

### Error handling
Express-flare has a dedicated global error handler. 

**Note: You can only have one global error handler.**

The error handler will be called as soon as the error is thrown and won't go to the next middleware unless you call ```next()```.

```js
router.error((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).send('invalid token...');
  }

  next();
});

router.get('/', (req, res) => {
  res.json({ success: true });
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
    return req.json({ success: false });
  }

  res.json({ success: true });
});
```

Note: express-flare doesn't mind the ordering of wildcard routes, they will always run last. Wildcards with methods eg. ```router.get('*')``` will always run before ```router.all('*')```.

## Edge caching

One of the most awesome things about workers is the use of the cache API. 

https://developers.cloudflare.com/workers/runtime-apis/cache/

Express-flare handles caching for you, so you don't have to.

**Note: All cache times are defined in seconds.**

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
router.get('/test', (req, res) => {
  res.json({ worked: true });
}, 4000);
```

### Purging cache

You can invalidate the cache by deleting the URL from the cache store.

Example: 
```js
router.post('/test', (req, res) => {
  const url = `${req.origin}/test`;

  // this will invalidate the cache of router.get('/test')
  caches.default.delete(url);

  res.json({ worked: true });
});
```

### Custom cache key

Normally ```express-flare``` will use the full URL as a cache key. 

For some scenarios this may not be specific enough. For example you may want to cache different data for different accounts even though the endpoint is the same.

For convenience express-flare allows you pass a function to ```handleRequest``` to create a custom cache key.

The cache key must be a full URL. A good idea is to add # after the URL with some data.

Example: 
```js
// this route will have a cache key of ${req.origin}/cache#${userId}
router.get('/cache', (req, res) => {
  res.json({ success: true });
}, 4000);

router.post('/cache', (req, res) => {
  // we use the same pattern to invalidate the cache
  const url = `${req.origin}/cache#${req.userId}`;

  caches.default.delete(url);

  res.json({ success: true });
});

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest({
    event,
    router,
    cacheTime: 0,
    // we can add the userId to the end of the url
    // for a more specific cache key
    getCacheKey: (req) => `${req.url}#${req.userId}`,
  }));
});
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
router.get('/test', (req, res) => {
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
router.get('/test', (req, res) => {
  const { env, context } = req;

  if(!env.JWT) {
    return res.json({ allowed: false });
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

## Cloudflare workers limitations

Due to their nature workers are built on Promises, so ```express-flare``` is built entirely with promises.

This means that callback style code won't work. The recommend way to write apis with workers is to use async await.

Following are some examples.

This won't work:
```js
// the worker won't wait for the timeout to finish
router.get('/test', (req, res) => {
  setTimeout(() => {
    res.json({ success: true });
  }, 1000);
});
```

Use this instead:
```js
const delay = (time) => new Promise((resolve) => setTimeout(resolve, time));

router.get('/test', async (req, res) => {
  await delay(1000);

  res.json({ success: true });
});
```

If you are accustomed to using ```.then()``` that also won't work as that is basically using callbacks.

This won't work:
```js
router.get('/test', (req, res) => {
  fetch('http://example.com')
    .then(() => {
      res.json({ success: true });
    });
});
```

Use this instead:
```js
router.get('/test', async (req, res) => {
  await fetch('http://example.com');

  res.json({ success: true });
});
```

If you need a package to help convert functions into promises similar to ```util.promisify()``` in nodejs we recommend:

https://github.com/mikehall314/es6-promisify

## Contributing

There's obviously lots that can be added. Create a PR and send any features you wish to contribute :smiley:
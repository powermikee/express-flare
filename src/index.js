const { parse } = require('cookie');
const {
  getBody, getQueryParams, getRoute, getDefaultCacheKey,
} = require('./lib/utils');
const {
  res, getResponse, resetResponse, updateHeaders,
} = require('./lib/response');
const routerLib = require('./lib/router');

/**
 * @param { import('./index.d').HandleRequestType } props
 * @return Promise<Response>
 */
const handleRequest = async ({
  event,
  request,
  router,
  cacheTime: globalCacheTime = 0,
  parseCookie = true,
  context = null,
  env = null,
  getCacheKey,
}) => {
  const req = request || event.request;
  const eventObj = context || event;
  const { url, method } = req;
  const methodLower = method.toLowerCase();
  const { pathname, search, origin } = new URL(url);
  const { routes } = router;
  const middlewareArr = [...routes.middleware];
  const errorHandler = routes.error;
  const queryparams = getQueryParams(search);
  const cache = caches.default;
  const {
    pathMatch,
    callback,
    params,
    cacheTime: routeCacheTime,
    middleware,
  } = getRoute(routes, methodLower, pathname);
  const cacheTime = typeof routeCacheTime !== 'undefined' ? routeCacheTime : globalCacheTime;
  let cacheKey = new Request(req.url, req);

  if (middleware) {
    middlewareArr.push(middleware);
  }

  const mwCount = middlewareArr.length;
  let mwIndex = 0;

  req.origin = origin;
  req.query = queryparams;
  req.params = params;
  req.event = event;
  req.context = { ...context };
  req.env = env;

  if (methodLower === 'post' || methodLower === 'put') {
    req.bodyContent = await getBody(req);
  }

  if (parseCookie) {
    req.cookies = parse(req.headers.get('Cookie') || '');
  }

  resetResponse();

  updateHeaders({
    'cache-control': `max-age=${cacheTime}`,
  });

  let middlewareDone = false;

  /** @param {any} error */
  const setMiddleWareDone = async (error) => {
    if (error && errorHandler) {
      await errorHandler(error, req, res, setMiddleWareDone);

      return false;
    }

    middlewareDone = true;
  };

  /** @param {Error} [error] */
  const runMiddleware = async (error) => {
    const nextFn = mwIndex === mwCount - 1 ? setMiddleWareDone : await runMiddleware;

    if (error && errorHandler) {
      await errorHandler(error, req, res, nextFn);

      return false;
    }

    mwIndex += 1;

    await middlewareArr[mwIndex - 1](req, res, nextFn);

    return true;
  };

  if (pathMatch) {
    if (mwCount > 0) {
      await runMiddleware();
    }

    if (middlewareDone || mwCount === 0) {
      if (methodLower === 'get') {
        const cacheKeyFunc = getCacheKey || getDefaultCacheKey;
        const cacheUrl = new URL(cacheKeyFunc(req));

        cacheKey = new Request(cacheUrl.toString(), req);

        const cachedResponse = cacheKey && await cache.match(cacheKey);

        if (cacheTime > 0 && cachedResponse) {
          return cachedResponse;
        }
      }

      await callback(req, res, eventObj);
    }

    const response = getResponse();
    const finalResponse = response.redirect
      ? Response.redirect(response.redirect.url, response.redirect.statusCode)
      : new Response(response.data, response.headers);

    if (cacheTime > 0 && methodLower === 'get') {
      eventObj.waitUntil(cache.put(cacheKey, finalResponse.clone()));
    }

    return finalResponse;
  }

  return new Response('Route does not exist', {
    status: 404,
    headers: {
      'content-encoding': 'gzip',
    },
  });
};

module.exports = {
  handleRequest,
  router: routerLib,
};

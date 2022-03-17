/** @param { Request } request */
const getBody = async (request) => {
  const { headers } = request;
  const contentType = headers.get('content-type') || '';

  if (!contentType) {
    return null;
  }

  if (contentType.includes('application/json')) {
    const body = await request.json();

    return body;
  }

  if (contentType.includes('application/text')) {
    const body = await request.text();

    return body;
  }

  if (contentType.includes('text/html')) {
    const body = await request.text();

    return body;
  }

  if (contentType.includes('form')) {
    const formData = await request.formData();
    /** @type {{[key: string]: any}} */
    const body = {};

    Array.from(formData.entries()).forEach((entry) => {
      const [key, value] = entry;

      body[key] = value;
    });

    return JSON.stringify(body);
  }

  const myBlob = await request.blob();
  const objectURL = URL.createObjectURL(myBlob);

  return objectURL;
};

/**
 * @param {string} searchQuery
 * @returns Object
 */
const getQueryParams = (searchQuery) => {
  const urlParams = new URLSearchParams(searchQuery);
  const params = Object.fromEntries(urlParams);

  return params;
};

/**
 * @param {{[key: string]: any}} routesObj
 * @param {string} pathname
 * @returns
 */
const checkRoute = (routesObj, pathname) => {
  const routes = Object.keys(routesObj);
  const pathArr = pathname.replace(/\/$/, '').split('/');
  /** @type {{[key: string]: any}} */
  const params = {};
  /** @type {any} */
  let matchingPath = null;

  routes.forEach((route) => {
    const routeArr = route.replace(/\/$/, '').split('/');

    if (route === pathname) {
      const { callback, cacheTime, middleware } = routesObj[pathname];

      matchingPath = {
        pathMatch: true,
        callback,
        params,
        middleware,
        cacheTime,
      };
    } else if (!matchingPath && route.indexOf('/:') > -1 && routeArr.length === pathArr.length) {
      for (let i = 0; i < routeArr.length; i += 1) {
        const routePart = routeArr[i];
        const pathPart = pathArr[i];

        if (routePart !== pathPart && !routePart.startsWith(':')) {
          break;
        }

        if (routePart.startsWith(':')) {
          const paramName = routePart.substring(1);

          params[paramName] = pathPart;
        }

        if (i === (routeArr.length - 1)) {
          const { callback, cacheTime, middleware } = routesObj[route];

          matchingPath = {
            pathMatch: true,
            callback,
            params,
            cacheTime,
            middleware,
          };
        }
      }
    }
  });

  if (matchingPath) {
    return matchingPath;
  }

  if (!matchingPath && typeof routesObj['*'] !== 'undefined') {
    const { callback, cacheTime, middleware } = routesObj['*'];

    return {
      pathMatch: true,
      callback,
      params,
      cacheTime,
      middleware,
    };
  }

  return {
    pathMatch: false,
    callback: null,
    params,
    cacheTime: 0,
    middleware: null,
  };
};

/**
 * @param {{[key: string]: any}} routes
 * @param {string} method
 * @param {string} pathname
 * @returns
 */
const getRoute = (routes, method, pathname) => {
  // handle head requests
  const realMethod = method === 'head' ? 'get' : method;

  let route = checkRoute(routes[realMethod], pathname);

  if (!route.pathMatch && Object.keys(routes.all).length) {
    route = checkRoute(routes.all, pathname);
  }

  return route;
};

/**
 * @param { import('../index.d').RequestType } req
 * @return string
 */
const getDefaultCacheKey = (req) => req.url;

module.exports = {
  getDefaultCacheKey,
  getQueryParams,
  getBody,
  checkRoute,
  getRoute,
};

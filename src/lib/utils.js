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
      const isArray = key.indexOf('[]') > -1;
      const cleanKey = isArray ? key.replace('[]', '') : key;
      const hasKey = Object.prototype.hasOwnProperty.call(body, cleanKey);

      if (!isArray && hasKey) {
        const savedValue = body[cleanKey];

        if (!Array.isArray(body[cleanKey])) {
          body[cleanKey] = [savedValue];
        }

        body[cleanKey].push(value);
      } else if (isArray) {
        if (!hasKey) {
          body[cleanKey] = [];
        }

        body[cleanKey].push(value);
      } else {
        body[cleanKey] = value;
      }
    });

    return body;
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
      const { callback, routeConfig, middleware } = routesObj[pathname];

      matchingPath = {
        pathMatch: true,
        callback,
        params,
        middleware,
        routeConfig,
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
          const { callback, routeConfig, middleware } = routesObj[route];

          matchingPath = {
            pathMatch: true,
            callback,
            params,
            routeConfig,
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
    const { callback, routeConfig, middleware } = routesObj['*'];

    return {
      pathMatch: true,
      callback,
      params,
      routeConfig,
      middleware,
    };
  }

  return {
    pathMatch: false,
    callback: null,
    params,
    routeConfig: null,
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

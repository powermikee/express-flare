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
const getRoute = (routesObj, pathname) => {
  const routes = Object.keys(routesObj);
  const pathArr = pathname.replace(/\/$/, '').split('/');
  /** @type {{[key: string]: any}} */
  const params = {};
  /** @type {any} */
  let matchingPath = null;

  // exact route
  if (routes.includes(pathname)) {
    const { callback, cacheTime, middleware } = routesObj[pathname];

    return {
      pathMatch: true,
      callback,
      params,
      middleware,
      cacheTime,
    };
  }

  routes.forEach((route) => {
    const routeArr = route.replace(/\/$/, '').split('/');

    // filter out any exact paths and paths with the wrong length
    if (!matchingPath && route.indexOf('/:') > -1 && routeArr.length === pathArr.length) {
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
  return {
    pathMatch: false,
    callback: null,
    params,
    cacheTime: 0,
    middleware: null,
  };
};

module.exports = {
  getQueryParams,
  getBody,
  getRoute,
};
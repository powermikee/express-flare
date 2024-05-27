/** @typedef {import('../index.d').CallbackType} CallbackType */

/** @type { import('../index.d').RoutesType } */
const routes = {
  middleware: [],
  error: null,
  get: {},
  post: {},
  put: {},
  delete: {},
  patch: {},
  all: {},
};

/** @param { CallbackType } callback */
const use = (callback) => {
  if (callback) {
    routes.middleware.push(callback);
  }
};

/** @param { import('../index.d').ErrorCallbackType } callback */
const error = (callback) => {
  routes.error = callback;
};

/** @param {string} path */
const getCleanPath = (path) => {
  if (path === '/*') {
    return '*';
  }

  if (path !== '*' && !path.startsWith('/')) {
    return `/${path}`;
  }

  return path;
};

/** @param {string} method */
const methodBuilder = (method) => {
  /**
   * @param { string } path
   * @param { CallbackType } arg1
   * @param { CallbackType } [arg2]
   * @param { number } [arg3]
  */
  return (path, arg1, arg2, arg3) => {
    const cleanPath = getCleanPath(path);
    const middleware = typeof arg2 === 'function' ? arg1 : null;
    const callback = typeof arg2 === 'function' ? arg2 : arg1;
    const cacheTime = typeof arg2 === 'function' ? arg3 : arg2;

    routes[method][cleanPath] = {
      callback,
      middleware,
      cacheTime,
    };
  };
};

/** @type { import('../index.d').RouterFunctionType } */
const router = () => {
  routes.middleware = [];

  return {
    routes,
    use,
    error,
    get: methodBuilder('get'),
    post: methodBuilder('post'),
    put: methodBuilder('put'),
    delete: methodBuilder('delete'),
    patch: methodBuilder('patch'),
    all: methodBuilder('all'),
  };
};

module.exports = router;

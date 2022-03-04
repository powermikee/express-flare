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

/** @param {string} method */
const methodBuilder = (method) => {
  /**
   * @param { string } path
   * @param { CallbackType } arg1
   * @param { CallbackType } [arg2]
   * @param { number } [arg3]
  */
  return (path, arg1, arg2, arg3) => {
    const middleware = typeof arg2 === 'function' ? arg1 : null;
    const callback = typeof arg2 === 'function' ? arg2 : arg1;
    const cacheTime = typeof arg2 === 'function' ? arg3 : arg2;

    routes[method][path] = {
      callback,
      middleware,
      cacheTime,
    };
  };
};

/** @type { import('../index.d').RouterType } */
const router = {
  routes,
  use,
  error,
  get: methodBuilder('get'),
  post: methodBuilder('post'),
  put: methodBuilder('put'),
  delete: methodBuilder('delete'),
  patch: methodBuilder('patch'),
};

module.exports = router;

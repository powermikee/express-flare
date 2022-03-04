/** @typedef { import('../index.d').ResponseMethodType } ResponseMethodType */
/** @typedef { import('../index.d').ResponseType } ResponseType */

/** @type {ResponseType} */
let response = {
  data: 'Route does not exist',
  headers: {
    status: 200,
    headers: {
      'content-encoding': 'gzip',
    },
  },
};

/** @param {number} status */
const updateStatus = (status) => {
  response.headers.status = status;
};

/** @param {object} headers */
const updateHeaders = (headers) => {
  response.headers.headers = {
    ...response.headers.headers,
    ...headers,
  };
};

/** @type { ResponseMethodType } */
const res = {
  status(statusCode) {
    updateStatus(statusCode);

    return this;
  },
  json(data) {
    updateHeaders({
      'content-type': 'application/json',
    });

    response.data = JSON.stringify(data);

    return this;
  },
  send(data) {
    response.data = data;

    return this;
  },
  /** @param {any} data */
  end(data) {
    if (data) {
      response.data = data;
    }

    return this;
  },
  setHeader(header, value) {
    updateHeaders({
      [header]: value,
    });

    return this;
  },
  getHeader(header) {
    return response.headers[header];
  },
  removeHeader(header) {
    delete response.headers[header];

    return this;
  },
  setCookie(name, value) {
    updateHeaders({
      'Set-Cookie': `${name}=${value}`,
    });

    return this;
  },
};

const resetResponse = () => {
  response = {
    data: 'Route does not exist',
    headers: {
      status: 200,
      headers: {
        'content-encoding': 'gzip',
      },
    },
  };

  return response;
};

const getResponse = () => response;

module.exports = {
  getResponse,
  resetResponse,
  res,
  updateHeaders,
  updateStatus,
};

/* eslint-disable */
const axios = require('axios');

test('should return text response', async () => {
  const response = await axios.get('http://localhost:8787');
  const { data, status, headers: { 'cache-control': cacheControl, 'content-type': contentType } } = response;

  expect(data).toBe('Works!');
  expect(status).toBe(200);
  expect(cacheControl).toBe('max-age=0');
  expect(contentType).toBe('text/plain;charset=UTF-8');
});

test('should return json response', async () => {
  const response = await axios.get('http://localhost:8787/json');
  const { data, status, headers: { 'cache-control': cacheControl, 'content-type': contentType } } = response;

  expect(data).toStrictEqual({ worked: true });
  expect(status).toBe(200);
  expect(cacheControl).toBe('max-age=0');
  expect(contentType).toBe('application/json');
});

test('should call .end()', async () => {
  const response = await axios.get('http://localhost:8787/end');
  const { data, status, headers: { 'cache-control': cacheControl, 'content-type': contentType } } = response;

  expect(data).toBe('Done!');
  expect(status).toBe(200);
  expect(cacheControl).toBe('max-age=0');
  expect(contentType).toBe('text/plain;charset=UTF-8');
});

test('should work with nested route', async () => {
  const response = await axios.get('http://localhost:8787/test/another/5');
  const { data, status, headers: { 'cache-control': cacheControl, 'content-type': contentType } } = response;

  expect(data).toStrictEqual({ nested: 'worked' });
  expect(status).toBe(200);
  expect(cacheControl).toBe('max-age=0');
  expect(contentType).toBe('application/json');
});

test('should work with url params', async () => {
  const response = await axios.get('http://localhost:8787/test/123/mike');
  const { data, status, headers: { 'cache-control': cacheControl, 'content-type': contentType } } = response;

  expect(data).toStrictEqual({ id: '123', name: 'mike' });
  expect(status).toBe(200);
  expect(cacheControl).toBe('max-age=0');
  expect(contentType).toBe('application/json');
});

test('should go to exact path before param path', async () => {
  const response = await axios.get('http://localhost:8787/test/another/2');
  const { data, status, headers: { 'cache-control': cacheControl, 'content-type': contentType } } = response;

  expect(data).toStrictEqual({ exact: true });
  expect(status).toBe(200);
  expect(cacheControl).toBe('max-age=0');
  expect(contentType).toBe('application/json');
});

test('should work with query params', async () => {
  const response = await axios.get('http://localhost:8787/test?name=mike&id=1');
  const { data, status, headers: { 'cache-control': cacheControl, 'content-type': contentType } } = response;

  expect(data).toStrictEqual({ id: '1', name: 'mike' });
  expect(status).toBe(200);
  expect(cacheControl).toBe('max-age=0');
  expect(contentType).toBe('application/json');
});

test('should call middleware', async () => {
  const response = await axios.get('http://localhost:8787/middleware');
  const { data, status, headers: { 'cache-control': cacheControl, 'content-type': contentType } } = response;

  expect(data).toStrictEqual({ middleware1: true });
  expect(status).toBe(200);
  expect(cacheControl).toBe('max-age=0');
  expect(contentType).toBe('application/json');
});

test('should call middleware in order', async () => {
  const response = await axios.get('http://localhost:8787/middleware-time');
  const { data, status, headers: { 'cache-control': cacheControl, 'content-type': contentType } } = response;

  expect(data).toStrictEqual({
    middlewares: ['mw1', 'mw2', 'mw3']
  });
  expect(status).toBe(200);
  expect(cacheControl).toBe('max-age=0');
  expect(contentType).toBe('application/json');
});

test('should have correct cache time', async () => {
  const response = await axios.get('http://localhost:8787/cache');
  const { data, status, headers: { 'cache-control': cacheControl, 'content-type': contentType } } = response;

  expect(data).toStrictEqual({ success: true });
  expect(status).toBe(200);
  expect(cacheControl).toBe('max-age=4000');
  expect(contentType).toBe('application/json');
});

test('should return cache hit', async () => {
  const response = await axios.get('http://localhost:8787/cache');
  const { data, status, headers: { 
    'cache-control': cacheControl, 
    'content-type': contentType,
    'cf-cache-status': cacheStatus,
  }} = response;

  expect(data).toStrictEqual({ success: true });
  expect(status).toBe(200);
  expect(cacheControl).toBe('max-age=4000');
  expect(cacheStatus).toBe('HIT');
  expect(contentType).toBe('application/json');
});

test('should call error handler', async () => {
  try {
    const response = await axios.get('http://localhost:8787/error');
  } catch (error) {
    const { 
      data, 
      status, 
      headers: { 
        'cache-control': cacheControl, 
        'content-type': contentType,
      }
    } = error.response;

    expect(data).toStrictEqual({ success: false });
    expect(status).toBe(400);
    expect(cacheControl).toBe('max-age=0');
    expect(contentType).toBe('application/json');
  }
});

test('should have POST body', async () => {
  const response = await axios.post('http://localhost:8787/post', { name: 'Mike'});
  const { data, status, headers: { 
    'cache-control': cacheControl, 
    'content-type': contentType,
  }} = response;

  expect(data).toStrictEqual({ body: { name: 'Mike' }});
  expect(status).toBe(200);
  expect(cacheControl).toBe('max-age=0');
  expect(contentType).toBe('application/json');
});

test('should have pass body to PUT', async () => {
  const response = await axios.put('http://localhost:8787/put', { name: 'Mike'});
  const { data, status, headers: { 
    'cache-control': cacheControl, 
    'content-type': contentType,
  }} = response;

  expect(data).toStrictEqual({ body: { name: 'Mike' }});
  expect(status).toBe(200);
  expect(cacheControl).toBe('max-age=0');
  expect(contentType).toBe('application/json');
});

test('should run DELETE method', async () => {
  const response = await axios.delete('http://localhost:8787/delete');
  const { data, status, headers: { 
    'cache-control': cacheControl, 
    'content-type': contentType,
  }} = response;

  expect(data).toStrictEqual({ success: true });
  expect(status).toBe(200);
  expect(cacheControl).toBe('max-age=0');
  expect(contentType).toBe('application/json');
});

test('should run PATCH method', async () => {
  const response = await axios.patch('http://localhost:8787/patch');
  const { data, status, headers: { 
    'cache-control': cacheControl, 
    'content-type': contentType,
  }} = response;

  expect(data).toStrictEqual({ success: true });
  expect(status).toBe(200);
  expect(cacheControl).toBe('max-age=0');
  expect(contentType).toBe('application/json');
});

test('should get cookies', async () => {
  const response = await axios.get('http://localhost:8787/get-cookies', { 
    headers: { Cookie: "cookie1=value1; cookie2=value2" }
  });
  const { data, status, headers: { 
    'cache-control': cacheControl, 
    'content-type': contentType,
  }} = response;

  expect(data).toStrictEqual({ cookie1: 'value1', cookie2: 'value2' });
  expect(status).toBe(200);
  expect(cacheControl).toBe('max-age=0');
  expect(contentType).toBe('application/json');
});

test('should set cookies', async () => {
  const response = await axios.get('http://localhost:8787/set-cookies');
  const { data, status, headers: { 
    'cache-control': cacheControl, 
    'content-type': contentType,
    'set-cookie': cookie,
  }} = response;

  expect(data).toStrictEqual({ success: true });
  expect(status).toBe(200);
  expect(cacheControl).toBe('max-age=0');
  expect(cookie).toMatchObject(['id=1234']);
  expect(contentType).toBe('application/json');
});

test('should call wildcard route with GET', async () => {
  const response = await axios.get('http://localhost:8787/random');
  const { data, status, headers: { 
    'cache-control': cacheControl, 
    'content-type': contentType,
  }} = response;

  expect(data).toStrictEqual({ wildcardGet: true });
  expect(status).toBe(200);
  expect(cacheControl).toBe('max-age=0');
  expect(contentType).toBe('application/json');
});

test('should call catch all wildcard route', async () => {
  const response = await axios.post('http://localhost:8787/random');
  const { data, status, headers: { 
    'cache-control': cacheControl, 
    'content-type': contentType,
  }} = response;

  expect(data).toStrictEqual({ wildcardAll: true });
  expect(status).toBe(200);
  expect(cacheControl).toBe('max-age=0');
  expect(contentType).toBe('application/json');
});

test('should be caught by wildcard route', async () => {
  const response = await axios.put('http://localhost:8787/random');
  const { data, status, headers: { 
    'cache-control': cacheControl, 
    'content-type': contentType,
  }} = response;

  expect(data).toStrictEqual({ notWildcard: true });
  expect(status).toBe(200);
  expect(cacheControl).toBe('max-age=0');
  expect(contentType).toBe('application/json');
});

test('should work with chained methods', async () => {
  const response = await axios.get('http://localhost:8787/chained');
  const { data, status, headers: { 
    'cache-control': cacheControl, 
    'content-type': contentType,
    'access-control-request-method': requestMethod,
    'x-header': xHeader,
  }} = response;

  expect(data).toStrictEqual({ success: true });
  expect(status).toBe(200);
  expect(cacheControl).toBe('max-age=0');
  expect(requestMethod).toBe('GET');
  expect(xHeader).toBe('customHeader');
  expect(contentType).toBe('application/json');
});

test('should redirect', async () => {
  const response = await axios.get('http://localhost:8787/redirect');
  const { data, status, headers: { 
    'cache-control': cacheControl, 
    'content-type': contentType,
  }} = response;
  const responseUrl = response.request.res.responseUrl;

  expect(data).toBe('Done!');
  expect(status).toBe(200);
  expect(responseUrl).toBe('http://localhost:8787/end');
  expect(cacheControl).toBe('max-age=0');
  expect(contentType).toBe('text/plain;charset=UTF-8');
});

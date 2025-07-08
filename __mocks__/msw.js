// Mock implementation of msw
module.exports = {
  rest: {
    get: (path, handler) => ({ path, method: 'GET', handler }),
    post: (path, handler) => ({ path, method: 'POST', handler }),
    put: (path, handler) => ({ path, method: 'PUT', handler }),
    delete: (path, handler) => ({ path, method: 'DELETE', handler }),
  },
}; 
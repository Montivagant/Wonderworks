// Mock implementation of msw/node
module.exports = {
  setupServer: (...handlers) => ({
    listen: jest.fn(),
    close: jest.fn(),
    resetHandlers: jest.fn(),
    use: jest.fn(),
  }),
}; 
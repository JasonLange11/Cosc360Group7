import '@testing-library/jest-dom';

// jsdom does not implement URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

// Reset mocks between tests
afterEach(() => {
  vi.clearAllMocks();
});

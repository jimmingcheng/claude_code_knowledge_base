/**
 * Test setup file for Jest tests
 * This file runs before all tests to configure the testing environment
 */

// Set up test environment variables
process.env.NODE_ENV = 'test';

// Configure console methods for cleaner test output
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

// Filter out expected warnings during tests
console.warn = (...args: any[]) => {
  // Filter out file loading warnings that are expected during tests
  const message = args.join(' ');
  if (message.includes('Could not load') && message.includes('test')) {
    return; // Suppress expected test warnings
  }
  originalConsoleWarn.apply(console, args);
};

console.error = (...args: any[]) => {
  // You can add filters for expected errors here if needed
  originalConsoleError.apply(console, args);
};

// Global test helpers
declare global {
  namespace jest {
    interface Matchers<R> {
      // Add custom matchers here if needed in the future
    }
  }
}

// Clean up after tests complete
afterAll(() => {
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
});

export {};
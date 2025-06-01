/**
 * Helper functions to conditionally skip tests in CI environment
 */

/**
 * Determines if the current environment is CI
 * @returns true if running in CI environment
 */
export const isCI = (): boolean => {
  return process.env.CI === 'true';
};

/**
 * Skip a test or test suite in CI environment
 * @param name The name of the test or test suite
 * @param fn The test function
 */
export const skipInCI = (name: string, fn: () => void): void => {
  if (isCI()) {
    test.skip(name, fn);
  } else {
    test(name, fn);
  }
};

/**
 * Skip a describe block in CI environment
 * @param name The name of the describe block
 * @param fn The describe function
 */
export const describeSkipInCI = (name: string, fn: () => void): void => {
  if (isCI()) {
    describe.skip(name, fn);
  } else {
    describe(name, fn);
  }
};

/**
 * Only run a test in CI environment
 * @param name The name of the test
 * @param fn The test function
 */
export const onlyInCI = (name: string, fn: () => void): void => {
  if (isCI()) {
    test(name, fn);
  } else {
    test.skip(name, fn);
  }
};

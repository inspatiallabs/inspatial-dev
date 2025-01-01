import type { Promisable, OptionProp, Runner, TestProps } from "./shared.ts";

/**
 * A no-operation test runner that implements the Runner interface but performs no actual testing.
 * Useful for testing environments where test execution needs to be disabled.
 *
 * @type {Runner}
 */
export const noop: Runner = Object.assign(
  /**
   * Main test function that performs no operation
   * @param {string | TestProps} _nameOrConfig - Test name or configuration object
   * @param {(() => Promisable<void>)} [_fnOrUndefined] - Test function to be executed
   * @param {OptionProp} [_options] - Additional test options
   * @returns {Promise<void>}
   */
  async function (
    _nameOrConfig: string | TestProps,
    _fnOrUndefined?: () => Promisable<void>,
    _options?: OptionProp
  ): Promise<void> {
    // No operation
  },
  {
    /**
     * No-op implementation of test.only()
     * @param {string | TestProps} _nameOrConfig - Test name or configuration object
     * @param {(() => Promisable<void>)} [_fnOrUndefined] - Test function to be executed
     * @param {OptionProp} [_options] - Additional test options
     * @returns {Promise<void>}
     */
    only: async function (
      _nameOrConfig: string | TestProps,
      _fnOrUndefined?: () => Promisable<void>,
      _options?: OptionProp
    ): Promise<void> {
      // No operation
    },

    /**
     * No-op implementation of test.skip()
     * @param {string | TestProps} _nameOrConfig - Test name or configuration object
     * @param {(() => Promisable<void>)} [_fnOrUndefined] - Test function to be executed
     * @param {OptionProp} [_options] - Additional test options
     * @returns {Promise<void>}
     */
    skip: async function (
      _nameOrConfig: string | TestProps,
      _fnOrUndefined?: () => Promisable<void>,
      _options?: OptionProp
    ): Promise<void> {
      // No operation
    },

    /**
     * No-op implementation of test.todo()
     * @param {string | TestProps} _nameOrConfig - Test name or configuration object
     * @param {(() => Promisable<void>)} [_fnOrUndefined] - Test function to be executed
     * @param {OptionProp} [_options] - Additional test options
     * @returns {Promise<void>}
     */
    todo: async function (
      _nameOrConfig: string | TestProps,
      _fnOrUndefined?: () => Promisable<void>,
      _options?: OptionProp
    ): Promise<void> {
      // No operation
    },
  }
);

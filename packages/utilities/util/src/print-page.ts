/*##############################################(PRINT-PAGE-UTIL)##############################################*/

/**
 * Triggers the browser's native print dialog for the current page.
 *
 * @example
 * // Basic usage
 * import { printPage } from '@inspatial/util';
 *
 * // Print the current page
 * printPage();
 *
 * @example
 * // Usage with a button click event
 * import { printPage } from '@inspatial/util';
 *
 * function PrintButton() {
 *   return (
 *     <Button onPointerUp={printPage}>
 *       Print Page
 *     </Button>
 *   );
 * }
 *
 * @example
 * // Usage with custom print styles
 * import { printPage } from '@inspatial/util';
 *
 * // Add print-specific styles in your CSS
 * // @media print {
 * //   .no-print {
 * //     display: none;
 * //   }
 * //   .print-only {
 * //     display: block;
 * //   }
 * // }
 *
 * printPage();
 */
export function printPage() {
  if (typeof globalThis.print !== "function") {
    throw new Error(
      "Print functionality is only available in browser environments"
    );
  }
  globalThis.print();
}

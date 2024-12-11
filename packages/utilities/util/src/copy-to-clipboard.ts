/*##############################################(COPY-TO-CLIPBOARD-UTIL)##############################################*/

/**
 * Copies a URL to the clipboard and executes an optional callback
 * @param url The URL to copy
 * @param onCopy Optional callback function to execute after copying
 * @example
 *  // Usage
 * copyToClipboard('/url')
 *
 * // With alert
 * copyToClipboard('/url', () => alert("Copied!"))
 *
 */
export function copyToClipboard(url: string, onCopy?: () => void) {
  globalThis.navigator.clipboard
    .writeText(`${globalThis.location.origin}${url}`)
    .then(() => {
      if (onCopy) onCopy();
    })
    .catch((error) => {
      console.error("Failed to copy to clipboard:", error);
    });
}

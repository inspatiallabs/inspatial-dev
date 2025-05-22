/*##############################################(COPY-TO-CLIPBOARD-UTIL)##############################################*/

/**
 * Copies a URL to the clipboard and executes an optional callback
 * @param {string} url - The URL to copy (can be absolute or relative)
 * @param {() => void} [onCopy] - Optional callback function to execute after successful copy
 * @param {() => void} [onError] - Optional callback function to execute if copy fails
 * @returns {Promise<void>}
 * 
 * @example
 * // Copy relative URL
 * await copyToClipboard('/dashboard')
 *
 * // Copy absolute URL
 * await copyToClipboard('https://xr.new/path')
 * 
 * // With success callback
 * await copyToClipboard('/url', () => alert('Copied!'))
 * 
 * // With error handling
 * await copyToClipboard('/url', 
 *   () => alert('Copied!'),
 *   (error) => alert('Failed to copy')
 * )
 */

export async function copyToClipboard(
  url: string,
  onCopy?: () => void,
  onError?: (error: Error) => void
): Promise<void> {
  try {
    /** Determine if URL is absolute or needs origin prepended */
    const fullUrl = url.startsWith('http') ? url : `${globalThis.location.origin}${url}`;
    
    await globalThis.navigator.clipboard.writeText(fullUrl);
    if (onCopy) onCopy();
  } catch (error) {
    /** Handle error with callback or log */
    if (onError) onError(error as Error);
    console.error("Failed to copy to clipboard:", error);
  }
}

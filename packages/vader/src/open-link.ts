/*##############################################(OPEN-LINK-UTIL)##############################################*/

/**
 * Opens a URL in a new browser tab/window, prepending the current origin
 *
 * @param url - The URL path to open (will be appended to current origin)
 * @example
 * // If current origin is https://inspatial.app
 * openLink('/dashboard')
 * // Opens https://inspatial.app/dashboard in new tab
 *
 * @example
 * // Opening a deep link
 * openLink('/project/123/editor')
 * // Opens https://inspatial.app/project/123/editor in new tab
 */
export function openLink(url: string) {
  globalThis.open(`${globalThis.location.origin}${url}`, "_blank");
}

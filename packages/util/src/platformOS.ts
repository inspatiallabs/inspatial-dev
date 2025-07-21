// /*##############################################(PLATFORM-OS)##############################################*/
// /**
//  * Detects the operating system of the user's device based on the user agent string.
//  *
//  * @returns {string} The detected operating system name or "Unknown" if not detected
//  *
//  * @example
//  * // Running on Windows
//  * platformOS() // Returns "Windows"
//  *
//  * @example
//  * // Running on MacOS
//  * platformOS() // Returns "MacOS"
//  *
//  * @example
//  * // Running on iOS device
//  * platformOS() // Returns "iOS"
//  *
//  * @example
//  * // Running on visionOS device
//  * platformOS() // Returns "visionOS"
//  *
//  * @example
//  * // Running on horizonOS device
//  * platformOS() // Returns "horizonOS"
//  *
//  * @example
//  * // Running on unsupported platform
//  * platformOS() // Returns "Unknown"
//  */
// export const platformOS = () => {
//   const userAgent = globalThis.navigator.userAgent.toLowerCase();
//   const osMap: Record<string, string> = {
//     win: "Windows",
//     mac: "MacOS",
//     linux: "Linux",
//     android: "Android",
//     ios: "iOS",
//     visionos: "visionOS",
//     horizonos: "horizonOS",
//   };

//   return (
//     Object.entries(osMap).find(([key]) => userAgent.includes(key))?.[1] ||
//     "Unknown"
//   );
// };

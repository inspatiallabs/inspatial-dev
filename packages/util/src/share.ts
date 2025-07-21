/*##############################################(IMPORTS)##############################################*/

// import { platformOS } from "./platformOS.ts";

/*##############################################(SHARE)##############################################*/

/********************************(SHARE-PROPS)*********************************/
/**
 * Interface for sharing content across platforms
 * @interface ShareProps
 * @property {string[]} [files] - Array of file paths to share
 * @property {string} [title] - Title of the shared content
 * @property {string} [text] - Description text for the shared content
 * @property {string} url - URL to be shared
 */
export interface ShareProps {
  files?: string[];
  title?: string;
  text?: string;
  url: string;
}

/********************************(DOM-SHARE)*********************************/
/**
 * Shares content using the Web Share API
 * @param {ShareProps} props - Share properties
 * @returns {Promise<boolean>} - Returns true if sharing was successful
 * @throws {Error} If Web Share API is not supported or sharing fails
 * @example
 * ```typescript
 * // Share a URL with title and text
 * await domShare({
 *   url: 'https://inspatial.dev',
 *   title: 'Check out InSpatial',
 *   text: 'Experience spatial computing on the web'
 * });
 *
 * // Share files along with a URL
 * await domShare({
 *   url: 'https://inspatial.dev',
 *   files: ['image.png', 'document.pdf']
 * });
 * ```
 */
export async function domShare(props: ShareProps): Promise<boolean> {
  if (!navigator.share) {
    throw new Error("Web Share API not supported");
  }

  const fileObjects = props.files?.map((file) => new File([file], file));
  const shareData: ShareData = {
    url: props.url,
    files: fileObjects,
    text: props.text,
    title: props.title,
  };

  try {
    if (fileObjects?.length && !navigator.canShare?.({ files: fileObjects })) {
      throw new Error("File sharing not supported");
    }
    await navigator.share(shareData);
    return true;
  } catch (error) {
    console.error("Share failed:", error);
    throw error;
  }
}

/********************************(NATIVE-SHARE)*********************************/

/**
 * Shares content using native platform sharing capabilities
 * @param {ShareProps} props - Share properties
 * @returns {Promise<boolean>} - Returns true if sharing was successful
 * @throws {Error} If native sharing is not implemented for the platform
 * @example
 * ```typescript
 * // Share content on iOS/Android
 * nativeShare({
 *   url: 'https://inspatial.dev',
 *   title: 'InSpatial Native',
 *   text: 'Experience spatial computing on mobile'
 * });
 * ```
 */

// deno-lint-ignore no-unused-vars
export function nativeShare(props: ShareProps) {
  //   // Platform-specific implementations
  //   if (platformOS() === "iOS") {
  //     // iOS native share implementation
  //   } else if (platformOS() === "Android") {
  //     // Android native share implementation
  //   }
  throw new Error("Native sharing not implemented for this platform");
}

/********************************(UNIVERSAL-SHARE-(OPTINIONATED))*********************************/

// /**
//  * Universal share function that determines the appropriate sharing method based on platform
//  * @param {ShareProps} props - Share properties
//  * @returns {Promise<boolean>} - Returns true if sharing was successful
//  * @example
//  * ```typescript
//  * // Universal sharing that works across platforms
//  * try {
//  *   await share({
//  *     url: 'https://inspatial.dev',
//  *     title: 'InSpatial',
//  *     text: 'Build the future of cross-platform and spatial computing',
//  *     files: ['preview.png']
//  *   });
//  * } catch (error) {
//  *   console.error('Sharing failed:', error);
//  * }
//  * ```
//  */
// export async function share(props: ShareProps) {
//   const os = platformOS();
//   try {
//     if (os === "iOS" || os === "Android") {
//       return await nativeShare(props);
//     }
//     return await domShare(props);
//   } catch (error) {
//     console.error("Share failed:", error);
//     // Fallback to custom share implementation
//     return false;
//   }
// }

/********************************(SHARE-METHOD)*********************************/
export const ShareMethod = {
  DOM: "dom",
  NATIVE: "native",
  CUSTOM: "custom",
} as const;

export type ShareMethodType = (typeof ShareMethod)[keyof typeof ShareMethod];

export interface ShareOptions extends ShareProps {
  method?: ShareMethodType;
  onShare?: (props: ShareProps) => Promise<boolean>;
}

/********************************(UNIVERSAL-SHARE)*********************************/
/**
 * Universal share function that allows user to specify sharing method
 * @param {ShareOptions} options - Share options including method preference
 * @returns {Promise<boolean>} - Returns true if sharing was successful
 * @example
 * ```typescript
 * // Use DOM sharing
 * await share({
 *   url: 'https://inspatial.dev',
 *   method: ShareMethod.DOM
 * });
 *
 * // Use custom sharing implementation
 * await share({
 *   url: 'https://inspatial.dev',
 *   method: ShareMethod.CUSTOM,
 *   onShare: async (props) => {
 *     // Custom share logic
 *     return true;
 *   }
 * });
 * ```
 */
export async function share(options: ShareOptions): Promise<boolean> {
  const { method = ShareMethod.DOM, onShare, ...shareProps } = options;

  try {
    switch (method) {
      case ShareMethod.DOM:
        return await domShare(shareProps);
      // case ShareMethod.NATIVE:
      //   return await nativeShare(shareProps);
      case ShareMethod.CUSTOM:
        if (!onShare) {
          throw new Error("Custom share handler not provided");
        }
        return await onShare(shareProps);
      default:
        throw new Error(`Unsupported share method: ${method}`);
    }
  } catch (error) {
    console.error("Share failed:", error);
    return false;
  }
}

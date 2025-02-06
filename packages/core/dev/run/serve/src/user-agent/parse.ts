import { UserAgent } from "./main.ts";

export interface ParsedUserAgentProp {
  platformOS: {
    name: string;
    version?: string;
    family?:
      | "Windows"
      | "macOS"
      | "Linux"
      | "iOS"
      | "Android"
      | "AndroidXR"
      | "HorizonOS"
      | "visionOS"
      | "Unknown";
  };
  browser: {
    name: string;
    version?: string;
    major?: string;
    isHeadless?: boolean;
    isMobile?: boolean;
  };
  device: {
    type:
      | "mobile"
      | "tablet"
      | "desktop"
      | "console"
      | "smarttv"
      | "wearable"
      | "embedded"
      | "headMounted";
    vendor?: string;
    model?: string;
    isBot?: boolean;
  };
  engine?: {
    name?: string;
    version?: string;
  };
  cpu?: {
    architecture?: string;
  };
}

/**
 * # ParseUserAgent
 * #### Analyzes and extracts detailed information from a browser's user agent string
 *
 * The `parseUserAgent` function works like a detective that examines a browser's ID card (the user agent string)
 * and tells you everything about the visitor's device, browser, and operating system.
 *
 * @since 0.0.3
 * @category InSpatial Run
 * @module UserAgent
 * @kind function
 * @access public
 *
 * ### 💡 Core Concepts
 * - Takes a user agent string and breaks it down into structured information
 * - Handles missing or invalid user agent strings gracefully
 * - Provides detailed device, browser, and OS information
 *
 * ### 📚 Terminology
 * > **User Agent**: A text string that web browsers send to websites to identify themselves
 * > **OS Family**: The main category of operating system (Windows, macOS, Linux, etc.)
 * > **Headless Browser**: A browser without a graphical interface, typically used for automation
 *
 * ### 📝 Type Definitions
 * ```typescript
 * interface ParsedUserAgentProp {
 *   platformOS: {
 *     name: string;              // Name of the operating system
 *     version?: string;          // OS version if available
 *     family?: "Windows" | "macOS" | "Linux" | "iOS" | "Android" | "AndroidXR" |
 *              "HorizonOS" | "visionOS" | "Unknown";
 *   };
 *   browser: {
 *     name: string;             // Browser name
 *     version?: string;         // Full browser version
 *     major?: string;          // Major version number
 *     isHeadless?: boolean;    // If it's a headless browser
 *     isMobile?: boolean;      // If it's a mobile browser
 *   };
 *   device: {
 *     type: "mobile" | "tablet" | "desktop" | "console" | "smarttv" |
 *           "wearable" | "embedded" | "headMounted";
 *     vendor?: string;         // Device manufacturer
 *     model?: string;          // Device model
 *     isBot?: boolean;         // If it's a bot/crawler
 *   };
 *   engine?: {
 *     name?: string;           // Browser engine name
 *     version?: string;        // Engine version
 *   };
 *   cpu?: {
 *     architecture?: string;   // CPU architecture
 *   };
 * }
 * ```
 *
 * @param {string | null} userAgent - The user agent string to parse
 *
 * @example
 * ### Example 1: Basic Desktop Browser Detection
 * ```typescript
 * const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";
 * const result = parseUserAgent(ua);
 * console.log(result);
 * // Output:
 * // {
 * //   platformOS: { name: "Windows", version: "10.0", family: "Windows" },
 * //   browser: { name: "Chrome", version: "91.0.4472.124", major: "91" },
 * //   device: { type: "desktop" }
 * // }
 * ```
 *
 * @example
 * ### Example 2: Mobile Device Detection
 * ```typescript
 * const mobileUA = "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1";
 * const mobileResult = parseUserAgent(mobileUA);
 * console.log(mobileResult);
 * // Output:
 * // {
 * //   platformOS: { name: "iOS", version: "14.6", family: "iOS" },
 * //   browser: { name: "Mobile Safari", version: "14.1.1", isMobile: true },
 * //   device: { type: "mobile", vendor: "Apple", model: "iPhone" }
 * // }
 * ```
 *
 * @example
 * ### Example 3: XR Device Detection
 * ```typescript
 * const xrUA = "Mozilla/5.0 (X11; Linux x86_64; Quest 2) AppleWebKit/537.36 (KHTML, like Gecko) OculusBrowser/18.0.0.0.0 SamsungBrowser/4.0 Chrome/89.0.4389.90 Mobile VR Safari/537.36";
 * const xrResult = parseUserAgent(xrUA);
 * console.log(xrResult);
 * // Output:
 * // {
 * //   platformOS: { name: "Android", family: "Android" },
 * //   browser: { name: "Oculus Browser", version: "18.0.0.0.0" },
 * //   device: { type: "headMounted", vendor: "Oculus", model: "Quest 2" }
 * // }
 * ```
 *
 * ### ⚠️ Important Notes
 * > [!NOTE]
 * > Returns a default response with "Unknown" values when given a null or empty user agent
 *
 * > [!NOTE]
 * > Handles parsing errors gracefully by returning the default response
 *
 * @returns {ParsedUserAgentProp}
 * Returns a detailed breakdown of the user agent information including platform, browser, and device details
 *
 * @throws {Error}
 * Handles all errors internally and returns default response instead of throwing
 */

export function parseUserAgent(userAgent: string | null): ParsedUserAgentProp {
  // Default response for null/empty user agent
  const defaultResponse: ParsedUserAgentProp = {
    platformOS: {
      name: "Unknown",
      family: "Unknown",
    },
    browser: {
      name: "Unknown",
    },
    device: {
      type: "desktop",
    },
  };

  if (!userAgent || userAgent.trim() === "") {
    return defaultResponse;
  }

  try {
    const ua = new UserAgent(userAgent);

    // Process OS information
    const platformOS = {
      name: ua.platformOS?.name || "Unknown",
      version: ua.platformOS?.version,
      family: detectOSFamily(ua.platformOS?.name),
    };

    // Process browser information
    const browser = {
      name: ua.browser?.name || "Unknown",
      version: ua.browser?.version,
      major: ua.browser?.major,
      isHeadless: detectHeadlessBrowser(ua.browser?.name),
      isMobile: detectMobileBrowser(ua.browser?.name),
    };

    // Process device information
    const device = {
      type: determineDeviceType(ua.device?.type, userAgent),
      vendor: ua.device?.vendor,
      model: ua.device?.model,
      isBot: detectBot(userAgent),
    };

    // Include engine information if available
    const engine = ua.engine?.name
      ? {
          name: ua.engine.name,
          version: ua.engine.version,
        }
      : undefined;

    // Include CPU information if available
    const cpu = ua.cpu?.architecture
      ? {
          architecture: ua.cpu.architecture,
        }
      : undefined;

    return {
      platformOS,
      browser,
      device,
      ...(engine && { engine }),
      ...(cpu && { cpu }),
    };
  } catch (error) {
    console.error("Error parsing user agent:", error);
    return defaultResponse;
  }
}

/**
 * # IsXRDevice
 * #### Determines if a user agent string belongs to an XR (Virtual Reality or Augmented Reality) device
 *
 * The `isXRDevice` function acts like a security guard who specifically checks if someone is wearing VR/AR equipment.
 *
 * @since 0.0.3
 * @category InSpatial Run
 * @module UserAgent
 * @kind function
 * @access public
 *
 * ### 💡 Core Concepts
 * - Checks for common XR device identifiers in the user agent string
 * - Supports major XR platforms including Oculus, Vive, Pico, and Vision Pro
 *
 * ### 📚 Terminology
 * > **XR**: Extended Reality, encompassing both Virtual Reality (VR) and Augmented Reality (AR)
 *
 * @param {string} ua - The user agent string to check
 *
 * @example
 * ### Example 1: Meta Quest Detection
 * ```typescript
 * const questUA = "Mozilla/5.0 (Linux; Android 10; Quest 2) AppleWebKit/537.36";
 * console.log(isXRDevice(questUA)); // Output: true
 * ```
 *
 * @example
 * ### Example 2: Regular Browser Detection
 * ```typescript
 * const regularUA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124";
 * console.log(isXRDevice(regularUA)); // Output: false
 * ```
 *
 * @returns {boolean}
 * Returns true if the user agent string matches any known XR device patterns
 */

export function isXRDevice(ua: string): boolean {
  const xrPatterns = [
    /\b(?:oculus|quest|rift)\b/i,
    /\b(?:vive|vr|xr|ar)\b/i,
    /\b(?:mixed\s*reality|virtual\s*reality)\b/i,
    /\b(?:vision\s*pro|visionos)\b/i,
    /\b(?:pico|varjo|pimax)\b/i,
    /\b(?:horizonos|androidxr)\b/i,
  ];

  return xrPatterns.some((pattern) => pattern.test(ua));
}

/**
 * # DetectOSFamily
 * #### Identifies the operating system family from an OS name string
 *
 * The `detectOSFamily` function works like a family tree expert that groups operating systems
 * into their main families (Windows, macOS, Linux, etc.).
 *
 * @since 0.0.3
 * @category InSpatial Run
 * @module UserAgent
 * @kind function
 * @access public
 *
 * ### 💡 Core Concepts
 * - Maps specific OS names to broader family categories
 * - Handles case-insensitive matching
 * - Includes support for XR-specific operating systems
 *
 * @param {string} osName - The operating system name to categorize
 *
 * @example
 * ### Example 1: Common Desktop OS Detection
 * ```typescript
 * console.log(detectOSFamily("Windows 10")); // Output: "Windows"
 * console.log(detectOSFamily("Mac OS X")); // Output: "macOS"
 * console.log(detectOSFamily("Ubuntu")); // Output: "Linux"
 * ```
 *
 * @example
 * ### Example 2: XR Platform Detection
 * ```typescript
 * console.log(detectOSFamily("visionOS")); // Output: "visionOS"
 * console.log(detectOSFamily("AndroidXR")); // Output: "AndroidXR"
 * console.log(detectOSFamily("HorizonOS")); // Output: "HorizonOS"
 * ```
 *
 * @returns {ParsedUserAgentProp["platformOS"]["family"]}
 * Returns the OS family identifier or "Unknown" if not recognized
 */

export function detectOSFamily(
  osName?: string
): ParsedUserAgentProp["platformOS"]["family"] {
  if (!osName) return "Unknown";

  const osNameLower = osName.toLowerCase();
  if (osNameLower.includes("windows")) return "Windows";
  if (osNameLower.includes("mac") || osNameLower.includes("ios"))
    return "macOS";
  if (osNameLower.includes("linux")) return "Linux";
  if (osNameLower.includes("ios")) return "iOS";
  if (osNameLower.includes("visionos")) return "visionOS";
  if (osNameLower.includes("horizonos")) return "HorizonOS";
  if (osNameLower.includes("androidxr")) return "AndroidXR";
  if (osNameLower.includes("android")) return "Android";

  return "Unknown";
}

/**
 * # DetectHeadlessBrowser
 * #### Determines if a browser is running in headless mode
 *
 * The `detectHeadlessBrowser` function acts like a security guard checking if a browser
 * is running without a visual interface, often used in automation or testing.
 *
 * @since 0.0.3
 * @category InSpatial Run
 * @module UserAgent
 * @kind function
 * @access public
 *
 * ### 💡 Core Concepts
 * - Identifies browsers running without a graphical interface
 * - Detects common automation tools and frameworks
 *
 * ### 📚 Terminology
 * > **Headless Browser**: A web browser without a graphical user interface, typically used for automated testing or web scraping
 *
 * @param {string} browserName - The name of the browser to check
 *
 * @example
 * ### Example 1: Detecting Headless Chrome
 * ```typescript
 * console.log(detectHeadlessBrowser("HeadlessChrome")); // Output: true
 * console.log(detectHeadlessBrowser("Chrome")); // Output: false
 * ```
 *
 * @example
 * ### Example 2: Detecting Automation Tools
 * ```typescript
 * console.log(detectHeadlessBrowser("PhantomJS")); // Output: true
 * console.log(detectHeadlessBrowser("Electron")); // Output: true
 * ```
 *
 * @returns {boolean}
 * Returns true if the browser is identified as headless
 */

export function detectHeadlessBrowser(browserName?: string): boolean {
  if (!browserName) return false;

  const headlessBrowsers = ["headless", "phantomjs", "electron", "nightmare"];

  return headlessBrowsers.some((name) =>
    browserName.toLowerCase().includes(name)
  );
}

/**
 * # DetectMobileBrowser
 * #### Identifies if a browser is a mobile variant
 *
 * The `detectMobileBrowser` function works like a device inspector that checks if
 * a browser is designed for mobile devices.
 *
 * @since 0.0.3
 * @category InSpatial Run
 * @module UserAgent
 * @kind function
 * @access public
 *
 * ### 💡 Core Concepts
 * - Identifies mobile-specific browser variants
 * - Supports major mobile platforms (iOS, Android)
 * - Detects mobile-specific versions of common browsers
 *
 * @param {string} browserName - The name of the browser to check
 *
 * @example
 * ### Example 1: Mobile Browser Detection
 * ```typescript
 * console.log(detectMobileBrowser("Chrome Mobile")); // Output: true
 * console.log(detectMobileBrowser("Safari Mobile")); // Output: true
 * console.log(detectMobileBrowser("Firefox")); // Output: false
 * ```
 *
 * @example
 * ### Example 2: Platform-Specific Browsers
 * ```typescript
 * console.log(detectMobileBrowser("Firefox iOS")); // Output: true
 * console.log(detectMobileBrowser("Android Browser")); // Output: true
 * ```
 *
 * @returns {boolean}
 * Returns true if the browser is identified as a mobile variant
 */

export function detectMobileBrowser(browserName?: string): boolean {
  if (!browserName) return false;

  const mobileBrowserIdentifiers = [
    "mobile",
    "android",
    "ios",
    "chrome mobile",
    "firefox ios",
    "safari mobile",
  ];

  return mobileBrowserIdentifiers.some((identifier) =>
    browserName.toLowerCase().includes(identifier)
  );
}

/**
 * # DetermineDeviceType
 * #### Identifies the type of device based on user agent information
 *
 * The `determineDeviceType` function acts like a device classifier that categorizes
 * devices into specific types (mobile, tablet, desktop, XR headset, etc.).
 *
 * @since 0.0.3
 * @category InSpatial Run
 * @module UserAgent
 * @kind function
 * @access public
 *
 * ### 💡 Core Concepts
 * - Prioritizes XR device detection
 * - Handles multiple device categories
 * - Provides fallback to desktop for unknown types
 *
 * ### 📚 Terminology
 * > **Head Mounted Display (HMD)**: A display device worn on the head, such as VR or AR headsets
 *
 * @param {string} type - The device type hint from user agent parsing
 * @param {string} ua - The full user agent string for additional context
 *
 * @example
 * ### Example 1: XR Device Detection
 * ```typescript
 * const xrUA = "Mozilla/5.0 ... Meta Quest 2 ...";
 * console.log(determineDeviceType("", xrUA)); // Output: "headMounted"
 * ```
 *
 * @example
 * ### Example 2: Common Device Types
 * ```typescript
 * console.log(determineDeviceType("mobile")); // Output: "mobile"
 * console.log(determineDeviceType("tablet")); // Output: "tablet"
 * console.log(determineDeviceType("unknown")); // Output: "desktop"
 * ```
 *
 * @returns {ParsedUserAgentProp["device"]["type"]}
 * Returns the determined device type category
 */

export function determineDeviceType(
  type?: string,
  ua?: string
): ParsedUserAgentProp["device"]["type"] {
  // Check for XR/VR headsets first
  if (ua) {
    const uaLower = ua.toLowerCase();
    if (
      uaLower.includes("visionos") ||
      uaLower.includes("oculus") ||
      uaLower.includes("meta quest") ||
      uaLower.includes("androidxr") ||
      uaLower.includes("horizonos") ||
      uaLower.includes("pico") ||
      uaLower.includes("vive") ||
      uaLower.includes("windows mixed reality")
    ) {
      return "headMounted";
    }
  }

  if (!type) {
    return "desktop";
  }

  switch (type) {
    case "mobile":
    case "tablet":
    case "console":
    case "smarttv":
    case "wearable":
    case "embedded":
    case "headMounted":
      return type;
    default:
      return "desktop";
  }
}

/**
 * # DetectBot
 * #### Identifies if a user agent belongs to a bot or crawler
 *
 * The `detectBot` function works like a bot detector that identifies automated visitors
 * such as search engine crawlers, social media bots, and other automated agents.
 *
 * @since 0.0.3
 * @category InSpatial Run
 * @module UserAgent
 * @kind function
 * @access public
 *
 * ### 💡 Core Concepts
 * - Detects common search engine bots
 * - Identifies social media crawlers
 * - Recognizes general web crawlers and scrapers
 *
 * ### 📚 Terminology
 * > **Bot**: An automated program that browses the web
 * > **Crawler**: A bot that systematically browses websites for indexing or data collection
 *
 * @param {string} userAgent - The user agent string to check for bot patterns
 *
 * @example
 * ### Example 1: Search Engine Bot Detection
 * ```typescript
 * console.log(detectBot("Googlebot/2.1")); // Output: true
 * console.log(detectBot("Mozilla/5.0 (compatible; Bingbot/2.0)")); // Output: true
 * ```
 *
 * @example
 * ### Example 2: Social Media Bot Detection
 * ```typescript
 * console.log(detectBot("facebookexternalhit/1.1")); // Output: true
 * console.log(detectBot("WhatsApp/2.21.12.21")); // Output: true
 * console.log(detectBot("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0")); // Output: false
 * ```
 *
 * @returns {boolean}
 * Returns true if the user agent matches any known bot patterns
 */

export function detectBot(userAgent: string): boolean {
  const botPatterns = [
    "bot",
    "crawler",
    "spider",
    "googlebot",
    "bingbot",
    "slurp",
    "duckduckbot",
    "baiduspider",
    "yandexbot",
    "sogou",
    "exabot",
    "facebookexternalhit",
    "whatsapp",
  ];

  const lowerUA = userAgent.toLowerCase();
  return botPatterns.some((pattern) => lowerUA.includes(pattern));
}

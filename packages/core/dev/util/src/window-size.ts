/**
 * # WindowSize
 * @summary #### A rendering environment agnostic utility for tracking Window dimensions
 *
 * The `WindowSize` utility provides a consistent way to track and respond to changes in the
 * Window dimensions across different rendering environments (DOM, GPU, Native).
 * Think of it like a universal tape measure that works anywhere.
 *
 * @since 0.1.8
 * @category InSpatial Util
 * @module WindowSize
 * @kind module
 * @access public
 *
 * ### 💡 Core Concepts
 * - Environment-agnostic Window size tracking
 * - Publisher-subscriber pattern for size change notifications
 * - Consistent API across all rendering targets
 * - Responsive breakpoint utilities
 */

/**
 * Interface defining Window dimensions
 */
export interface WindowSize {
  width: number;
  height: number;
}

/**
 * Type for subscriber callbacks
 */
type SizeSubscriber = (size: WindowSize) => void;

/**
 * ScreenSize type matching the Flipper component
 */
export type ScreenSize = "4xl" | "3xl" | "2xl" | "xl" | "lg" | "md" | "sm";

/**
 * Screen size breakpoints matching the Flipper component
 */
export const screensizes: Record<ScreenSize, number> = {
  "4xl": 3840,
  "3xl": 1920,
  "2xl": 1535,
  xl: 1279,
  lg: 1023,
  md: 767,
  sm: 639,
};

/**
 * Supported rendering environments
 */
type RenderingEnvironment = "dom" | "native" | "gpu" | "unknown";

/**
 * Interface for Window size providers in different environments
 */
interface WindowSizeProvider {
  /** Get the current Window size */
  getSize(): WindowSize;

  /** Subscribe to Window size changes */
  subscribe(callback: SizeSubscriber): () => void;

  /** Clean up any resources */
  cleanup(): void;
}

/**
 * DOM-specific Window size provider
 */
class DOMWindowSizeProvider implements WindowSizeProvider {
  private currentSize: WindowSize;
  private subscribers: SizeSubscriber[] = [];

  constructor() {
    this.currentSize = {
      width: typeof window !== "undefined" ? window.innerWidth : 0,
      height: typeof window !== "undefined" ? window.innerHeight : 0,
    };

    if (typeof window !== "undefined") {
      window.addEventListener("resize", this.handleResize.bind(this));
      // Initialize with correct values
      this.handleResize();
    }
  }

  private handleResize(): void {
    this.currentSize = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // Notify all subscribers
    this.subscribers.forEach((callback) => callback(this.currentSize));
  }

  getSize(): WindowSize {
    return { ...this.currentSize };
  }

  subscribe(callback: SizeSubscriber): () => void {
    this.subscribers.push(callback);

    // Immediately call with current size
    callback(this.currentSize);

    // Return unsubscribe function
    return (): void => {
      const index = this.subscribers.indexOf(callback);
      if (index !== -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  cleanup(): void {
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", this.handleResize.bind(this));
    }
  }
}

/**
 * GPU-specific Window size provider
 * Uses canvas or WebGL context for Window size when available
 */
class GPUWindowSizeProvider implements WindowSizeProvider {
  private domProvider: DOMWindowSizeProvider;
  private currentSize: WindowSize;
  private subscribers: SizeSubscriber[] = [];
  private canvas: HTMLCanvasElement | null = null;
  private resizeObserver: ResizeObserver | null = null;

  constructor() {
    // Use DOM provider as fallback
    this.domProvider = new DOMWindowSizeProvider();
    this.currentSize = this.domProvider.getSize();

    // Find or create a canvas element if in DOM environment
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      this.setupCanvasTracking();
    } else {
      // Fallback to DOM provider if not in a DOM environment
      this.domProvider.subscribe(this.handleSizeChange.bind(this));
    }
  }

  private setupCanvasTracking(): void {
    try {
      // Try to find an existing canvas element
      this.canvas = document.querySelector("canvas");

      // If no canvas exists, use DOM provider
      if (!this.canvas) {
        this.domProvider.subscribe(this.handleSizeChange.bind(this));
        return;
      }

      // Initialize with canvas dimensions if available
      this.updateSizeFromCanvas();

      // Set up ResizeObserver if available
      if (typeof ResizeObserver !== "undefined") {
        this.resizeObserver = new ResizeObserver(() => {
          this.updateSizeFromCanvas();
        });
        this.resizeObserver.observe(this.canvas);
      } else {
        // Fallback to window resize events
        this.domProvider.subscribe(this.handleSizeChange.bind(this));
      }
    } catch (error) {
      console.warn(
        "Error setting up canvas tracking, falling back to DOM provider",
        error
      );
      this.domProvider.subscribe(this.handleSizeChange.bind(this));
    }
  }

  private updateSizeFromCanvas(): void {
    if (this.canvas) {
      const { width, height } = this.canvas;

      // Only update if dimensions have changed
      if (
        width !== this.currentSize.width ||
        height !== this.currentSize.height
      ) {
        this.currentSize = { width, height };
        this.notifySubscribers();
      }
    }
  }

  private handleSizeChange(size: WindowSize): void {
    this.currentSize = size;
    this.notifySubscribers();
  }

  private notifySubscribers(): void {
    this.subscribers.forEach((callback) => callback(this.currentSize));
  }

  getSize(): WindowSize {
    return { ...this.currentSize };
  }

  subscribe(callback: SizeSubscriber): () => void {
    this.subscribers.push(callback);

    // Immediately call with current size
    callback(this.currentSize);

    // Return unsubscribe function
    return (): void => {
      const index = this.subscribers.indexOf(callback);
      if (index !== -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  cleanup(): void {
    // Clean up ResizeObserver if it was used
    if (this.resizeObserver && this.canvas) {
      this.resizeObserver.unobserve(this.canvas);
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    // Clean up DOM provider
    this.domProvider.cleanup();
  }
}

/**
 * Native-specific Window size provider
 * Uses native platform APIs when available, with fallback mechanisms
 */
class NativeWindowSizeProvider implements WindowSizeProvider {
  private currentSize: WindowSize;
  private subscribers: SizeSubscriber[] = [];
  private unsubscribeFromNative: (() => void) | null = null;

  constructor() {
    this.currentSize = { width: 0, height: 0 };
    this.initializeNativeProvider();
  }

  private async initializeNativeProvider(): Promise<void> {
    try {
      // Try to detect and use the native platform
      if (typeof globalThis !== "undefined") {
        if (typeof (globalThis as any).InSpatialNative !== "undefined") {
          await this.setupInSpatialNative();
        } else if (typeof (globalThis as any).ReactNative !== "undefined") {
          await this.setupReactNative();
        } else {
          // Fallback to DOM if running in a web context
          this.setupFallback();
        }
      } else {
        this.setupFallback();
      }
    } catch (error) {
      console.warn("Failed to initialize native Window provider", error);
      this.setupFallback();
    }
  }

  private async setupInSpatialNative(): Promise<void> {
    // InSpatial Native platform implementation
    const native = (globalThis as any).InSpatialNative;
    if (native && native.Dimensions) {
      const dimensions = native.Dimensions.get("window");
      this.updateSize(dimensions.width, dimensions.height);

      this.unsubscribeFromNative = native.Dimensions.addEventListener(
        "change",
        ({ window }: { window: { width: number; height: number } }) => {
          this.updateSize(window.width, window.height);
        }
      );
    } else {
      this.setupFallback();
    }
  }

  private async setupReactNative(): Promise<void> {
    // React Native implementation
    const ReactNative = (globalThis as any).ReactNative;
    if (ReactNative && ReactNative.Dimensions) {
      const dimensions = ReactNative.Dimensions.get("window");
      this.updateSize(dimensions.width, dimensions.height);

      // Subscribe to dimension changes
      const subscription = ReactNative.Dimensions.addEventListener(
        "change",
        ({ window }: { window: { width: number; height: number } }) => {
          this.updateSize(window.width, window.height);
        }
      );

      this.unsubscribeFromNative = () => {
        subscription.remove();
      };
    } else {
      this.setupFallback();
    }
  }

  private setupFallback(): void {
    // Fallback implementation using DOM if available
    if (typeof window !== "undefined") {
      this.updateSize(window.innerWidth, window.innerHeight);

      const handleResize = () => {
        this.updateSize(window.innerWidth, window.innerHeight);
      };

      window.addEventListener("resize", handleResize);
      this.unsubscribeFromNative = () => {
        window.removeEventListener("resize", handleResize);
      };
    } else {
      // Default size when nothing else is available
      this.updateSize(320, 480);
    }
  }

  private updateSize(width: number, height: number): void {
    this.currentSize = { width, height };
    this.notifySubscribers();
  }

  private notifySubscribers(): void {
    this.subscribers.forEach((callback) => callback(this.currentSize));
  }

  getSize(): WindowSize {
    return { ...this.currentSize };
  }

  subscribe(callback: SizeSubscriber): () => void {
    this.subscribers.push(callback);

    // Immediately call with current size
    callback(this.currentSize);

    // Return unsubscribe function
    return (): void => {
      const index = this.subscribers.indexOf(callback);
      if (index !== -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  cleanup(): void {
    if (this.unsubscribeFromNative) {
      this.unsubscribeFromNative();
      this.unsubscribeFromNative = null;
    }
  }
}

/**
 * Detects the current rendering environment
 */
function detectRenderingEnvironment(): RenderingEnvironment {
  try {
    // Check for native environment first
    if (
      typeof (globalThis as any).InSpatialNative !== "undefined" ||
      typeof (globalThis as any).ReactNative !== "undefined"
    ) {
      return "native";
    }

    // Check for GPU environment by looking for rendering context
    if (
      typeof window !== "undefined" &&
      // Check for WebGL support
      (typeof WebGLRenderingContext !== "undefined" ||
        typeof WebGL2RenderingContext !== "undefined" ||
        // Check if a canvas is present with a WebGL context
        !!document.querySelector("canvas")?.getContext("webgl") ||
        !!document.querySelector("canvas")?.getContext("webgl2"))
    ) {
      return "gpu";
    }

    // Check if DOM environment
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      return "dom";
    }

    // Unknown environment
    return "unknown";
  } catch (error) {
    console.warn("Error detecting rendering environment", error);
    return "unknown";
  }
}

/**
 * Factory function to create the appropriate provider based on the detected environment
 */
function createWindowSizeProvider(): WindowSizeProvider {
  const environment = detectRenderingEnvironment();

  try {
    switch (environment) {
      case "native":
        return new NativeWindowSizeProvider();

      case "gpu":
        return new GPUWindowSizeProvider();

      case "dom":
        return new DOMWindowSizeProvider();

      default:
        // For unknown environments, use DOM provider as fallback
        return new DOMWindowSizeProvider();
    }
  } catch (error) {
    // If any error occurs during provider creation, fall back to DOM provider
    console.warn(
      `Error creating Window provider for ${environment} environment, falling back to DOM`,
      error
    );
    return new DOMWindowSizeProvider();
  }
}

/**
 * Interface for the WindowSize utility
 */
export interface WindowSizeUtilType {
  /** Get the current Window size */
  getSize(): WindowSize;

  /** Check if current Window width is below a specific breakpoint */
  isBelowBreakpoint(size: ScreenSize): boolean;

  /** Subscribe to Window size changes */
  subscribe(callback: SizeSubscriber): () => void;

  /** Clean up event listeners and resources - call when done */
  cleanup(): void;
}

/**
 * A module to track Window size changes with TypeScript support
 * Works across DOM, GPU, and Native environments
 */
const WindowSize: WindowSizeUtilType = (function () {
  // Create the appropriate provider for the current environment
  const provider = createWindowSizeProvider();

  return {
    /**
     * Get the current Window size
     * @returns Current width and height
     */
    getSize: function (): WindowSize {
      return provider.getSize();
    },

    /**
     * Check if current Window width is below a specific breakpoint
     * @param size - Breakpoint size to check against
     * @returns Boolean indicating if Window is below the specified breakpoint
     */
    isBelowBreakpoint: function (size: ScreenSize): boolean {
      return provider.getSize().width <= screensizes[size];
    },

    /**
     * Subscribe to Window size changes
     * @param callback - Function to call when Window size changes
     * @returns Unsubscribe function
     */
    subscribe: function (callback: SizeSubscriber): () => void {
      return provider.subscribe(callback);
    },

    /**
     * Clean up event listeners and resources - call when done
     */
    cleanup: function (): void {
      provider.cleanup();
    },
  };
})();

export { WindowSize };
export default WindowSize;

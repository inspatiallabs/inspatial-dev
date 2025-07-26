import { AndroidXRRenderer } from './android-xr.ts';
import { VisionOSRenderer } from './vision-os.ts';
import { HorizonOSRenderer } from './horizon-os.ts';
import { GenericXRRenderer } from './generic-xr.ts';
import type { EnvironmentInfo } from './environment.ts';

export interface XRRendererOptions {
  rendererID?: string;
  environment?: EnvironmentInfo;
  [key: string]: any;
}

/**
 * XR renderer for AndroidXR, VisionOS, and HorizonOS platforms
 */
export function XRRenderer(options: XRRendererOptions = {}): any {
  const { rendererID = "XR", environment } = options;

  // Platform-specific XR implementation
  if (environment?.type === "androidxr") {
    return AndroidXRRenderer({ rendererID: "AndroidXR", ...options });
  } else if (environment?.type === "visionos") {
    return VisionOSRenderer({ rendererID: "VisionOS", ...options });
  } else if (environment?.type === "horizonos") {
    return HorizonOSRenderer({ rendererID: "HorizonOS", ...options });
  }

  // Generic XR fallback
  return GenericXRRenderer({ rendererID, ...options });
} 
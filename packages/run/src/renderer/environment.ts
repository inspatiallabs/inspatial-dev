/**
 * Universal Environment Detection for Cross-Platform Rendering
 * Automatically detects the runtime environment and selects appropriate renderer
 */

export interface EnvironmentInfo {
  type: 'dom' | 'ssr' | 'node' | 'deno' | 'bun' | 'react-native' | 'electron' | 'webworker' | 'nativescript' | 'androidxr' | 'visionos' | 'horizonos' | 'unknown';
  features: {
    hasDOM: boolean;
    hasDocument: boolean;
    hasWindow: boolean;
    hasProcess: boolean;
    hasGlobal: boolean;
    isServer: boolean;
    isBrowser: boolean;
    isMobile: boolean;
    isDesktop: boolean;
    isNative: boolean;
    isXR: boolean;
    isAR: boolean;
    isVR: boolean;
  };
  runtime: string;
  version?: string;
  platform?: 'android' | 'ios' | 'web' | 'desktop' | 'server' | 'androidxr' | 'visionos' | 'horizonos' | 'unknown';
}

/**
 * Safe access to global variables that might not exist
 */
function safeGlobalAccess<T>(key: string): T | undefined {
  try {
    return (globalThis as any)[key];
  } catch {
    return undefined;
  }
}

/**
 * Detect the current runtime environment
 */
export function detectEnvironment(): EnvironmentInfo {
  const hasWindow = typeof window !== 'undefined';
  const hasDocument = typeof document !== 'undefined';
  const hasGlobal = safeGlobalAccess('global') !== undefined;
  const hasProcess = safeGlobalAccess('process') !== undefined;
  const hasDeno = safeGlobalAccess('Deno') !== undefined;
  const hasBun = safeGlobalAccess('Bun') !== undefined;
  const hasAndroid = safeGlobalAccess('android') !== undefined;
  const hasIOS = safeGlobalAccess('ios') !== undefined;
  const hasNativeScript = safeGlobalAccess('__runtimeVersion') !== undefined || 
                          safeGlobalAccess('__bootstrapModule') !== undefined ||
                          (hasGlobal && (hasAndroid || hasIOS));
  
  // XR Platform Detection
  const hasXRSession = hasWindow && safeGlobalAccess('XRSession') !== undefined;
  const hasWebXR = hasWindow && (navigator as any)?.xr !== undefined;
  const hasAndroidXR = hasAndroid && (safeGlobalAccess('ARCore') !== undefined || 
                                      safeGlobalAccess('VRCore') !== undefined ||
                                      hasXRSession);
  const hasVisionOS = hasWindow && (safeGlobalAccess('VisionKit') !== undefined ||
                                   navigator.userAgent?.includes('VisionOS') ||
                                   navigator.userAgent?.includes('realityOS'));
  const hasHorizonOS = hasWindow && (safeGlobalAccess('HorizonOS') !== undefined ||
                                    safeGlobalAccess('MetaXR') !== undefined ||
                                    navigator.userAgent?.includes('HorizonOS') ||
                                    navigator.userAgent?.includes('Quest'));
  
  // AndroidXR Environment (Android Extended Reality)
  if (hasAndroidXR && !hasWindow) {
    return {
      type: 'androidxr',
      runtime: 'AndroidXR',
      platform: 'androidxr',
      features: {
        hasDOM: false,
        hasDocument: false,
        hasWindow: false,
        hasProcess: false,
        hasGlobal: true,
        isServer: false,
        isBrowser: false,
        isMobile: true,
        isDesktop: false,
        isNative: true,
        isXR: true,
        isAR: true,
        isVR: true,
      }
    };
  }
  
  // VisionOS Environment (Apple Vision Pro)
  if (hasVisionOS) {
    let version: string | undefined;
    
    // Try to extract VisionOS version from user agent
    const visionOSMatch = navigator.userAgent?.match(/VisionOS[\s\/](\d+[\.\d]*)/i);
    if (visionOSMatch) {
      version = visionOSMatch[1];
    }
    
    return {
      type: 'visionos',
      runtime: 'VisionOS',
      version,
      platform: 'visionos',
      features: {
        hasDOM: true,
        hasDocument: true,
        hasWindow: true,
        hasProcess: false,
        hasGlobal: false,
        isServer: false,
        isBrowser: true,
        isMobile: false,
        isDesktop: false,
        isNative: true,
        isXR: true,
        isAR: true,
        isVR: true,
      }
    };
  }
  
  // HorizonOS Environment (Meta Quest/VR)
  if (hasHorizonOS) {
    let version: string | undefined;
    
    // Try to extract HorizonOS version from user agent or MetaXR
    const horizonOSMatch = navigator.userAgent?.match(/HorizonOS[\s\/](\d+[\.\d]*)/i) ||
                          navigator.userAgent?.match(/Quest[\s\/](\d+[\.\d]*)/i);
    if (horizonOSMatch) {
      version = horizonOSMatch[1];
    }
    
    return {
      type: 'horizonos',
      runtime: 'HorizonOS',
      version,
      platform: 'horizonos',
      features: {
        hasDOM: true,
        hasDocument: true,
        hasWindow: true,
        hasProcess: false,
        hasGlobal: false,
        isServer: false,
        isBrowser: true,
        isMobile: false,
        isDesktop: false,
        isNative: true,
        isXR: true,
        isAR: true,
        isVR: true,
      }
    };
  }
  
  // NativeScript Environment (Native Mobile)
  if (hasNativeScript && !hasWindow) {
    let platform: 'android' | 'ios' | 'unknown' = 'unknown';
    let version: string | undefined;
    
    if (hasAndroid) {
      platform = 'android';
    } else if (hasIOS) {
      platform = 'ios';
    }
    
    // Try to get NativeScript version
    const runtimeVersion = safeGlobalAccess('__runtimeVersion');
    const appVersion = safeGlobalAccess('Application');
    version = runtimeVersion || appVersion?.version;
    
    return {
      type: 'nativescript',
      runtime: 'NativeScript',
      version,
      platform,
      features: {
        hasDOM: false,
        hasDocument: false,
        hasWindow: false,
        hasProcess: false,
        hasGlobal: true,
        isServer: false,
        isBrowser: false,
        isMobile: true,
        isDesktop: false,
        isNative: true,
        isXR: false,
        isAR: false,
        isVR: false,
      }
    };
  }
  
  // DOM Environment (Browser)
  if (hasWindow && hasDocument && document.createElement) {
    // Check for React Native
    if (hasWindow && safeGlobalAccess('ReactNativeWebView')) {
      return {
        type: 'react-native',
        runtime: 'React Native WebView',
        platform: 'web',
        features: {
          hasDOM: true,
          hasDocument: true,
          hasWindow: true,
          hasProcess: false,
          hasGlobal: false,
          isServer: false,
          isBrowser: false,
          isMobile: true,
          isDesktop: false,
          isNative: true,
          isXR: false,
          isAR: false,
          isVR: false,
        }
      };
    }
    
    // Check for Electron
    const processVersions = safeGlobalAccess('process')?.versions;
    if (hasProcess && processVersions?.electron) {
      return {
        type: 'electron',
        runtime: 'Electron',
        version: processVersions.electron,
        platform: 'desktop',
        features: {
          hasDOM: true,
          hasDocument: true,
          hasWindow: true,
          hasProcess: true,
          hasGlobal: true,
          isServer: false,
          isBrowser: false,
          isMobile: false,
          isDesktop: true,
          isNative: true,
          isXR: false,
          isAR: false,
          isVR: false,
        }
      };
    }
    
    // Check for Web Worker
    if (typeof importScripts === 'function') {
      return {
        type: 'webworker',
        runtime: 'Web Worker',
        platform: 'web',
        features: {
          hasDOM: false,
          hasDocument: false,
          hasWindow: false,
          hasProcess: false,
          hasGlobal: true,
          isServer: false,
          isBrowser: true,
          isMobile: false,
          isDesktop: false,
          isNative: false,
          isXR: false,
          isAR: false,
          isVR: false,
        }
      };
    }
    
    // Regular Browser
    const isMobile = hasWindow && /Mobi|Android/i.test(navigator.userAgent);
    const isXRCapable = hasWebXR || hasXRSession;
    
    return {
      type: 'dom',
      runtime: 'Browser',
      platform: 'web',
      features: {
        hasDOM: true,
        hasDocument: true,
        hasWindow: true,
        hasProcess: false,
        hasGlobal: false,
        isServer: false,
        isBrowser: true,
        isMobile,
        isDesktop: !isMobile,
        isNative: false,
        isXR: isXRCapable,
        isAR: isXRCapable,
        isVR: isXRCapable,
      }
    };
  }
  
  // Server-side Environments
  if (hasDeno) {
    const denoVersion = safeGlobalAccess('Deno')?.version?.deno;
    return {
      type: 'deno',
      runtime: 'Deno',
      version: denoVersion,
      platform: 'server',
      features: {
        hasDOM: false,
        hasDocument: false,
        hasWindow: false,
        hasProcess: false,
        hasGlobal: true,
        isServer: true,
        isBrowser: false,
        isMobile: false,
        isDesktop: false,
        isNative: false,
        isXR: false,
        isAR: false,
        isVR: false,
      }
    };
  }
  
  if (hasBun) {
    const bunVersion = safeGlobalAccess('Bun')?.version;
    return {
      type: 'bun',
      runtime: 'Bun',
      version: bunVersion,
      platform: 'server',
      features: {
        hasDOM: false,
        hasDocument: false,
        hasWindow: false,
        hasProcess: true,
        hasGlobal: true,
        isServer: true,
        isBrowser: false,
        isMobile: false,
        isDesktop: false,
        isNative: false,
        isXR: false,
        isAR: false,
        isVR: false,
      }
    };
  }
  
  if (hasProcess && hasGlobal) {
    const nodeVersion = safeGlobalAccess('process')?.version;
    return {
      type: 'node',
      runtime: 'Node.js',
      version: nodeVersion,
      platform: 'server',
      features: {
        hasDOM: false,
        hasDocument: false,
        hasWindow: false,
        hasProcess: true,
        hasGlobal: true,
        isServer: true,
        isBrowser: false,
        isMobile: false,
        isDesktop: false,
        isNative: false,
        isXR: false,
        isAR: false,
        isVR: false,
      }
    };
  }
  
  // Unknown environment
  return {
    type: 'unknown',
    runtime: 'Unknown',
    platform: 'unknown',
    features: {
      hasDOM: false,
      hasDocument: false,
      hasWindow: false,
      hasProcess: false,
      hasGlobal: false,
      isServer: false,
      isBrowser: false,
      isMobile: false,
      isDesktop: false,
      isNative: false,
      isXR: false,
      isAR: false,
      isVR: false,
    }
  };
}

/**
 * Get the appropriate renderer type for the current environment
 */
export function getRendererType(env?: EnvironmentInfo): 'dom' | 'html' | 'text' | 'native' | 'xr' {
  const environment = env || detectEnvironment();
  
  switch (environment.type) {
    case 'dom':
    case 'electron':
    case 'react-native':
      return 'dom';
      
    case 'nativescript':
      return 'native';
      
    case 'androidxr':
    case 'visionos':
    case 'horizonos':
      return 'xr';
      
    case 'ssr':
    case 'node':
    case 'deno':
    case 'bun':
      return 'html';
      
    case 'webworker':
      // Web workers can't access DOM, use HTML for string generation
      return 'html';
      
    default:
      // Safe fallback - HTML renderer works everywhere
      return 'html';
  }
}

/**
 * Check if the current environment supports a specific feature
 */
export function supportsFeature(feature: keyof EnvironmentInfo['features'], env?: EnvironmentInfo): boolean {
  const environment = env || detectEnvironment();
  return environment.features[feature];
}

/**
 * Get environment-specific global object
 */
export function getGlobalObject(): any {
  if (typeof globalThis !== 'undefined') return globalThis;
  if (typeof window !== 'undefined') return window;
  
  const globalRef = safeGlobalAccess('global');
  if (globalRef) return globalRef;
  
  if (typeof self !== 'undefined') return self;
  
  // Fallback: create a minimal global object
  return {};
} 
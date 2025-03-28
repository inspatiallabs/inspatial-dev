// Basic platform types
export type PlatformType = "dom" | "native" | "inreal";

// Native sub-platform types
export type NativeSubPlatformType =
  | "ios"
  | "visionos"
  | "android"
  | "androidxr"
  | "horizonos";

// Combined hierarchical platform type
export type HierarchicalPlatformType =
  | PlatformType
  | `${Extract<PlatformType, "native">}:${NativeSubPlatformType}`;

/**
 * Standardized event message structure
 */
export interface EventMessage {
  id: string;
  sourceTarget: PlatformType;
  sourceNodeId: string;
  destinationTarget?: PlatformType;
  destinationNodeId?: string;
  eventName: string;
  payload: any;
  timestamp: number;
  metadata?: Record<string, any>;

  // Hierarchical platform information
  sourceHierarchicalPlatform?: HierarchicalPlatformType;
  destinationHierarchicalPlatform?: HierarchicalPlatformType;
}

/**
 * Event handler function signature
 */
export type EventHandler = (eventData: any) => void;

/**
 * Node information for linking
 */
export interface NodeInfo {
  target: PlatformType | HierarchicalPlatformType;
  nodeId: string;
}

/**
 * Registry structure for events
 */
export interface EventRegistry {
  [target: string]: {
    [nodeId: string]: {
      [eventName: string]: EventHandler;
    };
  };
}

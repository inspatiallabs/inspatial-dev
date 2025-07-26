/**
 * InSpatial Universal Debugger
 */

import { env } from "../env/index.ts";

export type DebugLevel = "error" | "warn" | "info" | "debug" | "trace";
export type DebugCategory =
  | "renderer"
  | "environment"
  | "hmr"
  | "signal"
  | "component"
  | "env-vars"
  | "performance"
  | "lifecycle"
  | "xr"
  | "native"
  | "general";

// Simplified debug config
export type DebugMode =
  | boolean
  | "minimal"
  | "normal"
  | "verbose"
  | DebugOptions;

export interface DebugOptions {
  level?: DebugLevel;
  focus?: DebugCategory[];
  output?: "console" | "custom" | "none";
  customHandler?: (entry: DebugEntry) => void;
}

interface DebugConfig {
  enabled: boolean;
  level: DebugLevel;
  categories: DebugCategory[] | "all";
  showTimestamp: boolean;
  showCategory: boolean;
  showLevel: boolean;
  prefix: string;
  output: "console" | "custom" | "none";
  customHandler?: (entry: DebugEntry) => void;
}

interface DebugEntry {
  level: DebugLevel;
  category: DebugCategory;
  message: string;
  data?: any[];
  timestamp: number;
  stack?: string;
}

/**
 * Debug Context that flows through the system
 */
export class DebugContext {
  private debugger: InSpatialDebugger;
  private startTime: number;
  private renderCount: number = 0;
  private signalCount: number = 0;
  private componentCount: number = 0;

  constructor(debugMode: DebugMode) {
    this.debugger = new InSpatialDebugger(this.parseDebugMode(debugMode));
    this.startTime = performance.now();
  }

  private parseDebugMode(mode: DebugMode): Partial<DebugConfig> {
    if (mode === false) {
      return { enabled: false };
    }

    if (mode === true) {
      return {
        enabled: true,
        level: env.isProduction() ? "error" : "info",
        showTimestamp: true,
        showCategory: true,
      };
    }

    if (typeof mode === "string") {
      const levels: Record<string, DebugLevel> = {
        minimal: "warn",
        normal: "info",
        verbose: "trace",
      };
      return {
        enabled: true,
        level: levels[mode] || "info",
        showTimestamp: mode !== "minimal",
        showCategory: mode === "verbose",
      };
    }

    // Custom options
    return {
      enabled: true,
      level: mode.level || "info",
      categories: mode.focus || "all",
      output: mode.output || "console",
      customHandler: mode.customHandler,
    };
  }

  // Auto-log environment detection
  logEnvironment(env: any): void {
    const group = this.debugger.group(`🌟 InSpatial Run`, "general");

    this.debugger.info("environment", `Environment: ${env.type}`, {
      runtime: env.runtime,
      platform: env.platform,
      features: env.features,
    });

    // Smart warnings
    if (env.type === "unknown") {
      this.debugger.warn(
        "environment",
        "Unknown environment detected - using fallback renderer"
      );
    }

    if (env.features.isXR && !env.features.hasWebXR) {
      this.debugger.warn(
        "xr",
        "XR environment detected but WebXR not available"
      );
    }

    group.end();
  }

  // Auto-log mode selection
  logModeSelection(requested: string, resolved: string, reason?: string): void {
    const icon = requested === resolved ? "✅" : "🔄";
    const message =
      requested === resolved
        ? `Mode: ${resolved}`
        : `Mode: ${requested} → ${resolved}`;

    this.debugger.info("renderer", `${icon} ${message}`, { reason });
  }

  // Auto-log renderer creation
  logRendererCreation(type: string, renderer: any): void {
    const duration = performance.now() - this.startTime;
    this.debugger.info("renderer", `🎨 Renderer: ${type}`, {
      duration: `${duration.toFixed(2)}ms`,
      features: Object.keys(renderer.nodeOps || {}),
    });

    this.debugger.info("general", `✅ Ready in ${duration.toFixed(0)}ms`);
  }

  // Component lifecycle tracking
  trackComponent(action: "mount" | "update" | "unmount", name: string): void {
    if (action === "mount") this.componentCount++;
    this.debugger.trace("component", `${name}: ${action}`);
  }

  // Signal tracking (intelligent)
  trackSignal(
    action: "create" | "update" | "dispose",
    id: number,
    value?: any
  ): void {
    if (action === "create") this.signalCount++;

    // Only log if verbose or if it's an important signal
    if (
      this.debugger.config.level === "trace" ||
      this.isImportantSignal(id, value)
    ) {
      this.debugger.trace("signal", `Signal #${id} ${action}`, { value });
    }
  }

  // Performance tracking
  startOperation(name: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      if (duration > 50) {
        // Only log slow operations
        this.debugger.performance(name, duration);
      }
    };
  }

  // Render tracking
  trackRender(componentName: string): () => void {
    this.renderCount++;
    const timer = this.startOperation(`Render ${componentName}`);

    if (this.renderCount === 1) {
      // First render is special
      return () => {
        timer();
        const duration = performance.now() - this.startTime;

        const group = this.debugger.group(
          "🚀 Rendering Application",
          "general"
        );
        this.debugger.info("component", `Component: ${componentName}`);
        this.debugger.info("signal", `Signals: ${this.signalCount} active`);
        this.debugger.info(
          "performance",
          `First render: ${duration.toFixed(0)}ms`
        );
        group.end();
      };
    }

    return timer;
  }

  // Smart signal detection
  private isImportantSignal(id: number, value: any): boolean {
    // Detect potential issues
    if (value === undefined || value === null) return true;
    if (typeof value === "object" && Object.keys(value).length > 100)
      return true;

    // TODO: Add more intelligence here
    return false;
  }

  // Access underlying debugger
  get debug(): InSpatialDebugger {
    return this.debugger;
  }
}

class InSpatialDebugger {
  public config: Required<DebugConfig>; // Make config public for DebugContext
  private entries: DebugEntry[] = [];
  private readonly levelPriority: Record<DebugLevel, number> = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
    trace: 4,
  };

  constructor(config: Partial<DebugConfig> = {}) {
    this.config = {
      enabled: config.enabled ?? !env.isProduction(),
      level: config.level ?? "info",
      categories: config.categories ?? "all",
      showTimestamp: config.showTimestamp ?? true,
      showCategory: config.showCategory ?? true,
      showLevel: config.showLevel ?? true,
      prefix: config.prefix ?? "🌟 InSpatial",
      output: config.output ?? "console",
      customHandler: config.customHandler ?? (() => {}),
    };
  }

  configure(config: Partial<DebugConfig>): void {
    this.config = { ...this.config, ...config };
  }

  private shouldLog(level: DebugLevel, category: DebugCategory): boolean {
    if (!this.config.enabled) return false;

    // Check level priority
    if (this.levelPriority[level] > this.levelPriority[this.config.level]) {
      return false;
    }

    // Check category filter
    if (
      this.config.categories !== "all" &&
      !this.config.categories.includes(category)
    ) {
      return false;
    }

    return true;
  }

  private createEntry(
    level: DebugLevel,
    category: DebugCategory,
    message: string,
    data?: any[]
  ): DebugEntry {
    return {
      level,
      category,
      message,
      data,
      timestamp: Date.now(),
      stack: level === "error" ? new Error().stack : undefined,
    };
  }

  private formatMessage(entry: DebugEntry): string {
    const parts: string[] = [];

    if (this.config.prefix) {
      parts.push(this.config.prefix);
    }

    if (this.config.showTimestamp) {
      const time = new Date(entry.timestamp).toISOString().substr(11, 12);
      parts.push(`[${time}]`);
    }

    if (this.config.showLevel) {
      const levelEmoji = {
        error: "❌",
        warn: "⚠️",
        info: "ℹ️",
        debug: "🔧",
        trace: "📍",
      };
      parts.push(`${levelEmoji[entry.level]} ${entry.level.toUpperCase()}`);
    }

    if (this.config.showCategory) {
      const categoryEmoji = {
        renderer: "🎨",
        environment: "🌍",
        hmr: "🔥",
        signal: "⚡",
        component: "🧩",
        "env-vars": "🔧",
        performance: "⚡",
        lifecycle: "🔄",
        xr: "🥽",
        native: "📱",
        general: "📝",
      };
      parts.push(`${categoryEmoji[entry.category]} ${entry.category}`);
    }

    parts.push(entry.message);

    return parts.join(" ");
  }

  private log(
    level: DebugLevel,
    category: DebugCategory,
    message: string,
    ...data: any[]
  ): void {
    if (!this.shouldLog(level, category)) return;

    const entry = this.createEntry(level, category, message, data);
    this.entries.push(entry);

    // Keep only last 1000 entries
    if (this.entries.length > 1000) {
      this.entries = this.entries.slice(-1000);
    }

    if (this.config.output === "console") {
      const formattedMessage = this.formatMessage(entry);
      const consoleMethod =
        level === "debug" || level === "trace" ? "log" : level;

      if (data.length > 0) {
        console[consoleMethod](formattedMessage, ...data);
      } else {
        console[consoleMethod](formattedMessage);
      }

      if (entry.stack && level === "error") {
        console.error("Stack trace:", entry.stack);
      }
    } else if (this.config.output === "custom" && this.config.customHandler) {
      this.config.customHandler(entry);
    }
  }

  // Public logging methods
  error(category: DebugCategory, message: string, ...data: any[]): void {
    this.log("error", category, message, ...data);
  }

  warn(category: DebugCategory, message: string, ...data: any[]): void {
    this.log("warn", category, message, ...data);
  }

  info(category: DebugCategory, message: string, ...data: any[]): void {
    this.log("info", category, message, ...data);
  }

  debug(category: DebugCategory, message: string, ...data: any[]): void {
    this.log("debug", category, message, ...data);
  }

  trace(category: DebugCategory, message: string, ...data: any[]): void {
    this.log("trace", category, message, ...data);
  }

  // Specialized logging methods
  envDetection(env: any): void {
    this.info("environment", "Environment detected", {
      type: env.type,
      runtime: env.runtime,
      platform: env.platform,
      features: env.features,
    });
  }

  rendererCreation(mode: string, renderer: any): void {
    this.info("renderer", `Renderer created: ${mode}`, {
      id: renderer.id,
      nodeOps: Object.keys(renderer.nodeOps || {}),
    });
  }

  modeSelection(requested: string, resolved: string, reason?: string): void {
    if (requested !== resolved) {
      this.warn("renderer", `Mode changed: ${requested} → ${resolved}`, {
        reason,
      });
    } else {
      this.debug("renderer", `Mode selected: ${resolved}`);
    }
  }

  hmrActivity(action: string, details?: any): void {
    this.debug("hmr", `HMR ${action}`, details);
  }

  componentLifecycle(action: string, component: string, details?: any): void {
    this.trace("component", `${component}: ${action}`, details);
  }

  performance(operation: string, duration: number, details?: any): void {
    const level = duration > 100 ? "warn" : duration > 50 ? "info" : "debug";
    this.log(
      level as DebugLevel,
      "performance",
      `${operation} took ${duration}ms`,
      details
    );
  }

  signalActivity(action: string, signalId?: number, value?: any): void {
    this.trace("signal", `Signal ${action}${signalId ? ` #${signalId}` : ""}`, {
      value,
    });
  }

  // Utility methods
  getEntries(filter?: {
    level?: DebugLevel;
    category?: DebugCategory;
    since?: number;
  }): DebugEntry[] {
    if (!filter) return [...this.entries];

    return this.entries.filter((entry) => {
      if (filter.level && entry.level !== filter.level) return false;
      if (filter.category && entry.category !== filter.category) return false;
      if (filter.since && entry.timestamp < filter.since) return false;
      return true;
    });
  }

  clear(): void {
    this.entries = [];
  }

  summary(): {
    total: number;
    byLevel: Record<DebugLevel, number>;
    byCategory: Record<DebugCategory, number>;
  } {
    const byLevel = { error: 0, warn: 0, info: 0, debug: 0, trace: 0 };
    const byCategory = {
      renderer: 0,
      environment: 0,
      hmr: 0,
      signal: 0,
      component: 0,
      "env-vars": 0,
      performance: 0,
      lifecycle: 0,
      xr: 0,
      native: 0,
      general: 0,
    };

    for (const entry of this.entries) {
      byLevel[entry.level]++;
      byCategory[entry.category]++;
    }

    return {
      total: this.entries.length,
      byLevel,
      byCategory,
    };
  }

  // Development helpers
  startTiming(label: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.performance(label, duration);
    };
  }

  group(
    title: string,
    category: DebugCategory = "general"
  ): { end: () => void } {
    if (this.config.output === "console" && this.shouldLog("info", category)) {
      console.group(
        this.formatMessage(this.createEntry("info", category, title))
      );
    }

    return {
      end: () => {
        if (
          this.config.output === "console" &&
          this.shouldLog("info", category)
        ) {
          console.groupEnd();
        }
      },
    };
  }
}

// Create default debugger instance
export const debug = new InSpatialDebugger();

// Create debug context factory
export function createDebugContext(
  mode: DebugMode = false
): DebugContext | null {
  if (mode === false) return null;
  return new DebugContext(mode);
}

// Convenience exports
export { InSpatialDebugger };
export type { DebugConfig, DebugEntry };

// Quick access methods for common scenarios
export const renderer = {
  creation: (mode: string, renderer: any) =>
    debug.rendererCreation(mode, renderer),
  mode: (requested: string, resolved: string, reason?: string) =>
    debug.modeSelection(requested, resolved, reason),
  error: (message: string, ...data: any[]) =>
    debug.error("renderer", message, ...data),
  warn: (message: string, ...data: any[]) =>
    debug.warn("renderer", message, ...data),
  info: (message: string, ...data: any[]) =>
    debug.info("renderer", message, ...data),
};

export const environment = {
  detected: (env: any) => debug.envDetection(env),
  error: (message: string, ...data: any[]) =>
    debug.error("environment", message, ...data),
  warn: (message: string, ...data: any[]) =>
    debug.warn("environment", message, ...data),
  info: (message: string, ...data: any[]) =>
    debug.info("environment", message, ...data),
};

export const hmr = {
  activity: (action: string, details?: any) =>
    debug.hmrActivity(action, details),
  error: (message: string, ...data: any[]) =>
    debug.error("hmr", message, ...data),
  warn: (message: string, ...data: any[]) =>
    debug.warn("hmr", message, ...data),
  info: (message: string, ...data: any[]) =>
    debug.info("hmr", message, ...data),
};

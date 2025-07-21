/** Represents a navigation hook that can cancel navigation, redirect, or allow it to proceed. */
type Hook<T extends BaseRouteConfig, C> = (
  route: CompiledRoute<T>,
  params: Record<string, string>,
  context: C | null
) => boolean | string | Promise<boolean | string>;

/** Represents the router configuration object. */
interface RouterOptions<T extends BaseRouteConfig, C = any> {
  delegateUnknown?: boolean;
  eventName?: string;
  hooks?: Hook<T, C>[];
  ignoreUnknown?: boolean;
  initialContext?: C;
  interceptLinks?: boolean;
  prefix?: string;
  routerName?: string;
}

/** Base configuration for a route, required by the library. */
interface BaseRouteConfig {
  path: string; // The route path (required)
  hooks?: any[]; // Optional hooks for route lifecycle (flexible type to avoid circular reference)
  redirect?: string; // Optional redirect target
  [key: string]: any; // Allow additional properties for custom route configurations
}

/** A compiled route, including library-added properties and user-defined properties. */
type CompiledRoute<T extends BaseRouteConfig> = T & {
  name: string; // Route name (added by the library)
  pattern: RegExp; // Compiled regex for matching the path
  params: string[]; // Parameter names extracted from the path
  mapping: string; // Mapping string for regex grouping
};

/** The Router class for handling navigation and route matching. */
export class Router<T extends BaseRouteConfig, C = null> {
  private mappings: RegExp | null = null;
  private hooks: Hook<T, C>[];
  private routes: Record<string, CompiledRoute<T>>;
  private captureGroupToRouteName: Record<string, string> = {};
  private prefix: string;
  private eventName: string;
  private context: C | null;
  private interceptLinks: boolean;
  private ignoreUnknown: boolean;
  private delegateUnknown: boolean;
  private routerName: string | null = null;

  /**
   * Initialize the router with routes configuration and options.
   *
   * @param routes - A map of routes or array of routes, including a 'notFound' route.
   * @param options - Configuration options including global hooks, prefix, and event name.
   */
  constructor(
    routes: T[] | Record<string, T> = {},
    options: RouterOptions<T, C> = {}
  ) {
    this.hooks = options.hooks || [];
    this.prefix = options.prefix || "";
    this.eventName = options.eventName || "texivia";
    this.context = options.initialContext ?? null;
    this.interceptLinks = options.interceptLinks ?? true;
    this.ignoreUnknown = options.ignoreUnknown ?? false;
    this.delegateUnknown = options.delegateUnknown ?? false;
    this.routerName = options.routerName || null;
    this.routes = {};

    // Convert array format to object format if needed
    const routesObject = this._normalizeRoutes(routes);
    this._compile(routesObject);
  }

  /**
   * Normalizes routes input to object format, converting arrays to objects if needed.
   * @param routes - Routes in array or object format
   * @returns Routes in object format with index-based keys for arrays
   */
  private _normalizeRoutes(routes: T[] | Record<string, T>): Record<string, T> {
    // Handle empty/undefined routes
    if (!routes) {
      return {};
    }

    // Check if routes is an array
    if (Array.isArray(routes)) {
      // Convert array to object format using index-based keys
      const routesObject: Record<string, T> = {};
      routes.forEach((route, index) => {
        routesObject[index.toString()] = route;
      });
      return routesObject;
    }

    // Already in object format, return as-is
    return routes;
  }

  /**
   * Creates a valid capture group name for regex patterns.
   * JavaScript regex named capture groups must start with a letter or underscore.
   * @param name - The original route name
   * @returns A valid capture group name
   */
  private _createValidCaptureGroupName(name: string): string {
    // If name starts with a digit, prefix with 'route_'
    if (/^\d/.test(name)) {
      return `route_${name}`;
    }
    // If name contains invalid characters, replace them with underscores
    return name.replace(/[^a-zA-Z0-9_$]/g, "_");
  }

  /**
   * Compiles the user-provided routes into a format usable by the router.
   * @param routes - The user-defined routes.
   */
  private _compile(routes: Record<string, T>): void {
    const compiledRoutes: Record<string, CompiledRoute<T>> = {};
    const mappings: string[] = [];
    const captureGroupToRouteName: Record<string, string> = {};

    for (const [name, routeConfig] of Object.entries(routes)) {
      if (name) {
        const compiledRoute = this._process(routeConfig, name);
        compiledRoutes[name] = compiledRoute;

        // Create valid capture group name (must start with letter or underscore)
        const captureGroupName = this._createValidCaptureGroupName(name);
        captureGroupToRouteName[captureGroupName] = name;

        mappings.push(`(?<${captureGroupName}>${compiledRoute.mapping})`);
      }
    }

    // Handle empty routes gracefully for testing scenarios
    if (mappings.length === 0) {
      this.mappings = null;
      this.routes = {};
      this.captureGroupToRouteName = {};
      return;
    }

    this.mappings = new RegExp(`^${mappings.join("|")}$`, "i");
    this.routes = compiledRoutes;
    this.captureGroupToRouteName = captureGroupToRouteName;
  }

  /**
   * Processes a single route configuration into a compiled route.
   * @param routeConfig - The user-provided route configuration.
   * @param name - The name of the route.
   * @returns A compiled route object.
   */
  private _process(routeConfig: T, name: string): CompiledRoute<T> {
    if (routeConfig.path === "*") {
      return {
        ...routeConfig,
        name,
        pattern: new RegExp("^.*$"),
        params: [],
        mapping: "^.*$",
      };
    }
    const fullPath = this.prefix + routeConfig.path;

    const SEGMENT_REGEX =
      /(?:\/([^\/{}]+)|\/\{([a-zA-Z_$][a-zA-Z0-9_$]*)(?::([^/]+))?\}|(\/))/g;
    const matches = fullPath.match(SEGMENT_REGEX);
    if (!matches || matches.join("") !== fullPath) {
      throw new Error(`Malformed path: ${fullPath}`);
    }

    let paramRegex = "^";
    let mappingRegex = "^";
    const names: string[] = [];

    fullPath.replace(SEGMENT_REGEX, (match, literal, param, regex, slash) => {
      if (literal) {
        const escaped = "\\/" + literal.replace(/[-\\^$*+?.()|[\]{}]/g, "\\$&");
        paramRegex += escaped;
        mappingRegex += escaped;
      } else if (param) {
        paramRegex += `\\/(?<${param}>${regex || "[^/]+"})`;
        mappingRegex += `\\/${regex || "[^/]+"}`;
        names.push(param);
      } else if (slash) {
        paramRegex += "\\/";
        mappingRegex += "\\/";
      }
      return "";
    });
    paramRegex += "$";
    mappingRegex += "$";

    return {
      ...routeConfig,
      name,
      pattern: new RegExp(paramRegex),
      params: names,
      mapping: mappingRegex,
    };
  }

  /**
   * Matches a path to a route and extracts parameters.
   * @param path - The path to match.
   * @returns The matched route and its parameters, or the notFound route if no match.
   */
  private _matchRoute(
    path: string
  ): { route: CompiledRoute<T>; params: Record<string, string> } | null {
    // Return null when no routes are configured (for testing scenarios)
    if (!this.mappings) return null;

    const matches = this.mappings.exec(path);
    if (!matches || matches[0] !== path || !matches.groups)
      return this.ignoreUnknown || !this.routes.notFound
        ? null
        : { route: this.routes.notFound, params: {} };

    const captureGroupName = Object.keys(matches.groups ?? {}).find(
      (key) => matches.groups?.[key] !== undefined
    );
    if (!captureGroupName) {
      return { route: this.routes.notFound, params: {} };
    }

    // Map capture group name back to actual route name
    const routeName = this.captureGroupToRouteName[captureGroupName];
    if (!routeName) {
      return { route: this.routes.notFound, params: {} };
    }

    const route = this.routes[routeName];
    const paramsMatch = route.pattern.exec(path);
    const params = paramsMatch ? paramsMatch.groups || {} : {};
    return { route, params };
  }

  /** Starts the router, attaching event listeners and navigating to the current path. */
  start(): this {
    window.addEventListener("popstate", this._handlePopState.bind(this));
    this.interceptLinks &&
      document.addEventListener("click", this._handleClick.bind(this));
    this.delegateUnknown &&
      document.addEventListener(
        `${this.eventName}-delegate`,
        this._onDelegate.bind(this)
      );
    this.navigate(window.location.pathname + window.location.search, false);
    return this;
  }

  /** Stops the router, removing event listeners. */
  stop(): void {
    window.removeEventListener("popstate", this._handlePopState);
    this.interceptLinks &&
      document.removeEventListener("click", this._handleClick);
  }

  /**
   * Generates a URL for a named route with parameters and query string.
   * @param name - The name of the route.
   * @param params - Route parameters.
   * @param query - Query parameters.
   * @returns The generated URL.
   */
  generateUrl(
    name: string,
    params: Record<string, string> = {},
    query: Record<string, string> = {}
  ): string {
    const route = this.routes[name];
    if (!route) {
      throw new Error(`Named route '${name}' not found`);
    }

    let path = this.prefix + route.path;
    for (const paramName of route.params) {
      const value = params[paramName];
      if (value === undefined || value === null) {
        throw new Error(
          `Missing required parameter: ${paramName} for route '${name}'`
        );
      }
      const escapedParamName = paramName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const paramRegex = new RegExp(
        `\\{${escapedParamName}(?::[^}]*)?\\}`,
        "g"
      );
      path = path.replace(paramRegex, encodeURIComponent(value));
    }

    if (query && Object.keys(query).length > 0) {
      const queryString = Object.entries(query)
        .map(
          ([key, value]) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
        )
        .join("&");
      path += `?${queryString}`;
    }

    return path;
  }

  /**
   * Handles custom event triggered by another instance of the router.
   *
   * @param event - The custom event containing the path another router had no config for.
   * @returns A promise that resolves when the delegate action is complete.
   */
  private async _onDelegate(e: Event): Promise<void> {
    const event = e as CustomEvent;
    if (event.detail.router !== this.routerName) {
      const match = this._matchRoute(event.detail.path.split("?")[0]);
      match && this.navigate(event.detail.path);
    }
  }

  /**
   * Navigates to a given path, running hooks and updating history.
   * @param path - The path to navigate to.
   * @param pushState - Whether to push a new history state.
   * @param delegate - Whether to delegate to another router if no match is found.
   * @returns A promise resolving to the matched route and params, or false if navigation is canceled.
   */
  async navigate(
    path: string,
    pushState: boolean = true,
    redirectCount: number = 0
  ): Promise<
    { route: CompiledRoute<T>; params: Record<string, string> } | false
  > {
    if (redirectCount > 10) throw new Error("Texivia: redirect limit exceeded");

    const match = this._matchRoute(path.split("?")[0]);
    if (match === null) {
      this.delegateUnknown &&
        document.dispatchEvent(
          new CustomEvent(`${this.eventName}-delegate`, {
            detail: { path, router: this.routerName },
          })
        );
      return false;
    }
    if (match.route.redirect)
      return this.navigate(match.route.redirect, pushState, redirectCount + 1);

    for (const hook of [...this.hooks, ...(match.route.hooks || [])]) {
      try {
        const result = await hook(match.route, match.params, this.context);
        if (result === false) {
          return false;
        }
        if (typeof result === "string") {
          return this.navigate(result, pushState);
        }
      } catch (error) {
        console.error("Error in navigation hook:", error);
        return false;
      }
    }

    if (pushState) {
      window.history.pushState({ path }, "", path);
    }

    this._dispatchEvent(match.route, match.params);
    return { route: match.route, params: match.params };
  }

  /**
   * Navigates to a named route with parameters.
   * @param name - The name of the route.
   * @param params - Route parameters.
   * @param pushState - Whether to push a new history state.
   * @returns A promise resolving to the matched route and params, or false if navigation is canceled.
   */
  async navigateToNamed(
    name: string,
    params: Record<string, string> = {},
    pushState: boolean = true
  ): Promise<
    { route: CompiledRoute<T>; params: Record<string, string> } | false
  > {
    const route = this.routes[name];
    if (!route) {
      throw new Error(`Named route '${name}' not found`);
    }

    let path = this.prefix + route.path;
    for (const paramName of route.params) {
      const value = params[paramName] || "";
      path = path.replace(
        new RegExp(`\\{${paramName}(?::[^}]*)?\\}`, "g"),
        encodeURIComponent(value)
      );
    }

    return this.navigate(path, pushState);
  }

  /**
   * Parses a query string into a key-value object.
   * @param queryString - The query string to parse.
   * @returns The parsed query parameters.
   */
  private _parseQuery(queryString: string): Record<string, string> {
    return Object.fromEntries(new URLSearchParams(queryString));
  }

  /**
   * Dispatches a custom event with route details.
   * @param route - The matched route.
   * @param params - The route parameters.
   */
  private _dispatchEvent(
    route: CompiledRoute<T>,
    params: Record<string, string>
  ): void {
    const event = new CustomEvent(this.eventName, {
      detail: {
        route,
        params: params || {},
        path: window.location.pathname,
        query: this._parseQuery(window.location.search),
      },
      bubbles: true,
    });
    document.dispatchEvent(event);
  }

  /** Handles browser back/forward navigation. */
  private async _handlePopState(event: PopStateEvent): Promise<void> {
    await this.navigate(
      window.location.pathname + window.location.search,
      false
    );
  }

  /** Handles link clicks to enable SPA navigation. */
  private async _handleClick(event: MouseEvent): Promise<void> {
    const link = (event.target as Element).closest("a");
    if (
      !link ||
      link.getAttribute("target") === "_blank" ||
      link.hasAttribute("data-no-router") ||
      link.hasAttribute("download") ||
      link.getAttribute("rel") === "external"
    ) {
      return;
    }

    const href = link.getAttribute("href");
    if (
      !href ||
      href.startsWith("http") ||
      href.startsWith("//") ||
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      !href.startsWith(this.prefix) ||
      new URL(href, window.location.origin).origin !== window.location.origin
    ) {
      return;
    }

    event.preventDefault();
    await this.navigate(href);
  }
}

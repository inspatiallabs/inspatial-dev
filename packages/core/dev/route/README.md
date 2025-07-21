# @in/route

A lightweight, declarative routing library for building single-page applications with TypeScript support.

## Features

- 🚀 **Declarative routing** - Define routes with simple configuration objects
- 🔧 **TypeScript support** - Fully typed route configurations and parameters
- 🎯 **Navigation hooks** - Intercept and control navigation flow
- 🔄 **History management** - Built-in browser history integration
- 🔗 **Link interception** - Automatic SPA navigation for internal links
- 📱 **Cross-platform** - Works in Deno, Node.js, and browsers
- ⚡ **Lightweight** - Minimal dependencies and small bundle size

## Installation

```bash
deno add jsr:@in/route
```

## Quick Start

```typescript
import { Router } from "@in/route";

// Define your routes
const routes = {
  home: { path: "/" },
  about: { path: "/about" },
  user: { path: "/user/{id}" },
  notFound: { path: "*" }
};

// Create and start the router
const router = new Router(routes, {
  eventName: "navigate",
  interceptLinks: true
});

// Listen for navigation events
document.addEventListener("navigate", (event) => {
  const { route, params, path, query } = event.detail;
  console.log(`Navigated to ${route.name}`, { params, path, query });
});

// Start the router
router.start();
```

## Route Configuration

### Basic Routes

```typescript
const routes = {
  home: { path: "/" },
  about: { path: "/about" },
  contact: { path: "/contact" }
};
```

### Parameterized Routes

```typescript
const routes = {
  user: { path: "/user/{id}" },
  post: { path: "/blog/{category}/{slug}" },
  product: { path: "/product/{id:number}" } // Custom parameter pattern
};
```

### Route Redirects

```typescript
const routes = {
  oldPath: { path: "/old-path", redirect: "/new-path" },
  home: { path: "/" },
  newPath: { path: "/new-path" }
};
```

### Route Hooks

```typescript
const routes = {
  protected: {
    path: "/admin",
    hooks: [
      async (route, params, context) => {
        if (!context?.isAuthenticated) {
          return "/login"; // Redirect to login
        }
        return true; // Allow navigation
      }
    ]
  }
};
```

## Navigation

### Programmatic Navigation

```typescript
// Navigate to a path
await router.navigate("/about");

// Navigate to a named route
await router.navigateToNamed("user", { id: "123" });

// Generate URLs
const userUrl = router.generateUrl("user", { id: "123" });
const searchUrl = router.generateUrl("search", {}, { q: "typescript" });
```

### Link Interception

The router automatically intercepts clicks on internal links:

```html
<!-- These will use SPA navigation -->
<a href="/about">About</a>
<a href="/user/123">User Profile</a>

<!-- These will use normal navigation -->
<a href="/external" target="_blank">External</a>
<a href="/download" download>Download</a>
<a href="/api/data" data-no-router>API Endpoint</a>
```

## Router Options

```typescript
interface RouterOptions {
  delegateUnknown?: boolean;     // Delegate unknown routes to other routers
  eventName?: string;            // Custom event name (default: "texivia")
  hooks?: Hook[];                // Global navigation hooks
  ignoreUnknown?: boolean;       // Ignore unknown routes instead of showing 404
  initialContext?: any;          // Initial context passed to hooks
  interceptLinks?: boolean;      // Enable automatic link interception
  prefix?: string;               // URL prefix for all routes
  routerName?: string;           // Router name for delegation
}
```

## Navigation Hooks

Hooks allow you to intercept navigation and implement features like authentication, logging, or data loading:

```typescript
const authHook = async (route, params, context) => {
  // Return false to cancel navigation
  if (route.name === "admin" && !context.isAuthenticated) {
    return false;
  }
  
  // Return a string to redirect
  if (route.name === "login" && context.isAuthenticated) {
    return "/dashboard";
  }
  
  // Return true to allow navigation
  return true;
};

const router = new Router(routes, {
  hooks: [authHook],
  initialContext: { isAuthenticated: false }
});
```

## Event Handling

Listen for navigation events to update your UI:

```typescript
document.addEventListener("navigate", (event) => {
  const { route, params, path, query } = event.detail;
  
  switch (route.name) {
    case "home":
      renderHomePage();
      break;
    case "user":
      renderUserPage(params.id);
      break;
    case "notFound":
      render404Page();
      break;
  }
});
```

## Advanced Usage

### Multiple Routers

You can run multiple routers with delegation:

```typescript
// Main router
const mainRouter = new Router(mainRoutes, {
  routerName: "main",
  delegateUnknown: true
});

// Admin router
const adminRouter = new Router(adminRoutes, {
  routerName: "admin",
  prefix: "/admin"
});
```

### Custom Context

Pass context data to hooks:

```typescript
const router = new Router(routes, {
  initialContext: {
    user: null,
    permissions: []
  }
});

// Update context
router.context = {
  user: currentUser,
  permissions: userPermissions
};
```

## TypeScript Support

The router is fully typed for better development experience:

```typescript
interface MyRouteConfig extends BaseRouteConfig {
  title?: string;
  requiresAuth?: boolean;
}

const routes: Record<string, MyRouteConfig> = {
  home: { path: "/", title: "Home" },
  admin: { path: "/admin", title: "Admin", requiresAuth: true }
};

const router = new Router<MyRouteConfig>(routes);
```
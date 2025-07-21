import { describe, it, expect } from "@inspatial/test";
import { Router } from "./declarative-router.ts";

// We need to access the private _match method for testing
// Add this utility to expose the method for testing purposes
function testMatch(router: Router, path: string, search = {}, hash = "") {
  return (router as any)._match(path, search, hash);
}

//======================================(MATCH)=======================================//
describe("Router _match function", () => {
  it("matches exact paths", () => {
    const router = new Router([
      { path: "/home", view: "HomeView" },
      { path: "/about", view: "AboutView" },
    ]);

    const matchHome = testMatch(router, "/home");
    expect(matchHome).not.toBeNull();
    expect(matchHome?.path).toBe("/home");
    expect(matchHome?.view).toBe("HomeView");
    expect(matchHome?.params).toEqual({});

    const matchAbout = testMatch(router, "/about");
    expect(matchAbout).not.toBeNull();
    expect(matchAbout?.view).toBe("AboutView");

    const noMatch = testMatch(router, "/contact");
    expect(noMatch).toBeNull();
  });

  it("matches paths with parameters", () => {
    const router = new Router([
      { path: "/users/{id}", view: "UserView" },
      { path: "/posts/{slug}", view: "PostView" },
    ]);

    const matchUser = testMatch(router, "/users/123");
    expect(matchUser).not.toBeNull();
    expect(matchUser?.path).toBe("/users/123");
    expect(matchUser?.view).toBe("UserView");
    expect(matchUser?.params).toEqual({ id: "123" });

    const matchPost = testMatch(router, "/posts/hello-world");
    expect(matchPost).not.toBeNull();
    expect(matchPost?.params).toEqual({ slug: "hello-world" });
  });

  it("matches paths with regex parameters", () => {
    const router = new Router([
      { path: "/users/{id:\\d+}", view: "UserView" },
      { path: "/posts/{year:\\d{4}}/{slug:[a-z-]+}", view: "PostView" },
    ]);

    const matchUser = testMatch(router, "/users/123");
    expect(matchUser).not.toBeNull();
    expect(matchUser?.params).toEqual({ id: "123" });

    const noMatchUser = testMatch(router, "/users/abc");
    expect(noMatchUser).toBeNull();

    const matchPost = testMatch(router, "/posts/2023/hello-world");
    expect(matchPost).not.toBeNull();
    expect(matchPost?.params).toEqual({ year: "2023", slug: "hello-world" });

    const noMatchPost = testMatch(router, "/posts/2023/Hello123");
    expect(noMatchPost).toBeNull();
  });

  it("matches catch-all routes", () => {
    const router = new Router([
      { path: "/home", view: "HomeView" },
      { path: "*", view: "NotFoundView" },
    ]);

    const matchHome = testMatch(router, "/home");
    expect(matchHome?.view).toBe("HomeView");

    const matchNotFound = testMatch(router, "/any/random/path");
    expect(matchNotFound).not.toBeNull();
    expect(matchNotFound?.view).toBe("NotFoundView");
    expect(matchNotFound?.params).toEqual({});
  });

  it("includes search parameters and hash in the match", () => {
    const router = new Router([{ path: "/search", view: "SearchView" }]);

    const search = { q: "test", filter: "recent" };
    const hash = "#results";

    const match = testMatch(router, "/search", search, hash);
    expect(match).not.toBeNull();
    expect(match?.search).toEqual(search);
    expect(match?.hash).toBe(hash);
  });

  it("respects route order for matching", () => {
    const router = new Router([
      { path: "/users/admin", view: "AdminView" },
      { path: "/users/{id}", view: "UserView" },
    ]);

    const matchAdmin = testMatch(router, "/users/admin");
    expect(matchAdmin?.view).toBe("AdminView");
    expect(matchAdmin?.params).toEqual({});

    const matchUser = testMatch(router, "/users/123");
    expect(matchUser?.view).toBe("UserView");
    expect(matchUser?.params).toEqual({ id: "123" });
  });

  it("returns null when no routes exist", () => {
    const router = new Router();
    const match = testMatch(router, "/some/path");
    expect(match).toBeNull();
  });

  it("handles multiple parameters in a single path", () => {
    const router = new Router([
      { path: "/blog/{category}/{year:\\d{4}}/{slug}", view: "BlogView" },
    ]);

    const match = testMatch(router, "/blog/tech/2023/javascript-updates");
    expect(match).not.toBeNull();
    expect(match?.params).toEqual({
      category: "tech",
      year: "2023",
      slug: "javascript-updates",
    });
  });
});

//======================================(ROUTER)=======================================//

describe("Router constructor", () => {
  it("creates a router with empty routes", () => {
    const router = new Router();
    expect(router).toBeInstanceOf(Router);
  });

  it("creates a router with valid routes", () => {
    const router = new Router([
      { path: "/", redirect: "/home" },
      { path: "/home", view: "HomeView" },
      { path: "/users/{id}", handler: () => true },
      { path: "/posts/{postId:\\d+}", view: "PostView" },
      { path: "*", view: "NotFoundView" },
    ]);

    expect(router).toBeInstanceOf(Router);
  });

  it("handles catch-all routes correctly", () => {
    const router = new Router([{ path: "*", view: "NotFoundView" }]);

    expect(router).toBeInstanceOf(Router);
  });

  it("accepts various parameter formats", () => {
    const router = new Router([
      { path: "/users/{id}", view: "UserView" },
      { path: "/posts/{slug:[a-z0-9-]+}", view: "PostView" },
      { path: "/products/{category}/{id:\\d+}", view: "ProductView" },
    ]);

    expect(router).toBeInstanceOf(Router);
  });

  it("throws an error for malformed paths", () => {
    expect(() => {
      new Router([{ path: "/invalid{param" }]);
    }).toThrow("Malformed path: /invalid{param");

    expect(() => {
      new Router([{ path: "/missing-closing}/brace" }]);
    }).toThrow();

    expect(() => {
      new Router([{ path: "no-leading-slash" }]);
    }).toThrow();
  });

  it("handles complex path patterns", () => {
    const router = new Router([
      {
        path: "/blog/{year:\\d{4}}/{month:\\d{2}}/{day:\\d{2}}/{slug:[a-z0-9-]+}",
        view: "BlogPostView",
      },
      {
        path: "/api/{version:\\d+}/resources/{resourceId:[a-f0-9-]+}",
        view: "ApiResourceView",
      },
    ]);

    expect(router).toBeInstanceOf(Router);
  });

  it("handles multiple routes with similar patterns", () => {
    const router = new Router([
      { path: "/users/{id}", view: "UserView" },
      { path: "/users/new", view: "NewUserView" },
      { path: "/users/{id}/edit", view: "EditUserView" },
    ]);

    expect(router).toBeInstanceOf(Router);
  });
});

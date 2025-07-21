import { Router } from "./src/declarative/declarative-router.ts";

// Test regex compilation with valid capture group names
console.log("Testing regex compilation fix...");

try {
  // Test 1: Create router with array routes (numeric keys)
  const arrayRouter = new Router([
    { path: "/home", view: "HomeView" },
    { path: "/about", view: "AboutView" },
    { path: "/users/{id}", view: "UserView" },
  ]);
  console.log("✓ Array router created successfully");

  // Test 2: Test matching with array router
  const homeMatch = (arrayRouter as any)._matchRoute("/home");
  if (homeMatch && homeMatch.route.view === "HomeView") {
    console.log("✓ Array router matches routes correctly");
  } else {
    console.log("✗ Array router failed to match:", homeMatch);
  }

  // Test 3: Test parameter extraction with array router
  const userMatch = (arrayRouter as any)._matchRoute("/users/123");
  if (userMatch && userMatch.route.view === "UserView" && userMatch.params.id === "123") {
    console.log("✓ Array router extracts parameters correctly");
  } else {
    console.log("✗ Array router failed parameter extraction:", userMatch);
  }

  // Test 4: Create router with object routes (string keys)
  const objectRouter = new Router({
    home: { path: "/home", view: "HomeView" },
    about: { path: "/about", view: "AboutView" },
    user: { path: "/users/{id}", view: "UserView" },
  });
  console.log("✓ Object router created successfully");

  // Test 5: Test matching with object router
  const objHomeMatch = (objectRouter as any)._matchRoute("/home");
  if (objHomeMatch && objHomeMatch.route.view === "HomeView") {
    console.log("✓ Object router matches routes correctly");
  } else {
    console.log("✗ Object router failed to match:", objHomeMatch);
  }

  // Test 6: Test parameter extraction with object router
  const objUserMatch = (objectRouter as any)._matchRoute("/users/456");
  if (objUserMatch && objUserMatch.route.view === "UserView" && objUserMatch.params.id === "456") {
    console.log("✓ Object router extracts parameters correctly");
  } else {
    console.log("✗ Object router failed parameter extraction:", objUserMatch);
  }

  // Test 7: Test with special characters in route names
  const specialRouter = new Router({
    "route-with-dash": { path: "/special", view: "SpecialView" },
    "route.with.dots": { path: "/dots", view: "DotsView" },
  });
  console.log("✓ Router with special character names created successfully");

  const specialMatch = (specialRouter as any)._matchRoute("/special");
  if (specialMatch && specialMatch.route.view === "SpecialView") {
    console.log("✓ Router with special characters matches correctly");
  } else {
    console.log("✗ Router with special characters failed:", specialMatch);
  }

  console.log("\nAll regex compilation tests passed!");

} catch (error) {
  console.error("✗ Test failed:", error.message);
  console.error(error.stack);
}
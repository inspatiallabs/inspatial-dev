/** A guide to writing tests that describe how your code should behave
 *
 * This library helps you write tests that read like plain English, making it easier
 * for everyone on your team (including non-programmers) to understand what your
 * code should do.
 *
 * ##### Terminology: Behavior-Driven Development (BDD)
 * BDD is a way of writing tests that focus on describing how your code should behave
 * from a user's perspective, using simple, everyday language.
 *
 * ## Writing BDD Tests
 *
 * In BDD, we write tests using a simple pattern:
 * - Given: The starting situation
 * - When: Something happens
 * - Then: What should happen as a result
 *
 * Here's a simple example of testing a shopping cart:
 *
 * ```ts
 * import { test, expect } from "@inspatial/test";
 *
 * class ShoppingCart {
 *   items = [];
 *
 *   addItem(item) {
 *     this.items.push(item);
 *   }
 *
 *   getTotal() {
 *     return this.items.reduce((sum, item) => sum + item.price, 0);
 *   }
 * }
 *
 * test({
 *   name: "Shopping cart should calculate total correctly",
 *   fn: () => {
 *     // Given a shopping cart
 *     const cart = new ShoppingCart();
 *
 *     // When we add items
 *     cart.addItem({ name: "Book", price: 10 });
 *     cart.addItem({ name: "Pen", price: 2 });
 *
 *     // Then the total should be correct
 *     expect(cart.getTotal()).toBe(12);
 *   }
 * });
 * ```
 *
 * ##### NOTE: Writing Good Test Names
 * In BDD, test names should be complete sentences that describe the expected
 * behavior. They often start with "should" and focus on what the code does, not
 * how it does it.
 *
 * ## Using Feature Files
 *
 * For bigger projects, we can write our tests in special files called "feature
 * files" that use everyday language. Here's what they look like:
 *
 * ```gherkin
 * Feature: Shopping Cart
 *   As a customer
 *   I want to add items to my cart
 *   So that I can buy multiple items at once
 *
 *   Scenario: Adding items to cart
 *     Given an empty shopping cart
 *     When I add a book that costs $10
 *     And I add a pen that costs $2
 *     Then the total should be $12
 * ```
 *
 * And here's how we implement those tests:
 *
 * ```ts
 * import { test, expect } from "@inspatial/test";
 *
 * test({
 *   name: "Feature: Shopping Cart - Adding items",
 *   fn: () => {
 *     let cart;
 *
 *     // Given an empty shopping cart
 *     beforeEach(() => {
 *       cart = new ShoppingCart();
 *     });
 *
 *     // When I add items
 *     cart.addItem({ name: "Book", price: 10 });
 *     cart.addItem({ name: "Pen", price: 2 });
 *
 *     // Then the total should be correct
 *     expect(cart.getTotal()).toBe(12);
 *   }
 * });
 * ```
 *
 * ## The Three Amigos
 *
 * BDD works best when three types of team members work together:
 * 1. Business people (who know what the software needs to do)
 * 2. Developers (who write the code)
 * 3. Testers (who make sure it works correctly)
 *
 * When these three groups work together to write tests, they help ensure everyone
 * understands what needs to be built.
 *
 * ### Test Examples
 *
 * #### Using Assert Syntax
 * ```ts
 * import { test, assert } from "@inspatial/test";
 *
 * test({
 *   name: "Cart should handle empty state correctly",
 *   fn: () => {
 *     const cart = new ShoppingCart();
 *     assert.equal(cart.getTotal(), 0);
 *   }
 * });
 * ```
 *
 * #### Using Expect Syntax (Alternative)
 * ```ts
 * import { test, expect } from "@inspatial/test";
 *
 * test({
 *   name: "Cart should handle empty state correctly",
 *   fn: () => {
 *     const cart = new ShoppingCart();
 *     expect(cart.getTotal()).toBe(0);
 *   }
 * });
 * ```
 *
 * ##### NOTE: Choosing Test Styles
 * Both assert and expect styles work well for BDD. Choose the one that reads more
 * naturally to your team. The expect style is often preferred because it reads more
 * like plain English.
 *
 * @module
 */

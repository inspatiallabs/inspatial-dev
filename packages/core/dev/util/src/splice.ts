/**
 * @module @inspatial/util/splice
 *
 * Array manipulation utilities for finding and splicing elements with flexible comparison options.
 * These utilities help you work with arrays more effectively by providing enhanced search and modification capabilities.
 *
 * @example Basic Usage
 * ```typescript
 * import { findWhere, splice } from "@inspatial/util/splice.ts";
 *
 * const users = [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }];
 * const bob = findWhere(users, user => user.id === 2, false, false);
 * ```
 *
 * @features
 * - Find elements by value or predicate function
 * - Optionally return index or value
 * - Splice arrays with integrated search capabilities
 * - Support for value equality or custom predicate functions
 */

/**
 * # FindWhere
 * @summary Searches through an array and returns an element or its index
 *
 * The `findWhere` function helps you search through any array to find a specific element.
 * Think of it like a detective that searches through a line of people to find someone matching
 * your description - it can either tell you who the person is, or where they're standing in line.
 *
 * @since 0.1.9
 * @category InSpatial Util
 * @kind function
 * @access public
 *
 * ### 💡 Core Concepts
 * - Searches arrays from end to beginning (right to left)
 * - Can search by exact value or by using a test function
 * - Can return either the found item or its position (index)
 *
 * @typeParam T - The type of elements in the array
 *
 * @param {T[]} arr - Stores the array to search through
 * @param {T | ((val: T) => boolean)} fn - Provides either a value to match exactly (when byValue is true)
 *    or a function that tests each element (when byValue is false)
 * @param {boolean} returnIndex - Determines whether to return the matching element's index (true)
 *    or the matching element itself (false)
 * @param {boolean} byValue - Determines whether to compare elements directly to fn (true)
 *    or call fn as a function to test each element (false)
 *
 * @returns {T | number | undefined} Either the found item, its index, or undefined if nothing was found
 *
 * @example
 * ### Example 1: Finding a User by ID
 * ```typescript
 * // Let's say we have a list of users
 * const users = [
 *   { id: 1, name: "Eli" },
 *   { id: 2, name: "Ben" },
 *   { id: 3, name: "Mike" }
 * ];
 *
 * // We want to find Ben by testing each user's ID
 * const ben = findWhere(users, user => user.id === 2, false, false);
 * console.log(ben); // Output: { id: 2, name: "Ben" }
 *
 * // Or maybe we want to know Ben's position in the array
 * const benIndex = findWhere(users, user => user.id === 2, true, false);
 * console.log(benIndex); // Output: 1 (because Ben is at index 1)
 * ```
 *
 * @example
 * ### Example 2: Finding a Value Directly
 * ```typescript
 * // Let's work with a simple array of numbers
 * const numbers = [5, 10, 15, 20, 25];
 *
 * // We can find a number by direct value comparison
 * const foundValue = findWhere(numbers, 15, false, true);
 * console.log(foundValue); // Output: 15
 *
 * // Or we can find its index
 * const foundIndex = findWhere(numbers, 15, true, true);
 * console.log(foundIndex); // Output: 2 (because 15 is at index 2)
 *
 * // If the value isn't in the array, we'll get undefined
 * const notFound = findWhere(numbers, 100, false, true);
 * console.log(notFound); // Output: undefined
 * ```
 */
export function findWhere<T>(
  arr: T[],
  fn: (item: T, index: number, arr: T[]) => boolean,
  all = true,
  fromRight = false
): T | T[] | undefined {
  const results: T[] = [];

  if (fromRight) {
    for (let i = arr.length - 1; i >= 0; i--) {
      if (fn(arr[i], i, arr)) {
        if (!all) return arr[i];
        results.push(arr[i]);
      }
    }
  } else {
    for (let i = 0; i < arr.length; i++) {
      if (fn(arr[i], i, arr)) {
        if (!all) return arr[i];
        results.push(arr[i]);
      }
    }
  }

  return all ? results : undefined;
}

/**
 * # Splice
 * @summary Finds and modifies an array by adding or removing elements
 *
 * The `splice` function lets you find a specific item in an array and then either
 * remove it or insert a new item at that position. Think of it like editing a
 * shopping list - you can either cross off an item or add a new one in a specific spot.
 *
 * @since 0.1.9
 * @category InSpatial Util
 * @kind function
 * @access public
 *
 * ### 💡 Core Concepts
 * - First finds the position of an element in the array
 * - Can then remove that element or insert a new one at that position
 * - Uses the findWhere function internally to locate elements
 *
 * @typeParam T - The type of elements in the array
 *
 * @param {T[] | undefined} arr - Holds the array to modify (or undefined)
 * @param {T | ((val: T) => boolean)} item - Specifies either a value to find (when byValue is true)
 *    or a function that tests each element (when byValue is false)
 * @param {T | undefined} add - Provides an optional element to add at the found position.
 *    If not provided, the found element will be removed instead
 * @param {boolean | undefined} byValue - Determines whether to compare elements directly to item (true)
 *    or call item as a function to test each element (false)
 *
 * @returns {number} The index where the operation was performed, or -1 if the item wasn't found
 *
 * @example
 * ### Example 1: Removing an Item from a Shopping List
 * ```typescript
 * // Let's create a shopping list
 * const shoppingList = ["apples", "bananas", "milk", "bread"];
 *
 * // We've already bought milk, so let's remove it
 * splice(shoppingList, "milk", undefined, true);
 * console.log(shoppingList); // Output: ["apples", "bananas", "bread"]
 * ```
 *
 * @example
 * ### Example 2: Inserting an Item at a Specific Position
 * ```typescript
 * // Let's organize a list of tasks by priority
 * const tasks = [
 *   { priority: 1, task: "Answer emails" },
 *   { priority: 3, task: "Write report" }
 * ];
 *
 * // We need to insert a medium priority task after priority 1
 * const newTask = { priority: 2, task: "Team meeting" };
 *
 * // First find the priority 1 task, then insert the new task
 * splice(tasks, task => task.priority === 1, newTask, false);
 *
 * console.log(tasks);
 * // Output: [
 * //   { priority: 1, task: "Answer emails" },
 * //   { priority: 2, task: "Team meeting" },
 * //   { priority: 3, task: "Write report" }
 * // ]
 * ```
 */
export function splice<T>(
  arr: T[],
  fn: (item: T, index: number, arr: T[]) => boolean,
  all = true,
  fromRight = false
): T[] {
  const removed: T[] = [];

  if (fromRight) {
    for (let i = arr.length - 1; i >= 0; i--) {
      if (fn(arr[i], i, arr)) {
        removed.push(...arr.splice(i, 1));
        if (!all) break;
      }
    }
  } else {
    for (let i = 0; i < arr.length; i++) {
      if (fn(arr[i], i, arr)) {
        removed.push(...arr.splice(i, 1));
        i -= 1;
        if (!all) break;
      }
    }
  }

  return removed;
}

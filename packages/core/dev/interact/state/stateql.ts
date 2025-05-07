/**
 * # StateQL
 * @summary #### Template literal syntax for state updates
 * 
 * StateQL provides a powerful, expressive syntax for state updates using
 * template literals. This allows for more natural, code-like updates.
 * 
 * @since 1.0.0
 * @category InSpatial State
 * @module @inspatial/state
 * @kind module
 * @access public
 */

import type { StateInstanceType, StateQLInstanceType } from "./types";

/**
 * Operation types supported in StateQL
 */
enum OperationType {
  ASSIGN = "=",
  ADD = "+=",
  SUBTRACT = "-=",
  MULTIPLY = "*=",
  DIVIDE = "/=",
  PUSH = "push",
  POP = "pop",
  SHIFT = "shift",
  UNSHIFT = "unshift",
  SPLICE = "splice",
  IF = "if",
  ELSE = "else"
}

/**
 * Parsed operation from a template literal
 */
interface Operation {
  path: string[];
  operator: OperationType;
  value: any;
  condition?: {
    test: (state: any) => boolean;
    thenOps: Operation[];
    elseOps?: Operation[];
  };
}

/**
 * Parse a template literal into operations
 * 
 * @param strings Template strings
 * @param values Interpolated values
 * @returns Array of operations to perform
 */
function parseTemplate(strings: TemplateStringsArray, values: any[]): Operation[] {
  const operations: Operation[] = [];
  let fullString = '';
  
  // Combine strings and values into single string
  for (let i = 0; i < strings.length; i++) {
    fullString += strings[i];
    if (i < values.length) {
      fullString += `__VALUE_${i}__`;
    }
  }
  
  // Split by commas outside of statements
  const statements = splitStatements(fullString);
  
  for (const statement of statements) {
    if (statement.trim().startsWith('if ')) {
      // Parse conditional statement
      const ifOperation = parseConditional(statement, values);
      if (ifOperation) {
        operations.push(ifOperation);
      }
    } else {
      // Parse assignment statement
      const operation = parseOperation(statement, values);
      if (operation) {
        operations.push(operation);
      }
    }
  }
  
  return operations;
}

/**
 * Split a template string into individual statements
 */
function splitStatements(template: string): string[] {
  const statements: string[] = [];
  let currentStatement = '';
  let braceCount = 0;
  
  for (let i = 0; i < template.length; i++) {
    const char = template[i];
    
    if (char === '{') {
      braceCount++;
      currentStatement += char;
    } else if (char === '}') {
      braceCount--;
      currentStatement += char;
    } else if (char === ',' && braceCount === 0) {
      // Only split on commas outside of braces
      statements.push(currentStatement.trim());
      currentStatement = '';
    } else {
      currentStatement += char;
    }
  }
  
  if (currentStatement.trim()) {
    statements.push(currentStatement.trim());
  }
  
  return statements;
}

/**
 * Parse a conditional operation
 */
function parseConditional(statement: string, values: any[]): Operation | null {
  // Extract condition part: if (condition) { ... } else { ... }
  const conditionMatch = statement.match(/if\s*\((.*?)\)\s*\{(.*?)\}(?:\s*else\s*\{(.*?)\})?/s);
  if (!conditionMatch) return null;
  
  const [, condition, thenBlock, elseBlock] = conditionMatch;
  
  // Replace value placeholders in condition
  const conditionWithValues = replaceValues(condition, values);
  
  // Parse the operations in the 'then' block
  const thenStatements = splitStatements(thenBlock);
  const thenOps: Operation[] = [];
  
  for (const stmt of thenStatements) {
    const op = parseOperation(stmt, values);
    if (op) thenOps.push(op);
  }
  
  // Parse the operations in the 'else' block (if any)
  const elseOps: Operation[] = [];
  if (elseBlock) {
    const elseStatements = splitStatements(elseBlock);
    for (const stmt of elseStatements) {
      const op = parseOperation(stmt, values);
      if (op) elseOps.push(op);
    }
  }
  
  // Create a function that evaluates the condition
  // eslint-disable-next-line no-new-func
  const testFn = new Function('state', `return ${conditionWithValues};`);
  
  return {
    path: [],
    operator: OperationType.IF,
    value: null,
    condition: {
      test: testFn,
      thenOps,
      elseOps: elseOps.length > 0 ? elseOps : undefined
    }
  };
}

/**
 * Parse a single operation from a statement
 */
function parseOperation(statement: string, values: any[]): Operation | null {
  // Simple assignment: path = value
  const assignMatch = statement.match(/^\s*([\w.[\]]+)\s*(=|\+=|-=|\*=|\/=)\s*(.+)\s*$/);
  if (assignMatch) {
    const [, path, operator, rawValue] = assignMatch;
    const value = parseValue(rawValue, values);
    
    return {
      path: parsePath(path),
      operator: operator as OperationType,
      value
    };
  }
  
  // Array operations: array.push(value)
  const arrayOpMatch = statement.match(/^\s*([\w.[\]]+)\.(push|pop|shift|unshift|splice)\((.*)\)\s*$/);
  if (arrayOpMatch) {
    const [, path, method, args] = arrayOpMatch;
    const parsedArgs = args ? args.split(',').map(arg => parseValue(arg.trim(), values)) : [];
    
    return {
      path: parsePath(path),
      operator: method as OperationType,
      value: parsedArgs
    };
  }
  
  return null;
}

/**
 * Parse a path string into an array of path segments
 */
function parsePath(pathStr: string): string[] {
  // Handle bracket notation: items[0].name -> ["items", "0", "name"]
  const segments: string[] = [];
  let currentSegment = '';
  let inBracket = false;
  
  for (let i = 0; i < pathStr.length; i++) {
    const char = pathStr[i];
    
    if (char === '.' && !inBracket) {
      if (currentSegment) {
        segments.push(currentSegment);
        currentSegment = '';
      }
    } else if (char === '[') {
      if (currentSegment) {
        segments.push(currentSegment);
        currentSegment = '';
      }
      inBracket = true;
    } else if (char === ']') {
      if (currentSegment) {
        segments.push(currentSegment);
        currentSegment = '';
      }
      inBracket = false;
    } else {
      currentSegment += char;
    }
  }
  
  if (currentSegment) {
    segments.push(currentSegment);
  }
  
  return segments;
}

/**
 * Parse a value string, replacing value placeholders
 */
function parseValue(valueStr: string, values: any[]): any {
  // Check for value placeholders: __VALUE_0__, __VALUE_1__, etc.
  const valuePlaceholder = valueStr.match(/__VALUE_(\d+)__/);
  if (valuePlaceholder) {
    const valueIndex = parseInt(valuePlaceholder[1], 10);
    return values[valueIndex];
  }
  
  // Check for boolean values
  if (valueStr === 'true') return true;
  if (valueStr === 'false') return false;
  
  // Check for number values
  if (!isNaN(Number(valueStr))) return Number(valueStr);
  
  // Check for null/undefined
  if (valueStr === 'null') return null;
  if (valueStr === 'undefined') return undefined;
  
  // Handle string literals (with quotes)
  if ((valueStr.startsWith('"') && valueStr.endsWith('"')) || 
      (valueStr.startsWith("'") && valueStr.endsWith("'"))) {
    return valueStr.slice(1, -1);
  }
  
  // Replace all value placeholders in complex expressions
  return replaceValues(valueStr, values);
}

/**
 * Replace all value placeholders in a string
 */
function replaceValues(str: string, values: any[]): string {
  let result = str;
  const placeholderRegex = /__VALUE_(\d+)__/g;
  let match;
  
  while ((match = placeholderRegex.exec(str)) !== null) {
    const valueIndex = parseInt(match[1], 10);
    const value = values[valueIndex];
    
    // Format the value properly for inclusion in a string expression
    let formattedValue;
    if (typeof value === 'string') {
      formattedValue = `"${value.replace(/"/g, '\\"')}"`;
    } else if (value === null) {
      formattedValue = 'null';
    } else if (value === undefined) {
      formattedValue = 'undefined';
    } else if (typeof value === 'object') {
      formattedValue = JSON.stringify(value);
    } else {
      formattedValue = String(value);
    }
    
    result = result.replace(match[0], formattedValue);
  }
  
  return result;
}

/**
 * Apply operations to a state object
 * 
 * @param state Current state
 * @param operations Operations to apply
 * @returns Updated state
 */
function applyOperations<T extends object>(state: T, operations: Operation[]): T {
  // Create a copy of the state
  const newState = { ...state };
  
  for (const op of operations) {
    if (op.operator === OperationType.IF && op.condition) {
      // Handle conditional operations
      if (op.condition.test(newState)) {
        applyOperations(newState, op.condition.thenOps);
      } else if (op.condition.elseOps) {
        applyOperations(newState, op.condition.elseOps);
      }
      continue;
    }
    
    // Get the target object and property for the operation
    const { target, prop } = getTargetAndProp(newState, op.path);
    
    if (!target) continue;
    
    // Apply the operation
    switch (op.operator) {
      case OperationType.ASSIGN:
        target[prop] = op.value;
        break;
      
      case OperationType.ADD:
        target[prop] += op.value;
        break;
      
      case OperationType.SUBTRACT:
        target[prop] -= op.value;
        break;
      
      case OperationType.MULTIPLY:
        target[prop] *= op.value;
        break;
      
      case OperationType.DIVIDE:
        target[prop] /= op.value;
        break;
      
      case OperationType.PUSH:
        if (Array.isArray(target[prop])) {
          target[prop].push(...op.value);
        }
        break;
      
      case OperationType.POP:
        if (Array.isArray(target[prop])) {
          target[prop].pop();
        }
        break;
      
      case OperationType.SHIFT:
        if (Array.isArray(target[prop])) {
          target[prop].shift();
        }
        break;
      
      case OperationType.UNSHIFT:
        if (Array.isArray(target[prop])) {
          target[prop].unshift(...op.value);
        }
        break;
      
      case OperationType.SPLICE:
        if (Array.isArray(target[prop])) {
          target[prop].splice(...op.value);
        }
        break;
    }
  }
  
  return newState;
}

/**
 * Get the target object and property for a path
 */
function getTargetAndProp(obj: any, path: string[]): { target: any; prop: string } {
  if (path.length === 0) return { target: null, prop: '' };
  
  let current = obj;
  
  // Navigate to the target object
  for (let i = 0; i < path.length - 1; i++) {
    if (current === null || current === undefined) {
      return { target: null, prop: '' };
    }
    
    const segment = path[i];
    
    // Create objects for missing path segments
    if (current[segment] === undefined) {
      current[segment] = {};
    }
    
    current = current[segment];
  }
  
  return { target: current, prop: path[path.length - 1] };
}

/**
 * Enhance a state instance with StateQL template literal support
 * 
 * @param state The state instance to enhance
 * @returns A state instance with StateQL support
 * 
 * @example
 * ```typescript
 * const playerState = stateQL(createState({
 *   initialState: { health: 100, mana: 50 }
 * }));
 * 
 * // Now you can use template literals for updates
 * playerState.update`health -= 10, mana -= 5`;
 * 
 * // Conditional updates
 * playerState.update`
 *   if (health < 20) {
 *     health += 10,
 *     status = "healing"
 *   } else {
 *     status = "normal"
 *   }
 * `;
 * 
 * // Array operations
 * playerState.update`effects.push(${newEffect})`;
 * ```
 */
export function stateQL<T extends object>(state: StateInstanceType<T>): StateQLInstanceType<T> {
  // Create the enhanced update method with template literal support
  const templateUpdate = (strings: TemplateStringsArray, ...values: any[]) => {
    // Parse the template into operations
    const operations = parseTemplate(strings, values);
    
    // Apply the operations to get the new state
    const currentState = state.get();
    const newState = applyOperations(currentState, operations);
    
    // Update the state
    state.update(newState);
  };
  
  // Create the StateQL instance by extending the original state
  const stateQLInstance = Object.create(state) as StateQLInstanceType<T>;
  
  // Override the update method to handle both normal updates and template literals
  const originalUpdate = state.update;
  
  stateQLInstance.update = function(this: any, arg1: any, ...rest: any[]) {
    // Check if this is a template literal update
    if (Array.isArray(arg1) && 'raw' in arg1) {
      return templateUpdate(arg1 as TemplateStringsArray, ...rest);
    }
    
    // Otherwise, use the original update method
    return originalUpdate.call(this, arg1, ...rest);
  };
  
  return stateQLInstance;
}

/**
 * Create a new state with StateQL support
 * 
 * @param config The state configuration
 * @param options Additional options for state creation
 * @returns A state instance with StateQL support
 * 
 * @example
 * ```typescript
 * import { createStateQL } from '@inspatial/state';
 * 
 * const playerState = createStateQL({
 *   initialState: { health: 100, mana: 50 }
 * });
 * 
 * // Use template literals for updates
 * playerState.update`health -= ${damageAmount}`;
 * ```
 */
export function createStateQL<T extends object>(
  config: import('./types').StateConfigType<T>,
  options?: import('./types').StateOptionsType
): StateQLInstanceType<T> {
  // Use the regular createState function and enhance with StateQL
  return stateQL(require('./state').createState(config, options));
} 
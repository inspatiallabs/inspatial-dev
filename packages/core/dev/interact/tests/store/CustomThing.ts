/**
 * CustomThing - A test class for store tests
 * 
 * This class is used in store tests to verify that objects with custom
 * classes are properly handled by the store.
 */
export class CustomThing {
  a: number;
  b: number;
  
  constructor(value: number) {
    this.a = value;
    this.b = 10;
  }
  
  getValue(): number {
    return this.a;
  }
  
  setValue(value: number): void {
    this.a = value;
  }
  
  increment(): void {
    this.a++;
  }
  
  toString(): string {
    return `CustomThing(${this.a})`;
  }
} 
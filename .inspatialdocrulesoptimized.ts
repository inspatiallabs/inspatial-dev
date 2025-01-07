# InSpatial Documentation Requirements

## Core Principles
1. Write for complete beginners
2. Use natural, conversational language
3. Avoid technical jargon unless necessary
4. Maintain consistent formatting
5. Provide comprehensive examples

## Required Tags
| Tag | Requirement | Description |
|-----|-------------|-------------|
| @summary | Always | One-line description |
| @since | Always | Get from getPackageVersion() |
| @category | Always | Format: "InSpatial {Package}" |
| @access | Always | Defaults to public |
| @kind | Always | Symbol type (function, class, etc.) |
| @module | Always | Package module name |

## Symbol Categories and Complexity Levels

### Complexity Determination Matrix
```typescript
type ComplexityLevel = 'Basic' | 'Moderate' | 'Complex';

interface ComplexityMetrics {
  params: number;        // Number of parameters
  configurations: number;// Number of possible configurations
  edgeCases: number;    // Number of edge cases to handle
  usagePatterns: number;// Number of different usage patterns
}

const determineComplexity = (metrics: ComplexityMetrics): ComplexityLevel => {
  const score = 
    metrics.params + 
    metrics.configurations * 2 + 
    metrics.edgeCases * 1.5 + 
    metrics.usagePatterns;
    
  if (score <= 5) return 'Basic';
  if (score <= 12) return 'Moderate';
  return 'Complex';
};
```

### Documentation Requirements by Complexity

#### Basic (Score ≤ 5)
- Explanation: 50-100 words
- Examples: 2 minimum
- Structure:
  1. One-line summary
  2. Real-world analogy
  3. Basic usage
  4. Common case

#### Moderate (Score ≤ 12)
- Explanation: 150-300 words
- Examples: 2-5
- Structure:
  1. Summary
  2. Extended analogy
  3. Key features
  4. Common scenarios
  5. Considerations

#### Complex (Score > 12)
- Explanation: 400-1000 words
- Examples: 5-10
- Structure:
  1. Executive summary
  2. Detailed analogy
  3. Core concepts
  4. Features
  5. Scenarios
  6. Considerations
  7. Pitfalls
  8. Best practices

## Special Section Requirements

### Terminology and Notes
- Use `Terminology: ...` for industry terms
- Use `NOTE: ...` for additional explanations
- Both should use accordion UI (details/summary)

### Examples
- Must use TypeScript
- Must start simple, increase complexity
- Must include real-world analogies
- Must use direct imports:
  ```typescript
  import { name } from '@inspatial/package/function.ts';
  ```

### Performance (Optional)
Include if symbol is:
- Performance-critical
- Has optimization opportunities
- Affects runtime behavior

### Core Package Categories
```typescript
type InSpatialPackage = {
  name: string;
  category: string;
  description: string;
};

const PACKAGES: InSpatialPackage[] = [
  {
    name: '@inspatial/util',
    category: 'InSpatial Util',
    description: 'Utility functions'
  },
  // Add other packages...
];
```

## Documentation Template Structure
```typescript
/**
 * # [Symbol Name]
 * @summary #### [Clear one-line description]
 * 
 * [Natural language explanation with real-world analogy]
 * 
 * @since ${await getPackageVersion()}
 * @category [InSpatial Package]
 * @module [ModuleName]
 * @kind [symbol type]
 * @access [public|private|protected]
 * 
 * ### 💡 Core Concepts
 * [Core concept explanation]
 * 
 * ### 📚 Terminology
 * [Terms and definitions]
 * 
 * ### Examples
 * [2-10 examples based on complexity]
 * 
 * ### Additional Sections
 * [Based on symbol requirements]
 */
```

## Documentation Checklist
1. [ ] Determined symbol complexity
2. [ ] Added all required tags
3. [ ] Included minimum examples
4. [ ] Used proper importing pattern
5. [ ] Added appropriate special sections
6. [ ] Verified formatting
7. [ ] Checked language for beginner-friendliness

## Version Management
```typescript
const getPackageVersion = async (): Promise<string> => {
  // Implementation from @inspatial/util/getPackageVersion
};
```
# VEF (Vue-inspired Templating) Specification
**Version**: 1.0.0  
**Target**: InSpatial Run Framework  
**Approach**: Runtime-based (no compilation required)

## Overview

VEF provides a Vue-like templating experience as an alternative authoring style for InSpatial Run components. Unlike traditional template compilers, VEF processes templates at runtime, allowing developers to use familiar `.tsx`/`.jsx` files without additional build complexity.

## Core Philosophy

- **One Framework, Two Styles**: JSX and VEF coexist seamlessly
- **Runtime Processing**: No compilation step required
- **Unified APIs**: Same components work in both authoring styles
- **Progressive Adoption**: Mix JSX and VEF in the same project
- **Zero Mental Overhead**: Minimal differences between approaches

## Core Components

### 1. Template Component

**Location**: `src/kit/control-flow/template/index.ts`

**Dual Purpose**:
- **JSX Mode**: Acts as Fragment (when no `vef` prop)
- **VEF Mode**: Processes template syntax (when `vef` prop present)

```typescript
interface TemplateProps {
  vef?: boolean;           // Enable VEF processing
  children?: any;          // Template content or JSX children
  [key: string]: any;      // Additional props passed to template context
}
```

### 2. Script Component

**Location**: `src/kit/control-flow/script/index.ts`

**Multi-purpose Component**:
1. **Component Logic**: Setup functions and reactive state
2. **External Scripts**: Load third-party libraries
3. **Inline Scripts**: Custom JavaScript execution

```typescript
interface ScriptProps {
  // Component Logic Mode
  setup?: boolean;                    // Enable setup script mode
  type?: 'component' | 'external' | 'inline';
  
  // External Script Mode
  src?: string;                       // Script URL
  defer?: boolean;                    // Defer loading
  async?: boolean;                    // Async loading
  strategy?: 'blocking' | 'defer' | 'async';
  'on:load'?: () => void;            // Load callback
  'on:error'?: (error: Error) => void; // Error callback
  
  // Inline Script Mode
  children?: string;                  // Inline script content
  
  // Component setup return value
  default?: ComponentSetup;
}

interface ComponentSetup {
  props?: PropsDefinition;
  setup(props: any, context: SetupContext): SetupResult;
}
```

### 3. Slot Component

**Location**: `src/kit/control-flow/slot/index.ts`

**Universal Slot System**:
```typescript
interface SlotProps {
  name?: string;           // Slot name ('default' if not specified)
  fallback?: any;         // Fallback content when slot is empty
  props?: any;            // Props to pass to slot content (scoped slots)
}

// Slot content definition helper
interface SlotContentProps {
  slot: string;           // Target slot name
  'slot-props'?: string;  // Destructured props for scoped slots
}
```

## VEF Template Syntax

### 1. Interpolation (VEF Mode Only)

Text interpolation with reactive expressions:

```html
<!-- Basic interpolation -->
<span>{{ message }}</span>

<!-- Expression interpolation -->
<span>{{ count * 2 }}</span>

<!-- Method calls -->
<span>{{ formatDate(date) }}</span>

<!-- Conditional interpolation -->
<span>{{ isLoggedIn ? 'Welcome!' : 'Please login' }}</span>
```

### 2. Attribute Binding

Dynamic attribute binding with `:` or `bind:` prefix:

```html
<!-- Basic binding -->
<img :src="imageUrl" :alt="imageAlt">

<!-- Object-style class binding -->
<div :class="{ active: isActive, error: hasError }">

<!-- Array-style class binding -->
<div :class="['btn', isActive && 'active']">

<!-- Style object binding -->
<div :style="{ color: textColor, fontSize: size + 'px' }">

<!-- Spread attributes -->
<div :="spreadAttributes">

<!-- Boolean attributes -->
<input :disabled="isDisabled" :required="isRequired">
```

### 3. Event Handling

Consistent `on:` syntax for all events:

```html
<!-- Method handlers -->
<button on:click="increment">+</button>

<!-- Inline handlers -->
<button on:click="count++">+</button>

<!-- Event with parameters -->
<button on:click="increment(5)">+5</button>

<!-- Event modifiers -->
<form on:submit.prevent="handleSubmit">
<input on:keyup.enter="submit">
<input on:keyup.esc="cancel">

<!-- Multiple event handlers -->
<div on:click="onClick" on:mouseover="onHover">

<!-- Event object access -->
<button on:click="handleClick($event)">Click me</button>
```

#### Event Modifiers

- `.prevent` - `event.preventDefault()`
- `.stop` - `event.stopPropagation()`
- `.self` - Only trigger if event target is element itself
- `.once` - Trigger handler at most once
- `.passive` - Passive event listener

Key modifiers:
- `.enter`, `.tab`, `.delete`, `.esc`, `.space`, `.up`, `.down`, `.left`, `.right`
- `.ctrl`, `.alt`, `.shift`, `.meta`

### 4. Two-way Binding

Model binding with `model:` prefix:

```html
<!-- Input binding -->
<input model:value="message">

<!-- Checkbox binding -->
<input type="checkbox" model:checked="isChecked">

<!-- Select binding -->
<select model:value="selected">
  <option value="a">Option A</option>
  <option value="b">Option B</option>
</select>

<!-- Custom component binding -->
<CustomInput model:modelValue="searchText">

<!-- Multiple models -->
<RangeSlider model:min="minValue" model:max="maxValue">
```

### 5. Control Flow Integration

Use existing InSpatial control flow components within VEF templates:

```html
<Template vef>
  <!-- Conditional rendering -->
  <If condition="isLoggedIn">
    <p>Welcome back, {{ username }}!</p>
  </If>
  
  <If condition="isLoading">
    <p>Loading...</p>
    <Else>
      <div>Content loaded!</div>
    </Else>
  </If>
  
  <!-- List rendering -->
  <List each="items" track="id">
    <li>{{ item.name }} - {{ item.description }}</li>
  </List>
  
  <!-- Dynamic components -->
  <Dynamic :is="currentComponent" :props="componentProps" />
  
  <!-- Async components -->
  <Async :future="loadComponent()" fallback="Loading component...">
    <template slot="default" slot-props="{ result }">
      <Dynamic :is="result" />
    </template>
  </Async>
</Template>
```

### 6. Slot System

#### Providing Slots

```html
<!-- Slot provider component -->
<Template vef>
  <div class="card">
    <div class="card-header">
      <Slot name="header" fallback="Default Header" />
    </div>
    <div class="card-body">
      <Slot />  <!-- default slot -->
    </div>
    <div class="card-footer">
      <Slot name="footer" />
    </div>
  </div>
</Template>
```

#### Consuming Slots

```html
<!-- Slot consumer -->
<Card>
  <template slot="header">
    <h2>{{ cardTitle }}</h2>
  </template>
  
  <p>This goes in the default slot</p>
  <p>{{ cardContent }}</p>
  
  <template slot="footer">
    <button on:click="saveCard">Save</button>
  </template>
</Card>
```

#### Scoped Slots

```html
<!-- Provider with scoped slot -->
<List :items="items">
  <template slot="item" slot-props="{ item, index }">
    <span>{{ index + 1 }}. {{ item.name }}</span>
    <button on:click="editItem(item)">Edit</button>
  </template>
</List>

<!-- Alternative destructuring syntax -->
<List :items="items">
  <template slot="item" slot-props="{ item: currentItem, index: i }">
    <span>{{ i + 1 }}. {{ currentItem.name }}</span>
  </template>
</List>
```

## Component Authoring Patterns

### 1. VEF Single File Component

```tsx
// counter.tsx
import { $, Template, Script } from '@inspatial/run';

export default function Counter({ initialCount = 0 }) {
  return (
    <>
      <Script setup>
        {`
          const count = $(initialCount);
          const increment = () => count.value++;
          const decrement = () => count.value--;
          const reset = () => count.value = initialCount;
        `}
      </Script>
      
      <Template vef>
        <div class="counter">
          <h1>Counter: {{ count }}</h1>
          <div class="controls">
            <button on:click="decrement">-</button>
            <button on:click="reset">Reset</button>
            <button on:click="increment">+</button>
          </div>
        </div>
      </Template>
    </>
  );
}
```

### 2. VEF with External Logic

```tsx
// user-profile.tsx
import { $, Template, Script } from '@inspatial/run';

const userSetup = {
  props: {
    userId: { type: String, required: true }
  },
  setup(props) {
    const user = $(null);
    const loading = $(true);
    
    const loadUser = async () => {
      loading.value = true;
      try {
        user.value = await fetchUser(props.userId);
      } finally {
        loading.value = false;
      }
    };
    
    // Auto-load on mount
    loadUser();
    
    return { user, loading, loadUser };
  }
};

export default function UserProfile() {
  return (
    <>
      <Script default={userSetup} />
      
      <Template vef>
        <div class="user-profile">
          <If condition="loading">
            <div class="loading">Loading user...</div>
          </If>
          
          <If condition="user && !loading">
            <div class="user-info">
              <img :src="user.avatar" :alt="user.name">
              <h2>{{ user.name }}</h2>
              <p>{{ user.email }}</p>
              <button on:click="loadUser">Refresh</button>
            </div>
          </If>
        </div>
      </Template>
    </>
  );
}
```

### 3. Mixed JSX/VEF Component

```tsx
// dashboard.tsx
import { Template, If, List } from '@inspatial/run';

export default function Dashboard({ widgets }) {
  const handleWidgetClick = (widget) => {
    console.log('Widget clicked:', widget.id);
  };
  
  return (
    <div className="dashboard">
      {/* JSX header */}
      <header>
        <h1>Dashboard</h1>
      </header>
      
      {/* VEF main content */}
      <Template vef>
        <main class="dashboard-content">
          <If condition="widgets.length === 0">
            <div class="empty-state">No widgets available</div>
          </If>
          
          <If condition="widgets.length > 0">
            <div class="widget-grid">
              <List each="widgets" track="id">
                <div 
                  class="widget" 
                  :class="{ active: widget.active }"
                  on:click="handleWidgetClick(widget)"
                >
                  <h3>{{ widget.title }}</h3>
                  <p>{{ widget.description }}</p>
                </div>
              </List>
            </div>
          </If>
        </main>
      </Template>
      
      {/* JSX footer */}
      <footer>
        <p>© 2024 Dashboard App</p>
      </footer>
    </div>
  );
}
```

## Runtime Implementation Strategy

### 1. VEF Runtime Extension

**File**: `src/runtime/vef-runtime.ts`

Extends the existing JSX runtime to support VEF template processing:

```typescript
interface VEFRuntime extends JSXRuntime {
  processTemplate(template: string, context: any): any;
  evaluateExpression(expr: string, context: any): any;
  applyDirectives(element: any, directives: Record<string, any>): any;
  createSlotContext(slots: any): any;
}
```

### 2. Template Processing Pipeline

1. **Detection**: Template component detects `vef` prop
2. **Parsing**: Parse VEF syntax in children strings
3. **Processing**: Convert VEF directives to JSX props
4. **Evaluation**: Evaluate expressions in template context
5. **Rendering**: Generate JSX elements via existing runtime

### 3. Expression Evaluation

```typescript
interface ExpressionContext {
  // Component data
  [key: string]: any;
  
  // Built-in helpers
  $event: Event;           // Current event object
  $refs: any;             // Template refs
  $slots: any;            // Available slots
  $emit: (event: string, ...args: any[]) => void;
}
```

### 4. Directive Processing

```typescript
interface DirectiveProcessor {
  // Attribute binding
  processBind(element: any, attr: string, value: any): void;
  
  // Event handling
  processEvent(element: any, event: string, handler: any, modifiers: string[]): void;
  
  // Model binding
  processModel(element: any, prop: string, value: any): void;
  
  // Text interpolation
  processInterpolation(text: string, context: any): string;
}
```

## JSX/VEF Interoperability

### Using VEF Components in JSX

```tsx
// VEF component
const VEFButton = () => (
  <Template vef>
    <button 
      :class="{ primary: isPrimary }" 
      on:click="handleClick"
    >
      {{ label }}
    </button>
  </Template>
);

// JSX component using VEF component
function App() {
  return (
    <div>
      <h1>My App</h1>
      <VEFButton isPrimary={true} label="Click me" onClick={console.log} />
    </div>
  );
}
```

### Using JSX Components in VEF

```tsx
// JSX component
const JSXCard = ({ title, children }) => (
  <div className="card">
    <h2>{title}</h2>
    <div className="content">{children}</div>
  </div>
);

// VEF component using JSX component
function VEFApp() {
  return (
    <Template vef>
      <div class="app">
        <JSXCard :title="pageTitle">
          <p>{{ pageContent }}</p>
        </JSXCard>
      </div>
    </Template>
  );
}
```

## Performance Considerations

### 1. Template Caching

- Cache parsed templates to avoid re-parsing on re-renders
- Use WeakMap for component-level template caching
- Implement expression memoization for frequently evaluated expressions

### 2. Expression Optimization

- Pre-compile static expressions at first evaluation
- Cache expression results when inputs haven't changed
- Optimize common patterns (property access, method calls)

### 3. Directive Efficiency

- Batch directive applications
- Minimize DOM manipulations
- Use requestAnimationFrame for complex updates

### 4. Memory Management

- Clean up expression caches when components unmount
- Avoid memory leaks in slot contexts
- Optimize garbage collection for temporary objects

## Development Experience

### 1. TypeScript Support

```typescript
// VEF component with TypeScript
interface CounterProps {
  initialCount?: number;
  onCountChange?: (count: number) => void;
}

export default function Counter({ initialCount = 0, onCountChange }: CounterProps) {
  return (
    <>
      <Script setup>
        {`
          const count = $(initialCount);
          const increment = () => {
            count.value++;
            onCountChange?.(count.value);
          };
        `}
      </Script>
      
      <Template vef>
        <div>
          <span>Count: {{ count }}</span>
          <button on:click="increment">+</button>
        </div>
      </Template>
    </>
  );
}
```

### 2. Hot Module Replacement

VEF components leverage existing InSpatial HMR infrastructure:
- Template changes trigger re-renders
- Script changes update component logic
- Preserves component state during updates

### 3. Debugging Support

- Source maps for template expressions
- Debug-friendly error messages
- Integration with browser dev tools
- Component inspection and reactive state visualization

## Migration Strategies

### 1. JSX to VEF

```tsx
// Before (JSX)
function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <input 
        type="checkbox" 
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
      />
      <span>{todo.text}</span>
      <button onClick={() => onDelete(todo.id)}>Delete</button>
    </li>
  );
}

// After (VEF)
function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <Template vef>
      <li :class="'todo-item ' + (todo.completed ? 'completed' : '')">
        <input 
          type="checkbox" 
          :checked="todo.completed"
          on:change="onToggle(todo.id)"
        />
        <span>{{ todo.text }}</span>
        <button on:click="onDelete(todo.id)">Delete</button>
      </li>
    </Template>
  );
}
```

### 2. Gradual Adoption

- Start with new components using VEF
- Migrate existing components as needed
- Mix JSX and VEF in the same application
- No breaking changes to existing JSX code

## Error Handling

### 1. Template Expression Errors

```typescript
// Graceful error handling in expressions
<Template vef>
  <div>
    <!-- Handles undefined gracefully -->
    <span>{{ user?.name ?? 'Anonymous' }}</span>
    
    <!-- Try-catch for complex expressions -->
    <span>{{ tryEval(() => complexCalculation(), 'Error') }}</span>
  </div>
</Template>
```

### 2. Directive Errors

- Invalid directive syntax shows helpful error messages
- Runtime warnings for performance issues
- Fallback behavior for failed directive applications

### 3. Development vs Production

- Detailed error messages in development
- Minimal error handling in production
- Configurable error reporting

## Future Enhancements

### 1. Advanced Directives

- Custom directive creation API
- Animation directives
- Form validation directives

### 2. Template Optimization

- Static analysis for performance hints
- Automatic memoization detection
- Bundle size optimization

### 3. Tooling Integration

- IDE syntax highlighting for VEF templates
- Template expression type checking
- Refactoring tools for JSX/VEF conversion

## Compatibility Matrix

| Feature | JSX | VEF | Interop |
|---------|-----|-----|---------|
| Components | ✅ | ✅ | ✅ |
| Props | ✅ | ✅ | ✅ |
| Events | ✅ | ✅ | ✅ |
| Slots | ✅ | ✅ | ✅ |
| Control Flow | ✅ | ✅ | ✅ |
| TypeScript | ✅ | ✅ | ✅ |
| HMR | ✅ | ✅ | ✅ |
| SSR | ✅ | ✅ | ✅ |

## Best Practices

### 1. When to Use VEF

- Complex templates with lots of dynamic content
- Teams familiar with Vue.js
- Rapid prototyping with template-driven development
- Clear separation of logic and presentation

### 2. When to Use JSX

- Logic-heavy components
- Teams familiar with React
- Complex conditional rendering
- Performance-critical components

### 3. Mixing Approaches

- Use VEF for presentational components
- Use JSX for logic containers
- Consistent prop interfaces between approaches
- Document component authoring choices

---

**Note**: This specification describes the intended VEF implementation for InSpatial Run. Implementation details may evolve during development while maintaining API compatibility. 
# InSpatial Universal Debugger 🌟

InSpatial Run includes a centralized debugging system that makes it easy to track down issues, understand application flow, and optimize performance. 

## Quick Start

```typescript
import { createRenderer, debug } from '@inspatial/run';

// Method 1: Configure via renderer options (recommended)
const renderer = await createRenderer({
  mode: 'auto',
  debug: true, // Enable basic debugging
  debugConfig: {
    level: 'info',
    categories: ['renderer', 'environment', 'performance'],
    showTimestamp: true,
    showCategory: true,
  }
});

// Method 2: Configure directly
debug.configure({
  enabled: true,
  level: 'debug',
  categories: 'all', // or specific ['renderer', 'hot', 'signal']
  showTimestamp: true,
  showCategory: true,
  prefix: '🚀 MyApp',
});
```

## Debug Levels

- **error**: Critical errors only
- **warn**: Warnings and errors
- **info**: General information, warnings, and errors (default)
- **debug**: Detailed debugging information
- **trace**: Extremely verbose tracing

## Debug Categories

- **renderer**: Renderer creation, mode selection, node operations
- **environment**: Environment detection and platform info
- **hot**: Hot reload activity
- **signal**: Signal creation, updates, and effects
- **component**: Component lifecycle and rendering
- **env-vars**: Environment variable access and validation
- **performance**: Timing information and performance metrics
- **lifecycle**: Application lifecycle events
- **xr**: XR-specific operations (AndroidXR, VisionOS, HorizonOS)
- **native**: Native platform operations (NativeScript, React Native)
- **general**: General application logging

## Usage Examples

### Basic Logging

```typescript
import { debug } from '@inspatial/run';

// Simple logging by category
debug.info('renderer', 'Renderer initialized successfully');
debug.warn('environment', 'Non-standard environment detected');
debug.error('component', 'Component failed to render', { error: someError });

// With additional data
debug.debug('performance', 'Render completed', {
  duration: 45,
  components: 12,
  signals: 8
});
```

### Specialized Methods

```typescript
// Environment detection
debug.envDetection(environmentInfo);

// Renderer operations
debug.rendererCreation('DOM', renderer);
debug.modeSelection('auto', 'browser', 'DOM available');

// Performance timing
const timing = debug.startTiming('Component Render');
// ... do work ...
timing(); // Automatically logs duration

// Grouped logging
const group = debug.group('Application Startup', 'general');
debug.info('general', 'Loading configuration');
debug.info('general', 'Initializing renderer');
debug.info('general', 'Ready for rendering');
group.end();
```

### Convenience Exports

```typescript
import { renderer, environment, hot } from '@inspatial/run';

// Category-specific helpers
renderer.info('DOM renderer created');
renderer.error('Failed to create renderer', error);

environment.detected(envInfo);
environment.warn('Unusual runtime detected');

hot.activity('Component updated', { component: 'App' });
hot.info('Hot reload enabled');
```

### Custom Configuration

```typescript
// Development vs Production
debug.configure({
  enabled: !env.isProduction(),
  level: env.isProduction() ? 'error' : 'debug',
  categories: env.isProduction() ? ['error'] : 'all',
});

// Custom output handler
debug.configure({
  output: 'custom',
  customHandler: (entry) => {
    // Send to external logging service
    myLoggingService.log({
      level: entry.level,
      category: entry.category,
      message: entry.message,
      timestamp: entry.timestamp,
      data: entry.data,
    });
  }
});

// Disable logging completely
debug.configure({ enabled: false });
```

### Debugging Utilities

```typescript
// Get all log entries
const allEntries = debug.getEntries();

// Filter entries
const errors = debug.getEntries({ level: 'error' });
const recentRenderer = debug.getEntries({ 
  category: 'renderer', 
  since: Date.now() - 60000 // Last minute
});

// Get summary
const summary = debug.summary();
console.log(`Total logs: ${summary.total}`);
console.log(`Errors: ${summary.byLevel.error}`);
console.log(`Renderer logs: ${summary.byCategory.renderer}`);

// Clear logs
debug.clear();
```

## Integration Examples

### With Components

```typescript
function MyComponent() {
  debug.componentLifecycle('mount', 'MyComponent');
  
  return function(R) {
    debug.trace('component', 'MyComponent rendering');
    return R.createElement('div', null, 'Hello World');
  };
}
```

### With Signals

```typescript
const signal = createSignal(0);

// Log signal activity
signal.connect(() => {
  debug.signalActivity('updated', signal._.id, signal.value);
});
```

### Error Handling

```typescript
try {
  const result = await someAsyncOperation();
  debug.info('general', 'Operation completed successfully', { result });
} catch (error) {
  debug.error('general', 'Operation failed', error);
  // Stack trace is automatically included for errors
}
```

## Features

✅ **Automatic Environment Detection**: Enabled by default in development, disabled in production  
✅ **Categorized Logging**: Organize logs by system component  
✅ **Level-based Filtering**: Control verbosity with debug levels  
✅ **Performance Timing**: Built-in timing utilities  
✅ **Grouped Output**: Organize related logs visually  
✅ **Memory Management**: Automatically keeps only recent entries  
✅ **Stack Traces**: Automatic stack traces for errors  
✅ **Custom Handlers**: Send logs to external services  
✅ **Rich Formatting**: Emoji and timestamp support  

## Best Practices

1. **Use appropriate levels**: Reserve `error` for actual errors, use `debug` for detailed tracing
2. **Choose specific categories**: Helps with filtering and organization
3. **Include context data**: Pass objects/arrays as additional parameters
4. **Use timing for performance**: Measure critical operations
5. **Group related operations**: Use `debug.group()` for logical groupings
6. **Configure per environment**: Different settings for dev/staging/production


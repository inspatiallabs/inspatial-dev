import { createSignal } from "@in/teract";

export function App() {
  // Create a reactive signal for demonstration
  const count = createSignal(0);

  // Helper functions
  const increment = () => count.value++;
  const decrement = () => count.value--;
  const reset = () => count.value = 0;

  return (R) => (
    <div style="padding: 2rem; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <h1>InSpatial Run With PNPM</h1>
      
      <div style="margin: 2rem 0;">
        <h2 style="color: #333; margin-bottom: 1rem;">
          Counter: {count}
        </h2>
        
        <div style="display: flex; gap: 1rem; justify-content: center; margin: 1rem 0;">
          <button 
            on:click={decrement}
            style="padding: 0.5rem 1rem; font-size: 1.2rem; background: #ff6b6b; color: white; border: none; border-radius: 4px; cursor: pointer;"
          >
            -
          </button>
          
          <button 
            on:click={increment}
            style="padding: 0.5rem 1rem; font-size: 1.2rem; background: #4ecdc4; color: white; border: none; border-radius: 4px; cursor: pointer;"
          >
            +
          </button>
          
          <button 
            on:click={reset}
            style="padding: 0.5rem 1rem; font-size: 1rem; background: #95a5a6; color: white; border: none; border-radius: 4px; cursor: pointer;"
          >
            Reset
          </button>
        </div>
        
        <div style="margin-top: 1.5rem; color: #666;">
          <p>Count is: <strong>{count}</strong></p>
          <p style="font-size: 0.9rem; margin-top: 0.5rem;">
            This counter uses InSpatial's reactive signals in a pnpm environment!
          </p>
        </div>
      </div>
    </div>
  );
}

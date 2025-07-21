// Types
export interface Theme {
  isDarkMode: boolean;
  colors: Record<string, string>;
  variables: Record<string, string>;
}

export type ThemeListener = (theme: Theme) => void;

// Theme Manager Class
export class ThemeManager {
  private static instance: ThemeManager;
  private isDarkMode: boolean = false;
  private listeners: Set<ThemeListener> = new Set();
  private colorVariables: Record<string, string> = {};

  private constructor() {
    // Initialize with system preference
    this.isDarkMode =
      globalThis?.matchMedia?.("(prefers-color-scheme: dark)")?.matches ??
      false;

    // Listen for system theme changes
    globalThis
      ?.matchMedia?.("(prefers-color-scheme: dark)")
      ?.addEventListener("change", (e) => {
        if (this.shouldFollowSystem) {
          this.setDarkMode(e.matches);
        }
      });
  }

  private shouldFollowSystem: boolean = true;

  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  // Subscribe to theme changes
  subscribe(listener: ThemeListener): () => void {
    this.listeners.add(listener);
    // Immediately call with current theme
    listener(this.getCurrentTheme());

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Set dark mode
  setDarkMode(isDark: boolean): void {
    this.shouldFollowSystem = false;
    if (this.isDarkMode === isDark) return;

    this.isDarkMode = isDark;
    this.updateTheme();
  }

  // Enable system theme following
  followSystem(): void {
    this.shouldFollowSystem = true;
    const isDark =
      globalThis?.matchMedia?.("(prefers-color-scheme: dark)")?.matches ??
      false;
    if (this.isDarkMode === isDark) return;

    this.isDarkMode = isDark;
    this.updateTheme();
  }

  // Get current theme state
  getCurrentTheme(): Theme {
    return {
      isDarkMode: this.isDarkMode,
      colors: this.generateColors(),
      variables: this.colorVariables,
    };
  }

  // Set custom color variables
  setColorVariables(variables: Record<string, string>): void {
    this.colorVariables = variables;
    this.updateTheme();
  }

  // Private helper to generate colors based on dark mode
  private generateColors(): Record<string, string> {
    const baseColors = {
      // Add your color palette here
      background: this.isDarkMode ? "#1a1a1a" : "#ffffff",
      text: this.isDarkMode ? "#ffffff" : "#000000",
      primary: "#007AFF",
      secondary: "#5856D6",
      // Add more colors as needed
    };

    return {
      ...baseColors,
      ...this.colorVariables,
    };
  }

  // Update DOM and notify listeners
  private updateTheme(): void {
    const theme = this.getCurrentTheme();

    // Update CSS variables
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      Object.entries(theme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value);
      });
    }

    // Notify listeners
    this.listeners.forEach((listener) => listener(theme));
  }
}

// Helper functions
export function initTheme(): ThemeManager {
  return ThemeManager.getInstance();
}

export function useTheme(onThemeChange: ThemeListener): void {
  const manager = ThemeManager.getInstance();
  manager.subscribe(onThemeChange);
}

// Example with (React)
// export function ThemeProvider() {
//   return function useReactTheme() {
//     const [theme, setTheme] = useState(
//       ThemeManager.getInstance().getCurrentTheme()
//     );

//     useEffect(() => {
//       return ThemeManager.getInstance().subscribe(setTheme);
//     }, []);

//     return theme;
//   };
// }

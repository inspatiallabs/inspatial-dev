// deno-lint-ignore-file ban-types
declare global {
  namespace JSX {
    interface Element extends Node {}

    interface IntrinsicElements {
      [elemName: string]: Record<string, any>;
    }
  }
}

type Props = Record<string, any>;
type Children = (Node | string | number | boolean | null | undefined)[];

function parseChild(child: any): Node {
  if (child == null || child === false) {
    return document.createTextNode("");
  }

  if (child instanceof Node) {
    return child;
  }

  if (Array.isArray(child)) {
    const fragment = document.createDocumentFragment();
    child.forEach((c) => fragment.appendChild(parseChild(c)));
    return fragment;
  }

  // Handle primitive types
  return document.createTextNode(String(child));
}

function parseChildren(children: Children): Node[] {
  return children.map(parseChild);
}

function setStyle(el: HTMLElement, styles: Record<string, any>): void {
  Object.entries(styles).forEach(([key, value]) => {
    // Handle camelCase to kebab-case conversion
    const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
    if (value != null) {
      el.style.setProperty(cssKey, String(value));
    }
  });
}

function handleProps(el: HTMLElement, props: Props | null): void {
  if (!props) return;

  Object.entries(props).forEach(([key, value]) => {
    if (key === "style" && typeof value === "object") {
      setStyle(el, value);
      return;
    }

    if (key === "className") {
      if (typeof value === "string") {
        value
          .split(/\s+/)
          .filter(Boolean)
          .forEach((cls) => {
            el.classList.add(cls);
          });
      }
      return;
    }

    if (key.startsWith("on") && typeof value === "function") {
      const eventName = key.slice(2).toLowerCase();
      el.addEventListener(eventName, value);
      return;
    }

    // Handle boolean attributes
    if (typeof value === "boolean") {
      if (value) {
        el.setAttribute(key, "");
      } else {
        el.removeAttribute(key);
      }
      return;
    }

    // Handle other attributes
    if (value != null) {
      el.setAttribute(key, String(value));
    }
  });
}

// Main createElement function for JSX
function h(
  type: string | Function,
  props: Props | null,
  ...children: Children
): Node {
  // Handle function components
  if (typeof type === "function") {
    return type({ ...props, children });
  }

  // Handle regular DOM elements
  const element = document.createElement(type);
  handleProps(element, props);

  parseChildren(children).forEach((child) => {
    element.appendChild(child);
  });

  return element;
}

// Fragment implementation
function Fragment({ children }: { children: Children }): DocumentFragment {
  const fragment = document.createDocumentFragment();
  parseChildren(children).forEach((child) => fragment.appendChild(child));
  return fragment;
}

// Export for Deno's JSX precompile
export { h as jsx, h as jsxDEV, h as jsxs, Fragment };

// Example usage:
/*
const App = () => {
  return jsx('div', { className: 'container' },
    jsx('h1', { style: { color: 'blue' } }, 'Hello'),
    jsx('p', { onClick: () => alert('clicked') }, 'Click me!')
  );
};

// Or with a custom component:
const Button = ({ onClick, children }) => {
  return jsx('button', { 
    className: 'btn',
    onClick
  }, children);
};

const element = jsx(Button, { 
  onClick: () => alert('Button clicked')
}, 'Click Me');

document.body.appendChild(element);
*/

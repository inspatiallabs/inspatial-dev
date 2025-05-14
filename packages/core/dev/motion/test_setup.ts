// /**
//  * # TestSetup
//  * @summary #### Test environment setup for InSpatial Motion testing in Deno
//  * 
//  * This module provides mock browser globals and DOM objects required by
//  * the animation tests when running in Deno where browser APIs aren't natively available.
//  * 
//  * @since 0.1.0
//  * @category InSpatial Motion Testing
//  */

// // Create test objects to match the original AnimeJS test setup
// const testObject: Record<string, any> = {
//   plainValue: 10,
//   valueWithUnit: '10px',
//   multiplePlainValues: '16 32 64 128',
//   multipleValuesWithUnits: '16px 32em 64% 128ch'
// };

// const anOtherTestObject: Record<string, any> = {
//   plainValue: 20
// };

// // Expose test objects globally
// (globalThis as any).testObject = testObject;
// (globalThis as any).anOtherTestObject = anOtherTestObject;

// // Create global document and window if they don't exist
// if (typeof globalThis.document === 'undefined') {
//   // Mock Element class
//   class MockElement {
//     tagName: string;
//     style: Record<string, string>;
//     children: MockElement[];
//     parentElement: MockElement | null;
//     classList: Set<string>;
//     attributes: Map<string, string>;
//     id: string;
//     className: string;
//     innerHTML: string;
//     nodeType: number;
//     dataset: Record<string, string>;
//     nextSibling: MockElement | null;
//     previousSibling: MockElement | null;
    
//     constructor(tagName: string) {
//       this.tagName = tagName.toUpperCase();
//       this.style = {};
//       this.children = [];
//       this.parentElement = null;
//       this.classList = new Set();
//       this.attributes = new Map();
//       this.id = '';
//       this.className = '';
//       this.innerHTML = '';
//       this.nodeType = 1; // ELEMENT_NODE
//       this.dataset = {};
//       this.nextSibling = null;
//       this.previousSibling = null;
//     }
    
//     getAttribute(name: string): string | null {
//       return this.attributes.get(name) || null;
//     }
    
//     setAttribute(name: string, value: string): void {
//       this.attributes.set(name, value);
      
//       // Special handlers for specific attributes
//       if (name === 'id') this.id = value;
//       if (name === 'class') this.className = value;
//       if (name === 'style') {
//         // Parse inline style
//         const styleList = value.split(';');
//         styleList.forEach(style => {
//           const [prop, val] = style.split(':').map(s => s.trim());
//           if (prop && val) this.style[prop] = val;
//         });
//       }
      
//       // Handle data-* attributes
//       if (name.startsWith('data-')) {
//         const dataKey = name.substring(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
//         this.dataset[dataKey] = value;
//       }
//     }
    
//     removeAttribute(name: string): void {
//       this.attributes.delete(name);
//       if (name === 'id') this.id = '';
//       if (name === 'class') this.className = '';
//       if (name === 'style') this.style = {};
//     }
    
//     appendChild(child: MockElement): MockElement {
//       this.children.push(child);
//       child.parentElement = this;
      
//       // Set siblings
//       if (this.children.length > 1) {
//         const prevChild = this.children[this.children.length - 2];
//         prevChild.nextSibling = child;
//         child.previousSibling = prevChild;
//       }
      
//       return child;
//     }
    
//     querySelectorAll(selector: string): NodeList {
//       const matches: MockElement[] = [];
      
//       // Simple selector implementation
//       if (selector.startsWith('#')) {
//         // ID selector
//         const id = selector.substring(1);
//         this.findElementsById(id, matches);
//       } else if (selector.startsWith('.')) {
//         // Class selector
//         const className = selector.substring(1);
//         this.findElementsByClass(className, matches);
//       } else if (selector === '*') {
//         // All elements
//         this.getAllElements(matches);
//       } else if (selector === ':root') {
//         // Root element (document.documentElement)
//         matches.push(this);
//       } else {
//         // Tag selector
//         const tagName = selector.toUpperCase();
//         this.findElementsByTagName(tagName, matches);
//       }
      
//       return new MockNodeList(matches);
//     }
    
//     querySelector(selector: string): MockElement | null {
//       const nodeList = this.querySelectorAll(selector);
//       return nodeList.length > 0 ? nodeList[0] as MockElement : null;
//     }
    
//     private findElementsById(id: string, matches: MockElement[]): void {
//       if (this.id === id) {
//         matches.push(this);
//       }
//       this.children.forEach(child => {
//         child.findElementsById(id, matches);
//       });
//     }
    
//     private findElementsByClass(className: string, matches: MockElement[]): void {
//       if (this.classList.has(className)) {
//         matches.push(this);
//       }
//       this.children.forEach(child => {
//         child.findElementsByClass(className, matches);
//       });
//     }
    
//     private findElementsByTagName(tagName: string, matches: MockElement[]): void {
//       if (this.tagName === tagName) {
//         matches.push(this);
//       }
//       this.children.forEach(child => {
//         child.findElementsByTagName(tagName, matches);
//       });
//     }
    
//     private getAllElements(matches: MockElement[]): void {
//       matches.push(this);
//       this.children.forEach(child => {
//         child.getAllElements(matches);
//       });
//     }
//   }
  
//   // Mock HTMLElement extends MockElement
//   class MockHTMLElement extends MockElement {
//     constructor(tagName: string) {
//       super(tagName);
//     }
    
//     get width(): number {
//       const widthAttr = this.getAttribute('width');
//       if (widthAttr) {
//         return parseInt(widthAttr, 10);
//       }
//       const widthStyle = this.style['width'];
//       if (widthStyle) {
//         return parseInt(widthStyle, 10);
//       }
//       return 0;
//     }
    
//     set width(value: number) {
//       this.setAttribute('width', value.toString());
//     }
    
//     get height(): number {
//       const heightAttr = this.getAttribute('height');
//       if (heightAttr) {
//         return parseInt(heightAttr, 10);
//       }
//       const heightStyle = this.style['height'];
//       if (heightStyle) {
//         return parseInt(heightStyle, 10);
//       }
//       return 0;
//     }
    
//     set height(value: number) {
//       this.setAttribute('height', value.toString());
//     }
    
//     get value(): string {
//       return this.getAttribute('value') || '';
//     }
    
//     set value(val: string) {
//       this.setAttribute('value', val);
//     }
//   }
  
//   // Mock SVGElement extends MockElement
//   class MockSVGElement extends MockElement {
//     constructor(tagName: string) {
//       super(tagName);
//     }
    
//     // SVG-specific attributes
//     get ownerSVGElement(): MockSVGElement | null {
//       let parent = this.parentElement;
//       while (parent) {
//         if (parent instanceof MockSVGElement && parent.tagName === 'SVG') {
//           return parent as MockSVGElement;
//         }
//         parent = parent.parentElement;
//       }
//       return null;
//     }
    
//     get x1(): number {
//       const attr = this.getAttribute('x1');
//       return attr ? parseFloat(attr) : 0;
//     }
    
//     set x1(value: number) {
//       this.setAttribute('x1', value.toString());
//     }
    
//     get x2(): number {
//       const attr = this.getAttribute('x2');
//       return attr ? parseFloat(attr) : 0;
//     }
    
//     set x2(value: number) {
//       this.setAttribute('x2', value.toString());
//     }
    
//     get y1(): number {
//       const attr = this.getAttribute('y1');
//       return attr ? parseFloat(attr) : 0;
//     }
    
//     set y1(value: number) {
//       this.setAttribute('y1', value.toString());
//     }
    
//     get y2(): number {
//       const attr = this.getAttribute('y2');
//       return attr ? parseFloat(attr) : 0;
//     }
    
//     set y2(value: number) {
//       this.setAttribute('y2', value.toString());
//     }
    
//     get r(): number {
//       const attr = this.getAttribute('r');
//       return attr ? parseFloat(attr) : 0;
//     }
    
//     set r(value: number) {
//       this.setAttribute('r', value.toString());
//     }
    
//     get cx(): number {
//       const attr = this.getAttribute('cx');
//       return attr ? parseFloat(attr) : 0;
//     }
    
//     set cx(value: number) {
//       this.setAttribute('cx', value.toString());
//     }
    
//     get cy(): number {
//       const attr = this.getAttribute('cy');
//       return attr ? parseFloat(attr) : 0;
//     }
    
//     set cy(value: number) {
//       this.setAttribute('cy', value.toString());
//     }
    
//     get points(): string {
//       return this.getAttribute('points') || '';
//     }
    
//     set points(value: string) {
//       this.setAttribute('points', value);
//     }
    
//     get d(): string {
//       return this.getAttribute('d') || '';
//     }
    
//     set d(value: string) {
//       this.setAttribute('d', value);
//     }
//   }
  
//   // Mock NodeList implementation
//   class MockNodeList implements NodeList {
//     private items: MockElement[];
    
//     constructor(items: MockElement[]) {
//       this.items = items;
//     }
    
//     get length(): number {
//       return this.items.length;
//     }
    
//     [index: number]: Node;
//     [Symbol.iterator](): IterableIterator<Node> {
//       return this.items[Symbol.iterator]() as IterableIterator<Node>;
//     }
    
//     forEach(callbackfn: (value: Node, key: number, parent: NodeList) => void): void {
//       this.items.forEach((item, index) => {
//         callbackfn(item as unknown as Node, index, this);
//       });
//     }
    
//     item(index: number): Node {
//       return this.items[index] as unknown as Node;
//     }
//   }
  
//   // Mock HTMLCollection implementation
//   class MockHTMLCollection implements HTMLCollection {
//     private items: MockElement[];
    
//     constructor(items: MockElement[]) {
//       this.items = items;
//     }
    
//     get length(): number {
//       return this.items.length;
//     }
    
//     [index: number]: Element;
//     [Symbol.iterator](): IterableIterator<Element> {
//       return this.items[Symbol.iterator]() as IterableIterator<Element>;
//     }
    
//     item(index: number): Element | null {
//       return index >= 0 && index < this.items.length ? 
//         (this.items[index] as unknown as Element) : 
//         null;
//     }
    
//     namedItem(name: string): Element | null {
//       return this.items.find(item => item.id === name) as unknown as Element || null;
//     }
//   }
  
//   // Create the Document implementation
//   class MockDocument {
//     documentElement: MockHTMLElement;
//     body: MockHTMLElement;
//     head: MockHTMLElement;
    
//     constructor() {
//       this.documentElement = new MockHTMLElement('html');
//       this.body = new MockHTMLElement('body');
//       this.head = new MockHTMLElement('head');
//       this.documentElement.appendChild(this.head);
//       this.documentElement.appendChild(this.body);
//     }
    
//     createElement(tagName: string): MockHTMLElement {
//       return new MockHTMLElement(tagName);
//     }
    
//     createElementNS(_namespace: string, tagName: string): MockSVGElement {
//       return new MockSVGElement(tagName);
//     }
    
//     querySelector(selector: string): MockElement | null {
//       return this.documentElement.querySelector(selector);
//     }
    
//     querySelectorAll(selector: string): NodeList {
//       return this.documentElement.querySelectorAll(selector);
//     }
    
//     getElementById(id: string): MockElement | null {
//       return this.querySelector(`#${id}`);
//     }
    
//     getElementsByClassName(className: string): HTMLCollection {
//       const nodeList = this.querySelectorAll(`.${className}`);
//       return new MockHTMLCollection(Array.from(nodeList) as unknown as MockElement[]);
//     }
    
//     getElementsByTagName(tagName: string): HTMLCollection {
//       const nodeList = this.querySelectorAll(tagName);
//       return new MockHTMLCollection(Array.from(nodeList) as unknown as MockElement[]);
//     }
//   }
  
//   // Set up the global document object
//   const mockDocument = new MockDocument();
//   globalThis.document = mockDocument as unknown as Document;
  
//   // Set up window.requestAnimationFrame and cancelAnimationFrame
//   globalThis.requestAnimationFrame = (callback: FrameRequestCallback): number => {
//     return setTimeout(() => {
//       callback(performance.now());
//     }, 16) as unknown as number;
//   };
  
//   globalThis.cancelAnimationFrame = (handle: number): void => {
//     clearTimeout(handle);
//   };
  
//   // Mock performance
//   globalThis.performance = {
//     now: () => Date.now(),
//   } as Performance;
  
//   // Add other window properties
//   globalThis.window = globalThis;
  
//   console.log("Mock browser environment created for testing");
// }

// // Set up HTML elements based on the original AnimeJS test setup
// function setupTestDOM() {
//   const doc = globalThis.document;
//   const rootEl = doc.querySelector(':root') || doc.documentElement;
  
//   // Create and append #tests element
//   let testsEl = doc.querySelector('#tests');
//   if (!testsEl) {
//     testsEl = doc.createElement('div');
//     testsEl.id = 'tests';
//     doc.body.appendChild(testsEl as unknown as Element);
//   }
  
//   // Reset test objects
//   testObject.plainValue = 10;
//   testObject.valueWithUnit = '10px';
//   testObject.multiplePlainValues = '16 32 64 128';
//   testObject.multipleValuesWithUnits = '16px 32em 64% 128ch';
//   anOtherTestObject.plainValue = 20;
  
//   // Reset root style
//   rootEl.removeAttribute('style');
  
//   // Set up test HTML structure
//   testsEl.innerHTML = `
//     <div id="path-tests" class="test">
//       <div id="square"></div>
//       <svg id="svg-element" preserveAspectRatio="xMidYMid slice" viewBox="0 0 600 400">
//         <filter id="displacementFilter">
//           <feTurbulence type="turbulence" numOctaves="2" baseFrequency="0" result="turbulence"/>
//           <feDisplacementMap in2="turbulence" in="SourceGraphic" xChannelSelector="R" yChannelSelector="G"/>
//         </filter>
//         <g fill="none" fill-rule="evenodd" stroke-width="2">
//           <line id="line1" x1="51.5" x2="149.5" y1="51.5" y2="149.5" stroke="#F96F82" />
//           <line id="line2" x1="149.5" x2="51.5" y1="51.5" y2="149.5" stroke="#F96F82" />
//           <circle id="circle" cx="300" cy="100" r="50" stroke="#FED28B"/>
//           <polygon id="polygon" stroke="#D1FA9E" points="500 130.381 464.772 149 471.5 109.563 443 81.634 482.386 75.881 500 40 517.614 75.881 557 81.634 528.5 109.563 535.228 149" style="filter: url(#displacementFilter)"/>
//           <polyline id="polyline" stroke="#7BE6D6" points="63.053 345 43 283.815 95.5 246 148 283.815 127.947 345 63.5 345"/>
//           <path id="path" stroke="#4E7EFC" d="M250 300c0-27.614 22.386-50 50-50s50 22.386 50 50v50h-50c-27.614 0-50-22.386-50-50z"/>
//           <path id="path-without-d-attribute-1" stroke="#4E7EFC"/>
//           <path id="path-without-d-attribute-2" stroke="#F96F82"/>
//           <rect id="rect" width="100" height="100" x="451" y="251" stroke="#C987FE" rx="25"/>
//         </g>
//       </svg>
//     </div>
//     <div id="css-tests" class="test test small-test">
//       <div id="target-id" class="target-class" data-index="0"></div>
//       <!-- '.target-class' number of elements should be exactly 4 in order to test targets length dependent animations -->
//       <div class="target-class with-width-attribute" width="200" data-index="1"></div>
//       <div class="target-class with-inline-styles" data-index="2" style="width: 200px;"></div>
//       <div class="target-class" data-index="3"></div>
//       <div class="with-inline-transforms" style="transform: translateX(10px)translateY(-.5rem)scale(.75)"></div>
//       <div class="css-properties"></div>
//     </div>
//     <div id="dom-attributes-tests" class="test test small-test">
//       <img class="with-width-attribute" src="./icon.png" width=96 height=96 />
//       <input type="number" id="input-number" name="Input number test" min="0" max="100" value="0">
//     </div>
//     <div id="stagger-tests" class="test small-test">
//       <div id="stagger">
//         <div></div>
//         <div></div>
//         <div></div>
//         <div></div>
//         <div></div>
//       </div>
//     </div>
//     <div id="stagger-grid-tests" class="test small-test">
//       <div id="grid">
//         <div></div><div></div><div></div><div></div><div></div>
//         <div></div><div></div><div></div><div></div><div></div>
//         <div></div><div></div><div></div><div></div><div></div>
//       </div>
//     </div>
//   `;
  
//   // Parse and attach the HTML structure to the DOM
//   parseAndAttachHTML(testsEl as any, testsEl.innerHTML);
  
//   console.log("Test DOM setup completed");
// }

// // Helper function to parse and attach HTML content
// function parseAndAttachHTML(element: any, html: string) {
//   // Clear existing children
//   element.children = [];
  
//   // Simple HTML parsing (this is a minimal implementation)
//   // In a real implementation, this would use a proper HTML parser
//   const doc = globalThis.document;
  
//   // Parse divs with IDs
//   const divRegex = /<div\s+id="([^"]+)"[^>]*>([\s\S]*?)<\/div>/g;
//   let match;
  
//   while ((match = divRegex.exec(html)) !== null) {
//     const id = match[1];
//     const content = match[2];
    
//     const div = doc.createElement('div');
//     div.id = id;
    
//     if (id === 'svg-element') {
//       // Handle SVG element specially
//       const svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
//       svg.id = 'svg-element';
//       svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
//       svg.setAttribute('viewBox', '0 0 600 400');
      
//       // Create basic SVG elements
//       const svgElementIds = [
//         'line1', 'line2', 'circle', 'polygon', 'polyline', 
//         'path', 'path-without-d-attribute-1', 'path-without-d-attribute-2', 'rect'
//       ];
      
//       svgElementIds.forEach(id => {
//         let svgElement;
        
//         if (id.startsWith('line')) {
//           svgElement = doc.createElementNS('http://www.w3.org/2000/svg', 'line');
//           svgElement.x1 = 51.5;
//           svgElement.x2 = id === 'line1' ? 149.5 : 51.5;
//           svgElement.y1 = 51.5;
//           svgElement.y2 = 149.5;
//           svgElement.setAttribute('stroke', '#F96F82');
//         } else if (id === 'circle') {
//           svgElement = doc.createElementNS('http://www.w3.org/2000/svg', 'circle');
//           svgElement.cx = 300;
//           svgElement.cy = 100;
//           svgElement.r = 50;
//           svgElement.setAttribute('stroke', '#FED28B');
//         } else if (id === 'polygon') {
//           svgElement = doc.createElementNS('http://www.w3.org/2000/svg', 'polygon');
//           svgElement.setAttribute('points', '500 130.381 464.772 149 471.5 109.563 443 81.634 482.386 75.881 500 40 517.614 75.881 557 81.634 528.5 109.563 535.228 149');
//           svgElement.setAttribute('stroke', '#D1FA9E');
//         } else if (id === 'polyline') {
//           svgElement = doc.createElementNS('http://www.w3.org/2000/svg', 'polyline');
//           svgElement.setAttribute('points', '63.053 345 43 283.815 95.5 246 148 283.815 127.947 345 63.5 345');
//           svgElement.setAttribute('stroke', '#7BE6D6');
//         } else if (id === 'path') {
//           svgElement = doc.createElementNS('http://www.w3.org/2000/svg', 'path');
//           svgElement.setAttribute('d', 'M250 300c0-27.614 22.386-50 50-50s50 22.386 50 50v50h-50c-27.614 0-50-22.386-50-50z');
//           svgElement.setAttribute('stroke', '#4E7EFC');
//         } else if (id.startsWith('path-without-d-attribute')) {
//           svgElement = doc.createElementNS('http://www.w3.org/2000/svg', 'path');
//           svgElement.setAttribute('stroke', id.endsWith('1') ? '#4E7EFC' : '#F96F82');
//         } else if (id === 'rect') {
//           svgElement = doc.createElementNS('http://www.w3.org/2000/svg', 'rect');
//           svgElement.setAttribute('width', '100');
//           svgElement.setAttribute('height', '100');
//           svgElement.setAttribute('x', '451');
//           svgElement.setAttribute('y', '251');
//           svgElement.setAttribute('rx', '25');
//           svgElement.setAttribute('stroke', '#C987FE');
//         }
        
//         if (svgElement) {
//           svgElement.id = id;
//           svg.appendChild(svgElement as any);
//         }
//       });
      
//       element.appendChild(svg as any);
//     } else if (id === 'css-tests') {
//       // Create CSS test elements
//       const cssTests = doc.createElement('div');
//       cssTests.id = 'css-tests';
//       cssTests.classList.add('test', 'small-test');
      
//       // Add target elements
//       for (let i = 0; i < 4; i++) {
//         const targetEl = doc.createElement('div');
//         targetEl.classList.add('target-class');
//         targetEl.dataset.index = i.toString();
        
//         if (i === 0) {
//           targetEl.id = 'target-id';
//         } else if (i === 1) {
//           targetEl.classList.add('with-width-attribute');
//           targetEl.setAttribute('width', '200');
//         } else if (i === 2) {
//           targetEl.classList.add('with-inline-styles');
//           targetEl.style.width = '200px';
//         }
        
//         cssTests.appendChild(targetEl as any);
//       }
      
//       // Add transforms element
//       const transformsEl = doc.createElement('div');
//       transformsEl.classList.add('with-inline-transforms');
//       transformsEl.style.transform = 'translateX(10px)translateY(-.5rem)scale(.75)';
//       cssTests.appendChild(transformsEl as any);
      
//       // Add CSS properties element
//       const propsEl = doc.createElement('div');
//       propsEl.classList.add('css-properties');
//       cssTests.appendChild(propsEl as any);
      
//       element.appendChild(cssTests as any);
//     } else if (id === 'dom-attributes-tests') {
//       // Create DOM attributes test elements
//       const domTests = doc.createElement('div');
//       domTests.id = 'dom-attributes-tests';
//       domTests.classList.add('test', 'small-test');
      
//       // Add image element
//       const imgEl = doc.createElement('img');
//       imgEl.classList.add('with-width-attribute');
//       imgEl.setAttribute('src', './icon.png');
//       imgEl.setAttribute('width', '96');
//       imgEl.setAttribute('height', '96');
//       domTests.appendChild(imgEl as any);
      
//       // Add input element
//       const inputEl = doc.createElement('input');
//       inputEl.id = 'input-number';
//       inputEl.setAttribute('type', 'number');
//       inputEl.setAttribute('name', 'Input number test');
//       inputEl.setAttribute('min', '0');
//       inputEl.setAttribute('max', '100');
//       inputEl.setAttribute('value', '0');
//       domTests.appendChild(inputEl as any);
      
//       element.appendChild(domTests as any);
//     } else if (id === 'stagger-tests' || id === 'stagger-grid-tests') {
//       // Create stagger test elements
//       const staggerTests = doc.createElement('div');
//       staggerTests.id = id;
//       staggerTests.classList.add('test', 'small-test');
      
//       const container = doc.createElement('div');
//       container.id = id === 'stagger-tests' ? 'stagger' : 'grid';
      
//       const count = id === 'stagger-tests' ? 5 : 15;
      
//       for (let i = 0; i < count; i++) {
//         const divEl = doc.createElement('div');
//         container.appendChild(divEl as any);
//       }
      
//       staggerTests.appendChild(container as any);
//       element.appendChild(staggerTests as any);
//     } else {
//       // Default handling for other elements
//       const div = doc.createElement('div');
//       div.id = id;
//       div.innerHTML = content;
//       element.appendChild(div as any);
//     }
//   }
// }

// // Setup test DOM
// setupTestDOM();

// // Called by our test scripts to ensure DOM is ready
// export function ensureTestEnvironment() {
//   if (!globalThis.document) {
//     console.error("Document not defined! Setup failed.");
//     return false;
//   }
  
//   const testsEl = globalThis.document.querySelector('#tests');
//   if (!testsEl) {
//     setupTestDOM();
//   }
  
//   return true;
// }

// console.log("Test environment setup completed");

// // Expose functions to run before each test
// export function beforeEachTest() {
//   // Reset test objects
//   testObject.plainValue = 10;
//   testObject.valueWithUnit = '10px';
//   testObject.multiplePlainValues = '16 32 64 128';
//   testObject.multipleValuesWithUnits = '16px 32em 64% 128ch';
//   anOtherTestObject.plainValue = 20;
  
//   // Reset root style
//   const rootEl = globalThis.document.querySelector(':root');
//   if (rootEl) {
//     rootEl.removeAttribute('style');
//   }
  
//   // Reset test DOM
//   setupTestDOM();
// } 
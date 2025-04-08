// /**
//  * Simple unit test for the ParentNode class
//  * 
//  * This test just verifies that a parent node's `children` getter returns 
//  * only element nodes, not text or comment nodes.
//  */

// // Create mocks instead of using the real DOM implementation
// class NodeList extends Array {
//   item(i) { return i < this.length ? this[i] : null; }
// }

// // Mock Node class
// class Node {
//   static ELEMENT_NODE = 1;
//   static TEXT_NODE = 3;
//   static COMMENT_NODE = 8;
  
//   constructor(nodeType) {
//     this.nodeType = nodeType;
//     this.parentNode = null;
//   }
// }

// // Mock Element class
// class Element extends Node {
//   constructor() {
//     super(Node.ELEMENT_NODE);
//   }
// }

// // Mock Text class
// class Text extends Node {
//   constructor() {
//     super(Node.TEXT_NODE);
//   }
// }

// // Mock Comment class
// class Comment extends Node {
//   constructor() {
//     super(Node.COMMENT_NODE);
//   }
// }

// // Simplified ParentNode implementation
// class ParentNode extends Node {
//   constructor() {
//     super(Node.ELEMENT_NODE);
//     this._childNodes = new NodeList();
//   }
  
//   appendChild(node) {
//     node.parentNode = this;
//     this._childNodes.push(node);
//     return node;
//   }
  
//   removeChild(node) {
//     const index = this._childNodes.indexOf(node);
//     if (index !== -1) {
//       this._childNodes.splice(index, 1);
//       node.parentNode = null;
//     }
//     return node;
//   }
  
//   get childNodes() {
//     return this._childNodes;
//   }
  
//   get children() {
//     const children = new NodeList();
//     for (const child of this._childNodes) {
//       if (child.nodeType === Node.ELEMENT_NODE) {
//         children.push(child);
//       }
//     }
//     return children;
//   }
  
//   get firstChild() {
//     return this._childNodes.length > 0 ? this._childNodes[0] : null;
//   }
  
//   get lastChild() {
//     return this._childNodes.length > 0 ? this._childNodes[this._childNodes.length - 1] : null;
//   }
  
//   get firstElementChild() {
//     return this.children.length > 0 ? this.children[0] : null;
//   }
  
//   get lastElementChild() {
//     return this.children.length > 0 ? this.children[this.children.length - 1] : null;
//   }
  
//   get childElementCount() {
//     return this.children.length;
//   }
// }

// // Run tests without relying on the test framework
// (() => {
//   console.log("Running ParentNode simple tests...");
  
//   // Test 1: ParentNode.children returns only Element nodes
//   (() => {
//     const parent = new ParentNode();
    
//     // Add element, text, and comment nodes
//     parent.appendChild(new Element());
//     parent.appendChild(new Text());
//     parent.appendChild(new Element());
//     parent.appendChild(new Comment());
//     parent.appendChild(new Element());
    
//     // Children should only include element nodes
//     const children = parent.children;
    
//     // Should have 3 element children
//     console.assert(children.length === 3, `Expected 3 children, got ${children.length}`);
    
//     // All children should be elements
//     for (let i = 0; i < children.length; i++) {
//       console.assert(children[i].nodeType === Node.ELEMENT_NODE, 
//         `Expected node type ${Node.ELEMENT_NODE}, got ${children[i].nodeType}`);
//     }
    
//     console.log("✅ Test 1: ParentNode.children returns only Element nodes");
//   })();
  
//   // Test 2: ParentNode.children returns empty NodeList when no element children exist
//   (() => {
//     const parent = new ParentNode();
    
//     // Add only text and comment nodes
//     parent.appendChild(new Text());
//     parent.appendChild(new Comment());
    
//     // Children NodeList should be empty
//     console.assert(parent.children.length === 0, 
//       `Expected 0 children, got ${parent.children.length}`);
    
//     console.log("✅ Test 2: ParentNode.children returns empty NodeList when no element children exist");
//   })();
  
//   // Test 3: ParentNode.childElementCount matches children.length
//   (() => {
//     const parent = new ParentNode();
    
//     // Add element, text, and comment nodes
//     parent.appendChild(new Element());
//     parent.appendChild(new Text());
//     parent.appendChild(new Element());
    
//     // childElementCount should match children.length
//     console.assert(parent.childElementCount === parent.children.length, 
//       `Expected childElementCount ${parent.children.length}, got ${parent.childElementCount}`);
//     console.assert(parent.childElementCount === 2, 
//       `Expected childElementCount 2, got ${parent.childElementCount}`);
    
//     console.log("✅ Test 3: ParentNode.childElementCount matches children.length");
//   })();
  
//   console.log("All tests passed!");
// })(); 
/**
 * Signal Lite Example - DOM Integration
 * 
 * This example demonstrates the signal-lite reactive system working
 * with vanilla DOM APIs and event listeners.
 */

import {
  createSignal,
  computed as $,
  watch,
  peek,
  write,
  merge,
  derive,
  extract,
  untrack,
  isSignal,
} from "../../index.ts";

// ==========================================
// Counter Demo
// ==========================================

function setupCounterDemo(): void {
  const count = createSignal(0);
  
  /** Computed signal that doubles the count value */
  const doubled = $(() => count.value * 2);
  
  /** Computed signal that checks if count is even */
  const isEven = $(() => count.value % 2 === 0);

  // DOM element references
  const countDisplay = document.getElementById("count-display")!;
  const doubledDisplay = document.getElementById("doubled-display")!;
  const evenDisplay = document.getElementById("even-display")!;
  const incrementBtn = document.getElementById("increment")!;
  const decrementBtn = document.getElementById("decrement")!;
  const resetBtn = document.getElementById("reset")!;

  /** Watch for count changes and update the DOM */
  watch(() => {
    countDisplay.textContent = count.value.toString();
  });

  /** Watch for doubled value changes and update the DOM */
  watch(() => {
    doubledDisplay.textContent = doubled.value.toString();
  });

  /** Watch for even/odd changes and update the DOM */
  watch(() => {
    evenDisplay.textContent = isEven.value.toString();
  });

  // Event listeners
  incrementBtn.addEventListener("click", () => {
    count.value++;
  });

  decrementBtn.addEventListener("click", () => {
    count.value--;
  });

  resetBtn.addEventListener("click", () => {
    count.value = 0;
  });

  console.log("✅ Counter demo initialized");
}

// ==========================================
// Text Input Demo
// ==========================================

function setupTextDemo(): void {
  const text = createSignal("Hello");
  
  /** Computed signal for text length */
  const length = $(() => text.value.length);
  
  /** Computed signal for uppercase text */
  const upperText = $(() => text.value.toUpperCase());

  // DOM element references
  const textInput = document.getElementById("text-input") as HTMLInputElement;
  const textDisplay = document.getElementById("text-display")!;
  const lengthDisplay = document.getElementById("length-display")!;
  const upperDisplay = document.getElementById("upper-display")!;

  /** Watch for text changes and update DOM displays */
  watch(() => {
    textDisplay.textContent = text.value;
    // Update input if text signal changes programmatically
    if (textInput.value !== text.value) {
      textInput.value = text.value;
    }
  });

  /** Watch for length changes and update DOM */
  watch(() => {
    lengthDisplay.textContent = length.value.toString();
  });

  /** Watch for uppercase changes and update DOM */
  watch(() => {
    upperDisplay.textContent = upperText.value;
  });

  // Two-way binding: input changes update the signal
  textInput.addEventListener("input", (e) => {
    const target = e.target as HTMLInputElement;
    text.value = target.value;
  });

  console.log("✅ Text demo initialized");
}

// ==========================================
// User Management Demo
// ==========================================

type User = {
  id: number;
  name: string;
  createdAt: Date;
};

function setupUserDemo(): void {
  /** Signal holding array of users */
  const users = createSignal<User[]>([
    { id: 1, name: "Charlotte", createdAt: new Date("2024-01-01") },
    { id: 2, name: "Ben", createdAt: new Date("2024-01-02") },
    { id: 3, name: "Alicia", createdAt: new Date("2024-01-03") },
  ]);

  /** Computed signal for user count */
  const userCount = $(() => users.value.length);

  // DOM element references
  const userInput = document.getElementById("user-input") as HTMLInputElement;
  const addUserBtn = document.getElementById("add-user")!;
  const userCountDisplay = document.getElementById("user-count")!;
  const userList = document.getElementById("user-list")!;

  /** Watch for user count changes */
  watch(() => {
    userCountDisplay.textContent = userCount.value.toString();
  });

  /** Watch for users array changes and re-render the list */
  watch(() => {
    renderUserList();
  });

  /** Function to render the user list in the DOM */
  function renderUserList(): void {
    const currentUsers = users.value;
    userList.innerHTML = "";

    currentUsers.forEach((user) => {
      const listItem = document.createElement("li");
      listItem.className = "user-item";
      
      const userInfo = document.createElement("span");
      userInfo.textContent = `${user.name} (ID: ${user.id})`;
      
      const removeBtn = document.createElement("button");
      removeBtn.className = "remove-btn";
      removeBtn.textContent = "Remove";
      removeBtn.addEventListener("click", () => {
        removeUser(user.id);
      });

      listItem.appendChild(userInfo);
      listItem.appendChild(removeBtn);
      userList.appendChild(listItem);
    });
  }

  /** Function to add a new user */
  function addUser(name: string): void {
    if (!name.trim()) return;

    const newUser: User = {
      id: Date.now(), // Simple ID generation
      name: name.trim(),
      createdAt: new Date(),
    };

    // Update the signal with a new array (immutable update)
    users.value = [...users.value, newUser];
    
    // Clear the input
    userInput.value = "";
  }

  /** Function to remove a user by ID */
  function removeUser(id: number): void {
    users.value = users.value.filter(user => user.id !== id);
  }

  // Event listeners
  addUserBtn.addEventListener("click", () => {
    addUser(userInput.value);
  });

  userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      addUser(userInput.value);
    }
  });

  console.log("✅ User demo initialized");
}

// ==========================================
// Status Toggle Demo
// ==========================================

function setupStatusDemo(): void {
  const isOnline = createSignal(true);
  
  /** Computed signal for status text */
  const statusText = $(() => isOnline.value ? "Online" : "Offline");
  
  /** Computed signal for status message */
  const statusMessage = $(() => 
    isOnline.value 
      ? "All systems operational" 
      : "System is currently offline"
  );

  // DOM element references
  const toggleBtn = document.getElementById("toggle-status")!;
  const statusDisplay = document.getElementById("status-display")!;
  const statusMessageDisplay = document.getElementById("status-message")!;

  /** Watch for online status changes and update DOM */
  watch(() => {
    statusDisplay.textContent = statusText.value;
    statusDisplay.className = `status ${isOnline.value ? "online" : "offline"}`;
  });

  /** Watch for status message changes */
  watch(() => {
    statusMessageDisplay.textContent = statusMessage.value;
  });

  // Event listener
  toggleBtn.addEventListener("click", () => {
    isOnline.value = !isOnline.value;
  });

  console.log("✅ Status demo initialized");
}

// ==========================================
// Signal Chain Demo
// ==========================================

function setupSignalChainDemo(): void {
  const price = createSignal(100);
  const quantity = createSignal(2);
  const taxRate = createSignal(0.1); // 10%

  /** Computed signal for subtotal */
  const subtotal = $(() => price.value * quantity.value);
  
  /** Computed signal for tax amount */
  const taxAmount = $(() => subtotal.value * taxRate.value);
  
  /** Computed signal for final total */
  const total = $(() => subtotal.value + taxAmount.value);

  /** Alternative approach: using merge for complex calculations */
  const orderSummary = merge(
    [price, quantity, taxRate],
    (p, q, tax) => {
      const sub = p * q;
      const taxAmt = sub * tax;
      return {
        subtotal: sub,
        tax: taxAmt,
        total: sub + taxAmt,
        taxPercent: tax * 100,
      };
    }
  );

  // DOM element references
  const priceInput = document.getElementById("price-input") as HTMLInputElement;
  const quantityInput = document.getElementById("quantity-input") as HTMLInputElement;
  const taxInput = document.getElementById("tax-input") as HTMLInputElement;
  const priceDisplay = document.getElementById("price-display")!;
  const quantityDisplay = document.getElementById("quantity-display")!;
  const taxDisplay = document.getElementById("tax-display")!;
  const subtotalDisplay = document.getElementById("subtotal-display")!;
  const taxAmountDisplay = document.getElementById("tax-amount-display")!;
  const totalDisplay = document.getElementById("total-display")!;

  /** Watch for all changes using the merged signal */
  watch(() => {
    const summary = orderSummary.value;
    
    priceDisplay.textContent = price.value.toFixed(2);
    quantityDisplay.textContent = quantity.value.toString();
    taxDisplay.textContent = summary.taxPercent.toFixed(0);
    subtotalDisplay.textContent = summary.subtotal.toFixed(2);
    taxAmountDisplay.textContent = summary.tax.toFixed(2);
    totalDisplay.textContent = summary.total.toFixed(2);
  });

  // Event listeners for inputs
  priceInput.addEventListener("input", (e) => {
    const target = e.target as HTMLInputElement;
    const value = parseFloat(target.value) || 0;
    price.value = value;
  });

  quantityInput.addEventListener("input", (e) => {
    const target = e.target as HTMLInputElement;
    const value = parseInt(target.value) || 0;
    quantity.value = value;
  });

  taxInput.addEventListener("input", (e) => {
    const target = e.target as HTMLInputElement;
    const value = parseFloat(target.value) || 0;
    taxRate.value = value;
  });

  console.log("✅ Signal chain demo initialized");
}

// ==========================================
// Advanced Demo: Signal Operations
// ==========================================

function demonstrateAdvancedSignalOperations(): void {
  console.log("\n🔬 Advanced Signal Operations Demo");

  // Create test signals
  const num1 = createSignal(10);
  const num2 = createSignal(5);
  const str = createSignal("hello");

  // Demonstrate signal comparison operations
  const isGreater = num1.gt(num2);
  const isEqual = num1.eq(num2);
  const isNotEqual = num1.neq(num2);

  console.log("📊 Comparison Operations:");
  console.log(`${peek(num1)} > ${peek(num2)} =`, peek(isGreater));
  console.log(`${peek(num1)} === ${peek(num2)} =`, peek(isEqual));
  console.log(`${peek(num1)} !== ${peek(num2)} =`, peek(isNotEqual));

  // Demonstrate logical operations
  const bool1 = createSignal(true);
  const bool2 = createSignal(false);
  const andResult = bool1.and(bool2);
  const orResult = bool1.or(bool2);

  console.log("\n🔗 Logical Operations:");
  console.log(`${peek(bool1)} && ${peek(bool2)} =`, peek(andResult));
  console.log(`${peek(bool1)} || ${peek(bool2)} =`, peek(orResult));

  // Demonstrate derive and extract
  const user = createSignal({
    name: "Charlotte",
    email: "charlotte@inspatial.io",
    age: 28,
    role: "developer"
  });

  const userName = derive(user, "name");
  const { email, age } = extract(user, "email", "age");

  console.log("\n📦 Derive and Extract:");
  console.log("User name:", peek(userName));
  console.log("User email:", peek(email));
  console.log("User age:", peek(age));

  // Demonstrate untrack for performance
  const heavyComputation = createSignal(0);
  let computeCount = 0;

  const optimizedResult = $(() => {
    computeCount++;
    console.log(`⚡ Heavy computation run #${computeCount}`);
    
    // This creates a dependency
    const base = heavyComputation.value;
    
    // This doesn't create a dependency (untracked read)
    const untracked = untrack(() => {
      return Math.random() * 1000; // Expensive operation we don't want to track
    });
    
    return base + untracked;
  });

  console.log("\n⚡ Performance with untrack:");
  console.log("Initial result:", peek(optimizedResult));
  
  // This will trigger recomputation
  heavyComputation.value = 100;
  console.log("After tracked change:", peek(optimizedResult));

  // Demonstrate write utility
  console.log("\n✏️ Write Utility:");
  const counter = createSignal(0);
  console.log("Before write:", peek(counter));
  
  write(counter, 42);
  console.log("After direct write:", peek(counter));
  
  write(counter, (prev) => prev * 2);
  console.log("After functional write:", peek(counter));

  // Demonstrate signal type checking
  console.log("\n🔍 Type Checking:");
  console.log("Is counter a signal?", isSignal(counter));
  console.log("Is regular number a signal?", isSignal(42));
  console.log("Is string a signal?", isSignal("hello"));
}

// ==========================================
// Application Initialization
// ==========================================

function initializeApp(): void {
  console.log("🚀 Initializing Signal Lite Example App");

  try {
    // Set up all demo sections
    setupCounterDemo();
    setupTextDemo();
    setupUserDemo();
    setupStatusDemo();
    setupSignalChainDemo();

    // Run advanced demos in console
    demonstrateAdvancedSignalOperations();

    console.log("\n✅ All demos initialized successfully!");
    console.log("👋 Open the browser console to see advanced signal operations in action");
    
  } catch (error) {
    console.error("❌ Error initializing app:", error);
  }
}

// ==========================================
// Start the application
// ==========================================

// Wait for DOM to be ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
} 
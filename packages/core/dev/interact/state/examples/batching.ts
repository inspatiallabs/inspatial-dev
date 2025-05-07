/**
 * # Batch Updates Example
 * @summary #### Demonstrates performance optimization with batch updates
 * 
 * This example shows how to use batch updates for better performance
 * and state transaction management.
 */

import { createState, StateManager } from "../index";

// --- Shopping cart state ---

interface CartItemType {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartStateType {
  items: CartItemType[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  couponCode: string | null;
  discountAmount: number;
  lastUpdated: number;
}

// Create cart state
const cartState = createState<CartStateType>({
  id: "shoppingCart",
  initialState: {
    items: [],
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0,
    couponCode: null,
    discountAmount: 0,
    lastUpdated: Date.now()
  }
});

// --- Helper functions ---

// Calculate cart totals
function calculateTotals(items: CartItemType[]): Pick<CartStateType, 'subtotal' | 'tax' | 'shipping' | 'total'> {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculate tax (10%)
  const tax = subtotal * 0.1;
  
  // Calculate shipping (flat $5 or free for orders over $50)
  const shipping = subtotal > 50 ? 0 : 5;
  
  // Calculate total
  const total = subtotal + tax + shipping;
  
  return { subtotal, tax, shipping, total };
}

// Add an item to the cart (without batching)
function addItemWithoutBatching(item: CartItemType): void {
  // Get current state
  const currentState = cartState.getState();
  
  // Check if item already exists
  const existingItemIndex = currentState.items.findIndex(i => i.id === item.id);
  
  let newItems: CartItemType[];
  
  if (existingItemIndex >= 0) {
    // Update existing item quantity
    newItems = [...currentState.items];
    newItems[existingItemIndex] = {
      ...newItems[existingItemIndex],
      quantity: newItems[existingItemIndex].quantity + item.quantity
    };
  } else {
    // Add new item
    newItems = [...currentState.items, item];
  }
  
  // First update: Set new items array
  cartState.setState({ items: newItems });
  
  // Second update: Calculate new totals
  const { subtotal, tax, shipping, total } = calculateTotals(newItems);
  cartState.setState({ subtotal, tax, shipping, total });
  
  // Third update: Set last updated timestamp
  cartState.setState({ lastUpdated: Date.now() });
}

// Add an item to the cart (with batching)
function addItemWithBatching(item: CartItemType): void {
  cartState.batch(state => {
    // Check if item already exists
    const existingItemIndex = state.items.findIndex(i => i.id === item.id);
    
    let newItems: CartItemType[];
    
    if (existingItemIndex >= 0) {
      // Update existing item quantity
      newItems = [...state.items];
      newItems[existingItemIndex] = {
        ...newItems[existingItemIndex],
        quantity: newItems[existingItemIndex].quantity + item.quantity
      };
    } else {
      // Add new item
      newItems = [...state.items, item];
    }
    
    // Calculate new totals
    const { subtotal, tax, shipping, total } = calculateTotals(newItems);
    
    // Return all changes at once
    return {
      items: newItems,
      subtotal,
      tax,
      shipping,
      total,
      lastUpdated: Date.now()
    };
  });
}

// --- More complex batch operations ---

// Apply a coupon code
function applyCoupon(code: string): void {
  StateManager.beginBatch();
  
  try {
    // 1. First update - set the coupon code
    cartState.setState({ couponCode: code });
    
    // 2. Calculate discount based on code
    const discount = calculateDiscount(code, cartState.getState().subtotal);
    
    // 3. Apply discount
    cartState.setState({ discountAmount: discount });
    
    // 4. Update the total
    cartState.setState(state => ({
      total: state.subtotal + state.tax + state.shipping - discount
    }));
    
    // 5. Set last updated timestamp
    cartState.setState({ lastUpdated: Date.now() });
    
    // Commit all changes
    StateManager.commitBatch();
  } catch (error) {
    // If anything fails, roll back all changes
    StateManager.cancelBatch();
    console.error("Failed to apply coupon:", error);
  }
}

// Calculate discount amount based on coupon code
function calculateDiscount(code: string, subtotal: number): number {
  switch (code.toUpperCase()) {
    case "SAVE10":
      return subtotal * 0.1; // 10% off
    case "SAVE20":
      return subtotal * 0.2; // 20% off
    case "FREESHIP":
      return 5; // Free shipping ($5 value)
    default:
      return 0;
  }
}

// Checkout process with multiple states
function checkout(paymentMethod: string): void {
  // Create order state (normally this would be separate)
  const orderState = createState({
    id: "currentOrder",
    initialState: {
      orderId: `ORD-${Date.now()}`,
      items: [] as CartItemType[],
      paymentMethod,
      status: "pending",
      total: 0,
      createdAt: Date.now()
    }
  });
  
  // Start global batch transaction
  StateManager.beginBatch();
  
  try {
    // 1. Update order with cart data
    orderState.setState(orderState => {
      const cart = cartState.getState();
      return {
        ...orderState,
        items: [...cart.items],
        total: cart.total
      };
    });
    
    // 2. Process "payment" (would be async in real app)
    orderState.setState({ status: "processing" });
    
    // Simulate payment processing
    if (Math.random() > 0.2) { // 80% success rate
      // 3. Update order status
      orderState.setState({ status: "completed" });
      
      // 4. Clear cart
      cartState.setState({
        items: [],
        subtotal: 0,
        tax: 0,
        shipping: 0,
        total: 0,
        couponCode: null,
        discountAmount: 0,
        lastUpdated: Date.now()
      });
      
      // Commit all changes
      StateManager.commitBatch();
      console.log("Order completed successfully:", orderState.getState().orderId);
    } else {
      // Payment failed
      throw new Error("Payment processing failed");
    }
  } catch (error) {
    // If anything fails, roll back all changes
    StateManager.cancelBatch();
    console.error("Checkout failed:", error);
  }
}

// --- Demo run function ---

export function runBatchingDemo(): void {
  console.log("=== Batch Updates Demo ===");
  
  console.log("Initial cart:", cartState.getState());
  
  // Create some test products
  const products = [
    { id: "p1", name: "T-Shirt", price: 19.99, quantity: 1 },
    { id: "p2", name: "Jeans", price: 49.99, quantity: 1 },
    { id: "p3", name: "Sneakers", price: 79.99, quantity: 1 }
  ];
  
  // Add products without batching (will cause 3 renders per product)
  console.log("\nAdding products WITHOUT batching:");
  console.time("Without batching");
  products.forEach(product => {
    addItemWithoutBatching(product);
  });
  console.timeEnd("Without batching");
  
  // Reset cart
  cartState.setState({
    items: [],
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0,
    couponCode: null,
    discountAmount: 0,
    lastUpdated: Date.now()
  });
  
  // Add products with batching (will cause only 1 render per product)
  console.log("\nAdding products WITH batching:");
  console.time("With batching");
  products.forEach(product => {
    addItemWithBatching(product);
  });
  console.timeEnd("With batching");
  
  console.log("\nFinal cart:", cartState.getState());
  
  // Apply coupon
  console.log("\nApplying coupon:");
  applyCoupon("SAVE20");
  console.log("Cart with discount:", cartState.getState());
  
  // Checkout
  console.log("\nProcessing checkout:");
  checkout("credit_card");
  console.log("Cart after checkout:", cartState.getState());
}

// Export for testing
export { cartState, addItemWithBatching, applyCoupon, checkout }; 
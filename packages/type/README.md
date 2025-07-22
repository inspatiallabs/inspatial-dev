<div align="center">
    <picture>
        <source media="(prefers-color-scheme: light)" srcset="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/icon-brutal-light.svg">
        <source media="(prefers-color-scheme: dark)" srcset="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/icon-brutal-dark.svg">
        <img src="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/icon-brutal-dark.svg" alt="InSpatial" width="300"/>
    </picture>

<br>
   <br>

<p align="center">
    <picture>
        <source media="(prefers-color-scheme: light)" srcset="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/logo-light.svg">
        <source media="(prefers-color-scheme: dark)" srcset="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/logo-dark.svg">
        <img src="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/logo-dark.svg" height="75" alt="InSpatial">
    </picture>
</p>

_Reality is your canvas_

<h3 align="center">
    InSpatial is a universal development environment (UDE) <br> for building cross-platform and spatial (AR/MR/VR) applications
  </h3>

[![InSpatial Dev](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/dev-badge.svg)](https://www.inspatial.dev)
[![InSpatial Cloud](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/cloud-badge.svg)](https://www.inspatial.cloud)
[![InSpatial App](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/app-badge.svg)](https://www.inspatial.io)
[![InSpatial Store](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/store-badge.svg)](https://www.inspatial.store)

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://opensource.org/licenses/Intentional-License-1.0)
[![Discord](https://img.shields.io/badge/discord-join_us-5a66f6.svg?style=flat-square)](https://discord.gg/inspatiallabs)
[![Twitter](https://img.shields.io/badge/twitter-follow_us-1d9bf0.svg?style=flat-square)](https://twitter.com/inspatiallabs)
[![LinkedIn](https://img.shields.io/badge/linkedin-connect_with_us-0a66c2.svg?style=flat-square)](https://www.linkedin.com/company/inspatiallabs)

</div>

## 

<div align="center">

| InSpatial                                                                                                                     | Description                          | Link                                           |
| ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ---------------------------------------------- |
| [![InSpatial Dev](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/dev-badge.svg)](https://www.inspatial.dev)       | Universal Libraries & Frameworks     | [inspatial.dev](https://www.inspatial.dev)     |
| [![InSpatial Cloud](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/cloud-badge.svg)](https://www.inspatial.cloud) | Backend APIs and SDKs                | [inspatial.cloud](https://www.inspatial.cloud) |
| [![InSpatial App](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/app-badge.svg)](https://www.inspatial.io)       | Build and manage your InSpatial apps | [inspatial.app](https://www.inspatial.io)     |
| [![InSpatial Store](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/store-badge.svg)](https://www.inspatial.store) | Deploy and discover InSpatial apps   | [inspatial.store](https://www.inspatial.store) |

</div>

---

## 🔍 InSpatial Type (🟡 Preview)

Universal runtime type validation that works seamlessly across Deno, Node.js, and Bun runtimes. Define, validate, and transform your data with type safety across all platforms - from mobile to desktop, and 3D/spatial environments!

## 🌟 Features

- 🌍 Runtime agnostic (Deno, Node.js, Bun)
- 🔍 Framework Agnostic
- 🎮 Optimized for Immersive & Spatial Experiences
- 📝 Concise and expressive type definitions (half as long as alternatives)
- 🎯 Lightning-fast runtime validation with intrinsic optimization
- ⚡ Full type inference for TypeScript
- 🔄 Pattern matching with type syntax (via `matchType`)
- 🔍 Deep introspection of type relationships at runtime
- 🎨 Detailed error messages with customizable highlights
- 🛡️ Custom type patterns and validations
- 🔄 Value transformation with type-safe morphs
- 🧪 Seamless integration with standard TypeScript
- 📝 JSON Schema compatibility (via `toJsonSchema` and `fromJsonSchema`)
- 🧩 Pluggable validation ecosystem (via Extension System)
- 📸 Value transformation pipelines (via Pipeline System)
- 📈 Performance optimization (via memoization and benchmarking)
- 📦 Schema composition and sharing (via Schema Registry)

## 🔮 Coming Soon

- 🎮 XR (AR/VR/MR) Spatial Type Validation
- 🌐 3D Asset Validation
- 📊 Spatial Computing Type Safety
- 🤖 AI-Powered Type Inference

## ✨ Advanced Features ✨

<table>
  <tr>
    <td>
      <h4>🔄 Pipeline System</h4>
      <p>Chain transformations with validation at each step! Perfect for processing API data or form inputs.</p>
      <pre><code>const pipeline = createTypePipeline("string")
  .pipe(JSON.parse, "object")
  .pipe(addTimestamp, "object")</code></pre>
    </td>
    <td>
      <h4>🧩 Extension System</h4>
      <p>Create custom validators for emails, URLs, or your own formats! Add validation beyond the basics.</p>
      <pre><code>registerTypeExtension(emailTypeExtension())
validateTypeExtension("email", "user@example.com")</code></pre>
    </td>
  </tr>
  <tr>
    <td>
      <h4>⚡ Performance Tools</h4>
      <p>Speed up your app with validation caching and benchmarking! Find the fastest approach.</p>
      <pre><code>// Cache validation results
memoizeTypeValidation(UserType, userData)

// Compare implementations
compareTypeBenchmarks({...})</code></pre>
</td>
<td>
<h4>📋 JSON Schema Support</h4>
<p>Convert between InSpatial Type and standard JSON Schema! Work with other tools seamlessly.</p>
<pre><code>// To JSON Schema
toJsonSchema(UserType, options)

// From JSON Schema
fromJsonSchema(jsonSchema)</code></pre>
</td>

</tr>
  <tr>
    <td colspan="2" align="center">
      <h4>📚 Schema Registry - Central Type Library</h4>
      <p>Organize, share, and reuse your types across your entire application!</p>
      <pre><code>// Register a type
SchemaRegistry.init().register("User", UserType, "models")

// Use it anywhere
const User = typeRef("User", "models")</code></pre>
</td>

</tr>
</table>

<div align="center">
  <h4>🚀 Keep reading to learn how to use all these amazing features! 🚀</h4>
</div>




## 📦 Install InSpatial Type:

Choose your preferred package manager:

```bash
deno install jsr:@inspatial/type
```

## 

```bash
npx jsr add @inspatial/type
```

## 

```bash
yarn dlx jsr add @inspatial/type
```

## 

```bash
pnpm dlx jsr add @inspatial/type
```

## 

```bash
bunx jsr add @inspatial/type
```

## 🛠️ Step-by-Step Usage Guide

Here are the essential usage patterns for working with InSpatial Type:

### 1. **Defining and Validating Types**

```typescript
import { type, TypeErrors } from "@inspatial/type"

// Define types for validation
const UserType = type({
  name: "string",
  age: "number|>0", // Must be positive
  roles: "string[]",
  isActive: "boolean"
})

// Validate data at runtime
function validateUser(data: unknown) {
  const result = UserType(data)
  
  if (result instanceof TypeErrors) {
    // Handle validation errors
    console.error("Invalid user data:", result.summary)
    return null
  }
  
  // Use the validated data safely
  return result
}
```

### 2. **Working with TypeScript**

InSpatial Type works seamlessly with TypeScript's type system:

```typescript
import { inFetch } from "@inspatial/fetch"

// Extract TypeScript types from runtime validators
type User = typeof UserType.infer 

// Type-safe function signatures
function processUser(user: User) {
  // TypeScript knows the shape of user
}

// Safe API handling
async function fetchUser(id: string): Promise<User> {
  const data = await inFetch(`/api/users/${id}`).then(r => r.json())
  const user = UserType(data)
  
  if (user instanceof TypeErrors) {
    throw new Error(`Invalid user data: ${user.summary}`)
  }
  
  return user // TypeScript knows this is type User
}
```

### 3. **Type Composition and Reuse**

```typescript
// Define reusable components
const AddressType = type({
  street: "string",
  city: "string",
  zipCode: "string"
})

// Compose types together
const CustomerType = type({
  id: "string",
  name: "string",
  address: AddressType, // Reuse the address type
  orders: "string[]"
})
```

### 4. **Advanced Features Overview**

InSpatial Type includes several advanced capabilities:

- **Pipeline System**: Chain transformations with validation
- **Extension System**: Create custom validators for special formats
- **Schema Registry**: Share types across your application
- **JSON Schema Support**: Interoperate with other validation systems
- **Performance Tools**: Optimize validation performance

See the API Reference below for detailed documentation of these features.

## 🎯 API Reference

### Core Functions

| Function                     | Description                            |
| ---------------------------- | -------------------------------------- |
| `type(schema)`               | Define and create a type validator     |
| `defineType(base, options)`  | Create a custom type definition        |
| `declareType(name, schema)`  | Declare a named type                   |
| `configureType(options)`     | Configure global type options          |
| `matchType(value, patterns)` | Pattern match against type definitions |
| `scopeType(options)`         | Create an isolated scope for types     |
| `inspatialType`              | Direct access to the underlying ArkType implementation |

### Error Handling

| Class        | Description                                                                                                                                                                                                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `TypeErrors` | Collection of validation errors with enhanced `instanceof` checking capabilities. TypeErrors instances are array-like objects that contain individual validation errors, offering methods like `summary` for formatted error messages and `throw()` to convert errors to exceptions. |
| `TypeError`  | Individual validation error with enhanced `instanceof` checking. TypeError objects provide detailed information about specific validation failures, including the failed validation rule, path, and expected vs. actual values.                                                      |

### Advanced Type Features

| Feature           | Description                                   |
| ----------------- | --------------------------------------------- |
| `genericType(fn)` | Create generic type definitions               |
| `keywordsType`    | Access built-in keywords for type definitions |
| `TypeHkt`         | Higher-kinded type utilities                  |

### 🔄 Pipeline System - Transform and Process Data

The Pipeline system lets you build chains of operations that transform data while validating types at each step. This is perfect for processing API data, form inputs, or any data that needs multiple transformations.

```typescript
import { createTypePipeline, tryPipe } from "@inspatial/type"

// Create a pipeline that starts with a string type
const jsonProcessor = createTypePipeline("string")
  // Transform the string to an object
  .pipe(
    (input) => JSON.parse(input), // Convert string to object
    "object", // Validate the result is an object
  )
  // Add a timestamp to the object
  .pipe(
    (obj) => ({ ...obj, processedAt: Date.now() }),
    "object", // Validate again
  )

// Process data with validation at each step
const result = jsonProcessor.execute('{"name":"John","age":30}')
// Result: { name: "John", age: 30, processedAt: 1629384789012 }

// For safer execution with error handling
const safeResult = tryPipe(jsonProcessor, '{"name":"John","age":30}')
if (safeResult.success) {
  console.log("Processed:", safeResult.result)
} else {
  console.error("Error:", safeResult.error)
}
```

#### Pipeline Functions

| Function                        | Description                                                |
| ------------------------------- | ---------------------------------------------------------- |
| `createTypePipeline(inputType)` | Create a new pipeline with an initial input type           |
| `tryPipe(pipeline, input)`      | Safely execute a pipeline with error handling              |
| `stringToNumber()`              | Create a transformer that converts strings to numbers      |
| `parseJson()`                   | Create a transformer that parses JSON strings to objects   |
| `stringifyJson()`               | Create a transformer that converts objects to JSON strings |

#### Pipeline Methods

| Method                        | Description                               |
| ----------------------------- | ----------------------------------------- |
| `pipe(transform, outputType)` | Add a transformation step with validation |
| `map(mapFn, elementType)`     | Transform elements of an array            |
| `filter(filterFn)`            | Filter elements of an array               |
| `validate(validatorType)`     | Add a validation step                     |
| `execute(input)`              | Execute the pipeline with input data      |
| `tryExecute(input)`           | Execute with error handling               |

### 🧩 Extension System - Create Custom Validators

The Extension system allows you to create custom validators for special data types like emails, URLs, or domain-specific formats. This is how you add your own validation rules beyond what's built in.

```typescript
import {
  emailTypeExtension,
  registerTypeExtension,
  type,
  urlTypeExtension,
  validateTypeExtension,
} from "@inspatial/type"

// Use built-in email extension
registerTypeExtension(emailTypeExtension())

// Create a custom validator for usernames
const usernameExtension = {
  name: "username",
  description:
    "Validates usernames (letters, numbers, underscores, 3-20 chars)",
  keywords: ["username"],
  validate: (value) => {
    if (typeof value !== "string") {
      return { valid: false, message: "Username must be a string" }
    }

    const pattern = /^[a-zA-Z0-9_]{3,20}$/
    if (!pattern.test(value)) {
      return {
        valid: false,
        message:
          "Username must be 3-20 characters using only letters, numbers, and underscores",
      }
    }

    return value // Return the value if valid
  },
}

// Register your custom extension
registerTypeExtension(usernameExtension)

// Create types using these extensions
const UserType = type({
  username: "string", // Now we can validate using our extension
  email: "string",
})

// Validate using the extension
const validEmail = validateTypeExtension("email", "user@example.com")
// Returns: "user@example.com"

const invalidEmail = validateTypeExtension("email", "invalid-email")
// Returns: { valid: false, message: "Invalid email format" }

const validUsername = validateTypeExtension("username", "john_doe123")
// Returns: "john_doe123"
```

#### Extension Functions

| Function                                         | Description                                   |
| ------------------------------------------------ | --------------------------------------------- |
| `registerTypeExtension(extension)`               | Register a custom validation extension        |
| `validateTypeExtension(keyword, value, options)` | Validate a value using a registered extension |
| `emailTypeExtension()`                           | Built-in email address validator              |
| `urlTypeExtension()`                             | Built-in URL validator                        |

### ⚡ Performance Tools - Optimize Validation Speed

The Performance system helps optimize validation speed, especially for repeated validations of similar data. It includes benchmarking tools to compare different approaches.

```typescript
import {
  compareTypeBenchmarks,
  memoizeTypeValidation,
  runTypeBenchmark,
  type,
} from "@inspatial/type"

// Define a complex object type
const UserType = type({
  id: "string",
  name: "string",
  age: "number|>=18",
  roles: "string[]",
  settings: {
    theme: "'light' | 'dark'",
    notifications: "boolean",
    language: "string",
  },
})

// Function that uses regular validation
function validateUserDirect(data) {
  return UserType(data)
}

// Function that uses memoized validation
function validateUserMemoized(data) {
  return memoizeTypeValidation(UserType, data)
}

// Sample data for testing
const userData = {
  id: "12345",
  name: "John Doe",
  age: 25,
  roles: ["user", "admin"],
  settings: {
    theme: "dark",
    notifications: true,
    language: "en",
  },
}

// Compare performance (validates each function 1000 times)
const results = compareTypeBenchmarks({
  direct: () => validateUserDirect(userData),
  memoized: () => validateUserMemoized(userData),
}, 1000)

console.log("Fastest method:", results[0].name)
console.log("Operations per second:", results[0].opsPerSecond)

// Run a specific benchmark 100 times
const benchmark = runTypeBenchmark(
  "memoizedValidation",
  () => validateUserMemoized(userData),
  100,
)

console.log("Average time:", benchmark.avgTime, "ms")
```

#### Performance Functions

| Function                                             | Description                                      |
| ---------------------------------------------------- | ------------------------------------------------ |
| `memoizeTypeValidation(validator, value, cacheKey?)` | Cache validation results for better performance  |
| `runTypeBenchmark(name, fn, iterations)`             | Run a performance benchmark                      |
| `compareTypeBenchmarks(benchmarks, iterations)`      | Compare performance of different implementations |

### TypeScript Interfaces

The following TypeScript types and interfaces are exported from the library:

| Interface                   | Description                                  |
| --------------------------- | -------------------------------------------- |
| `InSpatialType`             | Core type for the InSpatial Type system      |
| `ConfigType`                | Configuration for types                      |
| `SchemaConfig`              | Schema configuration options                 |
| `SchemaScopeConfig`         | Configuration for type scopes                |
| `AmbientType`               | Ambient type configuration                   |
| `InTypeJsonSchema`          | JSON Schema conversion options               |
| `InTypeExtension`           | Custom type extension definition             |
| `InTypePipeline`            | Pipeline for type transformations            |
| `InTypePerformance`         | Performance optimization utilities           |
| `InTypeValidationExtension` | Extension for validation rules               |
| `InTypeValidationOptions`   | Options for validation extensions            |
| `InTypeValidationResult`    | Result from validation extension             |
| `InTypePipelineStep`        | Individual step in a transformation pipeline |
| `InTypePipelineOptions`     | Options for pipeline operations              |
| `InTypeTransformResult`     | Result from pipeline transformations         |
| `InTypeBenchmarkResult`     | Result from performance benchmarks           |

### 📝 JSON Schema Compatibility

The JSON Schema compatibility system allows you to convert between InSpatial Type definitions and standard JSON Schema format, enabling interoperability with other tools and frameworks.

```typescript
import { fromJsonSchema, toJsonSchema, type } from "@inspatial/type"

// Define a type
const UserType = type({
  id: "string",
  name: "string",
  age: "number|>0",
  email: "string",
  isAdmin: "boolean?",
  roles: "string[]",
})

// Convert to JSON Schema
const jsonSchema = toJsonSchema(UserType, {
  title: "User Schema",
  description: "Schema for user data",
})

console.log(jsonSchema)
/* Output:
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "User Schema",
  "description": "Schema for user data",
  "properties": {
    "id": { "type": "string" },
    "name": { "type": "string" },
    "age": { "type": "number", "minimum": 0, "exclusiveMinimum": true },
    "email": { "type": "string" },
    "isAdmin": { "type": "boolean" },
    "roles": {
      "type": "array",
      "items": { "type": "string" }
    }
  },
  "required": ["id", "name", "age", "email", "roles"]
}
*/

// Convert from JSON Schema
const inputSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "productId": { "type": "string" },
    "name": { "type": "string" },
    "price": { "type": "number", "minimum": 0 },
    "tags": {
      "type": "array",
      "items": { "type": "string" },
    },
  },
  "required": ["productId", "name", "price"],
}

const ProductType = fromJsonSchema(inputSchema)

// Use the converted type
const validProduct = ProductType({
  productId: "prod-123",
  name: "XR Headset",
  price: 599.99,
  tags: ["VR", "gaming"],
})

console.log(validProduct)
// Output: { productId: "prod-123", name: "XR Headset", price: 599.99, tags: ["VR", "gaming"] }
```

#### JSON Schema Functions

| Function                       | Description                                |
| ------------------------------ | ------------------------------------------ |
| `toJsonSchema(type, options?)` | Convert an InSpatial Type to JSON Schema   |
| `fromJsonSchema(schema)`       | Convert a JSON Schema to an InSpatial Type |
| `JsonSchemaDraft`              | Enum of supported JSON Schema versions     |

#### JSON Schema Options

| Option                 | Description                                             |
| ---------------------- | ------------------------------------------------------- |
| `title`                | The title for the JSON Schema                           |
| `description`          | The description for the JSON Schema                     |
| `schemaVersion`        | The JSON Schema version (default: "draft-07")           |
| `additionalProperties` | Whether to allow additional properties (default: false) |
| `includeExamples`      | Whether to include example values in the schema         |

### 📦 Schema Registry - Share and Reuse Types

The Schema Registry system provides a central repository for your type definitions, making it easy to share and reuse types across your application.

```typescript
import { SchemaRegistry, type, typeRef } from "@inspatial/type"

// Initialize a registry (typically done once at app startup)
const registry = SchemaRegistry.init()

// Define some types
const AddressType = type({
  street: "string",
  city: "string",
  zipCode: "string",
  country: "string",
})

const UserType = type({
  id: "string",
  name: "string",
  email: "string",
  age: "number|>0",
})

// Register types with categories
registry.register("Address", AddressType, "models")
registry.register("User", UserType, "models")

// Later in another part of your application:

// Get a reference to a registered type
const Address = typeRef("Address", "models")
const User = typeRef("User", "models")

// Use these types just like regular types
const validAddress = Address({
  street: "123 Main St",
  city: "Anytown",
  zipCode: "12345",
  country: "US",
})

// Register dependent types that reference each other
const OrderType = type({
  orderId: "string",
  customer: User, // Reference the User type
  shippingAddress: Address, // Reference the Address type
  items: "string[]",
  total: "number|>0",
})

registry.register("Order", OrderType, "models")

// You can also list all available types
const modelTypes = registry.list("models")
console.log(modelTypes) // ["Address", "User", "Order"]

// Or get details about registered types
const userTypeInfo = registry.info("User", "models")
console.log(userTypeInfo) // { name: "User", category: "models", ... }
```

#### Schema Registry Functions

| Function                       | Description                          |
| ------------------------------ | ------------------------------------ |
| `SchemaRegistry.init()`        | Initialize the schema registry       |
| `SchemaRegistry.getInstance()` | Get the singleton registry instance  |
| `typeRef(name, category?)`     | Get a reference to a registered type |

#### Schema Registry Methods

| Method                            | Description                               |
| --------------------------------- | ----------------------------------------- |
| `register(name, type, category?)` | Register a type with an optional category |
| `get(name, category?)`            | Get a registered type                     |
| `list(category?)`                 | List all registered types in a category   |
| `info(name, category?)`           | Get metadata about a registered type      |
| `unregister(name, category?)`     | Remove a type from the registry           |



## 🔄 TypeScript vs InSpatial Type: Understanding the Difference

<div align="center">
  <table>
    <tr>
      <td align="center" style="background-color: #9000FF; padding: 15px; border-radius: 10px; color: white;">
        <h2>🚨 IMPORTANT DISTINCTION 🚨</h2>
        <h3>💡 InSpatial Type is not a replacement for TypeScript - it's a powerful companion! 💡</h3>
        <p><b>TypeScript</b>: Checks types during development</p>
        <p><b>InSpatial Type</b>: Validates data while your app is running</p>
        <h4>👇 Keep reading to understand why you need both! 👇</h4>
      </td>
    </tr>
  </table>
</div>

### ⚔️ TypeScript: Compile-Time Safety

TypeScript provides **static type checking** during development:

```typescript
// TypeScript only exists during development
interface User {
  name: string
  age: number
  role: "admin" | "user"
}

// These types disappear when compiled to JavaScript!
function greetUser(user: User) {
  console.log(`Hello, ${user.name}!`)
}
```

### 🛡️ InSpatial Type: Runtime Validation

InSpatial Type validates data at **runtime** when your app is actually running:

```typescript
// InSpatial Type exists during development AND at runtime
const UserType = type({
  name: "string",
  age: "number",
  role: "'admin' | 'user'",
})

// This validation happens while your app is running
function greetUser(userData: unknown) {
  const user = UserType(userData)

  if (user instanceof TypeErrors) {
    // Handle invalid data!
    console.error("Invalid user:", user.summary)
    return
  }

  // Now you know the data is safe to use
  console.log(`Hello, ${user.name}!`)
}
```

### 🔄 Best of Both Worlds

Use them together for the ultimate type safety:

```typescript
// 1. Define with InSpatial Type for runtime validation
const UserType = type({
  name: "string",
  age: "number|>0", // Must be positive
  role: "'admin' | 'user'",
})

// 2. Extract TypeScript type for static checking
type User = typeof UserType.infer

// 3. Use TypeScript type in your function signatures
function processUser(user: User) {
  // TypeScript checks during development
  console.log(`Processing ${user.role}: ${user.name}`)
}

// 4. Validate external data at runtime
function handleAPIResponse(data: unknown) {
  const validatedUser = UserType(data)

  if (validatedUser instanceof TypeErrors) {
    throw new Error(`Invalid user data: ${validatedUser.summary}`)
  }

  // Now it's safe to process
  processUser(validatedUser)
}
```

### 📊 When to Use What

| TypeScript                      | InSpatial Type                |
| ------------------------------- | ----------------------------- |
| ✅ During development           | ✅ During development         |
| ✅ Static code analysis         | ✅ Runtime data validation    |
| ✅ IDE autocompletion           | ✅ Dynamic data checking      |
| ❌ No runtime presence          | ✅ Exists at runtime          |
| ❌ Can't validate API responses | ✅ Perfect for API boundaries |
| ❌ No validation for user input | ✅ Validates user input       |

### 🔄 How They Work Together

<div align="center">
  <pre>
  ┌─────────────────────┐     ┌─────────────────────┐
  │                     │     │                     │
  │    Development      │     │     Production      │
  │                     │     │                     │
  └──────────┬──────────┘     └──────────┬──────────┘
             │                           │
             ▼                           ▼
  ┌─────────────────────┐     ┌─────────────────────┐
  │    TypeScript       │     │    InSpatial Type   │
  │                     │     │                     │
  │  - Static checking  │     │  - Runtime checking │
  │  - Compile errors   │     │  - Data validation  │
  │  - Type inference   │     │  - Error handling   │
  └──────────┬──────────┘     └──────────┬──────────┘
             │                           │
             │                           │
             ▼                           ▼
  ┌─────────────────────────────────────────────────┐
  │                                                 │
  │              Your Secure Application            │
  │                                                 │
  │  - Safe from development errors (TypeScript)    │
  │  - Protected from bad runtime data (InSpatial)  │
  │                                                 │
  └─────────────────────────────────────────────────┘
  </pre>
</div>

### 🌟 When InSpatial Type Shines

InSpatial Type is especially valuable for validating data from external sources:

- **API Responses**: Validate incoming data before processing
- **User Inputs**: Ensure forms and user-provided data is correct
- **Configuration Files**: Validate app settings at startup
- **External Files**: Verify imported data matches expectations
- **3D/XR Data**: Validate spatial data, coordinates, and transforms

#### Example: API Data Validation

```typescript
import { inFetch } from "@inspatial/fetch"

// Define your expected API response shape
const ApiResponseType = type({
  status: "number",
  data: {
    users: {
      id: "string",
      name: "string",
      "active?": "boolean" // Optional field
    }[]
  }
});

async function fetchUsers() {
  try {
    const response = await inFetch('/api/users');
    const data = await response.json();
    
    // Validate the response
    const validated = ApiResponseType(data);
    
    if (validated instanceof TypeErrors) {
      console.error("API returned unexpected data:", validated.summary);
      return [];
    }
    
    // Now it's safe to use the data
    return validated.data.users;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
}
```

## TypeScript Interfaces

This package exports the following TypeScript interfaces and types:

| Interface               | Description                                 |
| ----------------------- | ------------------------------------------- |
| `TypeErrors`            | Collection of validation errors             |
| `TypeError`             | Individual validation error                 |
| `TypeParser`            | Type parsing functionality                  |
| `TypeValidator`         | Type validation functionality               |
| `TypePattern`           | Pattern for type matching                   |
| `TypeOptions`           | Configuration options for types             |
| `InTypePipelineType`    | Type definition for pipelines              |
| `InTypeExtensionType`   | Type definition for extensions              |
| `InTypeRegistryOptions` | Options for schema registry                 |
| `InTypeJsonSchema`      | JSON Schema conversion options              |
| `InTypePipelineOptions` | Options for pipeline operations             |
| `InTypeTransformResult` | Result from pipeline transformations        |
| `InTypeBenchmarkResult` | Result from performance benchmarks          |

---

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guidelines](CONTRIBUTING.md) to get started.

---

## 📄 License

InSpatial Dev is released under the Intentional 1.0 License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <strong>Ready to shape the future of spatial computing?</strong>
  <br>
  <a href="https://www.inspatiallabs.com">Start Building with InSpatial</a>
</div>
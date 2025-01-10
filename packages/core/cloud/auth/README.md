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
[![InSpatial App](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/app-badge.svg)](https://www.inspatial.app)
[![InSpatial Store](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/store-badge.svg)](https://www.inspatial.store)

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Discord](https://img.shields.io/badge/discord-join_us-5a66f6.svg?style=flat-square)](https://discord.gg/inspatiallabs)
[![Twitter](https://img.shields.io/badge/twitter-follow_us-1d9bf0.svg?style=flat-square)](https://twitter.com/inspatiallabs)
[![LinkedIn](https://img.shields.io/badge/linkedin-connect_with_us-0a66c2.svg?style=flat-square)](https://www.linkedin.com/company/inspatiallabs)

</div>

---

## 🛡️ InSpatial Auth (🔴 unstable)

A universal and spatial authentication framework that provides cross-platform identity management with support for social logins, OTP, JWT tokens, and headless integration capabilities, designed to seamlessly work across web, mobile, and XR platforms while maintaining framework agnosticism.

## 🌟 Features

- 🌐 Universal & Cross-Platform 
- 📱 Works on Web, Mobile and XR
- 🧩 Modular and headless authentication system 
- 🔧 Framework agnostic 
- ☁️ Seamless integration with InSpatial Cloud
- 🔄 Enhanced Session Management
- 📧 OTP/Pin Code via (Email)
- 🔑 Social Login (Apple, Google, Facebook, X, etc.)
- 🔌 Allows you to implement "login with myapp" 
- 🎫 JWT


## 🔮 Coming Soon

- 🔑 Single Sign-On (SSO)
- 💼 Wallet Login
- 📞 Phone Authentication
- 🛡️ Biometric Authentication
- 👤 Anonymous/Guest Authentication
- 🎮 Player Authentication
- 🔌 Extension System
- 🔐 Password Authentication
- 🍏 Apple Game Center
- 🎮 Google Play Games
- 🎮 Steam
- 🌐 Federated Authentication
- 🗄️ Multiple Storage Adapters (e.g., InSpatial KV)
- 🧑‍🤝‍🧑 User Management
- 🏢 Organization and Workspace Management
- 📱 OTP/Pin Code via (SMS, Phone)
- 🔐 Two Factor Authentication (2FA)
- 💾 InSpatial ORM/DB Adapter



## 🚀 Installation

Choose your preferred package manager:

```bash
# Deno
deno add jsr:@inspatial/auth

# npm
npx jsr add @inspatial/auth

# yarn
yarn dlx jsr add @inspatial/auth

# pnpm
pnpm dlx jsr add @inspatial/auth

# bun
bunx jsr add @inspatial/auth
```
<!-- 
---

## 🛠️ Usage

### Step-by-Step Usage Guide

Follow these steps to integrate **InSpatial Auth** into your application:

#### 1. **Basic Setup**

```typescript
import { Auth } from "@inspatial/auth"
import { getEnv, setEnv } from "@inspatial/env"

// Initialize the auth instance with your configuration
const auth = Auth({
  storage: {
    type: "kv", // Using InSpatial KV for storage
    url: getEnv("KV_URL"),
    token: getEnv("KV_TOKEN")
  }
})
```

#### 2. **Configure Authentication Methods**

##### Social Authentication
```typescript
// Setup OAuth2 providers
auth.use("github", GithubAuth({
  clientID: getEnv("GITHUB_CLIENT_ID"),
  clientSecret: getEnv("GITHUB_CLIENT_SECRET"),
  scopes: ["user", "user:email"]
}))

// Setup OpenID Connect providers
auth.use("google", GoogleOidcAuth({
  clientID: getEnv("GOOGLE_CLIENT_ID"),
  scopes: ["openid", "email", "profile"]
}))
```

##### OTP Authentication
```typescript
auth.use("email", OTPAuth({
  // Configure OTP length (default: 6)
  length: 6,
  
  // Handle OTP UI rendering
  request: async (req, state, form, error) => {
    if (state.type === "start") {
      return <EmailForm /> // Your UI component
    }
    return <CodeForm /> // Your UI component
  },
  
  // Handle code sending
  sendCode: async (claims, code) => {
    await sendEmail({
      to: claims.email,
      subject: "Your verification code",
      text: `Your code is: ${code}`
    })
  }
}))
```

#### 3. **Handle Authentication Events**

```typescript
// Listen for successful logins
auth.on("login", async (user) => {
  console.log("User logged in:", user)
  // Update your application state
})

// Listen for logouts
auth.on("logout", () => {
  console.log("User logged out")
  // Clear application state
})

// Handle errors
auth.on("error", (error) => {
  console.error("Auth error:", error)
  // Show error message to user
})
```

#### 4. **Implement Protected Routes**

```typescript
import { protect } from "@inspatial/auth/middleware"

// Protect API routes
app.use("/api/*", protect())

// Custom protection rules
app.use("/admin/*", protect({
  roles: ["admin"],
  permissions: ["manage_users"]
}))
```

#### 5. **Storage Configuration**

```typescript
// Using InSpatial KV (default)
auth.storage.use("kv", {
  url: process.env.KV_URL,
  token: process.env.KV_TOKEN
})

// Custom storage adapter
auth.storage.use("custom", {
  async get(key) {
    // Your get implementation
  },
  async set(key, value) {
    // Your set implementation
  },
  async delete(key) {
    // Your delete implementation
  }
})
```

### Advanced Usage Examples

#### Multi-Provider Authentication

```typescript
// Configure multiple providers
auth.use("github", GithubAuth({...}))
auth.use("google", GoogleAuth({...}))
auth.use("apple", AppleAuth({...}))

// Let users link multiple accounts
auth.on("login", async (user, provider) => {
  if (user.isLinked(provider)) {
    await user.link(provider)
  }
})
```

#### Game Authentication

```typescript
// Apple Game Center
auth.use("game-center", AppleGameCenterAuth({
  bundleId: "your.game.id",
  // Additional game center options
}))

// Google Play Games
auth.use("play-games", GooglePlayGamesAuth({
  clientID: process.env.PLAY_GAMES_CLIENT_ID,
  // Additional play games options
}))

// Steam
auth.use("steam", SteamAuth({
  apiKey: process.env.STEAM_API_KEY,
  // Additional Steam options
}))
```

#### Anonymous Authentication

```typescript
// Enable anonymous auth
auth.use("anonymous", {
  // Optional: Convert to permanent account later
  convertible: true,
  
  // Optional: Expire anonymous sessions
  ttl: 60 * 60 * 24 // 24 hours
})

// Handle anonymous user conversion
auth.on("convert", async (anonymous, permanent) => {
  // Transfer anonymous user data to permanent account
})
```

### Type Safety

```typescript
// Define your user type
interface User {
  id: string
  email?: string
  profile?: {
    name?: string
    avatar?: string
  }
  metadata?: Record<string, unknown>
}

// Type-safe auth instance
const auth = Auth<User>({...})

// TypeScript will now provide proper types
auth.on("login", (user) => {
  // user is typed as User
  console.log(user.profile?.name)
})
``` -->

---

## 📄 License

InSpatial Auth is released under the Apache 2.0 License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <strong>Ready to secure your applications with InSpatial Auth?</strong>
  <br>
  <a href="https://www.inspatial.app">Start Securing with InSpatial</a>
</div>

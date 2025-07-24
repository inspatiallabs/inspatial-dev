// /**
//  * state-manager.ts
//  * Generic authentication state management system that can be used for various authentication scenarios.
//  * Handles state transitions, lockout mechanisms, and security validations.
//  */

// import { createHash } from "@inspatial/util";
// import { kv } from "@inspatial/kv";

// /**
//  * Supported authentication states
//  */
// export type AuthState = "AUTHORIZED" | "UNAUTHORIZED" | "LOCKED_OUT";

// /**
//  * Entity types that can be protected by authentication
//  * Extend this type to add more entity types as needed
//  */
// export type ProtectedEntityType = "FORM" | "WEBSITE" | "API" | "RESOURCE";

// /**
//  * Core authentication event structure
//  */
// export interface AuthEvent {
//   state: AuthState;
//   timestamp: number;
//   /** Unique identifier for the entity being accessed (e.g., form slug, website ID) */
//   entityId: string;
//   /** Type of entity being protected */
//   entityType: ProtectedEntityType;
//   /** User identifier (email, name, token, etc.) */
//   identifier: string;
//   /** Browser/client fingerprint */
//   fingerprint: string;
//   /** Hashed IP address */
//   ip: string;
//   /** When this authorization expires */
//   expiresAt: number | null;
//   metadata?: {
//     attempts?: number;
//     reason?: string;
//     previousState?: AuthState;
//     expiresAt?: number;
//     /** Additional custom metadata */
//     [key: string]: any;
//   };
// }

// /**
//  * State transition record structure
//  */
// interface StateTransition {
//   from: AuthState;
//   to: AuthState;
//   timestamp: number;
//   reason: string;
//   metadata?: Record<string, any>;
// }

// /**
//  * Configuration options for AuthStateManager
//  */
// interface AuthStateManagerConfig {
//   /** Duration in milliseconds for authorized state */
//   authDuration?: number;
//   /** Duration in milliseconds for lockout state */
//   maxLockoutDuration?: number;
//   /** Maximum number of attempts before lockout */
//   maxAttempts?: number;
//   /** Base lockout duration in milliseconds */
//   baseLockoutDuration?: number;
//   /** Custom prefix for storage keys */
//   keyPrefix?: string;
// }

// /**
//  * Manages authentication state transitions and security validations
//  */
// export class AuthStateManager {
//   private readonly stateKey: string;
//   private readonly transitionKey: string;
//   private readonly lockoutKey: string;
//   private readonly fingerprint: string;
//   private readonly ip: string;
//   private readonly config: Required<AuthStateManagerConfig>;

//   private static DEFAULT_CONFIG: Required<AuthStateManagerConfig> = {
//     authDuration: 30 * 24 * 60 * 60 * 1000, // 30 days
//     maxLockoutDuration: 24 * 60 * 60 * 1000, // 24 hours
//     maxAttempts: 5,
//     baseLockoutDuration: 15 * 60 * 1000, // 15 minutes
//     keyPrefix: "auth",
//   };

//   /**
//    * Creates a new AuthStateManager instance
//    * @param entityType - Type of entity being protected
//    * @param entityId - Unique identifier for the protected entity
//    * @param headers - HTTP headers for client identification
//    * @param config - Optional configuration overrides
//    */
//   constructor(
//     private readonly entityType: ProtectedEntityType,
//     private readonly entityId: string,
//     headers: Headers,
//     config: AuthStateManagerConfig = {}
//   ) {
//     this.config = { ...AuthStateManager.DEFAULT_CONFIG, ...config };

//     const keyBase = `${
//       this.config.keyPrefix
//     }:${entityType.toLowerCase()}:${entityId}`;
//     this.stateKey = `${keyBase}:state`;
//     this.transitionKey = `${keyBase}:transitions`;
//     this.lockoutKey = `${keyBase}:lockout`;

//     const clientInfo = this.getClientIdentifiers(headers);
//     this.fingerprint = clientInfo.fingerprint;
//     this.ip = clientInfo.ip;
//   }

//   /**
//    * Generates secure client identifiers from request headers
//    * @private
//    */
//   private getClientIdentifiers(headers: Headers): {
//     fingerprint: string;
//     ip: string;
//   } {
//     // IP address handling
//     const forwardedFor = headers.get("x-forwarded-for");
//     const realIP = headers.get("x-real-ip");
//     const rawIp = forwardedFor?.split(",")[0] || realIP || "unknown";
//     const ip = this.hashValue(rawIp);

//     // Fingerprint generation
//     const components = [
//       headers.get("user-agent") || "",
//       headers.get("accept-language") || "",
//       headers.get("sec-ch-ua-platform") || "",
//       headers.get("sec-ch-ua") || "",
//     ];
//     const fingerprint = this.hashValue(components.join("::"));

//     return { fingerprint, ip };
//   }

//   /**
//    * Creates a secure hash of a value
//    * @private
//    */
//   private hashValue(value: string): string {
//     return createHash("sha256").update(value).digest("hex");
//   }

//   /**
//    * Retrieves the current authentication state
//    */
//   async getCurrentState(): Promise<AuthEvent | null> {
//     try {
//       const state = await kv.get<AuthEvent>(this.stateKey);

//       if (!state) return null;

//       // Validate client identifiers
//       if (state.fingerprint !== this.fingerprint && state.ip !== this.ip) {
//         return null;
//       }

//       return state;
//     } catch (error) {
//       console.error(
//         `Error getting auth state for ${this.entityType}:${this.entityId}:`,
//         error
//       );
//       return null;
//     }
//   }

//   /**
//    * Records a state transition for audit purposes
//    * @private
//    */
//   private async recordTransition(
//     from: AuthState | null,
//     to: AuthState,
//     reason: string,
//     metadata?: Record<string, any>
//   ): Promise<void> {
//     try {
//       const transition: StateTransition = {
//         from: from || "UNAUTHORIZED",
//         to,
//         timestamp: Date.now(),
//         reason,
//         metadata,
//       };

//       await kv.lpush(this.transitionKey, JSON.stringify(transition));
//       await kv.ltrim(this.transitionKey, 0, 9);
//       await kv.expire(this.transitionKey, 30 * 24 * 60 * 60);
//     } catch (error) {
//       console.error(
//         `Error recording transition for ${this.entityType}:${this.entityId}:`,
//         error
//       );
//     }
//   }

//   /**
//    * Transitions to a new authentication state
//    */
//   async transitionTo(
//     newState: AuthState,
//     identifier: string,
//     metadata?: AuthEvent["metadata"]
//   ): Promise<AuthEvent> {
//     const currentState = await this.getCurrentState();
//     const now = Date.now();

//     const event: AuthEvent = {
//       state: newState,
//       timestamp: now,
//       entityId: this.entityId,
//       entityType: this.entityType,
//       identifier,
//       fingerprint: this.fingerprint,
//       ip: this.ip,
//       expiresAt:
//         newState === "AUTHORIZED" ? now + this.config.authDuration : null,
//       metadata: {
//         ...metadata,
//         previousState: currentState?.state,
//       },
//     };

//     // Handle state-specific logic
//     if (newState === "AUTHORIZED") {
//       await kv.del(this.lockoutKey);
//     } else if (newState === "LOCKED_OUT" && metadata?.expiresAt) {
//       await kv.set(
//         this.lockoutKey,
//         JSON.stringify({
//           attempts: metadata.attempts,
//           expiresAt: metadata.expiresAt,
//         }),
//         {
//           ex: Math.floor((metadata.expiresAt - now) / 1000),
//         }
//       );
//     }

//     // Record transition and update state
//     await this.recordTransition(
//       currentState?.state || null,
//       newState,
//       metadata?.reason || "State change",
//       metadata
//     );

//     // Set appropriate expiration based on state
//     const expiration =
//       newState === "AUTHORIZED"
//         ? this.config.authDuration / 1000
//         : newState === "LOCKED_OUT"
//         ? this.config.maxLockoutDuration / 1000
//         : 60 * 60; // 1 hour for unauthorized

//     await kv.set(this.stateKey, JSON.stringify(event), { ex: expiration });

//     return event;
//   }

//   /**
//    * Retrieves the transition history for auditing
//    */
//   async getTransitionHistory(): Promise<StateTransition[]> {
//     try {
//       const transitions = await kv.lrange(this.transitionKey, 0, -1);
//       return transitions.map((t) => JSON.parse(t));
//     } catch (error) {
//       console.error(
//         `Error getting transition history for ${this.entityType}:${this.entityId}:`,
//         error
//       );
//       return [];
//     }
//   }

//   /**
//    * Calculates lockout duration based on attempt count
//    */
//   calculateLockoutDuration(attempts: number): number {
//     return Math.min(
//       this.config.baseLockoutDuration *
//         Math.pow(2, attempts - this.config.maxAttempts),
//       this.config.maxLockoutDuration
//     );
//   }

//   /**
//    * Clears all authentication state
//    */
//   async clear(): Promise<void> {
//     try {
//       await Promise.all([
//         kv.del(this.stateKey),
//         kv.del(this.transitionKey),
//         kv.del(this.lockoutKey),
//       ]);
//     } catch (error) {
//       console.error(
//         `Error clearing auth state for ${this.entityType}:${this.entityId}:`,
//         error
//       );
//     }
//   }
// }

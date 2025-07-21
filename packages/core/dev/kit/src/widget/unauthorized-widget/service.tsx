// /**
//  * service.ts
//  * Generic authentication service that implements common authentication logic
//  * using the AuthStateManager. Can be extended for specific use cases.
//  */

// import type { AuthStateManager } from "./state-manager.ts";

// /**
//  * Result structure for authentication attempts
//  */
// export interface AuthResult {
//   isAuthorized: boolean;
//   message: string;
//   attemptsLeft?: number;
//   lockoutUntil?: number | null;
//   metadata?: Record<string, any>;
// }

// /**
//  * Configuration for authentication validation
//  */
// export interface AuthValidationConfig {
//   /** Maximum number of attempts before lockout */
//   maxAttempts?: number;
//   /** Custom validation function */
//   validateCredentials?: (
//     identifier: string,
//     ...args: any[]
//   ) => Promise<boolean>;
//   /** Additional validation metadata */
//   metadata?: Record<string, any>;
// }

// /**
//  * Generic authentication service that can be extended for specific use cases
//  * @example: Form Authorization  
//  * export class FormAuthorization extends AuthService {
//   constructor(formSlug: string) {
//     const headersList = headers();
//     const stateManager = new AuthStateManager(
//       "FORM",
//       formSlug,
//       headers,
//       {
//         maxAttempts: 6,
//         authDuration: 30 * 24 * 60 * 60 * 1000, // 30 days
//       }
//     );
    
//     super(stateManager, {
//       maxAttempts: 6,
//       async validateCredentials(identifier: string, formType: string) {
//         // Implement form-specific validation logic
//         return true; // Replace with actual validation
//       },
//     });
//   }
// }
//  */

// export class AuthService {
//   constructor(
//     private readonly stateManager: AuthStateManager,
//     private readonly config: AuthValidationConfig = {}
//   ) {}

//   /**
//    * Validates access for a given identifier
//    */
//   async validateAccess(
//     identifier: string,
//     ...validationArgs: any[]
//   ): Promise<AuthResult> {
//     try {
//       const currentState = await this.stateManager.getCurrentState();

//       // Check existing authorization
//       if (currentState?.state === "AUTHORIZED") {
//         if (currentState.expiresAt && Date.now() < currentState.expiresAt) {
//           return {
//             isAuthorized: true,
//             message: "Already authorized",
//             metadata: currentState.metadata,
//           };
//         }

//         await this.stateManager.transitionTo("UNAUTHORIZED", identifier, {
//           reason: "Auth expired",
//         });
//       }

//       // Check lockout
//       if (currentState?.state === "LOCKED_OUT") {
//         if (
//           currentState.metadata?.expiresAt &&
//           Date.now() < currentState.metadata.expiresAt
//         ) {
//           return {
//             isAuthorized: false,
//             message: "Access is currently locked",
//             lockoutUntil: currentState.metadata.expiresAt,
//             attemptsLeft: 0,
//           };
//         }

//         await this.stateManager.transitionTo("UNAUTHORIZED", identifier, {
//           reason: "Lockout expired",
//         });
//       }

//       // Validate credentials
//       const isValid = this.config.validateCredentials
//         ? await this.config.validateCredentials(identifier, ...validationArgs)
//         : false;

//       if (isValid) {
//         await this.stateManager.transitionTo("AUTHORIZED", identifier, {
//           reason: "Successful authentication",
//           ...this.config.metadata,
//         });

//         return {
//           isAuthorized: true,
//           message: "Authorization successful",
//         };
//       }

//       // Handle failed attempt
//       const attempts = (currentState?.metadata?.attempts || 0) + 1;
//       const maxAttempts = this.config.maxAttempts || 5;

//       if (attempts >= maxAttempts) {
//         const lockoutDuration =
//           this.stateManager.calculateLockoutDuration(attempts);

//         await this.stateManager.transitionTo("LOCKED_OUT", identifier, {
//           attempts,
//           reason: "Maximum attempts exceeded",
//           expiresAt: Date.now() + lockoutDuration,
//         });

//         return {
//           isAuthorized: false,
//           message: "Access locked due to too many attempts",
//           attemptsLeft: 0,
//           lockoutUntil: Date.now() + lockoutDuration,
//         };
//       }

//       // Update unauthorized state
//       await this.stateManager.transitionTo("UNAUTHORIZED", identifier, {
//         attempts,
//         reason: "Authentication failed",
//       });

//       return {
//         isAuthorized: false,
//         message: "Authorization failed",
//         attemptsLeft: maxAttempts - attempts,
//       };
//     } catch (error) {
//       console.error("Auth validation error:", error);
//       return {
//         isAuthorized: false,
//         message: "An error occurred during authorization",
//         attemptsLeft: undefined,
//       };
//     }
//   }
// }

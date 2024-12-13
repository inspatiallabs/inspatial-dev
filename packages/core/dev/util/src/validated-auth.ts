// import "server-only";

// //*############################################################################################*/
// // Description: This file contains the implementation of the validatedAuth function which is used to
// // validate the current user session to check if they are authenticated. If not, an error is thrown.
// // NOTE: it is a framework for handling authentication with multiple providers
// // STATUS: (Preview) - Not production ready
// //#############################################################################################*/

// //#region imports

// //#region types
// /*##############################################(AUTH-TYPES)##############################################*/
// export interface AuthUser {
//   id: string;
//   email?: string;
//   name?: string;
// }

// /*##############################################(AUTH-PROVIDERS)##############################################*/

// type AuthProvider = "clerk" | "authJS" | "StackAuth" | "AuthKit" | "Kinde";

// /*##############################################(AUTH-CONFIG)##############################################*/
// // Configuration object to specify which auth provider to use
// const authConfig = {
//   provider: (process.env.AUTH_PROVIDER as AuthProvider) || "clerk",
// };

// //#region authProviderFactory
// /*##############################################(AUTH-FACTORY)##############################################*/
// // Define a factory for auth providers
// const authProviderFactory = {
//   clerk: async () => {
//     const { currentUser } = await import("@clerk/nextjs/server");
//     return async (req?: Request): Promise<AuthUser | null> => {
//       const session = await currentUser();
//       if (!session) {
//         throw new Error("Unauthorized");
//       }
//       return session;
//     };
//   },
//   authJS: async () => {
//     // Implement AuthJS provider
//     // throw new Error("AuthJS provider not implemented");
//   },
//   StackAuth: async () => {
//     // Implement StackAuth provider
//     // throw new Error("StackAuth provider not implemented");
//   },
//   AuthKit: async () => {
//     // Implement AuthKit provider
//     // throw new Error("AuthKit provider not implemented");
//   },
//   Kinde: async () => {
//     // Implement Kinde provider
//     // throw new Error("Kinde provider not implemented");
//   },
// };
// //#region getCurrentUser
// /*##############################################(GET-CURRENT-USER)##############################################*/
// // Function to get the current authenticated user
// export async function getCurrentUser(req?: Request): Promise<AuthUser | null> {
//   const { provider } = authConfig;

//   const authProvider = authProviderFactory[provider];
//   if (!authProvider) throw new Error(`Unsupported auth provider: ${provider}`);

//   try {
//     const getUser = await authProviderFactory[provider]();
//     return getUser(req);
//   } catch (error) {
//     if (
//       error instanceof Error &&
//       error.message.includes("Cannot find module")
//     ) {
//       throw new Error(
//         `${provider} is not installed. Please install the necessary package to use ${provider} authentication.`
//       );
//     }
//     throw error;
//   }
// }

// //#region validatedAuth
// /*##############################################(VALIDATED-AUTH)##############################################*/
// /**
//  * Function to validate the current user session to check if they are authenticated. If not, an error is thrown.
//  * @param req The request object
//  * @returns The authenticated user
//  * @throws Error if the user is not authenticated
//  * @example
//  * const session = await validatedAuth(req);
//  * console.log(session);
//  */
// export async function validatedAuth(req?: Request): Promise<AuthUser> {
//   const user = await getCurrentUser(req);
//   if (!user) {
//     throw new Error("Unauthorized");
//   }
//   return user;
// }

// import { actionClient } from "@/app/webhooks/safe-actions";
// import { DbAction } from "@prisma/client";
// import { flattenValidationErrors } from "next-safe-action";
// import { z } from "zod";
// import { validatedAuth } from "./validated-auth";
// import { revalidatePath } from "next/cache";
// import { db } from "@/app/webhooks/prisma";
// import { createAuditLog, EntityProps } from "./create-audit-log";

// /*##############################################(QUERY-SERVER-UTILITY)##############################################*/
// type ActionResult<T> = Promise<{ data?: T; error?: string }>;

// /**
//  * handles session validation and error catching.
//  * useful for querying the database and handling errors in server actions for mutations (CREATE, UPDATE, DELETE)
//  * use @function mutateServer()
//  */
// export function queryServer<T, P extends any[]>(
//   action: (...args: P) => Promise<T>
// ): (...args: P) => ActionResult<T> {
//   return async (...args: P) => {
//     const session = validatedAuth();
//     if (!session) {
//       return { error: "Unauthorized" };
//     }

//     try {
//       const result = await action(...args);
//       return { data: result };
//     } catch (error) {
//       console.error(`Action error:`, error);
//       return {
//         error: error instanceof Error ? error.message : "An error occurred",
//       };
//     }
//   };
// }

// /*##############################################(MUTATE-SERVER-UTILITY)##############################################*/

// interface ServerActionParams<T extends z.ZodType> {
//   /**
//    * @description Zod schema for (create and update) server actions that require validation
//    */
//   schema: T;
//   /**
//    *  @description The database action to perform e.g CREATE, UPDATE, DELETE
//    */
//   action: DbAction;
//   /**
//    * @description The entity is usually the feature or in some cases page to perform an action on e.g project, task, user, etc
//    * It's useful for creating audit logs and other features that require the entity type to be specified
//    */
//   entity: EntityProps;
//   /**
//    * @description This is where your will write the main database operations for the server action
//    */
//   dbOperation: (data: z.infer<T>) => Promise<any>;
//   /**
//    * @description (Optional) This is the url path to revalidate after the server action is performed
//    */
//   revalidateUrl?: string;
//   /**
//    * @description (Optional) This is a boolean that specifies if an audit log should be created for the server action
//    */
//   /**
//    * @description (Optional) This is a boolean that specifies if an audit log should be created for the server action
//    * Default is true if not specified: Audit Logs are useful for tracking data mutations like (CREATE, UPDATE & DELETE)
//    * and not for data queries like (read/get) so make sure to set this to false if you don't want to create an audit log
//    * for the server action. It's good for Notifications, Activity Feeds, Versioning, etc
//    */
//   createAuditLog?: boolean;
// }

// /**
//  * Creates an abstraction for server actions that require validation and error handling
//  * and safely handles the database operation and response message
//  *
//  * @param schema The schema or parameters for the server action
//  * @param action The database action to perform
//  * @param entity The entity type to perform the action on
//  * @param dbOperation The database operation to perform
//  * @param revalidateUrl The url path to revalidate after the server action is performed
//  * @param createAuditLog Specifies if an audit log should be created for the server action
//  */

// export function mutateServer<T extends z.ZodType>(
//   schema: T | ServerActionParams<T>,
//   action?: DbAction,
//   entity?: EntityProps,
//   dbOperation?: (data: z.infer<T>) => Promise<any>
// ) {
//   let params: ServerActionParams<T>;

//   if (schema instanceof z.ZodType) {
//     if (!action || !entity || !dbOperation) {
//       throw new Error("Missing required parameters for mutateServer");
//     }
//     params = {
//       schema,
//       action,
//       entity,
//       dbOperation,
//       createAuditLog: true, // Set default to true
//     };
//   } else {
//     params = {
//       ...schema,
//       createAuditLog:
//         schema.createAuditLog !== undefined ? schema.createAuditLog : true, // Set default to true if not specified
//     };
//   }

//   return actionClient
//     .schema(params.schema, {
//       handleValidationErrorsShape: (ve) =>
//         flattenValidationErrors(ve).fieldErrors,
//     })
//     .action(
//       queryServer(async ({ parsedInput: formData }) => {
//         const session = validatedAuth();
//         if (!session) {
//           throw new Error("Unauthorized");
//         }

//         const data = Object.fromEntries(Object.entries(formData));
//         const parsed = params.schema.safeParse(data);
//         if (!parsed.success) throw new Error(parsed.error.message);

//         const result = await params.dbOperation(parsed.data);

//         // Revalidate the specified URL if provided
//         if (params.revalidateUrl) {
//           revalidatePath(params.revalidateUrl);
//         }

//         // Create audit log if createAuditLog is true
//         await createAuditLog({
//           entity: params.entity,
//           entityId: result.id,
//           entityTitle: result.name || `${params.entity} ${result.id}`,
//           action: params.action,
//           oldData:
//             params.action === DbAction.UPDATE
//               ? await db[params.entity].findUnique({ where: { id: result.id } })
//               : null,
//           newData: result,
//           userId: (await session).id,
//         });

//         return `${params.action}d ${params.entity} ${result.id} successfully`;
//       })
//     );
// }

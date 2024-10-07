// "use client";

// import { useOptimistic, useTransition } from "react";
// import { useModal } from "./use-modal";
// import { FormModeProps, OptimisticMessageProp } from "@/inspatial/props";
// import { useAction } from "next-safe-action/hooks";

// interface UseFormActionProps<T> {
//   /**
//    * The action to create the data
//    */
//   createAction: any;
//   /**
//    * The action to update the data
//    */
//   updateAction: any;
//   /**
//    * The mode of the form e.g Create or Update
//    */
//   formMode: FormModeProps["formMode"];
//   /**
//    * The initial data to populate the form
//    */
//   initialData?: Partial<T> & { id?: string };

// }

// export function useFormAction<T>({
//   createAction,
//   updateAction,
//   formMode,
//   initialData,
// }: UseFormActionProps<T>) {
//   const [isPending, startTransition] = useTransition();
//   const { closeModal } = useModal();
//   const [optimisticMessages, addOptimisticMessage] = useOptimistic<
//     OptimisticMessageProp[],
//     T
//   >([], (state, newData) => [
//     ...state,
//     { message: `${formMode === "CREATE" ? "Creating" : "Updating"}...` },
//   ]);

//   function handleActionSuccess(action: "created" | "updated") {
//     // TODO: use inspatial kit toast
//     // toast.success(
//     //   `${action === "created" ? "Created" : "Updated"} successfully`
//     // );
//     window.location.reload(); 
//     closeModal();
//   }

//   function handleActionError(error: string) {
//     // TODO: use inspatial kit toast
//     // toast.error(error);
//   }

//   const { executeAsync: executeCreateAction, isExecuting: isCreating } =
//     useAction(createAction, {
//       onSuccess: () => handleActionSuccess("created"),
//       onError: () => handleActionError("An error occurred during creation"),
//     });

//   const { executeAsync: executeUpdateAction, isExecuting: isUpdating } =
//     useAction(updateAction, {
//       onSuccess: () => handleActionSuccess("updated"),
//       onError: () => handleActionError("An error occurred during update"),
//     });

//   async function onSubmit(formData: T) {
//     startTransition(() => {
//       addOptimisticMessage(formData);
//     });

//     try {
//       if (formMode === "CREATE") {
//         await executeCreateAction(formData);
//       } else {
//         const updateData = {
//           ...initialData,
//           ...formData,
//         };
//         await executeUpdateAction(updateData);
//       }
//     } catch (error) {
//       console.error("Form submission error:", error);
//     }
//   }

//   return {
//     /**
//      * onSubmit is a function that you call to submit the form data
//      */
//     onSubmit,
//     /**
//      * Optimistic messages allow you to display a new text or message while the form is submitting
//      */
//     optimisticMessages,
//     /**
//      * isExecuting Specifically denotes whether the server action (create or update) is currently being executed on the server-side.
//      */
//     isExecuting: formMode === "CREATE" ? isCreating : isUpdating,
//     /**
//      * isPending Indicates that a state transition is in progress, covering the entire process from form submission initiation to completion of UI updates.
//      */
//     isPending,
//   };
// }

// import React, { useId } from "react";
// import * as SwitchPrimitives from "@radix-ui/react-switch";
// import { VariantProps } from "tailwind-variants";
// import { switchVariants } from "./variant";
// import { kit } from "@/inspatial/util";

// export interface SwitchProps
//   extends Omit<
//       React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>,
//       "asChild"
//     >,
//     VariantProps<typeof switchVariants> {}

// export const Switch = React.forwardRef<
//   React.ComponentRef<typeof SwitchPrimitives.Root>,
//   SwitchProps
// >(({ className, size, ...props }: SwitchProps, forwardedRef) => {
//   const { root, thumb } = switchVariants({ size });
//   return (
//     <SwitchPrimitives.Root
//       ref={forwardedRef}
//       className={kit(root(), className)}
//       {...props}
//     >
//       <SwitchPrimitives.Thumb className={kit(thumb())} />
//     </SwitchPrimitives.Root>
//   );
// });

// Switch.displayName = "Switch";

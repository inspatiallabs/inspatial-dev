// import * as React from "react";
// import { kit } from "@inspatial/kit/utils";
// import { forwardRef } from "react";
// import { buttonVariants } from "@inspatialKit/button/variants";
// import { tv, type VariantProps } from "tailwind-variants";
// import { LoaderIcon } from "@inspatial/kit/icons";

// /************************************************************************************
//  * ================================================================================================
//  *
//  * Component: Button
//  *
//  * ================={Description}=================
//  *
//  * The Button component is used to trigger an action or event.
//  *
//  * ================={Props}=================
//  *
//  * @variant {string} - Type of button component. {"primaryButton" | "barrowButton" | "iconButton"}
//  *
//  * @format {string} - Format of the button component.
//  *
//  * @size - Size of the button component.
//  *
//  * @radius {string} - Radius of the button component.
//  *
//  * @theme {string} - Theme of the button component.
//  *
//  * @axis {string} - Axis of the button component.
//  *
//  * @disabled {boolean} - Disabled state of the button component.
//  *
//  * @iconOnly {boolean} - Icon only state of the button component.
//  *
//  *
//  * ================={Example}=================
//  *
//  * ```jsx
//  * <Button variant="primaryButton" format="base" size="base" theme="retro" mode="light" axis="x">
//  *   Text
//  * </Button>
//  * ```
//  *
//  * ================================================================================================
//  */

// export interface ButtonProps
//   extends React.ButtonHTMLAttributes<HTMLButtonElement>,
//     VariantProps<typeof buttonVariants> {
//   asChild?: boolean;
//   isLoading?: boolean;
//   loadingText?: string;
// }

// //*************************************(COMPONENT)*************************************//
// export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
//   ({ className, asChild = false, ...props }, ref) => {
//     /*******************(props)******************/
//     const {
//       format,
//       size,
//       radius,
//       theme,
//       axis,
//       disabled,
//       iconOnly,
//       isLoading,
//       loadingText,
//       children,
//     } = props;

//     /*******************(slot)******************/

//     const Component = asChild ? Slot : "button";

//     //*************************************(RETURN)*************************************//

//     return (
//       <>
//         <Component
//           className={kit(
//             buttonVariants({
//               format,
//               size,
//               radius,
//               theme,
//               axis,
//               disabled,
//               iconOnly,
//             }),
//             className
//           )}
//           disabled={disabled || isLoading}
//           ref={ref}
//           {...props}
//         >
//           {isLoading ? (
//             <span className="pointer-events-none flex shrink-0 items-center justify-center gap-1.5">
//               <LoaderIcon
//                 className="w-3 h-3 shrink-0 animate-spin"
//                 aria-hidden="true"
//               />
//               <span className="sr-only">
//                 {loadingText ? loadingText : "Loading"}
//               </span>
//               {loadingText ? loadingText : children}
//             </span>
//           ) : (
//             children
//           )}
//         </Component>
//       </>
//     );
//   }
// );

// //##############################################(DISPLAY NAME)##############################################//
// Button.displayName = "Button";

// import { tv, type VariantProps } from "tailwind-variants";


// /***********************************************************************************************************************
//  * @description
//  * The buttonVariants object is used to define the variant classes for the Button component.
//  * The variant classes are applied to the component based on the variant prop value.
//  */

// export const buttonVariants = tv(
//     {
//       /********************************************************************************************************************
//        * @description
//        * The base array is used to define the default classes that are always applied to a component.
//        */
  
//       base: "inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-md text-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", // default class (always applied regardless of variant)
//       /********************************************************************************************************************
//        * @description
//        * The variants object is used to define the variant classes for a given component.
//        * The variant classes are applied to the component based on the variant prop value.
//        */
  
//       variants: {
//         //##############################################(COMPONENT VARIANT PROP)##############################################//
  
//         // variant: { // type of component
//         //     base: "",
//         // //     barrow: "",
//         // //     segmented: "",
//         // //     icon: "",
//         // },
  
//         //##############################################(FORMAT PROP)##############################################//
//         format: {
//           base: `primitive-button bg-brand shadow-effect`,
//           outline:
//             "border border-input bg-surface hover:bg-brand",
//           outlineFill:
//             "border-x-2 border-t-2 dark:border-b-2 border-surface bg-colored shadow-line dark:shadow-none",
//           ghost: "bg-background",
//         },
  
//         //##############################################(SIZE PROP)##############################################//
  
//         size: {
//           base: "h-[40px] w-[135px] text-base", // default
//           sm: "h-[36px] w-[36px] text-base",
//           md: "h-[40px] w-auto text-base",
//           lg: "h-[48px] w-auto text-base",
//           xl: "h-[52px] w-auto text-base",
//         },
  
//         //##############################################(RADIUS PROP)##############################################//
  
//         radius: {
//           base: "rounded-md",
//           sm: "rounded-sm",
//           md: "rounded-md",
//           lg: "rounded-lg",
//           xl: "rounded-xl",
//           full: "rounded-full",
//         },
  
//         //##############################################(THEME PROP)##############################################//
  
//         theme: {
//           neutral: "",
//           colored: "",
//         },
  
//         //##############################################(AXIS PROP)##############################################//
  
//         axis: {
//           x: "flex flex-row",
//           y: "flex flex-col",
//           z: "flex flex-row-reverse",
//         },
  
//         //##############################################(DISABLED PROP)##############################################//
  
//         disabled: {
//           true: "opacity-disabled pointer-events-none cursor-disabled",
//         },
  
//         //##############################################(ICON PROP)##############################################//
  
//         iconOnly: {
//           true: "px-unit-0 !gap-unit-0",
//           false: "",
//         },
//       },
  
//       /********************************************************************************************************************
//        * @description
//        * The defaultVariants object is used to define or set the default variant values for all components of a given type.
//        */
  
//       defaultVariants: {
//         // variant: "primaryButton",
//         format: "base",
//         size: "base",
//         radius: "base",
//         theme: "colored",
//         axis: "x",
//         disabled: false,
//         iconOnly: false,
//       },
//     }
//   );
  
  
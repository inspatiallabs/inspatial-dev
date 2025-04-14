// "use client";

// import React, { ReactNode } from "react";
// import PrimitiveButtonPill from "../ui/PrimitiveButtonPill";
// import { kit } from "@inspatial/theme/variant";

// /*####################################(TYPES)####################################*/
// export interface PrimitiveBannerProps {
//   className?: HTMLAttributes<string>["className"];
//   children?: React.ReactNode;
//   isDismissible?: boolean;
//   onClose?: () => void;
// }

// export interface PrimitiveBannerIconProps extends React.ComponentProps<"img"> {
//   /**src specifies the icon, image or illustration file of the banner*/
//   src: ImgHTMLAttributes<HTMLImageElement>["src"];
// }
// export interface PrimitiveBannerContentProps
//   extends React.ComponentProps<"div"> {}
// export interface PrimitiveBannerTitleProps
//   extends React.ComponentProps<"label"> {}
// export interface PrimitiveBannerDescriptionProps
//   extends React.ComponentProps<"p"> {}
// export interface PrimitiveBannerCtaProps {
//   /**label specifies the text to be displayed on the call to action button*/
//   label: string;

//   /** onPointerUp specifies the function to be called when the call to action button is clicked*/
//   onPointerUp: () => void;
// }
// //##############################################(SUB-COMPONENTS)##############################################//

// //##################(PRIMITIVE BANNER CONTENT)##################//
// PrimitiveBanner.Content = function PrimitiveBannerContent(
//   props: PrimitiveBannerContentProps
// ) {
//   /*****************************(Props)*****************************/
//   const { children, ...rest } = props;
//   return (
//     <section className="flex flex-col w-full" {...rest}>
//       {children}
//     </section>
//   );
// };

// //##################(PRIMITIVE BANNER TITLE)##################//
// PrimitiveBanner.Title = function PrimitiveBannerTitle(
//   props: PrimitiveBannerTitleProps
// ) {
//   /*****************************(Props)*****************************/

//   const { children, className } = props;

//   return (
//     <>
//       <label className={kit("", className)}>{children}</label>
//     </>
//   );
// };

// //##################(PRIMITIVE BANNER DESCRIPTION)##################//
// PrimitiveBanner.Description = function PrimitiveBannerDescription(
//   props: PrimitiveBannerDescriptionProps
// ) {
//   /*****************************(Props)*****************************/
//   const { children, className, ...rest } = props;

//   return (
//     <>
//       <p className={kit("text-damp text-base", className)} {...rest}>
//         {children}
//       </p>
//     </>
//   );
// };

// //##################(PRIMITIVE BANNER ICON)##################//

// PrimitiveBanner.Icon = function PrimitiveBannerIcon(
//   props: PrimitiveBannerIconProps
// ) {
//   /*****************************(Props)*****************************/

//   const { src, className, ...rest } = props;

//   return (
//     <>
//       <img
//         src={src}
//         alt="Components"
//         className={kit("flex m-auto h-full w-[150px] p-1", className)}
//         {...rest}
//       />
//     </>
//   );
// };

// //##################(PRIMITIVE BANNER CTA)##################//

// PrimitiveBanner.CTA = function PrimitiveBannerCTA(
//   props: PrimitiveBannerCtaProps
// ) {
//   /*****************************(Props)*****************************/

//   const {
//     label = "Title",
//     onPointerUp = () => {
//       alert("Clicked");
//     },
//   } = props;
//   return (
//     <PrimitiveButtonPill
//       label={label}
//       className="text-white"
//       onPointerUp={onPointerUp}
//     />
//   );
// };

// //##############################################(MAIN COMPONENT)##############################################//
// /**
//  * The Primitive Banner component is a component that is used to display a banner which contains a title,
//  * description, an icon/illustration and a call to action.
//  */

// export default function PrimitiveBanner(props: PrimitiveBannerProps) {
//   //##############################################(PROPS)##############################################//
//   const { className, children } = props;

//   return (
//     <main
//       className={kit(
//         `flex cursor-default w-full bg-inherit h-[82px] gap-[20px] justify-between  rounded-base items-center px-[10px] border-2 border-muted`,
//         className
//       )}
//     >
//       {children}
//     </main>
//   );
// }

// import React, { ReactNode } from "react";
// import { motion } from "framer-motion";
// import { Label } from "@/spatialKit/Form/Label";

// interface QuoteLoaderProps {
//   children: ReactNode;
//   className?: string;
//   delay?: number; // Default delay prop
//   duration?: number; // Default duration prop
// }

// export default function QuoteLoader(props: QuoteLoaderProps) {
//   /**********************************(PROPS)**********************************/
//   const {
//     children="give people wonderful tools and they will do wonderful things. - Steve Jobs",
//     className,
//     delay = 0.6, // Set default values here, not in the function parameter
//     duration = 0.6,
//   } = props;

//   /**********************************(ANIMATION VARIANTS)**********************************/
//   // Animation variants for individual quotes
//   const quoteVariants = {
//     hidden: { opacity: 0 },
//     visible: (custom: number) => ({
//       opacity: 1,
//       transition: {
//         delay: custom * delay,
//         duration: duration,
//       },
//     }),
//   };

//   /**********************************(FUNCTIONS)**********************************/

//   const RenderQuote = (child: ReactNode, idx: number): ReactNode => {
//     if (typeof child === "string") {
//       return child.split(" ").map((quote, quoteIdx) => (
//         <motion.span
//           key={`${idx}-${quoteIdx}`}
//           variants={quoteVariants}
//           initial="hidden"
//           animate="visible"
//           custom={quoteIdx} // Using the quote index as the custom delay multiplier
//           className="inline-block" // Inline block to keep quotes in their natural flow
//         >
//           {quote}&nbsp;
//         </motion.span>
//       ));
//     }
//     return child; // Non-string children are returned as is, without animation
//   };

//   /**********************************(RENDER)**********************************/
//   return (
//     <Label
//       className={`flex flex-wrap items-center justify-center h-auto w-auto dark:text-white text-black text-xl leading-snug tracking-wide text-center italic capitalize ${className}`}
//     >
//       {React.Children.map(children, (child, idx) => RenderQuote(child, idx))}
//     </Label>
//   );
// }

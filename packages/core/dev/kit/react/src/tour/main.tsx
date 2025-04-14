// "use client";
// import { useState, useEffect, useRef } from "react";
// import { motion, useInView } from "framer-motion";
// import { useRouter, useParams, usePathname } from "next/navigation";

// // Types
// import { CardComponentProps, TourProps, TourStep } from "./types";
// import { useTour } from "./provider";
// import { Button } from "@/components/ui/button";

// export default function Tour(props: TourProps) {
//   const {
//     children,
//     steps,
//     showTour = true,
//     shadowRgb = "0, 0, 0",
//     shadowOpacity = "0.2",
//     cardComponent: CardComponent,
//   } = props;

//   const { currentStep, setCurrentStep, isTourVisible } = useTour();
//   const [elementToScroll, setElementToScroll] = useState<Element | null>(null);
//   const [pointerPosition, setPointerPosition] = useState<{
//     x: number;
//     y: number;
//     width: number;
//     height: number;
//   } | null>(null);
//   const currentElementRef = useRef<Element>(null);
//   const observeRef = useRef<Element>(null); // Ref for the observer element
//   const isInView = useInView(observeRef);
//   const params = useParams<{ step: string }>();
//   const offset = 20;
//   const router = useRouter();

//   // - -
//   // Initialisze
//   useEffect(() => {
//     if (isTourVisible) {
//       console.log("Tour: Initialising...");
//       if (params.step) {
//         setCurrentStep(parseInt(params.step));
//       }
//       if (steps.length > 0) {
//         const firstStepElement = document.querySelector(
//           steps[0].selector as string
//         ) as Element | null;
//         if (firstStepElement) {
//           setPointerPosition(getElementPosition(firstStepElement));
//         }
//       }
//     }
//   }, [params.step, steps, isTourVisible, setCurrentStep]);

//   // - -
//   // Helper function to get element position
//   const getElementPosition = (element: Element) => {
//     const { top, left, width, height } = element.getBoundingClientRect();
//     const scrollTop = window.scrollY || document.documentElement.scrollTop;
//     const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
//     return {
//       x: left + scrollLeft,
//       y: top + scrollTop,
//       width,
//       height,
//     };
//   };

//   // - -
//   // Update pointerPosition when currentStep changes
//   useEffect(() => {
//     if (isTourVisible) {
//       console.log("Tour: Current Step Changed");
//       const step = steps[currentStep];
//       if (step) {
//         const element = document.querySelector(
//           step.selector as string
//         ) as Element;
//         if (element) {
//           setPointerPosition(getElementPosition(element));
//           currentElementRef.current = element; // Set the current element reference
//           setElementToScroll(element); // Set the element to be scrolled into view

//           const rect = element.getBoundingClientRect();
//           // Determine if the element is within the viewport + offset
//           const isInViewportWithOffset =
//             rect.top >= -offset && rect.bottom <= window.innerHeight + offset;

//           if (!isInView || !isInViewportWithOffset) {
//             element.scrollIntoView({ behavior: "smooth", block: "center" });
//           }
//         }
//       }
//     }
//   }, [currentStep, steps, isInView, offset, isTourVisible]);

//   useEffect(() => {
//     if (elementToScroll && !isInView && isTourVisible) {
//       console.log("Tour: Element to Scroll Changed");
//       const rect = elementToScroll.getBoundingClientRect();
//       const isAbove = rect.top < 0;
//       elementToScroll.scrollIntoView({
//         behavior: "smooth",
//         block: isAbove ? "center" : "center",
//         inline: "center",
//       });
//     }
//   }, [elementToScroll, isInView, isTourVisible]);

//   // - -
//   // Update pointer position on window resize
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   const updatePointerPosition = () => {
//     const step = steps[currentStep];
//     if (step) {
//       const element = document.querySelector(
//         step.selector as string
//       ) as Element;
//       if (element) {
//         setPointerPosition(getElementPosition(element));
//       }
//     }
//   };

//   // - -
//   // Update pointer position on window resize
//   useEffect(() => {
//     if (isTourVisible) {
//       window.addEventListener("resize", updatePointerPosition);
//       return () => window.removeEventListener("resize", updatePointerPosition);
//     }
//   }, [currentStep, steps, isTourVisible, updatePointerPosition]);

//   // - -
//   // Step Controls
//   const nextStep = async () => {
//     if (currentStep < steps.length - 1) {
//       try {
//         const nextStepIndex = currentStep + 1;
//         const route = steps[currentStep].nextRoute; // Get nextRoute from the current step
//         if (route) {
//           await router.push(route);
//           setTimeout(() => {
//             setCurrentStep(nextStepIndex);
//             scrollToElement(nextStepIndex);
//           }, 500); // Delay only if there's a route change
//         } else {
//           setCurrentStep(nextStepIndex);
//           scrollToElement(nextStepIndex);
//         }
//       } catch (error) {
//         console.error("Error navigating to next route", error);
//       }
//     }
//   };

//   const prevStep = async () => {
//     if (currentStep > 0) {
//       try {
//         const prevStepIndex = currentStep - 1;
//         const route = steps[currentStep].prevRoute; // Get prevRoute from the current step
//         if (route) {
//           await router.push(`${route}?step=${prevStepIndex}`);
//           setTimeout(() => {
//             setCurrentStep(prevStepIndex);
//             scrollToElement(prevStepIndex);
//           }, 500); // Delay only if there's a route change
//           router.replace(route); // Clean up the URL
//         } else {
//           setCurrentStep(prevStepIndex);
//           scrollToElement(prevStepIndex);
//         }
//       } catch (error) {
//         console.error("Error navigating to previous route", error);
//       }
//     }
//   };

//   const scrollToElement = (stepIndex: number) => {
//     const element = document.querySelector(
//       steps[stepIndex].selector as string
//     ) as Element | null;
//     if (element) {
//       const { top } = element.getBoundingClientRect();
//       const isInViewport = top >= -offset && top <= window.innerHeight + offset;
//       if (!isInViewport) {
//         element.scrollIntoView({ behavior: "smooth", block: "center" });
//       }
//     }
//   };

//   // - -
//   // Card Side
//   const getCardStyle = (
//     side: string,
//     offset: number | Record<string, number> = 0
//   ) => {
//     // Convert number offset to object for consistency
//     const offsets =
//       typeof offset === "number"
//         ? { top: offset, right: offset, bottom: offset, left: offset }
//         : { top: 25, right: 25, bottom: 25, left: 25, ...offset };

//     const baseStyles = {
//       position: "absolute" as const,
//       zIndex: 1000,
//     };

//     switch (side) {
//       case "all":
//         return {
//           ...baseStyles,
//           position: "absolute",
//           transform: "none",
//           top: offsets.top !== undefined ? `${offsets.top}px` : "auto",
//           right: offsets.right !== undefined ? `${offsets.right}px` : "auto",
//           bottom: offsets.bottom !== undefined ? `${offsets.bottom}px` : "auto",
//           left: offsets.left !== undefined ? `${offsets.left}px` : "auto",
//           margin: 0,
//         };
//       case "top":
//         return {
//           ...baseStyles,
//           transform: `translate(-50%, -${offsets.top}px)`,
//           left: "50%",
//           bottom: "100%",
//           marginBottom: "25px",
//         };
//       case "bottom":
//         return {
//           ...baseStyles,
//           transform: `translate(-50%, ${offsets.bottom}px)`,
//           left: "50%",
//           top: "100%",
//           marginTop: "25px",
//         };
//       case "left":
//         return {
//           ...baseStyles,
//           transform: `translate(-${offsets.left}px, -50%)`,
//           right: "100%",
//           top: "50%",
//           marginRight: "25px",
//         };
//       case "right":
//         return {
//           ...baseStyles,
//           transform: `translate(${offsets.right}px, -50%)`,
//           left: "100%",
//           top: "50%",
//           marginLeft: "25px",
//         };
//       default:
//         return baseStyles;
//     }
//   };

//   // - -
//   // Arrow Style
//   const getArrowStyle = (side: string) => {
//     switch (side) {
//       case "all":
//         return {
//           display: "none", // Hide arrow when using "all" positioning
//         };
//       case "bottom":
//         return {
//           transform: `translate(-50%, 0) rotate(270deg)`,
//           left: "50%",
//           top: "-23px",
//         };
//       case "top":
//         return {
//           transform: `translate(-50%, 0) rotate(90deg)`,
//           left: "50%",
//           bottom: "-23px",
//         };
//       case "right":
//         return {
//           transform: `translate(0, -50%) rotate(180deg)`,
//           top: "50%",
//           left: "-23px",
//         };
//       case "left":
//         return {
//           transform: `translate(0, -50%) rotate(0deg)`,
//           top: "50%",
//           right: "-23px",
//         };
//       default:
//         return {};
//     }
//   };

//   // - -
//   // Card Arrow
//   const CardArrow = () => {
//     return (
//       <svg
//         viewBox="0 0 54 54"
//         data-name="Tour-arrow"
//         className="absolute w-6 h-6 origin-center fill-surface"
//         style={getArrowStyle(steps[currentStep]?.side as any)}
//       >
//         <path id="triangle" d="M27 27L0 0V54L27 27Z" />
//       </svg>
//     );
//   };

//   // - -
//   // Overlay Variants
//   const variants = {
//     visible: { opacity: 1 },
//     hidden: { opacity: 0 },
//   };

//   // - -
//   // Pointer Options
//   const pointerPadding = steps[currentStep]?.pointerPadding ?? 30;
//   const pointerPadOffset = pointerPadding / 2;
//   const pointerRadius = steps[currentStep]?.pointerRadius ?? 28;

//   // - -
//   // Default Card
//   const DefaultCard = ({
//     currentStep,
//     nextStep,
//     prevStep,
//     arrow,
//   }: CardComponentProps) => {
//     return (
//       <div className="flex flex-col w-full bg-surface p-4 rounded-md text-current">
//         <div className="flex items-center justify-between gap-5 mb-3">
//           <h2 className="text-xl font-bold">
//             {steps[currentStep]?.icon} {steps[currentStep]?.title}
//           </h2>
//           <div className="text-primary text-base font-bold">
//             {currentStep + 1} of {steps.length}
//           </div>
//         </div>

//         <div data-name="Tour-stepper" className="flex w-full gap-1 mb-8">
//           {steps.map((_, index) => (
//             <span
//               key={index}
//               data-name="Tour-step"
//               className={`self-stretch w-full h-1 rounded-xl ${
//                 index === currentStep ? "bg-brand" : "bg-surface"
//               }`}
//             />
//           ))}
//         </div>

//         <div className="text-[15px]">{steps[currentStep]?.content}</div>

//         {steps[currentStep]?.showControls && (
//           <div className="flex items-center w-full gap-4 mt-4">
//             <Button
//               data-control="prev"
//               onPointerUp={prevStep}
//               className="rounded-sm px-5 py-3 outline-none inline-flex items-center text-white bg-brand hover:bg-surface hover:text-brand"
//             >
//               Prev
//             </Button>
//             <Button
//               data-control="next"
//               onPointerUp={nextStep}
//               className="rounded-sm px-5 py-3 outline-none inline-flex items-center text-white bg-brand hover:bg-surface hover:text-brand ml-auto"
//             >
//               Next
//             </Button>
//           </div>
//         )}
//         <span className="text-white">{arrow}</span>
//       </div>
//     );
//   };

//   const CardToRender = CardComponent
//     ? () => (
//         <CardComponent
//           step={steps[currentStep]}
//           currentStep={currentStep}
//           totalSteps={steps.length}
//           nextStep={nextStep}
//           prevStep={prevStep}
//           arrow={<CardArrow />}
//         />
//       )
//     : () => (
//         <DefaultCard
//           step={steps[currentStep]}
//           currentStep={currentStep}
//           totalSteps={steps.length}
//           nextStep={nextStep}
//           prevStep={prevStep}
//           arrow={<CardArrow />}
//         />
//       );

//   return (
//     <div
//       data-name="Tour-wrapper"
//       className="relative w-full"
//       data-tour="dev"
//     >
//       {/* Container for the Website content */}
//       <div data-name="Tour-site" className="relative block w-full">
//         {children}
//       </div>

//       {/* Tour Overlay Step Content */}
//       {pointerPosition && isTourVisible && (
//         <motion.div
//           data-name="Tour-overlay"
//           className="absolute inset-0 z-[995] pointer-events-none"
//           initial="hidden"
//           animate={isTourVisible ? "visible" : "hidden"} // TODO: if hidden, reduce zIndex
//           variants={variants}
//           transition={{ duration: 0.5 }}
//         >
//           <motion.div
//             data-name="Tour-pointer"
//             className="relative z-[999999999]"
//             style={{
//               boxShadow: `0 0 200vw 200vh rgba(${shadowRgb}, ${shadowOpacity})`,
//               borderRadius: `${pointerRadius}px ${pointerRadius}px ${pointerRadius}px ${pointerRadius}px`,
//             }}
//             initial={
//               pointerPosition
//                 ? {
//                     x: pointerPosition.x - pointerPadOffset,
//                     y: pointerPosition.y - pointerPadOffset,
//                     width: pointerPosition.width + pointerPadding,
//                     height: pointerPosition.height + pointerPadding,
//                   }
//                 : {}
//             }
//             animate={
//               pointerPosition
//                 ? {
//                     x: pointerPosition.x - pointerPadOffset,
//                     y: pointerPosition.y - pointerPadOffset,
//                     width: pointerPosition.width + pointerPadding,
//                     height: pointerPosition.height + pointerPadding,
//                   }
//                 : {}
//             }
//             transition={{ ease: "anticipate", duration: 0.6 }}
//           >
//             {/* Card */}
//             <div
//               className="absolute flex flex-col w-[400px] transition-all min-w-min pointer-events-auto"
//               data-name="Tour-card"
//               style={getCardStyle(
//                 steps[currentStep]?.side as any,
//                 steps[currentStep]?.offset
//               ) as React.CSSProperties}
//             >
//               <CardToRender />
//             </div>
//           </motion.div>
//         </motion.div>
//       )}
//     </div>
//   );
// }

// "use client";
// import { XIcon } from "@/inspatial/kit/icon";
// import confetti from "canvas-confetti";
// import { CardComponentProps, useTour } from "../../inspatial/kit/ui/tour";

// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent,
//   CardFooter,
// } from "../ui/card";
// import { Button } from "../ui/button";
// import { useTour } from "./provider.tsx"

// export default function TourWidget(props: CardComponentProps) {
//   // props
//   const { step, currentStep, totalSteps, nextStep, prevStep, arrow } = props;

//   // Spotlight hooks
//   const { closeTour } = useTour();

//   function handleConfetti() {
//     closeTour();
//     confetti({
//       particleCount: 100,
//       spread: 70,
//       origin: { y: 0.6 },
//     });
//   }

//   return (
//     <Card className="flex flex-col border-0 rounded-2xl max-w-vw gap-3">
//       <CardHeader>
//         <div className="flex h-auto items-center justify-between w-full">
//           <div>
//             <CardTitle className="flex text-base gap-0.5">
//               <span>{step.icon}</span>
//               <span>{step.title}</span>
//             </CardTitle>
//           </div>
//           <Button
//             variant="ghost"
//             size="icon"
//             onPointerUp={() => closeTour()}
//           >
//             <XIcon size={16} />
//           </Button>
//         </div>
//       </CardHeader>
//       <CardContent className="flex h-auto p-0">{step.content}</CardContent>
//       <CardFooter className="flex flex-col p-0">
//         <div className="flex justify-normal w-full">
//           {currentStep !== 0 && (
//             <Button
//               variant="link"
//               onPointerUp={() => prevStep()}
//               className="flex text-start items-center justify-start"
//             >
//               Previous
//             </Button>
//           )}
//           {currentStep + 1 !== totalSteps && (
//             <Button
//               onPointerUp={() => nextStep()}
//               className="ml-auto text-white"
//             >
//               Next
//             </Button>
//           )}
//           {currentStep + 1 === totalSteps && (
//             <Button
//               onPointerUp={() => handleConfetti()}
//               className="ml-auto text-white"
//             >
//               🎉 Finish!
//             </Button>
//           )}
//         </div>
//         <div className="mt-4">
//           <CardDescription className="text-muted font-bold">
//             {currentStep + 1} of {totalSteps}
//           </CardDescription>
//         </div>
//       </CardFooter>
//       <span className="text-card">{arrow}</span>
//     </Card>
//   );
// }

// import { createContext, use, useState, useCallback } from "react";

// // Types
// import { TourContextType } from "./types.ts";

// // Example Hooks Usage:
// // const { setCurrentStep, closeTour, startTour } = useTour();

// // // To trigger a specific step
// // setCurrentStep(2); // step 3

// // // To close/start onboarding
// // closeTour();
// // startTour();

// const TourContext = createContext<TourContextType | undefined>(undefined);

// const useTour = () => {
//   const context = use(TourContext);
//   if (context === undefined) {
//     throw new Error("useTour must be used within an TourProvider");
//   }
//   return context;
// };

// const TourProvider: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const [currentStep, setCurrentStepState] = useState(0);
//   const [isTourVisible, setTourVisible] = useState(false);

//   const setCurrentStep = useCallback((step: number, delay?: number) => {
//     if (delay) {
//       setTimeout(() => {
//         setCurrentStepState(step);
//         setTourVisible(true);
//       }, delay);
//     } else {
//       setCurrentStepState(step);
//       setTourVisible(true);
//     }
//   }, []);

//   const closeTour = useCallback(() => {
//     setTourVisible(false);
//   }, []);

//   const startTour = useCallback(() => {
//     setCurrentStepState(0);
//     setTourVisible(true);
//   }, []);

//   return (
//     <TourContext.Provider
//       value={{
//         currentStep,
//         setCurrentStep,
//         closeTour,
//         startTour,
//         isTourVisible,
//       }}
//     >
//       {children}
//     </TourContext.Provider>
//   );
// };

// export { TourProvider, useTour };

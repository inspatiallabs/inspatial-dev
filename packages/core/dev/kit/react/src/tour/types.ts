// // Context
// export interface TourContextType {
//   currentStep: number;
//   setCurrentStep: (step: number, delay?: number) => void;
//   closeTour: () => void;
//   startTour: () => void;
//   isTourVisible: boolean;
// }

// // Step
// export interface TourStep {
//   // Step Content
//   icon: React.ReactNode | string | null;
//   title: string;
//   content?: React.ReactNode;
//   selector?: string;
//   offset?:
//     | number
//     | {
//         top?: number;
//         right?: number;
//         bottom?: number;
//         left?: number;
//       };
//   // Options
//   side?: "top" | "bottom" | "left" | "right" | "all";
//   showControls?: boolean;
//   pointerPadding?: number;
//   pointerRadius?: number;
//   // Routing
//   nextRoute?: string;
//   prevRoute?: string;
// }

// // Tour
// export interface TourProps {
//   children: React.ReactNode;
//   steps: TourStep[];
//   showTour?: boolean;
//   shadowRgb?: string;
//   shadowOpacity?: string;
//   cardComponent?: React.ComponentType<CardComponentProps>;
// }

// // Custom Card
// export interface CardComponentProps {
//   step: TourStep;
//   currentStep: number;
//   totalSteps: number;
//   nextStep: () => void;
//   prevStep: () => void;
//   arrow: React.ReactNode;
// }

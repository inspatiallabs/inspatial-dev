// "use client";
// import { kit } from "@/lib/utils";
// import { CheckCircle } from "@phosphor-icons/react";
// import { AnimatePresence, motion } from "framer-motion";
// import { useState, useEffect } from "react";

// type LoadingState = {
//   text: string;
// };

// const LoaderCore = ({
//   loadingStates,
//   value = 0,
// }: {
//   loadingStates: LoadingState[];
//   value?: number;
// }) => {
//   return (
//     <main className="flex flex-col min-w-[384px] w-full h-full justify-center items-center bg-inherit">
//       {loadingStates.map((loadingState, index) => {
//         const distance = Math.abs(index - value);
//         const opacity = Math.max(1 - distance * 0.2, 0); // Minimum opacity is 0, keep it 0.2 if you're sane.

//         return (
//           <motion.div
//             key={index}
//             className={kit("flex w-full h-auto items-center gap-4 p-4  bg-colored")}
//             initial={{ opacity: 0, y: -(value * 40) }}
//             animate={{ opacity: opacity, y: -(value * 40) }}
//             transition={{ duration: 0.5 }}
//           >
//             <div>
//               {index > value && (
//                 <CheckCircle size={32} weight="regular" />
//               )}
//               {index <= value && (
//                 <CheckCircle size={32} weight="fill" className="bg-pop rounded-full m-1"/>
//               )}
//             </div>
//             <span
//               className={kit("flex w-full h-auto", value === index && "text-pop dark:text-pop opacity-100"
//               )}
//             >
//               {loadingState.text}
//             </span>
//           </motion.div>
//         );
//       })}
//     </main>
//   );
// };

// export const MultiMessageLoaderGroup = ({
//   loadingStates,
//   loading,
//   duration = 2000,
//   loop = true,
// }: {
//   loadingStates: LoadingState[];
//   loading?: boolean;
//   duration?: number;
//   loop?: boolean;
// }) => {
//   const [currentState, setCurrentState] = useState(0);

//   useEffect(() => {
//     if (!loading) {
//       setCurrentState(0);
//       return;
//     }
//     const timeout = setTimeout(() => {
//       setCurrentState((prevState) =>
//         loop
//           ? prevState === loadingStates.length - 1
//             ? 0
//             : prevState + 1
//           : Math.min(prevState + 1, loadingStates.length - 1)
//       );
//     }, duration);

//     return () => clearTimeout(timeout);
//   }, [currentState, loading, loop, loadingStates.length, duration]);
//   return (
//     <AnimatePresence mode="wait">
//       {loading && (
//         <motion.div
//           initial={{
//             opacity: 0,
//           }}
//           animate={{
//             opacity: 1,
//           }}
//           exit={{
//             opacity: 0,
//           }}
//           className="w-full h-full fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-2xl"
//         >
//           <div className="h-96  relative">
//             <LoaderCore value={currentState} loadingStates={loadingStates} />
//           </div>

//           <div className="bg-gradient-to-t inset-x-0 z-20 bottom-0 bg-white dark:bg-black h-full absolute [mask-image:radial-gradient(900px_at_center,transparent_30%,white)]" />
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// };

// const loadingStates = [
//   {
//     text: "Installing Spatial Kit",
//   },
//   {
//     text: "Enabling Realtime Collaboration",
//   },
//   {
//     text: "Initializing Runtime",
//   },
//   {
//     text: "Creating your Workspace",
//   },
//   {
//     text: "Waking your AI Co-pilot",
//   },
//   {
//     text: "Rendering Creator Portal",
//   },
//   {
//     text: "Optimizing your Dashboard",
//   },
//   {
//     text: "To the moon! 🚀",
//   },
// ];

// export function MultiMessageLoader() {
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     setLoading(true);
//     setTimeout(() => {
//       setLoading(false);
//     }, 16000); // 16 seconds
//   }, []);

//   return (
//     <main className="bg-colored w-full h-screen flex items-center justify-center">
//       <MultiMessageLoaderGroup
//         loadingStates={loadingStates}
//         loading={loading}
//         duration={2000}
//       />
//     </main>
//   );
// }

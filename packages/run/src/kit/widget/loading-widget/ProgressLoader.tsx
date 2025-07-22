// "use client";
// import Image from "next/image";
// import { useTheme } from "next-themes";
// import { ProgressLoaderProps } from "@/types";

// export default function ProgressLoader(props: ProgressLoaderProps) {
//   //##############################################(PROPS)##############################################//
//   const {
//     hasLoadingText = false,
//     hasVersionNumber = true,
//     hasBranding = true,
//     hasLoadingAnimation = true,
//     hasPrimitiveSplash = true,
//     loadingText = "Loading...",
//     versionNumber = "v0.1",
//   } = props;

//   //##############################################(Theme)##############################################//
//   const { resolvedTheme } = useTheme();
//   return (
//     <>
//       <main className="flex flex-col justify-center items-center h-full w-full z-[100000000]">
//         <div className="min-h-screen flex items-center justify-center px-16">
//           {/* Primitive Splash */}
//           {hasPrimitiveSplash === true && (
//             <section className="w-full max-w-lg">
//               <div className="absolute top-0 -left-4 w-3/12 h-2/5 bg-brand-color rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-splash" />
//               <div className="absolute top-0 -right-4 w-2/12 h-2/5 bg-brand-color rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-splash " />
//             </section>
//           )}
//           <section className="m-8 relative space-y-4 flex flex-col">
//             {/* Loading Text */}
//             {hasLoadingText === true && (
//               <span className="text-base flex justify-center m-auto p-1 text-center rounded-full w-auto">
//                 <p className="flex h-full w-full justify-center items-center font-bold font-body text-skyblack dark:text-white m-auto">
//                   {loadingText}
//                 </p>
//               </span>
//             )}

//             {/* Loading Bar */}
//             <div className={`p-3 bg-colored backdrop-blur-base rounded-lg flex items-center justify-between space-x-8`}>
//               <div className="flex-1">
//                 <div className="w-[300px] bg-background rounded-full h-2.5">
//                   <span
//                     className={`${
//                       hasLoadingAnimation === true ? "animate-loading" : ""
//                     } bg-brand-color dark:bg-brand-color absolute h-2.5 rounded-full `}
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Version Number */}
//             {hasVersionNumber === true && (
//               <span className="bg-colored text-base  flex justify-center m-auto p-1 text-center rounded-full w-[55px]">
//                 <p className="flex h-full w-full justify-center items-center font-bold font-heading text-skyblack dark:text-white mt-[2px]">
//                   {versionNumber}
//                 </p>
//               </span>
//             )}
//           </section>

//           {/* Branding */}
//           {hasBranding === true && (
//             <Image
//               src={
//                 resolvedTheme === "light"
//                   ? "/icons/brand-icons/brand-black.svg"
//                   : "/icons/brand-icons/brand-white.svg"
//               }
//               alt="CollectAR"
//               width={150}
//               height={100}
//               className="absolute bottom-10 m-auto "
//             />
//           )}
//         </div>
//       </main>
//     </>
//   );
// }

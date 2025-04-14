// import Pattern from "@/inspatial/kit/ui/pattern";
// import ScrollView from "@/inspatial/kit/ui/structure/scrollview/scroll-view";
// import { kit } from "@inspatial/theme/variant";

// interface ThanksWidgetProps {
//   title?: string;
//   message?: string;
//   className?: string;
// }

// export default async function ThanksWidget({
//   title = "Thank You",
//   message = "Your response has been submitted successfully!",
//   className,
// }: ThanksWidgetProps) {
//   return (
//     <main
//       className={kit(
//         `flex flex-col h-full w-full m-auto items-center justify-center max-h-full`,
//         className
//       )}
//     >
//       <Pattern variant="confetti-trail" className="w-full h-full">
//         <ScrollView
//           scrollable={false}
//           animate="bounce"
//           className="p-8 rounded-3xl shadow-md text-center"
//         >
//           <div className="size-48 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               className="size-16 text-green"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M5 13l4 4L19 7"
//               />
//             </svg>
//           </div>
//           <h1 className="text-2xl font-bold mb-4">{title}</h1>
//           <p className="mb-4">{message}</p>
//         </ScrollView>
//       </Pattern>
//     </main>
//   );
// }

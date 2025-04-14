// import Countdown from "@/components/ui/countdown";
// import Pattern from "@/inspatial/kit/ui/pattern";
// import ScrollView from "@/inspatial/kit/ui/structure/scrollview/scroll-view";

// interface UnauthorizedWidgetProps {
//   response: {
//     lockoutUntil: number | undefined;
//   };
//   title?: string;
//   message?: string;
// }

// export default async function UnauthorizedWidget({
//   response,
//   title = "Not Authorized",
//   message = "You have exhausted your attempts. Please try again in:",
// }: UnauthorizedWidgetProps) {
//   return (
//     <main className="flex flex-col h-full w-full m-auto items-center justify-center max-h-full">
//       <Pattern variant="flicker" className="">
//         <ScrollView
//           scrollable={false}
//           animate="bounce"
//           className="bg-surface p-8 rounded-lg shadow-md text-center"
//         >
//           <h1 className="text-2xl font-bold mb-4">{title}</h1>
//           <p className="mb-4">{message}</p>
//           {response.lockoutUntil && (
//             <Countdown lockoutUntil={response.lockoutUntil} />
//           )}
//         </ScrollView>
//       </Pattern>
//     </main>
//   );
// }

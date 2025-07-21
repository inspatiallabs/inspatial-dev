// /*#######################################################################
//  A widget made of a pattern, illustration and a typography
// #######################################################################*/

// import { Button } from "@/components/ui/button";
// import {
//   EmptyStateGroup,
//   EmptyStateContent,
//   EmptyStateTitle,
// } from "@/inspatial/kit/ui/emptystate";
// import BudgetIllustration from "@/inspatial/kit/ui/illustration/budget-illustration";
// import EventIllustration from "@/inspatial/kit/ui/illustration/event-illustration";
// import GroupIllustration from "@/inspatial/kit/ui/illustration/group-illustration";
// import SupplierIllustration from "@/inspatial/kit/ui/illustration/supplier-illustration";
// import TableIllustration from "@/inspatial/kit/ui/illustration/table-illustration";
// import TagIllustration from "@/inspatial/kit/ui/illustration/tag-illustration";
// import Pattern from "@/inspatial/kit/ui/pattern";
// import { Loader2, PlusIcon } from "@/inspatial/kit/icon";
// import GuestIllustration from "@/inspatial/kit/ui/illustration/guest-illustration";
// import FormIllustration from "@/inspatial/kit/ui/illustration/form-illustration";
// import React from "react";
// import { kit } from "@/inspatial/theme/variant";

// /*##############################################(TYPES)##############################################*/
// export interface EmptyStateWidgetProps {
//   className?: string;
//   title: string;
//   subTitle?: string;
//   illustration: string[];
//   cta?: {
//     text: string;
//     onClick: () => void;
//     display?: boolean;
//   } | null;
//   templateCTA?: {
//     text?: string;
//     onClick?: () => Promise<void>;
//     display?: boolean;
//   };
// }
// /*##############################################(RENDER)##############################################*/
// export default function EmptyStateWidget({
//   className,
//   title = "",
//   subTitle = "",
//   illustration,
//   cta = {
//     text: "Add New",
//     onClick: () => {},
//     // display: true,
//   },
//   templateCTA = {
//     text: "Start With Template",
//     onClick: async () => {},
//     // display: true,
//   },
// }: EmptyStateWidgetProps) {
//   /*----------------------------------------(Hooks)----------------------------------------*/

//   const [isTemplateCTAClicked, setIsTemplateCTAClicked] = React.useState(false);

//   /*----------------------------------------(Functions)----------------------------------------*/
//   async function handleCreateTemplateClick() {
//     try {
//       setIsTemplateCTAClicked(true);
//       await templateCTA?.onClick?.();
//     } finally {
//       setIsTemplateCTAClicked(false);
//     }
//   }

//   // Log for debugging
//   // console.log("EmptyStateWidget rendering with illustration:", illustration);

//   return (
//     <main
//       className={kit(
//         `flex flex-col w-full h-full items-center justify-center`,
//         className
//       )}
//     >
//       {/* Illustration & Title Section */}
//       <div className="flex flex-col items-center justify-center mb-10 relative">
//         <Pattern
//           variant="aurora"
//           className="absolute inset-0 inset-y-0 h-[200px] z-0 rounded-full min-w-screen"
//         />

//         <div className="z-10 flex flex-col items-center">
//           {/* Illustration */}
//           <div className="mb-6">
//             {illustration === "Schedule" && (
//               <EventIllustration
//                 size="xl"
//                 className="bg-surface rounded-full shadow-hollow"
//               />
//             )}
//             {illustration === "Supplier" && (
//               <SupplierIllustration
//                 size="xl"
//                 className="rounded-full shadow-hollow"
//               />
//             )}
//             {illustration === "Group" && (
//               <GroupIllustration
//                 size="xl"
//                 className="rounded-full shadow-hollow"
//               />
//             )}
//             {illustration === "Budget" && (
//               <BudgetIllustration
//                 size="xl"
//                 className="rounded-full shadow-hollow"
//               />
//             )}
//             {illustration === "Table" && (
//               <TableIllustration
//                 size="xl"
//                 className="rounded-full shadow-hollow"
//               />
//             )}
//             {illustration === "Catering" && (
//               <TagIllustration
//                 size="xl"
//                 className="rounded-full shadow-hollow"
//               />
//             )}
//             {illustration === "Guest" && (
//               <GuestIllustration
//                 size="xl"
//                 className="rounded-full shadow-hollow"
//               />
//             )}
//             {illustration === "Form" && (
//               <FormIllustration
//                 size="xl"
//                 className="rounded-full shadow-hollow"
//               />
//             )}
//           </div>

//           {/* Title & Subtitle */}
//           <div className="text-center ">
//             <EmptyStateTitle
//               className={`flex max-w-fit text-md m-auto justify-center text-center ${
//                 subTitle && "rounded-bl-none rounded-br-none px-6"
//               }`}
//             >
//               {title}
//             </EmptyStateTitle>
//             {subTitle && (
//               <EmptyStateTitle className="flex w-auto justify-center text-center text-base font-regular normal-case">
//                 {subTitle}
//               </EmptyStateTitle>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Buttons Section */}
//       <section className="flex justify-center gap-2">
//         {templateCTA && templateCTA.display === true && (
//           <Button
//             size="lg"
//             disabled={isTemplateCTAClicked}
//             className="bg-primary text-surface cursor-disabled"
//             onClick={handleCreateTemplateClick}
//           >
//             {isTemplateCTAClicked ? (
//               <Loader2 className="animate-spin" />
//             ) : (
//               templateCTA.text
//             )}
//           </Button>
//         )}
//         {cta && (cta.display === true || cta.onClick !== undefined) && (
//           <Button
//             size="lg"
//             className="cursor-pointer text-surface"
//             onClick={cta.onClick}
//           >
//             <PlusIcon className="cursor-pointer" />
//             {cta.text}
//           </Button>
//         )}
//       </section>
//     </main>
//   );
// }

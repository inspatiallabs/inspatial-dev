// import React from "react";
// import Pattern from "@/inspatial/kit/ui/pattern";
// import { PatternProps } from "@/inspatial/kit/ui/pattern/variant";
// import ScrollView from "@/inspatial/kit/ui/structure/scrolldiv/scroll-div";
// import { Text } from "@/inspatial/kit/ui/typography/text.2d";
// import { kit } from "@inspatial/theme";
// // Define SharedProps interface directly
// interface SharedProps {
//   children?: React.ReactNode;
//   className?: string;
// }
// import { Button } from "../../../../components/ui/button";
// import {
//   Tabs,
//   TabsContent,
//   TabsList,
//   TabsTrigger,
// } from "../../../../components/ui/tabs";

// // todo(@benemma) Temporary Link implmentation - replace with InSpatial Link Component which will be a  is a wrapper around InSpatial Router
// const Link = ({
//   href,
//   children,
//   ...props
// }: {
//   href: string;
//   children: React.ReactNode;
//   [key: string]: any;
// }) => (
//   <a href={href} {...props}>
//     {children}
//   </a>
// );

// /*##############################################(TYPES)##############################################*/
// type ButtonType = {
//   button: {
//     label: string;
//     href: string;
//   };
// };

// type TabType = {
//   label: string;
//   href: string;
//   content?: {
//     title?: string;
//     description?: string;
//     image?: string;
//   };
// };

// export interface ScreenWidgetProps extends SharedProps {
//   title?: string;
//   description?: string;
//   image?: string;
//   action?: ButtonType | TabType[];
//   layout?: "Left" | "Right" | "Center";
//   pattern?: PatternProps["variant"];
// }

// export default function ScreenWidget(props: ScreenWidgetProps) {
//   /*----------------------------------------(PROPS)----------------------------------------*/
//   const {
//     children,
//     className,
//     title: defaultTitle,
//     description: defaultDescription,
//     image: defaultImage,
//     action,
//     layout = "Center",
//     pattern = "none",
//   } = props;

//   // Automatically determine action type
//   const isTabAction = Array.isArray(action);
//   const isButtonAction = !isTabAction && action && "button" in action;

//   // State to keep track of the active tab and content
//   const [activeTab, setActiveTab] = React.useState("tab1");
//   const [currentTitle, setCurrentTitle] = React.useState(defaultTitle);
//   const [currentDescription, setCurrentDescription] =
//     React.useState(defaultDescription);
//   const [currentImage, setCurrentImage] = React.useState(defaultImage);

//   // Create tab data structure
//   const tabItems = isTabAction ? (action as TabType[]).slice(0, 3) : [];

//   // Update content when tab changes
//   React.useEffect(() => {
//     if (isTabAction) {
//       const tabIndex = parseInt(activeTab.replace("tab", "")) - 1;
//       const selectedTab = (action as TabType[])[tabIndex];

//       if (selectedTab && selectedTab.content) {
//         setCurrentTitle(selectedTab.content.title || defaultTitle);
//         setCurrentDescription(
//           selectedTab.content.description || defaultDescription
//         );
//         setCurrentImage(selectedTab.content.image || defaultImage);
//       } else {
//         setCurrentTitle(defaultTitle);
//         setCurrentDescription(defaultDescription);
//         setCurrentImage(defaultImage);
//       }
//     }
//   }, [
//     activeTab,
//     action,
//     defaultTitle,
//     defaultDescription,
//     defaultImage,
//     isTabAction,
//   ]);

//   // Content section with title, description, and action
//   const ContentSection = () => (
//     <div className="flex flex-col gap-6">
//       <div className="flex flex-col gap-2">
//         <Text
//           animate="none"
//           className={`w-auto text-h2 text-wrap md:text-lg font-bold ${
//             layout === "Left" && "text-left"
//           } ${layout === "Right" && "text-right"} ${
//             layout === "Center" && "text-center justify-center items-center"
//           }`}
//         >
//           {currentTitle}
//         </Text>
//         {currentDescription && (
//           <Text
//             animate="blurIn"
//             className={`w-full text-h6 text-wrap ${
//               layout === "Left" && "text-left"
//             } ${layout === "Right" && "text-left"} ${
//               layout === "Center" && "text-center justify-center items-center"
//             }`}
//           >
//             {currentDescription}
//           </Text>
//         )}
//       </div>

//       {action && (
//         <div
//           className={`w-full ${layout === "Left" && "text-left"} ${
//             layout === "Right" && "text-right"
//           } ${
//             layout === "Center" && "text-center justify-center items-center"
//           }`}
//         >
//           {isButtonAction ? (
//             <Button size="lg" className="w-full text-surface" asChild>
//               <Link href={(action as ButtonType).button.href}>
//                 {(action as ButtonType).button.label}
//               </Link>
//             </Button>
//           ) : (
//             isTabAction && (
//               <Tabs
//                 defaultValue="tab1"
//                 value={activeTab}
//                 onValueChange={setActiveTab}
//                 className="w-full"
//               >
//                 <TabsList className="w-full max-w-xs flex justify-center md:justify-start">
//                   {tabItems.map((tab, index) => (
//                     <TabsTrigger
//                       key={index}
//                       value={`tab${index + 1}`}
//                       className="w-full"
//                     >
//                       {tab.label}
//                     </TabsTrigger>
//                   ))}
//                 </TabsList>

//                 {/* Hidden TabsContent for structure */}
//                 {tabItems.map((tab, index) => (
//                   <TabsContent key={index} value={`tab${index + 1}`}>
//                     {/* Content is controlled by the useEffect above */}
//                   </TabsContent>
//                 ))}
//               </Tabs>
//             )
//           )}
//         </div>
//       )}
//     </div>
//   );

//   // Image section
//   const ImageSection = () => (
//     <ScrollView scrollable={false} animate="scale">
//       <img src={currentImage} className="mx-auto w-full" />
//     </ScrollView>
//   );

//   /*----------------------------------------(RENDER)----------------------------------------*/
//   return (
//     <Pattern
//       variant={pattern}
//       className={kit("flex flex-col w-full min-h-screen h-screen", className)}
//     >
//       {layout === "Center" ? (
//         // Center layout (vertical stacking)
//         <section className="flex flex-col items-center justify-center w-full max-w-4xl h-full mx-auto gap-12 px-4 relative m-auto antialiased">
//           <div className="flex flex-col gap-2">
//             <Text
//               animate="none"
//               className="w-auto justify-center text-h2 text-wrap md:text-lg font-bold text-center"
//             >
//               {currentTitle}
//             </Text>
//             {currentDescription && (
//               <Text
//                 animate="blurIn"
//                 className="w-full justify-center text-h6 text-wrap text-center"
//               >
//                 {currentDescription}
//               </Text>
//             )}
//           </div>

//           <ImageSection />

//           {action && (
//             <ScrollView scrollable={false} animate="scale" delay={1}>
//               {isButtonAction ? (
//                 <Button size="lg" className="w-full text-surface" asChild>
//                   <Link href={(action as ButtonType).button.href}>
//                     {(action as ButtonType).button.label}
//                   </Link>
//                 </Button>
//               ) : (
//                 isTabAction && (
//                   <Tabs
//                     defaultValue="tab1"
//                     value={activeTab}
//                     onValueChange={setActiveTab}
//                     className="w-full"
//                   >
//                     <TabsList className="w-full flex justify-center">
//                       {tabItems.map((tab, index) => (
//                         <TabsTrigger
//                           key={index}
//                           value={`tab${index + 1}`}
//                           className="w-full"
//                         >
//                           {tab.label}
//                         </TabsTrigger>
//                       ))}
//                     </TabsList>

//                     {/* Hidden TabsContent for structure */}
//                     {tabItems.map((tab, index) => (
//                       <TabsContent key={index} value={`tab${index + 1}`}>
//                         {/* Content is controlled by the useEffect above */}
//                       </TabsContent>
//                     ))}
//                   </Tabs>
//                 )
//               )}
//             </ScrollView>
//           )}
//         </section>
//       ) : (
//         <section className="flex flex-row md:flex-col items-center justify-center w-full max-w-7xl h-full mx-auto gap-12 px-4 relative m-auto antialiased">
//           <div
//             className={`flex gap-12 md:flex-col ${
//               layout === "Right" ? "flex-row-reverse" : "flex-row"
//             } w-full`}
//           >
//             <div className="w-full">
//               <ImageSection />
//             </div>
//             <div className="flex flex-col w-full h-auto items-center justify-center">
//               <ContentSection />
//             </div>
//           </div>
//         </section>
//       )}
//     </Pattern>
//   );
// }

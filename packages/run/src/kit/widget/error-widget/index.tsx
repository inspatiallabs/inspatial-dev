// // NOTE: This ErrorWrapper HOC is still experimental and may cause infinite loop when applied
// // However the goal is to create a universal or shared error style to reduce recreation of multiple
// // error pages...


// import { ErrorWrapperType } from "./types";
// import { useLocation } from "react-router";
// import React from "react";

// export default function ErrorWidget(props: ErrorWrapperType) {
//   const currentPath = useLocation().pathname;

//   const {
//     errorMessager = undefined,
//     errorHeader = "Oh Snap!",
//     ctaText = "Try Again",
//     ctaReset = () => {},
//   } = props;
  
//   const [errorMessage, setErrorMessage] = React.useState(false);

//   return (
//     <main className="bg-red/20 h-full w-full flex flex-col justify-center items-center text-center gap-4">
//       <div className="flex flex-col justify-center items-center space-y-2">
//         <p className="text-red font-heading">{errorHeader}</p>

//         <p className="text-red ">
//           There was a problem loading {currentPath} deguge
//         </p>

//         {errorMessage && <p className="text-base w-9/12">{errorMessager}</p>}
//         <p
//           className="text-base underline cursor-pointer"
//           onPointerUp={() => {
//             if (errorMessage === false) {
//               setErrorMessage(true);
//             } else {
//               setErrorMessage(false);
//             }
//           }}
//         >
//           {errorMessage ? "Hide Error Message" : "See Error Message"}
//         </p>
//       </div>
//       <div className="">
//         <button className="primitive-button" onPointerUp={ctaReset}>
//           <p className="button-text">{ctaText}</p>
//         </button>
//       </div>
//     </main>
//   );
// }

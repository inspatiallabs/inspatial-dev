// "use client";

// import React from "react";
// import ProgressLoader from "../loading-widget/ProgressLoader.tsx";
// import LogoLoader from "../loading-widget/LogoLoader.tsx";
// import MultiMessageLoader from "../loading-widget/MultiMessageLoader.tsx";

// export default function Loader() {
//   //##############################################(State)##############################################//
//   const [hasRendered, setHasRendered] = React.useState(false);
//   const [showMultiMessageLoader, setShowMultiMessageLoader] =
//     React.useState(false);

//   //##############################################(Effects)##############################################//
//   // This code is responsible for making MultiMessageLoader render only once per local storage session
//   // and then renders the LogoLoader for the rest of the session.
//   ////////////////////////////////////////////////////////////////////////////////////////////////////////
//   React.useEffect(() => {
//     const isFirstVisit = !localStorage.getItem("VisitedBefore");

//     if (isFirstVisit) {
//       setShowMultiMessageLoader(true);
//       localStorage.setItem("VisitedBefore", "true");
//     } else {
//       setHasRendered(true);
//     }
//   }, []);

//   // This code is responsible for making LogoLoader render only once per browser window/tab session
//   // and then renders the ProgressLoader for the rest of the session.
//   ////////////////////////////////////////////////////////////////////////////////////////////////////////
//   React.useEffect(() => {
//     if (hasRendered || sessionStorage.getItem("LoaderRendered")) {
//       return;
//     }
//     setHasRendered(true);
//     sessionStorage.setItem("LoaderRendered", "true");

//     const cleanup = () => {
//       sessionStorage.removeItem("LoaderRendered");
//     };

//     window.addEventListener("unload", cleanup);
//     return () => {
//       window.removeEventListener("unload", cleanup);
//     };
//   }, [hasRendered]);

//   if (showMultiMessageLoader) {
//     return (
//       <section className="flex w-screen h-screen bg-surface">
//         <MultiMessageLoader />;{/** Add QuoteLoader */}
//       </section>
//     );
//   } else if (hasRendered) {
//     return <LogoLoader />;
//   } else {
//     return <ProgressLoader />;
//   }
// }

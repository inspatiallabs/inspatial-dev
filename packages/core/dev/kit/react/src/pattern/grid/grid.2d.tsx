// import React from "react";
// import { motion } from "framer-motion";
// import { PatternProps } from "../serialize";
// import { SharedProps } from "@/types";
// import { kit } from "@/spatialKit/util/utils";

// //##############################################(GRID CONFIGURATION)##############################################//
// export const gridConfigs: GridFormatConfig = {
//   orthographic: {
//     angle: 90,
//     depth: 0,
//     cellSize: 40,
//     spacing: 2,
//     intensity: 0,
//     speed: 0,
//     color: "",
//     blur: 0,
//   },
//   perspective: {
//     angle: 45,
//     depth: 100,
//     vanishingPoint: { x: 0.5, y: 0.5 },
//     cellSize: { width: 40, height: 20 },
//     intensity: 0,
//     speed: 0,
//     color: "",
//     blur: 0,
//   },
// };

// //##############################################(GRID FORMAT TYPES)##############################################//
// export type GridFormat = "orthographic" | "perspective";

// type GridFormatConfig = {
//   orthographic: GridOrthographicConfig;
//   perspective: GridPerspectiveConfig;
// };

// interface GridComponentProps extends PatternProps {
//   format: GridFormat;
//   config: (typeof gridConfigs)[GridFormat];
// }

// interface CommonProps extends SharedProps {
//   intensity: number;
//   speed: number;
//   color: string;
//   blur: number;
// }

// interface GridOrthographicConfig extends CommonProps {
//   angle: number;
//   depth: number;
//   cellSize: number;
//   spacing: number;
// }

// interface GridPerspectiveConfig extends CommonProps {
//   angle: number;
//   depth: number;
//   vanishingPoint: { x: number; y: number };
//   cellSize: { width: number; height: number };
// }

// interface GridIsometricConfig extends CommonProps {
//   angle: number;
//   depth: number;
//   cellSize: number;
//   elevation: number;
// }

// //##############################################(ORTHOGRAPHIC GRID)##############################################//
// export const OrthographicGrid: React.FC<
//   GridOrthographicConfig & CommonProps
// > = ({ angle, depth, cellSize, spacing, intensity, speed, color, blur }) => {
//   // Implementation for orthographic grid
//   return (
//     <div
//       style={{
//         transform: `rotateX(${angle}deg)`,
//         perspective: depth,
//       }}
//     >
//       Orthographic Grid
//       {/* Grid implementation */}
//     </div>
//   );
// };

// //##############################################(PERSPECTIVE GRID)##############################################//

// export const PerspectiveGrid: React.FC<GridPerspectiveConfig & CommonProps> = ({
//   className,
//   angle,
//   // depth,
//   // vanishingPoint,
//   // cellSize,
//   // intensity,
//   // speed,
//   // color,
//   // blur,
// }) => {
//   // Implementation for perspective grid
//   return (
//     <div
//       className={kit(
//         "pointer-events-none absolute size-full overflow-hidden opacity-50 [perspective:200px]",
//         className
//       )}
//       style={{ "--grid-angle": `${angle}deg` } as React.CSSProperties}
//     >
//       {/* Grid */}
//       <div className="absolute inset-0 [transform:rotateX(var(--grid-angle))]">
//         <div
//           className={kit(
//             "animate-perspective",

//             "[background-repeat:repeat] [background-size:60px_60px] [height:300vh] [inset:0%_0px] [margin-left:-50%] [transform-origin:100%_0_0] [width:600vw]",

//             // Light Styles
//             "[background-image:linear-gradient(to_right,rgba(0,0,0,0.3)_1px,transparent_0),linear-gradient(to_bottom,rgba(0,0,0,0.3)_1px,transparent_0)]",

//             // Dark styles
//             "dark:[background-image:linear-gradient(to_right,rgba(255,255,255,0.2)_1px,transparent_0),linear-gradient(to_bottom,rgba(255,255,255,0.2)_1px,transparent_0)]"
//           )}
//         />
//       </div>
//     </div>
//   );
// };

// //##############################################(GRID COMPONENT)##############################################//
// // This is a 2D grid pattern
// // For 3D grid, see grid.3d.tsx
// export default function Grid({
//   format,
//   config,
//   intensity = 1,
//   speed = 1,
//   color,
//   blur,
//   className,
//   ...props
// }: GridComponentProps) {
//   const renderGrid = () => {
//     switch (format) {
//       case "orthographic":
//         return (
//           <OrthographicGrid
//             {...config}
//             intensity={intensity}
//             speed={speed}
//             color={color || ""}
//             blur={blur || 0}
//           />
//         );

//       case "perspective":
//         return (
//           <PerspectiveGrid
//             {...config}
//             intensity={intensity}
//             speed={speed}
//             color={color || ""}
//             blur={blur || 0}
//           />
//         );

//       default:
//         return <OrthographicGrid {...config} />;
//     }
//   };

//   return (
//     <motion.div className={kit("relative w-full h-full", className)} {...props}>
//       {renderGrid()}
//     </motion.div>
//   );
// }

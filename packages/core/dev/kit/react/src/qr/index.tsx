// import React from "react";
// import { QREncoder } from "./encoder";

// interface QRCodeProps {
//   bgColor?: string;
//   fgColor?: string;
//   data: string;
//   size?: number;
//   title?: string;
//   className?: string;
// }

// export default function QRCode({
//   bgColor = "#ffffff",
//   fgColor = "#000000",
//   data,
//   size = 256,
//   title,
//   className = "",
// }: QRCodeProps) {
//   const matrix = React.useMemo(() => {
//     try {
//       return QREncoder.encode(data);
//     } catch (error) {
//       console.error("Error generating QR code:", error);
//       return Array(29)
//         .fill(null)
//         .map(() => Array(29).fill(false));
//     }
//   }, [data]);

//   const moduleSize = size / matrix.length;

//   // Generate path for dark modules
//   const path = React.useMemo(() => {
//     let d = "";
//     for (let row = 0; row < matrix.length; row++) {
//       for (let col = 0; col < matrix.length; col++) {
//         if (matrix[row][col]) {
//           d +=
//             `M${col * moduleSize},${row * moduleSize}` +
//             `h${moduleSize}v${moduleSize}h-${moduleSize}z`;
//         }
//       }
//     }
//     return d;
//   }, [matrix, moduleSize]);

//   return (
//     <svg
//       width={size}
//       height={size}
//       viewBox={`0 0 ${size} ${size}`}
//       xmlns="http://www.w3.org/2000/svg"
//       className={`inline-block ${className}`}
//     >
//       {title && <title>{title}</title>}
//       <rect width={size} height={size} fill={bgColor} />
//       <path d={path} fill={fgColor} />
//     </svg>
//   );
// }

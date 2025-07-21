// // @ts-ignore
// import plugin from "tailwindcss/plugin";

// // Define spring types and their corresponding perceptual duration multipliers
// export const springPerceptualMultipliers = {
//   "var(--motion-spring-smooth)": "1.66",
//   "var(--motion-spring-snappy)": "1.66",
//   "var(--motion-spring-bouncy)": "1.66",
//   "var(--motion-spring-bouncier)": "2.035",
//   "var(--motion-spring-bounciest)": "5.285",
//   "var(--motion-bounce)": "2",
// };

// export const addMotionModifiers = plugin(({ matchUtilities, theme }) => {
//   // duration
//   matchUtilities(
//     {
//       "motion-duration": (value, { modifier }) => {
//         switch (modifier) {
//           case "scale":
//             return { "--motion-scale-duration": value };
//           case "translate":
//             return { "--motion-translate-duration": value };
//           case "rotate":
//             return { "--motion-rotate-duration": value };
//           case "blur":
//           case "grayscale":
//             return { "--motion-filter-duration": value };
//           case "opacity":
//             return { "--motion-opacity-duration": value };
//           case "background":
//             return { "--motion-background-color-duration": value };
//           case "text":
//             return { "--motion-text-color-duration": value };
//           default:
//             return {
//               "--motion-duration": value,
//             };
//         }
//       },
//     },
//     {
//       values: theme("animationDuration"),
//       modifiers: {
//         scale: "scale",
//         translate: "translate",
//         rotate: "rotate",
//         blur: "blur",
//         grayscale: "grayscale",
//         opacity: "opacity",
//         background: "background",
//         text: "text",
//       },
//     }
//   );

//   // delay
//   matchUtilities(
//     {
//       "motion-delay": (value, { modifier }) => {
//         switch (modifier) {
//           case "scale":
//             return { "--motion-scale-delay": value };
//           case "translate":
//             return { "--motion-translate-delay": value };
//           case "rotate":
//             return { "--motion-rotate-delay": value };
//           case "blur":
//           case "grayscale":
//             return { "--motion-filter-delay": value };
//           case "opacity":
//             return { "--motion-opacity-delay": value };
//           case "background":
//             return { "--motion-background-color-delay": value };
//           case "text":
//             return { "--motion-text-color-delay": value };
//           default:
//             return {
//               "--motion-delay": value,
//             };
//         }
//       },
//     },
//     {
//       // use the same values as the duration
//       values: theme("animationDuration"),
//       modifiers: {
//         scale: "scale",
//         translate: "translate",
//         rotate: "rotate",
//         blur: "blur",
//         grayscale: "grayscale",
//         opacity: "opacity",
//         background: "background",
//         text: "text",
//       },
//     }
//   );

//   // ease
//   matchUtilities(
//     {
//       "motion-ease": (value, { modifier }) => {
//         // if the ease isn't a spring, the multiplier doesn't change anything
//         const perceptualDurationMultiplier =
//           springPerceptualMultipliers[value] || 1;

//         const isSpringWithBounce =
//           [
//             "var(--motion-spring-bouncy)",
//             "var(--motion-spring-bouncier)",
//             "var(--motion-spring-bounciest)",
//             "var(--motion-bounce)",
//           ].indexOf(value) !== -1;

//         switch (modifier) {
//           case "scale":
//             return {
//               "--motion-scale-timing": value,
//               "--motion-scale-perceptual-duration-multiplier": `${perceptualDurationMultiplier}`,
//             };
//           case "translate":
//             return {
//               "--motion-translate-timing": value,
//               "--motion-translate-perceptual-duration-multiplier": `${perceptualDurationMultiplier}`,
//             };
//           case "rotate":
//             return {
//               "--motion-rotate-timing": value,
//               "--motion-rotate-perceptual-duration-multiplier": `${perceptualDurationMultiplier}`,
//             };
//           case "blur":
//           case "grayscale":
//             return {
//               "--motion-filter-timing": value,
//               "--motion-filter-perceptual-duration-multiplier": `${perceptualDurationMultiplier}`,
//             };
//           case "opacity":
//             return {
//               "--motion-opacity-timing": value,
//               "--motion-opacity-perceptual-duration-multiplier": `${perceptualDurationMultiplier}`,
//             };
//           case "background":
//             return {
//               "--motion-background-color-timing": value,
//               "--motion-background-color-perceptual-duration-multiplier": `${perceptualDurationMultiplier}`,
//             };
//           case "text":
//             return {
//               "--motion-text-color-timing": value,
//               "--motion-text-color-perceptual-duration-multiplier": `${perceptualDurationMultiplier}`,
//             };
//           default:
//             if (isSpringWithBounce) {
//               return {
//                 "--motion-timing": value,
//                 "--motion-perceptual-duration-multiplier": `${perceptualDurationMultiplier}`,

//                 // filter, opacity, and color animations don't look good with bouncy springs
//                 // so we use a smooth spring for them
//                 "--motion-filter-timing": "var(--motion-spring-smooth)",
//                 "--motion-opacity-timing": "var(--motion-spring-smooth)",
//                 "--motion-background-color-timing":
//                   "var(--motion-spring-smooth)",
//                 "--motion-text-color-timing": "var(--motion-spring-smooth)",

//                 "--motion-filter-perceptual-duration-multiplier": "1.66",
//                 "--motion-opacity-perceptual-duration-multiplier": "1.66",
//                 "--motion-background-color-perceptual-duration-multiplier":
//                   "1.66",
//                 "--motion-text-color-perceptual-duration-multiplier": "1.66",
//               };
//             } else {
//               return {
//                 "--motion-timing": value,
//                 "--motion-perceptual-duration-multiplier": `${perceptualDurationMultiplier}`,
//               };
//             }
//         }
//       },
//     },
//     {
//       values: theme("animationTimingFunction"),
//       modifiers: {
//         scale: "scale",
//         translate: "translate",
//         rotate: "rotate",
//         blur: "blur",
//         grayscale: "grayscale",
//         opacity: "opacity",
//         background: "background",
//         text: "text",
//       },
//     }
//   );
// });

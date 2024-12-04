// // @ts-ignore
// import plugin from "tailwindcss/plugin";
// import { addMotionPresets } from "./add-motion-presets";
// import { addMotionAnimations } from "./add-motion-animations";
// import { addMotionModifiers } from "./add-motion-modifiers";
// import { addMotionDefaults } from "./add-motion-defaults";
// import { addMotionKeyframes } from "./add-motion-keyframes";
// import { PluginAPI } from "tailwindcss/types/config";

// //NOTE: This is the main plugin that adds all the motion plugins together, its structure is done this way to allow for easier customization of the motion plugins
// // However, you can use the individual plugins if you need more control over the motion plugins,
// // but this structure is recommended for most use cases as it is easier to manage and customize

// // Define the plugin function
// export const addMotion = plugin(
//   ({
//     addBase,
//     addUtilities,
//     matchUtilities,
//     theme,
//     addComponents,
//     matchComponents,
//   }: PluginAPI) => {
//     addMotionDefaults(addBase);
//     addMotionKeyframes(addUtilities);
//     addMotionModifiers(matchUtilities, theme);
//     addMotionAnimations(matchUtilities, theme);
//     addMotionPresets(addComponents, matchComponents, theme);
//   }
// );

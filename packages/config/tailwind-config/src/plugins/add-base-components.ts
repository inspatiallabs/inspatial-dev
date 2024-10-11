// @ts-ignore
import plugin from "tailwindcss/plugin";

// TODO: Move all custom base components made on InSpatial's global.css to this function, for intellisense
export const addBaseComponents = plugin(({ addComponents }) => {
  addComponents({
    // ".button": {
    //   color: "#fff",
    // },
  });
});

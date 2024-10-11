// @ts-ignore
import plugin from "tailwindcss/plugin";
/**
 * Create custom cursor utilities.
 */
export const addCursorUtilities = plugin(({ addUtilities }) => {
  addUtilities({
    ".cursor-move-top": {
      cursor: "url(/icons/cursor/MoveTCursor.svg), move",
    },

    ".cursor-move-bottom": {
      cursor: "url(/icons/cursor/MoveBCursor.svg), move",
    },

    ".cursor-move-left": {
      cursor: "url(/icons/cursor/MoveLCursor.svg), move",
    },

    ".cursor-move-right": {
      cursor: "url(/icons/cursor/MoveRCursor.svg), move",
    },
  });
});

// @ts-ignore
import plugin from "tailwindcss/plugin";
/**
 * Create custom cursor utilities.
 */
export const addCursorUtilities = plugin(({ addUtilities }) => {
  addUtilities({
    ".cursor-move-top": {
      cursor: "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/MoveTCursor.svg), move",
    },

    ".cursor-move-bottom": {
      cursor: "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/MoveBCursor.svg), move",
    },

    ".cursor-move-left": {
      cursor: "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/MoveLCursor.svg), move",
    },

    ".cursor-move-right": {
      cursor: "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/MoveRCursor.svg), move",
    },
  });
});

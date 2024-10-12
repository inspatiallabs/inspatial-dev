// @ts-ignore
import plugin from "tailwindcss/plugin";

/**
 * Custom Tailwind CSS Plugin to set cursor defaults for different elements. 
 */
export const addCursorBase = plugin(({ addBase }) => {
  addBase({
    "*, html, body": {
      cursor: "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/DefaultCursor.svg), default",
    },

    'button, [type="button"], [type="reset"], [type="submit"], a, [role="button"], [role="link"], [role="menuitem"], summary, [aria-controls], [aria-expanded], [aria-haspopup], [tabindex]:not([tabindex="-1"]), .pointer-events, a.pointer-events, Link':
      { cursor: "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/PointerCursor.svg), pointer" },
    'textarea, input[type="text"], input[type="password"], input[type="email"], input[type="number"], input[type="tel"], input[type="url"], input[type="search"]':
      {
        cursor: "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/TextYCursor.svg), text",
      },
    "[disabled], [disabled] *": {
      cursor: "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/DisabledCursor.svg), not-allowed",
    },
    'a[href], button, input[type="button"], input[type="submit"], input[type="reset"]':
      {
        cursor: "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/PointerCursor.svg), pointer",
      },
    '[role="button"]': {
      cursor: "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/PointerCursor.svg), pointer",
    },
    '[role="radio"], [role="checkbox"]': {
      cursor: "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/PointerCursor.svg), pointer",
    },
    '[draggable="true"]': {
      cursor: "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/MoveCursor.svg), move",
    },
    '[aria-busy="true"]': {
      cursor: "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/LoadingCursor.svg), progress",
    },
    "[aria-controls]": {
      cursor: "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/PointerCursor.svg), pointer",
    },
    '[aria-disabled="true"], [aria-disabled="true"] *': {
      cursor: "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/DisabledCursor.svg), not-allowed",
    },
    '[aria-expanded="false"]': {
      cursor: "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/ZoomInCursor.svg), zoom-in",
    },
    '[aria-expanded="true"]': {
      cursor: "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/ZoomOutCursor.svg), zoom-out",
    },
    '[aria-grabbed="true"]': {
      cursor: "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/PanningCursor.svg), grabbing",
    },
    '[aria-haspopup="true"]': {
      cursor: "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/PointerCursor.svg), pointer",
    },
    '[aria-hidden="true"]': {
      cursor: "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/DisabledCursor.svg), not-allowed",
    },
    '[aria-invalid="true"]': {
      cursor: "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/DisabledCursor.svg), not-allowed",
    },
    '[aria-readonly="true"]': {
      cursor: "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/DisabledCursor.svg), not-allowed",
    },
    '[aria-required="true"]': {
      cursor: "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/PointerCursor.svg), pointer",
    },
    'input[type="range"]': {
      cursor: "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/PointerCursor.svg), pointer",
    },
    'input[type="checkbox"], input[type="radio"]': {
      cursor: "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/PointerCursor.svg), pointer",
    },
    "select, optgroup, option": {
      cursor: "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/SelectCursor.svg), default",
    },
    "button[disabled], input[disabled], textarea[disabled], select[disabled]": {
      cursor: "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/DisabledCursor.svg), not-allowed",
    },
    "input[readonly], textarea[readonly]": {
      cursor: "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/DisabledCursor.svg), not-allowed",
    },
    '[contenteditable="true"]': {
      cursor: "url(https://inspatial-storage.s3.eu-west-2.amazonaws.com/cursors/TextYCursor.svg), text",
    },
  });
});

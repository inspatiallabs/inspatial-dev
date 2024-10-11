// @ts-ignore
import plugin from "tailwindcss/plugin";

/**
 * Custom Tailwind CSS Plugin to set cursor defaults.
 */
export const addCursorBase = plugin(({ addBase }) => {
  addBase({
    "html, body": {
      cursor: "url(/icons/cursor/DefaultCursor.svg), default",
    },

    'button, [type="button"], [type="reset"], [type="submit"], a, [role="button"], [role="link"], [role="menuitem"], summary, [aria-controls], [aria-expanded], [aria-haspopup], [tabindex]:not([tabindex="-1"]), .pointer-events, a.pointer-events, Link':
      { cursor: "url(/icons/cursor/PointerCursor.svg), pointer" },
    'textarea, input[type="text"], input[type="password"], input[type="email"], input[type="number"], input[type="tel"], input[type="url"], input[type="search"]':
      {
        cursor: "url(/icons/cursor/TextYCursor.svg), text",
      },
    "[disabled], [disabled] *": {
      cursor: "url(/icons/cursor/DisabledCursor.svg), not-allowed",
    },
    'a[href], button, input[type="button"], input[type="submit"], input[type="reset"]':
      {
        cursor: "url(/icons/cursor/PointerCursor.svg), pointer",
      },
    '[role="button"]': {
      cursor: "url(/icons/cursor/PointerCursor.svg), pointer",
    },
    '[role="radio"], [role="checkbox"]': {
      cursor: "url(/icons/cursor/PointerCursor.svg), pointer",
    },
    '[draggable="true"]': {
      cursor: "url(/icons/cursor/MoveCursor.svg), move",
    },
    '[aria-busy="true"]': {
      cursor: "url(/icons/cursor/LoadingCursor.svg), progress",
    },
    "[aria-controls]": {
      cursor: "url(/icons/cursor/PointerCursor.svg), pointer",
    },
    '[aria-disabled="true"], [aria-disabled="true"] *': {
      cursor: "url(/icons/cursor/DisabledCursor.svg), not-allowed",
    },
    '[aria-expanded="false"]': {
      cursor: "url(/icons/cursor/ZoomInCursor.svg), zoom-in",
    },
    '[aria-expanded="true"]': {
      cursor: "url(/icons/cursor/ZoomOutCursor.svg), zoom-out",
    },
    '[aria-grabbed="true"]': {
      cursor: "url(/icons/cursor/PanningCursor.svg), grabbing",
    },
    '[aria-haspopup="true"]': {
      cursor: "url(/icons/cursor/PointerCursor.svg), pointer",
    },
    '[aria-hidden="true"]': {
      cursor: "url(/icons/cursor/DisabledCursor.svg), not-allowed",
    },
    '[aria-invalid="true"]': {
      cursor: "url(/icons/cursor/DisabledCursor.svg), not-allowed",
    },
    '[aria-readonly="true"]': {
      cursor: "url(/icons/cursor/DisabledCursor.svg), not-allowed",
    },
    '[aria-required="true"]': {
      cursor: "url(/icons/cursor/PointerCursor.svg), pointer",
    },
    'input[type="range"]': {
      cursor: "url(/icons/cursor/PointerCursor.svg), pointer",
    },
    'input[type="checkbox"], input[type="radio"]': {
      cursor: "url(/icons/cursor/PointerCursor.svg), pointer",
    },
    "select, optgroup, option": {
      cursor: "url(/icons/cursor/SelectCursor.svg), default",
    },
    "button[disabled], input[disabled], textarea[disabled], select[disabled]": {
      cursor: "url(/icons/cursor/DisabledCursor.svg), not-allowed",
    },
    "input[readonly], textarea[readonly]": {
      cursor: "url(/icons/cursor/DisabledCursor.svg), not-allowed",
    },
    '[contenteditable="true"]': {
      cursor: "url(/icons/cursor/TextYCursor.svg), text",
    },
  });
});

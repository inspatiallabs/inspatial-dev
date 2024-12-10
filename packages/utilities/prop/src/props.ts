import { HTMLAttributes } from "react";
import { VariantProps } from "tailwind-variants";
// import { IconVariants } from "@/components/icons/variants";
// import { TypographyProps } from "@/spatialKit/UI/Typography/variant";

/**********************************(Modal Props)**********************************/

/**
 * ModalContextType defines the shape of the modal context.
 * It provides methods to open and close a modal within your application.
 *
 * @interface ModalContextType
 * @property {function} openModal - Opens a modal with the provided content.
 * @property {function} closeModal - Closes the currently open modal.
 *
 * @example
 * ```tsx
 * const { openModal, closeModal } = useModal();
 *
 * openModal(<MyModalContent />);
 * // Later...
 * closeModal();
 * ```
 */
export interface ModalContextType {
  openModal: (content: React.ReactNode) => void;
  closeModal: () => void;
}

/**********************************(Xata Omit Props)**********************************/

/**
 * XataOmit is a type that represents fields to be omitted from Xata database types.
 * Use this type when you want to exclude Xata-specific fields from your data models.
 *
 * @type {string}
 *
 * @example
 * ```ts
 * type MyDataModel = Omit<XataRecord, XataOmit>;
 * ```
 */
export type XataOmit =
  | "xata_id"
  | "xata_createdat"
  | "xata_updatedat"
  | "xata_version";

/******************************************(Icon Props)**********************************/

/**
 * IconProps defines the properties that can be passed to the Icon component.
 * It extends React's HTMLAttributes for div elements and includes variant props.
 *
 * @interface IconProps
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 * @extends {VariantProps<typeof IconVariants>}
 *
 * @example
 * ```tsx
 * <Icon size="lg" color="primary" className="my-icon" />
 * ```
 */
// export interface IconProps
//   extends React.HTMLAttributes<HTMLDivElement>,
//     VariantProps<typeof IconVariants> {}

/**********************************(Shared Props)**********************************/

/**
 * SharedProps are a set of commonly used properties that can be applied to various components across your application.
 * These props provide a consistent interface for frequently recurring attributes, enhancing reusability and maintainability.
 * Use this interface to extend a component's props when you find yourself repeatedly defining the same properties.
 *
 * @interface SharedProps
 * @property {React.ReactNode} [children] - Child elements to render within the component.
 * @property {HTMLAttributes<HTMLDivElement>["className"]} [className] - CSS class name(s) for the component.
 * @property {boolean} [asChild] - If true, renders the component as its child element.
 * @property {boolean} [disabled] - If true, sets the component to a disabled state.
 *
 * @example
 * ```tsx
 * interface MyComponentProps extends SharedProps {
 *   // Additional component-specific props can be defined here
 * }
 *
 * function MyComponent({ children, className, asChild, disabled }: MyComponentProps) {
 *   // Component implementation
 * }
 * ```
 */
export interface SharedProps {
  children?: React.ReactNode;
  className?: HTMLAttributes<HTMLDivElement>["className"];
  asChild?: boolean;
  disabled?: boolean;
}

/**********************************(Theme Props)**********************************/

/**
 * ThemeProps defines the overall theme configuration for your application.
 * It includes various aspects of theming such as variant, format, mode, cursor, radius, and typography.
 *
 * @interface ThemeProps
 * @property {ThemeVariantProps} variant - The visual variant of the theme (e.g., flat, neutral).
 * @property {ThemeFormatProps} format - The color format and accent of the theme.
 * @property {ThemeModeProps} mode - The color mode of the theme (light, dark, or auto).
 * @property {ThemeCursorProps} cursor - The cursor style for the theme.
 * @property {ThemeRadiusProps} radius - The border radius scale for the theme.
 * @property {TypographyProps} [typography] - Optional typography configuration.
 *
 * @example
 * ```tsx
 * const theme: ThemeProps = {
 *   variant: "soft",
 *   format: { name: "lavender" },
 *   mode: "light",
 *   cursor: "pointer",
 *   radius: "md",
 * };
 * ```
 */
// export interface ThemeProps {
//   variant: ThemeVariantProps;
//   format: ThemeFormatProps;
//   mode: ThemeModeProps;
//   cursor: ThemeCursorProps;
//   radius: ThemeRadiusProps;
//   typography?: TypographyProps;
// }

/**
 * ThemeSizeScaleProps represents a scale of sizes used throughout the theme.
 * This type is used for various size-related properties like spacing and radius.
 *
 * @type {string}
 */
export type ThemeSizeScaleProps =
  | "base"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "full";

export type ThemeRadiusProps = ThemeSizeScaleProps;

export type ThemeSpacingProps = ThemeSizeScaleProps;

/**
 * ThemeCursorProps defines the available cursor styles for the theme.
 * It includes a wide range of cursor options to enhance user interaction.
 *
 * @type {string}
 */
export type ThemeCursorProps =
  | "auto"
  | "base"
  | "select"
  | "Orbit"
  | "pointer"
  | "pan"
  | "panning"
  | "loading"
  | "Help"
  | "disabled"
  | "text-x"
  | "text-y"
  | "cross"
  | "Zoom-In"
  | "zoom-out"
  | "copy"
  | "move"
  | "resize-y"
  | "resize-x"
  | "resize-t"
  | "resize-r"
  | "resize-b"
  | "resize-l"
  | "resize-tlbr"
  | "resize-trbl"
  | "resize-tl"
  | "resize-tr"
  | "resize-bl"
  | "resize-br";

/**
 * ThemeVariantProps defines the visual variants available for the theme.
 *
 * @type {string}
 */
export type ThemeVariantProps = "flat" | "neutral" | "brutal" | "soft";

/**
 * ThemeModeProps defines the color modes available for the theme.
 *
 * @type {string}
 */
export type ThemeModeProps = "light" | "dark" | "auto";

/**
 * ThemeFormatNameProps defines the available color accent themes.
 * It includes a wide variety of themes to suit different design needs.
 *
 * @type {string}
 */
export type ThemeFormatNameProps =
  | "default" // will use the theme color accent of the website/app
  | "lavender"
  | "blossom"
  | "sky"
  | "sunset"
  | "forest"
  | "ocean"
  | "midnight"
  | "autumn"
  | "polar"
  | "mocha"
  | "neon"
  | "pastel"
  | "monochrome"
  | "metropolis"
  | "cyberpunk"
  | "earth"
  | "retro"
  | "noire"
  | "tropical"
  | "nordic"
  | "steampunk"
  | "breeze"
  | "emerald"
  | "dusk"
  | "amethyst"
  | "cherry"
  | "rustic"
  | "arctic"
  | "expresso"
  | "sherbet"
  | "mamal"
  | "cyberpunk"
  | "terra"
  | "vintage"
  | "noir"
  | "island"
  | "fjord"
  | "brass"
  | "unoclub"
  | "duoclub"
  | "tresclub"
  | "zinc";

/**
 * ThemeFormatProps defines the structure for theme color formats.
 * It includes the theme name and optional color configurations for light and dark modes.
 *
 * @interface ThemeFormatProps
 * @property {ThemeFormatNameProps} name - The name of the theme format.
 * @property {Object} [light] - Optional color configuration for light mode.
 * @property {Object} [dark] - Optional color configuration for dark mode.
 *
 * @example
 * ```tsx
 * const myThemeFormat: ThemeFormatProps = {
 *   name: "lavender",
 *   light: {
 *     brand: "#8a4baf",
 *     background: "#f8f8f8",
 *     // ... other color properties
 *   },
 *   dark: {
 *     brand: "#b76edf",
 *     background: "#1a1a1a",
 *     // ... other color properties
 *   }
 * };
 * ```
 */
export interface ThemeFormatProps {
  name: ThemeFormatNameProps;
  light?: {
    brand?: string;
    background?: string;
    surface?: string;
    primary?: string;
    secondary?: string;
    muted?: string;
  };
  dark?: {
    brand?: string;
    background?: string;
    surface?: string;
    primary?: string;
    secondary?: string;
    muted?: string;
  };
}

/**********************************(Server Action Props)**********************************/

/**
 * ActionPropsReturnValue is a generic interface for server action return values.
 * It provides a structure for returning data and/or errors from server actions.
 *
 * @interface ActionPropsReturnValue<T>
 * @template T - The type of the data being returned.
 * @property {T} [data] - The data returned from the server action.
 * @property {string | null} [error] - An error message, if any.
 *
 * @example
 * ```ts
 * async function myServerAction(): Promise<ActionPropsReturnValue<User>> {
 *   try {
 *     const user = await fetchUser();
 *     return { data: user };
 *   } catch (error) {
 *     return { error: error.message };
 *   }
 * }
 * ```
 */
export interface ActionPropsReturnValue<T> {
  data?: T;
  error?: string | null;
}

/**
 * ActionProps defines the structure for action properties used in forms or server actions.
 * It includes fields for success messages, errors, data, and blur states.
 *
 * @interface ActionProps
 * @property {string} [success] - A success message.
 * @property {ActionStringMap} [errors] - A map of error messages.
 * @property {any} [data] - Any data associated with the action.
 * @property {ActionStringToBooleanMap} [blurs] - A map of blur states for form fields.
 *
 * @example
 * ```tsx
 * const actionProps: ActionProps = {
 *   success: "Form submitted successfully",
 *   errors: { email: "Invalid email format" },
 *   data: { userId: 123 },
 *   blurs: { email: true, password: false }
 * };
 * ```
 */
export interface ActionProps {
  success?: string;
  errors?: ActionStringMap;
  data?: any;
  blurs?: ActionStringToBooleanMap;
}

export interface ActionStringMap {
  [key: string]: string;
}

export interface ActionStringToBooleanMap {
  [key: string]: boolean;
}

/**
 * OptimisticMessageProp is used for displaying optimistic UI updates.
 * It contains a message to be shown while an action is in progress.
 *
 * @interface OptimisticMessageProp
 * @property {string} message - The message to display.
 *
 * @example
 * ```tsx
 * const optimisticMessage: OptimisticMessageProp = {
 *   message: "Saving changes..."
 * };
 * ```
 */
export interface OptimisticMessageProp {
  message: string;
}

/**********************************(Form Mode Props)**********************************/

/**
 * FormModeProps defines the mode of a form, indicating whether it's for creating or updating data.
 *
 * @interface FormModeProps
 * @property {"CREATE" | "UPDATE"} formMode - The current mode of the form.
 *
 * @example
 * ```tsx
 * function MyForm({ formMode }: FormModeProps) {
 *   return (
 *     <form>
 *       <h2>{formMode === "CREATE" ? "Create New Item" : "Update Item"}</h2>
 *     </form>
 *   );
 * }
 * ```
 */

export interface FormModeProps {
  formMode: "CREATE" | "UPDATE";
}

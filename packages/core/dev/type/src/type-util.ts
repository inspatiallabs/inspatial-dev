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
  openModal: (content: unknown) => void;
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

/**********************************(DOM Attributes)**********************************/
/**
 * Generic type for DOM element attributes
 */
export interface DOMAttributes {
  className?: string;
  [key: string]: any;
}
/**********************************(Shared Props)**********************************/

/**
 * SharedProps are a set of commonly used properties that can be applied to various components across your application.
 * These props provide a consistent interface for frequently recurring attributes, enhancing reusability and maintainability.
 * Use this interface to extend a component's props when you find yourself repeatedly defining the same properties.
 *
 * @interface SharedProps
 * @property {unknown} [children] - Child elements to render within the component.
 * @property {string} [className] - CSS class name(s) for the component.
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
export interface SharedProps extends DOMAttributes {
  children?: unknown; // Ideally framework Node - Note: using unknown keeps the type independent of framework
  asChild?: boolean;
  disabled?: boolean;
  debug?: boolean;
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

/**********************************(Generic Types)**********************************/

/** Read-write accessor. */
//deno-lint-ignore no-explicit-any
export type rw = any;

/** Callback function. */
// deno-lint-ignore ban-types
export type callback = Function;

/** Record. */
export type record<T = unknown> = Record<PropertyKey, T>;

/** Extract value type from Record. */
export type RecordValue<T> = T extends Record<PropertyKey, infer U> ? U : never;

/** Extract key type from {@link https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map | Map}. */
export type MapKey<T> = T extends Map<infer U, unknown> ? U : never;

/** Extract value type from {@link https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map | Map}. */
export type MapValue<T> = T extends Map<unknown, infer U> ? U : never;

/** Extract value type from {@link https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set | Set}. */
export type SetValue<T> = T extends Set<infer U> ? U : never;

/** Extract key type from {@link https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/WeakMap | WeakMap}. */
export type WeakMapKey<T> = T extends WeakMap<infer U, unknown> ? U : never;

/** Extract value type from {@link https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/WeakMap | WeakMap}. */
export type WeakMapValue<T> = T extends WeakMap<WeakKey, infer U> ? U : never;

/** Extract value type from {@link https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/WeakSet | WeakSet}. */
export type WeakSetValue<T> = T extends WeakSet<infer U> ? U : never;

/** Optional type. */
export type Optional<T> = T | undefined;

/** Nullable type. */
export type Nullable<T> = T | null;

/** Promisable type.  */
export type Promisable<T> = T | Promise<T>;

/** Arrayable type. */
export type Arrayable<T> = T | Array<T>;

/** Non `void` type. */
export type NonVoid<T> = T extends void ? never : T;

/** Extract function argument. */
// deno-lint-ignore no-explicit-any
export type Arg<
  T extends (...args: any[]) => any,
  index extends number = 0,
  required extends boolean = false
> = required extends true
  ? NonNullable<Parameters<T>[index]>
  : Parameters<T>[index];

/** Omit first argument from a function. */
// deno-lint-ignore no-explicit-any
export type OmitFirstArg<F> = F extends (
  _0: any,
  ...args: infer T
) => infer ReturnType
  ? (...args: T) => ReturnType
  : never;

/** Deep partial type. */
export type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

/** Deep readonly type. */
export type DeepReadonly<T> = T extends object
  ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
  : T;

/** Deep non nullable type. */
export type DeepNonNullable<T> = {
  [P in keyof T]: T[P] extends object
    ? DeepNonNullable<NonNullable<T[P]>>
    : NonNullable<T[P]>;
};

/** Typed array type. */
export type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array
  | BigInt64Array
  | BigUint64Array;

/** Possible values to `typeof` operator. */
export type TypeOf =
  | "string"
  | "number"
  | "bigint"
  | "boolean"
  | "symbol"
  | "undefined"
  | "object"
  | "function";

/** Check if a type is `any`. */
export type IsAny<T> = boolean extends (T extends never ? true : false)
  ? true
  : false;

/** Check if a type is not `any`. */
export type IsNotAny<T> = IsAny<T> extends true ? false : true;

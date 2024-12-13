/*##############################################(CURRENCY-UTIL)##############################################*/
/*********************************(CURRENCY-TYPES)*********************************/
/**
 * Array of supported currency codes
 * @example
 * const supportedCodes = CURRENCY_CODES; // ["GBP", "USD", "EUR", ...]
 */
export const CURRENCY_CODES = [
  "GBP",
  "USD",
  "EUR",
  "JPY",
  "CNY",
  "INR",
  "AUD",
  "CAD",
  "CHF",
  "HKD",
  "SGD",
  "SEK",
  "KRW",
  "ZAR",
  "BRL",
  "NZD",
  "MXN",
  "AED",
  "THB",
  "TRY",
] as const;

/**
 * Type representing valid currency codes
 * @example
 * const code: CurrencyCode = "USD"; // Valid
 * const invalid: CurrencyCode = "XXX"; // Type error
 */
export type CurrencyCode = (typeof CURRENCY_CODES)[number];

/**
 * Interface representing currency information
 * @property {CurrencyCode} code - The ISO currency code
 * @property {string} symbol - The currency symbol
 * @property {string} name - The full name of the currency
 * @example
 * const usdInfo: CurrencyInfo = {
 *   code: "USD",
 *   symbol: "$",
 *   name: "United States Dollar"
 * };
 */
export type CurrencyInfo = {
  code: CurrencyCode;
  symbol: string;
  name: string;
};
/*##############################################(CURRENCY-LIST)##############################################*/

/**
 * Array of currency information objects for all supported currencies
 * @example
 * const usdCurrency = currencies.find(c => c.code === "USD");
 * console.log(usdCurrency); // { code: "USD", symbol: "$", name: "United States Dollar" }
 */
export const currencies: CurrencyInfo[] = [
  { code: "GBP", symbol: "£", name: "British Pound Sterling" },
  { code: "USD", symbol: "$", name: "United States Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona" },
  { code: "KRW", symbol: "₩", name: "South Korean Won" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
  { code: "MXN", symbol: "$", name: "Mexican Peso" },
  { code: "AED", symbol: "د.إ", name: "United Arab Emirates Dirham" },
  { code: "THB", symbol: "฿", name: "Thai Baht" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira" },
];

/*********************************(CONSTANTS)*********************************/

/**
 * Maximum allowed currency value (999 trillion)
 * @example
 * const isValid = value <= MAX_CURRENCY_VALUE;
 */
export const MAX_CURRENCY_VALUE = 999_999_999_999_999; // 999 trillion

/**
 * Maximum length of currency value as string
 * @example
 * const isValidLength = value.length <= MAX_CURRENCY_LENGTH;
 */
export const MAX_CURRENCY_LENGTH: number = MAX_CURRENCY_VALUE.toString().length;

/*********************************(VALUE-VALIDATION)*********************************/

/**
 * Validates if a string represents a valid currency value
 * @param {string} value - The string value to validate
 * @returns {boolean} True if the value is valid, false otherwise
 * @example
 * isValidCurrencyValue("1000.50"); // true
 * isValidCurrencyValue("1000000000000000"); // false (exceeds max)
 * isValidCurrencyValue("-100"); // false (negative)
 */
export function isValidCurrencyValue(value: string): boolean {
  const numericValue = parseCurrencyValue(value);
  return numericValue <= MAX_CURRENCY_VALUE && numericValue >= 0;
}

/*********************************(GET-CURRENCY)*********************************/

/**
 * Retrieves currency information for a given currency code
 * @param {CurrencyCode} code - The currency code to look up
 * @returns {CurrencyInfo | undefined} The currency information or undefined if not found
 * @example
 * const usd = getCurrency("USD");
 * // Returns: { code: "USD", symbol: "$", name: "United States Dollar" }
 *
 * const invalid = getCurrency("XXX");
 * // Returns: undefined
 */

export function getCurrency(code: CurrencyCode): CurrencyInfo | undefined {
  return currencies.find((currency) => currency.code === code);
}

/*********************************(FORMAT-CURRENCY-INPUT)*********************************/

/**
 * Formats a string value as currency input with appropriate symbol
 * @param {string} value - The value to format
 * @param {CurrencyCode} currencyCode - The currency code to use (defaults to "GBP")
 * @returns {string} The formatted currency string
 * @example
 * formatCurrencyInput("1000", "USD"); // "$1000"
 * formatCurrencyInput("1000.5", "GBP"); // "£1000.5"
 * formatCurrencyInput("", "EUR"); // ""
 * formatCurrencyInput("1000000000000000", "USD"); // Returns previous valid value
 */
export function formatCurrencyInput(
  value: string,
  currencyCode: CurrencyCode = "GBP"
): string {
  const currency = getCurrency(currencyCode);
  if (!currency) return value;

  // Remove any existing currency symbols and non-digit characters except decimal
  const cleanValue = value.replace(
    new RegExp(`[^\\d.${currency.symbol}]`, "g"),
    ""
  );

  // If the cleaned value would exceed our maximum, return the previous valid value
  if (!isValidCurrencyValue(cleanValue)) {
    return value;
  }

  // Handle decimal places
  const parts = cleanValue.split(".");
  if (parts[0].length > MAX_CURRENCY_LENGTH) {
    parts[0] = parts[0].slice(0, MAX_CURRENCY_LENGTH);
  }
  if (parts[1]) {
    parts[1] = parts[1].slice(0, 2);
  }
  const formattedValue = parts.join(".");

  // If value already starts with the currency symbol, return as is
  if (formattedValue.startsWith(currency.symbol)) return formattedValue;

  // Add currency symbol if not empty
  return formattedValue ? `${currency.symbol}${formattedValue}` : "";
}

/*********************************(PARSE-CURRENCY-VALUE)*********************************/
/**
 * Converts a currency string to a numeric value
 * @param {string} value - The currency string to parse
 * @returns {number} The numeric value
 * @example
 * parseCurrencyValue("£1,000.50"); // 1000.50
 * parseCurrencyValue("$1,234.56"); // 1234.56
 * parseCurrencyValue("invalid"); // 0
 */
export function parseCurrencyValue(value: string): number {
  // Remove all non-digit characters except decimal point
  const numericValue = value.replace(/[^\d.]/g, "");
  return parseFloat(numericValue) || 0;
}

/********************************(FORMAT-CURRENCY-DISPLAY)*********************************/

/**
 * Formats a number or string as a localized currency display value
 * @param {string | number} value - The value to format
 * @param {CurrencyCode} currencyCode - The currency code to use (defaults to "GBP")
 * @returns {string} The formatted currency string
 * @example
 * formatCurrencyDisplay(1000.50, "USD"); // "$1,000.50"
 * formatCurrencyDisplay("1234.56", "GBP"); // "£1,234.56"
 * formatCurrencyDisplay(1000000000000000, "EUR"); // "Value exceeds maximum allowed..."
 */
export function formatCurrencyDisplay(
  value: string | number,
  currencyCode: CurrencyCode = "GBP"
): string {
  const currency = getCurrency(currencyCode);
  if (!currency) return value.toString();

  const numericValue =
    typeof value === "string" ? parseCurrencyValue(value) : value;

  // Return error string if value exceeds maximum
  if (numericValue > MAX_CURRENCY_VALUE) {
    return `Value exceeds maximum allowed (${MAX_CURRENCY_VALUE.toLocaleString()})`;
  }

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
}

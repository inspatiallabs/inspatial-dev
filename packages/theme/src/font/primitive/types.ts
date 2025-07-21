//##############################################(TYPES)##############################################//
/*
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                             Primitive Font Types                           ║
 * ╟────────────────────────────────────────────────────────────────────────────╢
 * ║                                                                            ║
 * ║ This type represents the primitive font types available on Inspatial       ║
 * ║ InSpatial Themes comes bundled with 70+ primitive premium fonts.           ║
 * ║                                                                            ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */
export type PrimitiveFontTypes =
  | "actual"
  | "aeion"
  | "aerospace"
  | "along"
  | "alternox"
  | "amithen"
  | "ankle"
  | "anything"
  | "aperture"
  | "aqum"
  | "attack"
  | "bernados"
  | "bertha"
  | "bionix"
  | "brawls"
  | "brighton"
  | "broad"
  | "candace"
  | "carolin"
  | "congenial"
  | "dakar"
  | "denson"
  | "dumeh"
  | "editors-note"
  | "elsone"
  | "engine"
  | "enrique"
  | "euclid-circular"
  | "folker"
  | "fonzy"
  | "foregen"
  | "gaoel"
  | "goodly"
  | "hadeed"
  | "heather"
  | "inder"
  | "inter"
  | "jls"
  | "kimura"
  | "lato"
  | "logotype"
  | "lovelo"
  | "micro"
  | "moisses"
  | "monica"
  | "montserrat"
  | "morality"
  | "nafasyah"
  | "nanotech"
  | "naon"
  | "notche"
  | "numaposa"
  | "oklean"
  | "parizaad"
  | "polaris"
  | "polly"
  | "poppins"
  | "qualux"
  | "queen-rogette"
  | "quora"
  | "ransom"
  | "remura"
  | "rockley"
  | "ronald"
  | "rubik"
  | "safari"
  | "sheylla"
  | "slamdunk"
  | "sweetsnow"
  | "stampbor"
  | "trebuchet"
  | "viora"
  | "zebrawood";

export type StyleSheetVariable = `--${string}`;

export type Display = "auto" | "block" | "swap" | "fallback" | "optional";

export type InSpatialFontProp = {
  variable?: string;
  className: string;
  style:
    | string[]
    | { fontFamily: string; fontWeight?: number; fontStyle?: string };
};

export type PrimitiveTypefaceProp<
  T extends StyleSheetVariable | undefined = undefined
> = {
  /**
   * The font file source. Can be either:
   * - A single string path to the font file
   * - An array of font files with their properties
   */
  src:
    | string
    | Array<{
        path: string;
        weight?: string;
        style?: string;
      }>;

  /** How the font should load: 'auto', 'block', 'swap', 'fallback', or 'optional' */
  display?: Display;

  /** The thickness of the font (e.g., '400', '700') */
  weight?: string;

  /** The style of the font (e.g., 'normal', 'bold') */
  style?: string;

  /** Backup fonts to use if the main font fails to load */
  fallback?: string[];

  /** Whether to load the font before the page renders */
  preload?: boolean;

  /** CSS variable name to reference this font */
  variable?: T;

  /** Additional CSS properties to apply to this font */
  declarations?: Array<{ prop: string; value: string }>;
};

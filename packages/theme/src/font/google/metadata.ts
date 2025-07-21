import fontMap from "./font-map.json" with { type: "json" };

type GoogleFontsMetadata = {
  [fontFamily: string]: {
    weights: string[];
    styles: string[];
    subsets: string[];
    axes?: Array<{
      tag: string;
      min: number;
      max: number;
      defaultValue: number;
    }>;
  };
};

export const googleFontsMetadata: GoogleFontsMetadata = fontMap;

/*##############################################(IMPORTS)##############################################*/
import {
  StyleSheetVariable,
  InSpatialFontProp,
  PrimitiveTypefaceProp,
} from "./types.ts";

/*##############################################(RENDER)##############################################*/

export default function primitiveFont<
  T extends StyleSheetVariable | undefined = undefined,
>(
  _options: PrimitiveTypefaceProp<T>
): T extends undefined ? InSpatialFontProp : InSpatialFontProp {
  throw new Error("Function not implemented.");
}

//##############################################(PRIMITIVE FONTS)##############################################//
// Actual Font
export const actual = primitiveFont({
  src: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/actual/actual.otf",
  variable: "--font-actual",
  display: "auto",
  preload: true,
  fallback: ["system-ui"],
});

// Alternox Font
export const alternox = primitiveFont({
  src: [
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/alternox/alternox-extralight.otf",
      weight: "200",
      style: "extralight",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/alternox/alternox-light.otf",
      weight: "300",
      style: "light",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/alternox/alternox-regular.otf",
      weight: "400",
      style: "regular",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/alternox/alternox-semibold.otf",
      weight: "600",
      style: "semibold",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/alternox/alternox-bold.otf",
      weight: "700",
      style: "bold",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/alternox/alternox-extrabold.otf",
      weight: "900",
      style: "extrabold",
    },
  ],
  variable: "--font-alternox",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Amithen Font
export const amithen = primitiveFont({
  src: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/amithen/amithen.otf",
  variable: "--font-amithen",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Aeion Font
export const aeion = primitiveFont({
  src: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/aeion/aeion-regular.otf",
  variable: "--font-aeion",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Aerospace Font
export const aerospace = primitiveFont({
  src: [
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/aerospace/aerospace.otf",
      weight: "400",
      style: "regular",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/aerospace/aerospace-outline.otf",
      weight: "400",
      style: "outline",
    },
  ],
  variable: "--font-aerospace",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Along Font
export const along = primitiveFont({
  src: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/along/along-regular.otf",
  variable: "--font-along",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Ankle Font
export const ankle = primitiveFont({
  src: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/ankle/ankle.otf",
  variable: "--font-ankle",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Anything Font
export const anything = primitiveFont({
  src: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/anything/anything-bold.otf",
  variable: "--font-anything",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Aperture Font
export const aperture = primitiveFont({
  src: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/aperture/aperture.otf",
  variable: "--font-aperture",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Aqum Font
export const aqum = primitiveFont({
  src: [
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/aqum/aqum-classic.otf",
      weight: "400",
      style: "classic",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/aqum/aqum-bold.otf",
      weight: "700",
      style: "bold",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/aqum/aqum-curl.otf",
      weight: "400",
      style: "curl",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/aqum/aqum-small-caps.otf",
      weight: "400",
      style: "small-caps",
    },
  ],
  variable: "--font-aqum",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Attack Font
export const attack = primitiveFont({
  src: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/attack/attack-regular.otf",
  variable: "--font-attack",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Bernados Font
export const bernados = primitiveFont({
  src: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/bernados/bernados-regular.otf",
  variable: "--font-bernados",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Bertha Font
export const bertha = primitiveFont({
  src: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/bertha/bertha.otf",
  variable: "--font-bertha",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Bionix Font
export const bionix = primitiveFont({
  src: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/bionix/bionix.otf",
  variable: "--font-bionix",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Brawls Font
export const brawls = primitiveFont({
  src: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/brawls/brawls.otf",
  variable: "--font-brawls",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Brighton Font
export const brighton = primitiveFont({
  src: [
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/brighton/brighton.otf",
      weight: "400",
      style: "regular",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/brighton/brighton-italic.otf",
      weight: "400",
      style: "italic",
    },
  ],
  preload: false,
  fallback: ["system-ui"],
});

// // Broad Font
export const broad = primitiveFont({
  src: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/broad/broad.otf",
  variable: "--font-broad",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Candace Font
export const candace = primitiveFont({
  src: [
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/candace/candace-regular.otf",
      weight: "400",
      style: "regular",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/candace/candace-outline.otf",
      weight: "400",
      style: "outline",
    },
  ],
  variable: "--font-candace",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Carolin Font
export const carolin = primitiveFont({
  src: [
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/carolin/carolin-regular.otf",
      weight: "400",
      style: "regular",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/carolin/carolin-outline.otf",
      weight: "400",
      style: "outline",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/carolin/carolin-light.otf",
      weight: "300",
      style: "light",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/carolin/carolin-thin.otf",
      weight: "100",
      style: "thin",
    },
  ],
  variable: "--font-carolin",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Congenial Font
export const congenial = primitiveFont({
  src: [
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/congenial/congenial-light.otf",
      weight: "300",
      style: "light",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/congenial/congenial-regular.otf",
      weight: "400",
      style: "regular",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/congenial/congenial-bold.otf",
      weight: "700",
      style: "bold",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/congenial/congenial-black.otf",
      weight: "900",
      style: "black",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/congenial/congenial-heavy.otf",
      weight: "900",
      style: "heavy",
    },
  ],
  variable: "--font-congenial",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Dakar Font
export const dakar = primitiveFont({
  src: [
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/dakar/dakar.otf",
      weight: "400",
      style: "regular",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/dakar/dakar-halftone.otf",
      weight: "400",
      style: "halftone",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/dakar/dakar-italic.otf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-dakar",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Denson Font
export const denson = primitiveFont({
  src: [
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/denson/denson-round.otf",
      weight: "400",
      style: "regular",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/denson/denson-light-round.otf",
      weight: "300",
      style: "light",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/denson/denson-bold-round.otf",
      weight: "700",
      style: "bold",
    },
  ],
  variable: "--font-denson",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Dumeh Font
export const dumeh = primitiveFont({
  src: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/dumeh/dumeh.otf",
  variable: "--font-dumeh",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Elsone Font
export const elsone = primitiveFont({
  src: [
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/elsone/elsone-regular.otf",
      weight: "400",
      style: "regular",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/elsone/elsone-italic.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/elsone/elsone-outline.otf",
      weight: "400",
      style: "regular",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/elsone/elsone-outline-italic.otf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-elsone",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Engine Font
export const engine = primitiveFont({
  src: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/engine/engine.otf",
  variable: "--font-engine",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Enrique Font
export const enrique = primitiveFont({
  src: [
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/enrique/enrique.otf",
      weight: "400",
      style: "regular",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/enrique/enrique-bold.otf",
      weight: "700",
      style: "bold",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/enrique/enrique-light.otf",
      weight: "300",
      style: "light",
    },
  ],
  variable: "--font-enrique",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Folker Font
export const folker = primitiveFont({
  src: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/folker/folker.otf",
  variable: "--font-folker",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Fonzy Font
export const fonzy = primitiveFont({
  src: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/fonzy/fonzy-regular.otf",
  variable: "--font-fonzy",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Foregen Font
export const foregen = primitiveFont({
  src: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/foregen/foregen-regular.otf",
  variable: "--font-foregen",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Gaoel Font
export const gaoel = primitiveFont({
  src: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/gaoel/gaoel.otf",
  variable: "--font-gaoel",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Goodly Font
export const goodly = primitiveFont({
  src: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/goodly/goodly-regular.otf",
  variable: "--font-goodly",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Hadeed Font
export const hadeed = primitiveFont({
  src: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/hadeed/hadeed-regular.otf",
  variable: "--font-hadeed",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Heather Font
export const heather = primitiveFont({
  src: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/heather/heather.otf",
  variable: "--font-heather",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// JLS Space GothicR
export const jls = primitiveFont({
  src: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/jls/JLSSpaceGothicR.otf",
  variable: "--font-jls",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Inder Font
export const inder = primitiveFont({
  src: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/inder/inder.ttf",
  variable: "--font-inder",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Inter Font
export const inter = primitiveFont({
  src: [
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/inter/inter.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/inter/inter-italic.ttf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-inter",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Kimura Font
export const kimura = primitiveFont({
  src: [
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/kimura/kimura-outline.otf",
      weight: "400",
      style: "regular",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/kimura/kimura-bold.otf",
      weight: "700",
      style: "bold",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/kimura/kimura-ultrabold.otf",
      weight: "900",
      style: "ultrabold",
    },
  ],
  variable: "--font-kimura",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Lato Font
export const lato = primitiveFont({
  src: [
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/lato/lato-thin.ttf",
      weight: "100",
      style: "normal",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/lato/lato-regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/lato/lato-light.ttf",
      weight: "300",
      style: "light",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/lato/lato-bold.ttf",
      weight: "700",
      style: "bold",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/lato/lato-black.ttf",
      weight: "900",
      style: "black",
    },
  ],
  variable: "--font-lato",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Logotype Font
export const logotype = primitiveFont({
  src: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/logotype/logotype.otf",
  variable: "--font-logotype",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Lovelo BLACK
export const lovelo = primitiveFont({
  src: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/lovelo/lovelo.otf",
  variable: "--font-lovelo",
  display: "auto",
  style: "normal",
  preload: true,
  fallback: ["system-ui"],
});

// Micro Font
export const micro = primitiveFont({
  src: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/micro/micro.otf",
  variable: "--font-micro",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Moisses Font
export const moisses = primitiveFont({
  src: [
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/moisses/moisses.otf",
      weight: "400",
      style: "regular",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/moisses/moisses-bold.otf",
      weight: "700",
      style: "bold",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/moisses/moisses-light.otf",
      weight: "300",
      style: "light",
    },
  ],
  variable: "--font-moisses",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Monica Font
export const monica = primitiveFont({
  src: [
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/monica/monica.otf",
      weight: "400",
      style: "regular",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/monica/monica-abstract.otf",
      weight: "400",
      style: "abstract",
    },
  ],
  variable: "--font-monica",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Montserrat
export const montserrat = primitiveFont({
  src: [
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/montserrat/montserrat-thin.ttf",
      weight: "100",
      style: "normal",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/montserrat/montserrat-extralight.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/montserrat/montserrat-light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/montserrat/montserrat-regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/montserrat/montserrat-medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/montserrat/montserrat-semibold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/montserrat/montserrat-bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/montserrat/montserrat-black.ttf",
      weight: "900",
      style: "normal",
    },
  ],
});

// Morality Font
export const morality = primitiveFont({
  src: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/morality/morality.otf",
  variable: "--font-morality",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Nafasyah Font
export const nafasyah = primitiveFont({
  src: [
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/nafasyah/nafasyah.otf",
      weight: "400",
      style: "regular",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/nafasyah/nafasyah-extra.otf",
      weight: "700",
      style: "bold",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/nafasyah/nafasyah-brushed.otf",
      weight: "400",
      style: "regular",
    },
  ],
  variable: "--font-nafasyah",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Nanotech Font
export const nanotech = primitiveFont({
  src: [
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/nanotech/nanotech-regular.otf",
      weight: "400",
      style: "regular",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/nanotech/nanotech-regular-italic.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/nanotech/nanotech-bold.otf",
      weight: "700",
      style: "bold",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/nanotech/nanotech-bold-italic.otf",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-nanotech",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// // Naon Font
export const naon = primitiveFont({
  src: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/naon/naon.otf",
  variable: "--font-naon",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Notche Font
export const notche = primitiveFont({
  src: [
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/notche/notche.otf",
      weight: "400",
      style: "regular",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/notche/notche-medium.otf",
      weight: "500",
      style: "medium",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/notche/notche-bold.otf",
      weight: "700",
      style: "bold",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/notche/notche-black.otf",
      weight: "900",
      style: "bold",
    },
  ],
  variable: "--font-notche",
  display: "auto",
  preload: false,
});

// Numaposa Font
export const numaposa = primitiveFont({
  src: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/numaposa/numaposa.otf",
  variable: "--font-numaposa",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Oklean Font
export const oklean = primitiveFont({
  src: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/oklean/oklean.otf",
  variable: "--font-oklean",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Parizaad Font
export const parizaad = primitiveFont({
  src: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/parizaad/parizaad-regular.otf",
  variable: "--font-parizaad",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Polaris Font
export const polaris = primitiveFont({
  src: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/polaris/polaris.otf",
  variable: "--font-polaris",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Polly Font
export const polly = primitiveFont({
  src: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/polly/polly-rounded-regular.otf",
  variable: "--font-polly",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Poppins
export const poppins = primitiveFont({
  src: [
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/poppins/poppins-bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/poppins/poppins-regular.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-poppins",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Qualux Font
export const qualux = primitiveFont({
  src: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/qualux/qualux-regular.otf",
  variable: "--font-qualux",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Queen Rogette Font
export const queenRogette = primitiveFont({
  src: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/queen-rogette/queen-rogette.otf",
  variable: "--font-queen-rogette",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Quora Font
export const quora = primitiveFont({
  src: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/quora/quora-regular.otf",
  variable: "--font-quora",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Raleway Font
export const raleway = primitiveFont({
  src: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/raleway/raleway.ttf",
  variable: "--font-raleway",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Ransom Font
export const ransom = primitiveFont({
  src: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/ransom/ransom.otf",
  variable: "--font-ransom",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Remura Font
export const remura = primitiveFont({
  src: [
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/remura/remura-outline.otf",
      weight: "400",
      style: "regular",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/remura/remura-bold.otf",
      weight: "700",
      style: "bold",
    },
  ],
  variable: "--font-remura",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Rockley Font
export const rockley = primitiveFont({
  src: [
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/rockley/rockley-light.otf",
      weight: "300",
      style: "light",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/rockley/rockley-regular.otf",
      weight: "400",
      style: "regular",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/rockley/rockley-outline.otf",
      weight: "400",
      style: "regular",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/rockley/rockley-bold.otf",
      weight: "700",
      style: "bold",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/rockley/rockley-black.otf",
      weight: "900",
      style: "bold",
    },
  ],
  variable: "--font-rockley",
  display: "auto",
  preload: false,
});

// // Ronald Font
export const ronald = primitiveFont({
  src: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/ronald/ronald.otf",
  variable: "--font-ronald",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Rubik Font
export const rubik = primitiveFont({
  src: [
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/rubik/rubik-light.ttf",
      weight: "300",
      style: "light",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/rubik/rubik-regular.ttf",
      weight: "400",
      style: "regular",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/rubik/rubik-medium.ttf",
      weight: "500",
      style: "medium",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/rubik/rubik-bold.ttf",
      weight: "700",
      style: "bold",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/rubik/rubik-black.ttf",
      weight: "900",
      style: "bold",
    },
  ],
  variable: "--font-rubik",
  display: "auto",
  preload: false,
});

// Safari Font
export const safari = primitiveFont({
  src: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/safari/safari.otf",
  variable: "--font-safari",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// // Sheylla Font
export const sheylla = primitiveFont({
  src: [
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/sheylla/sheylla-thin.otf",
      weight: "100",
      style: "thin",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/sheylla/sheylla-light.otf",
      weight: "300",
      style: "light",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/sheylla/sheylla-regular.otf",
      weight: "400",
      style: "regular",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/sheylla/sheylla-bold.otf",
      weight: "700",
      style: "bold",
    },
  ],
  variable: "--font-sheylla",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Slam Dunk Font
export const slamDunk = primitiveFont({
  src: [
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/slamdunk/slamdunk.otf",
      weight: "400",
      style: "regular",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/slamdunk/slamdunk-inline.otf",
      weight: "400",
      style: "regular",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/slamdunk/slamdunk-outline.otf",
      weight: "400",
      style: "regular",
    },
  ],
  variable: "--font-slamdunk",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Sweet Snow Font
export const sweetSnow = primitiveFont({
  src: [
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/sweetsnow/sweetsnow-light.otf",
      weight: "300",
      style: "light",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/sweetsnow/sweetsnow.otf",
      weight: "400",
      style: "regular",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/sweetsnow/sweetsnow-inline.otf",
      weight: "400",
      style: "regular",
    },
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/sweetsnow/sweetsnow-bold.otf",
      weight: "700",
      style: "bold",
    },
  ],
  variable: "--font-sweetsnow",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Stampbor Font
export const stampbor = primitiveFont({
  src: [
    {
      path: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/stampbor/stampbor-clean.otf",
      weight: "400",
      style: "regular",
    },
  ],
  variable: "--font-stampbor",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Trebuchet MS
export const trebuchet = primitiveFont({
  src: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/trebuchet/trebuchet.ttf",
  variable: "--font-trebuchet",
  preload: true,
  fallback: ["system-ui"],
});

// Viora Font
export const viora = primitiveFont({
  src: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/viora/viora.otf",
  variable: "--font-viora",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

// Zebrawood Font
export const zebrawood = primitiveFont({
  src: "https://inspatial-storage.s3.eu-west-2.amazonaws.com/fonts/zebrawood/zebrawood.otf",
  variable: "--font-zebrawood",
  display: "auto",
  preload: false,
  fallback: ["system-ui"],
});

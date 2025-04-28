import * as family from "./main.ts";

//##############################################(PRIMITIVE FONTS CONSTANTS)##############################################//
export const PrimitiveFontProps = [
  {
    name: "Actual",
    font: family.actual,
    variable: "--font-actual",
  },
  {
    name: "Aeion",
    font: family.aeion,
    variable: "--font-aeion",
  },
  {
    name: "Aerospace",
    font: family.aerospace,
    variable: "--font-aerospace",
  },
  {
    name: "Along",
    font: family.along,
    variable: "--font-along",
  },
  {
    name: "Alternox",
    font: family.alternox,
    variable: "--font-alternox",
  },
  {
    name: "Amithen",
    font: family.amithen,
    variable: "--font-amithen",
  },
  {
    name: "Ankle",
    font: family.ankle,
    variable: "--font-ankle",
  },
  {
    name: "Anything",
    font: family.anything,
    variable: "--font-anything",
  },
  {
    name: "Aperture",
    font: family.aperture,
    variable: "--font-aperture",
  },
  {
    name: "Aqum",
    font: family.aqum,
    variable: "--font-aqum",
  },
  {
    name: "Attack",
    font: family.attack,
    variable: "--font-attack",
  },
  {
    name: "Bernados",
    font: family.bernados,
    variable: "--font-bernados",
  },
  {
    name: "Bertha",
    font: family.bertha,
    variable: "--font-bertha",
  },
  {
    name: "Bionix",
    font: family.bionix,
    variable: "--font-bionix",
  },
  {
    name: "Brawls",
    font: family.brawls,
    variable: "--font-brawls",
  },
  {
    name: "Brighton",
    font: family.brighton,
    variable: "--font-brighton",
  },
  {
    name: "Broad",
    font: family.broad,
    variable: "--font-broad",
  },
  {
    name: "Candace",
    font: family.candace,
    variable: "--font-candace",
  },
  {
    name: "Carolin",
    font: family.carolin,
    variable: "--font-carolin",
  },
  {
    name: "Congenial",
    font: family.congenial,
    variable: "--font-congenial",
  },
  {
    name: "Dakar",
    font: family.dakar,
    variable: "--font-dakar",
  },
  {
    name: "Denson",
    font: family.denson,
    variable: "--font-denson",
  },
  {
    name: "Dumeh",
    font: family.dumeh,
    variable: "--font-dumeh",
  },
  {
    name: "Editors Note",
    font: family.editorsNote,
    variable: "--font-editorsNote",
  },
  {
    name: "Elsone",
    font: family.elsone,
    variable: "--font-elsone",
  },
  {
    name: "Engine",
    font: family.engine,
    variable: "--font-engine",
  },
  {
    name: "Enrique",
    font: family.enrique,
    variable: "--font-enrique",
  },
  {
    name: "Euclid Circular",
    font: family.euclidCircular,
    variable: "--font-euclidCircular",
  },
  {
    name: "Folker",
    font: family.folker,
    variable: "--font-folker",
  },
  {
    name: "Fonzy",
    font: family.fonzy,
    variable: "--font-fonzy",
  },
  {
    name: "Foregen",
    font: family.foregen,
    variable: "--font-foregen",
  },
  {
    name: "Gaoel",
    font: family.gaoel,
    variable: "--font-gaoel",
  },
  {
    name: "Hadeed",
    font: family.hadeed,
    variable: "--font-hadeed",
  },
  {
    name: "Goodly",
    font: family.goodly,
    variable: "--font-goodly",
  },
  {
    name: "Heather",
    font: family.heather,
    variable: "--font-heather",
  },
  {
    name: "Inder",
    font: family.inder,
    variable: "--font-inder",
  },
  {
    name: "Inter",
    font: family.inter,
    variable: "--font-inter",
  },
  {
    name: "JLS",
    font: family.jls,
    variable: "--font-jls",
  },
  {
    name: "Kimura",
    font: family.kimura,
    variable: "--font-kimura",
  },
  {
    name: "Lato",
    font: family.lato,
    variable: "--font-lato",
  },
  {
    name: "Logotype",
    font: family.logotype,
    variable: "--font-logotype",
  },
  {
    name: "Lovelo",
    font: family.lovelo,
    variable: "--font-lovelo",
  },
  {
    name: "Micro",
    font: family.micro,
    variable: "--font-micro",
  },
  {
    name: "Moisses",
    font: family.moisses,
    variable: "--font-moisses",
  },
  {
    name: "Monica",
    font: family.monica,
    variable: "--font-monica",
  },
  {
    name: "Montserrat",
    font: family.montserrat,
    variable: "--font-montserrat",
  },
  {
    name: "Morality",
    font: family.morality,
    variable: "--font-morality",
  },
  {
    name: "Nafasyah",
    font: family.nafasyah,
    variable: "--font-nafasyah",
  },
  {
    name: "Nanotech",
    font: family.nanotech,
    variable: "--font-nanotech",
  },
  {
    name: "Naon",
    font: family.naon,
    variable: "--font-naon",
  },
  {
    name: "Notche",
    font: family.notche,
    variable: "--font-notche",
  },
  {
    name: "Numaposa",
    font: family.numaposa,
    variable: "--font-numaposa",
  },
  {
    name: "Oklean",
    font: family.oklean,
    variable: "--font-oklean",
  },
  {
    name: "Parizaad",
    font: family.parizaad,
    variable: "--font-parizaad",
  },
  {
    name: "Polaris",
    font: family.polaris,
    variable: "--font-polaris",
  },
  {
    name: "Polly",
    font: family.polly,
    variable: "--font-polly",
  },
  {
    name: "Poppins",
    font: family.poppins,
    variable: "--font-poppins",
  },
  {
    name: "Qualux",
    font: family.qualux,
    variable: "--font-qualux",
  },
  {
    name: "Queen Rogette",
    font: family.queenRogette,
    variable: "--font-queenRogette",
  },
  {
    name: "Quora",
    font: family.quora,
    variable: "--font-quora",
  },
  {
    name: "Raleway",
    font: family.raleway,
    variable: "--font-raleway",
  },
  {
    name: "Ransom",
    font: family.ransom,
    variable: "--font-ransom",
  },
  {
    name: "Remura",
    font: family.remura,
    variable: "--font-remura",
  },
  {
    name: "Rockley",
    font: family.rockley,
    variable: "--font-rockley",
  },
  {
    name: "Ronald",
    font: family.ronald,
    variable: "--font-ronald",
  },
  {
    name: "Rubik",
    font: family.rubik,
    variable: "--font-rubik",
  },
  {
    name: "Safari",
    font: family.safari,
    variable: "--font-safari",
  },
  {
    name: "Sheylla",
    font: family.sheylla,
    variable: "--font-sheylla",
  },
  {
    name: "Slam Dunk",
    font: family.slamDunk,
    variable: "--font-slamDunk",
  },
  {
    name: "Sweet Snow",
    font: family.sweetSnow,
    variable: "--font-sweetSnow",
  },
  {
    name: "Stampbor",
    font: family.stampbor,
    variable: "--font-stampbor",
  },
  {
    name: "Trebuchet",
    font: family.trebuchet,
    variable: "--font-trebuchet",
  },
  {
    name: "Viora",
    font: family.viora,
    variable: "--font-viora",
  },
  {
    name: "Zebrawood",
    font: family.zebrawood,
    variable: "--font-zebrawood",
  },
];

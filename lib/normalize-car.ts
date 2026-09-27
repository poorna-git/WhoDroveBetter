/**
 * Car name normalization utilities
 * - Fixes common spelling mistakes
 * - Standardizes formatting (capitalization, spacing)
 * - Expands common abbreviations
 */

// Common car brand spelling corrections
const BRAND_CORRECTIONS: Record<string, string> = {
  // Indian brands
  maruti: "Maruti Suzuki",
  marutisuzuki: "Maruti Suzuki",
  "maruti suzuki": "Maruti Suzuki",
  tata: "Tata",
  mahindra: "Mahindra",
  hyundai: "Hyundai",
  hundai: "Hyundai",
  hyndai: "Hyundai",
  honda: "Honda",
  hondai: "Honda",
  skoda: "Skoda",
  shkoda: "Skoda",

  // Luxury brands
  bmw: "BMW",
  "b m w": "BMW",
  mercedes: "Mercedes-Benz",
  mercedesbenz: "Mercedes-Benz",
  "mercedes benz": "Mercedes-Benz",
  merc: "Mercedes-Benz",
  audi: "Audi",
  porsche: "Porsche",
  porshe: "Porsche",
  porsch: "Porsche",

  // Japanese
  toyota: "Toyota",
  toyoto: "Toyota",
  nissan: "Nissan",
  nisan: "Nissan",
  mazda: "Mazda",
  lexus: "Lexus",

  // American
  ford: "Ford",
  chevrolet: "Chevrolet",
  chevy: "Chevrolet",
  jeep: "Jeep",

  // Korean
  kia: "Kia",
  genesis: "Genesis",

  // European
  volkswagen: "Volkswagen",
  vw: "Volkswagen",
  volvo: "Volvo",
  landrover: "Land Rover",
  "land rover": "Land Rover",

  // Italian
  ferrari: "Ferrari",
  ferari: "Ferrari",
  lamborghini: "Lamborghini",
  lambo: "Lamborghini",
  fiat: "Fiat",

  // British
  rollsroyce: "Rolls-Royce",
  "rolls royce": "Rolls-Royce",
  bentley: "Bentley",
  mclaren: "McLaren",
  mcclaren: "McLaren",
};

// Common model name corrections
const MODEL_CORRECTIONS: Record<string, string> = {
  // Maruti Suzuki
  swift: "Swift",
  baleno: "Baleno",
  dzire: "Dzire",
  ertiga: "Ertiga",
  brezza: "Brezza",
  vitara: "Vitara",
  ciaz: "Ciaz",
  celerio: "Celerio",

  // Hyundai
  i10: "i10",
  i20: "i20",
  i30: "i30",
  creta: "Creta",
  verna: "Verna",
  venue: "Venue",
  elantra: "Elantra",
  tucson: "Tucson",
  santafe: "Santa Fe",
  "santa fe": "Santa Fe",

  // Honda
  city: "City",
  civic: "Civic",
  accord: "Accord",
  crv: "CR-V",
  "cr-v": "CR-V",
  "cr v": "CR-V",
  amaze: "Amaze",

  // Tata
  nexon: "Nexon",
  harrier: "Harrier",
  safari: "Safari",
  punch: "Punch",
  tiago: "Tiago",
  altroz: "Altroz",

  // Mahindra
  thar: "Thar",
  xuv700: "XUV700",
  xuv500: "XUV500",
  xuv300: "XUV300",
  scorpio: "Scorpio",
  bolero: "Bolero",

  // Skoda
  slavia: "Slavia",
  octavia: "Octavia",
  superb: "Superb",
  kushaq: "Kushaq",

  // VW
  polo: "Polo",
  virtus: "Virtus",

  // Toyota
  fortuner: "Fortuner",
  innova: "Innova",
  "land cruiser": "Land Cruiser",
  landcruiser: "Land Cruiser",
  camry: "Camry",
  corolla: "Corolla",

  // Nissan
  magnite: "Magnite",
  kicks: "Kicks",
  patrol: "Patrol",
};

/**
 * Normalize a car make (brand name)
 */
export function normalizeMake(make: string): string {
  if (!make) return make;

  const cleaned = make.trim().toLowerCase();

  // Check for known corrections
  if (BRAND_CORRECTIONS[cleaned]) {
    return BRAND_CORRECTIONS[cleaned];
  }

  // Default: Capitalize first letter of each word
  return make
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Normalize a car model name
 */
export function normalizeModel(model: string): string {
  if (!model) return model;

  const cleaned = model.trim().toLowerCase();

  // Check for known corrections
  if (MODEL_CORRECTIONS[cleaned]) {
    return MODEL_CORRECTIONS[cleaned];
  }

  // Default: Capitalize first letter of each word, preserve special characters
  return model
    .trim()
    .split(/\s+/)
    .map(word => {
      // Preserve all-caps abbreviations (e.g., "SUV", "GT", "RS")
      if (word === word.toUpperCase() && word.length <= 3) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

/**
 * Normalize both make and model together
 */
export function normalizeCarName(make: string, model: string) {
  return {
    make: normalizeMake(make),
    model: normalizeModel(model),
  };
}

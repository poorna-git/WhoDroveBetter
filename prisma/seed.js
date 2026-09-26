const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const cars = [
  // ──────────── MARUTI SUZUKI ────────────
  { make: "Maruti Suzuki", model: "800", year: 1997, tier: "common", horsepower: 37, country: "India" },
  { make: "Maruti Suzuki", model: "Alto", year: 2000, tier: "common", horsepower: 47, country: "India" },
  { make: "Maruti Suzuki", model: "Alto 800", year: 2023, tier: "common", horsepower: 47, country: "India" },
  { make: "Maruti Suzuki", model: "Alto K10", year: 2023, tier: "common", horsepower: 66, country: "India" },
  { make: "Maruti Suzuki", model: "WagonR", year: 2023, tier: "common", horsepower: 66, country: "India" },
  { make: "Maruti Suzuki", model: "WagonR", year: 2010, tier: "common", horsepower: 67, country: "India" },
  { make: "Maruti Suzuki", model: "Swift", year: 2024, tier: "common", horsepower: 82, country: "India" },
  { make: "Maruti Suzuki", model: "Swift", year: 2018, tier: "common", horsepower: 82, country: "India" },
  { make: "Maruti Suzuki", model: "Swift", year: 2011, tier: "common", horsepower: 86, country: "India" },
  { make: "Maruti Suzuki", model: "Swift", year: 2005, tier: "common", horsepower: 85, country: "India" },
  { make: "Maruti Suzuki", model: "Swift Dzire", year: 2023, tier: "common", horsepower: 82, country: "India" },
  { make: "Maruti Suzuki", model: "Swift Dzire", year: 2017, tier: "common", horsepower: 82, country: "India" },
  { make: "Maruti Suzuki", model: "Dzire", year: 2024, tier: "common", horsepower: 82, country: "India" },
  { make: "Maruti Suzuki", model: "Baleno", year: 2023, tier: "common", horsepower: 89, country: "India" },
  { make: "Maruti Suzuki", model: "Baleno", year: 2019, tier: "common", horsepower: 83, country: "India" },
  { make: "Maruti Suzuki", model: "Celerio", year: 2023, tier: "common", horsepower: 66, country: "India" },
  { make: "Maruti Suzuki", model: "Ciaz", year: 2023, tier: "common", horsepower: 103, country: "India" },
  { make: "Maruti Suzuki", model: "Ciaz", year: 2017, tier: "common", horsepower: 103, country: "India" },
  { make: "Maruti Suzuki", model: "Ignis", year: 2023, tier: "common", horsepower: 82, country: "India" },
  { make: "Maruti Suzuki", model: "S-Presso", year: 2023, tier: "common", horsepower: 66, country: "India" },
  { make: "Maruti Suzuki", model: "Ertiga", year: 2023, tier: "common", horsepower: 103, country: "India" },
  { make: "Maruti Suzuki", model: "Ertiga", year: 2018, tier: "common", horsepower: 103, country: "India" },
  { make: "Maruti Suzuki", model: "XL6", year: 2023, tier: "common", horsepower: 103, country: "India" },
  { make: "Maruti Suzuki", model: "Brezza", year: 2023, tier: "common", horsepower: 103, country: "India" },
  { make: "Maruti Suzuki", model: "Vitara Brezza", year: 2020, tier: "common", horsepower: 103, country: "India" },
  { make: "Maruti Suzuki", model: "Grand Vitara", year: 2023, tier: "common", horsepower: 103, country: "India" },
  { make: "Maruti Suzuki", model: "Fronx", year: 2023, tier: "common", horsepower: 100, country: "India" },
  { make: "Maruti Suzuki", model: "Jimny", year: 2023, tier: "enthusiast", horsepower: 103, country: "India" },
  { make: "Maruti Suzuki", model: "Invicto", year: 2023, tier: "common", horsepower: 186, country: "India" },
  { make: "Maruti Suzuki", model: "Gypsy", year: 2005, tier: "enthusiast", horsepower: 80, country: "India" },
  { make: "Maruti Suzuki", model: "Zen", year: 2004, tier: "common", horsepower: 60, country: "India" },
  { make: "Maruti Suzuki", model: "Esteem", year: 2004, tier: "common", horsepower: 85, country: "India" },
  { make: "Maruti Suzuki", model: "SX4", year: 2012, tier: "common", horsepower: 103, country: "India" },
  { make: "Maruti Suzuki", model: "Ritz", year: 2014, tier: "common", horsepower: 86, country: "India" },
  { make: "Maruti Suzuki", model: "A-Star", year: 2012, tier: "common", horsepower: 67, country: "India" },
  { make: "Maruti Suzuki", model: "Omni", year: 2010, tier: "common", horsepower: 37, country: "India" },
  { make: "Maruti Suzuki", model: "Eeco", year: 2023, tier: "common", horsepower: 73, country: "India" },
  { make: "Maruti Suzuki", model: "S-Cross", year: 2022, tier: "common", horsepower: 103, country: "India" },

  // ──────────── HYUNDAI ────────────
  { make: "Hyundai", model: "Santro", year: 2019, tier: "common", horsepower: 68, country: "South Korea" },
  { make: "Hyundai", model: "Santro Xing", year: 2010, tier: "common", horsepower: 63, country: "South Korea" },
  { make: "Hyundai", model: "i10", year: 2016, tier: "common", horsepower: 68, country: "South Korea" },
  { make: "Hyundai", model: "Grand i10", year: 2023, tier: "common", horsepower: 83, country: "South Korea" },
  { make: "Hyundai", model: "Grand i10 Nios", year: 2023, tier: "common", horsepower: 83, country: "South Korea" },
  { make: "Hyundai", model: "i20", year: 2023, tier: "common", horsepower: 113, country: "South Korea" },
  { make: "Hyundai", model: "i20", year: 2018, tier: "common", horsepower: 83, country: "South Korea" },
  { make: "Hyundai", model: "i20", year: 2012, tier: "common", horsepower: 83, country: "South Korea" },
  { make: "Hyundai", model: "i20 N Line", year: 2023, tier: "enthusiast", horsepower: 118, country: "South Korea" },
  { make: "Hyundai", model: "Verna", year: 2023, tier: "common", horsepower: 113, country: "South Korea" },
  { make: "Hyundai", model: "Verna", year: 2020, tier: "common", horsepower: 113, country: "South Korea" },
  { make: "Hyundai", model: "Verna", year: 2017, tier: "common", horsepower: 107, country: "South Korea" },
  { make: "Hyundai", model: "Verna", year: 2011, tier: "common", horsepower: 105, country: "South Korea" },
  { make: "Hyundai", model: "Aura", year: 2023, tier: "common", horsepower: 83, country: "South Korea" },
  { make: "Hyundai", model: "Xcent", year: 2019, tier: "common", horsepower: 83, country: "South Korea" },
  { make: "Hyundai", model: "Creta", year: 2024, tier: "common", horsepower: 158, country: "South Korea" },
  { make: "Hyundai", model: "Creta", year: 2020, tier: "common", horsepower: 138, country: "South Korea" },
  { make: "Hyundai", model: "Creta", year: 2017, tier: "common", horsepower: 123, country: "South Korea" },
  { make: "Hyundai", model: "Creta N Line", year: 2024, tier: "enthusiast", horsepower: 158, country: "South Korea" },
  { make: "Hyundai", model: "Venue", year: 2023, tier: "common", horsepower: 118, country: "South Korea" },
  { make: "Hyundai", model: "Venue N Line", year: 2023, tier: "enthusiast", horsepower: 118, country: "South Korea" },
  { make: "Hyundai", model: "Tucson", year: 2023, tier: "common", horsepower: 186, country: "South Korea" },
  { make: "Hyundai", model: "Alcazar", year: 2023, tier: "common", horsepower: 158, country: "South Korea" },
  { make: "Hyundai", model: "Exter", year: 2023, tier: "common", horsepower: 82, country: "South Korea" },
  { make: "Hyundai", model: "Ioniq 5", year: 2023, tier: "premium", horsepower: 325, country: "South Korea" },
  { make: "Hyundai", model: "Kona Electric", year: 2023, tier: "enthusiast", horsepower: 201, country: "South Korea" },
  { make: "Hyundai", model: "Accent", year: 2006, tier: "common", horsepower: 105, country: "South Korea" },
  { make: "Hyundai", model: "Getz", year: 2007, tier: "common", horsepower: 82, country: "South Korea" },
  { make: "Hyundai", model: "Sonata", year: 2023, tier: "common", horsepower: 191, country: "South Korea" },

  // ──────────── TATA MOTORS ────────────
  { make: "Tata", model: "Indica", year: 2005, tier: "common", horsepower: 75, country: "India" },
  { make: "Tata", model: "Indica Vista", year: 2012, tier: "common", horsepower: 89, country: "India" },
  { make: "Tata", model: "Indigo", year: 2008, tier: "common", horsepower: 85, country: "India" },
  { make: "Tata", model: "Indigo Marina", year: 2006, tier: "common", horsepower: 85, country: "India" },
  { make: "Tata", model: "Manza", year: 2012, tier: "common", horsepower: 89, country: "India" },
  { make: "Tata", model: "Nano", year: 2012, tier: "common", horsepower: 38, country: "India" },
  { make: "Tata", model: "Tiago", year: 2023, tier: "common", horsepower: 86, country: "India" },
  { make: "Tata", model: "Tiago EV", year: 2023, tier: "common", horsepower: 74, country: "India" },
  { make: "Tata", model: "Tigor", year: 2023, tier: "common", horsepower: 86, country: "India" },
  { make: "Tata", model: "Tigor EV", year: 2023, tier: "common", horsepower: 74, country: "India" },
  { make: "Tata", model: "Altroz", year: 2023, tier: "common", horsepower: 86, country: "India" },
  { make: "Tata", model: "Altroz Racer", year: 2024, tier: "enthusiast", horsepower: 118, country: "India" },
  { make: "Tata", model: "Punch", year: 2023, tier: "common", horsepower: 86, country: "India" },
  { make: "Tata", model: "Punch EV", year: 2024, tier: "common", horsepower: 120, country: "India" },
  { make: "Tata", model: "Nexon", year: 2024, tier: "common", horsepower: 118, country: "India" },
  { make: "Tata", model: "Nexon", year: 2020, tier: "common", horsepower: 118, country: "India" },
  { make: "Tata", model: "Nexon EV", year: 2024, tier: "enthusiast", horsepower: 143, country: "India" },
  { make: "Tata", model: "Nexon EV Max", year: 2023, tier: "enthusiast", horsepower: 143, country: "India" },
  { make: "Tata", model: "Harrier", year: 2024, tier: "common", horsepower: 170, country: "India" },
  { make: "Tata", model: "Harrier", year: 2020, tier: "common", horsepower: 170, country: "India" },
  { make: "Tata", model: "Safari", year: 2024, tier: "common", horsepower: 170, country: "India" },
  { make: "Tata", model: "Safari", year: 2021, tier: "common", horsepower: 170, country: "India" },
  { make: "Tata", model: "Safari (Original)", year: 2005, tier: "common", horsepower: 115, country: "India" },
  { make: "Tata", model: "Safari Storme", year: 2017, tier: "common", horsepower: 154, country: "India" },
  { make: "Tata", model: "Hexa", year: 2019, tier: "common", horsepower: 154, country: "India" },
  { make: "Tata", model: "Bolt", year: 2016, tier: "common", horsepower: 89, country: "India" },
  { make: "Tata", model: "Zest", year: 2017, tier: "common", horsepower: 89, country: "India" },
  { make: "Tata", model: "Sumo", year: 2010, tier: "common", horsepower: 85, country: "India" },
  { make: "Tata", model: "Sierra (2024)", year: 2024, tier: "enthusiast", horsepower: 170, country: "India" },
  { make: "Tata", model: "Curvv", year: 2024, tier: "common", horsepower: 118, country: "India" },
  { make: "Tata", model: "Curvv EV", year: 2024, tier: "enthusiast", horsepower: 167, country: "India" },

  // ──────────── MAHINDRA ────────────
  { make: "Mahindra", model: "Thar", year: 2024, tier: "enthusiast", horsepower: 150, country: "India" },
  { make: "Mahindra", model: "Thar", year: 2020, tier: "enthusiast", horsepower: 150, country: "India" },
  { make: "Mahindra", model: "Thar (Classic)", year: 2010, tier: "enthusiast", horsepower: 105, country: "India" },
  { make: "Mahindra", model: "Thar Roxx", year: 2024, tier: "enthusiast", horsepower: 175, country: "India" },
  { make: "Mahindra", model: "Scorpio", year: 2017, tier: "common", horsepower: 120, country: "India" },
  { make: "Mahindra", model: "Scorpio Classic", year: 2023, tier: "common", horsepower: 132, country: "India" },
  { make: "Mahindra", model: "Scorpio-N", year: 2023, tier: "common", horsepower: 175, country: "India" },
  { make: "Mahindra", model: "XUV700", year: 2023, tier: "common", horsepower: 200, country: "India" },
  { make: "Mahindra", model: "XUV500", year: 2020, tier: "common", horsepower: 155, country: "India" },
  { make: "Mahindra", model: "XUV300", year: 2023, tier: "common", horsepower: 110, country: "India" },
  { make: "Mahindra", model: "XUV400 EV", year: 2023, tier: "enthusiast", horsepower: 148, country: "India" },
  { make: "Mahindra", model: "XUV3XO", year: 2024, tier: "common", horsepower: 130, country: "India" },
  { make: "Mahindra", model: "Bolero", year: 2023, tier: "common", horsepower: 76, country: "India" },
  { make: "Mahindra", model: "Bolero Neo", year: 2023, tier: "common", horsepower: 76, country: "India" },
  { make: "Mahindra", model: "KUV100", year: 2019, tier: "common", horsepower: 82, country: "India" },
  { make: "Mahindra", model: "Marazzo", year: 2023, tier: "common", horsepower: 122, country: "India" },
  { make: "Mahindra", model: "Xylo", year: 2016, tier: "common", horsepower: 112, country: "India" },
  { make: "Mahindra", model: "Verito", year: 2014, tier: "common", horsepower: 65, country: "India" },
  { make: "Mahindra", model: "TUV300", year: 2019, tier: "common", horsepower: 100, country: "India" },
  { make: "Mahindra", model: "Alturas G4", year: 2021, tier: "common", horsepower: 178, country: "India" },
  { make: "Mahindra", model: "BE 6e", year: 2025, tier: "premium", horsepower: 282, country: "India" },
  { make: "Mahindra", model: "XEV 9e", year: 2025, tier: "premium", horsepower: 282, country: "India" },

  // ──────────── KIA ────────────
  { make: "Kia", model: "Seltos", year: 2024, tier: "common", horsepower: 158, country: "South Korea" },
  { make: "Kia", model: "Seltos", year: 2020, tier: "common", horsepower: 138, country: "South Korea" },
  { make: "Kia", model: "Sonet", year: 2023, tier: "common", horsepower: 118, country: "South Korea" },
  { make: "Kia", model: "Carens", year: 2023, tier: "common", horsepower: 138, country: "South Korea" },
  { make: "Kia", model: "EV6", year: 2023, tier: "premium", horsepower: 325, country: "South Korea" },
  { make: "Kia", model: "EV9", year: 2024, tier: "premium", horsepower: 379, country: "South Korea" },
  { make: "Kia", model: "Carnival", year: 2023, tier: "common", horsepower: 200, country: "South Korea" },

  // ──────────── TOYOTA ────────────
  { make: "Toyota", model: "Innova Crysta", year: 2023, tier: "common", horsepower: 174, country: "Japan" },
  { make: "Toyota", model: "Innova", year: 2015, tier: "common", horsepower: 102, country: "Japan" },
  { make: "Toyota", model: "Innova Hycross", year: 2023, tier: "common", horsepower: 186, country: "Japan" },
  { make: "Toyota", model: "Fortuner", year: 2024, tier: "common", horsepower: 204, country: "Japan" },
  { make: "Toyota", model: "Fortuner", year: 2020, tier: "common", horsepower: 177, country: "Japan" },
  { make: "Toyota", model: "Fortuner Legender", year: 2023, tier: "enthusiast", horsepower: 204, country: "Japan" },
  { make: "Toyota", model: "Hilux", year: 2023, tier: "common", horsepower: 204, country: "Japan" },
  { make: "Toyota", model: "Glanza", year: 2023, tier: "common", horsepower: 89, country: "Japan" },
  { make: "Toyota", model: "Urban Cruiser Hyryder", year: 2023, tier: "common", horsepower: 103, country: "Japan" },
  { make: "Toyota", model: "Rumion", year: 2023, tier: "common", horsepower: 103, country: "Japan" },
  { make: "Toyota", model: "Taisor", year: 2024, tier: "common", horsepower: 100, country: "Japan" },
  { make: "Toyota", model: "Etios", year: 2018, tier: "common", horsepower: 80, country: "Japan" },
  { make: "Toyota", model: "Etios Liva", year: 2018, tier: "common", horsepower: 80, country: "Japan" },
  { make: "Toyota", model: "Corolla Altis", year: 2020, tier: "common", horsepower: 139, country: "Japan" },
  { make: "Toyota", model: "Camry Hybrid", year: 2023, tier: "common", horsepower: 211, country: "Japan" },
  { make: "Toyota", model: "Land Cruiser", year: 2024, tier: "premium", horsepower: 409, country: "Japan" },
  { make: "Toyota", model: "Vellfire", year: 2024, tier: "premium", horsepower: 247, country: "Japan" },
  { make: "Toyota", model: "Land Cruiser Prado", year: 2024, tier: "premium", horsepower: 271, country: "Japan" },

  // ──────────── HONDA ────────────
  { make: "Honda", model: "City", year: 2024, tier: "common", horsepower: 121, country: "Japan" },
  { make: "Honda", model: "City", year: 2020, tier: "common", horsepower: 121, country: "Japan" },
  { make: "Honda", model: "City", year: 2017, tier: "common", horsepower: 119, country: "Japan" },
  { make: "Honda", model: "City", year: 2014, tier: "common", horsepower: 119, country: "Japan" },
  { make: "Honda", model: "City", year: 2008, tier: "common", horsepower: 78, country: "Japan" },
  { make: "Honda", model: "City", year: 2003, tier: "common", horsepower: 78, country: "Japan" },
  { make: "Honda", model: "City Hybrid", year: 2023, tier: "common", horsepower: 126, country: "Japan" },
  { make: "Honda", model: "Amaze", year: 2024, tier: "common", horsepower: 99, country: "Japan" },
  { make: "Honda", model: "Amaze", year: 2018, tier: "common", horsepower: 89, country: "Japan" },
  { make: "Honda", model: "Elevate", year: 2023, tier: "common", horsepower: 121, country: "Japan" },
  { make: "Honda", model: "Jazz", year: 2020, tier: "common", horsepower: 90, country: "Japan" },
  { make: "Honda", model: "WR-V", year: 2020, tier: "common", horsepower: 90, country: "Japan" },
  { make: "Honda", model: "BR-V", year: 2018, tier: "common", horsepower: 119, country: "Japan" },
  { make: "Honda", model: "CR-V", year: 2018, tier: "common", horsepower: 188, country: "Japan" },
  { make: "Honda", model: "Civic", year: 2019, tier: "common", horsepower: 141, country: "Japan" },
  { make: "Honda", model: "Brio", year: 2015, tier: "common", horsepower: 88, country: "Japan" },

  // ──────────── SKODA ────────────
  { make: "Skoda", model: "Slavia", year: 2023, tier: "common", horsepower: 150, country: "Czech Republic" },
  { make: "Skoda", model: "Kushaq", year: 2023, tier: "common", horsepower: 150, country: "Czech Republic" },
  { make: "Skoda", model: "Superb", year: 2023, tier: "common", horsepower: 190, country: "Czech Republic" },
  { make: "Skoda", model: "Kodiaq", year: 2024, tier: "common", horsepower: 190, country: "Czech Republic" },
  { make: "Skoda", model: "Octavia", year: 2023, tier: "common", horsepower: 190, country: "Czech Republic" },
  { make: "Skoda", model: "Octavia RS", year: 2023, tier: "enthusiast", horsepower: 245, country: "Czech Republic" },
  { make: "Skoda", model: "Rapid", year: 2020, tier: "common", horsepower: 110, country: "Czech Republic" },
  { make: "Skoda", model: "Fabia", year: 2013, tier: "common", horsepower: 75, country: "Czech Republic" },
  { make: "Skoda", model: "Laura", year: 2010, tier: "common", horsepower: 160, country: "Czech Republic" },
  { make: "Skoda", model: "Yeti", year: 2014, tier: "common", horsepower: 110, country: "Czech Republic" },
  { make: "Skoda", model: "Kylaq", year: 2025, tier: "common", horsepower: 115, country: "Czech Republic" },

  // ──────────── VOLKSWAGEN ────────────
  { make: "Volkswagen", model: "Polo", year: 2022, tier: "common", horsepower: 76, country: "Germany" },
  { make: "Volkswagen", model: "Polo GT TSI", year: 2020, tier: "enthusiast", horsepower: 110, country: "Germany" },
  { make: "Volkswagen", model: "Vento", year: 2021, tier: "common", horsepower: 110, country: "Germany" },
  { make: "Volkswagen", model: "Virtus", year: 2023, tier: "common", horsepower: 150, country: "Germany" },
  { make: "Volkswagen", model: "Virtus GT", year: 2023, tier: "enthusiast", horsepower: 150, country: "Germany" },
  { make: "Volkswagen", model: "Taigun", year: 2023, tier: "common", horsepower: 150, country: "Germany" },
  { make: "Volkswagen", model: "Taigun GT", year: 2023, tier: "enthusiast", horsepower: 150, country: "Germany" },
  { make: "Volkswagen", model: "Tiguan", year: 2024, tier: "common", horsepower: 190, country: "Germany" },
  { make: "Volkswagen", model: "Jetta", year: 2015, tier: "common", horsepower: 120, country: "Germany" },

  // ──────────── RENAULT ────────────
  { make: "Renault", model: "Kwid", year: 2023, tier: "common", horsepower: 68, country: "France" },
  { make: "Renault", model: "Triber", year: 2023, tier: "common", horsepower: 72, country: "France" },
  { make: "Renault", model: "Kiger", year: 2023, tier: "common", horsepower: 100, country: "France" },
  { make: "Renault", model: "Duster", year: 2019, tier: "common", horsepower: 110, country: "France" },

  // ──────────── NISSAN / DATSUN ────────────
  { make: "Nissan", model: "Magnite", year: 2023, tier: "common", horsepower: 100, country: "Japan" },
  { make: "Nissan", model: "Kicks", year: 2022, tier: "common", horsepower: 106, country: "Japan" },
  { make: "Nissan", model: "X-Trail", year: 2024, tier: "common", horsepower: 204, country: "Japan" },
  { make: "Nissan", model: "Terrano", year: 2018, tier: "common", horsepower: 110, country: "Japan" },
  { make: "Nissan", model: "Sunny", year: 2016, tier: "common", horsepower: 99, country: "Japan" },
  { make: "Nissan", model: "Micra", year: 2018, tier: "common", horsepower: 76, country: "Japan" },
  { make: "Datsun", model: "redi-GO", year: 2020, tier: "common", horsepower: 68, country: "Japan" },
  { make: "Datsun", model: "GO", year: 2020, tier: "common", horsepower: 68, country: "Japan" },
  { make: "Datsun", model: "GO Plus", year: 2020, tier: "common", horsepower: 68, country: "Japan" },

  // ──────────── MG MOTOR ────────────
  { make: "MG", model: "Hector", year: 2023, tier: "common", horsepower: 143, country: "China" },
  { make: "MG", model: "Hector Plus", year: 2023, tier: "common", horsepower: 143, country: "China" },
  { make: "MG", model: "Astor", year: 2023, tier: "common", horsepower: 140, country: "China" },
  { make: "MG", model: "ZS EV", year: 2023, tier: "enthusiast", horsepower: 176, country: "China" },
  { make: "MG", model: "Comet EV", year: 2023, tier: "common", horsepower: 42, country: "China" },
  { make: "MG", model: "Gloster", year: 2023, tier: "common", horsepower: 218, country: "China" },
  { make: "MG", model: "Windsor EV", year: 2024, tier: "common", horsepower: 134, country: "China" },

  // ──────────── FORD (India, discontinued but widely driven) ────────────
  { make: "Ford", model: "EcoSport", year: 2021, tier: "common", horsepower: 123, country: "USA" },
  { make: "Ford", model: "Figo", year: 2021, tier: "common", horsepower: 96, country: "USA" },
  { make: "Ford", model: "Aspire", year: 2021, tier: "common", horsepower: 96, country: "USA" },
  { make: "Ford", model: "Endeavour", year: 2021, tier: "common", horsepower: 200, country: "USA" },
  { make: "Ford", model: "Freestyle", year: 2021, tier: "common", horsepower: 96, country: "USA" },
  { make: "Ford", model: "Ikon", year: 2008, tier: "common", horsepower: 75, country: "USA" },
  { make: "Ford", model: "Fiesta", year: 2014, tier: "common", horsepower: 91, country: "USA" },
  { make: "Ford", model: "Fusion", year: 2010, tier: "common", horsepower: 91, country: "USA" },

  // ──────────── CHEVROLET (India, discontinued but widely driven) ────────────
  { make: "Chevrolet", model: "Beat", year: 2017, tier: "common", horsepower: 79, country: "USA" },
  { make: "Chevrolet", model: "Cruze", year: 2017, tier: "common", horsepower: 166, country: "USA" },
  { make: "Chevrolet", model: "Spark", year: 2012, tier: "common", horsepower: 63, country: "USA" },
  { make: "Chevrolet", model: "Aveo", year: 2010, tier: "common", horsepower: 83, country: "USA" },
  { make: "Chevrolet", model: "Sail", year: 2014, tier: "common", horsepower: 86, country: "USA" },
  { make: "Chevrolet", model: "Tavera", year: 2012, tier: "common", horsepower: 117, country: "USA" },
  { make: "Chevrolet", model: "Enjoy", year: 2015, tier: "common", horsepower: 78, country: "USA" },

  // ──────────── FIAT (India, discontinued but widely driven) ────────────
  { make: "Fiat", model: "Punto", year: 2016, tier: "common", horsepower: 75, country: "Italy" },
  { make: "Fiat", model: "Linea", year: 2014, tier: "common", horsepower: 114, country: "Italy" },
  { make: "Fiat", model: "Abarth Punto", year: 2017, tier: "enthusiast", horsepower: 145, country: "Italy" },
  { make: "Fiat", model: "Palio", year: 2007, tier: "common", horsepower: 75, country: "Italy" },
  { make: "Fiat", model: "Uno", year: 2000, tier: "common", horsepower: 46, country: "Italy" },

  // ──────────── CITROËN ────────────
  { make: "Citroën", model: "C3", year: 2023, tier: "common", horsepower: 110, country: "France" },
  { make: "Citroën", model: "C3 Aircross", year: 2023, tier: "common", horsepower: 110, country: "France" },
  { make: "Citroën", model: "eC3", year: 2023, tier: "common", horsepower: 57, country: "France" },
  { make: "Citroën", model: "C5 Aircross", year: 2023, tier: "common", horsepower: 177, country: "France" },
  { make: "Citroën", model: "Basalt", year: 2024, tier: "common", horsepower: 110, country: "France" },

  // ──────────── JEEP ────────────
  { make: "Jeep", model: "Compass", year: 2023, tier: "common", horsepower: 170, country: "USA" },
  { make: "Jeep", model: "Meridian", year: 2023, tier: "common", horsepower: 170, country: "USA" },
  { make: "Jeep", model: "Wrangler", year: 2023, tier: "enthusiast", horsepower: 272, country: "USA" },
  { make: "Jeep", model: "Grand Cherokee", year: 2023, tier: "premium", horsepower: 375, country: "USA" },

  // ──────────── BMW (India) ────────────
  { make: "BMW", model: "3 Series", year: 2024, tier: "premium", horsepower: 258, country: "Germany" },
  { make: "BMW", model: "3 Series Gran Limousine", year: 2024, tier: "premium", horsepower: 258, country: "Germany" },
  { make: "BMW", model: "2 Series Gran Coupe", year: 2023, tier: "premium", horsepower: 218, country: "Germany" },
  { make: "BMW", model: "5 Series", year: 2024, tier: "premium", horsepower: 286, country: "Germany" },
  { make: "BMW", model: "7 Series", year: 2024, tier: "exotic", horsepower: 375, country: "Germany" },
  { make: "BMW", model: "X1", year: 2024, tier: "premium", horsepower: 218, country: "Germany" },
  { make: "BMW", model: "X3", year: 2024, tier: "premium", horsepower: 245, country: "Germany" },
  { make: "BMW", model: "X5", year: 2024, tier: "premium", horsepower: 340, country: "Germany" },
  { make: "BMW", model: "X7", year: 2024, tier: "exotic", horsepower: 394, country: "Germany" },
  { make: "BMW", model: "iX", year: 2023, tier: "exotic", horsepower: 326, country: "Germany" },
  { make: "BMW", model: "i4", year: 2023, tier: "premium", horsepower: 335, country: "Germany" },
  { make: "BMW", model: "i7", year: 2024, tier: "exotic", horsepower: 536, country: "Germany" },
  { make: "BMW", model: "Z4", year: 2023, tier: "premium", horsepower: 382, country: "Germany" },
  { make: "BMW", model: "M340i", year: 2023, tier: "premium", horsepower: 382, country: "Germany" },

  // ──────────── MERCEDES-BENZ (India) ────────────
  { make: "Mercedes-Benz", model: "A-Class Limousine", year: 2023, tier: "premium", horsepower: 221, country: "Germany" },
  { make: "Mercedes-Benz", model: "C-Class", year: 2024, tier: "premium", horsepower: 255, country: "Germany" },
  { make: "Mercedes-Benz", model: "E-Class", year: 2024, tier: "premium", horsepower: 286, country: "Germany" },
  { make: "Mercedes-Benz", model: "S-Class", year: 2024, tier: "exotic", horsepower: 429, country: "Germany" },
  { make: "Mercedes-Benz", model: "GLA", year: 2023, tier: "premium", horsepower: 221, country: "Germany" },
  { make: "Mercedes-Benz", model: "GLB", year: 2023, tier: "premium", horsepower: 221, country: "Germany" },
  { make: "Mercedes-Benz", model: "GLC", year: 2024, tier: "premium", horsepower: 258, country: "Germany" },
  { make: "Mercedes-Benz", model: "GLE", year: 2024, tier: "premium", horsepower: 330, country: "Germany" },
  { make: "Mercedes-Benz", model: "GLS", year: 2024, tier: "exotic", horsepower: 362, country: "Germany" },
  { make: "Mercedes-Benz", model: "EQB", year: 2023, tier: "premium", horsepower: 225, country: "Germany" },
  { make: "Mercedes-Benz", model: "EQS", year: 2023, tier: "exotic", horsepower: 523, country: "Germany" },
  { make: "Mercedes-Benz", model: "Maybach S-Class", year: 2024, tier: "unicorn", horsepower: 503, country: "Germany" },
  { make: "Mercedes-Benz", model: "AMG A35", year: 2023, tier: "premium", horsepower: 306, country: "Germany" },
  { make: "Mercedes-AMG", model: "GT 63 S", year: 2024, tier: "exotic", horsepower: 630, country: "Germany" },
  { make: "Mercedes-Benz", model: "Maybach GLS", year: 2024, tier: "unicorn", horsepower: 550, country: "Germany" },

  // ──────────── AUDI (India) ────────────
  { make: "Audi", model: "A4", year: 2023, tier: "premium", horsepower: 190, country: "Germany" },
  { make: "Audi", model: "A6", year: 2024, tier: "premium", horsepower: 245, country: "Germany" },
  { make: "Audi", model: "A8 L", year: 2024, tier: "exotic", horsepower: 336, country: "Germany" },
  { make: "Audi", model: "Q3", year: 2023, tier: "premium", horsepower: 190, country: "Germany" },
  { make: "Audi", model: "Q5", year: 2024, tier: "premium", horsepower: 265, country: "Germany" },
  { make: "Audi", model: "Q7", year: 2024, tier: "premium", horsepower: 340, country: "Germany" },
  { make: "Audi", model: "Q8", year: 2024, tier: "exotic", horsepower: 340, country: "Germany" },
  { make: "Audi", model: "e-tron GT", year: 2023, tier: "exotic", horsepower: 469, country: "Germany" },
  { make: "Audi", model: "RS5", year: 2023, tier: "premium", horsepower: 444, country: "Germany" },
  { make: "Audi", model: "RS Q8", year: 2023, tier: "exotic", horsepower: 591, country: "Germany" },

  // ──────────── JAGUAR / LAND ROVER ────────────
  { make: "Jaguar", model: "XE", year: 2020, tier: "premium", horsepower: 247, country: "UK" },
  { make: "Jaguar", model: "XF", year: 2023, tier: "premium", horsepower: 296, country: "UK" },
  { make: "Jaguar", model: "F-Pace", year: 2023, tier: "premium", horsepower: 296, country: "UK" },
  { make: "Jaguar", model: "I-Pace", year: 2023, tier: "premium", horsepower: 394, country: "UK" },
  { make: "Land Rover", model: "Defender", year: 2024, tier: "premium", horsepower: 296, country: "UK" },
  { make: "Land Rover", model: "Discovery Sport", year: 2023, tier: "premium", horsepower: 246, country: "UK" },
  { make: "Land Rover", model: "Range Rover Evoque", year: 2023, tier: "premium", horsepower: 246, country: "UK" },
  { make: "Land Rover", model: "Range Rover Velar", year: 2023, tier: "premium", horsepower: 296, country: "UK" },
  { make: "Land Rover", model: "Range Rover Sport", year: 2024, tier: "exotic", horsepower: 395, country: "UK" },
  { make: "Land Rover", model: "Range Rover", year: 2024, tier: "exotic", horsepower: 523, country: "UK" },

  // ──────────── VOLVO (India) ────────────
  { make: "Volvo", model: "XC40", year: 2023, tier: "premium", horsepower: 197, country: "Sweden" },
  { make: "Volvo", model: "XC40 Recharge", year: 2023, tier: "premium", horsepower: 408, country: "Sweden" },
  { make: "Volvo", model: "XC60", year: 2023, tier: "premium", horsepower: 250, country: "Sweden" },
  { make: "Volvo", model: "XC90", year: 2024, tier: "premium", horsepower: 310, country: "Sweden" },
  { make: "Volvo", model: "S90", year: 2023, tier: "premium", horsepower: 250, country: "Sweden" },
  { make: "Volvo", model: "C40 Recharge", year: 2023, tier: "premium", horsepower: 408, country: "Sweden" },

  // ──────────── PORSCHE (India) ────────────
  { make: "Porsche", model: "Cayenne", year: 2024, tier: "exotic", horsepower: 348, country: "Germany" },
  { make: "Porsche", model: "Macan", year: 2024, tier: "premium", horsepower: 261, country: "Germany" },
  { make: "Porsche", model: "Taycan", year: 2024, tier: "exotic", horsepower: 402, country: "Germany" },
  { make: "Porsche", model: "911 Carrera", year: 2024, tier: "exotic", horsepower: 379, country: "Germany" },
  { make: "Porsche", model: "Panamera", year: 2024, tier: "exotic", horsepower: 348, country: "Germany" },

  // ──────────── LAMBORGHINI / FERRARI / LUXURY (India) ────────────
  { make: "Lamborghini", model: "Urus", year: 2024, tier: "exotic", horsepower: 641, country: "Italy" },
  { make: "Lamborghini", model: "Huracan Evo", year: 2023, tier: "exotic", horsepower: 631, country: "Italy" },
  { make: "Ferrari", model: "Roma", year: 2023, tier: "exotic", horsepower: 612, country: "Italy" },
  { make: "Ferrari", model: "296 GTB", year: 2024, tier: "unicorn", horsepower: 819, country: "Italy" },
  { make: "Ferrari", model: "Purosangue", year: 2024, tier: "unicorn", horsepower: 715, country: "Italy" },
  { make: "Bentley", model: "Continental GT", year: 2024, tier: "unicorn", horsepower: 542, country: "UK" },
  { make: "Bentley", model: "Flying Spur", year: 2024, tier: "unicorn", horsepower: 542, country: "UK" },
  { make: "Bentley", model: "Bentayga", year: 2024, tier: "unicorn", horsepower: 542, country: "UK" },
  { make: "Rolls-Royce", model: "Ghost", year: 2024, tier: "unicorn", horsepower: 563, country: "UK" },
  { make: "Rolls-Royce", model: "Cullinan", year: 2024, tier: "unicorn", horsepower: 563, country: "UK" },
  { make: "Rolls-Royce", model: "Phantom", year: 2024, tier: "unicorn", horsepower: 563, country: "UK" },

  // ──────────── CLASSIC / ICONIC INDIAN CARS ────────────
  { make: "Hindustan Motors", model: "Ambassador", year: 2005, tier: "common", horsepower: 75, country: "India" },
  { make: "Premier", model: "Padmini", year: 1998, tier: "common", horsepower: 48, country: "India" },
  { make: "Hindustan Motors", model: "Contessa", year: 2002, tier: "enthusiast", horsepower: 75, country: "India" },
  { make: "Maruti Suzuki", model: "1000", year: 2000, tier: "common", horsepower: 46, country: "India" },

  // ──────────── ORIGINAL GLOBAL CARS (from first seed) ────────────
  // COMMON
  { make: "Toyota", model: "Corolla", year: 2020, tier: "common", horsepower: 169, country: "Japan" },
  { make: "Toyota", model: "Camry", year: 2023, tier: "common", horsepower: 203, country: "Japan" },
  { make: "Toyota", model: "RAV4", year: 2023, tier: "common", horsepower: 203, country: "Japan" },
  { make: "Honda", model: "CR-V", year: 2023, tier: "common", horsepower: 190, country: "Japan" },
  { make: "Honda", model: "Accord", year: 2023, tier: "common", horsepower: 192, country: "Japan" },
  { make: "Nissan", model: "Altima", year: 2022, tier: "common", horsepower: 188, country: "Japan" },
  { make: "Ford", model: "F-150", year: 2023, tier: "common", horsepower: 400, country: "USA" },
  { make: "Chevrolet", model: "Silverado", year: 2023, tier: "common", horsepower: 355, country: "USA" },
  { make: "RAM", model: "1500", year: 2023, tier: "common", horsepower: 395, country: "USA" },
  { make: "Suzuki", model: "Swift", year: 2023, tier: "common", horsepower: 90, country: "Japan" },
  { make: "Honda", model: "Fit", year: 2020, tier: "common", horsepower: 130, country: "Japan" },
  { make: "Subaru", model: "Impreza", year: 2023, tier: "common", horsepower: 152, country: "Japan" },

  // ENTHUSIAST
  { make: "Subaru", model: "WRX", year: 2023, tier: "enthusiast", horsepower: 271, country: "Japan" },
  { make: "Volkswagen", model: "GTI", year: 2023, tier: "enthusiast", horsepower: 241, country: "Germany" },
  { make: "Mazda", model: "MX-5 Miata", year: 2023, tier: "enthusiast", horsepower: 181, country: "Japan" },
  { make: "Toyota", model: "GR86", year: 2023, tier: "enthusiast", horsepower: 228, country: "Japan" },
  { make: "Subaru", model: "BRZ", year: 2023, tier: "enthusiast", horsepower: 228, country: "Japan" },
  { make: "Honda", model: "S2000", year: 2009, tier: "enthusiast", horsepower: 237, country: "Japan" },
  { make: "Mitsubishi", model: "Lancer Evolution", year: 2015, tier: "enthusiast", horsepower: 303, country: "Japan" },
  { make: "Subaru", model: "WRX STI", year: 2021, tier: "enthusiast", horsepower: 310, country: "Japan" },
  { make: "Nissan", model: "370Z", year: 2020, tier: "enthusiast", horsepower: 332, country: "Japan" },
  { make: "Nissan", model: "Z", year: 2023, tier: "enthusiast", horsepower: 400, country: "Japan" },
  { make: "Toyota", model: "GR Corolla", year: 2023, tier: "enthusiast", horsepower: 300, country: "Japan" },

  // PREMIUM
  { make: "BMW", model: "M3", year: 2023, tier: "premium", horsepower: 473, country: "Germany" },
  { make: "BMW", model: "M4", year: 2023, tier: "premium", horsepower: 473, country: "Germany" },
  { make: "Mercedes-AMG", model: "C63 S", year: 2023, tier: "premium", horsepower: 503, country: "Germany" },
  { make: "Toyota", model: "Supra", year: 2023, tier: "premium", horsepower: 382, country: "Japan" },
  { make: "Ford", model: "Mustang GT", year: 2023, tier: "premium", horsepower: 480, country: "USA" },
  { make: "Dodge", model: "Challenger Hellcat", year: 2023, tier: "premium", horsepower: 717, country: "USA" },
  { make: "Honda", model: "Civic Type R", year: 2023, tier: "premium", horsepower: 315, country: "Japan" },
  { make: "Nissan", model: "GT-R", year: 2023, tier: "premium", horsepower: 565, country: "Japan" },
  { make: "Chevrolet", model: "Corvette Stingray", year: 2023, tier: "premium", horsepower: 490, country: "USA" },
  { make: "Tesla", model: "Model S Plaid", year: 2023, tier: "premium", horsepower: 1020, country: "USA" },
  { make: "Tesla", model: "Model 3", year: 2024, tier: "common", horsepower: 283, country: "USA" },
  { make: "Tesla", model: "Model Y", year: 2024, tier: "common", horsepower: 283, country: "USA" },

  // EXOTIC
  { make: "Porsche", model: "911 GT3", year: 2023, tier: "exotic", horsepower: 502, country: "Germany" },
  { make: "Porsche", model: "911 Turbo S", year: 2023, tier: "exotic", horsepower: 640, country: "Germany" },
  { make: "Audi", model: "R8", year: 2023, tier: "exotic", horsepower: 602, country: "Germany" },
  { make: "Lamborghini", model: "Huracan", year: 2023, tier: "exotic", horsepower: 631, country: "Italy" },
  { make: "Ferrari", model: "F8 Tributo", year: 2023, tier: "exotic", horsepower: 710, country: "Italy" },
  { make: "McLaren", model: "720S", year: 2023, tier: "exotic", horsepower: 710, country: "UK" },
  { make: "Aston Martin", model: "Vantage", year: 2023, tier: "exotic", horsepower: 503, country: "UK" },

  // UNICORN
  { make: "Ferrari", model: "LaFerrari", year: 2015, tier: "unicorn", horsepower: 949, country: "Italy" },
  { make: "McLaren", model: "P1", year: 2015, tier: "unicorn", horsepower: 903, country: "UK" },
  { make: "Bugatti", model: "Chiron", year: 2023, tier: "unicorn", horsepower: 1479, country: "France" },
  { make: "Bugatti", model: "Veyron", year: 2015, tier: "unicorn", horsepower: 1200, country: "France" },
  { make: "Lamborghini", model: "Aventador SVJ", year: 2022, tier: "unicorn", horsepower: 770, country: "Italy" },
  { make: "Lamborghini", model: "Revuelto", year: 2024, tier: "unicorn", horsepower: 1001, country: "Italy" },
  { make: "Pagani", model: "Huayra", year: 2022, tier: "unicorn", horsepower: 764, country: "Italy" },
  { make: "Koenigsegg", model: "Jesko", year: 2023, tier: "unicorn", horsepower: 1600, country: "Sweden" },
  { make: "Ferrari", model: "SF90 Stradale", year: 2023, tier: "unicorn", horsepower: 986, country: "Italy" },
  { make: "Rimac", model: "Nevera", year: 2023, tier: "unicorn", horsepower: 1914, country: "Croatia" },
  { make: "Mercedes-AMG", model: "One", year: 2023, tier: "unicorn", horsepower: 1049, country: "Germany" },
  { make: "Ford", model: "GT", year: 2022, tier: "unicorn", horsepower: 660, country: "USA" },
];

async function main() {
  console.log('Seeding car catalogue...');

  let created = 0;
  let skipped = 0;

  for (const car of cars) {
    try {
      await prisma.car.upsert({
        where: {
          make_model_year: {
            make: car.make,
            model: car.model,
            year: car.year || 0,
          },
        },
        update: car,
        create: car,
      });
      created++;
    } catch (e) {
      skipped++;
    }
  }

  console.log(`Seeded ${created} cars (${skipped} skipped/duplicates).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const cars = [
  // COMMON tier (10 base pts)
  { make: "Toyota", model: "Corolla", year: 2020, tier: "common", horsepower: 169, country: "Japan" },
  { make: "Honda", model: "Civic", year: 2022, tier: "common", horsepower: 158, country: "Japan" },
  { make: "Toyota", model: "Camry", year: 2023, tier: "common", horsepower: 203, country: "Japan" },
  { make: "Nissan", model: "Altima", year: 2022, tier: "common", horsepower: 188, country: "Japan" },
  { make: "Hyundai", model: "Elantra", year: 2023, tier: "common", horsepower: 147, country: "South Korea" },
  { make: "Kia", model: "Forte", year: 2023, tier: "common", horsepower: 147, country: "South Korea" },
  { make: "Mazda", model: "Mazda3", year: 2023, tier: "common", horsepower: 191, country: "Japan" },
  { make: "Honda", model: "Accord", year: 2023, tier: "common", horsepower: 192, country: "Japan" },
  { make: "Volkswagen", model: "Jetta", year: 2023, tier: "common", horsepower: 158, country: "Germany" },
  { make: "Toyota", model: "RAV4", year: 2023, tier: "common", horsepower: 203, country: "Japan" },
  { make: "Honda", model: "CR-V", year: 2023, tier: "common", horsepower: 190, country: "Japan" },
  { make: "Nissan", model: "Sentra", year: 2023, tier: "common", horsepower: 149, country: "Japan" },
  { make: "Chevrolet", model: "Malibu", year: 2023, tier: "common", horsepower: 160, country: "USA" },
  { make: "Ford", model: "Escape", year: 2023, tier: "common", horsepower: 180, country: "USA" },
  { make: "Subaru", model: "Impreza", year: 2023, tier: "common", horsepower: 152, country: "Japan" },
  { make: "Hyundai", model: "Tucson", year: 2023, tier: "common", horsepower: 187, country: "South Korea" },
  { make: "Kia", model: "Seltos", year: 2023, tier: "common", horsepower: 146, country: "South Korea" },
  { make: "Toyota", model: "Yaris", year: 2020, tier: "common", horsepower: 106, country: "Japan" },
  { make: "Nissan", model: "Versa", year: 2023, tier: "common", horsepower: 122, country: "Japan" },
  { make: "Chevrolet", model: "Cruze", year: 2019, tier: "common", horsepower: 153, country: "USA" },
  { make: "Ford", model: "Focus", year: 2018, tier: "common", horsepower: 160, country: "USA" },
  { make: "Mitsubishi", model: "Lancer", year: 2017, tier: "common", horsepower: 148, country: "Japan" },
  { make: "Kia", model: "Soul", year: 2023, tier: "common", horsepower: 147, country: "South Korea" },
  { make: "Hyundai", model: "Sonata", year: 2023, tier: "common", horsepower: 191, country: "South Korea" },
  { make: "Ford", model: "F-150", year: 2023, tier: "common", horsepower: 400, country: "USA" },
  { make: "Chevrolet", model: "Silverado", year: 2023, tier: "common", horsepower: 355, country: "USA" },
  { make: "RAM", model: "1500", year: 2023, tier: "common", horsepower: 395, country: "USA" },
  { make: "Toyota", model: "Tacoma", year: 2023, tier: "common", horsepower: 278, country: "Japan" },
  { make: "Honda", model: "Fit", year: 2020, tier: "common", horsepower: 130, country: "Japan" },
  { make: "Suzuki", model: "Swift", year: 2023, tier: "common", horsepower: 90, country: "Japan" },

  // ENTHUSIAST tier (+5 bonus)
  { make: "Subaru", model: "WRX", year: 2023, tier: "enthusiast", horsepower: 271, country: "Japan" },
  { make: "Volkswagen", model: "GTI", year: 2023, tier: "enthusiast", horsepower: 241, country: "Germany" },
  { make: "Mazda", model: "MX-5 Miata", year: 2023, tier: "enthusiast", horsepower: 181, country: "Japan" },
  { make: "Toyota", model: "GR86", year: 2023, tier: "enthusiast", horsepower: 228, country: "Japan" },
  { make: "Subaru", model: "BRZ", year: 2023, tier: "enthusiast", horsepower: 228, country: "Japan" },
  { make: "Hyundai", model: "Veloster N", year: 2022, tier: "enthusiast", horsepower: 275, country: "South Korea" },
  { make: "Honda", model: "Civic Si", year: 2023, tier: "enthusiast", horsepower: 200, country: "Japan" },
  { make: "Mini", model: "Cooper S", year: 2023, tier: "enthusiast", horsepower: 189, country: "UK" },
  { make: "Volkswagen", model: "Golf R", year: 2023, tier: "enthusiast", horsepower: 315, country: "Germany" },
  { make: "Hyundai", model: "Elantra N", year: 2023, tier: "enthusiast", horsepower: 276, country: "South Korea" },
  { make: "Ford", model: "Mustang EcoBoost", year: 2023, tier: "enthusiast", horsepower: 310, country: "USA" },
  { make: "Chevrolet", model: "Camaro LT1", year: 2023, tier: "enthusiast", horsepower: 275, country: "USA" },
  { make: "Nissan", model: "370Z", year: 2020, tier: "enthusiast", horsepower: 332, country: "Japan" },
  { make: "Nissan", model: "Z", year: 2023, tier: "enthusiast", horsepower: 400, country: "Japan" },
  { make: "BMW", model: "M240i", year: 2023, tier: "enthusiast", horsepower: 382, country: "Germany" },
  { make: "Toyota", model: "GR Corolla", year: 2023, tier: "enthusiast", horsepower: 300, country: "Japan" },
  { make: "Ford", model: "Focus RS", year: 2018, tier: "enthusiast", horsepower: 350, country: "USA" },
  { make: "Honda", model: "S2000", year: 2009, tier: "enthusiast", horsepower: 237, country: "Japan" },
  { make: "Mitsubishi", model: "Lancer Evolution", year: 2015, tier: "enthusiast", horsepower: 303, country: "Japan" },
  { make: "Subaru", model: "WRX STI", year: 2021, tier: "enthusiast", horsepower: 310, country: "Japan" },
  { make: "Dodge", model: "Challenger R/T", year: 2023, tier: "enthusiast", horsepower: 375, country: "USA" },
  { make: "Fiat", model: "124 Spider", year: 2020, tier: "enthusiast", horsepower: 164, country: "Italy" },

  // PREMIUM tier (+10 bonus)
  { make: "BMW", model: "M3", year: 2023, tier: "premium", horsepower: 473, country: "Germany" },
  { make: "BMW", model: "M4", year: 2023, tier: "premium", horsepower: 473, country: "Germany" },
  { make: "Mercedes-AMG", model: "C63 S", year: 2023, tier: "premium", horsepower: 503, country: "Germany" },
  { make: "Audi", model: "RS5", year: 2023, tier: "premium", horsepower: 444, country: "Germany" },
  { make: "Audi", model: "RS6 Avant", year: 2023, tier: "premium", horsepower: 621, country: "Germany" },
  { make: "Toyota", model: "Supra", year: 2023, tier: "premium", horsepower: 382, country: "Japan" },
  { make: "Ford", model: "Mustang GT", year: 2023, tier: "premium", horsepower: 480, country: "USA" },
  { make: "Chevrolet", model: "Camaro SS", year: 2023, tier: "premium", horsepower: 455, country: "USA" },
  { make: "Dodge", model: "Challenger Hellcat", year: 2023, tier: "premium", horsepower: 717, country: "USA" },
  { make: "Honda", model: "Civic Type R", year: 2023, tier: "premium", horsepower: 315, country: "Japan" },
  { make: "Nissan", model: "GT-R", year: 2023, tier: "premium", horsepower: 565, country: "Japan" },
  { make: "Chevrolet", model: "Corvette Stingray", year: 2023, tier: "premium", horsepower: 490, country: "USA" },
  { make: "Mercedes-AMG", model: "A45 S", year: 2023, tier: "premium", horsepower: 416, country: "Germany" },
  { make: "BMW", model: "M2", year: 2023, tier: "premium", horsepower: 453, country: "Germany" },
  { make: "Alfa Romeo", model: "Giulia Quadrifoglio", year: 2023, tier: "premium", horsepower: 505, country: "Italy" },
  { make: "Lexus", model: "LC 500", year: 2023, tier: "premium", horsepower: 471, country: "Japan" },
  { make: "Jaguar", model: "F-Type R", year: 2023, tier: "premium", horsepower: 575, country: "UK" },
  { make: "Tesla", model: "Model S Plaid", year: 2023, tier: "premium", horsepower: 1020, country: "USA" },
  { make: "Porsche", model: "Cayman GTS", year: 2023, tier: "premium", horsepower: 394, country: "Germany" },
  { make: "Porsche", model: "Boxster GTS", year: 2023, tier: "premium", horsepower: 394, country: "Germany" },
  { make: "Dodge", model: "Charger Hellcat", year: 2023, tier: "premium", horsepower: 717, country: "USA" },
  { make: "Ford", model: "Mustang Shelby GT350", year: 2020, tier: "premium", horsepower: 526, country: "USA" },
  { make: "Lotus", model: "Elise", year: 2021, tier: "premium", horsepower: 217, country: "UK" },
  { make: "Lotus", model: "Exige", year: 2021, tier: "premium", horsepower: 416, country: "UK" },

  // EXOTIC tier (+20 bonus)
  { make: "Porsche", model: "911 GT3", year: 2023, tier: "exotic", horsepower: 502, country: "Germany" },
  { make: "Porsche", model: "911 Turbo S", year: 2023, tier: "exotic", horsepower: 640, country: "Germany" },
  { make: "Audi", model: "R8", year: 2023, tier: "exotic", horsepower: 602, country: "Germany" },
  { make: "Mercedes-AMG", model: "GT R", year: 2023, tier: "exotic", horsepower: 577, country: "Germany" },
  { make: "Chevrolet", model: "Corvette Z06", year: 2023, tier: "exotic", horsepower: 670, country: "USA" },
  { make: "Ford", model: "Mustang Shelby GT500", year: 2023, tier: "exotic", horsepower: 760, country: "USA" },
  { make: "Lamborghini", model: "Huracan", year: 2023, tier: "exotic", horsepower: 631, country: "Italy" },
  { make: "Ferrari", model: "488 GTB", year: 2019, tier: "exotic", horsepower: 661, country: "Italy" },
  { make: "Ferrari", model: "F8 Tributo", year: 2023, tier: "exotic", horsepower: 710, country: "Italy" },
  { make: "McLaren", model: "570S", year: 2021, tier: "exotic", horsepower: 562, country: "UK" },
  { make: "McLaren", model: "720S", year: 2023, tier: "exotic", horsepower: 710, country: "UK" },
  { make: "Aston Martin", model: "Vantage", year: 2023, tier: "exotic", horsepower: 503, country: "UK" },
  { make: "Aston Martin", model: "DB11", year: 2023, tier: "exotic", horsepower: 528, country: "UK" },
  { make: "Nissan", model: "GT-R Nismo", year: 2023, tier: "exotic", horsepower: 600, country: "Japan" },
  { make: "BMW", model: "M5 CS", year: 2022, tier: "exotic", horsepower: 627, country: "Germany" },
  { make: "Porsche", model: "918 Spyder", year: 2015, tier: "exotic", horsepower: 887, country: "Germany" },
  { make: "Lotus", model: "Evora GT", year: 2021, tier: "exotic", horsepower: 416, country: "UK" },
  { make: "Dodge", model: "Viper", year: 2017, tier: "exotic", horsepower: 645, country: "USA" },
  { make: "Maserati", model: "MC20", year: 2023, tier: "exotic", horsepower: 621, country: "Italy" },
  { make: "Lexus", model: "LFA", year: 2012, tier: "exotic", horsepower: 552, country: "Japan" },

  // UNICORN tier (+50 bonus)
  { make: "Ferrari", model: "LaFerrari", year: 2015, tier: "unicorn", horsepower: 949, country: "Italy" },
  { make: "McLaren", model: "P1", year: 2015, tier: "unicorn", horsepower: 903, country: "UK" },
  { make: "Bugatti", model: "Chiron", year: 2023, tier: "unicorn", horsepower: 1479, country: "France" },
  { make: "Bugatti", model: "Veyron", year: 2015, tier: "unicorn", horsepower: 1200, country: "France" },
  { make: "Lamborghini", model: "Aventador SVJ", year: 2022, tier: "unicorn", horsepower: 770, country: "Italy" },
  { make: "Lamborghini", model: "Revuelto", year: 2024, tier: "unicorn", horsepower: 1001, country: "Italy" },
  { make: "Pagani", model: "Huayra", year: 2022, tier: "unicorn", horsepower: 764, country: "Italy" },
  { make: "Koenigsegg", model: "Jesko", year: 2023, tier: "unicorn", horsepower: 1600, country: "Sweden" },
  { make: "Koenigsegg", model: "Agera RS", year: 2018, tier: "unicorn", horsepower: 1341, country: "Sweden" },
  { make: "Ferrari", model: "SF90 Stradale", year: 2023, tier: "unicorn", horsepower: 986, country: "Italy" },
  { make: "Rimac", model: "Nevera", year: 2023, tier: "unicorn", horsepower: 1914, country: "Croatia" },
  { make: "Aston Martin", model: "Valkyrie", year: 2023, tier: "unicorn", horsepower: 1139, country: "UK" },
  { make: "Mercedes-AMG", model: "One", year: 2023, tier: "unicorn", horsepower: 1049, country: "Germany" },
  { make: "Ford", model: "GT", year: 2022, tier: "unicorn", horsepower: 660, country: "USA" },
  { make: "Lamborghini", model: "Sian", year: 2021, tier: "unicorn", horsepower: 819, country: "Italy" },
  { make: "McLaren", model: "Speedtail", year: 2020, tier: "unicorn", horsepower: 1036, country: "UK" },
  { make: "Pagani", model: "Zonda", year: 2017, tier: "unicorn", horsepower: 750, country: "Italy" },
  { make: "Ferrari", model: "Enzo", year: 2004, tier: "unicorn", horsepower: 651, country: "Italy" },
  { make: "Lamborghini", model: "Centenario", year: 2017, tier: "unicorn", horsepower: 770, country: "Italy" },
  { make: "Bugatti", model: "Divo", year: 2020, tier: "unicorn", horsepower: 1479, country: "France" },
];

async function main() {
  console.log('Seeding car catalogue...');

  for (const car of cars) {
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
  }

  console.log(`Seeded ${cars.length} cars.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

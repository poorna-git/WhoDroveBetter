import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CARS_DATABASE } from "@/lib/cars-data";
import { normalizeMake, normalizeModel, normalizeCarName } from "@/lib/normalize-car";

// Helper to fetch from NHTSA API
async function searchNHTSA(query: string) {
  try {
    const res = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/${encodeURIComponent(query)}?format=json`,
      { next: { revalidate: 86400 } } // Cache for 24 hours
    );
    const data = await res.json();

    if (!data.Results || data.Results.length === 0) return [];

    // Transform NHTSA results to our format
    return data.Results.slice(0, 20).map((car: any) => ({
      id: `nhtsa-${car.Model_ID}`,
      make: normalizeMake(car.Make_Name),
      model: normalizeModel(car.Model_Name),
      year: null,
      tier: "common", // Default tier for external cars
      horsepower: 0,
      country: "Unknown",
      isExternal: true, // Flag to identify external results
    }));
  } catch (error) {
    console.error("NHTSA API error:", error);
    return [];
  }
}

// Helper to guess tier based on horsepower and make
function guessCarTier(make: string, model: string, horsepower: number): string {
  const exoticBrands = ["Ferrari", "Lamborghini", "McLaren", "Aston Martin", "Rolls-Royce", "Bentley", "Bugatti", "Koenigsegg", "Pagani", "Lotus", "Maserati"];
  const premiumBrands = ["Porsche", "Mercedes-Benz", "BMW", "Audi", "Lexus", "Land Rover", "Jaguar", "Genesis", "Cadillac", "Lincoln", "Infiniti", "Volvo", "Tesla"];

  const normMake = normalizeMake(make);

  if (exoticBrands.includes(normMake)) {
    return horsepower > 700 ? "unicorn" : "exotic";
  }
  if (premiumBrands.includes(normMake)) {
    return horsepower > 500 ? "exotic" : "premium";
  }
  if (horsepower > 400) return "enthusiast";
  if (horsepower > 250) return "premium";
  return "common";
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const tier = searchParams.get("tier") || "";
    const make = searchParams.get("make") || "";
    const country = searchParams.get("country") || "";
    const limit = parseInt(searchParams.get("limit") || "50");

    if (query.length < 2) {
      return NextResponse.json({ cars: [] });
    }

    const cleanQuery = query.toLowerCase().trim();
    // Split into individual search terms for Google-like multi-word matching
    const queryTerms = cleanQuery.split(/\s+/).filter(Boolean);
    const compactQuery = cleanQuery.replace(/[\s\-_]/g, "");

    // 1. Search in-memory CARS_DATABASE with multi-term fuzzy matching
    const memoryResults = CARS_DATABASE.filter((car) => {
      const full = `${car.make} ${car.model}`.toLowerCase();
      const compactFull = full.replace(/[\s\-_]/g, "");

      // Check if all query terms are present in make + model
      const allTermsMatch = queryTerms.every(term =>
        full.includes(term) || car.make.toLowerCase().includes(term) || car.model.toLowerCase().includes(term)
      );

      const matchQuery =
        allTermsMatch ||
        full.includes(cleanQuery) ||
        compactFull.includes(compactQuery) ||
        car.make.toLowerCase().includes(cleanQuery) ||
        car.model.toLowerCase().includes(cleanQuery);

      if (!matchQuery) return false;
      if (tier && car.tier !== tier) return false;
      if (make && car.make.toLowerCase() !== make.toLowerCase()) return false;
      if (country && car.country.toLowerCase() !== country.toLowerCase()) return false;
      return true;
    }).map((car) => ({
      id: `local-${car.make}-${car.model}`,
      make: car.make,
      model: car.model,
      year: car.year || null,
      tier: car.tier,
      horsepower: car.horsepower,
      country: car.country,
      isExternal: true, // Will be saved to DB if not already present
    }));

    // 2. Search Database and NHTSA in parallel
    const [dbCars, nhtsaCars] = await Promise.all([
      (async () => {
        try {
          const where: any = {};
          if (query) {
            where.OR = [
              { make: { contains: query, mode: "insensitive" } },
              { model: { contains: query, mode: "insensitive" } },
            ];
          }
          if (tier) where.tier = tier;
          if (make) where.make = { equals: make, mode: "insensitive" };
          if (country) where.country = country;

          return await prisma.car.findMany({
            where,
            take: limit,
            orderBy: [
              { tier: "desc" },
              { make: "asc" },
              { model: "asc" },
            ],
          });
        } catch (dbErr) {
          console.error("DB car query error (fallback to local):", dbErr);
          return [];
        }
      })(),
      // NHTSA API search (only if no filters applied)
      !tier && !make && !country ? searchNHTSA(query) : Promise.resolve([]),
    ]);

    // 3. Deduplicate by make + model (ignoring year to show generic car options)
    const seen = new Set<string>();
    const mergedCars: any[] = [];

    const makeKey = (c: { make: string; model: string }) =>
      `${c.make.toLowerCase().trim()}_${c.model.toLowerCase().trim()}`;

    // Add DB results first
    for (const car of dbCars) {
      const key = makeKey(car);
      if (!seen.has(key)) {
        seen.add(key);
        mergedCars.push({ ...car, isExternal: false });
      }
    }

    // Add local memory results next
    for (const car of memoryResults) {
      const key = makeKey(car);
      if (!seen.has(key)) {
        seen.add(key);
        mergedCars.push(car);
      }
    }

    // Add NHTSA results last
    for (const car of nhtsaCars) {
      const key = makeKey(car);
      if (!seen.has(key)) {
        seen.add(key);
        mergedCars.push(car);
      }
    }

    return NextResponse.json({ cars: mergedCars.slice(0, limit) });
  } catch (error) {
    console.error("Car fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cars" },
      { status: 500 }
    );
  }
}

// POST: Save or manually add a car to the database with normalization
export async function POST(req: Request) {
  try {
    const { make, model, year, tier, horsepower, country } = await req.json();

    if (!make || !model) {
      return NextResponse.json(
        { error: "Make and model are required" },
        { status: 400 }
      );
    }

    // 1. Normalize make and model
    const normalized = normalizeCarName(make, model);
    const finalMake = normalized.make;
    const finalModel = normalized.model;

    // Check if already exists in DB
    const existing = await prisma.car.findFirst({
      where: {
        make: { equals: finalMake, mode: "insensitive" },
        model: { equals: finalModel, mode: "insensitive" },
      },
    });

    if (existing) {
      return NextResponse.json({ car: existing });
    }

    // 2. Lookup metadata from local CARS_DATABASE
    const localMatch = CARS_DATABASE.find(
      (c) =>
        c.make.toLowerCase() === finalMake.toLowerCase() &&
        c.model.toLowerCase() === finalModel.toLowerCase()
    );

    const finalHorsepower = horsepower || localMatch?.horsepower || 0;
    const finalCountry = country || localMatch?.country || "Unknown";
    const finalTier = tier || localMatch?.tier || guessCarTier(finalMake, finalModel, finalHorsepower);

    // 3. Create new car in database
    const car = await prisma.car.create({
      data: {
        make: finalMake,
        model: finalModel,
        year: year ? parseInt(year) : null,
        tier: finalTier,
        horsepower: finalHorsepower,
        country: finalCountry,
      },
    });

    return NextResponse.json({ car });
  } catch (error) {
    console.error("Failed to save car:", error);
    return NextResponse.json(
      { error: "Failed to save car" },
      { status: 500 }
    );
  }
}

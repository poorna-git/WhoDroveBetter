import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CARS_DATABASE } from "@/lib/cars-data";

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
      make: car.Make_Name,
      model: car.Model_Name,
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
    const compactQuery = cleanQuery.replace(/[\s\-_]/g, "");

    // 1. Search in-memory CARS_DATABASE
    const memoryResults = CARS_DATABASE.filter((car) => {
      const full = `${car.make} ${car.model}`.toLowerCase();
      const compactFull = full.replace(/[\s\-_]/g, "");
      const matchQuery =
        full.includes(cleanQuery) ||
        compactFull.includes(compactQuery) ||
        car.make.toLowerCase().includes(cleanQuery) ||
        car.model.toLowerCase().includes(cleanQuery);

      if (!matchQuery) return false;
      if (tier && car.tier !== tier) return false;
      if (make && car.make.toLowerCase() !== make.toLowerCase()) return false;
      if (country && car.country.toLowerCase() !== country.toLowerCase()) return false;
      return true;
    }).map((car, idx) => ({
      id: `local-${car.make}-${car.model}-${car.year || 0}`,
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

    // 3. Deduplicate: DB cars have highest priority (real DB id), then memoryResults, then NHTSA
    const seen = new Set<string>();
    const mergedCars: any[] = [];

    // Helper key for deduplication
    const makeKey = (c: { make: string; model: string; year?: number | null }) =>
      `${c.make.toLowerCase().trim()}_${c.model.toLowerCase().trim()}_${c.year || 0}`;

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

// POST: Save an external car to the database when selected
export async function POST(req: Request) {
  try {
    const { make, model, year, tier, horsepower, country } = await req.json();

    if (!make || !model) {
      return NextResponse.json(
        { error: "Make and model are required" },
        { status: 400 }
      );
    }

    // Check if already exists
    const existing = await prisma.car.findUnique({
      where: {
        make_model_year: {
          make,
          model,
          year: year || 0,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ car: existing });
    }

    // Lookup metadata from local CARS_DATABASE if not provided
    const localMatch = CARS_DATABASE.find(
      (c) =>
        c.make.toLowerCase() === make.toLowerCase() &&
        c.model.toLowerCase() === model.toLowerCase() &&
        (year ? c.year === year : true)
    );

    // Create new car
    const car = await prisma.car.create({
      data: {
        make,
        model,
        year: year || null,
        tier: tier || localMatch?.tier || "common",
        horsepower: horsepower || localMatch?.horsepower || 0,
        country: country || localMatch?.country || "Unknown",
      },
    });

    return NextResponse.json({ car });
  } catch (error) {
    console.error("Failed to save external car:", error);
    return NextResponse.json(
      { error: "Failed to save car" },
      { status: 500 }
    );
  }
}

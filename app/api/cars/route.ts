import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    // Search both database and NHTSA simultaneously
    const [dbCars, nhtsaCars] = await Promise.all([
      // Database search
      (async () => {
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

        return prisma.car.findMany({
          where,
          take: limit,
          orderBy: [
            { tier: "desc" },
            { make: "asc" },
            { model: "asc" },
          ],
        });
      })(),
      // NHTSA API search (only if no filters applied)
      !tier && !make && !country ? searchNHTSA(query) : Promise.resolve([]),
    ]);

    // Merge results: DB first (higher quality), then NHTSA
    const mergedCars = [...dbCars, ...nhtsaCars].slice(0, limit);

    return NextResponse.json({ cars: mergedCars });
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
    const { make, model, year } = await req.json();

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

    // Create new car from external source
    const car = await prisma.car.create({
      data: {
        make,
        model,
        year: year || null,
        tier: "common",
        horsepower: 0,
        country: "Unknown",
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

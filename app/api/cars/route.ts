import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const tier = searchParams.get("tier") || "";
    const make = searchParams.get("make") || "";
    const country = searchParams.get("country") || "";
    const limit = parseInt(searchParams.get("limit") || "50");

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

    const cars = await prisma.car.findMany({
      where,
      take: limit,
      orderBy: [
        { tier: "desc" },
        { make: "asc" },
        { model: "asc" },
      ],
    });

    return NextResponse.json({ cars });
  } catch (error) {
    console.error("Car fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cars" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";

import {
  buildCollegeComparison,
  normalizeCollege,
} from "@/lib/compare-colleges";
import { prisma } from "@/lib/prisma";

const querySchema = z.object({
  ids: z.string().min(1),
});

const uuidSchema = z.string().uuid();

// GET /api/compare?ids=uuid1,uuid2,uuid3
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const idsParam = url.searchParams.get("ids") ?? url.searchParams.get("id") ?? "";

    const parsed = querySchema.safeParse({ ids: idsParam });
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Missing ids query parameter" },
        { status: 400 },
      );
    }

    const rawIds = parsed.data.ids
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (rawIds.length === 0) {
      return NextResponse.json(
        { error: "No ids provided" },
        { status: 400 },
      );
    }

    if (rawIds.length > 3) {
      return NextResponse.json(
        { error: "You can compare up to 3 colleges" },
        { status: 400 },
      );
    }

    const invalidIds = rawIds.filter((id) => !uuidSchema.safeParse(id).success);
    if (invalidIds.length > 0) {
      return NextResponse.json(
        { error: "Invalid ID format. Expected UUID.", invalidIds },
        { status: 400 },
      );
    }

    const uniqueIds = Array.from(new Set(rawIds));

    const colleges = await prisma.college.findMany({
      where: { id: { in: uniqueIds } },
      select: {
        id: true,
        name: true,
        fees: true,
        rating: true,
        highestPackage: true,
        averagePackage: true,
        city: true,
        state: true,
      },
    });

    const foundIds = new Set(colleges.map((c) => c.id));
    const missingIds = uniqueIds.filter((id) => !foundIds.has(id));
    if (missingIds.length > 0) {
      return NextResponse.json(
        { error: "One or more colleges not found", missingIds },
        { status: 404 },
      );
    }

    const orderedColleges = uniqueIds
      .map((id) => colleges.find((c) => c.id === id))
      .filter((c): c is (typeof colleges)[number] => Boolean(c))
      .map(normalizeCollege);

    const result = buildCollegeComparison(orderedColleges);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("/api/compare error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  getRecommendationConfig,
  normalizeCollegeForRecommendation,
  scoreAndRankColleges,
} from "@/lib/recommend-colleges";
import { prisma } from "@/lib/prisma";

const requestSchema = z.object({
  rank: z.number().positive("rank must be a positive number"),
  maxFees: z.number().positive("maxFees must be a positive number"),
  preferredLocation: z.string().trim().min(1).optional(),
});

// POST /api/recommend — score and rank colleges for a student profile
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid request body",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { rank, maxFees, preferredLocation } = parsed.data;

  try {
    const where: Prisma.CollegeWhereInput = {
      fees: { lte: maxFees },
    };

    if (preferredLocation) {
      where.OR = [
        { state: { contains: preferredLocation, mode: "insensitive" } },
        { city: { contains: preferredLocation, mode: "insensitive" } },
      ];
    }

    const colleges = await prisma.college.findMany({
      where,
      select: {
        id: true,
        fees: true,
        rating: true,
        highestPackage: true,
      },
    });

    if (colleges.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    const config = getRecommendationConfig();
    const normalized = colleges.map(normalizeCollegeForRecommendation);
    const recommendations = scoreAndRankColleges(
      normalized,
      { rank, maxFees, preferredLocation },
      config,
    );

    return NextResponse.json(recommendations, { status: 200 });
  } catch (error) {
    console.error("/api/recommend POST error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

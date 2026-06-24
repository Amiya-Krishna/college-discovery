import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const querySchema = z.object({
  q: z.string().trim().min(1).max(255).optional(),
  search: z.string().trim().min(1).max(255).optional(),
  name: z.string().trim().min(1).max(255).optional(),
  location: z.string().trim().min(1).max(100).optional(),
  state: z.string().trim().min(1).max(100).optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  minFees: z.coerce.number().min(0).optional(),
  maxFees: z.coerce.number().min(0).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const parsed = querySchema.safeParse(
      Object.fromEntries(url.searchParams.entries()),
    );

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          issues: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const {
      search,
      name,
      location,
      state,
      rating,
      minFees,
      maxFees,
      page,
      limit,
    } = parsed.data;

    const keyword = parsed.data.q ?? parsed.data.search ?? parsed.data.name;
    const resolvedLocation = location ?? state;

    if (minFees !== undefined && maxFees !== undefined && minFees > maxFees) {
      return NextResponse.json(
        { error: "minFees cannot be greater than maxFees" },
        { status: 400 },
      );
    }

    const where: Prisma.CollegeWhereInput = {};

    if (keyword) {
      where.name = { contains: keyword, mode: "insensitive" };
    }

    if (resolvedLocation) {
      where.OR = [
        { state: { contains: resolvedLocation, mode: "insensitive" } },
        { city: { contains: resolvedLocation, mode: "insensitive" } },
      ];
    }

    if (rating !== undefined) {
      where.rating = { gte: rating };
    }

    if (minFees !== undefined || maxFees !== undefined) {
      where.fees = {};

      if (minFees !== undefined) {
        where.fees.gte = minFees;
      }

      if (maxFees !== undefined) {
        where.fees.lte = maxFees;
      }
    }

    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
      prisma.college.count({ where }),
      prisma.college.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" },
      }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return NextResponse.json({ data, total, page, limit, totalPages });
  } catch (error) {
    console.error("/api/colleges error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

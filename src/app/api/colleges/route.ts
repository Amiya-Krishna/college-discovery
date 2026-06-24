import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

// ─── GET /api/colleges ────────────────────────────────────────────────────────
// List + filter colleges (same query contract as /api/colleges/search)

const listQuerySchema = z.object({
  search: z.string().trim().min(1).max(255).optional(),
  name: z.string().trim().min(1).max(255).optional(),
  location: z.string().trim().min(1).max(100).optional(),
  state: z.string().trim().min(1).max(100).optional(),
  city: z.string().trim().min(1).max(100).optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  minFees: z.coerce.number().min(0).optional(),
  maxFees: z.coerce.number().min(0).optional(),
  sortBy: z.enum(["name", "rating", "fees", "createdAt"]).default("name"),
  order: z.enum(["asc", "desc"]).default("asc"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const parsed = listQuerySchema.safeParse(
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
      city,
      rating,
      minFees,
      maxFees,
      sortBy,
      order,
      page,
      limit,
    } = parsed.data;

    const keyword = search ?? name;

    if (minFees !== undefined && maxFees !== undefined && minFees > maxFees) {
      return NextResponse.json(
        { error: "minFees cannot be greater than maxFees" },
        { status: 400 },
      );
    }

    const where: Prisma.CollegeWhereInput = {};
    const andFilters: Prisma.CollegeWhereInput[] = [];

    if (keyword) {
      andFilters.push({
        name: { contains: keyword, mode: "insensitive" },
      });
    }

    if (state) {
      andFilters.push({
        state: { contains: state, mode: "insensitive" },
      });
    }

    if (city) {
      andFilters.push({
        city: { contains: city, mode: "insensitive" },
      });
    }

    // Generic `location` matches either state or city
    if (location && !state && !city) {
      andFilters.push({
        OR: [
          { state: { contains: location, mode: "insensitive" } },
          { city: { contains: location, mode: "insensitive" } },
        ],
      });
    }

    if (rating !== undefined) {
      andFilters.push({ rating: { gte: rating } });
    }

    if (minFees !== undefined || maxFees !== undefined) {
      const feesFilter: Prisma.DecimalFilter<"College"> = {};
      if (minFees !== undefined) feesFilter.gte = minFees;
      if (maxFees !== undefined) feesFilter.lte = maxFees;
      andFilters.push({ fees: feesFilter });
    }

    if (andFilters.length > 0) {
      where.AND = andFilters;
    }

    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
      prisma.college.count({ where }),
      prisma.college.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
      }),
    ]);

    
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    console.error("/api/colleges GET error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// ─── POST /api/colleges ───────────────────────────────────────────────────────
// Create a new college

const createCollegeSchema = z.object({
  name: z.string().trim().min(2).max(255),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().min(1).max(100),
  fees: z.coerce.number().min(0),
  rating: z.coerce.number().min(0).max(5),
  highestPackage: z.coerce.number().min(0),
  averagePackage: z.coerce.number().min(0),
  overview: z.string().trim().min(1).max(2000),
});

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

  const parsed = createCollegeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid request body",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const college = await prisma.college.create({
      data: parsed.data,
    });

    return NextResponse.json({ data: college }, { status: 201 });
  } catch (error) {
    // Prisma unique-constraint violation (e.g. duplicate name)
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A college with these unique fields already exists" },
        { status: 409 },
      );
    }

    console.error("/api/colleges POST error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

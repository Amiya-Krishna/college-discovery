import { Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

type AuthTokenPayload = {
  userId: string;
  email?: string;
};

const saveCollegeSchema = z.object({
  collegeId: z.string().uuid(),
});

function parseCookies(cookieHeader: string | null) {
  if (!cookieHeader) return {} as Record<string, string>;
  return Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, ...v] = c.split("=");
      return [k.trim(), decodeURIComponent(v.join("="))];
    }),
  );
}

async function authenticate(req: Request) {
  const cookieHeader = req.headers.get("cookie");
  const cookies = parseCookies(cookieHeader);
  const token = cookies["token"];
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return null;
  try {
    const payload = jwt.verify(token, secret);
    if (typeof payload === "string") return null;

    return (payload as AuthTokenPayload).userId ?? null;
  } catch {
    return null;
  }
}

// GET /api/saved-colleges — list saved colleges for the authenticated user
export async function GET(req: Request) {
  try {
    const userId = await authenticate(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const saved = await prisma.savedCollege.findMany({
      where: { userId },
      include: { college: true },
      orderBy: { createdAt: "desc" },
    });

    const data = saved.map((s) => ({
      id: s.college.id,
      name: s.college.name,
      state: s.college.state,
      city: s.college.city,
      fees: s.college.fees,
      rating: s.college.rating,
      highestPackage: s.college.highestPackage,
      averagePackage: s.college.averagePackage,
      savedAt: s.createdAt,
    }));

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error("/api/saved-colleges GET error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// POST /api/saved-colleges — save a college
export async function POST(req: Request) {
  try {
    const userId = await authenticate(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = saveCollegeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "collegeId is required and must be a valid UUID",
        },
        { status: 400 },
      );
    }

    const { collegeId } = parsed.data;

    const college = await prisma.college.findUnique({
      where: { id: collegeId },
    });
    if (!college) {
      return NextResponse.json(
        { success: false, error: "College not found" },
        { status: 404 },
      );
    }

    try {
      const saved = await prisma.savedCollege.create({
        data: {
          user: { connect: { id: userId } },
          college: { connect: { id: collegeId } },
        },
      });

      return NextResponse.json(
        { success: true, data: saved },
        { status: 201 },
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return NextResponse.json(
          { success: false, error: "College already saved" },
          { status: 409 },
        );
      }

      throw error;
    }
  } catch (error) {
    console.error("/api/saved-colleges POST error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

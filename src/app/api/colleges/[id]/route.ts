import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const uuidSchema = z.string().uuid();

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }   
) {
  const { id } = await params;                       

  if (!uuidSchema.safeParse(id).success) {
    return NextResponse.json(
      { error: "Invalid college ID format" },
      { status: 400 }
    );
  }

  try {
    const college = await prisma.college.findUnique({
      where: { id },
      include: { courses: true, reviews: true },
    });

    if (!college) {
      return NextResponse.json(
        { error: "College not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: college });
  } catch (error) {
    console.error("/api/colleges/[id] error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
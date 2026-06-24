import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const colleges = await prisma.college.findMany({
    select: { id: true, name: true },
  });

  return NextResponse.json(colleges);
}
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {

    const count = await prisma.college.count();

    const colleges = await prisma.college.findMany({
      take: 5,
    });

    return NextResponse.json({
      success: true,
      count,
      colleges,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}

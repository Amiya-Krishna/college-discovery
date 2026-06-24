import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

const signupSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(6).max(128),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Signup body received:", body);

    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      console.log("Signup validation error:", JSON.stringify(parsed.error.flatten(), null, 2));
      return NextResponse.json(
        { success: false, error: "Invalid input. Check name, email and password." },
        { status: 422 },
      );
    }

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Email already registered" },
        { status: 409 },
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashed },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json({ success: true, user }, { status: 201 });
    
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { success: false, error: "Email already registered" },
        { status: 409 },
      );
    }

    console.error("/api/auth/signup error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

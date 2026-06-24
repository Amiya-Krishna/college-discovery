import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(6).max(128),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

  const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password format." },
        { status: 422 }
      );
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET not set");
      return NextResponse.json({ success: false, error: "Server misconfiguration" }, { status: 500 });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, secret, { expiresIn: "7d" });
    const isSecureRequest =
      new URL(req.url).protocol === "https:" ||
      req.headers.get("x-forwarded-proto") === "https";

    const res = NextResponse.json(
      { success: true, user: { id: user.id, name: user.name, email: user.email } },
      { status: 200 }
    );

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: isSecureRequest,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error) {
    console.error("/api/auth/login error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

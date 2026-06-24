import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

type AuthTokenPayload = {
  userId: string;
  email?: string;
};

const collegeIdSchema = z.string().uuid();

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

// DELETE /api/saved-colleges/:collegeId — unsave a college
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ collegeId: string }> },
) {
  try {
    const userId = await authenticate(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { collegeId } = await params;

    if (!collegeIdSchema.safeParse(collegeId).success) {
      return NextResponse.json(
        { success: false, error: "collegeId must be a valid UUID" },
        { status: 400 },
      );
    }

    const existing = await prisma.savedCollege.findUnique({
      where: { userId_collegeId: { userId, collegeId } },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Saved college not found" },
        { status: 404 },
      );
    }

    await prisma.savedCollege.delete({
      where: { userId_collegeId: { userId, collegeId } },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("/api/saved-colleges/[collegeId] DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

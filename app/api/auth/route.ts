import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const AUTH_COOKIE = "deckhengst_auth";

export async function POST(request: Request) {
  const { password } = await request.json();
  const correctPassword = process.env.DECK_PASSWORD;

  if (!correctPassword) {
    return NextResponse.json({ error: "No password configured" }, { status: 500 });
  }

  if (password !== correctPassword) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, password, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
  return NextResponse.json({ ok: true });
}

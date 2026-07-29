"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function createSession(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  
  cookieStore.set("access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day for access token
  });

  cookieStore.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days for refresh token
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
  redirect("/login");
}

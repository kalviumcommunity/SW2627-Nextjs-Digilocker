"use server";

import { cookies } from "next/headers.js";
import { redirect } from "next/navigation.js";
import {
  authenticateUser,
  createSessionToken,
  createUser,
  getSessionCookieName,
  getSessionCookieOptions,
} from "../../lib/auth.js";
import { signIn, signOut } from "../../auth.js";

function readFormValue(formData, name) {
  const value = formData?.get(name);
  return typeof value === "string" ? value : "";
}

async function startSession(user) {
  const cookieStore = await cookies();
  cookieStore.set(getSessionCookieName(), createSessionToken(user), getSessionCookieOptions());
}

export async function signInWithGoogle() {
  await signIn("google", { redirectTo: "/dashboard" });
}

export async function register(formData) {
  const user = await createUser({
    name: readFormValue(formData, "name"),
    email: readFormValue(formData, "email"),
    password: readFormValue(formData, "password"),
  });
  await startSession(user);
  redirect("/dashboard");
}

export async function login(formData) {
  const user = await authenticateUser({
    email: readFormValue(formData, "email"),
    password: readFormValue(formData, "password"),
  });
  await startSession(user);
  redirect("/dashboard");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.set(getSessionCookieName(), "", {
    ...getSessionCookieOptions(),
    maxAge: 0,
  });
  try {
    await signOut({ redirect: false });
  } catch {
    // Graceful no-op when NextAuth session is inactive
  }
  redirect("/login");
}

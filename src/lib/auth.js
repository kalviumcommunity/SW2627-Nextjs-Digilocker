import bcrypt from "bcrypt";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers.js";
import { env } from "./env.js";

const SESSION_COOKIE = "digilocker-session";
const BCRYPT_ROUNDS = 12;
const usersByEmail = new Map();

function getSessionSecret() {
  const secret = env.AUTH_SECRET || process.env.AUTH_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET is required in production.");
  }
  return "local-development-auth-secret";
}

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function sign(payload) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

export function createSessionToken(user) {
  const payload = encode({
    userId: user.id,
    email: user.email,
    expiresAt: Date.now() + env.AUTH_SESSION_EXPIRY_SECONDS * 1000,
  });
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token) {
  if (typeof token !== "string") return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expectedSignature = sign(payload);
  const received = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!session.userId || !session.email || session.expiresAt <= Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

export function validateCredentials({ email, password }) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    throw new Error("A valid email address is required.");
  }
  if (typeof password !== "string" || password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }
  return { email: normalizedEmail, password };
}

export async function createUser({ email, password, name }) {
  const credentials = validateCredentials({ email, password });
  if (usersByEmail.has(credentials.email)) {
    throw new Error("An account with this email already exists.");
  }

  const user = {
    id: randomUUID(),
    email: credentials.email,
    name: typeof name === "string" && name.trim() ? name.trim() : credentials.email,
    passwordHash: await bcrypt.hash(credentials.password, BCRYPT_ROUNDS),
  };
  usersByEmail.set(user.email, user);
  return { id: user.id, email: user.email, name: user.name };
}

export async function authenticateUser({ email, password }) {
  const credentials = validateCredentials({ email, password });
  const user = usersByEmail.get(credentials.email);
  const passwordHash = user?.passwordHash || "$2b$12$ invalid-password-hash";
  const passwordMatches = await bcrypt.compare(credentials.password, passwordHash);
  if (!user || !passwordMatches) {
    throw new Error("Invalid email or password.");
  }
  return { id: user.id, email: user.email, name: user.name };
}

export function findOrCreateGoogleUser({ id, email, name, image }) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;

  const existing = usersByEmail.get(normalizedEmail);
  if (existing) {
    if (!existing.name && name) {
      existing.name = name;
    }
    if (!existing.image && image) {
      existing.image = image;
    }
    return existing;
  }

  const newUser = {
    id: id || randomUUID(),
    email: normalizedEmail,
    name: typeof name === "string" && name.trim() ? name.trim() : normalizedEmail,
    provider: "google",
    image: image || null,
  };
  usersByEmail.set(normalizedEmail, newUser);
  return newUser;
}

export async function getCurrentUser() {
  try {
    const { auth } = await import("../auth.js");
    const nextAuthSession = await auth();
    if (nextAuthSession?.user?.email) {
      const email = normalizeEmail(nextAuthSession.user.email);
      let user = usersByEmail.get(email);
      if (!user) {
        user = findOrCreateGoogleUser({
          id: nextAuthSession.user.id,
          email,
          name: nextAuthSession.user.name,
          image: nextAuthSession.user.image,
        });
      }
      return user;
    }
  } catch {
    // Graceful fallback when outside NextAuth context or when NextAuth session is inactive
  }

  try {
    const cookieStore = await cookies();
    const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
    if (!session) return null;
    return usersByEmail.get(session.email) || null;
  } catch {
    return null;
  }
}

export function getSessionCookieName() {
  return SESSION_COOKIE;
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: env.AUTH_SESSION_EXPIRY_SECONDS,
  };
}

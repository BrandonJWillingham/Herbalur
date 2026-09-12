import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "herbalur_admin_session";

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    throw new Error(
      "ADMIN_SESSION_SECRET is missing from environment variables."
    );
  }

  return new TextEncoder().encode(secret);
}

export async function createAdminSession() {
  const secret = getSessionSecret();

  const token = await new SignJWT({
    role: "admin",
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);

  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();

  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return false;
  }

  try {
    const secret = getSessionSecret();

    const { payload } = await jwtVerify(token, secret);

    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function requireAdmin() {
  const authenticated = await isAdmin();

  if (!authenticated) {
    redirect("/admin/login");
  }
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();

  cookieStore.delete(COOKIE_NAME);
}
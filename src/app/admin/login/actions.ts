"use server";

import { redirect } from "next/navigation";
import {
  createAdminSession,
  destroyAdminSession,
} from "@/lib/admin-auth";

export async function loginAdmin(formData: FormData) {
  const password = formData.get("password");

  if (typeof password !== "string" || password.length === 0) {
    redirect("/admin/login?error=missing");
  }

  const adminPassword = process.env.ADMIN_PASSWORD;

  console.log("ADMIN LOGIN DEBUG:", {
    envExists: Boolean(adminPassword),
    envLength: adminPassword?.length,
    enteredLength: password.length,
    matches: password === adminPassword,
  });

  if (!adminPassword) {
    throw new Error("ADMIN_PASSWORD is missing from environment variables.");
  }

  if (password !== adminPassword) {
    redirect("/admin/login?error=invalid");
  }

  await createAdminSession();

  redirect("/admin");
}

export async function logoutAdmin() {
  await destroyAdminSession();
  redirect("/admin/login");
}
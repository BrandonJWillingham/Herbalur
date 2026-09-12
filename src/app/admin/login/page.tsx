import { redirect } from "next/navigation";

import { loginAdmin } from "./actions";
import { isAdmin } from "@/lib/admin-auth";

type AdminLoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const authenticated = await isAdmin();

  if (authenticated) {
    redirect("/admin");
  }

  const params = await searchParams;

  const error = params.error;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f4ef] px-5">
      <div className="w-full max-w-md rounded-2xl border border-[#dfdbd3] bg-white p-8 shadow-sm">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7c776f]">
            Herbalur
          </p>

          <h1 className="mt-2 font-serif text-3xl text-[#26432c]">
            Admin Dashboard
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#67635d]">
            Enter the administrator password to continue.
          </p>
        </div>

        {error === "invalid" && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Incorrect password.
          </div>
        )}

        {error === "missing" && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Please enter a password.
          </div>
        )}

        <form
          action={loginAdmin}
          className="mt-8 space-y-5"
        >
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-[#343630]"
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-[#d8d4cd] bg-white px-4 py-3 text-[#252823] outline-none transition focus:border-[#26432c]"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-[#26432c] px-5 py-3 font-medium text-white transition hover:bg-[#1d3522]"
          >
            Sign in
          </button>
        </form>
      </div>
    </main>
  );
}
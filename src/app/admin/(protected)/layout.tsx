import Link from "next/link";

import { requireAdmin } from "@/lib/admin-auth";
import { logoutAdmin } from "../login/actions";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-[#f7f4ef] pt-1">
      <header className="border-b border-[#dfdbd3] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-8">
            <Link
              href="/admin"
              className="font-serif text-2xl text-[#26432c]"
            >
              Herbalur Admin
            </Link>

            <nav className="hidden items-center gap-5 md:flex">
              <Link
                href="/admin"
                className="text-sm text-[#555851] hover:text-[#26432c]"
              >
                Dashboard
              </Link>

              <Link
                href="/admin/orders"
                className="text-sm text-[#555851] hover:text-[#26432c]"
              >
                Orders
              </Link>
            </nav>
          </div>

          <form action={logoutAdmin}>
            <button
              type="submit"
              className="rounded-lg border border-[#d8d4cd] px-4 py-2 text-sm text-[#454741] transition hover:bg-[#f5f2ed]"
            >
              Log out
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-10">
        {children}
      </div>
    </div>
  );
}
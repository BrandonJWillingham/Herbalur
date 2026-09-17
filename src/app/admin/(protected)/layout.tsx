import Link from "next/link";

import { requireAdmin } from "@/lib/admin-auth";
import { logoutAdmin } from "../login/actions";

const adminLinks = [
  {
    href: "/admin",
    label: "Dashboard",
  },
  {
    href: "/admin/orders",
    label: "Orders",
  },
  {
    href: "/admin/products",
    label: "Products",
  },
  {
    href: "/admin/analytics",
    label: "Analytics",
  },
  {
    href: "/admin/customers",
    label: "Customers",
  },
];

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-[#f7f4ef]">
      <header className="border-b border-[#dfdbd3] bg-white">
        {/* Top header */}
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link
            href="/admin"
            className="font-serif text-2xl text-[#26432c]"
          >
            Herbalur Admin
          </Link>

          <form action={logoutAdmin}>
            <button
              type="submit"
              className="rounded-lg border border-[#d8d4cd] px-4 py-2 text-sm text-[#454741] transition hover:bg-[#f5f2ed]"
            >
              Log out
            </button>
          </form>
        </div>

        {/* Admin navigation */}
        <div className="border-t border-[#ece8e1]">
          <nav className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-5 py-2 sm:px-8">
            {adminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-[#555851] transition hover:bg-[#f7f4ef] hover:text-[#26432c]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-10">
        {children}
      </main>
    </div>
  );
}
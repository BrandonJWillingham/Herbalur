import Link from "next/link";

import { prisma } from "@/lib/prisma";

const SUCCESSFUL_ORDER_STATUSES = [
  "paid",
  "completed",
  "complete",
  "succeeded",
  "fulfilled",
];

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getStatusClasses(status: string) {
  const normalizedStatus = status.toLowerCase();

  if (
    normalizedStatus === "paid" ||
    normalizedStatus === "completed" ||
    normalizedStatus === "complete" ||
    normalizedStatus === "succeeded" ||
    normalizedStatus === "fulfilled"
  ) {
    return "bg-[#e8f1e9] text-[#26432c]";
  }

  if (normalizedStatus === "pending") {
    return "bg-[#f6efd9] text-[#765d1c]";
  }

  if (
    normalizedStatus === "cancelled" ||
    normalizedStatus === "canceled" ||
    normalizedStatus === "failed"
  ) {
    return "bg-[#f6e6e3] text-[#8a352e]";
  }

  return "bg-[#f0ede7] text-[#57544f]";
}

export default async function AdminDashboardPage() {
  const thirtyDaysAgo = new Date();

  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    successfulOrders,
    successfulOrdersLast30Days,
    totalOrders,
    pendingOrders,
    customerCount,
    subscriberCount,
    productCount,
    lowStockProducts,
    recentOrders,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: {
        status: {
          in: SUCCESSFUL_ORDER_STATUSES,
        },
      },
      _sum: {
        total: true,
      },
      _count: {
        _all: true,
      },
    }),

    prisma.order.aggregate({
      where: {
        status: {
          in: SUCCESSFUL_ORDER_STATUSES,
        },
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _sum: {
        total: true,
      },
      _count: {
        _all: true,
      },
    }),

    prisma.order.count(),

    prisma.order.count({
      where: {
        status: "pending",
      },
    }),

    prisma.user.count(),

    prisma.newsletterSubscriber.count(),

    prisma.product.count(),

    prisma.product.findMany({
      where: {
        inventory: {
          lte: 5,
        },
      },
      take: 6,
      orderBy: [
        {
          inventory: "asc",
        },
        {
          name: "asc",
        },
      ],
      select: {
        id: true,
        name: true,
        slug: true,
        inventory: true,
        price: true,
      },
    }),

    prisma.order.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        customerEmail: true,
        status: true,
        total: true,
        createdAt: true,
        shipping: {
          select: {
            status: true,
            labelUrl: true,
          },
        },
        items: {
          select: {
            id: true,
            quantity: true,
          },
        },
      },
    }),
  ]);

  const totalRevenue = successfulOrders._sum.total ?? 0;

  const last30DaysRevenue =
    successfulOrdersLast30Days._sum.total ?? 0;

  const successfulOrderCount =
    successfulOrders._count._all;

  const lowStockCount = lowStockProducts.filter(
    (product) => product.inventory > 0
  ).length;

  const outOfStockCount = lowStockProducts.filter(
    (product) => product.inventory <= 0
  ).length;

  return (
    <main className="pb-12">
      {/* Heading */}
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7b776f]">
            Herbalur Admin
          </p>

          <h1 className="mt-2 font-serif text-4xl text-[#26432c]">
            Dashboard
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-[#68645e]">
            An overview of store performance, customers, orders,
            and inventory.
          </p>
        </div>

        <Link
          href="/admin/analytics"
          className="inline-flex w-fit items-center justify-center rounded-lg bg-[#26432c] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1d3522]"
        >
          View analytics
        </Link>
      </div>

      {/* Primary metrics */}
      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-[#dfdbd3] bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#88837c]">
            Total Sales
          </p>

          <p className="mt-3 font-serif text-3xl text-[#26432c]">
            {formatMoney(totalRevenue)}
          </p>

          <p className="mt-2 text-xs text-[#7b776f]">
            From {successfulOrderCount} successful{" "}
            {successfulOrderCount === 1 ? "order" : "orders"}
          </p>
        </div>

        <div className="rounded-xl border border-[#dfdbd3] bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#88837c]">
            Last 30 Days
          </p>

          <p className="mt-3 font-serif text-3xl text-[#26432c]">
            {formatMoney(last30DaysRevenue)}
          </p>

          <p className="mt-2 text-xs text-[#7b776f]">
            {successfulOrdersLast30Days._count._all} successful{" "}
            {successfulOrdersLast30Days._count._all === 1
              ? "order"
              : "orders"}
          </p>
        </div>

        <div className="rounded-xl border border-[#dfdbd3] bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#88837c]">
            Customers
          </p>

          <p className="mt-3 font-serif text-3xl text-[#26432c]">
            {customerCount.toLocaleString()}
          </p>

          <p className="mt-2 text-xs text-[#7b776f]">
            Customer records
          </p>
        </div>

        <div className="rounded-xl border border-[#dfdbd3] bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#88837c]">
            Subscribers
          </p>

          <p className="mt-3 font-serif text-3xl text-[#26432c]">
            {subscriberCount.toLocaleString()}
          </p>

          <p className="mt-2 text-xs text-[#7b776f]">
            Newsletter subscribers
          </p>
        </div>
      </section>

      {/* Secondary overview */}
      <section className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[#dfdbd3] bg-[#f8f6f2] p-5">
          <p className="text-sm text-[#68645e]">
            Total orders
          </p>

          <p className="mt-2 font-serif text-2xl text-[#26432c]">
            {totalOrders.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border border-[#dfdbd3] bg-[#f8f6f2] p-5">
          <p className="text-sm text-[#68645e]">
            Pending orders
          </p>

          <p className="mt-2 font-serif text-2xl text-[#26432c]">
            {pendingOrders.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border border-[#dfdbd3] bg-[#f8f6f2] p-5">
          <p className="text-sm text-[#68645e]">
            Products
          </p>

          <p className="mt-2 font-serif text-2xl text-[#26432c]">
            {productCount.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border border-[#dfdbd3] bg-[#f8f6f2] p-5">
          <p className="text-sm text-[#68645e]">
            Inventory alerts
          </p>

          <p className="mt-2 font-serif text-2xl text-[#26432c]">
            {lowStockProducts.length}
          </p>

          <p className="mt-1 text-xs text-[#88837c]">
            {lowStockCount} low · {outOfStockCount} out
          </p>
        </div>
      </section>

      {/* Quick navigation */}
      <section className="mt-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7b776f]">
            Management
          </p>

          <h2 className="mt-2 font-serif text-2xl text-[#26432c]">
            Quick access
          </h2>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Link
            href="/admin/orders"
            className="group rounded-xl border border-[#dfdbd3] bg-white p-5 transition hover:border-[#26432c]"
          >
            <p className="font-medium text-[#343630]">
              Orders
            </p>

            <p className="mt-2 text-sm text-[#68645e]">
              Fulfill orders, create labels, and print packing slips.
            </p>

            <p className="mt-4 text-sm font-medium text-[#26432c]">
              Manage orders →
            </p>
          </Link>

          <Link
            href="/admin/customer"
            className="group rounded-xl border border-[#dfdbd3] bg-white p-5 transition hover:border-[#26432c]"
          >
            <p className="font-medium text-[#343630]">
              Customers
            </p>

            <p className="mt-2 text-sm text-[#68645e]">
              Search customers and view their purchase history.
            </p>

            <p className="mt-4 text-sm font-medium text-[#26432c]">
              View customers →
            </p>
          </Link>

          <Link
            href="/admin/products"
            className="group rounded-xl border border-[#dfdbd3] bg-white p-5 transition hover:border-[#26432c]"
          >
            <p className="font-medium text-[#343630]">
              Inventory
            </p>

            <p className="mt-2 text-sm text-[#68645e]">
              Manage products, prices, and available inventory.
            </p>

            <p className="mt-4 text-sm font-medium text-[#26432c]">
              Manage inventory →
            </p>
          </Link>

          <Link
            href="/admin/analytics"
            className="group rounded-xl border border-[#dfdbd3] bg-white p-5 transition hover:border-[#26432c]"
          >
            <p className="font-medium text-[#343630]">
              Analytics
            </p>

            <p className="mt-2 text-sm text-[#68645e]">
              Review traffic, conversions, products, and campaigns.
            </p>

            <p className="mt-4 text-sm font-medium text-[#26432c]">
              Open analytics →
            </p>
          </Link>
        </div>
      </section>

      {/* Main lower grid */}
      <section className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        {/* Recent orders */}
        <div className="rounded-xl border border-[#dfdbd3] bg-white">
          <div className="flex items-center justify-between border-b border-[#ece8e1] p-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#88837c]">
                Activity
              </p>

              <h2 className="mt-1 font-serif text-2xl text-[#26432c]">
                Recent orders
              </h2>
            </div>

            <Link
              href="/admin/orders"
              className="text-sm font-medium text-[#26432c] hover:underline hover:underline-offset-4"
            >
              View all
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-6 text-sm text-[#68645e]">
              No orders have been placed yet.
            </div>
          ) : (
            <div className="divide-y divide-[#ece8e1]">
              {recentOrders.map((order) => {
                const itemCount = order.items.reduce(
                  (total, item) => total + item.quantity,
                  0
                );

                return (
                  <div
                    key={order.id}
                    className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-[#343630]">
                          #{order.id.slice(-8)}
                        </p>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs capitalize ${getStatusClasses(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <p className="mt-1 truncate text-sm text-[#68645e]">
                        {order.customerEmail ?? "No customer email"}
                      </p>

                      <p className="mt-1 text-xs text-[#88837c]">
                        {formatDate(order.createdAt)} · {itemCount}{" "}
                        {itemCount === 1 ? "item" : "items"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-5 sm:flex-col sm:items-end sm:justify-center">
                      <p className="font-serif text-lg text-[#26432c]">
                        {formatMoney(order.total)}
                      </p>

                      <Link
                        href={`/admin/orders`}
                        className="text-xs font-medium text-[#68645e] hover:text-[#26432c]"
                      >
                        View order →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Inventory */}
        <div className="rounded-xl border border-[#dfdbd3] bg-white">
          <div className="flex items-center justify-between border-b border-[#ece8e1] p-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#88837c]">
                Inventory
              </p>

              <h2 className="mt-1 font-serif text-2xl text-[#26432c]">
                Stock alerts
              </h2>
            </div>

            <Link
              href="/admin/inventory"
              className="text-sm font-medium text-[#26432c] hover:underline hover:underline-offset-4"
            >
              View all
            </Link>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="p-6">
              <p className="text-sm text-[#68645e]">
                Everything is stocked.
              </p>

              <p className="mt-1 text-xs text-[#88837c]">
                No products have 5 or fewer units remaining.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#ece8e1]">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between gap-4 p-5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#343630]">
                      {product.name}
                    </p>

                    <p className="mt-1 text-xs text-[#88837c]">
                      {formatMoney(product.price)}
                    </p>
                  </div>

                  {product.inventory <= 0 ? (
                    <span className="shrink-0 rounded-full bg-[#f6e6e3] px-3 py-1 text-xs font-medium text-[#8a352e]">
                      Out of stock
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-[#f6efd9] px-3 py-1 text-xs font-medium text-[#765d1c]">
                      {product.inventory} left
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
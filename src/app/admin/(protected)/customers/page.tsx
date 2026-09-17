// app/admin/(protected)/customer/page.tsx

import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CUSTOMERS_PER_PAGE = 25;

const SUCCESSFUL_ORDER_STATUSES = [
  "paid",
  "completed",
  "complete",
  "succeeded",
  "fulfilled",
];

type CustomerPageProps = {
  searchParams: Promise<{
    q?: string;
    sort?: string;
    filter?: string;
    page?: string;
  }>;
};

type CustomerRecord = {
  key: string;

  userId?: string;

  firstName?: string | null;
  lastName?: string | null;

  email?: string | null;
  phone?: string | null;

  createdAt: Date;
  lastActivityAt: Date;

  totalOrders: number;
  paidOrders: number;

  totalSpent: number;

  lastOrderAt?: Date;

  newsletterSubscriber: boolean;

  sources: Set<string>;
};

export default async function CustomersPage({
  searchParams,
}: CustomerPageProps) {
  const params = await searchParams;

  const query = params.q?.trim().toLowerCase() ?? "";
  const sort = params.sort ?? "recent";
  const filter = params.filter ?? "all";

  /*
   * ============================================================
   * PAGINATION INPUT
   * ============================================================
   */

  const requestedPage = Number(params.page ?? "1");

  const currentPage =
    Number.isFinite(requestedPage) && requestedPage > 0
      ? Math.floor(requestedPage)
      : 1;

  /*
   * ============================================================
   * LOAD CUSTOMER DATA
   * ============================================================
   */

  const [users, orders, subscribers] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        createdAt: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.order.findMany({
      select: {
        id: true,
        userId: true,
        customerEmail: true,
        status: true,
        total: true,
        createdAt: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.newsletterSubscriber.findMany({
      select: {
        email: true,
        createdAt: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  /*
   * ============================================================
   * BUILD CUSTOMER MAP
   *
   * We merge:
   *
   * User
   * Guest Order
   * NewsletterSubscriber
   *
   * by email whenever possible.
   * ============================================================
   */

  const customers = new Map<string, CustomerRecord>();

  /*
   * Separate lookup so we don't have to search every customer
   * whenever an order contains a userId.
   */
  const customersByUserId = new Map<string, CustomerRecord>();

  /*
   * ============================================================
   * REGISTERED USERS
   * ============================================================
   */

  for (const user of users) {
    const normalizedEmail = normalizeEmail(user.email);

    const key = normalizedEmail
      ? `email:${normalizedEmail}`
      : `user:${user.id}`;

    const customer: CustomerRecord = {
      key,

      userId: user.id,

      firstName: user.firstName,
      lastName: user.lastName,

      email: user.email,
      phone: user.phone,

      createdAt: user.createdAt,
      lastActivityAt: user.createdAt,

      totalOrders: 0,
      paidOrders: 0,
      totalSpent: 0,

      newsletterSubscriber: false,

      sources: new Set(["Account"]),
    };

    customers.set(key, customer);
    customersByUserId.set(user.id, customer);
  }

  /*
   * ============================================================
   * ORDERS
   * ============================================================
   */

  for (const order of orders) {
    let customer: CustomerRecord | undefined;

    /*
     * First match a registered account.
     */
    if (order.userId) {
      customer = customersByUserId.get(order.userId);
    }

    /*
     * Otherwise try matching by email.
     */
    if (!customer && order.customerEmail) {
      const normalizedEmail = normalizeEmail(
        order.customerEmail
      );

      if (normalizedEmail) {
        customer = customers.get(
          `email:${normalizedEmail}`
        );
      }
    }

    /*
     * Guest customer that doesn't exist yet.
     */
    if (!customer) {
      const normalizedEmail = normalizeEmail(
        order.customerEmail
      );

      const key = normalizedEmail
        ? `email:${normalizedEmail}`
        : `order:${order.id}`;

      customer = {
        key,

        email: order.customerEmail,

        createdAt: order.createdAt,
        lastActivityAt: order.createdAt,

        totalOrders: 0,
        paidOrders: 0,
        totalSpent: 0,

        newsletterSubscriber: false,

        sources: new Set([
          order.userId
            ? "Account"
            : "Guest Checkout",
        ]),
      };

      customers.set(key, customer);

      if (order.userId) {
        customersByUserId.set(
          order.userId,
          customer
        );
      }
    }

    customer.sources.add(
      order.userId
        ? "Account"
        : "Guest Checkout"
    );

    customer.totalOrders += 1;

    /*
     * Only count successful orders toward money spent.
     */
    if (isSuccessfulOrder(order.status)) {
      customer.paidOrders += 1;
      customer.totalSpent += order.total;
    }

    /*
     * Update last order.
     */
    if (
      !customer.lastOrderAt ||
      order.createdAt > customer.lastOrderAt
    ) {
      customer.lastOrderAt = order.createdAt;
    }

    /*
     * Update last activity.
     */
    if (
      order.createdAt >
      customer.lastActivityAt
    ) {
      customer.lastActivityAt =
        order.createdAt;
    }

    /*
     * Preserve earliest known date for the customer.
     */
    if (
      order.createdAt <
      customer.createdAt
    ) {
      customer.createdAt =
        order.createdAt;
    }
  }

  /*
   * ============================================================
   * NEWSLETTER SUBSCRIBERS
   * ============================================================
   */

  for (const subscriber of subscribers) {
    const normalizedEmail = normalizeEmail(
      subscriber.email
    );

    if (!normalizedEmail) {
      continue;
    }

    const key = `email:${normalizedEmail}`;

    let customer = customers.get(key);

    if (!customer) {
      customer = {
        key,

        email: subscriber.email,

        createdAt: subscriber.createdAt,
        lastActivityAt: subscriber.createdAt,

        totalOrders: 0,
        paidOrders: 0,
        totalSpent: 0,

        newsletterSubscriber: true,

        sources: new Set(["Newsletter"]),
      };

      customers.set(key, customer);
    } else {
      customer.newsletterSubscriber = true;
      customer.sources.add("Newsletter");

      if (
        subscriber.createdAt <
        customer.createdAt
      ) {
        customer.createdAt =
          subscriber.createdAt;
      }
    }
  }

  /*
   * ============================================================
   * COMPLETE CUSTOMER LIST
   * ============================================================
   */

  const allCustomers = Array.from(
    customers.values()
  );

  let customerList = [...allCustomers];

  /*
   * ============================================================
   * SEARCH
   * ============================================================
   */

  if (query) {
    customerList = customerList.filter(
      (customer) => {
        const searchable = [
          customer.firstName,
          customer.lastName,
          customer.email,
          customer.phone,
          getFullName(customer),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchable.includes(query);
      }
    );
  }

  /*
   * ============================================================
   * FILTERS
   * ============================================================
   */

  if (filter === "customers") {
    customerList = customerList.filter(
      (customer) =>
        customer.paidOrders > 0
    );
  }

  if (filter === "repeat") {
    customerList = customerList.filter(
      (customer) =>
        customer.paidOrders >= 2
    );
  }

  if (filter === "newsletter") {
    customerList = customerList.filter(
      (customer) =>
        customer.newsletterSubscriber
    );
  }

  if (filter === "leads") {
    customerList = customerList.filter(
      (customer) =>
        customer.paidOrders === 0
    );
  }

  /*
   * ============================================================
   * SORTING
   * ============================================================
   */

  customerList.sort((a, b) => {
    switch (sort) {
      case "spent":
        return b.totalSpent - a.totalSpent;

      case "orders":
        return b.paidOrders - a.paidOrders;

      case "oldest":
        return (
          a.createdAt.getTime() -
          b.createdAt.getTime()
        );

      case "name":
        return getCustomerDisplayName(
          a
        ).localeCompare(
          getCustomerDisplayName(b)
        );

      case "recent":
      default:
        return (
          b.lastActivityAt.getTime() -
          a.lastActivityAt.getTime()
        );
    }
  });

  /*
   * ============================================================
   * PAGINATION
   * ============================================================
   *
   * Pagination happens AFTER search/filter/sort so the user sees
   * pages from the exact results they requested.
   */

  const totalResults = customerList.length;

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalResults / CUSTOMERS_PER_PAGE
    )
  );

  /*
   * Prevent invalid URLs like ?page=99999 from breaking
   * the customer table.
   */
  const safePage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safePage - 1) *
    CUSTOMERS_PER_PAGE;

  const endIndex =
    startIndex +
    CUSTOMERS_PER_PAGE;

  const paginatedCustomers =
    customerList.slice(
      startIndex,
      endIndex
    );

  /*
   * ============================================================
   * DASHBOARD STATS
   * ============================================================
   */

  const payingCustomers =
    allCustomers.filter(
      (customer) =>
        customer.paidOrders > 0
    );

  const repeatCustomers =
    allCustomers.filter(
      (customer) =>
        customer.paidOrders >= 2
    );

  const totalRevenue =
    payingCustomers.reduce(
      (sum, customer) =>
        sum + customer.totalSpent,
      0
    );

  const averageCustomerValue =
    payingCustomers.length > 0
      ? totalRevenue /
        payingCustomers.length
      : 0;

  const repeatCustomerRate =
    payingCustomers.length > 0
      ? (repeatCustomers.length /
          payingCustomers.length) *
        100
      : 0;

  return (
    <main className="min-h-screen bg-[#f7f5f0] px-4 py-8 text-[#282924] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <header className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#847e75]">
            Herbalur Admin
          </p>

          <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-serif text-4xl text-[#214f32]">
                Customers
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#706b63]">
                View customers, guest buyers,
                newsletter subscribers and
                purchase history.
              </p>
            </div>

            <div className="text-sm text-[#777169]">
              {formatNumber(
                allCustomers.length
              )}{" "}
              contacts
            </div>
          </div>
        </header>

        {/* =====================================================
            KPI CARDS
        ====================================================== */}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Paying Customers"
            value={formatNumber(
              payingCustomers.length
            )}
            subtitle={`${formatNumber(
              allCustomers.length
            )} total contacts`}
          />

          <StatCard
            title="Repeat Customers"
            value={formatNumber(
              repeatCustomers.length
            )}
            subtitle={`${repeatCustomerRate.toFixed(
              1
            )}% repeat customer rate`}
          />

          <StatCard
            title="Customer Revenue"
            value={formatCurrency(
              totalRevenue
            )}
            subtitle="Lifetime successful orders"
          />

          <StatCard
            title="Avg. Customer Value"
            value={formatCurrency(
              averageCustomerValue
            )}
            subtitle="Revenue per paying customer"
          />
        </section>

        {/* =====================================================
            SEARCH / FILTERS
        ====================================================== */}

        <section className="mt-8 rounded-2xl border border-[#ded9cf] bg-white p-4 sm:p-5">
          <form
            method="GET"
            className="flex flex-col gap-4 lg:flex-row lg:items-end"
          >
            <div className="flex-1">
              <label
                htmlFor="q"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-[#777169]"
              >
                Search customers
              </label>

              <input
                id="q"
                name="q"
                type="search"
                defaultValue={params.q}
                placeholder="Name, email or phone..."
                className="h-11 w-full rounded-xl border border-[#dcd7ce] bg-[#faf9f6] px-4 text-sm outline-none transition placeholder:text-[#aaa49b] focus:border-[#315d3d] focus:ring-2 focus:ring-[#315d3d]/10"
              />
            </div>

            <div>
              <label
                htmlFor="filter"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-[#777169]"
              >
                Customer type
              </label>

              <select
                id="filter"
                name="filter"
                defaultValue={filter}
                className="h-11 min-w-44 rounded-xl border border-[#dcd7ce] bg-[#faf9f6] px-3 text-sm outline-none focus:border-[#315d3d]"
              >
                <option value="all">
                  All contacts
                </option>

                <option value="customers">
                  Paying customers
                </option>

                <option value="repeat">
                  Repeat customers
                </option>

                <option value="newsletter">
                  Newsletter
                </option>

                <option value="leads">
                  Leads / no purchase
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="sort"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-[#777169]"
              >
                Sort by
              </label>

              <select
                id="sort"
                name="sort"
                defaultValue={sort}
                className="h-11 min-w-44 rounded-xl border border-[#dcd7ce] bg-[#faf9f6] px-3 text-sm outline-none focus:border-[#315d3d]"
              >
                <option value="recent">
                  Most recent
                </option>

                <option value="spent">
                  Highest spend
                </option>

                <option value="orders">
                  Most orders
                </option>

                <option value="name">
                  Name
                </option>

                <option value="oldest">
                  Oldest
                </option>
              </select>
            </div>

            <button
              type="submit"
              className="h-11 rounded-xl bg-[#214f32] px-6 text-sm font-semibold text-white transition hover:bg-[#183c26]"
            >
              Apply
            </button>
          </form>
        </section>

        {/* =====================================================
            CUSTOMER TABLE
        ====================================================== */}

        <section className="mt-6 overflow-hidden rounded-2xl border border-[#ded9cf] bg-white">

          {/* Table header */}

          <div className="flex flex-col gap-2 border-b border-[#e7e2da] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div>
              <h2 className="font-serif text-2xl text-[#214f32]">
                Customer Directory
              </h2>

              <p className="mt-1 text-sm text-[#777169]">
                {formatNumber(
                  totalResults
                )}{" "}
                results
              </p>
            </div>

            {totalResults > 0 && (
              <div className="text-sm text-[#777169]">
                Page{" "}
                <span className="font-medium text-[#34362f]">
                  {safePage}
                </span>{" "}
                of{" "}
                <span className="font-medium text-[#34362f]">
                  {totalPages}
                </span>
              </div>
            )}
          </div>

          {/* Table */}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead className="bg-[#f8f6f2]">
                <tr className="text-left text-xs font-semibold uppercase tracking-[0.08em] text-[#777169]">
                  <th className="px-6 py-4">
                    Customer
                  </th>

                  <th className="px-6 py-4">
                    Contact
                  </th>

                  <th className="px-6 py-4">
                    Type
                  </th>

                  <th className="px-6 py-4 text-right">
                    Orders
                  </th>

                  <th className="px-6 py-4 text-right">
                    Total Spent
                  </th>

                  <th className="px-6 py-4 text-right">
                    Avg. Order
                  </th>

                  <th className="px-6 py-4 text-right">
                    Last Activity
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#ebe7df]">
                {paginatedCustomers.map(
                  (customer) => {
                    const averageOrder =
                      customer.paidOrders > 0
                        ? customer.totalSpent /
                          customer.paidOrders
                        : 0;

                    return (
                      <tr
                        key={customer.key}
                        className="transition hover:bg-[#faf9f6]"
                      >
                        {/* Customer */}

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <CustomerAvatar
                              customer={
                                customer
                              }
                            />

                            <div className="min-w-0">
                              <p className="truncate font-medium text-[#30332d]">
                                {getCustomerDisplayName(
                                  customer
                                )}
                              </p>

                              <p className="mt-1 text-xs text-[#918b82]">
                                Customer since{" "}
                                {formatShortDate(
                                  customer.createdAt
                                )}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}

                        <td className="px-6 py-5">
                          <div className="space-y-1">
                            <p className="max-w-[230px] truncate text-sm text-[#514e48]">
                              {customer.email ||
                                "No email"}
                            </p>

                            {customer.phone && (
                              <p className="text-xs text-[#89837a]">
                                {
                                  customer.phone
                                }
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Customer type */}

                        <td className="px-6 py-5">
                          <div className="flex flex-wrap gap-1.5">
                            <CustomerStatusBadge
                              customer={
                                customer
                              }
                            />

                            {customer.newsletterSubscriber && (
                              <Badge>
                                Newsletter
                              </Badge>
                            )}
                          </div>

                          <p className="mt-2 text-[11px] text-[#999289]">
                            {Array.from(
                              customer.sources
                            ).join(" · ")}
                          </p>
                        </td>

                        {/* Orders */}

                        <td className="px-6 py-5 text-right">
                          <p className="font-medium text-[#34362f]">
                            {formatNumber(
                              customer.paidOrders
                            )}
                          </p>

                          {customer.totalOrders >
                            customer.paidOrders && (
                            <p className="mt-1 text-xs text-[#999289]">
                              {
                                customer.totalOrders
                              }{" "}
                              total attempts
                            </p>
                          )}
                        </td>

                        {/* Total spent */}

                        <td className="px-6 py-5 text-right font-medium text-[#214f32]">
                          {formatCurrency(
                            customer.totalSpent
                          )}
                        </td>

                        {/* Average order */}

                        <td className="px-6 py-5 text-right text-[#54514b]">
                          {customer.paidOrders >
                          0
                            ? formatCurrency(
                                averageOrder
                              )
                            : "—"}
                        </td>

                        {/* Last activity */}

                        <td className="whitespace-nowrap px-6 py-5 text-right">
                          <p className="text-sm text-[#54514b]">
                            {formatShortDate(
                              customer.lastActivityAt
                            )}
                          </p>

                          {customer.lastOrderAt && (
                            <p className="mt-1 text-xs text-[#999289]">
                              Last order
                            </p>
                          )}
                        </td>
                      </tr>
                    );
                  }
                )}

                {paginatedCustomers.length ===
                  0 && (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ===================================================
              PAGINATION
          ==================================================== */}

          {totalResults > 0 && (
            <div className="flex flex-col gap-4 border-t border-[#e7e2da] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <p className="text-sm text-[#777169]">
                Showing{" "}
                <span className="font-medium text-[#34362f]">
                  {startIndex + 1}
                </span>
                {" – "}
                <span className="font-medium text-[#34362f]">
                  {Math.min(
                    endIndex,
                    totalResults
                  )}
                </span>
                {" of "}
                <span className="font-medium text-[#34362f]">
                  {formatNumber(
                    totalResults
                  )}
                </span>{" "}
                customers
              </p>

              <div className="flex items-center gap-2">

                {/* Previous */}

                {safePage > 1 ? (
                  <Link
                    href={buildPageUrl({
                      page: safePage - 1,
                      q: params.q,
                      filter,
                      sort,
                    })}
                    className="rounded-lg border border-[#dcd7ce] bg-white px-4 py-2 text-sm font-medium text-[#4e4b45] transition hover:bg-[#f7f5f0]"
                  >
                    Previous
                  </Link>
                ) : (
                  <span className="cursor-not-allowed rounded-lg border border-[#e6e1d9] bg-[#f7f5f0] px-4 py-2 text-sm text-[#b1aba2]">
                    Previous
                  </span>
                )}

                {/* Page counter */}

                <div className="flex min-w-24 items-center justify-center rounded-lg bg-[#edf1ec] px-3 py-2 text-sm font-medium text-[#315d3d]">
                  {safePage} / {totalPages}
                </div>

                {/* Next */}

                {safePage < totalPages ? (
                  <Link
                    href={buildPageUrl({
                      page: safePage + 1,
                      q: params.q,
                      filter,
                      sort,
                    })}
                    className="rounded-lg bg-[#214f32] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#183c26]"
                  >
                    Next
                  </Link>
                ) : (
                  <span className="cursor-not-allowed rounded-lg bg-[#dfe5df] px-4 py-2 text-sm text-[#929a93]">
                    Next
                  </span>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

/*
 * ============================================================
 * COMPONENTS
 * ============================================================
 */

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-2xl border border-[#ded9cf] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.025)] sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#777169]">
        {title}
      </p>

      <p className="mt-3 font-serif text-3xl text-[#214f32]">
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-[#8a857c]">
        {subtitle}
      </p>
    </div>
  );
}

function CustomerAvatar({
  customer,
}: {
  customer: CustomerRecord;
}) {
  const initials =
    getCustomerInitials(customer);

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e9eee8] font-serif text-sm font-medium text-[#285437]">
      {initials}
    </div>
  );
}

function CustomerStatusBadge({
  customer,
}: {
  customer: CustomerRecord;
}) {
  if (customer.paidOrders >= 2) {
    return (
      <Badge>
        Repeat Customer
      </Badge>
    );
  }

  if (customer.paidOrders === 1) {
    return (
      <Badge>
        Customer
      </Badge>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-[#f1eee8] px-2.5 py-1 text-[11px] font-medium text-[#746e65]">
      Lead
    </span>
  );
}

function Badge({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex rounded-full bg-[#e8eee9] px-2.5 py-1 text-[11px] font-medium text-[#315d3d]">
      {children}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="px-5 py-16 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#edf1ec] text-xl text-[#315d3d]">
        ♧
      </div>

      <h3 className="mt-4 font-serif text-xl text-[#214f32]">
        No customers found
      </h3>

      <p className="mt-2 text-sm text-[#817b72]">
        Try changing your search or filters.
      </p>
    </div>
  );
}

/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

function isSuccessfulOrder(
  status: string
) {
  return SUCCESSFUL_ORDER_STATUSES.includes(
    status.toLowerCase()
  );
}

function normalizeEmail(
  email?: string | null
) {
  return (
    email?.trim().toLowerCase() ||
    null
  );
}

function getFullName(
  customer: CustomerRecord
) {
  return [
    customer.firstName,
    customer.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
}

function getCustomerDisplayName(
  customer: CustomerRecord
) {
  const fullName =
    getFullName(customer);

  if (fullName) {
    return fullName;
  }

  if (customer.email) {
    return customer.email.split("@")[0];
  }

  return "Anonymous Customer";
}

function getCustomerInitials(
  customer: CustomerRecord
) {
  if (
    customer.firstName ||
    customer.lastName
  ) {
    return [
      customer.firstName?.[0],
      customer.lastName?.[0],
    ]
      .filter(Boolean)
      .join("")
      .toUpperCase();
  }

  if (customer.email) {
    return customer.email
      .charAt(0)
      .toUpperCase();
  }

  return "?";
}

function formatCurrency(
  cents: number
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
    }
  ).format(cents / 100);
}

function formatNumber(
  value: number
) {
  return new Intl.NumberFormat(
    "en-US"
  ).format(value);
}

function formatShortDate(
  date: Date
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(date);
}

/*
 * Build pagination URLs while preserving the customer's
 * current search, filter, and sorting options.
 */
function buildPageUrl({
  page,
  q,
  filter,
  sort,
}: {
  page: number;
  q?: string;
  filter?: string;
  sort?: string;
}) {
  const searchParams =
    new URLSearchParams();

  searchParams.set(
    "page",
    page.toString()
  );

  if (q?.trim()) {
    searchParams.set(
      "q",
      q.trim()
    );
  }

  if (
    filter &&
    filter !== "all"
  ) {
    searchParams.set(
      "filter",
      filter
    );
  }

  if (
    sort &&
    sort !== "recent"
  ) {
    searchParams.set(
      "sort",
      sort
    );
  }

  return `/admin/customer?${searchParams.toString()}`;
}
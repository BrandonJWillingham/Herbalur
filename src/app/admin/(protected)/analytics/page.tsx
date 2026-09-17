// app/admin/(protected)/analytics/page.tsx

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ANALYTICS_DAYS = 30;
const CHART_DAYS = 14;

/*
 * These should match the statuses your Stripe webhook writes after
 * a successful payment.
 *
 * If your webhook only uses "paid", you can reduce this to ["paid"].
 */
const SUCCESSFUL_ORDER_STATUSES = [
  "paid",
  "completed",
  "complete",
  "succeeded",
  "fulfilled",
];

export default async function AnalyticsPage() {
  const now = new Date();

  const periodStart = new Date(now);
  periodStart.setDate(periodStart.getDate() - ANALYTICS_DAYS);
  periodStart.setHours(0, 0, 0, 0);

  const chartStart = new Date(now);
  chartStart.setDate(chartStart.getDate() - (CHART_DAYS - 1));
  chartStart.setHours(0, 0, 0, 0);

  /*
   * ============================================================
   * DATABASE QUERIES
   * ============================================================
   */

  const [
    totalVisitors,
    newVisitors,
    activeVisitorRows,
    totalSessions,
    pageViews,
    productViews,
    addToCarts,
    checkoutStarts,
    purchaseEvents,
    newsletterSignups,
    recentOrders,
    chartPageViews,
    pageGroups,
    productEventGroups,
    products,
    recentActivity,
    sessions,
  ] = await Promise.all([
    /*
     * All visitors ever recorded.
     */
    prisma.visitor.count(),

    /*
     * Brand new visitors during this reporting period.
     */
    prisma.visitor.count({
      where: {
        createdAt: {
          gte: periodStart,
        },
      },
    }),

    /*
     * Visitors who actually performed an event during this period.
     *
     * distinct visitorId gives us unique active visitors.
     */
    prisma.event.findMany({
      where: {
        createdAt: {
          gte: periodStart,
        },
      },

      select: {
        visitorId: true,
      },

      distinct: ["visitorId"],
    }),

    /*
     * Sessions started during the reporting period.
     */
    prisma.session.count({
      where: {
        startedAt: {
          gte: periodStart,
        },
      },
    }),

    /*
     * Page views.
     */
    prisma.event.count({
      where: {
        type: "PAGE_VIEW",
        createdAt: {
          gte: periodStart,
        },
      },
    }),

    /*
     * Product views.
     */
    prisma.event.count({
      where: {
        type: "PRODUCT_VIEW",
        createdAt: {
          gte: periodStart,
        },
      },
    }),

    /*
     * Add-to-cart events.
     */
    prisma.event.count({
      where: {
        type: "ADD_TO_CART",
        createdAt: {
          gte: periodStart,
        },
      },
    }),

    /*
     * Checkout starts.
     */
    prisma.event.count({
      where: {
        type: "BEGIN_CHECKOUT",
        createdAt: {
          gte: periodStart,
        },
      },
    }),

    /*
     * Purchase events.
     */
    prisma.event.count({
      where: {
        type: "PURCHASE",
        createdAt: {
          gte: periodStart,
        },
      },
    }),

    /*
     * Actual newsletter subscribers.
     *
     * I prefer reading the subscriber table instead of relying only
     * on NEWSLETTER_SIGNUP events because the table is the real source
     * of truth.
     */
    prisma.newsletterSubscriber.count({
      where: {
        createdAt: {
          gte: periodStart,
        },
      },
    }),

    /*
     * Orders for the period.
     *
     * We calculate revenue after retrieving them because your Order.status
     * is a String rather than an enum.
     */
    prisma.order.findMany({
      where: {
        createdAt: {
          gte: periodStart,
        },
      },

      select: {
        id: true,
        total: true,
        status: true,
        customerEmail: true,
        createdAt: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    }),

    /*
     * PAGE_VIEW events specifically for the 14-day graph.
     */
    prisma.event.findMany({
      where: {
        type: "PAGE_VIEW",

        createdAt: {
          gte: chartStart,
        },
      },

      select: {
        createdAt: true,
      },

      orderBy: {
        createdAt: "asc",
      },
    }),

    /*
     * Group PAGE_VIEW events by URL.
     */
    prisma.event.groupBy({
      by: ["page"],

      where: {
        type: "PAGE_VIEW",

        createdAt: {
          gte: periodStart,
        },

        page: {
          not: null,
        },
      },

      _count: {
        _all: true,
      },
    }),

    /*
     * Product funnel events grouped by:
     *
     * productId + EventType
     */
    prisma.event.groupBy({
      by: ["productId", "type"],

      where: {
        createdAt: {
          gte: periodStart,
        },

        productId: {
          not: null,
        },

        type: {
          in: [
            "PRODUCT_VIEW",
            "ADD_TO_CART",
            "BEGIN_CHECKOUT",
            "PURCHASE",
          ],
        },
      },

      _count: {
        _all: true,
      },
    }),

    /*
     * Products are retrieved separately so we can attach names/slugs
     * to grouped product analytics.
     */
    prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
    }),

    /*
     * Most recent analytics events.
     */
    prisma.event.findMany({
      where: {
        createdAt: {
          gte: periodStart,
        },
      },

      take: 20,

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        type: true,
        page: true,
        createdAt: true,
        visitorId: true,

        product: {
          select: {
            name: true,
            slug: true,
          },
        },

        session: {
          select: {
            source: true,
            medium: true,
            campaign: true,
          },
        },
      },
    }),

    /*
     * Session attribution.
     *
     * This lets us see which campaigns/sources are producing sessions
     * and orders.
     */
    prisma.session.findMany({
      where: {
        startedAt: {
          gte: periodStart,
        },
      },

      select: {
        id: true,
        source: true,
        medium: true,
        campaign: true,
        startedAt: true,
        lastSeenAt: true,
        endedAt: true,

        orders: {
          select: {
            id: true,
            total: true,
            status: true,
          },
        },
      },
    }),
  ]);

  /*
   * ============================================================
   * VISITOR METRICS
   * ============================================================
   */

  const activeVisitors = activeVisitorRows.length;

  const returningVisitors = Math.max(
    activeVisitors - newVisitors,
    0
  );

  const pagesPerSession =
    totalSessions > 0 ? pageViews / totalSessions : 0;

  /*
   * ============================================================
   * ORDER / REVENUE METRICS
   * ============================================================
   */

  const successfulOrders = recentOrders.filter((order) =>
    isSuccessfulOrder(order.status)
  );

  const revenue = successfulOrders.reduce(
    (total, order) => total + order.total,
    0
  );

  const averageOrderValue =
    successfulOrders.length > 0
      ? revenue / successfulOrders.length
      : 0;

  const conversionRate =
    activeVisitors > 0
      ? (successfulOrders.length / activeVisitors) * 100
      : 0;

  /*
   * ============================================================
   * FUNNEL RATES
   * ============================================================
   */

  const productViewToCartRate =
    productViews > 0
      ? (addToCarts / productViews) * 100
      : 0;

  const cartToCheckoutRate =
    addToCarts > 0
      ? (checkoutStarts / addToCarts) * 100
      : 0;

  const checkoutToPurchaseRate =
    checkoutStarts > 0
      ? (purchaseEvents / checkoutStarts) * 100
      : 0;

  /*
   * ============================================================
   * TOP PAGES
   * ============================================================
   */

  const topPages = pageGroups
    .filter(
      (
        page
      ): page is typeof page & {
        page: string;
      } => Boolean(page.page)
    )
    .map((page) => ({
      page: page.page,
      views: page._count._all,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  /*
   * ============================================================
   * PRODUCT FUNNEL
   * ============================================================
   */

  const productAnalytics = products
    .map((product) => {
      const events = productEventGroups.filter(
        (event) => event.productId === product.id
      );

      const views = getEventCount(events, "PRODUCT_VIEW");
      const carts = getEventCount(events, "ADD_TO_CART");
      const checkouts = getEventCount(
        events,
        "BEGIN_CHECKOUT"
      );
      const purchases = getEventCount(events, "PURCHASE");

      const addToCartRate =
        views > 0 ? (carts / views) * 100 : 0;

      const purchaseRate =
        views > 0 ? (purchases / views) * 100 : 0;

      return {
        ...product,
        views,
        carts,
        checkouts,
        purchases,
        addToCartRate,
        purchaseRate,
      };
    })
    .filter(
      (product) =>
        product.views > 0 ||
        product.carts > 0 ||
        product.purchases > 0
    )
    .sort((a, b) => b.views - a.views);

  /*
   * ============================================================
   * DAILY TRAFFIC
   * ============================================================
   */

  const dailyTraffic = createDateRange(CHART_DAYS);

  for (const event of chartPageViews) {
    const dateKey = formatDateKey(event.createdAt);

    const day = dailyTraffic.find(
      (entry) => entry.date === dateKey
    );

    if (day) {
      day.views += 1;
    }
  }

  const maxDailyViews = Math.max(
    ...dailyTraffic.map((day) => day.views),
    1
  );

  /*
   * ============================================================
   * CAMPAIGN ATTRIBUTION
   * ============================================================
   */

  const campaignMap = new Map<
    string,
    {
      campaign: string;
      source: string;
      medium: string;
      sessions: number;
      orders: number;
      revenue: number;
    }
  >();

  for (const session of sessions) {
    const campaign = session.campaign || "Direct / None";
    const source = session.source || "Direct";
    const medium = session.medium || "None";

    const key = `${campaign}-${source}-${medium}`;

    const existing = campaignMap.get(key) ?? {
      campaign,
      source,
      medium,
      sessions: 0,
      orders: 0,
      revenue: 0,
    };

    existing.sessions += 1;

    for (const order of session.orders) {
      if (!isSuccessfulOrder(order.status)) {
        continue;
      }

      existing.orders += 1;
      existing.revenue += order.total;
    }

    campaignMap.set(key, existing);
  }

  const campaigns = Array.from(
    campaignMap.values()
  )
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 10);

  /*
   * ============================================================
   * AVERAGE SESSION LENGTH
   * ============================================================
   */

  const sessionDurations = sessions
    .map((session) => {
      const end =
        session.endedAt ??
        session.lastSeenAt;

      return (
        end.getTime() -
        session.startedAt.getTime()
      );
    })
    .filter((duration) => duration >= 0);

  const averageSessionMilliseconds =
    sessionDurations.length > 0
      ? sessionDurations.reduce(
          (sum, value) => sum + value,
          0
        ) / sessionDurations.length
      : 0;

  const averageSessionMinutes =
    averageSessionMilliseconds / 1000 / 60;

  return (
    <main className="min-h-screen bg-[#f7f5f0] px-4 py-8 text-[#282924] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}

        <header className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#847e75]">
            Herbalur Admin
          </p>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-serif text-4xl text-[#214f32]">
                Analytics
              </h1>

              <p className="mt-2 text-sm text-[#706b63]">
                Website performance from the last{" "}
                {ANALYTICS_DAYS} days.
              </p>
            </div>

            <p className="text-xs text-[#89837a]">
              Updated {formatDateTime(now)}
            </p>
          </div>
        </header>

        {/* Main KPI cards */}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Active Visitors"
            value={formatNumber(activeVisitors)}
            subtitle={`${formatNumber(
              newVisitors
            )} new · ${formatNumber(
              returningVisitors
            )} returning`}
          />

          <StatCard
            label="Sessions"
            value={formatNumber(totalSessions)}
            subtitle={`${pagesPerSession.toFixed(
              2
            )} pages per session`}
          />

          <StatCard
            label="Revenue"
            value={formatCurrency(revenue)}
            subtitle={`${successfulOrders.length} successful orders`}
          />

          <StatCard
            label="Conversion Rate"
            value={`${conversionRate.toFixed(2)}%`}
            subtitle="Active visitors → purchase"
          />
        </section>

        {/* Secondary metrics */}

        <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SmallStatCard
            label="Page Views"
            value={formatNumber(pageViews)}
          />

          <SmallStatCard
            label="Average Order"
            value={formatCurrency(
              averageOrderValue
            )}
          />

          <SmallStatCard
            label="Avg. Session"
            value={`${averageSessionMinutes.toFixed(
              1
            )} min`}
          />

          <SmallStatCard
            label="Newsletter Signups"
            value={formatNumber(
              newsletterSignups
            )}
          />
        </section>

        {/* Funnel */}

        <section className="mt-8 rounded-2xl border border-[#ded9cf] bg-white p-5 sm:p-7">
          <div>
            <h2 className="font-serif text-2xl text-[#214f32]">
              Shopping Funnel
            </h2>

            <p className="mt-1 text-sm text-[#777169]">
              How customers are progressing from product
              discovery to purchase.
            </p>
          </div>

          <div className="mt-7 grid gap-3 md:grid-cols-4">
            <FunnelCard
              step="01"
              label="Product Views"
              value={productViews}
              rate={100}
            />

            <FunnelCard
              step="02"
              label="Added to Cart"
              value={addToCarts}
              rate={productViewToCartRate}
            />

            <FunnelCard
              step="03"
              label="Checkout Started"
              value={checkoutStarts}
              rate={cartToCheckoutRate}
            />

            <FunnelCard
              step="04"
              label="Purchases"
              value={purchaseEvents}
              rate={checkoutToPurchaseRate}
            />
          </div>
        </section>

        {/* Traffic */}

        <section className="mt-8 rounded-2xl border border-[#ded9cf] bg-white p-5 sm:p-7">
          <div>
            <h2 className="font-serif text-2xl text-[#214f32]">
              Traffic
            </h2>

            <p className="mt-1 text-sm text-[#777169]">
              Page views during the last {CHART_DAYS} days.
            </p>
          </div>

          <div className="mt-8 flex h-64 items-end gap-2 sm:gap-3">
            {dailyTraffic.map((day) => {
              const height =
                day.views === 0
                  ? 1
                  : Math.max(
                      (day.views /
                        maxDailyViews) *
                        100,
                      4
                    );

              return (
                <div
                  key={day.date}
                  className="group flex h-full min-w-0 flex-1 flex-col justify-end"
                >
                  <div className="relative flex flex-1 items-end">
                    <div
                      className="w-full rounded-t-md bg-[#315d3d] transition hover:bg-[#244a30]"
                      style={{
                        height: `${height}%`,
                      }}
                    />

                    <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-[#252820] px-2 py-1 text-xs text-white group-hover:block">
                      {day.views} views
                    </div>
                  </div>

                  <p className="mt-2 truncate text-center text-[10px] text-[#827c73] sm:text-xs">
                    {formatShortDate(day.date)}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Top pages and campaigns */}

        <div className="mt-8 grid gap-8 xl:grid-cols-2">

          {/* Top pages */}

          <section className="rounded-2xl border border-[#ded9cf] bg-white p-5 sm:p-7">
            <h2 className="font-serif text-2xl text-[#214f32]">
              Top Pages
            </h2>

            <p className="mt-1 text-sm text-[#777169]">
              Your most visited pages.
            </p>

            <div className="mt-6 divide-y divide-[#ebe7df]">
              {topPages.length > 0 ? (
                topPages.map(
                  (page, index) => (
                    <div
                      key={page.page}
                      className="flex items-center gap-4 py-4"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#edf1ec] text-xs font-semibold text-[#315d3d]">
                        {index + 1}
                      </div>

                      <p className="min-w-0 flex-1 truncate text-sm text-[#3f403b]">
                        {page.page}
                      </p>

                      <div className="text-right">
                        <p className="font-medium text-[#214f32]">
                          {formatNumber(
                            page.views
                          )}
                        </p>

                        <p className="text-xs text-[#8d877e]">
                          views
                        </p>
                      </div>
                    </div>
                  )
                )
              ) : (
                <EmptyState text="No page views yet." />
              )}
            </div>
          </section>

          {/* Campaigns */}

          <section className="rounded-2xl border border-[#ded9cf] bg-white p-5 sm:p-7">
            <h2 className="font-serif text-2xl text-[#214f32]">
              Campaign Performance
            </h2>

            <p className="mt-1 text-sm text-[#777169]">
              Sessions and revenue by acquisition source.
            </p>

            <div className="mt-6 space-y-3">
              {campaigns.length > 0 ? (
                campaigns.map(
                  (campaign) => (
                    <div
                      key={`${campaign.campaign}-${campaign.source}-${campaign.medium}`}
                      className="rounded-xl border border-[#ebe7df] p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#333630]">
                            {campaign.campaign}
                          </p>

                          <p className="mt-1 text-xs text-[#858078]">
                            {campaign.source} /{" "}
                            {campaign.medium}
                          </p>
                        </div>

                        <p className="font-serif text-lg text-[#214f32]">
                          {formatCurrency(
                            campaign.revenue
                          )}
                        </p>
                      </div>

                      <div className="mt-4 flex gap-5 text-xs text-[#6f6a62]">
                        <span>
                          <strong className="text-[#333630]">
                            {campaign.sessions}
                          </strong>{" "}
                          sessions
                        </span>

                        <span>
                          <strong className="text-[#333630]">
                            {campaign.orders}
                          </strong>{" "}
                          orders
                        </span>
                      </div>
                    </div>
                  )
                )
              ) : (
                <EmptyState text="No campaign data yet." />
              )}
            </div>
          </section>
        </div>

        {/* Product performance */}

        <section className="mt-8 overflow-hidden rounded-2xl border border-[#ded9cf] bg-white">
          <div className="border-b border-[#e6e2da] p-5 sm:p-7">
            <h2 className="font-serif text-2xl text-[#214f32]">
              Product Performance
            </h2>

            <p className="mt-1 text-sm text-[#777169]">
              Product views, cart activity and purchases.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead className="bg-[#f8f6f2]">
                <tr className="text-left text-xs font-semibold uppercase tracking-[0.08em] text-[#777169]">
                  <th className="px-6 py-4">
                    Product
                  </th>

                  <th className="px-6 py-4 text-right">
                    Views
                  </th>

                  <th className="px-6 py-4 text-right">
                    Cart
                  </th>

                  <th className="px-6 py-4 text-right">
                    Checkout
                  </th>

                  <th className="px-6 py-4 text-right">
                    Purchases
                  </th>

                  <th className="px-6 py-4 text-right">
                    Add Rate
                  </th>

                  <th className="px-6 py-4 text-right">
                    Purchase Rate
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#ebe7df]">
                {productAnalytics.map(
                  (product) => (
                    <tr
                      key={product.id}
                      className="transition hover:bg-[#faf9f6]"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-[#34362f]">
                          {product.name}
                        </p>

                        <p className="mt-1 text-xs text-[#908a81]">
                          /product/{product.slug}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-right">
                        {formatNumber(
                          product.views
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        {formatNumber(
                          product.carts
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        {formatNumber(
                          product.checkouts
                        )}
                      </td>

                      <td className="px-6 py-4 text-right font-medium text-[#214f32]">
                        {formatNumber(
                          product.purchases
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        {product.addToCartRate.toFixed(
                          1
                        )}
                        %
                      </td>

                      <td className="px-6 py-4 text-right">
                        {product.purchaseRate.toFixed(
                          1
                        )}
                        %
                      </td>
                    </tr>
                  )
                )}

                {productAnalytics.length ===
                  0 && (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState text="No product analytics yet." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Recent activity */}

        <section className="mt-8 overflow-hidden rounded-2xl border border-[#ded9cf] bg-white">
          <div className="border-b border-[#e6e2da] p-5 sm:p-7">
            <h2 className="font-serif text-2xl text-[#214f32]">
              Recent Activity
            </h2>

            <p className="mt-1 text-sm text-[#777169]">
              The latest activity recorded on the website.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-[#f8f6f2]">
                <tr className="text-left text-xs font-semibold uppercase tracking-[0.08em] text-[#777169]">
                  <th className="px-6 py-4">
                    Event
                  </th>

                  <th className="px-6 py-4">
                    Product / Page
                  </th>

                  <th className="px-6 py-4">
                    Source
                  </th>

                  <th className="px-6 py-4">
                    Visitor
                  </th>

                  <th className="px-6 py-4 text-right">
                    Time
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#ebe7df]">
                {recentActivity.map(
                  (event) => (
                    <tr
                      key={event.id}
                      className="text-sm transition hover:bg-[#faf9f6]"
                    >
                      <td className="px-6 py-4">
                        <EventBadge
                          type={event.type}
                        />
                      </td>

                      <td className="max-w-[280px] px-6 py-4">
                        {event.product ? (
                          <>
                            <p className="truncate font-medium text-[#34362f]">
                              {
                                event.product
                                  .name
                              }
                            </p>

                            <p className="mt-1 truncate text-xs text-[#8b857c]">
                              {event.page ??
                                `/product/${event.product.slug}`}
                            </p>
                          </>
                        ) : (
                          <p className="truncate text-[#5c5953]">
                            {event.page || "—"}
                          </p>
                        )}
                      </td>

                      <td className="px-6 py-4 text-[#666159]">
                        {event.session?.source ||
                          "Direct"}
                      </td>

                      <td className="px-6 py-4 font-mono text-xs text-[#79736b]">
                        {shortenId(
                          event.visitorId
                        )}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-right text-[#79736b]">
                        {formatDateTime(
                          event.createdAt
                        )}
                      </td>
                    </tr>
                  )
                )}

                {recentActivity.length ===
                  0 && (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState text="No activity recorded yet." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <p className="mt-6 text-xs text-[#938d84]">
          {formatNumber(totalVisitors)} total visitors have
          been recorded since analytics tracking began.
        </p>
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
  label,
  value,
  subtitle,
}: {
  label: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-2xl border border-[#ded9cf] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.025)] sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#777169]">
        {label}
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

function SmallStatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[#ded9cf] bg-white px-5 py-4">
      <p className="text-sm text-[#69655e]">
        {label}
      </p>

      <p className="font-serif text-xl text-[#214f32]">
        {value}
      </p>
    </div>
  );
}

function FunnelCard({
  step,
  label,
  value,
  rate,
}: {
  step: string;
  label: string;
  value: number;
  rate: number;
}) {
  return (
    <div className="rounded-xl border border-[#e5e0d7] bg-[#faf9f6] p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#979087]">
          {step}
        </span>

        <span className="rounded-full bg-[#e8eee9] px-2.5 py-1 text-xs font-medium text-[#315d3d]">
          {rate.toFixed(1)}%
        </span>
      </div>

      <p className="mt-5 font-serif text-3xl text-[#214f32]">
        {formatNumber(value)}
      </p>

      <p className="mt-1 text-sm text-[#68645e]">
        {label}
      </p>
    </div>
  );
}

function EventBadge({
  type,
}: {
  type: string;
}) {
  return (
    <span className="inline-flex rounded-full bg-[#edf1ec] px-3 py-1 text-xs font-medium text-[#315d3d]">
      {formatEventName(type)}
    </span>
  );
}

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="py-10 text-center text-sm text-[#8a857c]">
      {text}
    </div>
  );
}

/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

function isSuccessfulOrder(status: string) {
  return SUCCESSFUL_ORDER_STATUSES.includes(
    status.toLowerCase()
  );
}

function getEventCount(
  events: {
    type: string;
    _count: {
      _all: number;
    };
  }[],
  type: string
) {
  return (
    events.find(
      (event) => event.type === type
    )?._count._all ?? 0
  );
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat(
    "en-US"
  ).format(value);
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatShortDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(
    new Date(`${date}T00:00:00`)
  );
}

function createDateRange(days: number) {
  const results: {
    date: string;
    views: number;
  }[] = [];

  for (
    let index = days - 1;
    index >= 0;
    index--
  ) {
    const date = new Date();

    date.setDate(
      date.getDate() - index
    );

    date.setHours(0, 0, 0, 0);

    results.push({
      date: formatDateKey(date),
      views: 0,
    });
  }

  return results;
}

function formatEventName(type: string) {
  return type
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase()
    );
}

function shortenId(id: string) {
  if (id.length <= 13) {
    return id;
  }

  return `${id.slice(0, 6)}…${id.slice(
    -5
  )}`;
}
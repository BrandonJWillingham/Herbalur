import { prisma } from "@/lib/prisma";

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
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    take: 100,

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
          labelUrl: true,
          trackingNumber: true,
          trackingUrl: true,
          carrier: true,
          serviceLevel: true,
          status: true,
        },
      },

      items: {
        select: {
          id: true,
          name: true,
          price: true,
          quantity: true,
        },
      },
    },
  });

  return (
    <main>
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7b776f]">
          Fulfillment
        </p>

        <h1 className="mt-2 font-serif text-4xl text-[#26432c]">
          Orders
        </h1>

        <p className="mt-2 text-sm text-[#68645e]">
          Showing the latest {orders.length} orders.
        </p>
      </div>

      <div className="mt-8 space-y-5">
        {orders.length === 0 ? (
          <div className="rounded-xl border border-[#dfdbd3] bg-white p-8 text-sm text-[#68645e]">
            No orders have been placed yet.
          </div>
        ) : (
          orders.map((order) => (
            <article
              key={order.id}
              className="rounded-xl border border-[#dfdbd3] bg-white p-6"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-serif text-xl text-[#26432c]">
                      Order {order.id.slice(-8)}
                    </h2>

                    <span className="rounded-full bg-[#f0ede7] px-3 py-1 text-xs capitalize text-[#57544f]">
                      {order.status}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-[#68645e]">
                    {order.customerEmail ?? "No customer email"}
                  </p>

                  <p className="mt-1 text-xs text-[#88837c]">
                    {formatDate(order.createdAt)}
                  </p>
                </div>

                <p className="font-serif text-2xl text-[#26432c]">
                  {formatMoney(order.total)}
                </p>
              </div>

              <div className="mt-6 border-t border-[#ece8e1] pt-5">
                <h3 className="text-sm font-medium text-[#343630]">
                  Items
                </h3>

                <div className="mt-3 space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-5 text-sm"
                    >
                      <span className="text-[#5d5a55]">
                        {item.quantity} × {item.name}
                      </span>

                      <span className="font-medium text-[#343630]">
                        {formatMoney(
                          item.price * item.quantity
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t border-[#ece8e1] pt-5">
                <h3 className="text-sm font-medium text-[#343630]">
                  Shipping
                </h3>

                {!order.shipping ? (
                  <p className="mt-2 text-sm text-[#68645e]">
                    No shipping label has been created.
                  </p>
                ) : (
                  <div className="mt-3 space-y-2 text-sm text-[#5d5a55]">
                    <p>
                      Status:{" "}
                      <span className="capitalize">
                        {order.shipping.status}
                      </span>
                    </p>

                    {order.shipping.carrier && (
                      <p>
                        Carrier: {order.shipping.carrier}
                      </p>
                    )}

                    {order.shipping.serviceLevel && (
                      <p>
                        Service:{" "}
                        {order.shipping.serviceLevel}
                      </p>
                    )}

                    {order.shipping.trackingNumber && (
                      <p>
                        Tracking:{" "}
                        {order.shipping.trackingNumber}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-3 pt-3">
                      {order.shipping.labelUrl && (
                        <a
                          href={order.shipping.labelUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg bg-[#26432c] px-4 py-2 text-sm font-medium text-white"
                        >
                          Open shipping label
                        </a>
                      )}

                      {order.shipping.trackingUrl && (
                        <a
                          href={order.shipping.trackingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-[#d8d4cd] px-4 py-2 text-sm font-medium text-[#343630]"
                        >
                          Track shipment
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </main>
  );
}
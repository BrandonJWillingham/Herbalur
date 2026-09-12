import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import PrintButton from "./PrintButton";

type PrintOrderPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default async function PrintOrderPage({
  params,
}: PrintOrderPageProps) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: {
      id,
    },

    select: {
      id: true,
      customerEmail: true,
      status: true,
      total: true,
      createdAt: true,

      items: {
        select: {
          id: true,
          name: true,
          price: true,
          quantity: true,
        },
      },

      shipping: {
        select: {
          carrier: true,
          serviceLevel: true,
          trackingNumber: true,
          labelUrl: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white px-8 py-10 text-black">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 flex items-start justify-between gap-5 print:hidden">
          <div>
            <h1 className="text-2xl font-semibold">
              Order #{order.id.slice(-8)}
            </h1>

            <p className="mt-1 text-sm text-gray-600">
              Packing slip
            </p>
          </div>

          <PrintButton />
        </div>

        <section className="border-b border-black pb-6">
          <div className="flex justify-between gap-8">
            <div>
              <h1 className="text-3xl font-semibold">
                Herbalur
              </h1>

              <p className="mt-2 text-sm">
                Packing Slip
              </p>
            </div>

            <div className="text-right text-sm">
              <p className="font-semibold">
                Order #{order.id.slice(-8)}
              </p>

              <p className="mt-1">
                {formatDate(order.createdAt)}
              </p>

              <p className="mt-1 capitalize">
                Status: {order.status}
              </p>
            </div>
          </div>
        </section>

        <section className="py-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide">
            Customer
          </h2>

          <p className="mt-2">
            {order.customerEmail ?? "No customer email"}
          </p>
        </section>

        <section className="border-t border-black py-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-400 text-left">
                <th className="pb-3">
                  Product
                </th>

                <th className="pb-3 text-center">
                  Qty
                </th>

                <th className="pb-3 text-right">
                  Price
                </th>

                <th className="pb-3 text-right">
                  Total
                </th>
              </tr>
            </thead>

            <tbody>
              {order.items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-300"
                >
                  <td className="py-4">
                    {item.name}
                  </td>

                  <td className="py-4 text-center">
                    {item.quantity}
                  </td>

                  <td className="py-4 text-right">
                    {formatMoney(item.price)}
                  </td>

                  <td className="py-4 text-right">
                    {formatMoney(
                      item.price * item.quantity
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6 flex justify-end">
            <div className="w-64">
              <div className="flex justify-between border-t border-black pt-3 text-lg font-semibold">
                <span>Order total</span>

                <span>
                  {formatMoney(order.total)}
                </span>
              </div>
            </div>
          </div>
        </section>

        {order.shipping && (
          <section className="border-t border-black py-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide">
              Shipping
            </h2>

            <div className="mt-3 space-y-1 text-sm">
              {order.shipping.carrier && (
                <p>
                  Carrier: {order.shipping.carrier}
                </p>
              )}

              {order.shipping.serviceLevel && (
                <p>
                  Service: {order.shipping.serviceLevel}
                </p>
              )}

              {order.shipping.trackingNumber && (
                <p>
                  Tracking:{" "}
                  {order.shipping.trackingNumber}
                </p>
              )}
            </div>
          </section>
        )}

        <footer className="mt-12 border-t border-gray-400 pt-6 text-center text-sm text-gray-600">
          Thank you for shopping with Herbalur.
        </footer>
      </div>
    </main>
  );
}
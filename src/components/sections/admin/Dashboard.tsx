// components/admin/Dashboard.tsx

import { prisma } from "@/lib/prisma";
import StatCard from "./StatCard";

export default async function Dashboard() {
  const [
    visitors,
    events,
    pageViews,
  ] = await Promise.all([
    prisma.userData.count(),
    prisma.event.count(),
    prisma.event.count({
      where: {
        type: "PAGE_VIEW",
      },
    }),
  ]);

  return (
    <>
      <section className="grid grid-cols-3 gap-6">

        <StatCard
          title="Visitors"
          value={visitors}
        />

        <StatCard
          title="Events"
          value={events}
        />

        <StatCard
          title="Page Views"
          value={pageViews}
        />

      </section>
    </>
  );
}
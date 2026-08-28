import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import "dotenv/config";
import { prisma } from "../src/lib/prisma";

type ReviewRow = {
  id: string;
  name: string;
  rating: string;
  comment: string;
  approved: string;
  createdAt: string;
  pfpUrl: string;
  subject: string;
  productSlug: string;
};

async function main() {
  const filePath = path.join(
    process.cwd(),
    "data",
    "herbalur_reviews_seedable_updated.csv"
  );

  const csv = fs.readFileSync(filePath, "utf8");

  const rows = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as ReviewRow[];

  let inserted = 0;
  let skipped = 0;

  for (const row of rows) {
    const product = await prisma.product.findUnique({
      where: {
        slug: row.productSlug,
      },
      select: {
        id: true,
      },
    });

    if (!product) {
      console.warn(`Product not found: ${row.productSlug}`);
      skipped++;
      continue;
    }

    await prisma.review.upsert({
      where: {
        id: row.id,
      },

      update: {},

      create: {
        id: row.id,
        productId: product.id,
        name: row.name,
        rating: Number(row.rating),
        comment: row.comment,
        approved: row.approved.toLowerCase() === "true",
        createdAt: new Date(row.createdAt),
        pfpUrl: row.pfpUrl || "",
        subject: row.subject || "Legacy customer Review",
      },
    });

    inserted++;
  }

  console.log({
    inserted,
    skipped,
  });
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
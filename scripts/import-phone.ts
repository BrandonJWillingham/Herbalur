import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import "dotenv/config";
import { prisma } from "../src/lib/prisma";

type PhoneRow = {
  phone?: string;
  Phone?: string;
  first_name?: string;
  firstName?: string;
  last_name?: string;
  lastName?: string;
};

function normalizePhone(value?: string) {
  if (!value) return null;

  const digits = value.replace(/\D/g, "");

  // US numbers
  if (digits.length === 10) {
    return `+1${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }

  return null;
}

async function main() {
  const filePath = path.join(
    process.cwd(),
    "data",
    "herbalur_sms_subscribers_seedable.csv"
  );

  const csv = fs.readFileSync(filePath, "utf8");

  const rows = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as PhoneRow[];

  const users = rows
    .map((row) => {
      const phone = normalizePhone(row.phone ?? row.Phone);

      if (!phone) return null;

      return {
        phone,
        firstName: row.first_name ?? row.firstName ?? null,
        lastName: row.last_name ?? row.lastName ?? null,
      };
    })
    .filter(
      (
        user
      ): user is {
        phone: string;
        firstName: string | null;
        lastName: string | null;
      } => user !== null
    );

  const result = await prisma.user.createMany({
    data: users,
    skipDuplicates: true,
  });

  console.log(`Imported ${result.count} users`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
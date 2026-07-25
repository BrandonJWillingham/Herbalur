import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

type CategoryPageProps = {
  params: Promise<{
    category: string;
  }>;
};

type CategoryKey = "face" | "hair" | "body" | "wellness";

type CategoryContent = {
  eyebrow: string;
  title: string;
  description: string;
  imageAlt: string;
};

const categoryContent: Record<CategoryKey, CategoryContent> = {
  face: {
    eyebrow: "Facial Care",
    title: "Thoughtful care for your everyday glow.",
    description:
      "Explore cleansers, oils, masks, and moisturizers created to support soft, balanced, radiant-looking skin.",
    imageAlt:
      "A curated collection of Herbalur facial skincare products",
  },

  hair: {
    eyebrow: "Hair Care",
    title: "Nourish your roots. Strengthen every strand.",
    description:
      "Discover plant-powered oils and deep-conditioning treatments made to support softer, healthier-looking hair.",
    imageAlt:
      "A curated collection of Herbalur hair care products",
  },

  body: {
    eyebrow: "Body Care",
    title: "Daily rituals for softer, nourished skin.",
    description:
      "Explore rich body butters, cleansing bars, scrubs, and oils designed to make everyday body care feel intentional.",
    imageAlt:
      "A curated collection of Herbalur body care products",
  },

  wellness: {
    eyebrow: "Wellness",
    title: "Simple rituals rooted in everyday care.",
    description:
      "Explore thoughtful products inspired by natural ingredients, intentional routines, and whole-body care.",
    imageAlt:
      "A curated collection of Herbalur wellness products",
  },
};

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const { category } = await params;

  const normalizedCategory =
    category.toLowerCase() as CategoryKey;

  if (!(normalizedCategory in categoryContent)) {
    notFound();
  }

  const content = categoryContent[normalizedCategory];

  const products = await prisma.product.findMany({
    where: {
      category: normalizedCategory,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="bg-[#f7f1e8] text-[#2d382f]">
      <section
        aria-labelledby="category-heading"
        className="border-b border-[#2d382f]/10"
      >
        <div className="mx-auto max-w-[1440px] px-6 py-16 sm:px-10 sm:py-20 lg:px-12 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-end lg:gap-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a3742b] sm:text-sm">
                {content.eyebrow}
              </p>

              <div
                aria-hidden="true"
                className="mt-5 h-px w-12 bg-[#b88235]"
              />
            </div>

            <div className="max-w-4xl">
              <h1
                id="category-heading"
                className="font-serif text-4xl font-normal leading-[1.05] tracking-[-0.025em] text-[#2d382f] sm:text-5xl lg:text-6xl xl:text-7xl"
              >
                {content.title}
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-[#4d504a] sm:text-lg sm:leading-8">
                {content.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="products-heading"
        className="mx-auto max-w-[1440px] px-6 py-12 sm:px-10 sm:py-16 lg:px-12 lg:py-20"
      >
        <div className="flex flex-col gap-5 border-b border-[#2d382f]/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="products-heading"
              className="font-serif text-2xl font-normal text-[#2d382f] sm:text-3xl"
            >
              Shop {content.eyebrow}
            </h2>

            <p
              aria-live="polite"
              className="mt-2 text-sm text-[#4d504a]"
            >
              {products.length}{" "}
              {products.length === 1 ? "product" : "products"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label
              htmlFor="category-sort"
              className="sr-only"
            >
              Sort products
            </label>

            <select
              id="category-sort"
              name="sort"
              defaultValue="featured"
              className="
                min-h-11
                rounded-sm
                border
                border-[#2d382f]/20
                bg-transparent
                px-4
                text-sm
                text-[#2d382f]
                outline-none
                transition
                hover:border-[#244a2c]
                focus-visible:border-[#244a2c]
                focus-visible:ring-2
                focus-visible:ring-[#244a2c]/30
              "
            >
              <option value="featured">
                Featured
              </option>

              <option value="price-low-high">
                Price: Low to high
              </option>

              <option value="price-high-low">
                Price: High to low
              </option>

              <option value="newest">
                Newest
              </option>
            </select>

            <button
              type="button"
              className="
                inline-flex
                min-h-11
                items-center
                gap-2
                rounded-sm
                border
                border-[#244a2c]
                px-4
                text-xs
                font-semibold
                uppercase
                tracking-[0.15em]
                text-[#244a2c]
                transition
                hover:bg-[#244a2c]
                hover:text-white
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-[#244a2c]
                focus-visible:ring-offset-3
                focus-visible:ring-offset-[#f7f1e8]
              "
            >
              <FilterIcon />

              Filter
            </button>
          </div>
        </div>

        {products.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <article
                key={product.id}
                className="group"
              >
                <Link
                  href={`/products/${product.slug}`}
                  aria-label={`View ${product.name}`}
                  className="
                    block
                    rounded-[1.25rem]
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-[#244a2c]
                    focus-visible:ring-offset-4
                    focus-visible:ring-offset-[#f7f1e8]
                  "
                >
                  <div
                    className="
                      relative
                      aspect-[4/5]
                      overflow-hidden
                      rounded-[1.25rem]
                      border
                      border-[#2d382f]/5
                      bg-[#efe6d8]
                    "
                  >
                    <Image
                      src={`${product.imageUrl}`}
                      alt={product.name}
                      fill
                      sizes="
                        (max-width: 640px) 100vw,
                        (max-width: 1024px) 50vw,
                        (max-width: 1280px) 33vw,
                        25vw
                      "
                      className="
                        object-contain
                        p-8
                        transition
                        duration-500
                        ease-out
                        group-hover:scale-[1.04]
                        sm:p-10
                      "
                    />

                    <div
                      aria-hidden="true"
                      className="
                        pointer-events-none
                        absolute
                        inset-0
                        bg-gradient-to-t
                        from-[#244a2c]/5
                        via-transparent
                        to-white/10
                      "
                    />

                    {product.inventory <= 0 && (
                      <div className="absolute inset-0 grid place-items-center bg-[#f7f1e8]/75 backdrop-blur-[2px]">
                        <span className="rounded-full border border-[#2d382f]/20 bg-[#f7f1e8] px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#2d382f]">
                          Sold out
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a3742b]">
                          {content.eyebrow}
                        </p>

                        <h3 className="mt-2 font-serif text-2xl leading-tight text-[#2d382f] transition group-hover:text-[#244a2c]">
                          {product.name}
                        </h3>
                      </div>

                      <p className="shrink-0 pt-7 text-sm font-medium text-[#2d382f]">
                        {formatPrice(product.price)}
                      </p>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-[#4d504a]">
                      {product.buzzWords}
                    </p>

                    <span
                      className="
                        mt-5
                        inline-flex
                        items-center
                        gap-2
                        text-xs
                        font-semibold
                        uppercase
                        tracking-[0.16em]
                        text-[#244a2c]
                      "
                    >
                      View product

                      <ArrowIcon />
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-[1.5rem] border border-[#2d382f]/10 bg-[#efe6d8] px-6 py-16 text-center sm:px-10 sm:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a3742b]">
              Coming soon
            </p>

            <h2 className="mt-4 font-serif text-3xl text-[#2d382f] sm:text-4xl">
              This collection is still growing.
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#4d504a] sm:text-base">
              We’re preparing more Herbalur products for this
              collection. Explore the rest of the shop in the
              meantime.
            </p>

            <Link
              href="/"
              className="
                mt-7
                inline-flex
                min-h-12
                items-center
                justify-center
                gap-2
                rounded-sm
                bg-[#244a2c]
                px-6
                text-xs
                font-semibold
                uppercase
                tracking-[0.16em]
                text-white
                transition
                hover:bg-[#193820]
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-[#244a2c]
                focus-visible:ring-offset-4
                focus-visible:ring-offset-[#efe6d8]
              "
            >
              Return home

              <ArrowIcon />
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

function formatPrice(priceInCents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(priceInCents / 100);
}

function FilterIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="size-4"
    >
      <path
        d="M4 7H20M7 12H17M10 17H14"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="size-4 transition-transform duration-300 group-hover:translate-x-1"
    >
      <path
        d="M5 12H19M14 7L19 12L14 17"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
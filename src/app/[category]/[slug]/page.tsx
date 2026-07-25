import IngredientCard from "@/components/cards/Ingredient";
import AddToCartPanel from "@/components/sections/productpage/AddToCartPanel";
import ReviewGraph from "@/components/sections/productpage/reviewGraph";
import ReviewStars from "@/components/sections/productpage/reviewStars";
import Review from "@/components/sections/productpage/reviews";
import { prisma } from "@/lib/prisma";
import Image from "next/image";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      details: true,
      ingredients: true,
      reviews: {
        where: {
          approved: true,
        },
      },
    },
  });

  if (!product) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#faf8f4] px-6">
        <div className="text-center">
          <h1 className="font-serif text-4xl text-[#1f2e22]">
            Product not found
          </h1>

          <p className="mt-3 text-sm text-[#68645e]">
            This product may no longer be available.
          </p>
        </div>
      </main>
    );
  }

  const reviewCount = product.reviews.length;

  const averageRating =
    reviewCount > 0
      ? product.reviews.reduce(
          (total, review) => total + review.rating,
          0,
        ) / reviewCount
      : 0;

  const firstReview = product.reviews[0];

  return (
    <main className="bg-[#faf8f4] text-[#282924]">
      {/* Breadcrumbs */}
      <div className="border-b border-[#dfdbd3]">
        <div className="mx-auto max-w-7xl px-5 py-5 sm:px-8 lg:px-10">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#6e6b64]">
            <span>Home</span>
            <span>/</span>
            <span>{product.category}</span>
            <span>/</span>
            <span className="text-[#27392a]">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Product information section */}
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)] lg:gap-16">
          {/* Left product content */}
          <div className="min-w-0">
            {/* Product image */}
            <div className="relative aspect-[4/4.25] overflow-hidden rounded-xl bg-[#eee9e1]">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 62vw"
                className="object-cover"
              />
            </div>

            {/* Brand value strip */}
            <div className="mt-10 grid border-y border-[#dfdbd3] py-8 sm:grid-cols-3">
              <Feature
                icon="♧"
                title="Clean ingredients"
                description="Naturally inspired and carefully selected."
              />

              <Feature
                icon="♙"
                title="No harsh chemicals"
                description="Made without unnecessary harsh additives."
                bordered
              />

              <Feature
                icon="♡"
                title="Cruelty free"
                description="Made with care and never tested on animals."
                bordered
              />
            </div>

            {/* Highlights */}
            <section className="mt-12">
              <SectionHeading>Highlights</SectionHeading>

              <ul className="mt-5 space-y-3 pl-5 text-[15px] leading-7 text-[#4b4944]">
                {product.details?.highlight1 && (
                  <li className="list-disc">
                    {product.details.highlight1}
                  </li>
                )}

                {product.details?.highlight2 && (
                  <li className="list-disc">
                    {product.details.highlight2}
                  </li>
                )}

                {product.details?.highlight3 && (
                  <li className="list-disc">
                    {product.details.highlight3}
                  </li>
                )}
              </ul>
            </section>

            {/* Ingredients */}
            {product.ingredients.length > 0 && (
              <section className="mt-14">
                <SectionHeading>Magic Ingredients</SectionHeading>

                <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {product.ingredients.map((ingredient) => (
                    <IngredientCard
                      key={ingredient.id}
                      name={ingredient.name}
                      description={ingredient.description}
                      image={
                        ingredient.imageUrl || "/default-image.jpg"
                      }
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Product details and usage */}
            <section className="mt-14 grid gap-10 border-b border-[#dfdbd3] pb-14 md:grid-cols-2 md:gap-14">
              <div>
                <SectionHeading>About this product</SectionHeading>

                <p className="mt-4 text-[15px] leading-7 text-[#54514b]">
                  {product.description}
                </p>
              </div>

              <div>
                <SectionHeading>How to use</SectionHeading>

                <p className="mt-4 text-[15px] leading-7 text-[#54514b]">
                  {product.details?.howToUse ||
                    "Usage instructions will be added soon."}
                </p>
              </div>
            </section>
          </div>

          {/* Sticky product purchasing panel */}
          <aside className="lg:sticky lg:top-28">
            <AddToCartPanel
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                imageUrl: product.imageUrl,
              }}
              description={product.description}
              buzzWords={product.buzzWords}
              averageRating={averageRating}
              reviewCount={reviewCount}
            />
          </aside>
        </div>
      </section>

      {/* Reviews begin outside the sticky product grid */}
      <section className="border-t border-[#dfdbd3] bg-[#f7f4ef]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            {/* Rating summary */}
            <div className="lg:border-r lg:border-[#dfdbd3] lg:pr-16">
              <p className="font-serif text-7xl leading-none text-[#252b25]">
                {averageRating.toFixed(1)}
              </p>

              <div className="mt-4">
                <ReviewStars rating={averageRating} />
              </div>

              <p className="mt-3 text-sm text-[#5d5a54]">
                {reviewCount > 0
                  ? `${averageRating.toFixed(
                      1,
                    )}/5 from ${reviewCount} verified ${
                      reviewCount === 1 ? "review" : "reviews"
                    }`
                  : "No reviews yet"}
              </p>

              <div className="mt-8">
                <ReviewGraph reviews={product.reviews} />
              </div>
            </div>

            {/* Featured review */}
            <div>
              <div className="flex items-center justify-between">
                <SectionHeading>Customer Reviews</SectionHeading>

                {reviewCount > 0 && (
                  <span className="rounded-full border border-[#d7d2ca] px-4 py-2 text-xs text-[#66625c]">
                    {reviewCount}{" "}
                    {reviewCount === 1 ? "review" : "reviews"}
                  </span>
                )}
              </div>

              {firstReview ? (
                <div className="mt-8">
                  <Review
                    rating={firstReview.rating}
                    reviewCount={reviewCount}
                    profilePic={firstReview.pfpUrl}
                    name={firstReview.name}
                    subject={firstReview.subject}
                    description={firstReview.comment}
                  />
                </div>
              ) : (
                <div className="mt-8 rounded-xl border border-[#dfdbd3] bg-[#fcfaf7] p-8">
                  <h3 className="font-serif text-2xl text-[#26432c]">
                    Be the first to review
                  </h3>

                  <p className="mt-3 max-w-lg text-sm leading-6 text-[#65615b]">
                    Share your experience with this product and help
                    future customers find the right addition to their
                    routine.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

type SectionHeadingProps = {
  children: React.ReactNode;
};

function SectionHeading({ children }: SectionHeadingProps) {
  return (
    <h2 className="font-serif text-2xl font-normal tracking-[-0.02em] text-[#2c5937] sm:text-[28px]">
      {children}
    </h2>
  );
}

type FeatureProps = {
  icon: string;
  title: string;
  description: string;
  bordered?: boolean;
};

function Feature({
  icon,
  title,
  description,
  bordered = false,
}: FeatureProps) {
  return (
    <div
      className={[
        "flex gap-4 px-4 py-5 sm:py-0 sm:px-6",
        bordered
          ? "border-t border-[#dfdbd3] sm:border-l sm:border-t-0"
          : "",
      ].join(" ")}
    >
      <span
        aria-hidden="true"
        className="font-serif text-4xl leading-none text-[#315b3c]"
      >
        {icon}
      </span>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-[#292d29]">
          {title}
        </h3>

        <p className="mt-3 text-sm leading-6 text-[#5c5953]">
          {description}
        </p>
      </div>
    </div>
  );
}
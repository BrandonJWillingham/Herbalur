import AboutProductCard from "@/components/cards/AboutProdCard";
import Image from "next/image";

const featuredProducts = [
  {
    src: "/images/products/turmeric-face-body-scrub.webp",
    prodName: "Turmeric Glow Scrub",
    prodDescription: "Exfoliates • Brightens • Smooths",
    price: 2200,
    href: "/products/turmeric-glow-up-face-body-scrub",
  },
  {
    src: "/images/products/hair-growth-oil.webp",
    prodName: "Batana Hair Growth Oil",
    prodDescription: "Nourishes • Strengthens • Restores",
    price: 2400,
    href: "/products/batana-fenugreek-hair-growth-oil",
  },
];

export default function AboutCallToAction() {
  return (
    <section
      aria-labelledby="about-cta-heading"
      className="bg-[#faf7f2] px-6 py-16 sm:px-10 sm:py-20 lg:py-24"
    >
      <div className="mx-auto grid max-w-[1320px] gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 xl:gap-20">
        {/* Featured products */}
        <div>
          <div className="mb-8 flex flex-col gap-4 border-b border-[#e5dfd6] pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a3742b]">
                Herbalur Favorites
              </p>

              <h2
                id="about-cta-heading"
                className="mt-3 font-serif text-3xl leading-tight tracking-[-0.025em] text-[#2d382f] sm:text-4xl"
              >
                Everyday care, thoughtfully made.
              </h2>
            </div>

            <a
              href="/body"
              className="w-fit text-xs font-semibold uppercase tracking-[0.18em] text-[#244a2c] underline decoration-[#b88235] decoration-1 underline-offset-3 transition-colors hover:text-[#a3742b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#244a2c] focus-visible:ring-offset-4"
            >
              Shop all products
            </a>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 sm:gap-6">
            {featuredProducts.map((product) => (
              <AboutProductCard key={product.prodName} {...product} />
            ))}
          </div>
        </div>

        {/* Founder message */}
        <aside
          aria-labelledby="founder-note-heading"
          className="relative overflow-hidden bg-[#efe6d8]"
        >
          <div className="grid min-h-full md:grid-cols-[0.95fr_1.05fr] lg:grid-cols-1 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="relative min-h-[390px] md:min-h-[500px] lg:min-h-[440px] xl:min-h-[560px]">
              <Image
                src="/images/founder/sharon.jpg"
                alt="Sharon, founder of Herbalur"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 45vw, 24vw"
                className="object-cover object-top"
              />

              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#193820]/20 via-transparent to-transparent"
              />
            </div>

            <div className="relative flex flex-col justify-center px-7 py-10 sm:px-9 sm:py-12 xl:px-10">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a3742b]">
                A Note From Our Founder
              </p>

              <h2
                id="founder-note-heading"
                className="mt-4 font-serif text-3xl leading-tight tracking-[-0.025em] text-[#2d382f]"
              >
                More than skincare.
              </h2>

              <div
                aria-hidden="true"
                className="mt-5 h-px w-12 bg-[#b88235]"
              />

              <blockquote className="mt-6">
                <p className="font-serif text-xl leading-8 text-[#2d382f] sm:text-2xl sm:leading-9">
                  “Herbalur will always be more than a brand to me. It is a
                  promise to create skincare I trust for my family and yours,
                  now and for years to come.”
                </p>
              </blockquote>

              <div className="mt-8">
                <p className="text-base font-semibold text-[#2d382f]">
                  Thank you for being part of our journey.
                </p>

                <p className="mt-5 font-serif text-3xl italic text-[#244a2c]">
                  Sharon
                </p>

                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#4d504a]">
                  Founder, Herbalur
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
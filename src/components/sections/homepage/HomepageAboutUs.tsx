import Image from "next/image";
import Link from "next/link";

export default function HomepageAboutUs() {
  return (
    <section
      id="about"
      aria-labelledby="homepage-about-heading"
      className="overflow-hidden bg-[#f7f1e8]"
    >
      <div className="mx-auto grid max-w-[1440px] items-center gap-12 px-6 py-16 sm:px-10 sm:py-20 lg:min-h-[650px] lg:grid-cols-[0.95fr_1.05fr] lg:gap-16 lg:px-14 xl:px-20">
        {/* Text content */}
        <div className="relative z-10">
          <div className="max-w-[520px]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a3742b] sm:text-sm">
              Our Mission
            </p>

            <h2
              id="homepage-about-heading"
              className="mt-5 font-serif text-[44px] font-normal leading-[1.02] tracking-[-0.04em] text-[#2d382f] sm:text-5xl lg:text-[60px]"
            >
              Rooted in nature.
              <br />
              Made for real life.
            </h2>

            <div
              aria-hidden="true"
              className="mt-7 h-[2px] w-14 bg-[#b88235]"
            />

            <div className="mt-7 max-w-[470px] space-y-4 text-[15px] leading-7 text-[#4d504a] sm:text-base">
              <p>
                Herbalur was created to redefine self-care through the power
                of nature. We combine clean ingredients, intentional
                formulations, and everyday rituals to help people feel
                confident, restored, and connected to their natural beauty.
              </p>

              <p>
                Thoughtfully made without compromising on quality,
                transparency, or care.
              </p>
            </div>

            <Link
              href="/about"
              className="mt-8 inline-flex min-h-12 items-center justify-center gap-5 rounded-sm bg-[#244a2c] px-6 py-3 text-xs font-semibold uppercase tracking-[0.13em] text-white transition-colors hover:bg-[#18371f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#244a2c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f1e8]"
            >
              Learn more about us

              <span aria-hidden="true" className="text-lg leading-none">
                →
              </span>
            </Link>
          </div>
        </div>

        {/* Image composition */}
        <div className="relative mx-auto w-full max-w-[690px]">
          {/* Soft background shape */}
          <div
            aria-hidden="true"
            className="absolute -inset-x-4 -inset-y-5 rounded-[40px] bg-[#efe6d8]/70 sm:-inset-x-6 sm:-inset-y-7"
          />

          {/* Decorative glow */}
          <div
            aria-hidden="true"
            className="absolute -right-10 top-1/2 h-52 w-52 -translate-y-1/2 rounded-full bg-[#d7bd95]/20 blur-3xl"
          />

          <figure className="relative overflow-hidden rounded-[28px] bg-[#eadfce] shadow-[0_18px_45px_rgba(72,57,42,0.10)]">
            <div className="relative aspect-[4/3] w-full sm:aspect-[16/11] lg:aspect-[5/4]">
              <Image
                src="/images/ingredients/naturalIngredient.webp"
                alt="Fresh ginger roots, sliced ginger, and ground ginger powder beside an open metal container"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
              />

              {/* Gentle tonal blending */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[#d9bd91]/8 mix-blend-multiply"
              />

              {/* Left fade into the page background */}
              <div
                aria-hidden="true"
                className="absolute inset-y-0 left-0 hidden w-24 bg-gradient-to-r from-[#f7f1e8]/65 via-[#f7f1e8]/20 to-transparent lg:block"
              />

              {/* Soft perimeter treatment */}
              <div
                aria-hidden="true"
                className="absolute inset-0 ring-1 ring-inset ring-[#d9cdbc]/70"
              />

              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#8c7356]/10 to-transparent"
              />
            </div>

            <figcaption className="sr-only">
              Ginger ingredients representing Herbalur&apos;s nature-inspired
              formulations.
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
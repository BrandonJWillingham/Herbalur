import Link from "next/link";
import HeroBenefits from "@/components/cards/HeroBenefits";

export default function HomepageHero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#f7f1e8]">
      {/* Desktop hero */}
      <div className="relative hidden min-h-[700px] lg:block">
        {/* Consistent cream background */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-30 bg-[#f7f1e8]"
        />

        {/* Right-side video panel */}
        <div className="absolute inset-y-0 right-0 -z-20 w-[52%] overflow-hidden bg-[#d8d0c5]">
          <video
            autoPlay
            loop
            muted
            playsInline
            src="/videos/heroMuted.mP4"
            preload="auto"
            aria-hidden="true"
            className="h-full w-full object-fill object-right"
          >
          </video>

          {/* Slight shadow at bottom for caption readability */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent"
          />
        </div>

        {/* Narrow cream-to-video blend */}
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-[48%] -z-10 w-[72px] bg-gradient-to-r from-[#f7f1e8] via-[#f7f1e8]/90 to-transparent"
        />

        <div className="relative mx-auto min-h-[700px] max-w-[1440px]">
          {/* Left-side text content */}
          <div className="flex min-h-[700px] w-[48%] flex-col px-14 xl:px-20">
            <div className="flex flex-1 items-center pb-[190px] pt-12">
              <div className="max-w-[510px]">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9d6d25]">
                  About Herbalur
                </p>

                <h1 className="mt-5 font-serif text-[66px] font-normal leading-[0.96] tracking-[-0.045em] text-[#292c27]">
                  Authentic
                  <br />
                  ingredients.
                  <br />
                  Real results.
                </h1>

                <div className="mt-7 h-[2px] w-14 bg-[#b47b2b]" />

                <p className="mt-7 max-w-[430px] text-base leading-7 text-[#41433e]">
                  We create clean, effective skincare and body care using
                  nature&apos;s most powerful ingredients—so you can feel
                  confident in the skin you&apos;re in.
                </p>

                <Link
                  href="#collections"
                  className="mt-8 inline-flex min-h-12 items-center gap-5 rounded-sm bg-[#244a2c] px-6 text-xs font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#18371f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#244a2c] focus-visible:ring-offset-2"
                >
                  Explore our collections

                  <span aria-hidden="true" className="text-lg">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="absolute bottom-0 left-0 w-[58%] border-t border-[#ddd5ca] bg-[#f8f3ec]/95 backdrop-blur-sm">
            <div className="grid grid-cols-3 divide-x divide-[#ddd5ca]">
              <HeroBenefits
                iconSrc="/icons/herbalur-leaf.svg"
                altText=""
                benefit="Clean ingredients"
                benefitDescription="Always natural. Always effective."
              />

              <HeroBenefits
                iconSrc="/icons/herbalur-flask-icon.svg"
                altText=""
                benefit="No harsh chemicals"
                benefitDescription="No sulfates, parabens, or toxins."
              />

              <HeroBenefits
                iconSrc="/icons/cruelty-free.svg"
                altText=""
                benefit="Cruelty free"
                benefitDescription="Made with care, not cruelty."
              />
            </div>
          </div>

          {/* Product caption */}
          <div className="absolute bottom-36 right-10 max-w-[420px] text-right text-white drop-shadow-md xl:right-16">
            <p className="font-serif text-2xl">
              Turmeric and Kojic Acid Soap
            </p>

            <p className="mt-2 text-sm text-white/90">
              Herbalur oils designed to enrich melanin-rich skin
            </p>
          </div>
        </div>
      </div>

      {/* Mobile and tablet hero */}
      <div className="lg:hidden">
        {/* Text area */}
        <div className="px-6 py-14 sm:px-10 sm:py-16">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9d6d25]">
              About Herbalur
            </p>

            <h1 className="mt-5 font-serif text-[48px] font-normal leading-[0.98] tracking-[-0.04em] text-[#292c27] sm:text-6xl">
              Authentic ingredients.
              <br />
              Real results.
            </h1>

            <div className="mt-6 h-[2px] w-14 bg-[#b47b2b]" />

            <p className="mt-6 max-w-md text-base leading-7 text-[#41433e]">
              We create clean, effective skincare and body care using
              nature&apos;s most powerful ingredients—so you can feel
              confident in the skin you&apos;re in.
            </p>

            <Link
              href="#collections"
              className="mt-8 inline-flex min-h-12 items-center gap-5 rounded-sm bg-[#244a2c] px-6 text-xs font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#18371f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#244a2c] focus-visible:ring-offset-2"
            >
              Explore our collections

              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        {/* Mobile video */}
        <div className="relative aspect-[4/5] overflow-hidden bg-[#d8d0c5] sm:aspect-video">
          <video
            autoPlay
            loop
            muted
            playsInline
            src="/videos/heroMuted.mP4"
            preload="auto"
            aria-hidden="true"
            className="h-full w-full object-contain object-center"
          >
            <source src="/videos/heroMuted.mp4" type="video/mp4" />
          </video>

          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/50 to-transparent"
          />

          <div className="absolute bottom-6 right-6 max-w-xs text-right text-white">
            <p className="font-serif text-xl">
              Turmeric and Kojic Acid Soap
            </p>

            <p className="mt-1 text-xs text-white/85">
              Herbalur oils designed to enrich melanin-rich skin
            </p>
          </div>
        </div>

        {/* Mobile benefits */}
        <div className="grid divide-y divide-[#ddd5ca] border-b border-t border-[#ddd5ca] bg-[#f8f3ec] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <HeroBenefits
            iconSrc="/icons/herbalur-leaf.svg"
            altText=""
            benefit="Clean ingredients"
            benefitDescription="Always natural. Always effective."
          />

          <HeroBenefits
            iconSrc="/icons/herbalur-flask-icon.svg"
            altText=""
            benefit="No harsh chemicals"
            benefitDescription="No sulfates, parabens, or toxins."
          />

          <HeroBenefits
            iconSrc="/icons/cruelty-free.svg"
            altText=""
            benefit="Cruelty free"
            benefitDescription="Made with care, not cruelty."
          />
        </div>
      </div>
    </section>
  );
}
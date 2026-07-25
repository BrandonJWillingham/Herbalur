import Image from "next/image";

export default function AboutStory() {
  return (
    <section
      aria-labelledby="about-story-heading"
      className="overflow-hidden bg-[#faf7f2] px-6 py-16 sm:px-10 sm:py-20 lg:py-28"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16 xl:gap-20">
        {/* Founder image */}
        <div className="relative mx-auto w-full max-w-[520px] lg:max-w-none">
          <div className="relative aspect-[4/5] overflow-hidden bg-[#efe6d8]">
            <Image
              src="/images/founder/sharon.jpg"
              alt="Sharon, founder of Herbalur, speaking at a podium"
              fill
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover object-[50%_30%]"
            />

            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-[#193820]/20 via-transparent to-transparent"
            />
          </div>

          {/* Decorative frame */}
          <div
            aria-hidden="true"
            className="absolute -bottom-4 -right-4 -z-10 h-full w-full border border-[#b88235]/40 sm:-bottom-6 sm:-right-6"
          />

          {/* Founder label */}
          <div className="absolute bottom-5 left-5 bg-[#faf7f2]/95 px-4 py-3 shadow-sm backdrop-blur-sm sm:bottom-6 sm:left-6 sm:px-5">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#a3742b]">
              Sharon
            </p>
            <p className="mt-1 text-sm text-[#2d382f]">
              Founder of Herbalur
            </p>
          </div>
        </div>

        {/* Story content */}
        <div className="lg:py-6">
          <p className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#a3742b] sm:text-sm">
            <span
              aria-hidden="true"
              className="h-px w-8 bg-[#b88235]"
            />
            Our Story
          </p>

          <h2
            id="about-story-heading"
            className="max-w-2xl font-serif text-[clamp(2.4rem,5vw,4.75rem)] font-normal leading-[1.02] tracking-[-0.035em] text-[#2d382f]"
          >
            From a Mother&apos;s Search to a Brand You Can Trust
          </h2>

          <div className="mt-7 h-px w-16 bg-[#b88235] sm:mt-8" />

          <div className="mt-7 max-w-2xl space-y-5 text-base leading-7 text-[#4d504a] sm:text-[1.0625rem] sm:leading-8">
            <p className="font-medium text-[#2d382f]">
              Herbalur began with a simple mission: to create safe and
              effective skincare for my daughters.
            </p>

            <p>
              When my daughters struggled with eczema, I tried countless
              products, but many were filled with harsh ingredients or failed
              to provide lasting results.
            </p>

            <p>
              So I returned to nature and to the wisdom passed down to me. I
              began creating skincare with simple, purposeful ingredients.
              What started with body lotion and turmeric soap has grown into a
              trusted solution for hundreds of families.
            </p>

            <p>
              Every Herbalur product is made with care, guided by tradition,
              and supported by thoughtful skincare science.
            </p>
          </div>

          <blockquote className="mt-9 border-l-2 border-[#b88235] pl-5 sm:mt-10 sm:pl-6">
            <p className="font-serif text-xl leading-8 text-[#2d382f] sm:text-2xl sm:leading-9">
              “What began as a mother&apos;s search became a promise to help
              other families feel confident in the products they use.”
            </p>

            <footer className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#a3742b]">
              Sharon, Founder
            </footer>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
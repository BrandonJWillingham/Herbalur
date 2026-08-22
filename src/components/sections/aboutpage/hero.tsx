import Image from "next/image";

export default function AboutHero() {
  return (
    <section
      aria-labelledby="about-hero-heading"
      className="relative overflow-hidden bg-[#f7f1e8]"
    >
      <div className="mx-auto max-w-[1600px]">
        <div className="relative grid min-h-[680px] lg:min-h-[720px] lg:grid-cols-[0.9fr_1.1fr]">
          {/* Text content */}
          <div className="relative z-20 flex items-center bg-[#f7f1e8] px-6 py-16 sm:px-10 sm:py-20 lg:bg-transparent lg:px-14 lg:py-24 xl:px-20">
            <div className="max-w-xl">
              <p className="mb-5 text-xs font-medium uppercase tracking-[0.22em] text-[#a3742b] sm:text-sm">
                About Herbalur
              </p>

              <h1
                id="about-hero-heading"
                className="font-serif text-[clamp(2.8rem,6vw,5.75rem)] font-normal leading-[0.98] tracking-[-0.035em] text-[#2d382f]"
              >
                Rooted in Care.
                <span className="mt-2 block">Crafted with Purpose.</span>
              </h1>

              <div
                aria-hidden="true"
                className="my-7 h-px w-16 bg-[#b88235] sm:my-9"
              />

              <p className="max-w-md text-base leading-7 text-[#4d504a] sm:text-lg sm:leading-8">
                Every product we create is inspired by nature, crafted with
                intention, and made to help you feel confident in your skin—naturally.
              </p>
            </div>
          </div>

          {/* Image */}
          <div className="relative min-h-[360px] sm:min-h-[480px] lg:absolute lg:inset-0 lg:min-h-0 ">
            <Image
              src="/images/hero/botanical-Ginger.webp"
              alt="Ginger root and botanical stems arranged in a ceramic bowl"
              fill
              priority
              sizes="100vw"
              className="object-cover object-[58%_center] right-0"
            />

            {/* Desktop blend between copy and photo */}
            <div
              aria-hidden="true"
              className="absolute inset-0 hidden bg-[linear-gradient(90deg,#f7f1e8_0%,rgba(247,241,232,0.98)_28%,rgba(247,241,232,0.78)_43%,rgba(247,241,232,0.18)_58%,transparent_72%)] lg:block"
            />

            {/* Keeps the image from becoming too dark on mobile */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#193820]/10 lg:hidden"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
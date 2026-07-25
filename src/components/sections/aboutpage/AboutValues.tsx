import IconCard from "@/components/cards/AboutIconCard";

const values = [
  {
    src: "/icons/herbalur-leaf.svg",
    subHeader: "Natural & Purposeful",
    description:
      "Thoughtfully chosen ingredients inspired by nature and selected for meaningful everyday care.",
  },
  {
    src: "/icons/herbalur-flask-icon.svg",
    subHeader: "Handcrafted With Care",
    description:
      "Small-batch formulas created with intention, consistency, and close attention to detail.",
  },
  {
    src: "/icons/cruelty-free.svg",
    subHeader: "Made for Real People",
    description:
      "Gentle, practical skincare designed for sensitive skin and the concerns families face every day.",
  },
];

export default function AboutValues() {
  return (
    <section
      aria-labelledby="about-values-heading"
      className="bg-[#24452b] text-[#faf7f2]"
    >
      <div className="mx-auto max-w-[1320px] px-6 py-12 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)] lg:items-stretch lg:gap-12">
          <div>
            <div className="mb-8 sm:mb-10">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d6a64d] sm:text-sm">
                Why People Trust Herbalur
              </p>

              <h2
                id="about-values-heading"
                className="mt-3 max-w-xl font-serif text-3xl leading-tight tracking-[-0.025em] text-[#faf7f2] sm:text-4xl"
              >
                Thoughtful care, rooted in what matters.
              </h2>
            </div>

            <div className="grid border-y border-white/15 sm:grid-cols-3">
              {values.map((value, index) => (
                <div
                  key={value.subHeader}
                  className={
                    index === 0
                      ? ""
                      : "border-t border-white/15 sm:border-l sm:border-t-0"
                  }
                >
                  <IconCard {...value} />
                </div>
              ))}
            </div>
          </div>

          <aside className="flex">
            <figure className="flex w-full flex-col justify-center border-l border-[#d6a64d] pl-6 sm:pl-8 lg:pl-10">
              <span
                aria-hidden="true"
                className="font-serif text-4xl leading-none text-[#d6a64d]"
              >
                “
              </span>

              <blockquote className="mt-2">
                <p className="font-serif text-xl leading-[1.4] text-[#faf7f2] sm:text-2xl">
                  Herbalur changed my skin and my confidence. I finally found
                  products that feel effective, natural, and made with real
                  care.
                </p>
              </blockquote>

              <figcaption className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d6a64d]">
                  Ashley T.
                </p>

                <p className="mt-1 text-sm text-[#faf7f2]/65">
                  Herbalur customer
                </p>
              </figcaption>
            </figure>
          </aside>
        </div>
      </div>
    </section>
  );
}
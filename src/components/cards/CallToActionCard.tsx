import Link from "next/link";

type Props = {
  href: string;

  backgroundImage: string;

  title: string;
  subtitle: string;
  description: string;

  dark?: boolean;
};

export default function CallToActionCard({
  href,
  backgroundImage,
  title,
  subtitle,
  description,
  dark = false,
}: Props) {
  return (
    <article
      className={`group relative h-[520px] overflow-hidden rounded-2xl border border-[#e6dfd4] ${
        dark
          ? "bg-[#26452c] text-white"
          : "bg-[#f8f5ef] text-[#2b2b27]"
      }`}
    >
      {/* Background image */}
      <div
        className="absolute inset-0 transition duration-700 group-hover:scale-105"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center bottom",
        }}
      />

      {/* Optional overlay for dark card */}
      {dark && (
        <div className="absolute inset-0 bg-black/10" />
      )}

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-between p-10">
        <div className="max-w-[220px]">
          <h2 className="font-serif text-5xl">
            {title}
          </h2>

          <p className="mt-6 text-xl leading-8">
            {subtitle}
          </p>

          <p
            className={`mt-5 text-sm leading-7 ${
              dark
                ? "text-white/85"
                : "text-[#5c5b56]"
            }`}
          >
            {description}
          </p>

          <Link
            href={href}
            className={`mt-8 inline-flex items-center gap-3 rounded-sm border px-5 py-3 text-xs font-semibold uppercase tracking-[0.15em] transition ${
              dark
                ? "border-white/40 hover:bg-white hover:text-[#26452c]"
                : "border-[#d7d2ca] hover:bg-[#26452c] hover:text-white"
            }`}
          >
            Shop {title}
            →
          </Link>
        </div>

        {/* Empty spacer */}
        <div />
      </div>
    </article>
  );
}
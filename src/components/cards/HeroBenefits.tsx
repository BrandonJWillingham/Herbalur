import Image from "next/image";

type HeroBenefitsProps = {
  iconSrc: string;
  altText?: string;
  width?: number;
  height?: number;
  benefit: string;
  benefitDescription: string;
};

export default function HeroBenefits({
  iconSrc,
  altText = "",
  width = 42,
  height = 42,
  benefit,
  benefitDescription,
}: HeroBenefitsProps) {
  return (
    <article className="flex items-start gap-4 px-2 py-6 sm:flex-col sm:items-center sm:px-5 sm:py-8 sm:text-center lg:px-7 opacity-80">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center">
        <Image
          src={iconSrc}
          alt={altText}
          width={width}
          height={height}
          className="h-auto w-auto object-contain"
        />
      </div>

      <div>
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#30342f]">
          {benefit}
        </h2>

        <p className="mt-2 max-w-[180px] text-xs leading-5 text-[#555650]">
          {benefitDescription}
        </p>
      </div>
    </article>
  );
}
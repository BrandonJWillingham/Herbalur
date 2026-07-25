import Image from "next/image";
import Link from "next/link";

type AboutProductCardProps = {
  src: string;
  prodName: string;
  prodDescription: string;
  price: number;
  href: string;
};

export default function AboutProductCard({
  src,
  prodName,
  prodDescription,
  price,
  href,
}: AboutProductCardProps) {
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price / 100);

  return (
    <article className="group">
      <Link
        href={href}
        aria-label={`View ${prodName}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#244a2c] focus-visible:ring-offset-4"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-[#efe6d8]">
          <Image
            src={src}
            alt={prodName}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 45vw, 27vw"
            className="object-contain p-6 transition-transform duration-500 group-hover:scale-[1.025] motion-reduce:transition-none"
          />

          <div className="absolute inset-x-0 bottom-0 translate-y-full bg-[#244a2c] px-5 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#faf7f2] transition-transform duration-300 group-hover:translate-y-0 group-focus-within:translate-y-0 motion-reduce:transition-none">
            View product
          </div>
        </div>

        <div className="pt-5 text-center">
          <h3 className="font-serif text-xl leading-snug text-[#2d382f]">
            {prodName}
          </h3>

          <p className="mt-2 text-xs uppercase tracking-[0.12em] text-[#4d504a]">
            {prodDescription}
          </p>

          <p className="mt-3 text-sm font-semibold text-[#244a2c]">
            {formattedPrice}
          </p>
        </div>
      </Link>
    </article>
  );
}
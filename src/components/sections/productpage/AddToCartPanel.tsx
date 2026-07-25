"use client";

import ReviewStars from "@/components/sections/productpage/reviewStars";
import { useCartStore } from "@/store/cartStore";

type CartProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string;
};

type AddToCartPanelProps = {
  product: CartProduct;
  description: string;
  buzzWords: string;
  averageRating: number;
  reviewCount: number;
};

export default function AddToCartPanel({
  product,
  description,
  buzzWords,
  averageRating,
  reviewCount,
}: AddToCartPanelProps) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      imageUrl: product.imageUrl,
    });
  };

  return (
    <div className="rounded-xl border border-[#ded9d0] bg-[#fcfaf7] p-6 shadow-[0_12px_35px_rgba(54,48,40,0.06)] sm:p-8">
      <p className="text-xs uppercase tracking-[0.14em] text-[#6d756c]">
        Herbalur skincare
      </p>

      <h1 className="mt-3 font-serif text-4xl font-normal leading-[1.08] tracking-[-0.035em] text-[#252823] sm:text-5xl">
        {product.name}
      </h1>

      {buzzWords && (
        <p className="mt-4 text-sm font-medium tracking-wide text-[#38583e]">
          {buzzWords}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <ReviewStars rating={averageRating} />

        <span className="text-xs text-[#5f5b55]">
          {reviewCount > 0
            ? `(${reviewCount} ${
                reviewCount === 1 ? "review" : "reviews"
              })`
            : "(No reviews yet)"}
        </span>
      </div>

      <div className="my-7 h-px bg-[#dfdbd3]" />

      <p className="text-[15px] leading-7 text-[#4e4b45]">
        {description}
      </p>

      <div className="mt-8 flex items-center justify-between border-y border-[#dfdbd3] py-4">
        <span className="text-sm text-[#5e5b55]">Price</span>

        <span className="font-serif text-2xl text-[#283d2c]">
          ${(product.price / 100).toFixed(2)}
        </span>
      </div>

      <button
        type="button"
        onClick={handleAddToCart}
        className="mt-6 flex min-h-14 w-full items-center justify-center rounded-sm bg-[#233f27] px-6 text-base font-medium text-white transition duration-200 hover:bg-[#172d1b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315b3c] focus-visible:ring-offset-2 active:scale-[0.99]"
      >
        Add to bag
        <span className="mx-3 h-4 w-px bg-white/40" />
        ${(product.price / 100).toFixed(2)}
      </button>

      <div className="mt-5 flex items-start gap-3 rounded-md bg-[#f2efe9] p-4">
        <span
          aria-hidden="true"
          className="mt-0.5 text-lg text-[#315b3c]"
        >
          ♧
        </span>

        <p className="text-xs leading-5 text-[#5b5852]">
          Thoughtfully made with naturally inspired ingredients and
          packaged with care.
        </p>
      </div>
    </div>
  );
}
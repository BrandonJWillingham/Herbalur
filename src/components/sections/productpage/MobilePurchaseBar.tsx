"use client";

import { useState } from "react";
import Image from "next/image";
import AddToCartPanel from "@/components/sections/productpage/AddToCartPanel";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string;
};

type MobilePurchaseBarProps = {
  product: Product;
  description: string;
  buzzWords: string;
  averageRating: number;
  reviewCount: number;
};

export default function MobilePurchaseBar({
  product,
  description,
  buzzWords,
  averageRating,
  reviewCount,
}: MobilePurchaseBarProps) {
  const [open, setOpen] = useState(false);

  const formattedPrice = (product.price / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  return (
    <>
      {/* Mobile fixed purchase bar */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#ddd8cf] bg-[#faf8f4]/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          {/* Product image */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#eee9e1]"
            aria-label="View purchase details"
          >
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="56px"
              className="object-cover"
            />
          </button>

          {/* Product information */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="min-w-0 flex-1 text-left"
          >
            <p className="truncate text-sm font-medium text-[#20251f]">
              {product.name}
            </p>

            <div className="mt-0.5 flex items-center gap-2">
              <span className="text-base font-semibold text-[#285437]">
                {formattedPrice}
              </span>

              {reviewCount > 0 && (
                <span className="text-xs text-[#777168]">
                  ★ {averageRating.toFixed(1)} ({reviewCount})
                </span>
              )}
            </div>
          </button>

          {/* Purchase button */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="shrink-0 rounded-full bg-[#234b30] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#183a24] active:scale-[0.98]"
          >
            Add to cart
          </button>
        </div>
      </div>

      {/* Backdrop */}
      {open && (
        <button
          type="button"
          aria-label="Close purchase options"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-[1px] lg:hidden"
        />
      )}

      {/* Purchase details bottom sheet */}
      <div
        className={[
          "fixed inset-x-0 bottom-0 z-[70] max-h-[85dvh] overflow-y-auto",
          "rounded-t-[28px] bg-[#faf8f4]",
          "shadow-[0_-16px_50px_rgba(0,0,0,0.18)]",
          "transition-transform duration-300 ease-out",
          "lg:hidden",
          open ? "translate-y-0" : "translate-y-full",
        ].join(" ")}
      >
        {/* Drawer handle */}
        <div className="sticky top-0 z-10 bg-[#faf8f4] px-5 pb-2 pt-3">
          <div className="mx-auto h-1 w-12 rounded-full bg-[#c9c4bb]" />

          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#817a70]">
                Purchase
              </p>

              <h2 className="mt-1 font-serif text-xl text-[#244c31]">
                {product.name}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ddd8cf] text-xl text-[#4d4a44]"
              aria-label="Close purchase details"
            >
              ×
            </button>
          </div>
        </div>

        {/* Full existing purchase component */}
        <div className="px-5 pb-[calc(2rem+env(safe-area-inset-bottom))]">
          <AddToCartPanel
            product={product}
            description={description}
            buzzWords={buzzWords}
            averageRating={averageRating}
            reviewCount={reviewCount}
          />
        </div>
      </div>
    </>
  );
}
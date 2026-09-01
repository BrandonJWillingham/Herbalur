"use client";

import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/Arrows";
import ReviewStars from "./reviewStars";
import ReviewGraph from "./reviewGraph";



type Review = {
    id: string;
    rating: number;
    name: string;
    subject: string | null;
    comment: string;
    productUrl: string | null;
};

type ReviewComponentProps = {
    reviews: Review[];
};

export default async function ReviewComponent({reviews} : ReviewComponentProps) {
    const [reviewIndex, setReviewIndex] = useState(0);


  const reviewCount = reviews.length;

    const averageRating =
        reviewCount > 0
        ? reviews.reduce(
            (total, review) => total + review.rating,
            0
            ) / reviewCount
        : 0;

    const review = reviews[reviewIndex] ?? null;
    return (
        <section className="border-t border-[#dfdbd3] bg-[#f7f4ef]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10 lg:py-20">
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            {/* Rating summary */}
            <div className="lg:border-r lg:border-[#dfdbd3] lg:pr-16">
                <p className="font-serif text-7xl leading-none text-[#252b25]">
                {averageRating.toFixed(1)}
                </p>

                <div className="mt-4">
                <ReviewStars rating={averageRating} />
                </div>

                <p className="mt-3 text-sm text-[#5d5a54]">
                {reviewCount > 0
                    ? `${averageRating.toFixed(
                        1,
                    )}/5 from ${reviewCount} verified ${
                        reviewCount === 1 ? "review" : "reviews"
                    }`
                    : "No reviews yet"}
                </p>

                <div className="mt-8">
                <ReviewGraph reviews={reviews} />
                </div>
            </div>

            {/* Featured review */}
            <div>
                <div className="flex items-center justify-between">
                <SectionHeading>Customer Reviews</SectionHeading>

                {reviewCount > 0 && (
                    <span className="rounded-full border border-[#d7d2ca] px-4 py-2 text-xs text-[#66625c]">
                    {reviewCount}{" "}
                    {reviewCount === 1 ? "review" : "reviews"}
                    </span>
                )}
                </div>
                
                <button
                onClick={() =>
                    setReviewIndex((prev) => (prev - 1 + reviewCount) % reviewCount)
                }
                >
                <ArrowLeftIcon />
                </button>

                <button
                onClick={() =>
                    setReviewIndex((prev) => (prev + 1) % reviewCount)
                }
                >
                <ArrowRightIcon />
                </button>


                {reviews ? (
                <div className="mt-8">
                    <ReviewCard
                    rating={reviews[reviewIndex]?.rating}
                    reviewCount={reviewCount}
                    name={reviews[reviewIndex]?.name}
                    subject={reviews[reviewIndex]?.subject ?? undefined}
                    description={reviews[reviewIndex]?.comment}
                    image={reviews[reviewIndex]?.productUrl ? reviews[reviewIndex]?.productUrl : undefined}
                    />
                </div>
                ) : (
                <div className="mt-8 rounded-xl border border-[#dfdbd3] bg-[#fcfaf7] p-8">
                    <h3 className="font-serif text-2xl text-[#26432c]">
                    Be the first to review
                    </h3>

                    <p className="mt-3 max-w-lg text-sm leading-6 text-[#65615b]">
                    Share your experience with this product and help
                    future customers find the right addition to their
                    routine.
                    </p>
                </div>
                )}
            </div>
            </div>
        </div>
        </section>
    );
}

function ReviewCard({ rating, reviewCount, name, subject, description, image }: { rating: number; reviewCount: number; name: string; subject?: string; description: string; image: string | undefined }) {
    return (
              <div>
            <div>
                <div>
                    <p>{name}</p>
                    <p>Rating: {rating} ({reviewCount} reviews)</p>                    
                </div>
                <h4>{subject? subject : "No subject"}</h4>
                <p> {description}</p>
                {image && (
                    <Image src={image} alt={`Review by ${name}`} className="mt-4" />
                )}
            </div>
            
        </div>
    );
}
type SectionHeadingProps = {
  children: React.ReactNode;
};
function SectionHeading({ children }: SectionHeadingProps) {
  return (
    <h2 className="font-serif text-2xl font-normal tracking-[-0.02em] text-[#2c5937] sm:text-[28px]">
      {children}
    </h2>
  );
}

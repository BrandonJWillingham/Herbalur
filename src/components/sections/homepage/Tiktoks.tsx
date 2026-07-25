"use client";

import {
  KeyboardEvent,
  PointerEvent,
  useRef,
  useState,
} from "react";

import FiveStars from "@/components/cards/FiveStars";
import TiktokCard from "@/components/cards/TiktokCard";

const videos = [
  {
    src: "/videos/tiktok1.mp4",
    caption:
      "@emilyskincarejourney: I’ve been using Herbalur for a month now and my skin has never looked better!",
  },
  {
    src: "/videos/tiktok2.mp4",
    caption:
      "@johndoe: Herbalur has completely transformed my skin!",
  },
  {
    src: "/videos/tiktok3.mp4",
    caption:
      "@sarahbeauty: I can’t believe the difference Herbalur has made in just a few weeks!",
  },
  {
    src: "/videos/tiktok4.mp4",
    caption:
      "@naturallyglowing: My skin feels softer, calmer, and more balanced after adding Herbalur to my routine.",
  },
  {
    src: "/videos/tiktok5.mp4",
    caption:
      "@skincarewithmia: This has quickly become one of my favorite products for keeping my skin moisturized.",
  },
  {
    src: "/videos/tiktok6.mp4",
    caption:
      "@thebodycareedit: Herbalur leaves my skin feeling clean without making it feel dry or stripped.",
  },
  {
    src: "/videos/tiktok7.mp4",
    caption:
      "@glowwithtay: I’ve been so impressed by how healthy and refreshed my skin looks.",
  },
  {
    src: "/videos/tiktok8.mp4",
    caption:
      "@selfcarewithnia: Simple ingredients, a beautiful texture, and results I can actually see.",
  },
];

export default function TikToks() {
  const carouselRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [startingScrollLeft, setStartingScrollLeft] = useState(0);

  const scrollCarousel = (direction: "previous" | "next") => {
    const carousel = carouselRef.current;

    if (!carousel) return;

    const firstCard = carousel.querySelector<HTMLElement>(
      "[data-tiktok-card]",
    );

    const cardWidth = firstCard?.offsetWidth ?? 320;
    const carouselGap = 24;
    const scrollDistance = cardWidth + carouselGap;

    carousel.scrollBy({
      left:
        direction === "next"
          ? scrollDistance
          : -scrollDistance,
      behavior: "smooth",
    });
  };

  const handlePointerDown = (
    event: PointerEvent<HTMLDivElement>,
  ) => {
    const carousel = carouselRef.current;

    if (!carousel) return;

    setIsDragging(true);
    setDragStartX(event.clientX);
    setStartingScrollLeft(carousel.scrollLeft);

    carousel.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (
    event: PointerEvent<HTMLDivElement>,
  ) => {
    const carousel = carouselRef.current;

    if (!carousel || !isDragging) return;

    const distanceMoved = event.clientX - dragStartX;

    carousel.scrollLeft =
      startingScrollLeft - distanceMoved;
  };

  const stopDragging = (
    event: PointerEvent<HTMLDivElement>,
  ) => {
    const carousel = carouselRef.current;

    setIsDragging(false);

    if (
      carousel?.hasPointerCapture(event.pointerId)
    ) {
      carousel.releasePointerCapture(
        event.pointerId,
      );
    }
  };

  const handleCarouselKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
  ) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollCarousel("next");
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollCarousel("previous");
    }
  };

  return (
    <section
      aria-labelledby="real-results-heading"
      className="overflow-hidden bg-[#f7f1e8] py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-[1440px]">
        <div className="flex items-end justify-between gap-6 px-6 sm:px-10 lg:px-12">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#a3742b] sm:text-sm">
              Herbalur Community
            </p>

            <h2
              id="real-results-heading"
              className="font-serif text-4xl font-normal leading-tight text-[#2d382f] sm:text-5xl lg:text-6xl"
            >
              Real People. Real Results.
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-[#4d504a] sm:text-base">
              See how real customers are making
              Herbalur part of their everyday
              self-care routines.
            </p>
          </div>

          <div
            className="hidden items-center gap-3 sm:flex"
            aria-label="Carousel controls"
          >
            <button
              type="button"
              onClick={() =>
                scrollCarousel("previous")
              }
              aria-label="View previous customer video"
              className="grid size-12 place-items-center rounded-full border border-[#244a2c]/30 text-[#244a2c] transition hover:border-[#244a2c] hover:bg-[#244a2c] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#244a2c] focus-visible:ring-offset-4 focus-visible:ring-offset-[#f7f1e8]"
            >
              <ArrowLeftIcon />
            </button>

            <button
              type="button"
              onClick={() =>
                scrollCarousel("next")
              }
              aria-label="View next customer video"
              className="grid size-12 place-items-center rounded-full bg-[#244a2c] text-white transition hover:bg-[#193820] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#244a2c] focus-visible:ring-offset-4 focus-visible:ring-offset-[#f7f1e8]"
            >
              <ArrowRightIcon />
            </button>
          </div>
        </div>

        <div className="relative mt-10 sm:mt-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-20 bg-gradient-to-r from-[#f7f1e8] to-transparent lg:block"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-24 bg-gradient-to-l from-[#f7f1e8] to-transparent lg:block"
          />

          <div
            ref={carouselRef}
            role="region"
            aria-label="Customer TikTok videos"
            tabIndex={0}
            onKeyDown={handleCarouselKeyDown}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={stopDragging}
            onPointerCancel={stopDragging}
            onPointerLeave={(event) => {
              if (isDragging) {
                stopDragging(event);
              }
            }}
            className={[
              "scrollbar-hide flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-5 sm:gap-6 sm:px-10 lg:px-12",
              "overscroll-x-contain scroll-smooth",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#244a2c]",
              isDragging
                ? "cursor-grabbing select-none snap-none"
                : "cursor-grab",
            ].join(" ")}
          >
            {videos.map((video, index) => (
              <TiktokCard
                key={video.src}
                src={video.src}
                caption={video.caption}
                number={index + 1}
              />
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center gap-3 px-6 sm:hidden">
          <button
            type="button"
            onClick={() =>
              scrollCarousel("previous")
            }
            aria-label="View previous customer video"
            className="grid size-11 place-items-center rounded-full border border-[#244a2c]/30 text-[#244a2c] transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#244a2c]"
          >
            <ArrowLeftIcon />
          </button>

          <p className="text-xs uppercase tracking-[0.18em] text-[#4d504a]">
            Swipe to explore
          </p>

          <button
            type="button"
            onClick={() =>
              scrollCarousel("next")
            }
            aria-label="View next customer video"
            className="grid size-11 place-items-center rounded-full bg-[#244a2c] text-white transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#244a2c] focus-visible:ring-offset-2"
          >
            <ArrowRightIcon />
          </button>
        </div>

        <div className="mt-10 flex flex-col items-center px-6 text-center sm:mt-12 sm:px-10">
          <FiveStars />

          <p className="mt-3 text-base text-[#4d504a] sm:text-lg">
            <span className="font-semibold text-[#2d382f]">
              4.9/5
            </span>{" "}
            from 2,000+ happy customers
          </p>
        </div>
      </div>
    </section>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="size-5"
    >
      <path
        d="M15 18L9 12L15 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="size-5"
    >
      <path
        d="M9 6L15 12L9 18"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
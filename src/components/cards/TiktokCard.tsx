"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  src: string;
  caption: string;
  number: number;
};

const VIDEO_PLAY_EVENT = "herbalur-tiktok-play";

export default function TiktokCard({
  src,
  caption,
  number,
}: Props) {
  const cardRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const card = cardRef.current;
    const video = videoRef.current;

    if (!card || !video) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const pauseWhenAnotherVideoPlays = (event: Event) => {
      const customEvent = event as CustomEvent<string>;

      if (customEvent.detail !== src && !video.paused) {
        video.pause();
      }
    };

    window.addEventListener(
      VIDEO_PLAY_EVENT,
      pauseWhenAnotherVideoPlays,
    );

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visibility = entry.intersectionRatio;

        /*
         * The video starts at 72% visibility,
         * but does not pause until it drops below 35%.
         *
         * This gap prevents rapid play/pause switching
         * near one visibility threshold.
         */
        const shouldPlay =
          entry.isIntersecting && visibility >= 0.72;

        const shouldPause =
          !entry.isIntersecting || visibility <= 0.35;

        if (shouldPause) {
          if (!video.paused) {
            video.pause();
          }

          return;
        }

        if (
          shouldPlay &&
          video.paused &&
          !prefersReducedMotion
        ) {
          window.dispatchEvent(
            new CustomEvent(VIDEO_PLAY_EVENT, {
              detail: src,
            }),
          );

          void video.play().catch(() => {
            setIsPlaying(false);
          });
        }
      },
      {
        threshold: [0, 0.35, 0.72, 1],
        rootMargin: "0px -8% 0px -8%",
      },
    );

    observer.observe(card);

    return () => {
      observer.disconnect();

      window.removeEventListener(
        VIDEO_PLAY_EVENT,
        pauseWhenAnotherVideoPlays,
      );

      video.pause();
    };
  }, [src]);

  const togglePlayback = async () => {
    const video = videoRef.current;

    if (!video) return;

    if (!video.paused) {
      video.pause();
      return;
    }

    window.dispatchEvent(
      new CustomEvent(VIDEO_PLAY_EVENT, {
        detail: src,
      }),
    );

    try {
      await video.play();
    } catch {
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;

    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  return (
    <article
      ref={cardRef}
      data-tiktok-card
      className="
        group
        w-[86vw]
        max-w-[390px]
        shrink-0
        snap-center
        sm:w-[360px]
        md:w-[375px]
        lg:w-[390px]
        xl:w-[400px]
        2xl:w-[410px]
      "
    >
      <div
        className="
          relative
          isolate
          overflow-hidden
          rounded-[1.75rem]
          bg-[#d8d0c4]
          shadow-[0_20px_55px_rgba(45,56,47,0.16)]
        "
      >
        {!hasLoaded && (
          <div
            aria-hidden="true"
            className="
              absolute
              inset-0
              z-0
              bg-gradient-to-b
              from-[#ded7cc]
              via-[#d2c9bc]
              to-[#b8afa3]
            "
          />
        )}

        <video
          ref={videoRef}
          src={src}
          muted
          loop
          playsInline
          preload="metadata"
          onLoadedData={() => setHasLoaded(true)}
          onCanPlay={() => setHasLoaded(true)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={() => setHasLoaded(true)}
          aria-label={`Customer result video ${number}`}
          className="
            relative
            z-[1]
            block
            aspect-[9/16]
            w-full
            bg-[#d8d0c4]
            object-cover
          "
        />

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            z-[2]
            bg-gradient-to-t
            from-black/70
            via-black/5
            to-black/20
          "
        />

        <div className="absolute left-4 top-4 z-10 sm:left-5 sm:top-5">
          <span
            className="
              inline-flex
              items-center
              rounded-full
              border
              border-white/20
              bg-black/35
              px-3
              py-1.5
              text-[0.625rem]
              font-semibold
              uppercase
              tracking-[0.2em]
              text-white
              backdrop-blur-md
              sm:text-[0.675rem]
            "
          >
            Customer Story
          </span>
        </div>

        <button
          type="button"
          onClick={toggleMute}
          aria-label={
            isMuted
              ? `Unmute customer video ${number}`
              : `Mute customer video ${number}`
          }
          className="
            absolute
            right-4
            top-4
            z-20
            grid
            size-11
            place-items-center
            rounded-full
            border
            border-white/20
            bg-black/40
            text-white
            backdrop-blur-md
            transition
            hover:bg-black/60
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-white
            focus-visible:ring-offset-2
            focus-visible:ring-offset-black/50
            sm:right-5
            sm:top-5
          "
        >
          {isMuted ? <MutedIcon /> : <VolumeIcon />}
        </button>

        <button
          type="button"
          onClick={togglePlayback}
          aria-label={
            isPlaying
              ? `Pause customer video ${number}`
              : `Play customer video ${number}`
          }
          className={[
            `
              absolute
              left-1/2
              top-1/2
              z-20
              grid
              size-16
              -translate-x-1/2
              -translate-y-1/2
              place-items-center
              rounded-full
              border
              border-white/45
              bg-black/35
              text-white
              backdrop-blur-md
              transition
              duration-300
              hover:scale-105
              hover:bg-black/55
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-white
              sm:size-[4.5rem]
            `,
            isPlaying
              ? "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
              : "opacity-100",
          ].join(" ")}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>

        <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-6">
          <p
            className="
              line-clamp-3
              text-sm
              leading-6
              text-white
              sm:text-base
              sm:leading-7
            "
          >
            {caption}
          </p>
        </div>
      </div>
    </article>
  );
}

function PlayIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="ml-1 size-7 sm:size-8"
    >
      <path
        d="M8 5.5V18.5L18 12L8 5.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="size-7 sm:size-8"
    >
      <path
        d="M8 6V18M16 6V18"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MutedIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="size-5"
    >
      <path
        d="M5 10V14H8L12 18V6L8 10H5Z"
        fill="currentColor"
      />

      <path
        d="M16 9L20 13M20 9L16 13"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function VolumeIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="size-5"
    >
      <path
        d="M5 10V14H8L12 18V6L8 10H5Z"
        fill="currentColor"
      />

      <path
        d="M15.5 9.5C16.25 10.2 16.25 13.8 15.5 14.5M18 7C20.5 9.5 20.5 14.5 18 17"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
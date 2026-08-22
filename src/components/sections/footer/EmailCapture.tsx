"use client";

import { useActionState, useEffect, useRef } from "react";

import {
  subscribeToNewsletter,
  type NewsletterState,
} from "@/app/actions/newsletter";
import { trackEvent } from "@/components/AnalyticsTracker";

const initialState: NewsletterState = {
  success: false,
  message: "",
};

export default function EmailCapture() {
  const [state, formAction, pending] = useActionState(
    subscribeToNewsletter,
    initialState,
  );

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="relative overflow-hidden bg-[#244a2c] text-white"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-16 -right-8 hidden text-[#d7b56d] opacity-30 lg:block"
      >
        <LeafDecoration />
      </div>

      <div className="relative mx-auto grid max-w-[1440px] gap-8 px-6 py-12 sm:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16 lg:px-12 lg:py-14">
        <div className="max-w-xl">
          <h2
            id="newsletter-heading"
            className="font-serif text-3xl font-normal leading-tight sm:text-4xl"
          >
            Get 10% off your first order.
          </h2>

          <p className="mt-3 max-w-lg text-sm leading-6 text-white/80 sm:text-base sm:leading-7">
            Join our community and be the first to know about new products,
            exclusive offers, and skincare tips.
          </p>
        </div>

        <div className="w-full max-w-2xl lg:justify-self-end">
          <form
            ref={formRef}
            action={formAction}
            className="flex flex-col gap-3 sm:flex-row sm:gap-0"
          >
            <div className="min-w-0 flex-1">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>

              <input
                id="newsletter-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                disabled={pending}
                aria-describedby={
                  state.message ? "newsletter-status" : undefined
                }
                aria-invalid={!state.success && Boolean(state.message)}
                placeholder="Enter your email"
                className="
                  h-13 w-full rounded-sm border border-white/50
                  bg-transparent px-4 text-sm text-white outline-none
                  transition placeholder:text-white/65
                  hover:border-white
                  focus:border-white
                  focus-visible:ring-2
                  focus-visible:ring-white/70
                  focus-visible:ring-offset-2
                  focus-visible:ring-offset-[#244a2c]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                  sm:rounded-r-none
                "
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              onClick={() =>
                trackEvent("NEWSLETTER_CLICK", {
                  location: "footer",
                })
              }
              className="
                h-13 shrink-0 rounded-sm bg-[#f7f1e8] px-8
                text-xs font-semibold uppercase tracking-[0.16em]
                text-[#2d382f] transition
                hover:bg-white
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-white
                focus-visible:ring-offset-2
                focus-visible:ring-offset-[#244a2c]
                disabled:cursor-not-allowed
                disabled:opacity-60
                sm:rounded-l-none
              "
            >
              {pending ? "Joining..." : "Submit"}
            </button>
          </form>

          <div
            id="newsletter-status"
            role="status"
            aria-live="polite"
            className="min-h-6"
          >
            {state.message && (
              <p
                className={[
                  "mt-3 text-sm",
                  state.success
                    ? "text-white"
                    : "text-[#f2caca]",
                ].join(" ")}
              >
                {state.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function LeafDecoration() {
  return (
    <svg
      width="190"
      height="220"
      viewBox="0 0 190 220"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M89 220C86 170 95 116 129 70C144 50 162 33 184 18"
        stroke="currentColor"
        strokeWidth="2"
      />

      <path
        d="M126 74C125 51 136 34 158 23C160 45 150 64 126 74Z"
        stroke="currentColor"
        strokeWidth="2"
      />

      <path
        d="M105 111C83 104 69 88 67 65C90 72 104 87 105 111Z"
        stroke="currentColor"
        strokeWidth="2"
      />

      <path
        d="M97 146C116 134 136 133 157 143C143 162 123 164 97 146Z"
        stroke="currentColor"
        strokeWidth="2"
      />

      <path
        d="M88 181C66 174 51 160 45 138C69 141 84 155 88 181Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}
import Link from "next/link";
import EmailCapture from "@/components/sections/footer/EmailCapture";

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

type FooterGroup = {
  heading: string;
  links: FooterLink[];
};

const footerGroups: FooterGroup[] = [
  {
    heading: "Shop",
    links: [
      { label: "Body", href: "/body" },
      { label: "Hair", href: "/hair" },
      { label: "Skincare", href: "/face" },
      // { label: "Bundles", href: "/bundles" },
    ],
  },
  {
    heading: "Connect",
    links: [
      {
        label: "Instagram",
        href: "https://instagram.com/herbalur",
        external: true,
      },
      {
        label: "TikTok",
        href: "https://tiktok.com/@herbalur",
        external: true,
      },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#f7f1e8] text-[#2d382f]">
      <EmailCapture />

      <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-12">
        <div className="grid gap-12 py-14 sm:py-16 lg:grid-cols-[1.1fr_2fr] lg:gap-20 lg:py-20">
          <div className="max-w-sm">
            <Link
              href="/"
              aria-label="Herbalur home"
              className="inline-flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#244a2c] focus-visible:ring-offset-4 focus-visible:ring-offset-[#f7f1e8]"
            >
              <span aria-hidden="true" className="mb-1 ml-10 text-[#244a2c]">
                <BrandLeafIcon />
              </span>

              <span className="font-serif text-4xl leading-none">
                Herbalur
              </span>
            </Link>

            <p className="mt-4 max-w-[280px] text-sm leading-6 text-[#4d504a]">
              Clean, effective skincare and body care rooted in nature.
            </p>

            <div
              aria-label="Social media links"
              className="mt-6 flex items-center gap-4"
            >
              <SocialLink
                href="https://www.instagram.com/Herbalur"
                label="Visit Herbalur on Instagram"
              >
                <InstagramIcon />
              </SocialLink>

              <SocialLink
                href="https://www.tiktok.com/@Herbalur"
                label="Visit Herbalur on TikTok"
              >
                <TikTokIcon />
              </SocialLink>

              <SocialLink
                href="https://www.facebook.com/Herbalur"
                label="Visit Herbalur on Facebook"
              >
                <FacebookIcon />
              </SocialLink>
            </div>
          </div>

          <nav
            aria-label="Footer navigation"
            className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4"
          >
            {footerGroups.map((group) => (
              <div key={group.heading}>
                <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2d382f]">
                  {group.heading}
                </h2>

                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={`${group.heading}-${link.label}`}>
                      <Link
                        href={link.href}
                        target={link.external ? "_blank" : undefined}
                        rel={
                          link.external
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className="text-sm text-[#4d504a] transition hover:text-[#244a2c] hover:underline hover:underline-offset-4 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#244a2c] focus-visible:ring-offset-3 focus-visible:ring-offset-[#f7f1e8]"
                      >
                        {link.label}

                        {link.external && (
                          <span className="sr-only">
                            {" "}
                            opens in a new tab
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="border-t border-[#2d382f]/15 py-7">
          <div className="flex flex-col gap-5 text-xs text-[#4d504a] sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} Herbalur. All rights reserved.
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                href="/privacy"
                className="transition hover:text-[#244a2c] hover:underline hover:underline-offset-4 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#244a2c]"
              >
                Privacy Policy
              </Link>

              <span
                aria-hidden="true"
                className="hidden h-3 w-px bg-[#2d382f]/30 sm:block"
              />

              <Link
                href="/terms"
                className="transition hover:text-[#244a2c] hover:underline hover:underline-offset-4 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#244a2c]"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

type SocialLinkProps = {
  href: string;
  label: string;
  children: React.ReactNode;
};

function SocialLink({
  href,
  label,
  children,
}: SocialLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="grid size-8 place-items-center rounded-full text-[#2d382f] transition hover:bg-[#244a2c] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#244a2c] focus-visible:ring-offset-3 focus-visible:ring-offset-[#f7f1e8]"
    >
      {children}
    </a>
  );
}

function BrandLeafIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 24"
      fill="none"
      className="h-6 w-8"
    >
      <path
        d="M15.5 21C14.8 14.1 17.4 7.6 24 3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />

      <path
        d="M17.5 12.5C12.6 12.2 9 9.7 7 5.3C12.1 5.1 15.6 7.6 17.5 12.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />

      <path
        d="M19.5 9C19.8 4.9 22.1 2.2 26.2 1C26.3 5.1 24.1 7.8 19.5 9Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />

      <path
        d="M15.3 17C11.4 18.2 7.9 17.2 5 14C9.1 12.5 12.5 13.5 15.3 17Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="size-4"
    >
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <circle
        cx="12"
        cy="12"
        r="3.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <circle cx="17.4" cy="6.8" r="1" fill="currentColor" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="size-4"
    >
      <path
        d="M14 4V14.5C14 17 12.1 19 9.6 19C7.1 19 5 17 5 14.5C5 12 7.1 10 9.6 10C10.1 10 10.6 10.1 11 10.3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M14 4C14.8 7.1 16.7 8.8 20 9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-4"
    >
      <path d="M13.6 21V13.3H16.2L16.6 10.3H13.6V8.4C13.6 7.5 13.8 6.9 15.1 6.9H16.7V4.2C16.4 4.2 15.5 4 14.4 4C12.1 4 10.5 5.4 10.5 8V10.3H8V13.3H10.5V21H13.6Z" />
    </svg>
  );
}

function PinterestIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="size-4"
    >
      <path
        d="M9.5 20C10.4 17.4 10.9 15.8 11.5 13.1C10.7 11.6 11.4 8.6 13 8.6C14.3 8.6 14.8 9.5 14.8 10.6C14.8 12 13.9 14 13.4 15.3C12.9 16.5 13.8 17.6 15 17.6C17 17.6 18.5 15.5 18.5 12.5C18.5 9.8 16.6 7.9 13.4 7.9C9.9 7.9 7.9 10.5 7.9 13.2C7.9 14.3 8.3 15.4 8.8 16C9 16.2 9 16.4 8.9 16.7L8.5 18.1C8.4 18.5 8.1 18.6 7.8 18.4C5.8 17.5 4.5 14.7 4.5 12.4C4.5 7.5 8.1 3 14.8 3C20.2 3 24 6.8 24 11.8C24 17.2 20.6 21.5 15.8 21.5C14.2 21.5 12.7 20.7 12.2 19.7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
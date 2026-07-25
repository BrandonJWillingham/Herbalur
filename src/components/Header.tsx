"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useCartStore } from "@/store/cartStore";

const navigation = [
  { name: "Body", href: "/body" },
  { name: "Hair", href: "/hair" },
  { name: "Skincare", href: "/face" },
  { name: "About", href: "/about" },
];

export default function Header() {
  const pathname = usePathname();

  const cart = useCartStore((state) => state.cart);
  const isCartOpen = useCartStore(
    (state) => state.isCartOpen,
  );
  const openCart = useCartStore(
    (state) => state.openCart,
  );
  const closeCart = useCartStore(
    (state) => state.closeCart,
  );
  const increaseQuantity = useCartStore(
    (state) => state.increaseQuantity,
  );
  const decreaseQuantity = useCartStore(
    (state) => state.decreaseQuantity,
  );
  const removeItem = useCartStore(
    (state) => state.removeItem,
  );

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);
  const [hidden, setHidden] = useState(false);
  const [hasMounted, setHasMounted] =
    useState(false);
  const [isCheckingOut, setIsCheckingOut] =
    useState(false);
  const [checkoutError, setCheckoutError] =
    useState("");

  const closeButtonRef =
    useRef<HTMLButtonElement>(null);

  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const subtotal = cart.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0,
  );

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      /*
       * Keep the header visible while either
       * navigation panel is open.
       */
      if (isCartOpen || mobileMenuOpen) {
        setHidden(false);
        return;
      }

      const currentScrollY = window.scrollY;

      if (currentScrollY < 50) {
        setHidden(false);
        lastScrollY = currentScrollY;
        return;
      }

      setHidden(currentScrollY > lastScrollY);

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll,
      );
    };
  }, [isCartOpen, mobileMenuOpen]);

  useEffect(() => {
    if (!isCartOpen) return;

    /*
     * Prevent the page behind the drawer from scrolling.
     */
    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";
    setHidden(false);

    window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        closeCart();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [isCartOpen, closeCart]);

  useEffect(() => {
    /*
     * Close menus when navigating to another route.
     */
    closeCart();
    setMobileMenuOpen(false);
  }, [pathname, closeCart]);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleOpenCart = () => {
    setMobileMenuOpen(false);
    setCheckoutError("");
    openCart();
  };

  const handleCheckout = async () => {
    if (cart.length === 0 || isCheckingOut) {
      return;
    }

    setIsCheckingOut(true);
    setCheckoutError("");

    try {
      const response = await fetch(
        "/api/checkout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cart: cart.map((item) => ({
              id: item.id,
              quantity: item.quantity,
            })),
          }),
        },
      );

      const data = (await response.json()) as {
        url?: string;
        error?: string;
      };

      if (!response.ok || !data.url) {
        throw new Error(
          data.error ??
            "Unable to begin checkout.",
        );
      }

      window.location.assign(data.url);
    } catch (error) {
      setCheckoutError(
        error instanceof Error
          ? error.message
          : "Unable to begin checkout.",
      );

      setIsCheckingOut(false);
    }
  };

  return (
    <>
      <header
        className={[
          "fixed inset-x-0 top-0 z-50 bg-[#faf7f2]",
          "transition-transform duration-300 ease-out",
          hidden
            ? "-translate-y-full"
            : "translate-y-0",
        ].join(" ")}
      >
        <div className="bg-[#24452b] px-4 py-2 text-center text-[10px] font-medium uppercase tracking-[0.16em] text-white sm:text-xs">
          Free shipping on all orders over $75
        </div>

        <div className="border-b border-[#ded8cf]">
          <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:h-[104px] lg:px-14 xl:px-20">
            <Link
              href="/"
              onClick={closeMobileMenu}
              className="group inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#31583a] focus-visible:ring-offset-4"
              aria-label="Herbalur home"
            >
              <span className="relative font-serif text-3xl tracking-[-0.04em] text-[#292d27] sm:text-[34px] lg:text-[40px]">
                Herbalur

                <LeafLogo className="absolute -top-3 left-1/2 h-4 w-4 -translate-x-1/2 text-[#60705f] sm:-top-4 sm:h-5 sm:w-5" />
              </span>
            </Link>

            <nav
              aria-label="Primary navigation"
              className="absolute left-1/2 hidden -translate-x-1/2 lg:block"
            >
              <ul className="flex items-center gap-12">
                {navigation.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(
                      `${item.href}/`,
                    );

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={
                          isActive
                            ? "page"
                            : undefined
                        }
                        className={[
                          "group relative block py-3 text-sm font-medium transition-colors",
                          "focus-visible:outline-none focus-visible:ring-2",
                          "focus-visible:ring-[#31583a] focus-visible:ring-offset-4",
                          isActive
                            ? "text-[#1f2c22]"
                            : "text-[#343630] hover:text-[#31583a]",
                        ].join(" ")}
                      >
                        {item.name}

                        <span
                          aria-hidden="true"
                          className={[
                            "absolute inset-x-0 bottom-0 mx-auto h-px",
                            "origin-center bg-[#313b32] transition-transform",
                            isActive
                              ? "scale-x-100"
                              : "scale-x-0 group-hover:scale-x-100",
                          ].join(" ")}
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <button
              type="button"
              onClick={handleOpenCart}
              aria-label={`Open shopping bag${
                hasMounted && totalItems > 0
                  ? `, ${totalItems} ${
                      totalItems === 1
                        ? "item"
                        : "items"
                    }`
                  : ""
              }`}
              aria-haspopup="dialog"
              className="relative hidden h-11 w-11 items-center justify-center rounded-full transition hover:bg-[#eee9e1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#31583a] focus-visible:ring-offset-2 lg:flex"
            >
              <ShoppingBagIcon className="h-6 w-6" />

              {hasMounted && totalItems > 0 && (
                <CartCount count={totalItems} />
              )}
            </button>

            <div className="flex items-center gap-1 lg:hidden">
              <button
                type="button"
                onClick={handleOpenCart}
                aria-label={`Open shopping bag${
                  hasMounted && totalItems > 0
                    ? `, ${totalItems} ${
                        totalItems === 1
                          ? "item"
                          : "items"
                      }`
                    : ""
                }`}
                aria-haspopup="dialog"
                className="relative flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-[#eee9e1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#31583a]"
              >
                <ShoppingBagIcon className="h-6 w-6" />

                {hasMounted && totalItems > 0 && (
                  <CartCount count={totalItems} />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  closeCart();

                  setMobileMenuOpen(
                    (current) => !current,
                  );
                }}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation"
                aria-label={
                  mobileMenuOpen
                    ? "Close navigation menu"
                    : "Open navigation menu"
                }
                className="flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-[#eee9e1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#31583a]"
              >
                {mobileMenuOpen ? (
                  <CloseIcon className="h-6 w-6" />
                ) : (
                  <MenuIcon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div
          id="mobile-navigation"
          className={[
            "overflow-hidden border-b border-[#ded8cf] bg-[#faf7f2]",
            "transition-[max-height,opacity] duration-300 lg:hidden",
            mobileMenuOpen
              ? "max-h-[420px] opacity-100"
              : "pointer-events-none max-h-0 opacity-0",
          ].join(" ")}
        >
          <nav
            aria-label="Mobile navigation"
            className="mx-auto max-w-[1440px] px-5 py-6 sm:px-8"
          >
            <ul className="divide-y divide-[#e5dfd6]">
              {navigation.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(
                    `${item.href}/`,
                  );

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={closeMobileMenu}
                      aria-current={
                        isActive
                          ? "page"
                          : undefined
                      }
                      className="flex min-h-14 items-center justify-between py-4 font-serif text-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#31583a]"
                    >
                      <span
                        className={
                          isActive
                            ? "text-[#31583a]"
                            : "text-[#292d27]"
                        }
                      >
                        {item.name}
                      </span>

                      <span
                        aria-hidden="true"
                        className="text-lg text-[#697168]"
                      >
                        →
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <Link
              href="/shop"
              onClick={closeMobileMenu}
              className="mt-6 flex min-h-12 w-full items-center justify-center rounded-sm bg-[#26472c] px-6 text-xs font-semibold uppercase tracking-[0.13em] text-white transition hover:bg-[#1a361f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#31583a] focus-visible:ring-offset-2"
            >
              Shop all products
            </Link>
          </nav>
        </div>
      </header>

      <div
        aria-hidden={!isCartOpen}
        onClick={closeCart}
        className={[
          "fixed inset-0 z-[70] bg-[#182019]/45 backdrop-blur-[2px]",
          "transition-opacity duration-300",
          isCartOpen
            ? "opacity-100"
            : "pointer-events-none opacity-0",
        ].join(" ")}
      />

      <aside
        id="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-heading"
        aria-hidden={!isCartOpen}
        className={[
          "fixed inset-y-0 right-0 z-[80]",
          "flex w-full max-w-[460px] flex-col",
          "bg-[#faf7f2] text-[#292d27]",
          "shadow-[-20px_0_60px_rgba(31,44,34,0.18)]",
          "transition-transform duration-300 ease-out",
          isCartOpen
            ? "translate-x-0"
            : "translate-x-full",
        ].join(" ")}
      >
        <div className="flex min-h-[84px] items-center justify-between border-b border-[#ded8cf] px-5 sm:px-7">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a3742b]">
              Your selection
            </p>

            <h2
              id="cart-drawer-heading"
              className="mt-1 font-serif text-3xl"
            >
              Shopping Bag
            </h2>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeCart}
            aria-label="Close shopping bag"
            className="grid size-11 place-items-center rounded-full border border-[#2d382f]/15 transition hover:border-[#244a2c] hover:bg-[#eee9e1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#31583a]"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>

        {hasMounted && cart.length > 0 ? (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-2 sm:px-7">
              <ul className="divide-y divide-[#2d382f]/10">
                {cart.map((item) => (
                  <li
                    key={item.id}
                    className="grid grid-cols-[96px_1fr] gap-4 py-6"
                  >
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={closeCart}
                      className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[#efe6d8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#31583a]"
                    >
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="96px"
                        className="object-contain p-2"
                      />
                    </Link>

                    <div className="flex min-w-0 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            href={`/products/${item.slug}`}
                            onClick={closeCart}
                            className="font-serif text-lg leading-tight transition hover:text-[#244a2c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#31583a]"
                          >
                            {item.name}
                          </Link>

                          <p className="mt-1 text-sm text-[#4d504a]">
                            {formatPrice(item.price)}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeItem(item.id)
                          }
                          aria-label={`Remove ${item.name} from bag`}
                          className="shrink-0 text-[#6f726c] transition hover:text-[#8b332d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#31583a]"
                        >
                          <TrashIcon className="size-5" />
                        </button>
                      </div>

                      <div className="mt-auto flex items-end justify-between gap-4 pt-4">
                        <div
                          className="inline-flex h-10 items-center rounded-full border border-[#2d382f]/20"
                          aria-label={`Quantity for ${item.name}`}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              decreaseQuantity(
                                item.id,
                              )
                            }
                            aria-label={`Decrease quantity of ${item.name}`}
                            className="grid h-full w-10 place-items-center rounded-l-full transition hover:bg-[#eee9e1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#31583a]"
                          >
                            <MinusIcon className="size-4" />
                          </button>

                          <span
                            aria-live="polite"
                            className="min-w-7 text-center text-sm"
                          >
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              increaseQuantity(
                                item.id,
                              )
                            }
                            aria-label={`Increase quantity of ${item.name}`}
                            className="grid h-full w-10 place-items-center rounded-r-full transition hover:bg-[#eee9e1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#31583a]"
                          >
                            <PlusIcon className="size-4" />
                          </button>
                        </div>

                        <p className="text-sm font-semibold">
                          {formatPrice(
                            item.price *
                              item.quantity,
                          )}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-[#ded8cf] bg-[#f7f1e8] px-5 py-6 sm:px-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-[#4d504a]">
                    Subtotal
                  </p>

                  <p className="mt-1 text-xs text-[#6f726c]">
                    Shipping and taxes calculated
                    at checkout.
                  </p>
                </div>

                <p className="font-serif text-2xl">
                  {formatPrice(subtotal)}
                </p>
              </div>

              {subtotal < 7500 ? (
                <div className="mt-5">
                  <div className="flex justify-between gap-4 text-xs text-[#4d504a]">
                    <span>
                      {formatPrice(
                        7500 - subtotal,
                      )}{" "}
                      away from free shipping
                    </span>

                    <span>
                      {Math.min(
                        Math.round(
                          (subtotal / 7500) *
                            100,
                        ),
                        100,
                      )}
                      %
                    </span>
                  </div>

                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#ded8cf]">
                    <div
                      className="h-full rounded-full bg-[#244a2c] transition-[width] duration-300"
                      style={{
                        width: `${Math.min(
                          (subtotal / 7500) *
                            100,
                          100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ) : (
                <p className="mt-5 text-sm font-medium text-[#244a2c]">
                  Your order qualifies for free
                  shipping.
                </p>
              )}

              {checkoutError && (
                <p
                  role="alert"
                  className="mt-4 rounded-md bg-[#8b332d]/10 px-4 py-3 text-sm text-[#8b332d]"
                >
                  {checkoutError}
                </p>
              )}

              <button
                type="button"
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="mt-5 flex min-h-13 w-full items-center justify-center gap-3 rounded-sm bg-[#244a2c] px-6 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#193820] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#31583a] focus-visible:ring-offset-3 focus-visible:ring-offset-[#f7f1e8] disabled:cursor-not-allowed disabled:opacity-65"
              >
                {isCheckingOut ? (
                  <>
                    <LoadingIcon className="size-4 animate-spin" />
                    Preparing checkout
                  </>
                ) : (
                  <>
                    Checkout
                    <ArrowRightIcon className="size-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={closeCart}
                className="mt-3 min-h-11 w-full text-xs font-semibold uppercase tracking-[0.13em] text-[#4d504a] underline decoration-[#4d504a]/40 underline-offset-4 transition hover:text-[#244a2c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#31583a]"
              >
                Continue shopping
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="grid size-20 place-items-center rounded-full bg-[#efe6d8] text-[#244a2c]">
              <ShoppingBagIcon className="size-9" />
            </div>

            <h3 className="mt-6 font-serif text-3xl">
              Your bag is empty.
            </h3>

            <p className="mt-3 max-w-xs text-sm leading-6 text-[#4d504a]">
              Discover clean, thoughtful care made
              for your everyday routine.
            </p>

            <Link
              href="/body"
              onClick={closeCart}
              className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-[#244a2c] px-7 text-xs font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-[#193820] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#31583a] focus-visible:ring-offset-3"
            >
              Explore products
              <ArrowRightIcon className="size-4" />
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}

function CartCount({
  count,
}: {
  count: number;
}) {
  return (
    <span className="absolute right-0 top-0 grid min-h-5 min-w-5 place-items-center rounded-full bg-[#244a2c] px-1 text-[10px] font-semibold text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function formatPrice(priceInCents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(priceInCents / 100);
}

type IconProps = {
  className?: string;
};

function ShoppingBagIcon({
  className,
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6.75 8.25h10.5l.75 12H6l.75-12Z" />
      <path d="M9 9V6.75a3 3 0 0 1 6 0V9" />
    </svg>
  );
}

function MenuIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

function CloseIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </svg>
  );
}

function PlusIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function MinusIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 12h14" />
    </svg>
  );
}

function TrashIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 7h16" />
      <path d="M9 7V4h6v3" />
      <path d="m7 7 1 13h8l1-13" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </svg>
  );
}

function ArrowRightIcon({
  className,
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m14 7 5 5-5 5" />
    </svg>
  );
}

function LoadingIcon({
  className,
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.25"
      />

      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LeafLogo({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 20c0-7 3-12 9-15 0 7-3 12-9 15Z" />
      <path d="M12 20C11 13 8 9 3 7c0 6 3 10 9 13Z" />
      <path d="M12 20v-8" />
    </svg>
  );
}
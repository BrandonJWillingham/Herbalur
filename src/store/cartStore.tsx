// src/store/cartStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string;
  name: string;
  slug: string;
  price: number; // store in cents if possible
  imageUrl: string;
  quantity: number;
};

type CartStore = {
  cart: CartItem[];
  isCartOpen: boolean;

  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  clearCart: () => void;

  getTotalItems: () => number;
  getSubtotal: () => number;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: [],
      isCartOpen: false,

      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      toggleCart: () =>
        set((state) => ({ isCartOpen: !state.isCartOpen })),

      addItem: (item) =>
        set((state) => {
          const existingItem = state.cart.find(
            (cartItem) => cartItem.id === item.id
          );

          if (existingItem) {
            return {
              cart: state.cart.map((cartItem) =>
                cartItem.id === item.id
                  ? { ...cartItem, quantity: cartItem.quantity + 1 }
                  : cartItem
              ),
              isCartOpen: true,
            };
          }

          return {
            cart: [...state.cart, { ...item, quantity: 1 }],
            isCartOpen: true,
          };
        }),

      removeItem: (id) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== id),
        })),

      increaseQuantity: (id) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        })),

      decreaseQuantity: (id) =>
        set((state) => ({
          cart: state.cart
            .map((item) =>
              item.id === id
                ? { ...item, quantity: item.quantity - 1 }
                : item
            )
            .filter((item) => item.quantity > 0),
        })),

      clearCart: () => set({ cart: [] }),

      getTotalItems: () =>
        get().cart.reduce((total, item) => total + item.quantity, 0),

      getSubtotal: () =>
        get().cart.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        ),
    }),
    {
      name: "herbalur-cart",
    }
  )
);
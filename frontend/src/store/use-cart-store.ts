import { create } from "zustand";

interface CartState {
  isOpen: boolean;
  cartBadgeCount: number;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  setCartBadgeCount: (count: number) => void;
}

export const useCartStore = create<CartState>((set) => ({
  isOpen: false,
  cartBadgeCount: 0,
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  setCartOpen: (isOpen) => set({ isOpen }),
  setCartBadgeCount: (cartBadgeCount) => set({ cartBadgeCount }),
}));

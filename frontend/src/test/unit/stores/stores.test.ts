import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "@/store/use-auth-store";
import { useCartStore } from "@/store/use-cart-store";

describe("useAuthStore Zustand Store", () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession();
  });

  it("should initialize with default guest states", () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it("should update credentials on setSession trigger", () => {
    const mockUser = {
      id: "user-1",
      email: "test@example.com",
      firstName: "Alice",
      lastName: "Smith",
      role: "CUSTOMER",
    };
    useAuthStore.getState().setSession(mockUser, "access-token", "refresh-token");

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe("access-token");
    expect(state.refreshToken).toBe("refresh-token");
  });
});

describe("useCartStore Zustand Store", () => {
  it("should manage cart drawer open state transitions", () => {
    const store = useCartStore.getState();
    expect(store.isOpen).toBe(false);

    store.setCartOpen(true);
    expect(useCartStore.getState().isOpen).toBe(true);
  });

  it("should capture badge numeric count offsets", () => {
    const store = useCartStore.getState();
    store.setCartBadgeCount(5);
    expect(useCartStore.getState().cartBadgeCount).toBe(5);
  });
});
export type { useAuthStore as useAuthStoreType };

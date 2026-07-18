import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  theme: "light" | "dark" | "system";
  searchOverlayOpen: boolean;
  toggleSidebar: () => void;
  setSidebar: (open: boolean) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  toggleSearchOverlay: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  theme: "system",
  searchOverlayOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebar: (sidebarOpen) => set({ sidebarOpen }),
  setTheme: (theme) => set({ theme }),
  toggleSearchOverlay: () => set((state) => ({ searchOverlayOpen: !state.searchOverlayOpen })),
}));

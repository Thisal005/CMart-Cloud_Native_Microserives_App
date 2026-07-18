/**
 * Simple client-side cookie helper utilities.
 */
export const cookie = {
  get(name: string): string | null {
    if (typeof document === "undefined") return null;
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  },

  set(name: string, value: string, days?: number, path: string = "/"): void {
    if (typeof document === "undefined") return;
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = `; expires=${date.toUTCString()}`;
    }
    document.cookie = `${name}=${value || ""}${expires}; path=${path}; SameSite=Lax; Secure`;
  },

  delete(name: string, path: string = "/"): void {
    if (typeof document === "undefined") return;
    document.cookie = `${name}=; Max-Age=-99999999; path=${path}; SameSite=Lax; Secure`;
  },
};

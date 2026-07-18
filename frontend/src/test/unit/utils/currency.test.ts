import { describe, it, expect } from "vitest";
import { formatUSD } from "@/utils/currency";

describe("formatUSD Utility", () => {
  it("formats integer amounts to USD format", () => {
    const formatted = formatUSD(1500).replace(/\u00a0/g, " ");
    expect(formatted).toBe("$1,500.00");
  });

  it("formats decimal numbers correctly", () => {
    const formatted = formatUSD(19.99).replace(/\u00a0/g, " ");
    expect(formatted).toBe("$19.99");
  });

  it("parses and formats numeric strings", () => {
    const formatted = formatUSD("120.50").replace(/\u00a0/g, " ");
    expect(formatted).toBe("$120.50");
  });

  it("returns fallback for invalid string numbers", () => {
    const formatted = formatUSD("invalid").replace(/\u00a0/g, " ");
    expect(formatted).toBe("$0.00");
  });
});
export type { formatUSD as formatUSDType };

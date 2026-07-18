/**
 * Formats a number or numeric string to a standard USD currency format.
 * @example formatUSD(19.99) => "$19.99"
 * @example formatUSD("1500") => "$1,500.00"
 */
export function formatUSD(amount: number | string): string {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(value)) return "$0.00";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

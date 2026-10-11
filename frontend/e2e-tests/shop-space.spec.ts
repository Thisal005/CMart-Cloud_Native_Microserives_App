import { test, expect } from "@playwright/test";

const products = Array.from({ length: 8 }, (_, index) => ({
  id: `shop-${index}`,
  name:
    index === 0 ? "Orbit Headphones" : index === 1 ? "Explorer Camera" : `Explorer Laptop ${index}`,
  description: "Made for your next discovery.",
  price: index * 100,
  stock: index === 1 ? 0 : 8,
  createdAt: `2026-01-${String(index + 1).padStart(2, "0")}`,
}));

test.beforeEach(async ({ page }) => {
  await page.route("**/api/v1/products", (route) =>
    route.fulfill({ json: { success: true, data: products } })
  );
});

test("shop preserves search, category filters, removal and browser history", async ({ page }) => {
  await page.goto("/products?category=Audio", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Orbit Headphones" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Explorer Camera" })).toHaveCount(0);
  await expect(
    page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: "Shop", exact: true })
  ).toHaveAttribute("aria-current", "page");
  await page.getByRole("button", { name: "Remove filter Audio", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "8 products" })).toBeVisible();
  await page.getByRole("searchbox", { name: "Search collection", exact: true }).fill("Camera");
  await page.getByRole("button", { name: "Search collection", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Explorer Camera" })).toBeVisible();
  await expect(page.getByText("Out of stock", { exact: true })).toBeVisible();
  await page.getByRole("checkbox", { name: "In stock only" }).check();
  await expect(page.getByRole("heading", { name: "No discoveries in this orbit." })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole("checkbox", { name: "In stock only" })).not.toBeChecked();
  await expect(page.getByRole("heading", { name: "Explorer Camera" })).toBeVisible();
});

test("sort, pagination, zero price and invalid page parameters work", async ({ page }) => {
  await page.goto("/products?page=invalid", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Showing 1–6 of 8 products")).toBeVisible();
  await page.getByRole("combobox", { name: "Sort catalog" }).selectOption("price_asc");
  await expect(page.locator("article").first().getByRole("heading")).toHaveText("Orbit Headphones");
  await page.getByRole("button", { name: "Next page" }).click();
  await expect(page.getByText("Showing 7–8 of 8 products")).toBeVisible();
  await page.getByRole("spinbutton", { name: "Max ($)" }).fill("0");
  await page.getByRole("button", { name: "Apply price range" }).click();
  await expect(page.getByRole("heading", { name: "Orbit Headphones" })).toBeVisible();
  await expect(page.getByText("Showing 1–1 of 1 products")).toBeVisible();
  await expect(page.getByRole("link", { name: "View Details", exact: true })).toHaveAttribute(
    "href",
    "/products/shop-0"
  );
  await page.getByRole("button", { name: /Open shopping cart/ }).click();
  await expect(page.getByRole("dialog", { name: "Shopping cart" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Shopping cart" })).not.toBeVisible();
});

test("mobile filters and responsive assets remain usable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/products", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Explorer Laptop 7", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Filters", exact: false }).click();
  await expect(page.getByRole("button", { name: "Filters", exact: false })).toHaveAttribute(
    "aria-expanded",
    "true"
  );
  await page.getByRole("searchbox", { name: "Search collection", exact: true }).fill("Headphones");
  await page.getByRole("button", { name: "Search collection", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Orbit Headphones" })).toBeVisible();
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true
    );
  }
  await expect(
    page.getByAltText("Astronaut floating into a new universe of possibilities")
  ).toHaveCSS("animation-name", "none");
  await expect(page.getByRole("link", { name: "Explore Audio", exact: true })).toHaveAttribute(
    "href",
    "/products?category=Audio#catalog"
  );
});

test("catalog errors recover and empty catalogs offer refresh", async ({ page }) => {
  let fail = true;
  await page.route("**/api/v1/products", (route) =>
    fail
      ? route.fulfill({ status: 400, json: { message: "Unavailable" } })
      : route.fulfill({ json: { success: true, data: [] } })
  );
  await page.goto("/products", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("heading", { name: "Our catalog is taking a moment." })
  ).toBeVisible();
  fail = false;
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(
    page.getByRole("heading", { name: "New discoveries are on the way." })
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Refresh collection" })).toBeVisible();
});

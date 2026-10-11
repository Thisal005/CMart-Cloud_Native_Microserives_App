import { test, expect } from "@playwright/test";

const products = [
  {
    id: "home-laptop",
    name: "Explorer Laptop",
    description: "Power for your next big idea.",
    price: 1299,
    stock: 8,
    createdAt: "2026-01-01",
  },
  {
    id: "home-headphones",
    name: "Orbit Headphones",
    description: "Every detail. Every note.",
    price: 199,
    stock: 0,
    createdAt: "2026-01-02",
  },
  {
    id: "home-camera",
    name: "Pocket Gimbal Camera",
    description: "Capture your next adventure.",
    price: 89,
    stock: 12,
    createdAt: "2026-01-03",
  },
];

test("homepage presents catalog data and links to product details", async ({ page }) => {
  await page.route("**/api/v1/products", (route) =>
    route.fulfill({ json: { success: true, data: products } })
  );
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Explorer Laptop" })).toBeVisible();
  await expect(page.getByText("$1,299.00", { exact: true })).toBeVisible();
  await expect(page.getByText("Out of stock", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Explorer Laptop", exact: true })).toHaveAttribute(
    "href",
    "/products/home-laptop"
  );
  await expect(page.getByRole("link", { name: "Explore Audio", exact: true })).toHaveAttribute(
    "href",
    "/products?category=Audio"
  );
  await page.getByRole("button", { name: /Open shopping cart/ }).click();
  await expect(page.getByRole("dialog", { name: "Shopping cart" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Shopping cart" })).not.toBeVisible();
});

test("catalog failure can recover through retry", async ({ page }) => {
  let fail = true;
  await page.route("**/api/v1/products", (route) =>
    fail
      ? route.fulfill({ status: 400, json: { message: "Catalog unavailable" } })
      : route.fulfill({ json: { success: true, data: products } })
  );
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Our catalog is taking a moment." })
  ).toBeVisible();
  fail = false;
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByRole("heading", { name: "Explorer Laptop" })).toBeVisible();
});

test("empty catalog remains usable on mobile", async ({ page }) => {
  await page.route("**/api/v1/products", (route) =>
    route.fulfill({ json: { success: true, data: [] } })
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "New discoveries are on the way." })
  ).toBeVisible();
  await page.getByRole("button", { name: "Open menu", exact: true }).click();
  await page.getByRole("searchbox", { name: "Search products" }).fill("headphones");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page).toHaveURL(/\/products\?searchTerm=headphones$/);
});

test("responsive layout keeps content within the viewport and supports reduced motion", async ({
  page,
}) => {
  await page.route("**/api/v1/products", (route) =>
    route.fulfill({ json: { success: true, data: products } })
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true
    );
  }
  const astronaut = page.getByAltText(
    "Astronaut floating through space with a glowing cyan and violet visor"
  );
  await expect(astronaut).toHaveCSS("animation-name", "none");
});

test("unavailable product photos have an accessible fallback", async ({ page }) => {
  await page.route("**/api/v1/products", (route) =>
    route.fulfill({ json: { success: true, data: products } })
  );
  await page.route("**/_next/image?**", (route) => {
    const source = new URL(route.request().url()).searchParams.get("url") || "";
    return source.includes("/space/product-") ? route.abort() : route.continue();
  });
  await page.goto("/");
  await page.getByRole("heading", { name: "Explorer Laptop" }).scrollIntoViewIfNeeded();
  await expect(page.getByRole("img", { name: "Explorer Laptop: image unavailable" })).toBeVisible();
});

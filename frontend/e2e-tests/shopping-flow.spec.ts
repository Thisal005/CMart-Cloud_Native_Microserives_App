import { test, expect } from "@playwright/test";

test.describe("CMart End-to-End E-Commerce Flow", () => {
  test("should register, login, browse, add to cart, checkout, pay, and view confirmation details", async ({
    page,
  }) => {
    // 1. Navigation to registration page and account creation
    await page.goto("/register");
    await expect(page).toHaveTitle(/Register/i);

    await page.fill("input[placeholder='First Name']", "Jane");
    await page.fill("input[placeholder='Last Name']", "Smith");
    const uniqueEmail = `jane.smith.${Date.now()}@example.com`;
    await page.fill("input[type='email']", uniqueEmail);
    await page.fill("input[type='password']", "password123");
    await page.fill("input[type='tel']", "206-555-0199");
    await page.click("button[type='submit']");

    // Redirect to login or catalog
    await page.waitForURL("**/login");

    // 2. Log in using the registered credentials
    await page.fill("input[type='email']", uniqueEmail);
    await page.fill("input[type='password']", "password123");
    await page.click("button[type='submit']");
    await page.waitForURL("**/products");

    // 3. Browse catalog list and click the first product
    await page.waitForSelector(".grid >> text=View Details");
    const firstProductDetails = page.locator(".grid >> text=View Details").first();
    await firstProductDetails.click();
    await page.waitForURL("**/products/*");

    // 4. Click Add to Cart
    await page.click("text=Add to Cart");
    await page.waitForSelector("text=Shopping Drawer");

    // 5. Click Checkout from Drawer
    await page.click("text=Checkout");
    await page.waitForURL("**/checkout");

    // 6. Fill Shipping form
    await page.fill("input[placeholder='Ava Patel']", "Jane Smith");
    await page.fill("input[placeholder='123 Main Street']", "456 Westlake Avenue");
    await page.fill("input[placeholder='Seattle']", "Seattle");
    await page.fill("input[placeholder='98101']", "98109");
    await page.fill("input[placeholder='United States']", "United States");
    await page.fill("input[placeholder='206-555-0199']", "206-555-0211");
    await page.click("text=Review Order");

    // 7. Verify Review details and click Place Order
    await expect(page.locator("text=Jane Smith")).toBeVisible();
    await page.click("text=Place Order");

    // 8. Redirect to Payment Gateway
    await page.waitForURL("**/checkout/payment*");
    await page.selectOption("#payment-method", "CARD");
    await page.fill("input[placeholder='4111 2222 3333 4444']", "4111222233334444");
    await page.click("text=Authorize Payment");

    // 9. Redirect to Confirmation receipt
    await page.waitForURL("**/checkout/confirmation*");
    await expect(page.locator("text=Order Confirmed!")).toBeVisible();
    await expect(page.locator("text=Purchase Summary")).toBeVisible();

    // 10. Click Continue to view details
    await page.click("text=Continue Shopping");
    await page.waitForURL("**/products");
  });
});

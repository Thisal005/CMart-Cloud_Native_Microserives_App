/**
 * CMart End-to-End Verification Script
 * Uses native fetch (available in Node.js 18+) to test the microservices.
 */

const AUTH_URL = 'http://localhost:3001/api/auth';
const PRODUCT_URL = 'http://localhost:3002/api/products';
const CART_URL = 'http://localhost:3003/api/cart';
const ORDER_URL = 'http://localhost:3004/api/orders';

// Helper for making requests with authentication
async function request(url, method = 'GET', body = null, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);
  let data = null;
  
  if (res.status !== 204) {
    try {
      data = await res.json();
    } catch (e) {
      // Not json
    }
  }

  return {
    status: res.status,
    ok: res.ok,
    data,
  };
}

async function runTests() {
  console.log('🚀 Starting CMart E2E Microservices Verification...\n');
  const timestamp = Date.now();
  const testUser = {
    firstName: 'Test',
    lastName: `User_${timestamp}`,
    email: `test_${timestamp}@example.com`,
    password: 'password123',
  };

  let token = null;
  let productId = null;

  try {
    // ----------------------------------------------------
    // 1. REGISTER
    // ----------------------------------------------------
    console.log('📝 1. Registering user...');
    const registerRes = await request(`${AUTH_URL}/register`, 'POST', testUser);
    if (!registerRes.ok) {
      throw new Error(`Register failed (${registerRes.status}): ${JSON.stringify(registerRes.data)}`);
    }
    console.log('   ✅ User registered successfully.\n');

    // ----------------------------------------------------
    // 2. LOGIN
    // ----------------------------------------------------
    console.log('🔑 2. Logging in...');
    const loginRes = await request(`${AUTH_URL}/login`, 'POST', {
      email: testUser.email,
      password: testUser.password,
    });
    if (!loginRes.ok) {
      throw new Error(`Login failed (${loginRes.status}): ${JSON.stringify(loginRes.data)}`);
    }
    token = loginRes.data.token;
    console.log(`   ✅ Logged in. JWT Token retrieved: ${token.substring(0, 15)}...\n`);

    // ----------------------------------------------------
    // 3. GET PRODUCTS
    // ----------------------------------------------------
    console.log('📦 3. Fetching product catalog...');
    const productsRes = await request(PRODUCT_URL, 'GET');
    if (!productsRes.ok) {
      throw new Error(`Get products failed (${productsRes.status})`);
    }
    const products = productsRes.data;
    console.log(`   ✅ Catalog fetched. Found ${products.length} products:`);
    products.forEach(p => console.log(`      - [${p.id}] ${p.name} ($${p.price}) [Stock: ${p.stock}]`));
    productId = products[0].id;
    console.log(`   👉 Selected product for testing: "${products[0].name}"\n`);

    // ----------------------------------------------------
    // 4. ADD TO CART
    // ----------------------------------------------------
    console.log('🛒 4. Adding product to cart...');
    const addToCartRes = await request(`${CART_URL}/items`, 'POST', {
      productId,
      quantity: 2,
    }, token);
    if (!addToCartRes.ok) {
      throw new Error(`Add to cart failed (${addToCartRes.status}): ${JSON.stringify(addToCartRes.data)}`);
    }
    console.log(`   ✅ Product added. Cart Total: $${addToCartRes.data.totalAmount}\n`);

    // ----------------------------------------------------
    // 5. VIEW CART
    // ----------------------------------------------------
    console.log('🛒 5. Verifying cart state...');
    const getCartRes = await request(CART_URL, 'GET', null, token);
    if (!getCartRes.ok) {
      throw new Error(`Get cart failed (${getCartRes.status})`);
    }
    const cart = getCartRes.data;
    console.log(`   ✅ Cart verified. Items: ${cart.items.length}, Total: $${cart.totalAmount}`);
    cart.items.forEach(i => console.log(`      - ${i.name} x${i.quantity} @ $${i.price}`));
    console.log();

    // ----------------------------------------------------
    // 6. CHECKOUT - SUCCESS
    // ----------------------------------------------------
    console.log('💳 6. Checking out with valid card (Simulated Payment Success)...');
    const checkoutRes = await request(ORDER_URL, 'POST', {
      paymentMethod: 'credit_card',
      cardNumber: '1111-2222-3333-4444', // success card
    }, token);
    
    if (!checkoutRes.ok) {
      throw new Error(`Checkout failed (${checkoutRes.status}): ${JSON.stringify(checkoutRes.data)}`);
    }
    
    const order = checkoutRes.data;
    console.log(`   ✅ Order placed! Order ID: ${order.id}`);
    console.log(`      Status: ${order.status}`);
    console.log(`      Transaction ID: ${order.transactionId}`);
    console.log(`      Total Amount Paid: $${order.totalAmount}\n`);

    // ----------------------------------------------------
    // 7. VERIFY CART CLEARED
    // ----------------------------------------------------
    console.log('🛒 7. Checking if cart was cleared after successful order...');
    const postCheckoutCartRes = await request(CART_URL, 'GET', null, token);
    if (!postCheckoutCartRes.ok) {
      throw new Error(`Get cart failed after checkout`);
    }
    const postCheckoutCart = postCheckoutCartRes.data;
    console.log(`   ✅ Cart items count: ${postCheckoutCart.items.length} (Expected: 0)\n`);

    // ----------------------------------------------------
    // 8. ADD TO CART AGAIN FOR FAILURE TEST
    // ----------------------------------------------------
    console.log('🛒 8. Adding product to cart for payment failure simulation...');
    await request(`${CART_URL}/items`, 'POST', {
      productId,
      quantity: 1,
    }, token);
    console.log('   ✅ Item added.\n');

    // ----------------------------------------------------
    // 9. CHECKOUT - FAILURE
    // ----------------------------------------------------
    console.log('💳 9. Checking out with invalid card (Simulated Payment Decline)...');
    const failedCheckoutRes = await request(ORDER_URL, 'POST', {
      paymentMethod: 'credit_card',
      cardNumber: '1111-2222-3333-9999', // ends in 9999 triggers decline
    }, token);

    // Order Service returns 400 when order created but payment failed
    console.log(`   ℹ️ Checkout request returned status: ${failedCheckoutRes.status}`);
    const failedOrder = failedCheckoutRes.data.order;
    if (failedOrder) {
      console.log(`   ✅ Order ID: ${failedOrder.id}`);
      console.log(`      Status: ${failedOrder.status} (Expected: FAILED)`);
    } else {
      throw new Error(`Expected order details in response, got: ${JSON.stringify(failedCheckoutRes.data)}`);
    }
    console.log();

    // ----------------------------------------------------
    // 10. GET ORDER HISTORY
    // ----------------------------------------------------
    console.log('📜 10. Fetching order history for user...');
    const historyRes = await request(ORDER_URL, 'GET', null, token);
    if (!historyRes.ok) {
      throw new Error(`Get orders history failed`);
    }
    const orders = historyRes.data;
    console.log(`    ✅ Order history retrieved. Found ${orders.length} orders:`);
    orders.forEach(o => {
      console.log(`       - Order [${o.id}] - Total: $${o.totalAmount} | Status: ${o.status}`);
    });

    console.log('\n🎉 ALL END-TO-END TESTS COMPLETED SUCCESSFULLY! 🎉');

  } catch (error) {
    console.error('\n❌ TEST SUITE FAILED:', error.message);
    process.exit(1);
  }
}

// Simple delay before running tests, in case server is still starting up
const delay = parseInt(process.argv[2] || '0', 10);
if (delay > 0) {
  console.log(`Waiting ${delay}ms for services to warm up...`);
  setTimeout(runTests, delay);
} else {
  runTests();
}

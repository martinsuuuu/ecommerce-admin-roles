import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

// Helper function to generate IDs
const generateId = () => crypto.randomUUID();

// Helper to get current timestamp
const now = () => new Date().toISOString();

// ==================== AUTH ROUTES ====================

// Signup
app.post('/make-server-793a174e/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    // Check if user already exists
    const existingUsers = await kv.getByPrefix('user:');
    const userExists = existingUsers
      .filter((u: any) => u && typeof u === 'object' && u.email)
      .some((u: any) => u.email === email);

    if (userExists) {
      return c.json({ error: 'User already exists' }, 400);
    }

    const userId = generateId();
    const user = {
      id: userId,
      email,
      password, // In production, hash this!
      name,
      role: 'customer', // Default role
      createdAt: now(),
    };

    await kv.set(`user:${userId}`, user);
    await kv.set(`user:email:${email}`, userId); // Email index

    return c.json({ message: 'User created successfully', userId });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Signup failed' }, 500);
  }
});

// Login
app.post('/make-server-793a174e/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    console.log('Login attempt for email:', email);

    const users = await kv.getByPrefix('user:');
    console.log('Total entries found:', users.length);
    
    // Filter out email index entries - only get actual user objects
    const actualUsers = users.filter((u: any) => u && typeof u === 'object' && u.email);
    console.log('Actual user objects:', actualUsers.length);
    console.log('User emails:', actualUsers.map((u: any) => u.email));
    
    const user = actualUsers.find((u: any) => u.email === email && u.password === password);

    if (!user) {
      console.log('Login failed: User not found or password mismatch');
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    console.log('Login successful for:', email);
    return c.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Login failed' }, 500);
  }
});

// ==================== PRODUCT ROUTES ====================

// Get all products
app.get('/make-server-793a174e/products', async (c) => {
  try {
    const products = await kv.getByPrefix('product:');
    return c.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return c.json({ error: 'Failed to fetch products' }, 500);
  }
});

// Create product
app.post('/make-server-793a174e/products', async (c) => {
  try {
    const productData = await c.req.json();
    const productId = generateId();

    const product = {
      id: productId,
      ...productData,
      createdAt: now(),
    };

    await kv.set(`product:${productId}`, product);
    return c.json({ message: 'Product created', product });
  } catch (error) {
    console.error('Error creating product:', error);
    return c.json({ error: 'Failed to create product' }, 500);
  }
});

// Update product
app.put('/make-server-793a174e/products', async (c) => {
  try {
    const productData = await c.req.json();
    const { id } = productData;

    const existing = await kv.get(`product:${id}`);
    if (!existing) {
      return c.json({ error: 'Product not found' }, 404);
    }

    const product = {
      ...existing,
      ...productData,
      updatedAt: now(),
    };

    await kv.set(`product:${id}`, product);
    return c.json({ message: 'Product updated', product });
  } catch (error) {
    console.error('Error updating product:', error);
    return c.json({ error: 'Failed to update product' }, 500);
  }
});

// Delete product
app.delete('/make-server-793a174e/products/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`product:${id}`);
    return c.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return c.json({ error: 'Failed to delete product' }, 500);
  }
});

// ==================== CART ROUTES ====================

// Get cart
app.get('/make-server-793a174e/cart/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const cart = await kv.get(`cart:${userId}`) || { items: [] };
    return c.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    return c.json({ error: 'Failed to fetch cart' }, 500);
  }
});

// Add to cart
app.post('/make-server-793a174e/cart', async (c) => {
  try {
    const { userId, productId, quantity } = await c.req.json();

    const product = await kv.get(`product:${productId}`);
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }

    if (product.stock < quantity) {
      return c.json({ error: 'Insufficient stock' }, 400);
    }

    const cart = await kv.get(`cart:${userId}`) || { items: [] };
    const existingItemIndex = cart.items.findIndex((item: any) => item.productId === productId);

    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        productId,
        productName: product.name,
        productCategory: product.category,
        price: product.price,
        quantity,
        image: product.image,
      });
    }

    await kv.set(`cart:${userId}`, cart);
    return c.json({ message: 'Added to cart', cartCount: cart.items.length });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return c.json({ error: 'Failed to add to cart' }, 500);
  }
});

// Update cart quantity
app.put('/make-server-793a174e/cart', async (c) => {
  try {
    const { userId, productId, quantity } = await c.req.json();

    const cart = await kv.get(`cart:${userId}`) || { items: [] };
    const itemIndex = cart.items.findIndex((item: any) => item.productId === productId);

    if (itemIndex >= 0) {
      cart.items[itemIndex].quantity = quantity;
      await kv.set(`cart:${userId}`, cart);
    }

    return c.json({ message: 'Cart updated' });
  } catch (error) {
    console.error('Error updating cart:', error);
    return c.json({ error: 'Failed to update cart' }, 500);
  }
});

// Remove from cart
app.delete('/make-server-793a174e/cart/:userId/:productId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const productId = c.req.param('productId');

    const cart = await kv.get(`cart:${userId}`) || { items: [] };
    cart.items = cart.items.filter((item: any) => item.productId !== productId);

    await kv.set(`cart:${userId}`, cart);
    return c.json({ message: 'Item removed' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    return c.json({ error: 'Failed to remove item' }, 500);
  }
});

// ==================== ORDER ROUTES ====================

// Create order (direct checkout without cart)
app.post('/make-server-793a174e/orders', async (c) => {
  try {
    const { customerName, customerEmail, customerPhone, customerAddress, items, totalAmount, paymentMethod, status } = await c.req.json();

    const orderId = generateId();

    const order = {
      id: orderId,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      items,
      totalAmount,
      paymentMethod,
      status: status || 'pending',
      createdAt: now(),
    };

    await kv.set(`order:${orderId}`, order);

    return c.json({
      message: 'Order placed successfully',
      orderId,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return c.json({ error: 'Failed to create order' }, 500);
  }
});

// Checkout
app.post('/make-server-793a174e/checkout', async (c) => {
  try {
    const { userId, customerName, customerEmail, customerPhone, customerAddress, paymentMethod } = await c.req.json();

    const cart = await kv.get(`cart:${userId}`);
    if (!cart || cart.items.length === 0) {
      return c.json({ error: 'Cart is empty' }, 400);
    }

    const orderId = generateId();
    const hasPasabuy = cart.items.some((item: any) => item.productCategory === 'pasabuy');
    const totalAmount = cart.items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    const depositAmount = hasPasabuy ? totalAmount * 0.3 : totalAmount;
    const depositDeadline = hasPasabuy ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null;

    const order = {
      id: orderId,
      userId,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      items: cart.items,
      totalAmount,
      depositAmount,
      remainingBalance: totalAmount - depositAmount,
      status: hasPasabuy ? 'pending' : 'fully_paid',
      depositPaid: !hasPasabuy,
      fullPaid: !hasPasabuy,
      depositDeadline,
      paymentMethod,
      createdAt: now(),
    };

    // Update stock
    for (const item of cart.items) {
      const product = await kv.get(`product:${item.productId}`);
      if (product) {
        product.stock -= item.quantity;
        await kv.set(`product:${item.productId}`, product);
      }
    }

    await kv.set(`order:${orderId}`, order);
    await kv.set(`cart:${userId}`, { items: [] }); // Clear cart

    // Schedule auto-cancel check (simulated - in production use a job queue)
    if (depositDeadline) {
      // In a real app, you'd use a job scheduler
      // For now, we'll check on next order fetch
    }

    return c.json({
      message: 'Order placed successfully',
      orderId,
      depositDeadline,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return c.json({ error: 'Checkout failed' }, 500);
  }
});

// Get all orders (admin)
app.get('/make-server-793a174e/orders', async (c) => {
  try {
    const filter = c.req.query('filter');
    
    let orders = await kv.getByPrefix('order:');
    // orders is already an array of order objects

    // Auto-cancel expired orders
    for (const order of orders) {
      if (
        order.depositDeadline &&
        !order.depositPaid &&
        new Date(order.depositDeadline) < new Date() &&
        order.status !== 'cancelled'
      ) {
        // Return stock
        for (const item of order.items) {
          const product = await kv.get(`product:${item.productId}`);
          if (product) {
            product.stock += item.quantity;
            await kv.set(`product:${item.productId}`, product);
          }
        }
        order.status = 'cancelled';
        await kv.set(`order:${order.id}`, order);
      }
    }

    // Filter for second admin (only fully paid orders)
    if (filter === 'ready_to_ship') {
      orders = orders.filter((o: any) => o.status === 'fully_paid');
    }

    return c.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return c.json({ error: 'Failed to fetch orders' }, 500);
  }
});

// Get customer orders
app.get('/make-server-793a174e/customer-orders/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    let orders = await kv.getByPrefix('order:');
    orders = orders.filter((o: any) => o.userId === userId);

    // Auto-cancel check
    for (const order of orders) {
      if (
        order.depositDeadline &&
        !order.depositPaid &&
        new Date(order.depositDeadline) < new Date() &&
        order.status !== 'cancelled'
      ) {
        for (const item of order.items) {
          const product = await kv.get(`product:${item.productId}`);
          if (product) {
            product.stock += item.quantity;
            await kv.set(`product:${item.productId}`, product);
          }
        }
        order.status = 'cancelled';
        await kv.set(`order:${order.id}`, order);
      }
    }

    return c.json({ orders });
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    return c.json({ error: 'Failed to fetch orders' }, 500);
  }
});

// Update order status
app.put('/make-server-793a174e/orders/:orderId/status', async (c) => {
  try {
    const orderId = c.req.param('orderId');
    const { status, shippingMethod } = await c.req.json();

    const order = await kv.get(`order:${orderId}`);
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    order.status = status;
    if (shippingMethod) {
      order.shippingMethod = shippingMethod;
    }
    order.updatedAt = now();

    await kv.set(`order:${orderId}`, order);
    return c.json({ message: 'Order updated', order });
  } catch (error) {
    console.error('Error updating order:', error);
    return c.json({ error: 'Failed to update order' }, 500);
  }
});

// Update order deposit amount
app.put('/make-server-793a174e/orders/:orderId/deposit', async (c) => {
  try {
    const orderId = c.req.param('orderId');
    const { depositAmount } = await c.req.json();

    const order = await kv.get(`order:${orderId}`);
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    // Update deposit amount and recalculate remaining balance
    order.depositAmount = depositAmount;
    order.remainingBalance = order.totalAmount - depositAmount;
    order.updatedAt = now();

    await kv.set(`order:${orderId}`, order);
    return c.json({ message: 'Deposit amount updated', order });
  } catch (error) {
    console.error('Error updating deposit amount:', error);
    return c.json({ error: 'Failed to update deposit amount' }, 500);
  }
});

// Process payment
app.post('/make-server-793a174e/payment', async (c) => {
  try {
    const { orderId, paymentMethod, isFull } = await c.req.json();

    const order = await kv.get(`order:${orderId}`);
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    if (isFull) {
      order.fullPaid = true;
      order.status = 'fully_paid';
    } else {
      order.depositPaid = true;
      order.status = 'deposit_paid';
    }

    order.paymentMethod = paymentMethod;
    order.updatedAt = now();

    await kv.set(`order:${orderId}`, order);
    return c.json({ message: 'Payment processed successfully' });
  } catch (error) {
    console.error('Payment error:', error);
    return c.json({ error: 'Payment processing failed' }, 500);
  }
});

// ==================== EXPENSE ROUTES ====================

app.get('/make-server-793a174e/expenses', async (c) => {
  try {
    const expenses = await kv.getByPrefix('expense:');
    return c.json({ expenses });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return c.json({ error: 'Failed to fetch expenses' }, 500);
  }
});

app.post('/make-server-793a174e/expenses', async (c) => {
  try {
    const expenseData = await c.req.json();
    const expenseId = generateId();

    const expense = {
      id: expenseId,
      ...expenseData,
      createdAt: now(),
    };

    await kv.set(`expense:${expenseId}`, expense);
    return c.json({ message: 'Expense added', expense });
  } catch (error) {
    console.error('Error adding expense:', error);
    return c.json({ error: 'Failed to add expense' }, 500);
  }
});

app.delete('/make-server-793a174e/expenses/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`expense:${id}`);
    return c.json({ message: 'Expense deleted' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return c.json({ error: 'Failed to delete expense' }, 500);
  }
});

// ==================== STATS & REPORTS ====================

app.get('/make-server-793a174e/stats', async (c) => {
  try {
    const orders = await kv.getByPrefix('order:');
    const products = await kv.getByPrefix('product:');
    const expenses = await kv.getByPrefix('expense:');

    // Calculate total sales from fully paid AND completed orders
    const totalSales = orders
      .filter((o: any) => o.fullPaid || o.status === 'completed')
      .reduce((sum: number, o: any) => sum + o.totalAmount, 0);

    const totalExpenses = expenses
      .reduce((sum: number, e: any) => sum + e.amount, 0);

    const pendingOrders = orders.filter((o: any) =>
      ['pending', 'deposit_paid', 'ready_for_payment'].includes(o.status)
    ).length;

    const fullyPaidOrders = orders.filter((o: any) => 
      ['fully_paid', 'shipped'].includes(o.status)
    ).length;

    const completedOrders = orders.filter((o: any) => o.status === 'completed').length;

    return c.json({
      totalSales,
      totalExpenses,
      grossProfit: totalSales - totalExpenses,
      pendingOrders,
      fullyPaidOrders,
      completedOrders,
      totalProducts: products.length,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return c.json({ error: 'Failed to fetch stats' }, 500);
  }
});

app.get('/make-server-793a174e/reports', async (c) => {
  try {
    const orders = await kv.getByPrefix('order:');
    const expenses = await kv.getByPrefix('expense:');

    // Sales by month
    const salesByMonth: Record<string, number> = {};
    orders
      .filter((o: any) => o.fullPaid)
      .forEach((o: any) => {
        const month = new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        salesByMonth[month] = (salesByMonth[month] || 0) + o.totalAmount;
      });

    // Expenses by category
    const expensesByCategory: Record<string, number> = {};
    expenses.forEach((e: any) => {
      expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + e.amount;
    });

    // Top products
    const productSales: Record<string, { quantity: number; revenue: number; name: string }> = {};
    orders
      .filter((o: any) => o.fullPaid)
      .forEach((o: any) => {
        o.items.forEach((item: any) => {
          if (!productSales[item.productId]) {
            productSales[item.productId] = { quantity: 0, revenue: 0, name: item.productName };
          }
          productSales[item.productId].quantity += item.quantity;
          productSales[item.productId].revenue += item.price * item.quantity;
        });
      });

    const topProducts = Object.entries(productSales)
      .map(([id, data]) => ({ productName: data.name, quantity: data.quantity, revenue: data.revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const totalRevenue = Object.values(salesByMonth).reduce((sum, val) => sum + val, 0);
    const totalExpenses = Object.values(expensesByCategory).reduce((sum, val) => sum + val, 0);

    return c.json({
      salesByMonth: Object.entries(salesByMonth).map(([month, sales]) => ({ month, sales })),
      expensesByCategory: Object.entries(expensesByCategory).map(([category, amount]) => ({ category, amount })),
      topProducts,
      summary: {
        totalRevenue,
        totalExpenses,
        grossProfit: totalRevenue - totalExpenses,
        netProfit: totalRevenue - totalExpenses,
      },
    });
  } catch (error) {
    console.error('Error generating reports:', error);
    return c.json({ error: 'Failed to generate reports' }, 500);
  }
});

app.get('/make-server-793a174e/supplier-report', async (c) => {
  try {
    const products = await kv.getByPrefix('product:');
    const orders = await kv.getByPrefix('order:');

    const productSalesMap: Record<string, { totalSold: number; totalRevenue: number }> = {};

    orders
      .filter((o: any) => o.fullPaid)
      .forEach((o: any) => {
        o.items.forEach((item: any) => {
          if (!productSalesMap[item.productId]) {
            productSalesMap[item.productId] = { totalSold: 0, totalRevenue: 0 };
          }
          productSalesMap[item.productId].totalSold += item.quantity;
          productSalesMap[item.productId].totalRevenue += item.price * item.quantity;
        });
      });

    const productSales = products.map((p: any) => {
      const sales = productSalesMap[p.id] || { totalSold: 0, totalRevenue: 0 };
      return {
        productId: p.id,
        productName: p.name,
        cost: p.cost,
        price: p.price,
        totalSold: sales.totalSold,
        totalRevenue: sales.totalRevenue,
        profitPerUnit: p.price - p.cost,
        totalProfit: (p.price - p.cost) * sales.totalSold,
      };
    });

    return c.json({ products: productSales });
  } catch (error) {
    console.error('Error generating supplier report:', error);
    return c.json({ error: 'Failed to generate report' }, 500);
  }
});

// Create default master admin on first run
app.get('/make-server-793a174e/init', async (c) => {
  try {
    const users = await kv.getByPrefix('user:');
    console.log('Init route called. Found users:', users.length);
    
    // Check if users exist
    const actualUsers = users.filter((u: any) => u && typeof u === 'object' && u.email);
    const masterExists = actualUsers.some((u: any) => u.email === 'admin@shop.com');
    const warehouseExists = actualUsers.some((u: any) => u.email === 'warehouse@shop.com');
    const customerExists = actualUsers.some((u: any) => u.email === 'customer@shop.com');
    
    console.log('Master admin exists:', masterExists, 'Warehouse exists:', warehouseExists, 'Customer exists:', customerExists);
    
    if (!masterExists) {
      const masterAdminId = generateId();
      const masterAdmin = {
        id: masterAdminId,
        email: 'admin@shop.com',
        password: 'admin123',
        name: 'Master Admin',
        role: 'master',
        createdAt: now(),
      };
      
      await kv.set(`user:${masterAdminId}`, masterAdmin);
      await kv.set(`user:email:admin@shop.com`, masterAdminId);
      console.log('Created master admin');
    }
    
    if (!warehouseExists) {
      const secondAdminId = generateId();
      const secondAdmin = {
        id: secondAdminId,
        email: 'warehouse@shop.com',
        password: 'warehouse123',
        name: 'Warehouse Staff',
        role: 'second',
        createdAt: now(),
      };
      
      await kv.set(`user:${secondAdminId}`, secondAdmin);
      await kv.set(`user:email:warehouse@shop.com`, secondAdminId);
      console.log('Created warehouse admin');
    }
    
    if (!customerExists) {
      const customerId = generateId();
      const customer = {
        id: customerId,
        email: 'customer@shop.com',
        password: 'customer123',
        name: 'Maria Santos',
        role: 'customer',
        createdAt: now(),
      };
      
      await kv.set(`user:${customerId}`, customer);
      await kv.set(`user:email:customer@shop.com`, customerId);
      console.log('Created demo customer');
    }
    
    if (!masterExists || !warehouseExists || !customerExists) {
      return c.json({
        message: 'Default accounts created',
        credentials: {
          masterAdmin: { email: 'admin@shop.com', password: 'admin123' },
          secondAdmin: { email: 'warehouse@shop.com', password: 'warehouse123' },
          customer: { email: 'customer@shop.com', password: 'customer123' },
        },
      });
    }
    
    return c.json({ message: 'Already initialized', existingUsers: actualUsers.length });
  } catch (error) {
    console.error('Init error:', error);
    return c.json({ error: 'Initialization failed', details: String(error) }, 500);
  }
});

// Debug endpoint to check what users exist
app.get('/make-server-793a174e/debug/users', async (c) => {
  try {
    const users = await kv.getByPrefix('user:');
    const actualUsers = users.filter((u: any) => u && typeof u === 'object' && u.email);
    
    return c.json({
      totalEntries: users.length,
      actualUsers: actualUsers.length,
      users: actualUsers.map((u: any) => ({
        email: u.email,
        name: u.name,
        role: u.role,
        hasPassword: !!u.password,
      })),
    });
  } catch (error) {
    console.error('Debug error:', error);
    return c.json({ error: 'Debug failed', details: String(error) }, 500);
  }
});

Deno.serve(app.fetch);
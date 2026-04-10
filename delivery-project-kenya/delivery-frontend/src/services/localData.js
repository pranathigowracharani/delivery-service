const USERS_KEY = "delivery_frontend_users";
const ORDERS_KEY = "delivery_frontend_orders";

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function createSeedOrders(user) {
  const now = Date.now();

  return [
    {
      id: `${user.id}-ord-1`,
      order_id: `ORD-${String(user.id).slice(-4)}1`,
      user_id: user.id,
      customer_name: "Amina Njoroge",
      pickup_location: "Prime Basket, Westlands",
      delivery_location: "Parklands, Nairobi",
      distance: "3.2 km",
      amount: 220,
      status: "pending",
      created_at: new Date(now - 1000 * 60 * 90).toISOString(),
    },
    {
      id: `${user.id}-ord-2`,
      order_id: `ORD-${String(user.id).slice(-4)}2`,
      user_id: user.id,
      customer_name: "Brian Otieno",
      pickup_location: "City Market",
      delivery_location: "Kilimani",
      distance: "5.6 km",
      amount: 340,
      status: "on_the_way",
      created_at: new Date(now - 1000 * 60 * 180).toISOString(),
    },
    {
      id: `${user.id}-ord-3`,
      order_id: `ORD-${String(user.id).slice(-4)}3`,
      user_id: user.id,
      customer_name: "Grace Wanjiku",
      pickup_location: "Quick Mart, Ngara",
      delivery_location: "South B, Nairobi",
      distance: "4.4 km",
      amount: 280,
      status: "delivered",
      created_at: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
    },
  ];
}

export function ensureLocalData() {
  const users = readJson(USERS_KEY, []);
  const orders = readJson(ORDERS_KEY, []);

  if (!Array.isArray(users)) {
    writeJson(USERS_KEY, []);
  }

  if (!Array.isArray(orders)) {
    writeJson(ORDERS_KEY, []);
  }
}

export function registerUser(userInput) {
  ensureLocalData();
  const users = readJson(USERS_KEY, []);
  const normalizedEmail = userInput.email.trim().toLowerCase();
  const normalizedMobile = userInput.mobile.trim();

  const user = {
    id: Date.now(),
    name: userInput.name.trim(),
    email: normalizedEmail,
    mobile: normalizedMobile,
    otp: userInput.otp,
    city: userInput.city.trim(),
    maishaCard: userInput.maishaCard,
    kraPin: userInput.kraPin,
    dl_number: userInput.dlNumber,
    dl_expiry: userInput.dlExpiry,
    bank_account: userInput.bankAccount,
    bankCode: userInput.bankCode,
    account_holder: userInput.accountHolder,
    mpesaNumber: userInput.mpesaNumber,
    descriptor: userInput.descriptor,
    profile_image: userInput.profileImage || "",
    maisha_card_doc: userInput.maishaCardFileName || "",
    kra_pin_doc: userInput.kraPinFileName || "",
    dl_doc: userInput.dlFileName || "",
    created_at: new Date().toISOString(),
  };

  writeJson(USERS_KEY, [...users, user]);

  const orders = readJson(ORDERS_KEY, []);
  writeJson(ORDERS_KEY, [...orders, ...createSeedOrders(user)]);

  return { success: true, user };
}

export function loginUser(identifier) {
  ensureLocalData();
  const normalizedIdentifier = identifier.trim().toLowerCase();
  const users = readJson(USERS_KEY, []);
  const matchedUser = users.find(
    (item) =>
      item.email === normalizedIdentifier ||
      item.mobile.toLowerCase() === normalizedIdentifier
  );

  const user = matchedUser || users[users.length - 1];

  if (!user) {
    return { success: false };
  }

  return { success: true, user };
}

export function getUserProfile(userId) {
  ensureLocalData();
  const users = readJson(USERS_KEY, []);
  const user = users.find((item) => String(item.id) === String(userId));

  if (!user) {
    return { success: false, message: "User not found" };
  }

  return { success: true, user };
}

export function updateUserProfile(userId, updates) {
  ensureLocalData();
  const users = readJson(USERS_KEY, []);
  const updatedUsers = users.map((user) =>
    String(user.id) === String(userId) ? { ...user, ...updates } : user
  );
  const updatedUser = updatedUsers.find(
    (user) => String(user.id) === String(userId)
  );

  if (!updatedUser) {
    return { success: false, message: "User not found" };
  }

  writeJson(USERS_KEY, updatedUsers);
  return { success: true, user: updatedUser };
}

export function updateUserProfileImage(userId, imageDataUrl) {
  return updateUserProfile(userId, { profile_image: imageDataUrl });
}

export function getUserOrders(userId) {
  ensureLocalData();
  const orders = readJson(ORDERS_KEY, []).filter(
    (order) => String(order.user_id) === String(userId)
  );

  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  return { success: true, orders: sortedOrders };
}

export function getActiveOrders(userId) {
  const { orders } = getUserOrders(userId);
  const activeOrders = orders.filter(
    (order) => !["delivered", "cancelled"].includes(order.status)
  );

  return { success: true, orders: activeOrders };
}

export function updateOrderStatus(orderId, status, reason = "") {
  ensureLocalData();
  const orders = readJson(ORDERS_KEY, []);
  let updatedOrder = null;

  const updatedOrders = orders.map((order) => {
    if (String(order.order_id) !== String(orderId) && String(order.id) !== String(orderId)) {
      return order;
    }

    updatedOrder = {
      ...order,
      status,
      cancel_reason: reason || order.cancel_reason || "",
    };

    return updatedOrder;
  });

  if (!updatedOrder) {
    return { success: false, message: "Order not found" };
  }

  writeJson(ORDERS_KEY, updatedOrders);
  return { success: true, order: updatedOrder };
}

export function getEarnings(userId) {
  const { orders } = getUserOrders(userId);
  const deliveredOrders = orders.filter((order) => order.status === "delivered");
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const sumAmounts = (list) =>
    list.reduce((total, order) => total + Number(order.amount || 0), 0);

  const today = sumAmounts(
    deliveredOrders.filter((order) => new Date(order.created_at) >= startOfToday)
  );
  const thisWeek = sumAmounts(
    deliveredOrders.filter((order) => new Date(order.created_at) >= startOfWeek)
  );
  const thisMonth = sumAmounts(
    deliveredOrders.filter((order) => new Date(order.created_at) >= startOfMonth)
  );
  const total = sumAmounts(deliveredOrders);

  return {
    success: true,
    today,
    thisWeek,
    thisMonth,
    total,
  };
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

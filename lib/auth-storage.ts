import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export interface StoredCartItem {
  id: string;
  size: string;
  quantity: number;
  addedAt?: string;
}

export interface UserOrder {
  orderId: string;
  items: StoredCartItem[];
  subtotal: number;
  total: number;
  currency: string;
  shippingAddress?: {
    fullName?: string;
    street?: string;
    city?: string;
    country?: string;
    postalCode?: string;
  };
  status: "Confirmed" | "Crafting" | "Dispatched" | "Delivered";
  trackingCode: string;
  createdAt: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  tier: string;
  cart: StoredCartItem[];
  wishlist: string[];
  shippingAddress?: {
    fullName?: string;
    street?: string;
    city?: string;
    country?: string;
    postalCode?: string;
    phone?: string;
  };
  orders: UserOrder[];
  createdAt: string;
  updatedAt: string;
}

interface DatabaseStructure {
  users: Record<string, UserAccount>; // keyed by email
  sessions: Record<string, { userId: string; expiresAt: number }>;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "atelier-store.json");

// In-memory cache to guarantee sub-millisecond responses and synchronization
let inMemoryDb: DatabaseStructure | null = null;

async function ensureDataFile(): Promise<DatabaseStructure> {
  if (inMemoryDb) {
    return inMemoryDb;
  }

  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const content = await fs.readFile(DB_FILE, "utf-8");
    inMemoryDb = JSON.parse(content) as DatabaseStructure;
    return inMemoryDb;
  } catch {
    // Seed default demo user if new database
    const salt = crypto.randomBytes(16).toString("hex");
    const demoHash = hashPasswordWithSalt("atelier2026", salt);
    
    inMemoryDb = {
      users: {
        "client@dioka.com": {
          id: "usr_client_demo",
          name: "Wilfred Owubokiri",
          email: "client@dioka.com",
          passwordHash: demoHash,
          salt,
          tier: "Dioka Atelier Member · Preferred Client",
          cart: [
            { id: "arc-shoulder-bag", size: "One size", quantity: 1, addedAt: new Date().toISOString() },
            { id: "column-ankle-boot", size: "EU 42 / US 9", quantity: 1, addedAt: new Date().toISOString() },
          ],
          wishlist: ["transit-leather-jacket", "saddle-courier-bag"],
          shippingAddress: {
            fullName: "Wilfred Owubokiri",
            street: "42 Savile Row & Kensington",
            city: "London",
            country: "United Kingdom",
            postalCode: "W1S 2ER",
            phone: "+44 20 7946 0912",
          },
          orders: [
            {
              orderId: "DK-88204",
              items: [{ id: "atelier-weekender", size: "One size", quantity: 1 }],
              subtotal: 620,
              total: 620,
              currency: "USD",
              status: "Dispatched",
              trackingCode: "DK-EXP-99214-GB",
              createdAt: "2026-09-28T14:30:00Z",
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
      sessions: {},
    };

    try {
      await fs.writeFile(DB_FILE, JSON.stringify(inMemoryDb, null, 2), "utf-8");
    } catch {
      // fallback in-memory only
    }

    return inMemoryDb;
  }
}

async function persistDb(): Promise<void> {
  if (!inMemoryDb) return;
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DB_FILE, JSON.stringify(inMemoryDb, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write to database file:", err);
  }
}

export function hashPasswordWithSalt(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
}

export async function findUserByEmail(email: string): Promise<UserAccount | null> {
  const db = await ensureDataFile();
  const normalized = email.trim().toLowerCase();
  return db.users[normalized] || null;
}

export async function findUserById(id: string): Promise<UserAccount | null> {
  const db = await ensureDataFile();
  return Object.values(db.users).find((u) => u.id === id) || null;
}

export async function createUser(params: {
  name: string;
  email: string;
  password: string;
  initialCart?: StoredCartItem[];
}): Promise<UserAccount> {
  const db = await ensureDataFile();
  const normalized = params.email.trim().toLowerCase();
  
  if (db.users[normalized]) {
    throw new Error("An account with this email address already exists.");
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = hashPasswordWithSalt(params.password, salt);
  const userId = `usr_${crypto.randomUUID().slice(0, 8)}`;

  const newUser: UserAccount = {
    id: userId,
    name: params.name.trim(),
    email: normalized,
    passwordHash,
    salt,
    tier: "Dioka Atelier Member · Preferred Client",
    cart: params.initialCart && Array.isArray(params.initialCart) ? params.initialCart : [],
    wishlist: [],
    orders: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.users[normalized] = newUser;
  await persistDb();
  return newUser;
}

export async function createSession(userId: string): Promise<string> {
  const db = await ensureDataFile();
  const token = `dk_sess_${crypto.randomBytes(24).toString("hex")}`;
  // 30 days expiration
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
  db.sessions[token] = { userId, expiresAt };
  await persistDb();
  return token;
}

export async function getUserFromSession(token?: string | null): Promise<UserAccount | null> {
  if (!token) return null;
  const db = await ensureDataFile();
  const session = db.sessions[token];
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    delete db.sessions[token];
    await persistDb();
    return null;
  }
  return findUserById(session.userId);
}

export async function deleteSession(token: string): Promise<void> {
  const db = await ensureDataFile();
  delete db.sessions[token];
  await persistDb();
}

export async function updateUserCart(
  userId: string,
  cart: StoredCartItem[]
): Promise<StoredCartItem[]> {
  const db = await ensureDataFile();
  const user = Object.values(db.users).find((u) => u.id === userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Validate items
  user.cart = cart.map((item) => ({
    id: item.id,
    size: item.size || "One size",
    quantity: Math.max(1, Math.min(item.quantity, 10)),
    addedAt: item.addedAt || new Date().toISOString(),
  }));
  user.updatedAt = new Date().toISOString();

  await persistDb();
  return user.cart;
}

export async function updateUserProfile(
  userId: string,
  updates: {
    name?: string;
    shippingAddress?: UserAccount["shippingAddress"];
  }
): Promise<UserAccount> {
  const db = await ensureDataFile();
  const user = Object.values(db.users).find((u) => u.id === userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (updates.name) user.name = updates.name.trim();
  if (updates.shippingAddress) user.shippingAddress = updates.shippingAddress;
  user.updatedAt = new Date().toISOString();

  await persistDb();
  return user;
}

export async function recordUserOrder(
  userId: string,
  orderData: Omit<UserOrder, "orderId" | "createdAt" | "status" | "trackingCode">
): Promise<UserOrder> {
  const db = await ensureDataFile();
  const user = Object.values(db.users).find((u) => u.id === userId);
  if (!user) {
    throw new Error("User not found");
  }

  const orderId = `DK-${Math.floor(10000 + Math.random() * 90000)}`;
  const trackingCode = `DK-EXP-${Math.floor(10000 + Math.random() * 90000)}-${(orderData.shippingAddress?.country || "INT").slice(0, 2).toUpperCase()}`;

  const newOrder: UserOrder = {
    ...orderData,
    orderId,
    status: "Confirmed",
    trackingCode,
    createdAt: new Date().toISOString(),
  };

  user.orders.unshift(newOrder);
  user.cart = []; // Empty specialized cart upon confirmed order
  user.updatedAt = new Date().toISOString();

  await persistDb();
  return newOrder;
}

import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { accountPlans, gardenSnapshots, InsertUser, users, type User } from "../drizzle/schema";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL, { prepare: false });
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

function passwordOpenId(email: string) {
  return `password:${createHash("sha256").update(email.trim().toLowerCase()).digest("hex")}`;
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

function passwordMatches(password: string, storedHash: string) {
  const [salt, derived] = storedHash.split(":");
  if (!salt || !derived) return false;
  const candidate = scryptSync(password, salt, 64).toString("hex");
  return candidate.length === derived.length && timingSafeEqual(Buffer.from(candidate, "hex"), Buffer.from(derived, "hex"));
}

export async function createPasswordUser(input: { name: string; email: string; password: string }): Promise<User | null> {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  const normalizedEmail = input.email.trim().toLowerCase();
  const openId = passwordOpenId(normalizedEmail);
  if (await getUserByOpenId(openId)) return null;
  await database.insert(users).values({
    openId,
    name: input.name.trim(),
    email: normalizedEmail,
    passwordHash: hashPassword(input.password),
    loginMethod: "password",
    lastSignedIn: new Date(),
  });
  return (await getUserByOpenId(openId)) ?? null;
}

export async function authenticatePasswordUser(email: string, password: string): Promise<User | null> {
  const user = await getUserByOpenId(passwordOpenId(email));
  if (!user?.passwordHash || !passwordMatches(password, user.passwordHash)) return null;
  await upsertUser({ openId: user.openId, lastSignedIn: new Date() });
  return user;
}

export async function deleteUserAccount(userId: number): Promise<void> {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  // Remove primeiro os dados dependentes para funcionar mesmo sem foreign keys em cascata.
  await database.delete(accountPlans).where(eq(accountPlans.userId, userId));
  await database.delete(gardenSnapshots).where(eq(gardenSnapshots.userId, userId));
  await database.delete(users).where(eq(users.id, userId));
}

export async function getAccountPlan(userId: number) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  const rows = await database.select().from(accountPlans).where(eq(accountPlans.userId, userId)).limit(1);
  return rows[0] ?? { plan: "free" as const, status: "active" as const };
}

export type GardenSnapshotData = {
  profile: {
    pseudonym: string;
    avatar: string;
    interests: string[];
    pactAccepted: boolean;
  } | null;
  journal: string[];
  energyCount: number;
  adviceCount: number;
  helpedCount: number;
};

export async function getGardenSnapshot(userId: number): Promise<GardenSnapshotData | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const rows = await db.select().from(gardenSnapshots).where(eq(gardenSnapshots.userId, userId)).limit(1);
  const snapshot = rows[0];
  if (!snapshot) return null;

  return {
    profile: snapshot.profileJson ? JSON.parse(snapshot.profileJson) : null,
    journal: JSON.parse(snapshot.journalJson),
    energyCount: snapshot.energyCount,
    adviceCount: snapshot.adviceCount,
    helpedCount: snapshot.helpedCount,
  };
}

export async function saveGardenSnapshot(userId: number, snapshot: GardenSnapshotData): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const values = {
    userId,
    profileJson: snapshot.profile ? JSON.stringify(snapshot.profile) : null,
    journalJson: JSON.stringify(snapshot.journal),
    energyCount: snapshot.energyCount,
    adviceCount: snapshot.adviceCount,
    helpedCount: snapshot.helpedCount,
  };

  await db.insert(gardenSnapshots).values(values).onConflictDoUpdate({
    target: gardenSnapshots.userId,
    set: {
      profileJson: values.profileJson,
      journalJson: values.journalJson,
      energyCount: values.energyCount,
      adviceCount: values.adviceCount,
      helpedCount: values.helpedCount,
      updatedAt: new Date(),
    },
  });
}


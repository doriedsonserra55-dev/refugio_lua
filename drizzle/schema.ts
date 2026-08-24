import { integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("user_role", ["user", "admin"]);
export const planEnum = pgEnum("account_plan", ["free", "vip_monthly", "vip_annual"]);
export const planStatusEnum = pgEnum("account_plan_status", ["active", "inactive"]);

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = pgTable("users", {
  /**
   * Primary key. Auto-incremented serial numeric value managed by PostgreSQL.
   */
  id: serial("id").primaryKey(),
  /** OAuth identifier or password hash key (openId) returned from auth. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/** Dados privados do Jardim vinculados exclusivamente à conta autenticada. */
export const gardenSnapshots = pgTable("garden_snapshots", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().unique(),
  profileJson: text("profileJson"),
  journalJson: text("journalJson").notNull(),
  energyCount: integer("energyCount").default(0).notNull(),
  adviceCount: integer("adviceCount").default(0).notNull(),
  helpedCount: integer("helpedCount").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

/** Plano atual. A ativação paga será atualizada pelo provedor de pagamentos escolhido. */
export const accountPlans = pgTable("account_plans", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().unique(),
  plan: planEnum("plan").default("free").notNull(),
  status: planStatusEnum("status").default("active").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type GardenSnapshotRow = typeof gardenSnapshots.$inferSelect;
export type InsertGardenSnapshot = typeof gardenSnapshots.$inferInsert;
export type AccountPlan = typeof accountPlans.$inferSelect;


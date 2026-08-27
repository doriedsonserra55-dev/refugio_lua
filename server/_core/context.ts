import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { getSupabaseUserFromAccessToken } from "./supabase";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(opts: CreateExpressContextOptions): Promise<TrpcContext> {
  let user: User | null = null;
  const authorization = opts.req.header("authorization") ?? "";
  const accessToken = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";

  if (accessToken) {
    try {
      const supabaseUser = await getSupabaseUserFromAccessToken(accessToken);
      if (supabaseUser) {
        const metadata = supabaseUser.user_metadata ?? {};
        const name = typeof metadata.name === "string" ? metadata.name : typeof metadata.full_name === "string" ? metadata.full_name : supabaseUser.email ?? null;
        const provider = typeof metadata.provider === "string" ? metadata.provider : "supabase";
        user = await db.getOrCreateSupabaseUser({ id: supabaseUser.id, email: supabaseUser.email, name, provider });
      }
    } catch (error) {
      console.warn("[Supabase Auth] Falha ao autenticar requisição:", error);
    }
  }

  return { req: opts.req, res: opts.res, user };
}

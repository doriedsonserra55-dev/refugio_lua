import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { z } from "zod";

export const credentialsSchema = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(8).max(128),
});

export const passwordResetRequestSchema = z.object({ email: z.string().trim().email().max(320) });
export const passwordResetSchema = z.object({ token: z.string().regex(/^[a-f0-9]{64}$/i), password: z.string().min(8).max(128) });

export const gardenSnapshotSchema = z.object({
  profile: z.object({
    pseudonym: z.string().min(1).max(40),
    avatar: z.string().min(1).max(16),
    interests: z.array(z.string().min(1).max(32)).max(12),
    pactAccepted: z.boolean(),
  }).nullable(),
  journal: z.array(z.string().min(1).max(1200)).max(200),
  energyCount: z.number().int().min(0).max(1_000_000),
  adviceCount: z.number().int().min(0).max(1_000_000),
  helpedCount: z.number().int().min(0).max(1_000_000).default(0),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(({ ctx }) => ctx.user),
    logout: publicProcedure.mutation(() => ({ success: true } as const)),
    deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
      await db.deleteUserAccount(ctx.user.id);
      return { success: true } as const;
    }),
  }),
  garden: router({
    snapshot: protectedProcedure.query(({ ctx }) => db.getGardenSnapshot(ctx.user.id)),
    save: protectedProcedure.input(gardenSnapshotSchema).mutation(async ({ ctx, input }) => {
      await db.saveGardenSnapshot(ctx.user.id, input);
      return { success: true } as const;
    }),
  }),
  plans: router({
    current: protectedProcedure.query(({ ctx }) => db.getAccountPlan(ctx.user.id)),
  }),
});

export type AppRouter = typeof appRouter;

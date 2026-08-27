import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { sendPasswordResetEmail } from "./password-reset-email";
import { sdk } from "./_core/sdk";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const gardenSnapshotSchema = z.object({
  profile: z
    .object({
      pseudonym: z.string().min(1).max(40),
      avatar: z.string().min(1).max(16),
      interests: z.array(z.string().min(1).max(32)).max(12),
      pactAccepted: z.boolean(),
    })
    .nullable(),
  journal: z.array(z.string().min(1).max(1200)).max(200),
  energyCount: z.number().int().min(0).max(1_000_000),
  adviceCount: z.number().int().min(0).max(1_000_000),
  helpedCount: z.number().int().min(0).max(1_000_000).default(0),
});

export const credentialsSchema = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(8).max(128),
});

const registrationSchema = credentialsSchema.extend({ name: z.string().trim().min(2).max(40) });
export const passwordResetRequestSchema = z.object({ email: z.string().trim().email().max(320) });
export const passwordResetSchema = z.object({ token: z.string().regex(/^[a-f0-9]{64}$/i), password: z.string().min(8).max(128) });

async function passwordSession(user: { openId: string; name: string | null }) {
  return sdk.createSessionToken(user.openId, { name: user.name ?? "Membro do Refúgio", expiresInMs: 1000 * 60 * 60 * 24 * 30 });
}

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
      await db.deleteUserAccount(ctx.user.id);
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
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
  passwordAuth: router({
    signUp: publicProcedure.input(registrationSchema).mutation(async ({ input }) => {
      try {
        const user = await db.createPasswordUser(input);
        if (!user) throw new TRPCError({ code: "CONFLICT", message: "Este e-mail já possui uma conta." });
        return { token: await passwordSession(user), user };
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        console.error("[signUp Error]", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err instanceof Error ? err.message : "Erro ao criar conta no banco de dados.",
        });
      }
    }),
    signIn: publicProcedure.input(credentialsSchema).mutation(async ({ input }) => {
      try {
        const user = await db.authenticatePasswordUser(input.email, input.password);
        if (!user) throw new TRPCError({ code: "UNAUTHORIZED", message: "E-mail ou senha inválidos." });
        return { token: await passwordSession(user), user };
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        console.error("[signIn Error]", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: err instanceof Error ? err.message : "Erro ao autenticar. Tente novamente.",
        });
      }
    }),
    requestReset: publicProcedure.input(passwordResetRequestSchema).mutation(async ({ ctx, input }) => {
      try {
        const reset = await db.createPasswordResetToken(input.email);
        if (reset) {
          await sendPasswordResetEmail({
            email: reset.user.email ?? input.email,
            token: reset.token,
            expiresAt: reset.expiresAt,
            requestOrigin: `${ctx.req.protocol}://${ctx.req.get("host")}`,
          });
        }
        // A resposta uniforme evita revelar se um e-mail possui cadastro.
        return { success: true } as const;
      } catch (err) {
        console.error("[requestReset Error]", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Não foi possível iniciar a recuperação agora. Tente novamente.",
        });
      }
    }),
    resetPassword: publicProcedure.input(passwordResetSchema).mutation(async ({ input }) => {
      try {
        const changed = await db.resetPasswordWithToken(input.token, input.password);
        if (!changed) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Este link expirou ou já foi utilizado." });
        }
        return { success: true } as const;
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        console.error("[resetPassword Error]", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Não foi possível redefinir sua senha agora. Tente novamente.",
        });
      }
    }),
  }),
  plans: router({
    current: protectedProcedure.query(({ ctx }) => db.getAccountPlan(ctx.user.id)),
  }),
});

export type AppRouter = typeof appRouter;

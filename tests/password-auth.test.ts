import { credentialsSchema, gardenSnapshotSchema } from "../server/routers";
import { describe, expect, it } from "vitest";

describe("validações de conta e Jardim", () => {
  it("aceita uma credencial com senha de ao menos oito caracteres", () => {
    expect(credentialsSchema.safeParse({ email: "pessoa@exemplo.com", password: "cuidado123" }).success).toBe(true);
  });

  it("rejeita uma senha curta", () => {
    expect(credentialsSchema.safeParse({ email: "pessoa@exemplo.com", password: "curta" }).success).toBe(false);
  });

  it("exige a métrica de acolhimentos no snapshot sincronizado", () => {
    const snapshot = { profile: null, journal: [], energyCount: 2, adviceCount: 1, helpedCount: 0 };
    expect(gardenSnapshotSchema.safeParse(snapshot).success).toBe(true);
    expect(gardenSnapshotSchema.safeParse({ ...snapshot, helpedCount: -1 }).success).toBe(false);
  });
});

import { describe, expect, it } from "vitest";

import { gardenSnapshotSchema } from "../server/routers";

describe("sincronização do Jardim", () => {
  const validSnapshot = {
    profile: {
      pseudonym: "Girassol sereno",
      avatar: "🌻",
      interests: ["Recomeços", "Autocuidado"],
      pactAccepted: true,
    },
    journal: ["Hoje consegui respirar com mais calma."],
    energyCount: 12,
    adviceCount: 3,
  };

  it("aceita um retrato privado válido do Jardim", () => {
    expect(gardenSnapshotSchema.parse(validSnapshot)).toEqual({ ...validSnapshot, helpedCount: 0 });
  });

  it("recusa contagens negativas e entradas de diário vazias", () => {
    expect(() => gardenSnapshotSchema.parse({ ...validSnapshot, energyCount: -1 })).toThrow();
    expect(() => gardenSnapshotSchema.parse({ ...validSnapshot, journal: [""] })).toThrow();
  });
});

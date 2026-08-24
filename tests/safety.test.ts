import { describe, expect, it } from "vitest";

import { needsImmediateSupport } from "../lib/safety";

describe("needsImmediateSupport", () => {
  it("sinaliza mensagens com indicação explícita de risco", () => {
    expect(needsImmediateSupport("Eu não quero mais viver assim.")).toBe(true);
    expect(needsImmediateSupport("Sinto vontade de acabar com minha vida.")).toBe(true);
  });

  it("não interrompe mensagens comuns de sofrimento que não sinalizam risco crítico", () => {
    expect(needsImmediateSupport("Hoje foi difícil e eu queria desabafar.")).toBe(false);
    expect(needsImmediateSupport("Estou cansada do trabalho e preciso descansar.")).toBe(false);
  });
});

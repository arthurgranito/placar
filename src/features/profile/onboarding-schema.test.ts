import { describe, expect, it } from "vitest";

import { ONBOARDING_MESSAGES, parseOnboardingForm } from "./onboarding-schema";

function form(campos: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(campos)) fd.set(k, v);
  return fd;
}

describe("parseOnboardingForm", () => {
  it("aceita nome, 18+ e a escolha dos cards", () => {
    const r = parseOnboardingForm(
      form({ displayName: "  Ana  ", isAdult: "on", showInCards: "on" }),
    );
    expect(r.success).toBe(true);
    expect(r.data).toEqual({ displayName: "Ana", isAdult: true, showInCards: true });
  });

  it("show_in_cards desligado quando o campo não vem", () => {
    const r = parseOnboardingForm(form({ displayName: "Ana", isAdult: "on" }));
    expect(r.data?.showInCards).toBe(false);
  });

  it.each(["", "   ", "a".repeat(41)])("rejeita o nome %j", (nome) => {
    const r = parseOnboardingForm(form({ displayName: nome, isAdult: "on" }));
    expect(r.success).toBe(false);
    expect(r.error?.flatten().fieldErrors.displayName).toEqual([ONBOARDING_MESSAGES.nome]);
  });

  it("conta emoji como um caractere (igual ao Postgres)", () => {
    const r = parseOnboardingForm(form({ displayName: "🏠".repeat(40), isAdult: "on" }));
    expect(r.success).toBe(true);
  });

  it("exige a confirmação de 18+", () => {
    const r = parseOnboardingForm(form({ displayName: "Ana" }));
    expect(r.success).toBe(false);
    expect(r.error?.flatten().fieldErrors.isAdult).toEqual([ONBOARDING_MESSAGES.adulto]);
  });
});

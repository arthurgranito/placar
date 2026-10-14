import { describe, expect, it } from "vitest";

import {
  DEFAULT_AFTER_LOGIN,
  isProtectedPath,
  loginErrorMessage,
  loginRedirectPath,
  onboardingPath,
  safeNextPath,
} from "./paths";

describe("safeNextPath", () => {
  it("aceita caminhos internos", () => {
    expect(safeNextPath("/entrar/abc/aceitar")).toBe("/entrar/abc/aceitar");
    expect(safeNextPath("/casa/nova?x=1")).toBe("/casa/nova?x=1");
  });

  it.each([null, undefined, "", "https://mal.com", "//mal.com", "/\\mal.com", "casa", "/a\nb"])(
    "rejeita %j e usa o padrão",
    (valor) => {
      expect(safeNextPath(valor)).toBe(DEFAULT_AFTER_LOGIN);
    },
  );
});

describe("isProtectedPath", () => {
  it("protege onboarding e casa", () => {
    expect(isProtectedPath("/bem-vindo")).toBe(true);
    expect(isProtectedPath("/casa/nova")).toBe(true);
  });

  it("deixa públicas a landing, o login e os termos", () => {
    for (const p of ["/", "/entrar", "/termos", "/auth/callback", "/sair", "/casamento"]) {
      expect(isProtectedPath(p)).toBe(false);
    }
  });
});

describe("redirecionamentos", () => {
  it("leva o next para o login", () => {
    expect(loginRedirectPath("/casa/nova")).toBe("/entrar?next=%2Fcasa%2Fnova");
  });

  it("preserva o next no onboarding só quando não é o padrão", () => {
    expect(onboardingPath("/casa/nova")).toBe("/bem-vindo");
    expect(onboardingPath("/entrar/tok/aceitar")).toBe("/bem-vindo?next=%2Fentrar%2Ftok%2Faceitar");
  });
});

describe("loginErrorMessage", () => {
  it("devolve os textos exatos do F01", () => {
    expect(loginErrorMessage("cancelado")).toBe("Login cancelado. Tente de novo quando quiser.");
    expect(loginErrorMessage("falhou")).toBe("Não foi possível entrar. Tente novamente.");
    expect(loginErrorMessage("perfil")).toBe(
      "Tivemos um problema ao criar sua conta. Tente de novo em instantes.",
    );
  });

  it("ignora códigos desconhecidos", () => {
    expect(loginErrorMessage("qualquer")).toBeNull();
    expect(loginErrorMessage(null)).toBeNull();
  });
});

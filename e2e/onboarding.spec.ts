import { expect, test } from "@playwright/test";

import {
  createTestUser,
  deleteTestUser,
  getProfile,
  signInAs,
  type TestUser,
} from "./support/supabase";

// F02 — Onboarding pessoal, com usuário criado pela API admin (sem Google).
let user: TestUser;

test.beforeEach(async ({ context, baseURL }) => {
  user = await createTestUser("Ana Teste");
  await signInAs(context, user, baseURL!);
});

test.afterEach(async () => {
  await deleteTestUser(user);
});

test("primeiro acesso: nome do Google, 18+ obrigatório e cards", async ({ page }) => {
  // Sem o onboarding feito, qualquer tela do app leva para /bem-vindo.
  await page.goto("/casa/nova");
  await expect(page).toHaveURL(/\/bem-vindo$/);

  const nome = page.getByLabel("Como a casa vai te chamar");
  await expect(nome).toHaveValue("Ana Teste");

  const continuar = page.getByRole("button", { name: "Continuar" });
  await expect(continuar).toBeDisabled();
  await expect(page.getByText("O Placar é para maiores de 18 anos.")).toBeVisible();
  await expect(page.getByRole("link", { name: "termos de uso" })).toHaveAttribute(
    "href",
    "/termos",
  );

  const cards = page.getByRole("switch", {
    name: "Pode mostrar meu nome nos cards que a minha casa compartilhar",
  });
  await expect(cards).toHaveAttribute("aria-checked", "true");
  await cards.click();
  await expect(cards).toHaveAttribute("aria-checked", "false");

  await nome.fill("Aninha");
  await page.getByRole("checkbox", { name: /Confirmo que tenho 18 anos ou mais/ }).check();
  await expect(continuar).toBeEnabled();
  await page.screenshot({ path: "test-results/fase-2/bem-vindo.png" });
  await continuar.click();

  await expect(page).toHaveURL(/\/casa\/nova$/);
  await expect(page.getByText("Em breve")).toBeVisible();
  await expect(page.getByText("Aninha")).toBeVisible();
  await page.screenshot({ path: "test-results/fase-2/casa-nova.png" });

  const profile = await getProfile(user.id);
  expect(profile).toMatchObject({
    display_name: "Aninha",
    is_adult_confirmed: true,
    show_in_cards: false,
  });
  expect(profile.adult_confirmed_at).not.toBeNull();

  // Onboarding feito: voltar a /bem-vindo segue direto para o destino.
  await page.goto("/bem-vindo");
  await expect(page).toHaveURL(/\/casa\/nova$/);
});

test("nome vazio mostra o erro do F02", async ({ page }) => {
  await page.goto("/bem-vindo");
  await page.getByLabel("Como a casa vai te chamar").fill("   ");
  await page.getByRole("checkbox", { name: /Confirmo que tenho 18 anos ou mais/ }).check();
  await page.getByRole("button", { name: "Continuar" }).click();

  await expect(page.getByText("Use um nome de 1 a 40 caracteres.")).toBeVisible();
  await expect(page).toHaveURL(/\/bem-vindo$/);
  expect((await getProfile(user.id)).is_adult_confirmed).toBe(false);
});

test("sair pede confirmação e encerra a sessão (F04)", async ({ page }) => {
  await page.goto("/bem-vindo");
  await page.getByRole("checkbox", { name: /Confirmo que tenho 18 anos ou mais/ }).check();
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page).toHaveURL(/\/casa\/nova$/);

  await page.getByRole("button", { name: "Sair" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("Sair da sua conta neste aparelho?")).toBeVisible();
  await dialog.getByRole("button", { name: "Sair" }).click();

  await expect(page).toHaveURL(/\/$/);
  await page.goto("/casa/nova");
  await expect(page).toHaveURL(/\/entrar\?next=/);
});

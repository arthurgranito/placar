import { expect, test } from "@playwright/test";

test("landing mostra o Placar e leva para o login", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Placar");
  await expect(page.getByRole("heading", { name: "Placar" })).toBeVisible();
  await expect(page.getByText("A casa é de todo mundo. O placar também.")).toBeVisible();

  await page.getByRole("link", { name: "Entrar com Google" }).click();
  await expect(page).toHaveURL(/\/entrar$/);
  await expect(page.getByRole("button", { name: "Entrar com Google" })).toBeVisible();
});

test("rota protegida sem login vai para /entrar com o next", async ({ page }) => {
  await page.goto("/casa/nova");
  await expect(page).toHaveURL(/\/entrar\?next=%2Fcasa%2Fnova$/);
});

test("login cancelado no Google mostra a mensagem do F01", async ({ page }) => {
  await page.goto("/auth/callback?error=access_denied");
  await expect(page.getByRole("alert")).toHaveText("Login cancelado. Tente de novo quando quiser.");
});

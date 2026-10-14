import type { BrowserContext } from "@playwright/test";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

// Testes e2e não dependem do Google: o usuário é criado pela API admin do Supabase local
// e a sessão vai para o navegador nos mesmos cookies que o @supabase/ssr grava.

function env(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Defina ${name} (veja .env.example) e rode \`make db-up\`.`);
  return value;
}

const url = () => env("NEXT_PUBLIC_SUPABASE_URL");

export function adminClient() {
  return createClient(url(), env("SUPABASE_SECRET_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export type TestUser = { id: string; email: string; password: string; fullName: string };

export async function createTestUser(fullName = "Ana Teste"): Promise<TestUser> {
  const email = `e2e-${randomUUID()}@placar.test`;
  const password = `Senha-${randomUUID()}`;
  const { data, error } = await adminClient().auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error || !data.user) throw error ?? new Error("Falha ao criar usuário de teste");
  return { id: data.user.id, email, password, fullName };
}

export async function deleteTestUser(user: TestUser) {
  await adminClient().auth.admin.deleteUser(user.id);
}

export async function getProfile(userId: string) {
  const { data, error } = await adminClient()
    .from("profiles")
    .select("display_name, is_adult_confirmed, adult_confirmed_at, show_in_cards")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}

/** Faz login com e-mail e senha no Node e copia os cookies de sessão para o navegador. */
export async function signInAs(context: BrowserContext, user: TestUser, baseURL: string) {
  const jar: { name: string; value: string }[] = [];
  const supabase = createServerClient(url(), env("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"), {
    cookies: {
      getAll: () => jar,
      setAll: (cookies) => {
        for (const { name, value } of cookies) {
          const i = jar.findIndex((c) => c.name === name);
          if (i >= 0) jar.splice(i, 1);
          if (value) jar.push({ name, value });
        }
      },
    },
  });
  const { error } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: user.password,
  });
  if (error) throw error;
  await context.addCookies(jar.map((c) => ({ ...c, url: baseURL })));
}

import { NextResponse, type NextRequest } from "next/server";

import { onboardingPath, safeNextPath } from "@/lib/auth/paths";
import { createClient } from "@/lib/supabase/server";

// F01/F03: volta do Google. Troca o code pela sessão, garante o perfil e decide o destino.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = safeNextPath(searchParams.get("next"));
  const toLogin = (erro: string) =>
    NextResponse.redirect(new URL(`/entrar?erro=${erro}&next=${encodeURIComponent(next)}`, origin));

  // Cancelou no Google (F01-2e): o Supabase devolve ?error=access_denied.
  if (searchParams.get("error")) return toLogin("cancelado");

  const code = searchParams.get("code");
  if (!code) return toLogin("falhou");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return toLogin("falhou");

  let { data: profile } = await supabase
    .from("profiles")
    .select("is_adult_confirmed")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile) {
    // F01-4e: o callback cria o profile se ele estiver faltando.
    await supabase.rpc("ensure_profile");
    ({ data: profile } = await supabase
      .from("profiles")
      .select("is_adult_confirmed")
      .eq("id", data.user.id)
      .maybeSingle());
    if (!profile) return toLogin("perfil");
  }

  // TODO(fase 14): evento `signup` / `login` no PostHog.
  if (!profile.is_adult_confirmed) {
    return NextResponse.redirect(new URL(onboardingPath(next), origin));
  }

  // TODO(fase 4): com casa, o destino padrão passa a ser /hoje (F03).
  return NextResponse.redirect(new URL(next, origin));
}

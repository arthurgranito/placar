import "server-only";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { loginRedirectPath } from "./paths";

export type CurrentProfile = {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  isAdultConfirmed: boolean;
  showInCards: boolean;
};

/**
 * Camada de acesso: devolve a pessoa logada e o perfil dela, ou manda para /entrar.
 * Usa getUser() (valida o token no Auth), não só o cookie.
 */
export async function requireProfile(currentPath: string): Promise<CurrentProfile> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(loginRedirectPath(currentPath));

  let { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, is_adult_confirmed, show_in_cards")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    // F01-4e: o trigger falhou em algum momento; recria o perfil.
    await supabase.rpc("ensure_profile");
    ({ data: profile } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url, is_adult_confirmed, show_in_cards")
      .eq("id", user.id)
      .maybeSingle());
  }
  if (!profile) redirect("/entrar?erro=perfil");

  return {
    id: profile.id,
    displayName: profile.display_name,
    avatarUrl: profile.avatar_url,
    isAdultConfirmed: profile.is_adult_confirmed,
    showInCards: profile.show_in_cards,
  };
}

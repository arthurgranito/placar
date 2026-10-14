"use server";

import { redirect } from "next/navigation";

import { loginRedirectPath, safeNextPath } from "@/lib/auth/paths";
import { createClient } from "@/lib/supabase/server";
import { ONBOARDING_MESSAGES, parseOnboardingForm } from "@/features/profile/onboarding-schema";

export type OnboardingState = {
  fieldErrors?: { displayName?: string; isAdult?: string };
  formError?: string;
};

// F02, passo 2: SA:completeProfile + RPC:confirm_adult.
export async function completeProfile(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const next = safeNextPath(String(formData.get("next") ?? ""));
  const parsed = parseOnboardingForm(formData);
  if (!parsed.success) {
    const fields = parsed.error.flatten().fieldErrors;
    return {
      fieldErrors: {
        displayName: fields.displayName?.[0],
        isAdult: fields.isAdult?.[0],
      },
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(loginRedirectPath("/bem-vindo"));

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.displayName,
      show_in_cards: parsed.data.showInCards,
    })
    .eq("id", user.id);
  if (updateError) return { formError: ONBOARDING_MESSAGES.falhou };

  const { error: adultError } = await supabase.rpc("confirm_adult");
  if (adultError) return { formError: ONBOARDING_MESSAGES.falhou };

  // TODO(fase 14): evento `onboarding_completed` no PostHog.
  // TODO(fase 4): se já for membro de uma casa, ir para /hoje (F02-3a).
  redirect(next);
}

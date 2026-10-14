import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageShell } from "@/components/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { safeNextPath } from "@/lib/auth/paths";
import { requireProfile } from "@/lib/auth/session";
import { OnboardingForm } from "./onboarding-form";

export const metadata: Metadata = { title: "Bem-vindo(a)" };

// F02 — Onboarding pessoal.
export default async function BemVindoPage({ searchParams }: PageProps<"/bem-vindo">) {
  const params = await searchParams;
  const next = safeNextPath(typeof params.next === "string" ? params.next : null);
  const profile = await requireProfile("/bem-vindo");

  // Já fez o onboarding: segue para o destino.
  if (profile.isAdultConfirmed) redirect(next);

  return (
    <PageShell>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Bem-vindo(a) ao Placar 🏠</CardTitle>
          <CardDescription>Só mais um passo antes de montar o placar da sua casa.</CardDescription>
        </CardHeader>
        <CardContent>
          <OnboardingForm
            defaultName={profile.displayName}
            defaultShowInCards={profile.showInCards}
            next={next}
          />
        </CardContent>
      </Card>
    </PageShell>
  );
}

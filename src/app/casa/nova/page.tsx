import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageShell } from "@/components/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireProfile } from "@/lib/auth/session";
import { LogoutButton } from "./logout-button";

export const metadata: Metadata = { title: "Criar casa" };

// Provisória. O fluxo F08 (criar casa a partir de um modelo) chega na Fase 4.
export default async function CasaNovaPage() {
  const profile = await requireProfile("/casa/nova");
  if (!profile.isAdultConfirmed) redirect("/bem-vindo");

  return (
    <PageShell>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Oi, <span className="font-medium text-foreground">{profile.displayName}</span>
        </p>
        <LogoutButton />
      </div>
      <Card>
        <CardHeader className="text-center">
          <span className="text-4xl" aria-hidden>
            🏠
          </span>
          <CardTitle className="text-2xl">Criar sua casa</CardTitle>
          <CardDescription>Em breve</CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          Logo você vai poder criar a casa, chamar quem mora com você e começar o placar da semana.
        </CardContent>
      </Card>
    </PageShell>
  );
}

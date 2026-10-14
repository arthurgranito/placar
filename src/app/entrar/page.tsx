import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageShell } from "@/components/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { loginErrorMessage, safeNextPath } from "@/lib/auth/paths";
import { createClient } from "@/lib/supabase/server";
import { GoogleButton } from "./google-button";

export const metadata: Metadata = { title: "Entrar" };

export default async function EntrarPage({ searchParams }: PageProps<"/entrar">) {
  const params = await searchParams;
  const next = safeNextPath(typeof params.next === "string" ? params.next : null);
  const erro = loginErrorMessage(typeof params.erro === "string" ? params.erro : null);

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (data?.claims?.sub) redirect(next);

  return (
    <PageShell>
      <Card>
        <CardHeader className="text-center">
          <span className="text-4xl" aria-hidden>
            🏠
          </span>
          <CardTitle className="text-2xl">Entrar no Placar</CardTitle>
          <CardDescription>A casa é de todo mundo. O placar também.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {erro ? (
            <p role="alert" className="rounded-md bg-muted px-3 py-2 text-center text-sm">
              {erro}
            </p>
          ) : null}
          <GoogleButton next={next} />
          <p className="text-center text-xs text-muted-foreground">
            O Placar é para maiores de 18 anos.
          </p>
        </CardContent>
      </Card>
    </PageShell>
  );
}

import Link from "next/link";

import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";

// Landing provisória. A landing de verdade vem na Fase 15.
export default function Home() {
  return (
    <PageShell>
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="text-5xl" aria-hidden>
          🏠
        </span>
        <h1 className="text-4xl font-bold tracking-tight">Placar</h1>
        <p className="text-lg text-muted-foreground">A casa é de todo mundo. O placar também.</p>
      </div>
      <Button asChild size="lg" className="w-full">
        <Link href="/entrar">Entrar com Google</Link>
      </Button>
    </PageShell>
  );
}

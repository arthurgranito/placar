import type { Metadata } from "next";
import Link from "next/link";

import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = { title: "Termos de uso" };

// Versão provisória. O texto final vem na Fase 14 e passa por um advogado na Fase 15 (ADR-03).
export default function TermosPage() {
  return (
    <PageShell>
      <article className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Termos de uso</h1>
        <p className="text-sm text-muted-foreground">Versão provisória, em construção.</p>
        <p>
          O Placar é um app para organizar as tarefas de quem divide a casa. Ele é feito para
          pessoas com <strong>18 anos ou mais</strong>: ao usar o app, você confirma que tem pelo
          menos 18 anos.
        </p>
        <p>
          Seu nome e sua foto só aparecem nos cards que a sua casa compartilhar se você permitir.
          Você pode mudar isso quando quiser.
        </p>
        <Link href="/" className="text-sm text-primary underline-offset-4 hover:underline">
          Voltar
        </Link>
      </article>
    </PageShell>
  );
}

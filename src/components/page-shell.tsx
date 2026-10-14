import type { ReactNode } from "react";

// Moldura mobile-first das telas simples (login, onboarding, provisórias).
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 py-10">
      {children}
    </main>
  );
}

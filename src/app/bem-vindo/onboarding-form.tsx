"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ONBOARDING_MESSAGES } from "@/features/profile/onboarding-schema";
import { completeProfile, type OnboardingState } from "./actions";

type Props = {
  defaultName: string;
  defaultShowInCards: boolean;
  next: string;
};

export function OnboardingForm({ defaultName, defaultShowInCards, next }: Props) {
  const [state, formAction, pending] = useActionState<OnboardingState, FormData>(
    completeProfile,
    {},
  );
  const [isAdult, setIsAdult] = useState(false);
  const [showInCards, setShowInCards] = useState(defaultShowInCards);

  useEffect(() => {
    if (state.formError) toast.error(state.formError);
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      <input type="hidden" name="next" value={next} />

      <div className="flex flex-col gap-2">
        <label htmlFor="displayName" className="text-sm font-medium">
          Como a casa vai te chamar
        </label>
        <Input
          id="displayName"
          name="displayName"
          defaultValue={defaultName}
          autoComplete="nickname"
          aria-invalid={Boolean(state.fieldErrors?.displayName)}
          aria-describedby={state.fieldErrors?.displayName ? "displayName-erro" : undefined}
        />
        {state.fieldErrors?.displayName ? (
          <p id="displayName-erro" role="alert" className="text-sm text-destructive">
            {state.fieldErrors.displayName}
          </p>
        ) : null}
      </div>

      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="isAdult"
          checked={isAdult}
          onChange={(e) => setIsAdult(e.target.checked)}
          className="mt-0.5 size-5 shrink-0 accent-primary"
        />
        <span>
          Confirmo que tenho 18 anos ou mais (
          <Link
            href="/termos"
            target="_blank"
            className="text-primary underline underline-offset-4"
          >
            termos de uso
          </Link>
          )
        </span>
      </label>

      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span id="showInCards-label" className="text-sm font-medium">
            Pode mostrar meu nome nos cards que a minha casa compartilhar
          </span>
          <span className="text-xs text-muted-foreground">
            Se desligar, os cards mostram “colega de casa” no lugar do seu nome e da sua foto. Dá
            para mudar depois.
          </span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={showInCards}
          aria-labelledby="showInCards-label"
          onClick={() => setShowInCards((v) => !v)}
          className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-input transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[on=true]:bg-primary"
          data-on={showInCards}
        >
          <span
            className="pointer-events-none block size-5 translate-x-0.5 rounded-full bg-background shadow transition-transform data-[on=true]:translate-x-5.5"
            data-on={showInCards}
          />
        </button>
        {showInCards ? <input type="hidden" name="showInCards" value="on" /> : null}
      </div>

      <div className="flex flex-col gap-2">
        <Button type="submit" size="lg" disabled={!isAdult || pending}>
          {pending ? "Salvando…" : "Continuar"}
        </Button>
        {!isAdult ? (
          <p className="text-center text-sm text-muted-foreground">{ONBOARDING_MESSAGES.adulto}</p>
        ) : null}
        {state.fieldErrors?.isAdult ? (
          <p role="alert" className="text-center text-sm text-destructive">
            {state.fieldErrors.isAdult}
          </p>
        ) : null}
      </div>
    </form>
  );
}

import { z } from "zod";

// Textos de docs/flows.md (F02). Os testes conferem estas strings literalmente.
export const ONBOARDING_MESSAGES = {
  nome: "Use um nome de 1 a 40 caracteres.",
  adulto: "O Placar é para maiores de 18 anos.",
  falhou: "Não foi possível salvar agora. Tente novamente.",
} as const;

// Conta caracteres como o Postgres (char_length): por code point, não por UTF-16.
const tamanho = (s: string) => Array.from(s).length;

export const onboardingSchema = z.object({
  displayName: z
    .string()
    .trim()
    .refine((s) => tamanho(s) >= 1 && tamanho(s) <= 40, ONBOARDING_MESSAGES.nome),
  isAdult: z.literal(true, { error: ONBOARDING_MESSAGES.adulto }),
  showInCards: z.boolean(),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

export function parseOnboardingForm(formData: FormData) {
  return onboardingSchema.safeParse({
    displayName: String(formData.get("displayName") ?? ""),
    isAdult: formData.get("isAdult") === "on",
    showInCards: formData.get("showInCards") === "on",
  });
}

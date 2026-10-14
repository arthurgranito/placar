// Regras de navegação de autenticação, sem dependência de Next ou Supabase (testáveis em unit).

const PROTECTED_PREFIXES = ["/bem-vindo", "/casa"];

export const DEFAULT_AFTER_LOGIN = "/casa/nova";

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Aceita só caminhos internos ("/algo"), para o `next` não virar open redirect.
 * Rejeita "//host", "/\\host", URLs absolutas e qualquer coisa que não comece com "/".
 */
export function safeNextPath(next: string | null | undefined, fallback = DEFAULT_AFTER_LOGIN) {
  if (!next || typeof next !== "string") return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  if (/[\u0000-\u001f]/.test(next)) return fallback;
  return next;
}

export function loginRedirectPath(next: string) {
  return `/entrar?next=${encodeURIComponent(safeNextPath(next))}`;
}

export function onboardingPath(next: string | null | undefined) {
  const safe = safeNextPath(next);
  return safe === DEFAULT_AFTER_LOGIN
    ? "/bem-vindo"
    : `/bem-vindo?next=${encodeURIComponent(safe)}`;
}

// Mensagens de erro do login (docs/flows.md, F01).
export const LOGIN_ERRORS = {
  cancelado: "Login cancelado. Tente de novo quando quiser.",
  falhou: "Não foi possível entrar. Tente novamente.",
  perfil: "Tivemos um problema ao criar sua conta. Tente de novo em instantes.",
} as const;

export type LoginErrorCode = keyof typeof LOGIN_ERRORS;

export function loginErrorMessage(code: string | null | undefined): string | null {
  if (!code) return null;
  return code in LOGIN_ERRORS ? LOGIN_ERRORS[code as LoginErrorCode] : null;
}

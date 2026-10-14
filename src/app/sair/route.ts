import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

// F04: logout. Os cookies são limpos mesmo se a chamada ao Supabase falhar.
async function signOut(request: NextRequest) {
  const supabase = await createClient();
  try {
    await supabase.auth.signOut({ scope: "local" });
  } catch {
    // Rede caiu: segue limpando os cookies abaixo.
  }

  const response = NextResponse.redirect(new URL("/", request.nextUrl.origin), {
    status: 303,
  });
  for (const cookie of request.cookies.getAll()) {
    if (cookie.name.startsWith("sb-")) response.cookies.delete(cookie.name);
  }
  // TODO(fase 9): pedir ao service worker para limpar os caches com dados pessoais.
  return response;
}

export const GET = signOut;
export const POST = signOut;

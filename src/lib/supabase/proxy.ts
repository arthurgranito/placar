import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "./database.types";
import { supabaseEnv } from "./env";
import { isProtectedPath, loginRedirectPath } from "@/lib/auth/paths";

// Renova a sessão do Supabase a cada requisição e barra rotas protegidas sem login.
// É só uma checagem otimista: as páginas e o banco (RLS) validam de novo.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, publishableKey } = supabaseEnv();

  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Não coloque código entre createServerClient e getClaims: é o que mantém a sessão viva.
  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = Boolean(data?.claims?.sub);

  const { pathname, search } = request.nextUrl;
  if (!isLoggedIn && isProtectedPath(pathname)) {
    const target = request.nextUrl.clone();
    const redirectUrl = new URL(loginRedirectPath(pathname + search), target.origin);
    const redirect = NextResponse.redirect(redirectUrl);
    for (const cookie of response.cookies.getAll()) {
      redirect.cookies.set(cookie);
    }
    return redirect;
  }

  return response;
}

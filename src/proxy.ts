import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PUBLIC_PATHS = ["/login", "/cadastro", "/auth/confirm", "/portal/login"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  const isPortalPath = pathname.startsWith("/portal");

  if (!user && !isPublicPath) {
    const loginUrl = new URL(isPortalPath ? "/portal/login" : "/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (user) {
    const { data: usuario } = await supabase
      .from("usuarios")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (pathname === "/login" || pathname === "/cadastro" || pathname === "/portal/login") {
      return NextResponse.redirect(new URL(usuario ? "/inicio" : "/portal", request.url));
    }

    // Conta de cliente (sem linha em usuarios) não acessa as telas internas.
    if (!usuario && !isPortalPath) {
      return NextResponse.redirect(new URL("/portal", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

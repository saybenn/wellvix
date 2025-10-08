// middleware.js
// Route guard using Supabase session + profile.role.
// Jargon: "middleware" runs before a page loads and can redirect.
//
// Analogy: A bouncer at the door checking both "has ticket?" and "VIP level?"

import { NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import routeConfig from "./data/routes.json" assert { type: "json" };

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // 1) Get current session (if any)
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname, origin, searchParams } = req.nextUrl;
  const url = req.nextUrl;

  // Public routes pass through
  if (isPublic(pathname, routeConfig.public)) return res;

  // If route needs auth but user not logged in → redirect to sign-in
  if (requiresAuth(pathname, routeConfig.authRequired) && !session) {
    const redirect = new URL("/auth/sign-in", origin);
    redirect.searchParams.set("redirectTo", pathname + (url.search || ""));
    return NextResponse.redirect(redirect);
  }

  // Role-gated routes
  const roleRule = matchRoleRule(pathname, routeConfig.roleRequired);
  if (roleRule) {
    // We need the profile role
    const userId = session?.user?.id;
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    // If no profile or missing role, treat as unauthorized
    if (error || !profile?.role) {
      return NextResponse.redirect(new URL("/auth/sign-in", origin));
    }

    const allowed = roleRule.allowedRoles.includes(profile.role);
    if (!allowed) {
      // Optional: redirect to a "403" page. For now, back to home.
      return NextResponse.redirect(new URL("/", origin));
    }
  }

  return res;
}

export const config = {
  // Apply middleware to everything except Next internals and static files
  matcher: ["/((?!_next|static|.*\\..*).*)"],
};

// ---------- helpers ----------
function isPublic(pathname, publicList) {
  return publicList.some((p) => routeStartsWith(pathname, p));
}
function requiresAuth(pathname, authList) {
  return authList.some((p) => routeStartsWith(pathname, p));
}
function matchRoleRule(pathname, roleRequired) {
  // roleRequired is an object with keys being base paths
  // returns first match with allowedRoles
  for (const base in roleRequired) {
    if (routeStartsWith(pathname, base)) {
      return { base, allowedRoles: roleRequired[base] };
    }
  }
  return null;
}
function routeStartsWith(pathname, base) {
  if (base.endsWith("/*")) {
    const prefix = base.slice(0, -2);
    return pathname === prefix || pathname.startsWith(prefix + "/");
  }
  return pathname === base || pathname.startsWith(base + "/");
}

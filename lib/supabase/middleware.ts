import { createServerClient } from "@supabase/ssr";
import { NextResponse, NextRequest } from "next/server";
import { getCachedUser } from "@/lib/auth/session-cache";
import { ApiResponse } from "@/lib/types/api.bean";
import { checkApiPermission, checkPagePermission } from "@/lib/permission/guards/server";
import { RejectAction } from "@/lib/types/permission/permission-config.dto";

/**
 * Create Supabase client and update session
 * @param request NextRequest object
 * @returns Object containing Supabase client and NextResponse
 */
export async function createSupabaseMiddlewareClient(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  // await supabase.auth.getSession();
  return { supabase, response };
}

function warpNextReqest(request: NextRequest, headers: Headers): NextRequest {
  return new NextRequest(request.url, { ...request, headers });
}

/**
 * Update session and handle authentication
 * @param request NextRequest object
 * @returns NextResponse object
 */
export async function updateSessionAndAuth(request: NextRequest) {
  const { supabase, response } = await createSupabaseMiddlewareClient(request);

  const { userContext } = await getCachedUser(supabase);
  const path = request.nextUrl.pathname;
  const method = request.method;

  if (path.startsWith("/api")) {
    const result = await checkApiPermission(path, method, userContext);
    if (!result.allowed) {
      const apiResponse: ApiResponse<any> = {
        success: false,
        error: {
          code: "PERMISSION_DENIED",
          message: result.reason || "Permission denied",
        },
      };
      return NextResponse.json(apiResponse, { status: 401 });
    }
    return response;
  } else {
    const result = await checkPagePermission(path, userContext);
    if (!result.allowed) {
      if (result.rejectAction == RejectAction.REDIRECT && (!userContext || userContext.authStatus !== "authenticated")) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
    return response;
  }
}

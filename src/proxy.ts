import { NextRequest, NextResponse } from "next/server";

function constantTimeEqual(left: string, right: string) {
  let mismatch = left.length ^ right.length;
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    mismatch |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }
  return mismatch === 0;
}

function basicAuthorization(username: string, password: string) {
  const bytes = new TextEncoder().encode(`${username}:${password}`);
  let encoded = "";
  for (const byte of bytes) {
    encoded += String.fromCharCode(byte);
  }
  return `Basic ${btoa(encoded)}`;
}

export function proxy(request: NextRequest) {
  if (process.env.PREVIEW_AUTH_ENABLED !== "true") {
    return NextResponse.next();
  }

  const username = process.env.PREVIEW_USERNAME;
  const password = process.env.PREVIEW_PASSWORD;
  if (!username || !password) {
    return new NextResponse("Preview authentication is not configured.", {
      status: 503,
    });
  }

  const authorization = request.headers.get("authorization") ?? "";
  const expected = basicAuthorization(username, password);
  if (constantTimeEqual(authorization, expected)) {
    return NextResponse.next();
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Casa Queretaro preview"' },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

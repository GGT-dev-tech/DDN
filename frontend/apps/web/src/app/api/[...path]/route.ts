import { NextRequest, NextResponse } from "next/server";

const DEFAULT_BACKEND_URL = "https://backend-production-946f.up.railway.app";

async function handleProxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const backendHost = process.env.BACKEND_URL || DEFAULT_BACKEND_URL;
  const targetUrl = `${backendHost}${pathname}${search}`;

  const headers = new Headers(request.headers);
  headers.delete("host");

  let body: ArrayBuffer | undefined = undefined;
  if (!["GET", "HEAD"].includes(request.method)) {
    body = await request.arrayBuffer();
  }

  try {
    const res = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
      body: body,
    });

    const responseHeaders = new Headers(res.headers);
    // Remove content-encoding so Next.js doesn't try to decompress already decompressed data
    responseHeaders.delete("content-encoding");

    return new NextResponse(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
    });
  } catch (err: unknown) {
    console.error("API Proxy Route Error:", err);
    return NextResponse.json(
      { error: "Backend proxy connection failed", detail: String(err) },
      { status: 502 }
    );
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const DELETE = handleProxy;
export const PATCH = handleProxy;

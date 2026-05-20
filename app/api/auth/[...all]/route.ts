import { toNextJsHandler } from "better-auth/next-js"

import { getAuth } from "@/lib/auth"

export const runtime = "nodejs"

const AUTH_HANDLER_TIMEOUT_MS = 12000

function authTimeoutResponse() {
  return Response.json(
    { error: "Authentication timed out. Please try again." },
    { status: 504 }
  )
}

async function handleAuth(request: Request) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  try {
    return await Promise.race([
      getAuth().handler(request),
      new Promise<Response>((resolve) => {
        timeoutId = setTimeout(
          () => resolve(authTimeoutResponse()),
          AUTH_HANDLER_TIMEOUT_MS
        )
      }),
    ])
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
  }
}

export const { GET, POST } = toNextJsHandler(handleAuth)

// Helper function to decode base64url format
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/")
  while (base64.length % 4) {
    base64 += "="
  }
  return atob(base64)
}

/**
 * Interface representing decoded user session payload.
 */
export interface UserSession {
  email: string
  iat?: number
  exp?: number
}

/**
 * Verifies a JWT token using the HMAC SHA-256 algorithm and the global Web Crypto API.
 * This is 100% compatible with Next.js Edge Runtime and standard Node.js.
 *
 * @param token The JWT string to verify.
 * @param secret The secret key (defaults to "supersecret").
 * @returns Decoded session payload if valid, otherwise null.
 */
export async function verifyJWT(
  token: string,
  secret: string = process.env.JWT_SECRET || "supersecret"
): Promise<UserSession | null> {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null

    const [headerStr, payloadStr, signatureStr] = parts
    if (!headerStr || !payloadStr || !signatureStr) return null

    // Decode and parse payload
    const payload = JSON.parse(base64UrlDecode(payloadStr)) as UserSession

    // Check expiration timestamp
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null
    }

    // Prepare HMAC key
    const encoder = new TextEncoder()
    const keyData = encoder.encode(secret)
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    )

    // Prepare data to verify (header + payload)
    const dataBytes = encoder.encode(`${headerStr}.${payloadStr}`)

    // Convert signature from base64url to Uint8Array
    const sigBase64 = signatureStr.replace(/-/g, "+").replace(/_/g, "/")
    const sigStr = atob(sigBase64)
    const sigBytes = new Uint8Array(sigStr.length)
    for (let i = 0; i < sigStr.length; i++) {
      sigBytes[i] = sigStr.charCodeAt(i)
    }

    // Verify HMAC signature
    const isValid = await crypto.subtle.verify("HMAC", key, sigBytes, dataBytes)
    if (!isValid) return null

    return payload
  } catch (err) {
    console.error("verifyJWT failed:", err)
    return null
  }
}

/**
 * Checks if the request contains a valid, active session token in its cookies.
 *
 * @param requestCookies Cookies object or request-like cookies interface.
 * @returns Decoded session payload if authenticated, otherwise null.
 */
export async function getSession(
  requestCookies:
    | { get: (name: string) => { value: string } | undefined }
    | undefined
): Promise<UserSession | null> {
  const cookie = requestCookies?.get("session")
  if (!cookie || !cookie.value) return null

  return verifyJWT(cookie.value)
}

import { Router } from "express"
import crypto from "crypto"
import { pool } from "../db/pg.js"
import { sendMagicLink } from "../utils/mailer.js"
import jwt from "jsonwebtoken"

const router: Router = Router()
const JWT_SECRET = process.env.JWT_SECRET || "supersecret"
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000"

// Request magic link
router.post("/login", async (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ error: "Email is required" })

  const token = crypto.randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

  try {
    await pool.query(
      "INSERT INTO auth_tokens (email, token, expires_at) VALUES ($1, $2, $3)",
      [email, token, expiresAt]
    )

    await sendMagicLink(email, token, req.headers.host!)
    res.json({ message: "Magic link sent to your email" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to send magic link" })
  }
})

// Verify magic link
router.get("/verify", async (req, res) => {
  const { token } = req.query
  if (!token) return res.status(400).json({ error: "Token is required" })

  try {
    const result = await pool.query(
      "SELECT * FROM auth_tokens WHERE token = $1 AND expires_at > NOW()",
      [token]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid or expired token" })
    }

    const { email } = result.rows[0]

    // Upsert user
    await pool.query(
      "INSERT INTO users (email) VALUES ($1) ON CONFLICT (email) DO NOTHING",
      [email]
    )

    // Delete used token
    await pool.query("DELETE FROM auth_tokens WHERE token = $1", [token])

    // Generate session JWT
    const sessionToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: "7d" })

    // Set cookie
    res.cookie("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    res.redirect(`${FRONTEND_URL}/overview`)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Verification failed" })
  }
})

export default router

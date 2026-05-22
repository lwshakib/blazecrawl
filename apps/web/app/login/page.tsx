"use client"

import { useState } from "react"
import { Logo } from "@/components/Logo"
import { Icon } from "@iconify/react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [message, setMessage] = useState("")

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        setSent(true)
        setMessage("Verification link sent! Check your inbox.")
      } else {
        setMessage(data.error || "Failed to send verification link")
      }
    } catch (err) {
      setMessage("Connection error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground lg:flex-row">
      {/* Left Pane: Split Showcase (Visible on Large Screens) */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-muted/20 p-16 lg:flex lg:w-1/2">
        {/* Decorative Grid Background */}
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.015]"
          style={{
            backgroundImage:
              "radial-gradient(circle, var(--foreground) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-background/0 via-background/0 to-muted/30" />

        <div className="relative z-10 flex items-center gap-2.5">
          <Logo className="h-6 w-6 text-foreground" />
          <span className="text-lg font-semibold tracking-tight">
            BlazeCrawl
          </span>
        </div>

        <div className="relative z-10 my-auto max-w-md space-y-6">
          <Badge
            variant="secondary"
            className="rounded px-2 py-0.5 font-mono text-[9px] tracking-wider uppercase"
          >
            Data Integrity Protocol
          </Badge>
          <h2 className="text-3xl leading-tight font-bold tracking-tight">
            The professional data extraction workspace.
          </h2>
          <p className="font-sans text-sm leading-relaxed text-muted-foreground">
            Extract, structure, and sync web data in real-time. Secure,
            passwordless authentication using instant email verification links.
          </p>

          {/* Mini Mock Dashboard */}
          <div className="space-y-3 rounded-lg border border-border/80 bg-background/50 p-5 font-mono text-[10px] shadow-sm backdrop-blur-sm select-none">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <span className="text-muted-foreground">SYSTEM DIAGNOSTIC</span>
              <span className="font-bold text-foreground">ONLINE</span>
            </div>
            <div className="space-y-1 text-muted-foreground">
              <p>&gt; Initializing crawler node: Tokyo... [OK]</p>
              <p>&gt; Rotation of proxy IP cluster... [OK]</p>
              <p>&gt; Payload extraction rate: 1.2s</p>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full w-[92%] bg-foreground" />
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-xs text-muted-foreground">
          <Icon icon="solar:shield-check-linear" className="h-4 w-4" />
          <span>Compliant with standard security policies.</span>
        </div>
      </div>

      {/* Right Pane: Login Form */}
      <div className="relative flex w-full items-center justify-center p-8 md:p-16 lg:w-1/2">
        <div className="flex min-h-[450px] w-full max-w-sm flex-col justify-between">
          {/* Top Header */}
          <div className="mb-8 flex flex-col items-start">
            <Logo className="mb-6 h-8 w-8 text-foreground lg:hidden" />
            <h1 className="mb-2 font-sans text-2xl font-bold tracking-tight">
              Sign in to BlazeCrawl
            </h1>
            <p className="font-sans text-sm text-muted-foreground">
              Enter your email to receive a secure verification link.
            </p>
          </div>

          {!sent ? (
            <div className="space-y-6">
              {/* Form Input fields */}
              <form className="space-y-5" onSubmit={handleAuth}>
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="font-sans text-[10px] font-bold tracking-wider text-muted-foreground uppercase"
                  >
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="h-10 font-sans text-sm"
                  />
                </div>

                {/* Primary Action Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="mt-2 h-10 w-full font-sans font-medium"
                >
                  {loading ? "Sending..." : "Send Verification Link"}
                </Button>
              </form>
            </div>
          ) : (
            /* Sent Verification Email View */
            <div className="flex flex-1 animate-in flex-col justify-center space-y-8 text-center duration-500 fade-in">
              <div className="flex flex-col items-center">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-md border border-border bg-muted/20">
                  <Icon
                    icon="solar:letter-opened-linear"
                    className="h-6 w-6 text-foreground"
                  />
                </div>
                <h2 className="mb-2 font-sans text-lg font-bold text-foreground">
                  Check your inbox
                </h2>
                <p className="mx-auto max-w-[280px] font-sans text-sm leading-relaxed text-muted-foreground">
                  We've sent a verification link to{" "}
                  <span className="font-semibold text-foreground">{email}</span>
                  . Please open it to verify your authentication.
                </p>
              </div>

              <div className="w-full space-y-3">
                <Button
                  onClick={handleAuth}
                  disabled={loading}
                  variant="outline"
                  className="h-10 w-full gap-2 bg-transparent font-sans text-sm font-medium"
                >
                  {loading ? "Sending..." : "Resend Link"}
                  <Icon icon="solar:refresh-linear" className="h-4 w-4" />
                </Button>
                <button
                  onClick={() => {
                    setSent(false)
                    setMessage("")
                  }}
                  className="w-full font-sans text-[10px] font-bold tracking-widest text-muted-foreground uppercase transition-colors hover:text-foreground"
                >
                  Change Email
                </button>
              </div>
            </div>
          )}

          {message && !sent && (
            <p className="mt-4 text-center font-sans text-xs text-muted-foreground">
              {message}
            </p>
          )}

          {/* Bottom Footer Links */}
          <div className="mt-12 flex items-center justify-between border-t border-border/60 pt-6 font-sans text-xs text-muted-foreground">
            <a
              href="/"
              className="font-medium transition-colors hover:text-foreground"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

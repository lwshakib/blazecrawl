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
    <div className="flex flex-col lg:flex-row min-h-screen bg-background text-foreground font-sans">
      {/* Left Pane: Split Showcase (Visible on Large Screens) */}
      <div className="hidden lg:flex lg:w-1/2 bg-muted/20 border-r border-border p-16 flex-col justify-between relative overflow-hidden">
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 z-0 opacity-[0.015] pointer-events-none" 
             style={{ backgroundImage: "radial-gradient(circle, var(--foreground) 1px, transparent 1px)", backgroundSize: "24px 24px" }} 
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/0 via-background/0 to-muted/30 z-0 pointer-events-none" />

        <div className="flex items-center gap-2.5 relative z-10">
          <Logo className="w-6 h-6 text-foreground" />
          <span className="text-lg font-semibold tracking-tight">BlazeCrawl</span>
        </div>

        <div className="relative z-10 space-y-6 max-w-md my-auto">
          <Badge variant="secondary" className="font-mono text-[9px] tracking-wider px-2 py-0.5 rounded uppercase">
            Data Integrity Protocol
          </Badge>
          <h2 className="text-3xl font-bold leading-tight tracking-tight">
            The professional data extraction workspace.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed font-sans">
            Extract, structure, and sync web data in real-time. Secure, passwordless authentication using instant email verification links.
          </p>

          {/* Mini Mock Dashboard */}
          <div className="border border-border/80 bg-background/50 backdrop-blur-sm p-5 rounded-lg font-mono text-[10px] space-y-3 shadow-sm select-none">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <span className="text-muted-foreground">SYSTEM DIAGNOSTIC</span>
              <span className="text-foreground font-bold">ONLINE</span>
            </div>
            <div className="space-y-1 text-muted-foreground">
              <p>&gt; Initializing crawler node: Tokyo... [OK]</p>
              <p>&gt; Rotation of proxy IP cluster... [OK]</p>
              <p>&gt; Payload extraction rate: 1.2s</p>
            </div>
            <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-foreground w-[92%]" />
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground relative z-10 flex items-center gap-2">
          <Icon icon="solar:shield-check-linear" className="w-4 h-4" />
          <span>Compliant with standard security policies.</span>
        </div>
      </div>

      {/* Right Pane: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 relative">
        <div className="w-full max-w-sm flex flex-col justify-between min-h-[450px]">
          {/* Top Header */}
          <div className="flex flex-col items-start mb-8">
            <Logo className="w-8 h-8 text-foreground mb-6 lg:hidden" />
            <h1 className="text-2xl font-bold tracking-tight mb-2 font-sans">
              Sign in to BlazeCrawl
            </h1>
            <p className="text-sm text-muted-foreground font-sans">
              Enter your email to receive a secure verification link.
            </p>
          </div>

          {!sent ? (
            <div className="space-y-6">
              {/* Form Input fields */}
              <form className="space-y-5" onSubmit={handleAuth}>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-sans">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="h-10 text-sm font-sans"
                  />
                </div>

                {/* Primary Action Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 mt-2 font-medium font-sans"
                >
                  {loading ? "Sending..." : "Send Verification Link"}
                </Button>
              </form>
            </div>
          ) : (
            /* Sent Verification Email View */
            <div className="text-center space-y-8 animate-in fade-in duration-500 flex-1 flex flex-col justify-center">
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 border border-border flex items-center justify-center mb-6 bg-muted/20 rounded-md">
                  <Icon icon="solar:letter-opened-linear" className="w-6 h-6 text-foreground" />
                </div>
                <h2 className="text-lg font-bold text-foreground mb-2 font-sans">Check your inbox</h2>
                <p className="text-sm text-muted-foreground max-w-[280px] mx-auto leading-relaxed font-sans">
                  We've sent a verification link to <span className="font-semibold text-foreground">{email}</span>. Please open it to verify your authentication.
                </p>
              </div>

              <div className="space-y-3 w-full">
                <Button
                  onClick={handleAuth}
                  disabled={loading}
                  variant="outline"
                  className="w-full h-10 bg-transparent text-sm gap-2 font-sans font-medium"
                >
                  {loading ? "Sending..." : "Resend Link"}
                  <Icon icon="solar:refresh-linear" className="w-4 h-4" />
                </Button>
                <button
                  onClick={() => { setSent(false); setMessage("") }}
                  className="w-full text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors tracking-widest uppercase font-sans"
                >
                  Change Email
                </button>
              </div>
            </div>
          )}

          {message && !sent && (
            <p className="mt-4 text-center text-xs text-muted-foreground font-sans">
              {message}
            </p>
          )}

          {/* Bottom Footer Links */}
          <div className="mt-12 pt-6 border-t border-border/60 flex justify-between items-center text-xs text-muted-foreground font-sans">
            <a href="/" className="hover:text-foreground transition-colors font-medium">← Back to Home</a>
          </div>
        </div>
      </div>
    </div>
  )
}

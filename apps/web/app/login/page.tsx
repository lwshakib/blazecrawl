"use client"

import { useState } from "react"
import { Logo } from "@/components/Logo"
import { Icon } from "@iconify/react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
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
        setMessage("Magic link sent! Check your email.")
      } else {
        setMessage(data.error || "Failed to send magic link")
      }
    } catch (err) {
      setMessage("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center font-jakarta relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }} />
      
      <div className="relative z-10 w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-12">
          <Logo className="w-16 h-16 text-[#FFAB00] mb-6" />
          <h1 className="text-3xl font-semibold mb-2">Welcome Back</h1>
          <p className="text-orange-50/60 text-sm text-center">Enter your email to receive a magic login link.</p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-orange-50/50 uppercase tracking-widest mb-2">Email Address</label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-[#0F1A24] border border-[#FFAB00]/20 rounded-none px-4 py-3 text-sm focus:outline-none focus:border-[#FFAB00] transition-colors placeholder:text-orange-50/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FFAB00] text-black font-semibold py-3.5 hover:bg-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Magic Link"}
              <Icon icon="solar:magic-stick-3-linear" className="w-5 h-5" />
            </button>
          </form>
        ) : (
          <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-[#FFAB00]/10 border border-[#FFAB00]/20 flex items-center justify-center mb-6">
                <Icon icon="solar:letter-opened-linear" className="w-10 h-10 text-[#FFAB00]" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Check Your Inbox</h2>
              <p className="text-sm text-orange-50/60 max-w-[280px] mx-auto">
                We've sent a secure login link to <span className="text-[#FFAB00]">{email}</span>.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-white/5 border border-white/10 text-white font-medium py-3 hover:bg-white/10 transition-colors text-sm flex items-center justify-center gap-2"
              >
                {loading ? "Sending..." : "Resend Link"}
                <Icon icon="solar:refresh-linear" className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setSent(false); setMessage("") }}
                className="w-full text-xs font-medium text-orange-50/40 hover:text-[#FFAB00] transition-colors tracking-widest uppercase"
              >
                Change Email
              </button>
            </div>
          </div>
        )}

        {message && !sent && (
          <p className={`mt-6 text-center text-sm ${message.includes("sent") ? "text-[#FFAB00]" : "text-red-400"}`}>
            {message}
          </p>
        )}

        <div className="mt-12 pt-8 border-t border-[#FFAB00]/10 flex justify-between items-center text-xs text-orange-50/40">
          <a href="/" className="hover:text-white transition-colors">← Back to Home</a>
          <span>BlazeCrawl Auth v1.0</span>
        </div>
      </div>
    </div>
  )
}

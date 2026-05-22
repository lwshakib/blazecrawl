"use client"

import { useEffect, useState } from "react"
import { Icon } from "@iconify/react"
import { useTheme } from "next-themes"
import { Button } from "@workspace/ui/components/button"
import { Separator } from "@workspace/ui/components/separator"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workspace/ui/components/card"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import Link from "next/link"

export default function AccountPage() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = () => {
    document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;"
    window.location.href = "/login"
  }

  if (!mounted) return null

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground font-sans">
        {/* App Sidebar Component */}
        <AppSidebar handleLogout={handleLogout} />

        {/* Main Content Area */}
        <SidebarInset className="flex-1 flex flex-col min-h-screen bg-background">
          {/* Header */}
          <header className="h-16 flex items-center justify-between px-6 border-b border-border/40 bg-card/40 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-muted/60" />
              <Separator orientation="vertical" className="h-4 bg-border/40" />
              <span className="text-sm font-semibold tracking-tight text-foreground">
                Account Settings
              </span>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="h-9 w-9 text-muted-foreground hover:text-foreground transition-colors hover:bg-muted/40"
                title="Toggle Theme"
              >
                {resolvedTheme === "dark" ? (
                  <Icon icon="solar:sun-linear" className="w-4 h-4" />
                ) : (
                  <Icon icon="solar:moon-linear" className="w-4 h-4" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
            </div>
          </header>

          {/* Main Content Container with Glassmorphic Lock View */}
          <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Ambient Background Aura / High Energy Accents */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#FF4C00] opacity-[0.06] rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-1/3 left-1/3 w-[200px] h-[200px] bg-[#E56565] opacity-[0.04] rounded-full blur-[80px] pointer-events-none" />

            <div className="max-w-md w-full relative z-10 animate-fade-in">
              <Card className="border border-border/60 bg-card/30 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                {/* Visual Top Highlight Bar matching #FF4C00 Accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#FF4C00]" />

                <CardContent className="pt-8 pb-8 px-6 text-center flex flex-col items-center">
                  {/* Glowing Restricted Lock Badge */}
                  <div className="w-16 h-16 rounded-full border border-[#FF4C00]/30 bg-[#FF4C00]/10 flex items-center justify-center mb-6 shadow-inner relative group">
                    <div className="absolute inset-0 bg-[#FF4C00]/5 rounded-full scale-110 animate-pulse" />
                    <Icon icon="solar:user-block-bold-duotone" className="w-8 h-8 text-[#FF4C00] relative z-10 group-hover:scale-110 transition-transform duration-300" />
                  </div>

                  <h2 className="text-xl font-bold tracking-tight text-foreground mb-2">
                    Profile Access Locked
                  </h2>
                  
                  <p className="text-xs text-muted-foreground max-w-sm mb-6 leading-relaxed">
                    User identity details, session records, and billing parameters are restricted on the current execution node. High-privilege API authentication is required to modify profiles.
                  </p>

                  {/* Danger Warning Banner - Outline Style */}
                  <div className="w-full border border-[#E56565]/40 bg-[#E56565]/5 rounded-lg p-3.5 mb-6 text-left flex items-start gap-3">
                    <Icon icon="solar:danger-triangle-linear" className="w-5 h-5 text-[#E56565] shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-[10px] font-bold font-mono text-[#E56565] uppercase tracking-wider block mb-0.5">
                        SUBSCRIPTION CONSTRAINT ACTIVE
                      </span>
                      <p className="text-[11px] text-muted-foreground leading-normal font-medium">
                        Billing histories, team invite managers, and multi-region credentials are locked under standard sandbox configurations.
                      </p>
                    </div>
                  </div>

                  {/* Return to Safety Button */}
                  <Button
                    asChild
                    className="w-full h-11 font-semibold bg-[#FF4C00] hover:bg-[#FF4C00]/90 text-white transition-all duration-300 rounded-[5px] flex items-center justify-center gap-2 group cursor-pointer shadow-md hover:shadow-lg active:scale-[0.98]"
                    style={{ borderRadius: '5px' }}
                  >
                    <Link href="/overview">
                      <Icon icon="solar:arrow-left-linear" className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                      Return to Overview
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Sub-card security stats */}
              <div className="mt-4 flex items-center justify-between px-3 text-[10px] font-mono text-muted-foreground select-none">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  IDENTITY ENCRYPTED
                </span>
                <span>CODE: 403_RESTRICTED</span>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

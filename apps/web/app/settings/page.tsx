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

export default function SettingsPage() {
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
      <div className="flex min-h-screen w-full bg-background font-sans text-foreground">
        {/* App Sidebar Component */}
        <AppSidebar handleLogout={handleLogout} />

        {/* Main Content Area */}
        <SidebarInset className="flex min-h-screen flex-1 flex-col bg-background">
          {/* Header */}
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border/40 bg-card/40 px-6 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-muted/60" />
              <Separator
                orientation="vertical"
                className="!h-4 h-4 !self-center bg-border/40"
              />
              <span className="text-sm font-semibold tracking-tight text-foreground">
                System Settings
              </span>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setTheme(resolvedTheme === "dark" ? "light" : "dark")
                }
                className="h-9 w-9 text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
                title="Toggle Theme"
              >
                {resolvedTheme === "dark" ? (
                  <Icon icon="solar:sun-linear" className="h-4 w-4" />
                ) : (
                  <Icon icon="solar:moon-linear" className="h-4 w-4" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
            </div>
          </header>

          {/* Main Content Container with Minimal View */}
          <main className="flex flex-1 items-center justify-center bg-background p-6">
            <div className="w-full max-w-md">
              <Card className="border border-border/60 bg-card/40 shadow-sm backdrop-blur-sm">
                <CardContent className="flex flex-col items-center px-6 pt-8 pb-8 text-center">
                  <h2 className="mb-2 text-base font-semibold text-foreground">
                    Service Unavailable
                  </h2>
                  <p className="mb-6 max-w-xs text-xs leading-relaxed text-muted-foreground">
                    This service is not available now.
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    className="h-10 w-full cursor-pointer font-medium"
                  >
                    <Link
                      href="/overview"
                      className="flex items-center justify-center gap-2"
                    >
                      <Icon
                        icon="solar:arrow-left-linear"
                        className="h-4 w-4"
                      />
                      Return to Overview
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

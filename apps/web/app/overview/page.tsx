"use client"

import { useEffect, useState } from "react"
import { Icon } from "@iconify/react"
import { useTheme } from "next-themes"
import { Badge } from "@workspace/ui/components/badge"
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

export default function OverviewPage() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [userEmail, setUserEmail] = useState<string>("admin@blazecrawl.com")
  const [activeItem, setActiveItem] = useState("Overview")

  useEffect(() => {
    setMounted(true)
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) return res.json()
        throw new Error()
      })
      .then((data) => {
        if (data.email) {
          setUserEmail(data.email)
        }
      })
      .catch(() => {
        // Fallback user email in dev/mock environments
        setUserEmail("admin@blazecrawl.com")
      })
  }, [])

  const handleLogout = () => {
    document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;"
    window.location.href = "/login"
  }

  if (!mounted) return null

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground font-sans">
        {/* Shadcn SideBar Component */}
        <AppSidebar
          activeItem={activeItem}
          setActiveItem={setActiveItem}
          handleLogout={handleLogout}
        />

        {/* main container */}
        <SidebarInset className="flex-1 flex flex-col min-h-screen bg-background">
          <header className="h-16 flex items-center justify-between px-6 border-b border-border/40 bg-card/40 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-muted/60" />
              <Separator orientation="vertical" className="h-4" />
              <span className="text-sm font-semibold tracking-tight text-foreground">
                Dashboard Overview
              </span>
            </div>

            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="flex items-center gap-1.5 bg-green-500/10 hover:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wider">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Network Healthy
              </Badge>

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

          <main className="p-6 md:p-8 space-y-8 max-w-7xl w-full mx-auto flex-1">
            {/* stats card row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Active Nodes", value: "12", icon: "solar:server-linear", desc: "Running worldwide" },
                { label: "Pages Scraped", value: "1.2M", icon: "solar:document-linear", desc: "+12.4% this week" },
                { label: "Success Rate", value: "99.9%", icon: "solar:check-circle-linear", desc: "Live parsed payload" },
                { label: "Data Volume", value: "4.2 TB", icon: "solar:database-linear", desc: "Distributed storage" },
              ].map((stat, idx) => (
                <Card key={idx} className="border border-border/60 bg-card/40 backdrop-blur-sm shadow-xs hover:border-foreground/20 hover:shadow-md transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {stat.label}
                    </span>
                    <div className="p-2 border border-border/40 bg-muted/20 rounded-md">
                      <Icon icon={stat.icon} className="w-4 h-4 text-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold tracking-tight mb-1">{stat.value}</div>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {stat.desc}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Performance charts & Logs row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Graphic Mock Chart */}
              <Card className="lg:col-span-2 border border-border/60 bg-card/30 backdrop-blur-sm shadow-xs">
                <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/20">
                  <div>
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground">
                      Crawl Performance
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground font-sans">
                      Continuous real-time payload synchronizations
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="font-mono text-[9px] uppercase px-2 py-0.5 tracking-wider">
                    24h Live Stream
                  </Badge>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="h-64 flex flex-col justify-between relative">
                    {/* SVG Line Chart */}
                    <div className="absolute inset-0 z-0">
                      <svg className="w-full h-full text-foreground/90" viewBox="0 0 500 200" preserveAspectRatio="none" fill="none" stroke="currentColor">
                        <defs>
                          <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--foreground)" stopOpacity="0.08" />
                            <stop offset="100%" stopColor="var(--foreground)" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        {/* Area */}
                        <path d="M0,160 C80,140 120,40 200,90 C280,140 320,60 400,30 C450,15 480,85 500,60 L500,200 L0,200 Z" fill="url(#chart-area-grad)" />
                        
                        {/* Horizontal Grid guidelines */}
                        <line x1="0" y1="50" x2="500" y2="50" stroke="currentColor" strokeOpacity="0.05" strokeWidth="1" />
                        <line x1="0" y1="100" x2="500" y2="100" stroke="currentColor" strokeOpacity="0.05" strokeWidth="1" />
                        <line x1="0" y1="150" x2="500" y2="150" stroke="currentColor" strokeOpacity="0.05" strokeWidth="1" />
                        
                        {/* Path Line */}
                        <path d="M0,160 C80,140 120,40 200,90 C280,140 320,60 400,30 C450,15 480,85 500,60" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                        
                        {/* Active points */}
                        <circle cx="200" cy="90" r="4.5" className="fill-background stroke-foreground" strokeWidth="2" />
                        <circle cx="400" cy="30" r="4.5" className="fill-background stroke-foreground" strokeWidth="2" />
                      </svg>
                    </div>

                    <div className="flex-1" />

                    {/* Chart axis label info */}
                    <div className="flex justify-between items-center text-[9px] font-mono text-muted-foreground border-t border-border/20 pt-2 relative z-10">
                      <span>06:00 AM</span>
                      <span>12:00 PM</span>
                      <span>06:00 PM</span>
                      <span>12:00 AM</span>
                      <span>Live Now</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Logs card */}
              <Card className="border border-border/60 bg-card/30 backdrop-blur-sm shadow-xs flex flex-col">
                <CardHeader className="pb-4 border-b border-border/20">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground">
                    System Activity Log
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground font-sans">
                    Chronological events from parsing nodes
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-6">
                    {[
                      { user: "System", action: "Node Alpha Re-synced", time: "2m ago", icon: "solar:server-linear" },
                      { user: "Crawler", action: "New dataset: product_data_v2", time: "15m ago", icon: "solar:document-linear" },
                      { user: "Auth", action: "Successful verification login", time: "1h ago", icon: "solar:shield-check-linear" },
                    ].map((act, i) => (
                      <div key={i} className="flex gap-4 items-start">
                        <div className="w-8 h-8 rounded-md border border-border/40 bg-muted/30 flex items-center justify-center shrink-0">
                          <Icon icon={act.icon} className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{act.action}</p>
                          <span className="text-[10px] text-muted-foreground font-medium block mt-0.5">
                            {act.time} • {act.user}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-4 border-t border-border/20 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                    <span>STATUS: ALL NODES OK</span>
                    <span className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      100% SECURE
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

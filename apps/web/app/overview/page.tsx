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
      <div className="flex min-h-screen w-full bg-background font-sans text-foreground">
        {/* Shadcn SideBar Component */}
        <AppSidebar handleLogout={handleLogout} />

        {/* main container */}
        <SidebarInset className="flex min-h-screen flex-1 flex-col bg-background">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border/40 bg-card/40 px-6 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-muted/60" />
              <Separator
                orientation="vertical"
                className="!h-4 h-4 !self-center bg-border/40"
              />
              <span className="text-sm font-semibold tracking-tight text-foreground">
                Dashboard Overview
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

          <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col space-y-8 p-6 md:p-8">
            {/* stats card row */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: "Active Nodes",
                  value: "12",
                  icon: "solar:server-linear",
                  desc: "Running worldwide",
                },
                {
                  label: "Pages Scraped",
                  value: "1.2M",
                  icon: "solar:document-linear",
                  desc: "+12.4% this week",
                },
                {
                  label: "Success Rate",
                  value: "99.9%",
                  icon: "solar:check-circle-linear",
                  desc: "Live parsed payload",
                },
                {
                  label: "Data Volume",
                  value: "4.2 TB",
                  icon: "solar:database-linear",
                  desc: "Distributed storage",
                },
              ].map((stat, idx) => (
                <Card
                  key={idx}
                  className="border border-border/60 bg-card/40 shadow-xs backdrop-blur-sm transition-all duration-300 hover:border-foreground/20 hover:shadow-md"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      {stat.label}
                    </span>
                    <div className="rounded-md border border-border/40 bg-muted/20 p-2">
                      <Icon
                        icon={stat.icon}
                        className="h-4 w-4 text-foreground"
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-1 text-2xl font-bold tracking-tight">
                      {stat.value}
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {stat.desc}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Performance charts & Logs row */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Graphic Mock Chart */}
              <Card className="border border-border/60 bg-card/30 shadow-xs backdrop-blur-sm lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between border-b border-border/20 pb-4">
                  <div>
                    <CardTitle className="text-sm font-bold tracking-wider text-foreground uppercase">
                      Crawl Performance
                    </CardTitle>
                    <CardDescription className="font-sans text-xs text-muted-foreground">
                      Continuous real-time payload synchronizations
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className="px-2 py-0.5 font-mono text-[9px] tracking-wider uppercase"
                  >
                    24h Live Stream
                  </Badge>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="relative flex h-64 flex-col justify-between">
                    {/* SVG Line Chart */}
                    <div className="absolute inset-0 z-0">
                      <svg
                        className="h-full w-full text-foreground/90"
                        viewBox="0 0 500 200"
                        preserveAspectRatio="none"
                        fill="none"
                        stroke="currentColor"
                      >
                        <defs>
                          <linearGradient
                            id="chart-area-grad"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="var(--foreground)"
                              stopOpacity="0.08"
                            />
                            <stop
                              offset="100%"
                              stopColor="var(--foreground)"
                              stopOpacity="0.0"
                            />
                          </linearGradient>
                        </defs>
                        {/* Area */}
                        <path
                          d="M0,160 C80,140 120,40 200,90 C280,140 320,60 400,30 C450,15 480,85 500,60 L500,200 L0,200 Z"
                          fill="url(#chart-area-grad)"
                        />

                        {/* Horizontal Grid guidelines */}
                        <line
                          x1="0"
                          y1="50"
                          x2="500"
                          y2="50"
                          stroke="currentColor"
                          strokeOpacity="0.05"
                          strokeWidth="1"
                        />
                        <line
                          x1="0"
                          y1="100"
                          x2="500"
                          y2="100"
                          stroke="currentColor"
                          strokeOpacity="0.05"
                          strokeWidth="1"
                        />
                        <line
                          x1="0"
                          y1="150"
                          x2="500"
                          y2="150"
                          stroke="currentColor"
                          strokeOpacity="0.05"
                          strokeWidth="1"
                        />

                        {/* Path Line */}
                        <path
                          d="M0,160 C80,140 120,40 200,90 C280,140 320,60 400,30 C450,15 480,85 500,60"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />

                        {/* Active points */}
                        <circle
                          cx="200"
                          cy="90"
                          r="4.5"
                          className="fill-background stroke-foreground"
                          strokeWidth="2"
                        />
                        <circle
                          cx="400"
                          cy="30"
                          r="4.5"
                          className="fill-background stroke-foreground"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>

                    <div className="flex-1" />

                    {/* Chart axis label info */}
                    <div className="relative z-10 flex items-center justify-between border-t border-border/20 pt-2 font-mono text-[9px] text-muted-foreground">
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
              <Card className="flex flex-col border border-border/60 bg-card/30 shadow-xs backdrop-blur-sm">
                <CardHeader className="border-b border-border/20 pb-4">
                  <CardTitle className="text-sm font-bold tracking-wider text-foreground uppercase">
                    System Activity Log
                  </CardTitle>
                  <CardDescription className="font-sans text-xs text-muted-foreground">
                    Chronological events from parsing nodes
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between pt-6">
                  <div className="space-y-6">
                    {[
                      {
                        user: "System",
                        action: "Node Alpha Re-synced",
                        time: "2m ago",
                        icon: "solar:server-linear",
                      },
                      {
                        user: "Crawler",
                        action: "New dataset: product_data_v2",
                        time: "15m ago",
                        icon: "solar:document-linear",
                      },
                      {
                        user: "Auth",
                        action: "Successful verification login",
                        time: "1h ago",
                        icon: "solar:shield-check-linear",
                      },
                    ].map((act, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/40 bg-muted/30">
                          <Icon
                            icon={act.icon}
                            className="h-4 w-4 text-muted-foreground"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-foreground">
                            {act.action}
                          </p>
                          <span className="mt-0.5 block text-[10px] font-medium text-muted-foreground">
                            {act.time} • {act.user}
                          </span>
                        </div>
                      </div>
                    ))}
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

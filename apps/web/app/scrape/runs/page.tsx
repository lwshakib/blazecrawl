"use client"

import { useEffect, useState, useRef, useCallback } from "react"
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

export default function ScrapeRunsPage() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [runs, setRuns] = useState<Array<any>>([])
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)

  const observer = useRef<IntersectionObserver | null>(null)
  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return
      if (observer.current) observer.current.disconnect()

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting && hasMore) {
          fetchMoreRuns()
        }
      })

      if (node) observer.current.observe(node)
    },
    [loading, hasMore]
  )

  useEffect(() => {
    setMounted(true)
    fetchMoreRuns(true)
  }, [])

  const fetchMoreRuns = async (isInitial = false) => {
    if (loading) return
    setLoading(true)
    const currentOffset = isInitial ? 0 : offset
    const limit = 15

    try {
      const res = await fetch(
        `/api/scrape/runs?limit=${limit}&offset=${currentOffset}`
      )
      if (res.ok) {
        const data = await res.json()
        const newRuns = data.data || []

        if (isInitial) {
          setRuns(newRuns)
          setOffset(newRuns.length)
        } else {
          setRuns((prev) => [...prev, ...newRuns])
          setOffset((prev) => prev + newRuns.length)
        }

        if (newRuns.length < limit) {
          setHasMore(false)
        }
      }
    } catch (err) {
      console.error("Failed to load runs:", err)
    } finally {
      setLoading(false)
    }
  }

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
                All Scrape Runs
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
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Scrape History Log
                </h1>
                <p className="mt-1 text-xs text-muted-foreground">
                  Browse and inspect all historical crawled datasets.
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-9 font-semibold"
              >
                <Link href="/scrape">
                  <Icon
                    icon="solar:arrow-left-linear"
                    className="mr-2 h-4 w-4"
                  />
                  Back to Scraper
                </Link>
              </Button>
            </div>

            <Card className="flex flex-1 flex-col border border-border/60 bg-card/30 shadow-xs backdrop-blur-sm">
              <CardContent className="flex-1 p-0">
                {runs.length === 0 && !loading ? (
                  <div className="flex flex-col items-center justify-center space-y-2 py-16 text-center text-xs text-muted-foreground">
                    <Icon
                      icon="solar:history-linear"
                      className="h-12 w-12 opacity-35"
                    />
                    <p className="font-medium text-foreground">
                      No historical runs logged yet.
                    </p>
                    <p className="text-muted-foreground">
                      Scrape your first target endpoint to see history records.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/40">
                    {runs.map((run, idx) => {
                      const isLast = idx === runs.length - 1
                      return (
                        <div
                          key={run.id}
                          ref={isLast ? lastElementRef : null}
                          className="group"
                        >
                          <Link
                            href={`/scrape/runs/${run.id}`}
                            className="block flex cursor-pointer flex-col justify-between gap-4 p-5 transition-all duration-200 hover:bg-muted/15 sm:flex-row sm:items-center"
                          >
                            <div className="min-w-0 space-y-1.5">
                              <span className="block max-w-sm truncate text-sm font-bold text-foreground transition-colors group-hover:text-primary group-hover:underline sm:max-w-md md:max-w-xl">
                                {run.url}
                              </span>
                              <div className="flex flex-wrap items-center gap-2">
                                {run.options &&
                                  Object.entries(run.options).map(
                                    ([key, val]) => {
                                      if (val) {
                                        return (
                                          <span
                                            key={key}
                                            className="rounded border border-border/40 bg-muted/65 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wider text-muted-foreground uppercase"
                                          >
                                            {key}
                                          </span>
                                        )
                                      }
                                      return null
                                    }
                                  )}
                              </div>
                            </div>

                            <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
                              <span className="font-mono text-xs text-muted-foreground">
                                {new Date(run.created_at).toLocaleString()}
                              </span>
                              <div className="rounded-md border border-border/40 bg-muted/30 p-1 transition-all group-hover:border-primary/20 group-hover:bg-primary/10">
                                <Icon
                                  icon="solar:arrow-right-linear"
                                  className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary"
                                />
                              </div>
                            </div>
                          </Link>
                        </div>
                      )
                    })}

                    {loading && (
                      <div className="flex items-center justify-center gap-2 p-8 text-xs text-muted-foreground">
                        <Icon
                          icon="solar:spinner-bold"
                          className="h-5 w-5 animate-spin text-primary"
                        />
                        <span>Loading more runs...</span>
                      </div>
                    )}

                    {!hasMore && runs.length > 0 && (
                      <div className="bg-muted/5 p-6 text-center font-mono text-xs tracking-wider text-muted-foreground uppercase">
                        End of history log
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

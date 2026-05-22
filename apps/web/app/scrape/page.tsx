"use client"

import { useEffect, useState } from "react"
import { Icon } from "@iconify/react"
import { useTheme } from "next-themes"
import { Button } from "@workspace/ui/components/button"
import { Separator } from "@workspace/ui/components/separator"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
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

// Mock Scraped Brand Details fallback based on target URL input
const brandOutput = {
  colors: [
    {
      name: "Primary",
      hex: "#FF4C00",
      desc: "Vibrant High-Energy Accent Orange",
    },
    { name: "Secondary", hex: "#E56565", desc: "Slightly Muted Rose Red" },
    { name: "Accent", hex: "#FF4C00", desc: "Vibrant Core Highlights" },
    { name: "Background", hex: "#F9F9F9", desc: "Ultra-Light Cool Off-White" },
    {
      name: "Text Primary",
      hex: "#262626",
      desc: "Deep Charcoal Charcoal Slate",
    },
    {
      name: "Link Color",
      hex: "#FF4D00",
      desc: "Action Links and Active States",
    },
  ],
  typography: {
    fontFamily: "Suisse (sans-serif)",
    heading: "Suisse",
    h1: "60px",
    h2: "52px",
    body: "16px",
  },
  spacing: {
    baseUnit: "4px spacing grid matrix",
    borderRadius: "5px smooth border curves",
  },
  personality: {
    tone: "modern",
    energy: "high",
    audience: "tech-savvy professionals",
  },
}

function highlightJson(json: string) {
  if (!json) return ""
  // Escape HTML
  const html = json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

  // Highlight JSON keys, values, strings, numbers, etc.
  return html.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = "text-blue-700 dark:text-blue-400" // numbers
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = "text-purple-700 dark:text-purple-400 font-bold" // keys
        } else {
          cls = "text-emerald-700 dark:text-emerald-400" // string values
        }
      } else if (/true|false/.test(match)) {
        cls = "text-orange-600 dark:text-orange-400 font-semibold" // boolean values
      } else if (/null/.test(match)) {
        cls = "text-red-600 dark:text-red-400 italic" // null value
      }
      return `<span class="${cls}">${match}</span>`
    }
  )
}

export default function ScrapePage() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // URL State
  const [targetUrl, setTargetUrl] = useState("")

  // Checkbox Selections (Multi-select)
  const [selectedOptions, setSelectedOptions] = useState({
    markdown: true,
    summary: false,
    links: false,
    html: false,
    screenshot: false,
    branding: false,
  })

  // Scraping & Stateful History States
  const [scrapeState, setScrapeState] = useState<
    "idle" | "scraping" | "completed"
  >("idle")
  const [recentRuns, setRecentRuns] = useState<Array<any>>([])
  const [viewingRunId, setViewingRunId] = useState<string | null>(null)

  // Split-Preview layout states
  const [leftActiveTab, setLeftActiveTab] = useState<string>("markdown")
  const [isCopiedLeft, setIsCopiedLeft] = useState(false)
  const [isCopiedRight, setIsCopiedRight] = useState(false)
  const [copiedHex, setCopiedHex] = useState<string | null>(null)

  // Real-time parsed output containers
  const [extractedData, setExtractedData] = useState<{
    json: string
    markdown: string
    summary: string
    links: Array<{ label: string; url: string }>
    html: string
    screenshotUrl: string
    branding?: typeof brandOutput
  }>({
    json: "",
    markdown: "",
    summary: "",
    links: [],
    html: "",
    screenshotUrl: "",
    branding: undefined,
  })

  // Fetch recent scrape runs
  const fetchRecentRuns = async () => {
    try {
      const res = await fetch("/api/scrape/runs")
      if (res.ok) {
        const data = await res.json()
        if (data.data) {
          setRecentRuns(data.data)
        }
      }
    } catch (err) {
      console.error("Failed to fetch recent runs:", err)
    }
  }

  useEffect(() => {
    setMounted(true)
    fetchRecentRuns()
  }, [])

  const handleLogout = () => {
    document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;"
    window.location.href = "/login"
  }

  const fillExample = (url: string) => {
    setTargetUrl(url)
  }

  const toggleOption = (option: keyof typeof selectedOptions) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }))
  }

  // Helper to determine active left-pane tabs dynamically based on user selections
  const getLeftActiveTabs = (opts: typeof selectedOptions) => {
    const tabs: string[] = []
    if (opts.markdown) tabs.push("markdown")
    if (opts.summary) tabs.push("summary")
    if (opts.links) tabs.push("links")
    if (opts.html) tabs.push("html")
    if (opts.screenshot) tabs.push("screenshot")
    if (opts.branding) tabs.push("branding")
    return tabs
  }

  const handleStartScrape = async () => {
    const activeUrl = targetUrl.trim() || "https://example.com"
    if (!targetUrl.trim()) {
      setTargetUrl(activeUrl)
    }

    setScrapeState("scraping")
    setViewingRunId(null) // Return to active crawl state

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: activeUrl, options: selectedOptions }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Scraping operation failed")
      }

      const data = await res.json()

      setExtractedData({
        json: JSON.stringify(data.json || data, null, 2),
        markdown: data.markdown || "",
        summary: data.summary || "",
        links: data.links || [],
        html: data.html || "",
        screenshotUrl: data.screenshotUrl || "",
        branding: data.branding,
      })

      // Set default active tab in left pane based on current options
      const activeLeftTabs = getLeftActiveTabs(selectedOptions)
      const firstTab = activeLeftTabs[0]
      if (firstTab) {
        setLeftActiveTab(firstTab)
      } else {
        setLeftActiveTab("json")
      }

      setScrapeState("completed")
      // Dynamic refresh of PostgreSQL persistent runs list
      fetchRecentRuns()
    } catch (err: any) {
      alert(`Error: ${err.message || "Failed to execute scrape operation"}`)
      setScrapeState("idle")
    }
  }

  // Load a historical crawl details statefully from Postgres
  const handleLoadHistoryRun = async (runId: string) => {
    setScrapeState("scraping")
    setViewingRunId(runId)

    try {
      const res = await fetch(`/api/scrape/runs/${runId}`)
      if (!res.ok) throw new Error("Failed to load historical run details")
      const data = await res.json()

      // The historical result is returned nested or directly
      const payload = data.data || data

      setExtractedData({
        json: JSON.stringify(payload.json || payload, null, 2),
        markdown: payload.markdown || "",
        summary: payload.summary || "",
        links: payload.links || [],
        html: payload.html || "",
        screenshotUrl: payload.screenshotUrl || "",
        branding: payload.branding,
      })

      // Setup checkboxes based on the saved historical config options
      const historicalRun = recentRuns.find((r) => r.id === runId)
      if (historicalRun && historicalRun.options) {
        setSelectedOptions(historicalRun.options)
        setTargetUrl(historicalRun.url)
        const activeLeftTabs = getLeftActiveTabs(historicalRun.options)
        const firstHistTab = activeLeftTabs[0]
        if (firstHistTab) {
          setLeftActiveTab(firstHistTab)
        } else {
          setLeftActiveTab("json")
        }
      }

      setScrapeState("completed")
    } catch (err: any) {
      alert(`Error loading history: ${err.message}`)
      setViewingRunId(null)
      setScrapeState("idle")
    }
  }

  const handleBackToScraper = () => {
    setViewingRunId(null)
    setScrapeState("idle")
    setExtractedData({
      json: "",
      markdown: "",
      summary: "",
      links: [],
      html: "",
      screenshotUrl: "",
      branding: undefined,
    })
  }

  const handleCopyToClipboard = (text: string, isLeft: boolean) => {
    navigator.clipboard.writeText(text)
    if (isLeft) {
      setIsCopiedLeft(true)
      setTimeout(() => setIsCopiedLeft(false), 2000)
    } else {
      setIsCopiedRight(true)
      setTimeout(() => setIsCopiedRight(false), 2000)
    }
  }

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex)
    setCopiedHex(hex)
    setTimeout(() => setCopiedHex(null), 1500)
  }

  if (!mounted) return null

  const activeLeftTabs = getLeftActiveTabs(selectedOptions)
  const branding = extractedData.branding || brandOutput

  // Dynamic Copy Button Labels based on active selection
  const getLeftCopyLabel = () => {
    switch (leftActiveTab) {
      case "markdown":
        return "Copy Markdown"
      case "summary":
        return "Copy Summary"
      case "links":
        return "Copy Outgoing Links"
      case "html":
        return "Copy HTML Source"
      case "screenshot":
        return "Copy Screenshot URI"
      case "branding":
        return "Copy Branding Tokens"
      default:
        return "Copy Panel Data"
    }
  }

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
                {viewingRunId
                  ? "Viewing History Scrape Dataset"
                  : "Web Page Scraper"}
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
            {/* 1. Historical Dataset Mode Header */}
            {viewingRunId && (
              <Card className="flex flex-col items-center justify-between gap-4 rounded-xl border border-primary/25 bg-primary/5 p-4 shadow-2xs sm:flex-row">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                    <Icon icon="solar:history-bold" className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="max-w-xs truncate text-sm font-bold text-foreground sm:max-w-md md:max-w-xl">
                      Historical Data: {targetUrl}
                    </h2>
                    <p className="mt-0.5 font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                      Loaded from PostgreSQL Persistent Records
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleBackToScraper}
                  variant="outline"
                  size="sm"
                  className="h-9 shrink-0 border-border/60 font-semibold hover:bg-muted/30"
                >
                  <Icon
                    icon="solar:arrow-left-linear"
                    className="mr-2 h-4 w-4"
                  />
                  Back to Scraper
                </Button>
              </Card>
            )}

            {/* 2. Target Config Card (Hidden during history detail review to declutter screen) */}
            {!viewingRunId && (
              <Card className="border border-border/60 bg-card/30 shadow-xs backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-bold tracking-wider text-foreground uppercase">
                    Web Scraper Configuration
                  </CardTitle>
                  <CardDescription className="font-sans text-xs text-muted-foreground">
                    Configure options and launch scraper crawling networks.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* URL Input Form */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="target-url"
                      className="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                    >
                      Target URL
                    </Label>
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                          <Icon icon="solar:link-linear" className="h-4 w-4" />
                        </div>
                        <Input
                          id="target-url"
                          placeholder="https://news.ycombinator.com"
                          value={targetUrl}
                          onChange={(e) => setTargetUrl(e.target.value)}
                          disabled={scrapeState === "scraping"}
                          className="h-11 border-border/60 pl-9 text-sm focus-visible:border-foreground/45 focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-50"
                        />
                      </div>
                      <Button
                        onClick={handleStartScrape}
                        disabled={scrapeState === "scraping"}
                        className="flex h-11 shrink-0 items-center gap-2 px-6 font-semibold select-none"
                      >
                        {scrapeState === "scraping" ? (
                          <>
                            <Icon
                              icon="solar:spinner-bold"
                              className="h-4 w-4 animate-spin text-primary-foreground"
                            />
                            Extracting...
                          </>
                        ) : (
                          <>
                            <Icon
                              icon="solar:play-bold"
                              className="h-4 w-4 text-primary-foreground"
                            />
                            Scrape Page
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Suggestions */}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                        Sandbox Suggestions:
                      </span>
                      <button
                        onClick={() =>
                          fillExample("https://news.ycombinator.com")
                        }
                        disabled={scrapeState === "scraping"}
                        className="rounded-md border border-border/40 bg-muted/20 px-2 py-0.5 font-mono text-[10px] text-muted-foreground transition-all hover:border-foreground/30 hover:text-foreground disabled:opacity-50"
                      >
                        Hacker News
                      </button>
                      <button
                        onClick={() =>
                          fillExample("https://github.com/lwshakib/blazecrawl")
                        }
                        disabled={scrapeState === "scraping"}
                        className="rounded-md border border-border/40 bg-muted/20 px-2 py-0.5 font-mono text-[10px] text-muted-foreground transition-all hover:border-foreground/30 hover:text-foreground disabled:opacity-50"
                      >
                        GitHub Repository
                      </button>
                    </div>
                  </div>

                  <Separator className="bg-border/20" />

                  {/* Checklist Multi-Select options */}
                  <div className="space-y-3">
                    <span className="block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      Target Data Selectors (Multi-Select)
                    </span>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                      {/* Options */}
                      {[
                        {
                          key: "markdown",
                          label: "Markdown",
                          sub: "Read-Optimized",
                        },
                        {
                          key: "summary",
                          label: "Summary",
                          sub: "AI Key Bullets",
                        },
                        {
                          key: "links",
                          label: "Links",
                          sub: "Hyperlinks Table",
                        },
                        { key: "html", label: "HTML", sub: "DOM Source" },
                        {
                          key: "screenshot",
                          label: "Screenshot",
                          sub: "Browser Mock",
                        },
                        {
                          key: "branding",
                          label: "Branding",
                          sub: "Theme & Fonts",
                        },
                      ].map((item) => {
                        const active =
                          selectedOptions[
                            item.key as keyof typeof selectedOptions
                          ]
                        return (
                          <div
                            key={item.key}
                            onClick={() =>
                              scrapeState !== "scraping" &&
                              toggleOption(
                                item.key as keyof typeof selectedOptions
                              )
                            }
                            className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all select-none ${active ? "border-primary bg-primary/5 text-foreground shadow-2xs" : "border-border/60 text-muted-foreground hover:border-border"}`}
                          >
                            <Icon
                              icon={
                                active
                                  ? "solar:check-circle-bold"
                                  : "solar:circle-linear"
                              }
                              className={`h-5 w-5 shrink-0 ${active ? "text-primary" : "text-muted-foreground"}`}
                            />
                            <div className="flex min-w-0 flex-col">
                              <span className="text-xs font-bold text-foreground">
                                {item.label}
                              </span>
                              <span className="truncate text-[9px] text-muted-foreground">
                                {item.sub}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 3. Spinner Loading Overlay for scraper actions */}
            {scrapeState === "scraping" && (
              <Card className="flex min-h-[300px] flex-col items-center justify-center space-y-4 border border-border/60 bg-card/30 p-16 shadow-sm backdrop-blur-sm">
                <Icon
                  icon="solar:spinner-bold"
                  className="h-12 w-12 animate-spin text-primary"
                />
                <div className="text-center">
                  <h3 className="text-sm font-bold text-foreground">
                    Scraper Syncing...
                  </h3>
                  <p className="mt-1 font-sans text-xs text-muted-foreground">
                    Connecting to website to execute target selectors
                  </p>
                </div>
              </Card>
            )}

            {/* 4. PREMIUM SINGLE CARD TAB VISUALIZER LAYOUT */}
            {scrapeState === "completed" && (
              <Card className="flex min-h-[500px] flex-col border border-border/60 bg-card/30 shadow-xs backdrop-blur-sm">
                <CardHeader className="border-b border-border/20 pb-4">
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                      <CardTitle className="text-sm font-bold tracking-wider text-foreground uppercase">
                        Scrape Output Visualizer
                      </CardTitle>
                      <CardDescription className="font-sans text-xs text-muted-foreground">
                        Dynamic format preview and raw crawled data streams
                      </CardDescription>
                    </div>

                    {/* Unified Premium Tab Bar */}
                    <div className="flex max-w-full flex-wrap items-center gap-3 md:ml-auto md:flex-nowrap">
                      {/* Left Side: Dynamic checklist tabs */}
                      <div className="flex flex-wrap gap-1.5 overflow-x-auto rounded-xl border border-border/40 bg-muted/40 p-1 dark:bg-muted/10">
                        {activeLeftTabs.map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setLeftActiveTab(tab)}
                            className={`rounded-lg px-3.5 py-1.5 font-mono text-[10px] font-bold tracking-wider uppercase transition-all select-none ${leftActiveTab === tab ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"}`}
                          >
                            {tab}
                          </button>
                        ))}
                        {activeLeftTabs.length === 0 && (
                          <span className="px-3 py-1 font-sans text-[10px] text-muted-foreground select-none">
                            No Extra Formats Active
                          </span>
                        )}
                      </div>

                      {/* Right Side: Always JSON */}
                      <button
                        onClick={() => setLeftActiveTab("json")}
                        className={`rounded-xl border px-4 py-2 font-mono text-[10px] font-bold tracking-wider uppercase transition-all select-none ${leftActiveTab === "json" ? "border-primary bg-primary text-primary-foreground shadow-md" : "border-border/60 text-muted-foreground hover:border-border"}`}
                      >
                        JSON DATA
                      </button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col pt-6">
                  {/* Inside Tab Panel: Show description and dynamic Copy action */}
                  <div className="flex flex-1 flex-col space-y-4">
                    {/* Active tab content specialized copy button inside tab panel */}
                    <div className="flex justify-end border-b border-border/20 pb-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          let text = ""
                          if (leftActiveTab === "json")
                            text = extractedData.json
                          else if (leftActiveTab === "markdown")
                            text = extractedData.markdown
                          else if (leftActiveTab === "summary")
                            text = extractedData.summary
                          else if (leftActiveTab === "links")
                            text = JSON.stringify(extractedData.links, null, 2)
                          else if (leftActiveTab === "html")
                            text = extractedData.html
                          else if (leftActiveTab === "branding")
                            text = JSON.stringify(branding, null, 2)
                          else text = "screenshot_placeholder"
                          handleCopyToClipboard(text, leftActiveTab !== "json")
                        }}
                        className="flex h-8 items-center gap-1.5 border-border/60 bg-card px-3.5 font-mono text-[10px] uppercase transition-all select-none hover:bg-muted/40"
                      >
                        {(
                          leftActiveTab === "json"
                            ? isCopiedRight
                            : isCopiedLeft
                        ) ? (
                          <>
                            <Icon
                              icon="solar:check-circle-linear"
                              className="h-3.5 w-3.5 text-green-500"
                            />
                            Copied
                          </>
                        ) : (
                          <>
                            <Icon
                              icon="solar:copy-linear"
                              className="h-3.5 w-3.5"
                            />
                            {leftActiveTab === "json"
                              ? "Copy JSON Data"
                              : getLeftCopyLabel()}
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Visualizer content viewer box */}
                    <div className="no-scrollbar max-h-[550px] min-h-[400px] flex-1 overflow-y-auto rounded-xl border border-border/20 bg-muted/40 p-4 font-mono text-xs text-slate-800 dark:bg-black/40 dark:text-slate-200">
                      {/* JSON Tab Content */}
                      {leftActiveTab === "json" && (
                        <pre
                          className="font-mono leading-relaxed break-all whitespace-pre-wrap text-slate-800 select-text dark:text-slate-200"
                          dangerouslySetInnerHTML={{
                            __html: highlightJson(
                              extractedData.json ||
                                '{\n  "message": "No JSON data loaded."\n}'
                            ),
                          }}
                        />
                      )}

                      {/* Markdown Tab Content */}
                      {leftActiveTab === "markdown" && (
                        <pre className="font-mono leading-relaxed break-all whitespace-pre-wrap text-slate-700 select-text dark:text-slate-300">
                          {extractedData.markdown || "No markdown scraped."}
                        </pre>
                      )}

                      {/* Summary Tab Content */}
                      {leftActiveTab === "summary" && (
                        <pre className="font-mono leading-relaxed break-all whitespace-pre-wrap text-amber-700 select-text dark:text-amber-300">
                          {extractedData.summary ||
                            "No summary bullets available."}
                        </pre>
                      )}

                      {/* Links Tab Content */}
                      {leftActiveTab === "links" && (
                        <div className="space-y-4 font-sans text-foreground">
                          <span className="font-mono text-xs font-bold tracking-widest text-muted-foreground uppercase">
                            Outgoing Hyperlinks Table
                          </span>
                          <div className="overflow-hidden rounded-lg border border-border/30">
                            <table className="w-full border-collapse text-left">
                              <thead>
                                <tr className="border-b border-border/30 bg-muted/40 text-[10px] font-bold text-muted-foreground uppercase">
                                  <th className="p-3">Anchor Label</th>
                                  <th className="p-3">
                                    Hyperlink Coordinates (URL)
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border/20 text-xs">
                                {extractedData.links.length === 0 ? (
                                  <tr>
                                    <td
                                      colSpan={2}
                                      className="p-3 text-center text-muted-foreground"
                                    >
                                      No outgoing links gathered.
                                    </td>
                                  </tr>
                                ) : (
                                  extractedData.links.map((link, idx) => (
                                    <tr
                                      key={idx}
                                      className="transition-colors hover:bg-muted/10"
                                    >
                                      <td className="max-w-[200px] truncate p-3 font-semibold text-foreground">
                                        {link.label}
                                      </td>
                                      <td className="max-w-[300px] truncate p-3 font-mono text-primary hover:underline">
                                        <a
                                          href={link.url}
                                          target="_blank"
                                          rel="noreferrer"
                                        >
                                          {link.url}
                                        </a>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* HTML Tab Content */}
                      {leftActiveTab === "html" && (
                        <pre className="font-mono leading-relaxed break-all whitespace-pre-wrap text-emerald-700 select-text dark:text-emerald-400">
                          {extractedData.html || "No HTML source fetched."}
                        </pre>
                      )}

                      {/* Screenshot Tab Content */}
                      {leftActiveTab === "screenshot" && (
                        <div className="flex flex-col items-center justify-center p-4">
                          <div className="relative w-full max-w-2xl overflow-hidden rounded-xl border border-border/40 bg-card shadow-2xl">
                            {/* Browser controls header mockup */}
                            <div className="flex h-8 items-center justify-between border-b border-border/30 bg-muted/40 px-4 select-none">
                              <div className="flex gap-1.5">
                                <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                                <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                                <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                              </div>
                              <div className="max-w-md truncate rounded-md border border-border/20 bg-muted/60 px-8 py-0.5 font-sans text-[9px] text-muted-foreground">
                                {targetUrl}
                              </div>
                              <div className="w-8" />
                            </div>

                            {/* Browser mockup page */}
                            {extractedData.screenshotUrl.startsWith("data:") ? (
                              <img
                                src={extractedData.screenshotUrl}
                                alt="Scraped Page Screenshot"
                                className="h-auto max-h-[400px] w-full object-contain"
                              />
                            ) : (
                              <div className="flex min-h-[220px] flex-col items-center justify-center space-y-4 bg-[#F9F9F9] p-10 text-center font-sans text-[#262626]">
                                <h1 className="font-sans text-3xl font-extrabold tracking-tight text-[#FF4C00]">
                                  BlazeCrawl Interactive Page
                                </h1>
                                <p className="max-w-sm text-xs font-medium text-muted-foreground">
                                  Headless screenshot completed successfully.
                                </p>
                                <div
                                  className="flex h-10 items-center justify-center rounded-md bg-[#FF4C00] px-6 text-xs font-bold text-white shadow-md"
                                  style={{ borderRadius: "5px" }}
                                >
                                  Mock Action
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Branding Tab Content */}
                      {leftActiveTab === "branding" && (
                        <div className="space-y-6 font-sans text-foreground">
                          <div>
                            <h3 className="mb-2 font-mono text-xs font-bold tracking-widest text-muted-foreground uppercase">
                              1. Extracted Color Palette
                            </h3>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                              {branding.colors.map((color) => (
                                <div
                                  key={color.name}
                                  onClick={() => handleCopyHex(color.hex)}
                                  className="group flex cursor-pointer items-center justify-between rounded-lg border border-border/40 bg-card p-3 shadow-2xs transition-all select-none hover:bg-muted/10"
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className="h-8 w-8 rounded-md border border-border/50 shadow-inner"
                                      style={{
                                        backgroundColor: color.hex,
                                        borderRadius: "5px",
                                      }}
                                    />
                                    <div className="flex min-w-0 flex-col">
                                      <span className="text-xs font-bold text-foreground">
                                        {color.name}
                                      </span>
                                      <span className="truncate font-mono text-[9px] text-muted-foreground">
                                        {color.hex}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground transition-colors group-hover:text-primary">
                                    {copiedHex === color.hex ? (
                                      <>
                                        <Icon
                                          icon="solar:check-circle-linear"
                                          className="h-3.5 w-3.5 animate-bounce text-green-500"
                                        />
                                        <span className="text-green-500">
                                          Copied
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <Icon
                                          icon="solar:copy-linear"
                                          className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100"
                                        />
                                        <span>Copy</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <Separator className="bg-border/20" />

                          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            {/* Typography Hierarchy */}
                            <div className="rounded-xl border border-border/40 bg-card p-4 shadow-2xs">
                              <h3 className="mb-3 font-mono text-xs font-bold tracking-widest text-muted-foreground uppercase">
                                2. Typography Structure
                              </h3>
                              <div className="space-y-3 text-xs leading-relaxed">
                                <div className="flex justify-between border-b border-border/20 pb-2">
                                  <span className="text-muted-foreground">
                                    Font Family
                                  </span>
                                  <span className="font-mono font-semibold text-foreground">
                                    {branding.typography.fontFamily}
                                  </span>
                                </div>
                                <div className="flex justify-between border-b border-border/20 pb-2">
                                  <span className="text-muted-foreground">
                                    Heading Font
                                  </span>
                                  <span className="font-mono font-semibold text-foreground">
                                    {branding.typography.heading}
                                  </span>
                                </div>
                                <div className="flex justify-between border-b border-border/20 pb-2">
                                  <span className="text-muted-foreground">
                                    h1 Size
                                  </span>
                                  <span className="font-mono font-semibold text-foreground">
                                    {branding.typography.h1}
                                  </span>
                                </div>
                                <div className="flex justify-between pb-1">
                                  <span className="text-muted-foreground">
                                    Body Size
                                  </span>
                                  <span className="font-mono font-semibold text-foreground">
                                    {branding.typography.body}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Spacing & Tokens */}
                            <div className="rounded-xl border border-border/40 bg-card p-4 shadow-2xs">
                              <h3 className="mb-3 font-mono text-xs font-bold tracking-widest text-muted-foreground uppercase">
                                3. Spacing Grid & Border
                              </h3>
                              <div className="space-y-3 text-xs leading-relaxed">
                                <div className="flex justify-between border-b border-border/20 pb-2">
                                  <span className="text-muted-foreground">
                                    Base Unit Grid
                                  </span>
                                  <span className="font-mono font-semibold text-foreground">
                                    {branding.spacing.baseUnit}
                                  </span>
                                </div>
                                <div className="flex justify-between pb-1">
                                  <span className="text-muted-foreground">
                                    Border Radius
                                  </span>
                                  <span className="font-mono font-semibold text-foreground">
                                    {branding.spacing.borderRadius}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 5. PERSISTENT RECENT RUNS HISTORY SECTION */}
            {!viewingRunId && (
              <Card className="border border-border/60 bg-card/30 shadow-xs backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <div>
                    <CardTitle className="text-sm font-bold tracking-wider text-foreground uppercase">
                      Recent Scrape Runs
                    </CardTitle>
                    <CardDescription className="font-sans text-xs text-muted-foreground">
                      Persistent history records logged from your crawler node
                      activity.
                    </CardDescription>
                  </div>
                  {recentRuns.length > 0 && (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-9 shrink-0 font-semibold"
                    >
                      <Link href="/scrape/runs">See All</Link>
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {recentRuns.length === 0 ? (
                    <div className="flex flex-col items-center justify-center space-y-2 py-8 text-center text-xs text-muted-foreground">
                      <Icon
                        icon="solar:history-linear"
                        className="h-8 w-8 opacity-45"
                      />
                      <p>
                        No historical runs found. Scrape your first target
                        endpoint above to begin logging records.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/40 overflow-hidden rounded-xl border border-border/40">
                      {recentRuns.map((run) => (
                        <Link
                          key={run.id}
                          href={`/scrape/runs/${run.id}`}
                          className="group block flex cursor-pointer flex-col justify-between gap-3 p-4 transition-all hover:bg-muted/15 sm:flex-row sm:items-center"
                        >
                          <div className="min-w-0 space-y-1">
                            <span className="block max-w-sm truncate text-xs font-bold text-foreground transition-colors group-hover:text-primary hover:underline sm:max-w-md md:max-w-xl">
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
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {new Date(run.created_at).toLocaleString()}
                            </span>
                            <Icon
                              icon="solar:arrow-right-linear"
                              className="hidden h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary sm:block"
                            />
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

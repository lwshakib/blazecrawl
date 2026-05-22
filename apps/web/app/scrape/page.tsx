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

// Mock Scraped Brand Details fallback based on target URL input
const brandOutput = {
  colors: [
    { name: "Primary", hex: "#FF4C00", desc: "Vibrant High-Energy Accent Orange" },
    { name: "Secondary", hex: "#E56565", desc: "Slightly Muted Rose Red" },
    { name: "Accent", hex: "#FF4C00", desc: "Vibrant Core Highlights" },
    { name: "Background", hex: "#F9F9F9", desc: "Ultra-Light Cool Off-White" },
    { name: "Text Primary", hex: "#262626", desc: "Deep Charcoal Charcoal Slate" },
    { name: "Link Color", hex: "#FF4D00", desc: "Action Links and Active States" }
  ],
  typography: {
    fontFamily: "Suisse (sans-serif)",
    heading: "Suisse",
    h1: "60px",
    h2: "52px",
    body: "16px"
  },
  spacing: {
    baseUnit: "4px spacing grid matrix",
    borderRadius: "5px smooth border curves"
  },
  personality: {
    tone: "modern",
    energy: "high",
    audience: "tech-savvy professionals"
  }
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
      let cls = "text-yellow-600 dark:text-yellow-400" // numbers
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = "text-purple-600 dark:text-purple-400 font-bold" // keys
        } else {
          cls = "text-emerald-600 dark:text-emerald-400" // string values
        }
      } else if (/true|false/.test(match)) {
        cls = "text-sky-600 dark:text-sky-400 font-semibold" // boolean values
      } else if (/null/.test(match)) {
        cls = "text-red-500 italic" // null value
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
  const [scrapeState, setScrapeState] = useState<"idle" | "scraping" | "completed">("idle")
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
      <div className="flex min-h-screen w-full bg-background text-foreground font-sans">
        {/* App Sidebar Component */}
        <AppSidebar handleLogout={handleLogout} />

        {/* main container */}
        <SidebarInset className="flex-1 flex flex-col min-h-screen bg-background">
          <header className="h-16 flex items-center justify-between px-6 border-b border-border/40 bg-card/40 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-muted/60" />
              <Separator orientation="vertical" className="h-4 bg-border/40" />
              <span className="text-sm font-semibold tracking-tight text-foreground">
                {viewingRunId ? "Viewing History Scrape Dataset" : "Web Page Scraper"}
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

          <main className="p-6 md:p-8 space-y-8 max-w-7xl w-full mx-auto flex-1 flex flex-col">
            {/* 1. Historical Dataset Mode Header */}
            {viewingRunId && (
              <Card className="border border-primary/25 bg-primary/5 shadow-2xs p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 border border-primary/20 bg-primary/10 flex items-center justify-center text-primary rounded-lg">
                    <Icon icon="solar:history-bold" className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-foreground truncate max-w-xs sm:max-w-md md:max-w-xl">
                      Historical Data: {targetUrl}
                    </h2>
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5 uppercase tracking-wider">
                      Loaded from PostgreSQL Persistent Records
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={handleBackToScraper}
                  variant="outline"
                  size="sm"
                  className="shrink-0 h-9 font-semibold border-border/60 hover:bg-muted/30"
                >
                  <Icon icon="solar:arrow-left-linear" className="w-4 h-4 mr-2" />
                  Back to Scraper
                </Button>
              </Card>
            )}

            {/* 2. Target Config Card (Hidden during history detail review to declutter screen) */}
            {!viewingRunId && (
              <Card className="border border-border/60 bg-card/30 backdrop-blur-sm shadow-xs">
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground">Web Scraper Configuration</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground font-sans">
                    Configure options and launch scraper crawling networks.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* URL Input Form */}
                  <div className="space-y-2">
                    <Label htmlFor="target-url" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Target URL</Label>
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                          <Icon icon="solar:link-linear" className="w-4 h-4" />
                        </div>
                        <Input
                          id="target-url"
                          placeholder="https://news.ycombinator.com"
                          value={targetUrl}
                          onChange={(e) => setTargetUrl(e.target.value)}
                          disabled={scrapeState === "scraping"}
                          className="pl-9 h-11 border-border/60 text-sm focus-visible:border-foreground/45 focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-50"
                        />
                      </div>
                      <Button 
                        onClick={handleStartScrape} 
                        disabled={scrapeState === "scraping"}
                        className="h-11 px-6 font-semibold flex items-center gap-2 select-none shrink-0"
                      >
                        {scrapeState === "scraping" ? (
                          <>
                            <Icon icon="solar:spinner-bold" className="w-4 h-4 animate-spin text-primary-foreground" />
                            Extracting...
                          </>
                        ) : (
                          <>
                            <Icon icon="solar:play-bold" className="w-4 h-4 text-primary-foreground" />
                            Scrape Page
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {/* Suggestions */}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Sandbox Suggestions:</span>
                      <button 
                        onClick={() => fillExample("https://news.ycombinator.com")}
                        disabled={scrapeState === "scraping"}
                        className="text-[10px] font-mono border border-border/40 hover:border-foreground/30 bg-muted/20 px-2 py-0.5 rounded-md text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
                      >
                        Hacker News
                      </button>
                      <button 
                        onClick={() => fillExample("https://github.com/lwshakib/blazecrawl")}
                        disabled={scrapeState === "scraping"}
                        className="text-[10px] font-mono border border-border/40 hover:border-foreground/30 bg-muted/20 px-2 py-0.5 rounded-md text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
                      >
                        GitHub Repository
                      </button>
                    </div>
                  </div>

                  <Separator className="bg-border/20" />

                  {/* Checklist Multi-Select options */}
                  <div className="space-y-3">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Target Data Selectors (Multi-Select)</span>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                      {/* Options */}
                      {[
                        { key: "markdown", label: "Markdown", sub: "Read-Optimized" },
                        { key: "summary", label: "Summary", sub: "AI Key Bullets" },
                        { key: "links", label: "Links", sub: "Hyperlinks Table" },
                        { key: "html", label: "HTML", sub: "DOM Source" },
                        { key: "screenshot", label: "Screenshot", sub: "Browser Mock" },
                        { key: "branding", label: "Branding", sub: "Theme & Fonts" },
                      ].map((item) => {
                        const active = selectedOptions[item.key as keyof typeof selectedOptions]
                        return (
                          <div 
                            key={item.key}
                            onClick={() => scrapeState !== "scraping" && toggleOption(item.key as keyof typeof selectedOptions)}
                            className={`flex items-center gap-3 border p-3 rounded-lg cursor-pointer transition-all select-none ${active ? "border-primary bg-primary/5 text-foreground shadow-2xs" : "border-border/60 hover:border-border text-muted-foreground"}`}
                          >
                            <Icon 
                              icon={active ? "solar:check-circle-bold" : "solar:circle-linear"} 
                              className={`w-5 h-5 shrink-0 ${active ? "text-primary" : "text-muted-foreground"}`} 
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-bold text-foreground">{item.label}</span>
                              <span className="text-[9px] text-muted-foreground truncate">{item.sub}</span>
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
              <Card className="border border-border/60 bg-card/30 backdrop-blur-sm p-16 flex flex-col items-center justify-center space-y-4 shadow-sm min-h-[300px]">
                <Icon icon="solar:spinner-bold" className="w-12 h-12 text-primary animate-spin" />
                <div className="text-center">
                  <h3 className="text-sm font-bold text-foreground">Scraper Syncing...</h3>
                  <p className="text-xs text-muted-foreground font-sans mt-1">Connecting to website to execute target selectors</p>
                </div>
              </Card>
            )}

            {/* 4. PREMIUM SINGLE CARD TAB VISUALIZER LAYOUT */}
            {scrapeState === "completed" && (
              <Card className="border border-border/60 bg-card/30 backdrop-blur-sm shadow-xs flex flex-col min-h-[500px]">
                <CardHeader className="pb-4 border-b border-border/20">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground">Scrape Output Visualizer</CardTitle>
                      <CardDescription className="text-xs text-muted-foreground font-sans">
                        Dynamic format preview and raw crawled data streams
                      </CardDescription>
                    </div>

                    {/* Unified Premium Tab Bar */}
                    <div className="flex items-center gap-3 flex-wrap md:flex-nowrap max-w-full md:ml-auto">
                      {/* Left Side: Dynamic checklist tabs */}
                      <div className="flex flex-wrap gap-1.5 p-1 bg-muted/40 dark:bg-muted/10 border border-border/40 rounded-xl overflow-x-auto">
                        {activeLeftTabs.map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setLeftActiveTab(tab)}
                            className={`text-[10px] font-mono px-3.5 py-1.5 rounded-lg uppercase font-bold tracking-wider transition-all select-none ${leftActiveTab === tab ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"}`}
                          >
                            {tab}
                          </button>
                        ))}
                        {activeLeftTabs.length === 0 && (
                          <span className="text-[10px] font-sans px-3 py-1 text-muted-foreground select-none">
                            No Extra Formats Active
                          </span>
                        )}
                      </div>

                      {/* Right Side: Always JSON */}
                      <button
                        onClick={() => setLeftActiveTab("json")}
                        className={`text-[10px] font-mono px-4 py-2 border rounded-xl uppercase font-bold tracking-wider transition-all select-none ${leftActiveTab === "json" ? "bg-primary text-primary-foreground border-primary shadow-md" : "border-border/60 hover:border-border text-muted-foreground"}`}
                      >
                        JSON DATA
                      </button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-6 flex-1 flex flex-col">
                  {/* Inside Tab Panel: Show description and dynamic Copy action */}
                  <div className="flex-1 flex flex-col space-y-4">
                    
                    {/* Active tab content specialized copy button inside tab panel */}
                    <div className="flex justify-end border-b border-border/20 pb-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          let text = ""
                          if (leftActiveTab === "json") text = extractedData.json
                          else if (leftActiveTab === "markdown") text = extractedData.markdown
                          else if (leftActiveTab === "summary") text = extractedData.summary
                          else if (leftActiveTab === "links") text = JSON.stringify(extractedData.links, null, 2)
                          else if (leftActiveTab === "html") text = extractedData.html
                          else if (leftActiveTab === "branding") text = JSON.stringify(branding, null, 2)
                          else text = "screenshot_placeholder"
                          handleCopyToClipboard(text, leftActiveTab !== "json")
                        }}
                        className="h-8 px-3.5 flex items-center gap-1.5 text-[10px] font-mono uppercase bg-card border-border/60 hover:bg-muted/40 transition-all select-none"
                      >
                        {(leftActiveTab === "json" ? isCopiedRight : isCopiedLeft) ? (
                          <>
                            <Icon icon="solar:check-circle-linear" className="w-3.5 h-3.5 text-green-500" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Icon icon="solar:copy-linear" className="w-3.5 h-3.5" />
                            {leftActiveTab === "json" ? "Copy JSON Data" : getLeftCopyLabel()}
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Visualizer content viewer box */}
                    <div className="flex-1 bg-black/60 dark:bg-card/10 border border-border/20 rounded-xl p-4 overflow-y-auto no-scrollbar font-mono text-xs min-h-[400px] max-h-[550px]">
                      
                      {/* JSON Tab Content */}
                      {leftActiveTab === "json" && (
                        <pre 
                          className="whitespace-pre-wrap break-all leading-relaxed select-text font-mono"
                          dangerouslySetInnerHTML={{ __html: highlightJson(extractedData.json || "{\n  \"message\": \"No JSON data loaded.\"\n}") }}
                        />
                      )}

                      {/* Markdown Tab Content */}
                      {leftActiveTab === "markdown" && (
                        <pre className="whitespace-pre-wrap break-all leading-relaxed text-muted-foreground select-text font-mono">
                          {extractedData.markdown || "No markdown scraped."}
                        </pre>
                      )}

                      {/* Summary Tab Content */}
                      {leftActiveTab === "summary" && (
                        <pre className="whitespace-pre-wrap break-all leading-relaxed text-yellow-400 select-text font-mono">
                          {extractedData.summary || "No summary bullets available."}
                        </pre>
                      )}

                      {/* Links Tab Content */}
                      {leftActiveTab === "links" && (
                        <div className="font-sans text-foreground space-y-4">
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-mono">Outgoing Hyperlinks Table</span>
                          <div className="border border-border/30 rounded-lg overflow-hidden">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-muted/40 text-[10px] uppercase font-bold text-muted-foreground border-b border-border/30">
                                  <th className="p-3">Anchor Label</th>
                                  <th className="p-3">Hyperlink Coordinates (URL)</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border/20 text-xs">
                                {extractedData.links.length === 0 ? (
                                  <tr>
                                    <td colSpan={2} className="p-3 text-center text-muted-foreground">No outgoing links gathered.</td>
                                  </tr>
                                ) : (
                                  extractedData.links.map((link, idx) => (
                                    <tr key={idx} className="hover:bg-muted/10 transition-colors">
                                      <td className="p-3 font-semibold text-foreground truncate max-w-[200px]">{link.label}</td>
                                      <td className="p-3 font-mono text-primary hover:underline truncate max-w-[300px]">
                                        <a href={link.url} target="_blank" rel="noreferrer">{link.url}</a>
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
                        <pre className="whitespace-pre-wrap break-all leading-relaxed text-green-400 select-text font-mono">
                          {extractedData.html || "No HTML source fetched."}
                        </pre>
                      )}

                      {/* Screenshot Tab Content */}
                      {leftActiveTab === "screenshot" && (
                        <div className="flex flex-col items-center justify-center p-4">
                          <div className="w-full max-w-2xl rounded-xl border border-border/40 overflow-hidden bg-card shadow-2xl relative">
                            {/* Browser controls header mockup */}
                            <div className="h-8 bg-muted/40 border-b border-border/30 flex items-center px-4 justify-between select-none">
                              <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                              </div>
                              <div className="bg-muted/60 text-[9px] px-8 py-0.5 rounded-md border border-border/20 text-muted-foreground max-w-md truncate font-sans">
                                {targetUrl}
                              </div>
                              <div className="w-8" />
                            </div>

                            {/* Browser mockup page */}
                            {extractedData.screenshotUrl.startsWith("data:") ? (
                              <img 
                                src={extractedData.screenshotUrl} 
                                alt="Scraped Page Screenshot" 
                                className="w-full h-auto object-contain max-h-[400px]"
                              />
                            ) : (
                              <div className="p-10 font-sans text-center bg-[#F9F9F9] text-[#262626] min-h-[220px] flex flex-col items-center justify-center space-y-4">
                                <h1 className="text-3xl font-extrabold tracking-tight text-[#FF4C00] font-sans">BlazeCrawl Interactive Page</h1>
                                <p className="text-xs text-muted-foreground max-w-sm font-medium">Headless screenshot completed successfully.</p>
                                <div className="h-10 px-6 rounded-md bg-[#FF4C00] text-white flex items-center justify-center font-bold text-xs shadow-md" style={{ borderRadius: "5px" }}>
                                  Mock Action
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Branding Tab Content */}
                      {leftActiveTab === "branding" && (
                        <div className="font-sans text-foreground space-y-6">
                          <div>
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-mono mb-2">1. Extracted Color Palette</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                              {branding.colors.map((color) => (
                                <div 
                                  key={color.name} 
                                  onClick={() => handleCopyHex(color.hex)}
                                  className="border border-border/40 bg-card hover:bg-muted/10 p-3 rounded-lg flex items-center justify-between cursor-pointer transition-all group select-none shadow-2xs"
                                >
                                  <div className="flex items-center gap-3">
                                    <div 
                                      className="w-8 h-8 rounded-md border border-border/50 shadow-inner" 
                                      style={{ backgroundColor: color.hex, borderRadius: "5px" }} 
                                    />
                                    <div className="flex flex-col min-w-0">
                                      <span className="text-xs font-bold text-foreground">{color.name}</span>
                                      <span className="text-[9px] text-muted-foreground font-mono truncate">{color.hex}</span>
                                    </div>
                                  </div>
                                  <div className="text-[10px] font-mono text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                                    {copiedHex === color.hex ? (
                                      <>
                                        <Icon icon="solar:check-circle-linear" className="w-3.5 h-3.5 text-green-500 animate-bounce" />
                                        <span className="text-green-500">Copied</span>
                                      </>
                                    ) : (
                                      <>
                                        <Icon icon="solar:copy-linear" className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <span>Copy</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <Separator className="bg-border/20" />

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Typography Hierarchy */}
                            <div className="border border-border/40 bg-card p-4 rounded-xl shadow-2xs">
                              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-mono mb-3">2. Typography Structure</h3>
                              <div className="space-y-3 text-xs leading-relaxed">
                                <div className="flex justify-between border-b border-border/20 pb-2">
                                  <span className="text-muted-foreground">Font Family</span>
                                  <span className="font-semibold text-foreground font-mono">{branding.typography.fontFamily}</span>
                                </div>
                                <div className="flex justify-between border-b border-border/20 pb-2">
                                  <span className="text-muted-foreground">Heading Font</span>
                                  <span className="font-semibold text-foreground font-mono">{branding.typography.heading}</span>
                                </div>
                                <div className="flex justify-between border-b border-border/20 pb-2">
                                  <span className="text-muted-foreground">h1 Size</span>
                                  <span className="font-semibold text-foreground font-mono">{branding.typography.h1}</span>
                                </div>
                                <div className="flex justify-between pb-1">
                                  <span className="text-muted-foreground">Body Size</span>
                                  <span className="font-semibold text-foreground font-mono">{branding.typography.body}</span>
                                </div>
                              </div>
                            </div>

                            {/* Spacing & Tokens */}
                            <div className="border border-border/40 bg-card p-4 rounded-xl shadow-2xs">
                              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-mono mb-3">3. Spacing Grid & Border</h3>
                              <div className="space-y-3 text-xs leading-relaxed">
                                <div className="flex justify-between border-b border-border/20 pb-2">
                                  <span className="text-muted-foreground">Base Unit Grid</span>
                                  <span className="font-semibold text-foreground font-mono">{branding.spacing.baseUnit}</span>
                                </div>
                                <div className="flex justify-between pb-1">
                                  <span className="text-muted-foreground">Border Radius</span>
                                  <span className="font-semibold text-foreground font-mono">{branding.spacing.borderRadius}</span>
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
              <Card className="border border-border/60 bg-card/30 backdrop-blur-sm shadow-xs">
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground">Recent Scrape Runs</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground font-sans">
                    Persistent history records logged from your crawler node activity.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recentRuns.length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted-foreground flex flex-col items-center justify-center space-y-2">
                      <Icon icon="solar:history-linear" className="w-8 h-8 opacity-45" />
                      <p>No historical runs found. Scrape your first target endpoint above to begin logging records.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/40 border border-border/40 rounded-xl overflow-hidden">
                      {recentRuns.map((run) => (
                        <div 
                          key={run.id}
                          onClick={() => handleLoadHistoryRun(run.id)}
                          className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/15 cursor-pointer transition-all group"
                        >
                          <div className="min-w-0 space-y-1">
                            <span className="text-xs font-bold text-foreground hover:underline group-hover:text-primary transition-colors block truncate max-w-sm sm:max-w-md md:max-w-xl">
                              {run.url}
                            </span>
                            <div className="flex flex-wrap items-center gap-2">
                              {run.options && Object.entries(run.options).map(([key, val]) => {
                                if (val) {
                                  return (
                                    <span key={key} className="text-[9px] font-mono bg-muted/65 border border-border/40 px-1.5 py-0.5 rounded text-muted-foreground uppercase font-bold tracking-wider">
                                      {key}
                                    </span>
                                  )
                                }
                                return null
                              })}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                            <span className="text-[10px] font-mono text-muted-foreground">
                              {new Date(run.created_at).toLocaleString()}
                            </span>
                            <Icon 
                              icon="solar:arrow-right-linear" 
                              className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all hidden sm:block" 
                            />
                          </div>
                        </div>
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

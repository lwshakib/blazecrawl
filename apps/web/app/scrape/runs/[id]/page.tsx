"use client"

import { useEffect, useState } from "react"
import { Icon } from "@iconify/react"
import { useTheme } from "next-themes"
import { useParams, useRouter } from "next/navigation"
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
  const html = json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

  return html.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = "text-blue-700 dark:text-blue-400"
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = "text-purple-700 dark:text-purple-400 font-bold"
        } else {
          cls = "text-emerald-700 dark:text-emerald-400"
        }
      } else if (/true|false/.test(match)) {
        cls = "text-orange-600 dark:text-orange-400 font-semibold"
      } else if (/null/.test(match)) {
        cls = "text-red-600 dark:text-red-400 italic"
      }
      return `<span class="${cls}">${match}</span>`
    }
  )
}

export default function RunDetailsPage() {
  const { resolvedTheme, setTheme } = useTheme()
  const { id } = useParams()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [runUrl, setRunUrl] = useState("")
  const [createdAt, setCreatedAt] = useState("")
  const [leftActiveTab, setLeftActiveTab] = useState("json")
  const [selectedOptions, setSelectedOptions] = useState({
    markdown: false,
    summary: false,
    links: false,
    html: false,
    screenshot: false,
    branding: false,
  })

  const [isCopiedLeft, setIsCopiedLeft] = useState(false)
  const [isCopiedRight, setIsCopiedRight] = useState(false)
  const [copiedHex, setCopiedHex] = useState<string | null>(null)

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

  useEffect(() => {
    setMounted(true)
    if (id) {
      loadRunDetails()
    }
  }, [id])

  const loadRunDetails = async () => {
    setLoading(true)
    try {
      // First fetch to get the run config/metadata
      const listRes = await fetch("/api/scrape/runs")
      let metadata: any = null
      if (listRes.ok) {
        const listData = await listRes.json()
        const allRuns = listData.data || []
        metadata = allRuns.find((r: any) => r.id === id)
      }

      const res = await fetch(`/api/scrape/runs/${id}`)
      if (!res.ok) throw new Error("Failed to load run details")
      const data = await res.json()
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

      if (metadata) {
        setRunUrl(metadata.url)
        setCreatedAt(metadata.created_at)
        if (metadata.options) {
          setSelectedOptions(metadata.options)
          const activeLeftTabs = getLeftActiveTabs(metadata.options)
          const firstTab = activeLeftTabs[0]
          if (firstTab) {
            setLeftActiveTab(firstTab)
          } else {
            setLeftActiveTab("json")
          }
        }
      } else {
        setRunUrl(payload.url || "Target Endpoint")
        setCreatedAt(payload.meta?.timestamp || "")
        setLeftActiveTab("json")
      }
    } catch (err) {
      console.error(err)
      alert("Error loading run details.")
      router.push("/scrape/runs")
    } finally {
      setLoading(false)
    }
  }

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

  const handleLogout = () => {
    document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;"
    window.location.href = "/login"
  }

  if (!mounted) return null

  const activeLeftTabs = getLeftActiveTabs(selectedOptions)
  const branding = extractedData.branding || brandOutput

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
        <AppSidebar handleLogout={handleLogout} />

        <SidebarInset className="flex min-h-screen flex-1 flex-col bg-background">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border/40 bg-card/40 px-6 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-muted/60" />
              <Separator
                orientation="vertical"
                className="!h-4 h-4 !self-center bg-border/40"
              />
              <span className="text-sm font-semibold tracking-tight text-foreground">
                Run Details
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
            {loading ? (
              <div className="flex flex-1 flex-col items-center justify-center space-y-4 p-16">
                <Icon
                  icon="solar:spinner-bold"
                  className="h-12 w-12 animate-spin text-primary"
                />
                <p className="text-xs text-muted-foreground">
                  Retrieving dataset details...
                </p>
              </div>
            ) : (
              <>
                <Card className="flex flex-col items-center justify-between gap-4 rounded-xl border border-border/60 bg-card/30 p-4 backdrop-blur-sm sm:flex-row">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                      <Icon icon="solar:document-linear" className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="max-w-xs truncate text-sm font-bold text-foreground sm:max-w-md md:max-w-xl">
                        {runUrl}
                      </h2>
                      <p className="mt-0.5 font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                        {createdAt
                          ? `Crawled on: ${new Date(createdAt).toLocaleString()}`
                          : "Persistent Scrape Run"}
                      </p>
                    </div>
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-9 shrink-0 border-border/60 font-semibold hover:bg-muted/30"
                  >
                    <Link href="/scrape/runs">
                      <Icon
                        icon="solar:arrow-left-linear"
                        className="mr-2 h-4 w-4"
                      />
                      Back to History
                    </Link>
                  </Button>
                </Card>

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

                      <div className="flex max-w-full flex-wrap items-center gap-3 md:ml-auto md:flex-nowrap">
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
                    <div className="flex flex-1 flex-col space-y-4">
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
                              text = JSON.stringify(
                                extractedData.links,
                                null,
                                2
                              )
                            else if (leftActiveTab === "html")
                              text = extractedData.html
                            else if (leftActiveTab === "branding")
                              text = JSON.stringify(branding, null, 2)
                            else text = "screenshot_placeholder"
                            handleCopyToClipboard(
                              text,
                              leftActiveTab !== "json"
                            )
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

                      <div className="no-scrollbar max-h-[550px] min-h-[400px] flex-1 overflow-y-auto rounded-xl border border-border/20 bg-muted/40 p-4 font-mono text-xs text-slate-800 dark:bg-black/40 dark:text-slate-200">
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

                        {leftActiveTab === "markdown" && (
                          <pre className="font-mono leading-relaxed break-all whitespace-pre-wrap text-slate-700 select-text dark:text-slate-300">
                            {extractedData.markdown || "No markdown scraped."}
                          </pre>
                        )}

                        {leftActiveTab === "summary" && (
                          <pre className="font-mono leading-relaxed break-all whitespace-pre-wrap text-amber-700 select-text dark:text-amber-300">
                            {extractedData.summary ||
                              "No summary bullets available."}
                          </pre>
                        )}

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

                        {leftActiveTab === "html" && (
                          <pre className="font-mono leading-relaxed break-all whitespace-pre-wrap text-emerald-700 select-text dark:text-emerald-400">
                            {extractedData.html || "No HTML source fetched."}
                          </pre>
                        )}

                        {leftActiveTab === "screenshot" && (
                          <div className="flex flex-col items-center justify-center p-4">
                            <div className="relative w-full max-w-2xl overflow-hidden rounded-xl border border-border/40 bg-card shadow-2xl">
                              <div className="flex h-8 items-center justify-between border-b border-border/30 bg-muted/40 px-4 select-none">
                                <div className="flex gap-1.5">
                                  <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                                  <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                                </div>
                                <div className="max-w-md truncate rounded-md border border-border/20 bg-muted/60 px-8 py-0.5 font-sans text-[9px] text-muted-foreground">
                                  {runUrl}
                                </div>
                                <div className="w-8" />
                              </div>

                              {extractedData.screenshotUrl.startsWith(
                                "data:"
                              ) ? (
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
              </>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

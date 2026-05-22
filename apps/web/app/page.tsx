"use client"

import { useEffect, useState } from "react"
import { gsap } from "gsap"
import { Icon } from "@iconify/react"
import { Logo } from "@/components/Logo"
import { useTheme } from "next-themes"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workspace/ui/components/card"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@workspace/ui/components/accordion"
import { Input } from "@workspace/ui/components/input"

export default function Page() {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // --- GSAP Entrance Animations ---
    gsap.set("#top-accent", { opacity: 0, y: -10 })
    gsap.set("#title-text", { opacity: 0, y: 15 })
    gsap.set("#hero-desc", { opacity: 0, y: 15 })
    gsap.set("#hero-buttons", { opacity: 0, y: 15 })
    gsap.set("#hero-preview", { opacity: 0, y: 20 })

    const tl = gsap.timeline({
      defaults: { ease: "power2.out", duration: 0.6 },
    })

    tl.to("#top-accent", { opacity: 1, y: 0 })
      .to("#title-text", { opacity: 1, y: 0 }, "-=0.4")
      .to("#hero-desc", { opacity: 1, y: 0 }, "-=0.4")
      .to("#hero-buttons", { opacity: 1, y: 0 }, "-=0.4")
      .to("#hero-preview", { opacity: 1, y: 0, duration: 0.8 }, "-=0.4")

    // --- Intersection Observer for Scroll Reveals ---
    const observerOptions = {
      threshold: 0.05,
      rootMargin: "0px 0px -50px 0px",
    }

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active")
          revealObserver.unobserve(entry.target)
        }
      })
    }, observerOptions)

    document.querySelectorAll(".reveal").forEach((el) => {
      revealObserver.observe(el)
    })

    return () => {
      revealObserver.disconnect()
    }
  }, [])

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background font-sans text-foreground selection:bg-foreground selection:text-background">
      <style jsx global>{`
        .reveal {
          opacity: 0;
          transform: translateY(15px);
          transition:
            opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1),
            transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: opacity, transform;
        }
        .reveal.active {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      {/* Clean Minimal Background Gradients */}
      <div className="fixed inset-0 z-0 bg-background" />
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-50 dark:opacity-80"
        style={{
          background:
            resolvedTheme === "dark"
              ? "radial-gradient(circle at top, rgba(255,255,255,0.03) 0%, transparent 60%)"
              : "radial-gradient(circle at top, rgba(0,0,0,0.015) 0%, transparent 60%)",
        }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 right-0 left-0 z-[40] border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <Logo className="h-6 w-6 text-foreground" />
            <span className="font-sans text-lg font-semibold tracking-tight text-foreground">
              BlazeCrawl
            </span>
          </div>

          <div className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a
              href="#features"
              className="font-sans font-medium transition-colors hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#developers"
              className="font-sans font-medium transition-colors hover:text-foreground"
            >
              Developers
            </a>
            <a
              href="#faq"
              className="font-sans font-medium transition-colors hover:text-foreground"
            >
              FAQ
            </a>
            <a
              href="#docs"
              className="font-sans font-medium transition-colors hover:text-foreground"
            >
              Docs
            </a>
          </div>

          <div className="flex items-center gap-4">
            {/* Open Source GitHub Icon Link */}
            <a
              href="https://github.com/lwshakib/blazecrawl"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
              title="GitHub Repository (Open Source)"
            >
              <Icon icon="mdi:github" className="h-5 w-5" />
            </a>

            {mounted && (
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
            )}

            <a
              href="/login"
              className="hidden font-sans text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              Login
            </a>

            <Button
              asChild
              variant="default"
              className="font-sans text-sm font-medium"
            >
              <a href="/login">Get Started</a>
            </Button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-32" id="main-content">
        {/* Hero Section */}
        <section className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-16 px-6 pt-16 pb-24 lg:flex-row">
          <div className="flex w-full flex-col items-start lg:w-1/2">
            <div className="mb-6 flex flex-col items-start" id="top-accent">
              <Badge
                variant="secondary"
                className="rounded-full px-3 py-1 font-mono text-[10px] tracking-wider uppercase"
              >
                Open Source Protocol
              </Badge>
            </div>

            <h1
              className="mb-6 font-sans text-5xl leading-[1.1] font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl"
              id="title-text"
            >
              High-performance
              <br />
              web scraping.
            </h1>

            <p
              className="mb-10 max-w-lg font-sans text-base leading-relaxed text-muted-foreground"
              id="hero-desc"
            >
              BlazeCrawl is a clean, minimal scraping terminal built to extract,
              clean, and synchronize web data into structured Markdown or JSON
              instantly.
            </p>

            <div
              className="flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row"
              id="hero-buttons"
            >
              <Button
                asChild
                className="h-12 w-full px-8 font-sans font-medium sm:w-auto"
              >
                <a href="/login">
                  Start Crawling{" "}
                  <Icon
                    icon="solar:alt-arrow-right-linear"
                    className="ml-2 h-4 w-4"
                  />
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 w-full bg-transparent px-8 font-sans font-medium sm:w-auto"
              >
                <a href="#features">Learn More</a>
              </Button>
            </div>
          </div>

          <div
            className="flex w-full justify-center lg:w-1/2 lg:justify-end"
            id="hero-preview"
          >
            {/* Terminal Card Mockup */}
            <Card className="flex w-full max-w-lg flex-col overflow-hidden rounded-lg border border-border bg-card/60 font-mono text-xs shadow-sm backdrop-blur-sm select-none">
              {/* Window Header */}
              <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-4 py-3">
                <div className="flex gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-border" />
                  <div className="h-2.5 w-2.5 rounded-full bg-border" />
                  <div className="h-2.5 w-2.5 rounded-full bg-border" />
                </div>
                <span className="font-sans text-[10px] font-medium text-muted-foreground">
                  terminal.sh
                </span>
                <div className="w-12" />
              </div>

              {/* Terminal Content */}
              <div className="min-h-[300px] space-y-4 overflow-x-auto p-6 leading-relaxed text-foreground/95">
                <div>
                  <span className="font-medium text-muted-foreground">$</span>{" "}
                  blazecrawl crawl --url{" "}
                  <span className="font-medium text-foreground">
                    "https://example.com/blog"
                  </span>{" "}
                  --format{" "}
                  <span className="font-medium text-foreground">"json"</span>
                </div>

                <div className="text-muted-foreground">
                  &gt; Launching headless crawler cluster... [OK]
                  <br />
                  &gt; Initializing proxy network rotation... [OK]
                  <br />
                  &gt; Intercepting HTTP payload from target domain...
                </div>

                <div className="border-t border-border/40 pt-3 text-[11px]">
                  <span className="text-muted-foreground">{"{"}</span>
                  <br />
                  <div className="pl-4">
                    <span className="text-muted-foreground">"status"</span>:{" "}
                    <span className="font-semibold text-foreground">
                      "active_sync"
                    </span>
                    ,<br />
                    <span className="text-muted-foreground">
                      "integrity"
                    </span>:{" "}
                    <span className="font-semibold text-foreground">
                      "99.9%"
                    </span>
                    ,<br />
                    <span className="text-muted-foreground">
                      "extracted_payload"
                    </span>
                    : <span className="text-muted-foreground">{"["}</span>
                    <br />
                    <div className="pl-4">
                      <span className="text-muted-foreground">{"{"}</span>{" "}
                      <span className="text-muted-foreground">"title"</span>:{" "}
                      <span className="font-medium text-foreground">
                        "BlazeCrawl Release"
                      </span>
                      , <span className="text-muted-foreground">"speed"</span>:{" "}
                      <span className="text-foreground">"1.2s"</span>{" "}
                      <span className="text-muted-foreground">{"}"}</span>,
                      <br />
                      <span className="text-muted-foreground">{"{"}</span>{" "}
                      <span className="text-muted-foreground">"title"</span>:{" "}
                      <span className="font-medium text-foreground">
                        "Scale API Node"
                      </span>
                      , <span className="text-muted-foreground">"speed"</span>:{" "}
                      <span className="text-foreground">"0.8s"</span>{" "}
                      <span className="text-muted-foreground">{"}"}</span>
                    </div>
                    <span className="text-muted-foreground">{"]"}</span>
                  </div>
                  <span className="text-muted-foreground">{"}"}</span>
                </div>

                <div className="flex items-center gap-2 pt-2 text-[10px] text-muted-foreground">
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-foreground" />
                  <span>Success: Payload synchronized to nodes</span>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y border-border bg-muted/30 py-16">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-6 text-center md:grid-cols-3">
            <div className="reveal">
              <p className="mb-1 font-sans text-3xl font-bold text-foreground">
                12.5M+
              </p>
              <p className="font-sans text-xs tracking-wider text-muted-foreground uppercase">
                Pages Scraped
              </p>
            </div>
            <div className="reveal flex items-center justify-center gap-6 font-sans text-sm font-medium text-muted-foreground">
              <span>Fast</span>
              <span className="h-1.5 w-1.5 rounded-full bg-border" />
              <span>Scalable</span>
              <span className="h-1.5 w-1.5 rounded-full bg-border" />
              <span>Secure</span>
            </div>
            <div className="reveal">
              <p className="mb-1 font-sans text-3xl font-bold text-foreground">
                500TB+
              </p>
              <p className="font-sans text-xs tracking-wider text-muted-foreground uppercase">
                Data Extracted
              </p>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section className="mx-auto max-w-7xl px-6 py-32" id="features">
          <div className="reveal mb-16 max-w-xl">
            <div className="mb-3 font-sans text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Features
            </div>
            <h2 className="font-sans text-3xl leading-tight font-bold text-foreground sm:text-4xl">
              Clean, high-performance capabilities
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Feature 1 */}
            <Card className="reveal flex h-[280px] flex-col justify-between rounded-lg border border-border bg-card/40 p-8 transition-all duration-300 hover:border-foreground/20 hover:shadow-sm">
              <div>
                <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background">
                  <Icon
                    icon="solar:document-linear"
                    className="h-5 w-5 text-foreground"
                  />
                </div>
                <h3 className="mb-2 font-sans text-lg font-bold text-foreground">
                  Smart Extraction
                </h3>
                <p className="font-sans text-sm leading-relaxed text-muted-foreground">
                  Generate optimized Markdown, summaries, links lists, or
                  formatted JSON structures from any target site automatically.
                </p>
              </div>
            </Card>

            {/* Feature 2 */}
            <Card className="reveal flex h-[280px] flex-col justify-between rounded-lg border border-border bg-card/40 p-8 transition-all duration-300 hover:border-foreground/20 hover:shadow-sm">
              <div>
                <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background">
                  <Icon
                    icon="solar:transfer-vertical-linear"
                    className="h-5 w-5 text-foreground"
                  />
                </div>
                <h3 className="mb-2 font-sans text-lg font-bold text-foreground">
                  Real-Time Sync
                </h3>
                <p className="font-sans text-sm leading-relaxed text-muted-foreground">
                  Distribute heavy crawling loads across multi-region server
                  arrays with native, near-instant synchronization pipelines.
                </p>
              </div>
            </Card>

            {/* Feature 3 */}
            <Card className="reveal flex h-[280px] flex-col justify-between rounded-lg border border-border bg-card/40 p-8 transition-all duration-300 hover:border-foreground/20 hover:shadow-sm">
              <div>
                <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background">
                  <Icon
                    icon="solar:shield-keyhole-linear"
                    className="h-5 w-5 text-foreground"
                  />
                </div>
                <h3 className="mb-2 font-sans text-lg font-bold text-foreground">
                  Stealth Access
                </h3>
                <p className="font-sans text-sm leading-relaxed text-muted-foreground">
                  Automatic proxy rotations, fingerprint randomization, and
                  header spoofing to bypass modern web scrap barrier systems.
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* Access Key Section */}
        <section className="mx-auto max-w-7xl px-6 py-16" id="developers">
          <Card className="flex flex-col items-center gap-16 rounded-xl border border-border bg-card/40 p-8 shadow-sm md:p-16 lg:flex-row">
            <div className="reveal relative z-10 flex w-full flex-col items-start lg:w-1/2">
              <div className="mb-4 font-sans text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Developer Access
              </div>
              <h2 className="mb-6 font-sans text-3xl leading-tight font-bold text-foreground sm:text-4xl">
                API Authorization Key
              </h2>
              <p className="mb-8 max-w-md text-sm leading-relaxed text-muted-foreground">
                Deploy and integrate with standard HTTP protocols. Standardize
                your crawling flows with direct authorization, secure
                signatures, and live dashboard monitoring.
              </p>
              <Button
                asChild
                variant="outline"
                className="bg-transparent font-sans font-medium"
              >
                <a href="/login">
                  Get Key{" "}
                  <Icon
                    icon="solar:arrow-right-linear"
                    className="ml-2 h-4 w-4"
                  />
                </a>
              </Button>
            </div>

            <div className="reveal relative z-10 flex w-full justify-center lg:w-1/2 lg:justify-end">
              <div className="relative flex h-[400px] w-[300px] flex-col justify-between overflow-hidden rounded-lg border border-border bg-card p-8 text-foreground shadow-sm">
                <div className="flex items-start justify-between border-b border-border/60 pb-4">
                  <span className="font-mono text-[10px] tracking-wider text-muted-foreground">
                    Access Key
                    <br />
                    ID: BC-9952
                  </span>
                  <Icon
                    icon="solar:rss-linear"
                    className="h-4 w-4 rotate-90 text-foreground"
                  />
                </div>
                <div>
                  <h3 className="font-sans text-3xl font-bold tracking-tight text-foreground">
                    Blaze
                  </h3>
                  <div className="mt-6 border-l-2 border-foreground pl-4">
                    <p className="font-mono text-[9px] tracking-wider text-muted-foreground uppercase">
                      Authorization Level
                    </p>
                    <p className="mt-0.5 font-mono text-xs font-bold tracking-wider text-foreground">
                      Admin_Access
                    </p>
                  </div>
                </div>
                <div className="flex items-end justify-between border-t border-border/60 pt-4">
                  <span className="font-sans text-xs font-semibold text-foreground">
                    BlazeCrawl
                  </span>
                  <div className="h-4 w-4 rounded-sm border border-border bg-muted/40" />
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* FAQ Section */}
        <section className="mx-auto max-w-4xl px-6 py-24" id="faq">
          <div className="reveal mb-16 text-center">
            <div className="mb-3 font-sans text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              FAQ
            </div>
            <h2 className="font-sans text-2xl font-bold text-foreground sm:text-3xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="reveal mx-auto max-w-3xl rounded-lg border border-border bg-card/40 p-8">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem
                value="item-1"
                className="border-b border-border/40 py-2"
              >
                <AccordionTrigger className="py-4 text-left font-sans text-sm font-semibold transition-colors hover:text-foreground">
                  Which export formats are supported?
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 font-sans text-sm leading-relaxed text-muted-foreground">
                  BlazeCrawl supports formatted Markdown, structured JSON
                  structures, direct link lists, full screenshots, summary
                  statistics, and clean raw HTML templates.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem
                value="item-2"
                className="border-b border-border/40 py-2"
              >
                <AccordionTrigger className="py-4 text-left font-sans text-sm font-semibold transition-colors hover:text-foreground">
                  How does the system bypass scrap blocks?
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 font-sans text-sm leading-relaxed text-muted-foreground">
                  We implement proxy rotation, dynamic fingerprint
                  randomization, realistic navigation modeling, and custom
                  headers to bypass modern CAPTCHA and blocker networks.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border-b-0 py-2">
                <AccordionTrigger className="py-4 text-left font-sans text-sm font-semibold transition-colors hover:text-foreground">
                  Is there standard API access for developers?
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 font-sans text-sm leading-relaxed text-muted-foreground">
                  Yes, developers can integrate via clean REST API interfaces.
                  Complete keys, endpoints, and OpenAPI schemas are provided on
                  the dashboard.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* Node Junctions Section */}
        <section className="border-t border-border bg-muted/20 py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="reveal mb-16 flex flex-col items-center text-center">
              <div className="mb-3 font-sans text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Global Grid
              </div>
              <h2 className="mb-4 font-sans text-3xl font-bold text-foreground">
                Node Network Status
              </h2>
              <p className="max-w-lg font-sans text-sm leading-relaxed text-muted-foreground">
                Active distributed routing arrays ensuring low-latency crawls
                and data sync operations globally.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {[
                {
                  name: "Tokyo Terminal",
                  desc: "Main Asian routing hub. Maintains proxy arrays and cache databases locally.",
                  icon: "solar:server-linear",
                  integrity: "99.9%",
                },
                {
                  name: "Frankfurt Hub",
                  desc: "Central European data parsing. Optimizes structure mapping processes.",
                  icon: "solar:cpu-linear",
                  integrity: "99.4%",
                },
                {
                  name: "NA East Uplink",
                  desc: "North American routing node. Direct synchronization channel to cloud databases.",
                  icon: "solar:globus-linear",
                  integrity: "99.7%",
                },
              ].map((terminal, i) => (
                <Card
                  key={i}
                  className="reveal flex h-[300px] flex-col justify-between rounded-lg border border-border bg-card/40 p-8 transition-all duration-300 hover:border-foreground/20 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background text-foreground">
                      <Icon icon={terminal.icon} className="h-5 w-5" />
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1">
                      <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-foreground" />
                      <span className="font-mono text-[9px] font-bold tracking-wider text-muted-foreground uppercase">
                        Online
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-2 font-sans text-lg font-bold text-foreground">
                      {terminal.name}
                    </h3>
                    <p className="font-sans text-xs leading-relaxed text-muted-foreground">
                      {terminal.desc}
                    </p>
                  </div>

                  <div className="mt-4 space-y-2 border-t border-border/40 pt-4">
                    <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                      <span>Sync Integrity</span>
                      <span className="font-semibold text-foreground">
                        {terminal.integrity}
                      </span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-foreground"
                        style={{ width: terminal.integrity }}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-border py-24 text-center">
          <div className="mx-auto max-w-xl px-6">
            <h2 className="reveal mb-6 font-sans text-3xl font-bold text-foreground">
              Start crawling instantly
            </h2>
            <p className="reveal mb-10 font-sans text-sm leading-relaxed text-muted-foreground">
              Enter target endpoint coordinates to test. No authentication
              required for baseline diagnostic operations.
            </p>
            <div className="reveal mx-auto w-full max-w-md">
              <div className="flex items-center rounded-lg border border-border bg-card p-1.5 pl-3 shadow-sm transition-all focus-within:ring-1 focus-within:ring-foreground">
                <Input
                  type="text"
                  placeholder="Enter target URL..."
                  className="h-10 flex-1 border-none bg-transparent p-0 font-sans text-sm text-foreground placeholder-muted-foreground outline-none focus-visible:border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button className="h-10 rounded-md px-6 font-sans text-xs font-semibold">
                  Execute
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border bg-background pt-20 pb-12">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-16 grid grid-cols-2 gap-8 md:grid-cols-5 md:gap-12">
              {/* Brand Column */}
              <div className="col-span-2 flex flex-col items-start gap-4">
                <div className="flex items-center gap-2">
                  <Logo className="h-6 w-6 text-foreground" />
                  <span className="font-sans text-lg font-semibold tracking-tight text-foreground">
                    BlazeCrawl
                  </span>
                </div>
                <p className="max-w-xs font-sans text-sm leading-relaxed text-muted-foreground">
                  High-performance web scraping and distributed data
                  synchronization architectures built for the modern developer.
                </p>
                <div className="mt-2 flex gap-2.5">
                  <a
                    href="https://github.com/lwshakib/blazecrawl"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
                    title="GitHub"
                  >
                    <Icon icon="mdi:github" className="h-4 w-4" />
                  </a>
                  <a
                    href="#"
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
                    title="Twitter"
                  >
                    <Icon icon="mdi:twitter" className="h-4 w-4" />
                  </a>
                  <a
                    href="#"
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
                    title="Discord"
                  >
                    <Icon icon="mdi:discord" className="h-4 w-4" />
                  </a>
                  <a
                    href="#"
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
                    title="LinkedIn"
                  >
                    <Icon icon="mdi:linkedin" className="h-4 w-4" />
                  </a>
                </div>
              </div>

              {/* Column 1: Product */}
              <div className="flex flex-col gap-4">
                <h4 className="font-sans text-xs font-bold tracking-wider text-foreground uppercase">
                  Product
                </h4>
                <ul className="flex flex-col gap-2.5 text-sm">
                  <li>
                    <a
                      href="#"
                      className="font-sans font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Features
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="font-sans font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Developer Tools
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="font-sans font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="font-sans font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Documentation
                    </a>
                  </li>
                </ul>
              </div>

              {/* Column 2: Resources */}
              <div className="flex flex-col gap-4">
                <h4 className="font-sans text-xs font-bold tracking-wider text-foreground uppercase">
                  Resources
                </h4>
                <ul className="flex flex-col gap-2.5 text-sm">
                  <li>
                    <a
                      href="#"
                      className="font-sans font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      API Status
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="font-sans font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      System Reports
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="font-sans font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Node Junctions
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="font-sans font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Blog
                    </a>
                  </li>
                </ul>
              </div>

              {/* Column 3: Developers */}
              <div className="flex flex-col gap-4">
                <h4 className="font-sans text-xs font-bold tracking-wider text-foreground uppercase">
                  Developers
                </h4>
                <ul className="flex flex-col gap-2.5 text-sm">
                  <li>
                    <a
                      href="https://github.com/lwshakib/blazecrawl"
                      className="font-sans font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      GitHub Repo
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="font-sans font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      OpenAPI Schema
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="font-sans font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      SDKs
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="font-sans font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Support
                    </a>
                  </li>
                </ul>
              </div>

              {/* Column 4: Company */}
              <div className="flex flex-col gap-4">
                <h4 className="font-sans text-xs font-bold tracking-wider text-foreground uppercase">
                  Company
                </h4>
                <ul className="flex flex-col gap-2.5 text-sm">
                  <li>
                    <a
                      href="#"
                      className="font-sans font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      About Us
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="font-sans font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="font-sans font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Terms of Service
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="font-sans font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Comms
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between border-t border-border/60 pt-8 font-sans text-xs text-muted-foreground md:flex-row">
              <p>
                &copy; {new Date().getFullYear()} BlazeCrawl. All rights
                reserved.
              </p>
              <div className="mt-4 flex gap-6 md:mt-0">
                <a
                  href="#"
                  className="font-medium transition-colors hover:text-foreground"
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="font-medium transition-colors hover:text-foreground"
                >
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

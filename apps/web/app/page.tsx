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

    const tl = gsap.timeline({ defaults: { ease: "power2.out", duration: 0.6 } })

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
    <div className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background relative overflow-x-hidden font-sans">
      <style jsx global>{`
        .reveal {
          opacity: 0;
          transform: translateY(15px);
          transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1),
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
      <div className="fixed inset-0 z-0 pointer-events-none opacity-50 dark:opacity-80" 
           style={{
             background: resolvedTheme === "dark" 
               ? "radial-gradient(circle at top, rgba(255,255,255,0.03) 0%, transparent 60%)"
               : "radial-gradient(circle at top, rgba(0,0,0,0.015) 0%, transparent 60%)"
           }} 
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[40] bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo className="w-6 h-6 text-foreground" />
            <span className="text-lg font-semibold text-foreground tracking-tight font-sans">BlazeCrawl</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors font-sans font-medium">Features</a>
            <a href="#developers" className="hover:text-foreground transition-colors font-sans font-medium">Developers</a>
            <a href="#faq" className="hover:text-foreground transition-colors font-sans font-medium">FAQ</a>
            <a href="#docs" className="hover:text-foreground transition-colors font-sans font-medium">Docs</a>
          </div>

          <div className="flex items-center gap-4">
            {/* Open Source GitHub Icon Link */}
            <a
              href="https://github.com/lwshakib/blazecrawl"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors p-2 flex items-center justify-center rounded-md hover:bg-muted/40"
              title="GitHub Repository (Open Source)"
            >
              <Icon icon="mdi:github" className="w-5 h-5" />
            </a>

            {mounted && (
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
            )}

            <a href="/login" className="text-sm font-medium hover:text-foreground text-muted-foreground transition-colors font-sans hidden sm:block">Login</a>
            
            <Button asChild variant="default" className="text-sm font-medium font-sans">
              <a href="/login">
                Get Started
              </a>
            </Button>
          </div>
        </div>
      </nav>

      <main className="pt-32 relative z-10" id="main-content">
        {/* Hero Section */}
        <section className="flex flex-col lg:flex-row max-w-7xl mx-auto px-6 items-center justify-center gap-16 pt-16 pb-24">
          <div className="lg:w-1/2 flex flex-col items-start w-full">
            <div className="flex flex-col items-start mb-6" id="top-accent">
              <Badge variant="secondary" className="font-mono text-[10px] tracking-wider px-3 py-1 rounded-full uppercase">
                Open Source Protocol
              </Badge>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl leading-[1.1] mb-6 text-foreground font-bold font-sans tracking-tight" id="title-text">
              High-performance<br />web scraping.
            </h1>

            <p className="leading-relaxed text-base max-w-lg mb-10 text-muted-foreground font-sans" id="hero-desc">
              BlazeCrawl is a clean, minimal scraping terminal built to extract, clean, and synchronize web data into structured Markdown or JSON instantly.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto" id="hero-buttons">
              <Button asChild className="w-full sm:w-auto h-12 px-8 font-medium font-sans">
                <a href="/login">
                  Start Crawling <Icon icon="solar:alt-arrow-right-linear" className="w-4 h-4 ml-2" />
                </a>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto h-12 px-8 font-medium font-sans bg-transparent">
                <a href="#features">
                  Learn More
                </a>
              </Button>
            </div>
          </div>

          <div className="lg:w-1/2 w-full flex justify-center lg:justify-end" id="hero-preview">
            {/* Terminal Card Mockup */}
            <Card className="w-full max-w-lg border border-border bg-card/60 backdrop-blur-sm shadow-sm rounded-lg overflow-hidden flex flex-col font-mono text-xs select-none">
              {/* Window Header */}
              <div className="bg-muted/40 px-4 py-3 border-b border-border/60 flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-border" />
                  <div className="w-2.5 h-2.5 rounded-full bg-border" />
                  <div className="w-2.5 h-2.5 rounded-full bg-border" />
                </div>
                <span className="text-[10px] text-muted-foreground font-sans font-medium">terminal.sh</span>
                <div className="w-12" />
              </div>
              
              {/* Terminal Content */}
              <div className="p-6 space-y-4 text-foreground/95 leading-relaxed overflow-x-auto min-h-[300px]">
                <div>
                  <span className="text-muted-foreground font-medium">$</span> blazecrawl crawl --url <span className="text-foreground font-medium">"https://example.com/blog"</span> --format <span className="text-foreground font-medium">"json"</span>
                </div>
                
                <div className="text-muted-foreground">
                  &gt; Launching headless crawler cluster... [OK]<br />
                  &gt; Initializing proxy network rotation... [OK]<br />
                  &gt; Intercepting HTTP payload from target domain...
                </div>

                <div className="border-t border-border/40 pt-3 text-[11px]">
                  <span className="text-muted-foreground">{"{"}</span><br />
                  <div className="pl-4">
                    <span className="text-muted-foreground">"status"</span>: <span className="text-foreground font-semibold">"active_sync"</span>,<br />
                    <span className="text-muted-foreground">"integrity"</span>: <span className="text-foreground font-semibold">"99.9%"</span>,<br />
                    <span className="text-muted-foreground">"extracted_payload"</span>: <span className="text-muted-foreground">{"["}</span><br />
                    <div className="pl-4">
                      <span className="text-muted-foreground">{"{"}</span> <span className="text-muted-foreground">"title"</span>: <span className="text-foreground font-medium">"BlazeCrawl Release"</span>, <span className="text-muted-foreground">"speed"</span>: <span className="text-foreground">"1.2s"</span> <span className="text-muted-foreground">{"}"}</span>,<br />
                      <span className="text-muted-foreground">{"{"}</span> <span className="text-muted-foreground">"title"</span>: <span className="text-foreground font-medium">"Scale API Node"</span>, <span className="text-muted-foreground">"speed"</span>: <span className="text-foreground">"0.8s"</span> <span className="text-muted-foreground">{"}"}</span>
                    </div>
                    <span className="text-muted-foreground">{"]"}</span>
                  </div>
                  <span className="text-muted-foreground">{"}"}</span>
                </div>

                <div className="flex items-center gap-2 pt-2 text-[10px] text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-foreground animate-pulse" />
                  <span>Success: Payload synchronized to nodes</span>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-muted/30 border-y border-border py-16">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center">
            <div className="reveal">
              <p className="text-3xl font-bold font-sans text-foreground mb-1">12.5M+</p>
              <p className="text-xs text-muted-foreground font-sans uppercase tracking-wider">Pages Scraped</p>
            </div>
            <div className="reveal flex justify-center gap-6 items-center text-muted-foreground text-sm font-sans font-medium">
              <span>Fast</span>
              <span className="w-1.5 h-1.5 rounded-full bg-border" />
              <span>Scalable</span>
              <span className="w-1.5 h-1.5 rounded-full bg-border" />
              <span>Secure</span>
            </div>
            <div className="reveal">
              <p className="text-3xl font-bold font-sans text-foreground mb-1">500TB+</p>
              <p className="text-xs text-muted-foreground font-sans uppercase tracking-wider">Data Extracted</p>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section className="max-w-7xl mx-auto px-6 py-32" id="features">
          <div className="reveal mb-16 max-w-xl">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 font-sans">Features</div>
            <h2 className="text-3xl sm:text-4xl leading-tight font-sans font-bold text-foreground">Clean, high-performance capabilities</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <Card className="p-8 border border-border bg-card/40 hover:border-foreground/20 hover:shadow-sm transition-all duration-300 rounded-lg reveal flex flex-col justify-between h-[280px]">
              <div>
                <div className="w-10 h-10 border border-border flex items-center justify-center bg-background rounded-md mb-6">
                  <Icon icon="solar:document-linear" className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground font-sans mb-2">Smart Extraction</h3>
                <p className="text-sm text-muted-foreground font-sans leading-relaxed">
                  Generate optimized Markdown, summaries, links lists, or formatted JSON structures from any target site automatically.
                </p>
              </div>
            </Card>

            {/* Feature 2 */}
            <Card className="p-8 border border-border bg-card/40 hover:border-foreground/20 hover:shadow-sm transition-all duration-300 rounded-lg reveal flex flex-col justify-between h-[280px]">
              <div>
                <div className="w-10 h-10 border border-border flex items-center justify-center bg-background rounded-md mb-6">
                  <Icon icon="solar:transfer-vertical-linear" className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground font-sans mb-2">Real-Time Sync</h3>
                <p className="text-sm text-muted-foreground font-sans leading-relaxed">
                  Distribute heavy crawling loads across multi-region server arrays with native, near-instant synchronization pipelines.
                </p>
              </div>
            </Card>

            {/* Feature 3 */}
            <Card className="p-8 border border-border bg-card/40 hover:border-foreground/20 hover:shadow-sm transition-all duration-300 rounded-lg reveal flex flex-col justify-between h-[280px]">
              <div>
                <div className="w-10 h-10 border border-border flex items-center justify-center bg-background rounded-md mb-6">
                  <Icon icon="solar:shield-keyhole-linear" className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground font-sans mb-2">Stealth Access</h3>
                <p className="text-sm text-muted-foreground font-sans leading-relaxed">
                  Automatic proxy rotations, fingerprint randomization, and header spoofing to bypass modern web scrap barrier systems.
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* Access Key Section */}
        <section className="max-w-7xl mx-auto px-6 py-16" id="developers">
          <Card className="p-8 md:p-16 flex flex-col lg:flex-row items-center gap-16 bg-card/40 border border-border shadow-sm rounded-xl">
            <div className="reveal w-full lg:w-1/2 relative z-10 flex flex-col items-start">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4 font-sans">Developer Access</div>
              <h2 className="text-3xl sm:text-4xl mb-6 leading-tight text-foreground font-sans font-bold">API Authorization Key</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-md">
                Deploy and integrate with standard HTTP protocols. Standardize your crawling flows with direct authorization, secure signatures, and live dashboard monitoring.
              </p>
              <Button asChild variant="outline" className="font-sans font-medium bg-transparent">
                <a href="/login">
                  Get Key <Icon icon="solar:arrow-right-linear" className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>
            
            <div className="reveal w-full lg:w-1/2 flex justify-center lg:justify-end relative z-10">
              <div className="w-[300px] h-[400px] bg-card border border-border p-8 relative overflow-hidden shadow-sm rounded-lg flex flex-col justify-between text-foreground">
                <div className="flex justify-between items-start border-b border-border/60 pb-4">
                  <span className="text-[10px] font-mono tracking-wider text-muted-foreground">Access Key<br />ID: BC-9952</span>
                  <Icon icon="solar:rss-linear" className="w-4 h-4 text-foreground rotate-90" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-foreground font-sans tracking-tight">Blaze</h3>
                  <div className="mt-6 border-l-2 border-foreground pl-4">
                    <p className="text-[9px] font-mono tracking-wider text-muted-foreground uppercase">Authorization Level</p>
                    <p className="text-xs font-mono text-foreground font-bold tracking-wider mt-0.5">Admin_Access</p>
                  </div>
                </div>
                <div className="flex justify-between items-end border-t border-border/60 pt-4">
                  <span className="text-foreground font-semibold text-xs font-sans">BlazeCrawl</span>
                  <div className="w-4 h-4 border border-border bg-muted/40 rounded-sm" />
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto px-6 py-24" id="faq">
          <div className="reveal text-center mb-16">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 font-sans">FAQ</div>
            <h2 className="text-2xl sm:text-3xl text-foreground font-sans font-bold">Frequently Asked Questions</h2>
          </div>
          
          <div className="reveal max-w-3xl mx-auto border border-border bg-card/40 p-8 rounded-lg">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-b border-border/40 py-2">
                <AccordionTrigger className="text-left text-sm font-sans font-semibold hover:text-foreground transition-colors py-4">
                  Which export formats are supported?
                </AccordionTrigger>
                <AccordionContent className="text-sm font-sans text-muted-foreground pt-2 pb-4 leading-relaxed">
                  BlazeCrawl supports formatted Markdown, structured JSON structures, direct link lists, full screenshots, summary statistics, and clean raw HTML templates.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border-b border-border/40 py-2">
                <AccordionTrigger className="text-left text-sm font-sans font-semibold hover:text-foreground transition-colors py-4">
                  How does the system bypass scrap blocks?
                </AccordionTrigger>
                <AccordionContent className="text-sm font-sans text-muted-foreground pt-2 pb-4 leading-relaxed">
                  We implement proxy rotation, dynamic fingerprint randomization, realistic navigation modeling, and custom headers to bypass modern CAPTCHA and blocker networks.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border-b-0 py-2">
                <AccordionTrigger className="text-left text-sm font-sans font-semibold hover:text-foreground transition-colors py-4">
                  Is there standard API access for developers?
                </AccordionTrigger>
                <AccordionContent className="text-sm font-sans text-muted-foreground pt-2 pb-4 leading-relaxed">
                  Yes, developers can integrate via clean REST API interfaces. Complete keys, endpoints, and OpenAPI schemas are provided on the dashboard.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* Node Junctions Section */}
        <section className="py-24 border-t border-border bg-muted/20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="reveal flex flex-col items-center text-center mb-16">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 font-sans">Global Grid</div>
              <h2 className="text-3xl text-foreground font-sans font-bold mb-4">Node Network Status</h2>
              <p className="text-sm text-muted-foreground max-w-lg leading-relaxed font-sans">
                Active distributed routing arrays ensuring low-latency crawls and data sync operations globally.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: "Tokyo Terminal", desc: "Main Asian routing hub. Maintains proxy arrays and cache databases locally.", icon: "solar:server-linear", integrity: "99.9%" },
                { name: "Frankfurt Hub", desc: "Central European data parsing. Optimizes structure mapping processes.", icon: "solar:cpu-linear", integrity: "99.4%" },
                { name: "NA East Uplink", desc: "North American routing node. Direct synchronization channel to cloud databases.", icon: "solar:globus-linear", integrity: "99.7%" }
              ].map((terminal, i) => (
                <Card key={i} className="reveal p-8 bg-card/40 border border-border hover:border-foreground/20 hover:shadow-sm transition-all duration-300 rounded-lg flex flex-col justify-between h-[300px]">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 border border-border flex items-center justify-center bg-background text-foreground rounded-md">
                      <Icon icon={terminal.icon} className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-full border border-border">
                      <div className="w-1.5 h-1.5 rounded-full bg-foreground animate-pulse" />
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Online</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-foreground font-sans mb-2">{terminal.name}</h3>
                    <p className="text-xs text-muted-foreground font-sans leading-relaxed">{terminal.desc}</p>
                  </div>
                  
                  <div className="space-y-2 border-t border-border/40 pt-4 mt-4">
                    <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground">
                      <span>Sync Integrity</span>
                      <span className="text-foreground font-semibold">{terminal.integrity}</span>
                    </div>
                    <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-foreground" style={{ width: terminal.integrity }} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 text-center border-t border-border">
          <div className="max-w-xl mx-auto px-6">
            <h2 className="reveal text-3xl font-sans font-bold text-foreground mb-6">Start crawling instantly</h2>
            <p className="reveal text-sm text-muted-foreground font-sans mb-10 leading-relaxed">
              Enter target endpoint coordinates to test. No authentication required for baseline diagnostic operations.
            </p>
            <div className="reveal w-full max-w-md mx-auto">
              <div className="flex items-center bg-card border border-border p-1.5 pl-3 focus-within:ring-1 focus-within:ring-foreground transition-all shadow-sm rounded-lg">
                <Input 
                  type="text" 
                  placeholder="Enter target URL..." 
                  className="bg-transparent border-none outline-none flex-1 text-sm text-foreground placeholder-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-none p-0 h-10 font-sans" 
                />
                <Button className="h-10 px-6 text-xs font-semibold rounded-md font-sans">
                  Execute
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border pt-20 pb-12 bg-background">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-12 mb-16">
              {/* Brand Column */}
              <div className="col-span-2 flex flex-col items-start gap-4">
                <div className="flex items-center gap-2">
                  <Logo className="w-6 h-6 text-foreground" />
                  <span className="text-lg font-semibold text-foreground font-sans tracking-tight">BlazeCrawl</span>
                </div>
                <p className="text-sm text-muted-foreground max-w-xs font-sans leading-relaxed">
                  High-performance web scraping and distributed data synchronization architectures built for the modern developer.
                </p>
                <div className="flex gap-2.5 mt-2">
                  <a
                    href="https://github.com/lwshakib/blazecrawl"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 border border-border hover:bg-muted/40 hover:text-foreground flex items-center justify-center text-muted-foreground transition-colors rounded-md"
                    title="GitHub"
                  >
                    <Icon icon="mdi:github" className="w-4 h-4" />
                  </a>
                  <a
                    href="#"
                    className="w-9 h-9 border border-border hover:bg-muted/40 hover:text-foreground flex items-center justify-center text-muted-foreground transition-colors rounded-md"
                    title="Twitter"
                  >
                    <Icon icon="mdi:twitter" className="w-4 h-4" />
                  </a>
                  <a
                    href="#"
                    className="w-9 h-9 border border-border hover:bg-muted/40 hover:text-foreground flex items-center justify-center text-muted-foreground transition-colors rounded-md"
                    title="Discord"
                  >
                    <Icon icon="mdi:discord" className="w-4 h-4" />
                  </a>
                  <a
                    href="#"
                    className="w-9 h-9 border border-border hover:bg-muted/40 hover:text-foreground flex items-center justify-center text-muted-foreground transition-colors rounded-md"
                    title="LinkedIn"
                  >
                    <Icon icon="mdi:linkedin" className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Column 1: Product */}
              <div className="flex flex-col gap-4">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider font-sans">Product</h4>
                <ul className="flex flex-col gap-2.5 text-sm">
                  <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors font-sans font-medium">Features</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors font-sans font-medium">Developer Tools</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors font-sans font-medium">Pricing</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors font-sans font-medium">Documentation</a></li>
                </ul>
              </div>

              {/* Column 2: Resources */}
              <div className="flex flex-col gap-4">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider font-sans">Resources</h4>
                <ul className="flex flex-col gap-2.5 text-sm">
                  <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors font-sans font-medium">API Status</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors font-sans font-medium">System Reports</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors font-sans font-medium">Node Junctions</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors font-sans font-medium">Blog</a></li>
                </ul>
              </div>

              {/* Column 3: Developers */}
              <div className="flex flex-col gap-4">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider font-sans">Developers</h4>
                <ul className="flex flex-col gap-2.5 text-sm">
                  <li><a href="https://github.com/lwshakib/blazecrawl" className="text-muted-foreground hover:text-foreground transition-colors font-sans font-medium">GitHub Repo</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors font-sans font-medium">OpenAPI Schema</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors font-sans font-medium">SDKs</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors font-sans font-medium">Support</a></li>
                </ul>
              </div>

              {/* Column 4: Company */}
              <div className="flex flex-col gap-4">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider font-sans">Company</h4>
                <ul className="flex flex-col gap-2.5 text-sm">
                  <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors font-sans font-medium">About Us</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors font-sans font-medium">Privacy Policy</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors font-sans font-medium">Terms of Service</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors font-sans font-medium">Comms</a></li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border/60 text-xs text-muted-foreground font-sans">
              <p>&copy; {new Date().getFullYear()} BlazeCrawl. All rights reserved.</p>
              <div className="flex gap-6 mt-4 md:mt-0">
                <a href="#" className="hover:text-foreground transition-colors font-medium">Privacy Policy</a>
                <a href="#" className="hover:text-foreground transition-colors font-medium">Terms of Service</a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

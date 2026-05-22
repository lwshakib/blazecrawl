import { Router } from "express"
import { browserPool } from "../utils/browserPool.js"
import redis from "../db/redis.js"
import logger from "../logger/winston.logger.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { authMiddleware } from "../middlewares/auth.middleware.js"
import { pool } from "../db/pg.js"

const router: Router = Router()

/**
 * Heuristically generates a text summary from the parsed markdown.
 */
const generateSummary = (markdownText: string): string => {
  const sentences = markdownText
    .split(/[.!\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25 && !s.startsWith("#") && !s.startsWith("*"))

  const bullets: string[] = []
  if (sentences.length > 0) {
    const unique = Array.from(new Set(sentences))
    for (let i = 0; i < Math.min(4, unique.length); i++) {
      bullets.push(`*   **Key Detail**: ${unique[i]}`)
    }
  } else {
    bullets.push(
      "*   **Analysis**: Unable to locate text elements of high density."
    )
  }
  return `### AI Summary\n` + bullets.join("\n")
}

// POST endpoint to handle page scraping
router.post("/", authMiddleware, async (req, res) => {
  const { url, options } = req.body

  if (!url) {
    return res.status(400).json(new ApiResponse(400, null, "URL is required"))
  }

  const activeOptions = {
    markdown: !!options?.markdown,
    summary: !!options?.summary,
    links: !!options?.links,
    html: !!options?.html,
    screenshot: !!options?.screenshot,
    branding: !!options?.branding,
  }

  // Generate a unique base64 cache key based on the active options and target URL
  const optionsKey = Buffer.from(JSON.stringify(activeOptions)).toString(
    "base64"
  )
  const cacheKey = `scrape:${url}:${optionsKey}`

  try {
    // 1. Check Redis Cache
    const cachedData = await redis.get(cacheKey)
    if (cachedData) {
      logger.info(`[Scraper] Cache hit for URL: ${url}`)
      return res.status(200).json(JSON.parse(cachedData))
    }

    logger.info(`[Scraper] Cache miss. Initiating scrape for: ${url}`)
    const startTime = Date.now()
    const { context, page } = await browserPool.getPage()

    try {
      // 2. Load the page via scraper
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 })

      const html = await page.content()
      const title = await page.title()

      const result: Record<string, any> = {
        status: "success",
        url,
        meta: {
          title,
          engine: "Web Scraper",
          durationMs: 0,
          ipAddress: "127.0.0.1",
          timestamp: new Date().toISOString(),
        },
      }

      // Base JSON structure
      const json: Record<string, any> = {
        title,
        url,
        scrapedAt: new Date().toISOString(),
        contentLength: html.length,
      }

      let markdown = ""

      // 3. Extract Markdown and/or Summary
      if (activeOptions.markdown || activeOptions.summary) {
        markdown = await page.evaluate(() => {
          const body =
            document.querySelector("body") || document.documentElement
          const walk = (node: Node): string => {
            if (node.nodeType === Node.TEXT_NODE) {
              return node.textContent || ""
            }
            if (node.nodeType !== Node.ELEMENT_NODE) {
              return ""
            }
            const el = node as Element
            const tagName = el.tagName.toLowerCase()

            // Skip common non-content boilerplate elements
            if (
              [
                "script",
                "style",
                "noscript",
                "iframe",
                "nav",
                "footer",
                "header",
              ].includes(tagName)
            ) {
              return ""
            }

            let childrenText = ""
            for (const child of Array.from(node.childNodes)) {
              childrenText += walk(child)
            }

            if (tagName === "h1") return `\n# ${childrenText.trim()}\n`
            if (tagName === "h2") return `\n## ${childrenText.trim()}\n`
            if (tagName === "h3") return `\n### ${childrenText.trim()}\n`
            if (tagName === "p") return `\n${childrenText.trim()}\n`
            if (tagName === "li") return `\n* ${childrenText.trim()}`

            return childrenText
          }
          return walk(body)
            .replace(/\n{3,}/g, "\n\n")
            .trim()
        })

        if (activeOptions.markdown) {
          result.markdown = markdown
          json.markdownSummary = markdown.substring(0, 500) + "..."
        }
      }

      // 4. Generate AI Summary bullets
      if (activeOptions.summary) {
        const summary = generateSummary(markdown)
        result.summary = summary
        json.summaryBullets = summary
          .split("\n")
          .filter((s) => s.startsWith("*"))
          .map((s) => s.replace(/^\*\s+/, ""))
      }

      // 5. Extract Hyperlinks
      if (activeOptions.links) {
        const links = await page.evaluate(() => {
          const anchors = Array.from(document.querySelectorAll("a"))
          return anchors
            .map((a) => ({
              label: a.innerText.trim(),
              url: a.href,
            }))
            .filter((link) => link.label && link.url.startsWith("http"))
            .slice(0, 50)
        })
        result.links = links
        json.linksCount = links.length
        json.links = links
      }

      // 6. Return raw HTML
      if (activeOptions.html) {
        result.html = html
      }

      // 7. Capture Page Screenshot as base64 URI
      if (activeOptions.screenshot) {
        const buffer = await page.screenshot({ type: "png" })
        result.screenshotUrl = `data:image/png;base64,${buffer.toString("base64")}`
      }

      // 8. Analyze Branding computed styles
      if (activeOptions.branding) {
        const branding = await page.evaluate(() => {
          const rgbToHex = (rgb: string) => {
            const match = rgb.match(
              /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/
            )
            if (!match) return null
            const r = parseInt(match[1] || "0")
            const g = parseInt(match[2] || "0")
            const b = parseInt(match[3] || "0")
            const hex =
              "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
            return hex.toUpperCase()
          }

          // Traverse top DOM elements to extract colors
          const colors = new Set<string>()
          const elements = Array.from(document.querySelectorAll("*"))
          for (const el of elements.slice(0, 300)) {
            const style = window.getComputedStyle(el)
            const bg = rgbToHex(style.backgroundColor)
            const fg = rgbToHex(style.color)
            if (
              bg &&
              bg !== "#FFFFFF" &&
              bg !== "#000000" &&
              bg !== "#TRANSPARENT"
            )
              colors.add(bg)
            if (fg && fg !== "#FFFFFF" && fg !== "#000000") colors.add(fg)
          }

          const colorArr = Array.from(colors).slice(0, 6)
          const primary = colorArr[0] || "#FF4C00"
          const secondary = colorArr[1] || "#E56565"
          const accent = colorArr[2] || primary
          const background = colorArr[3] || "#F9F9F9"
          const textPrimary = colorArr[4] || "#262626"
          const linkColor = colorArr[5] || primary

          const h1El = document.querySelector("h1")
          const bodyEl = document.querySelector("body")
          const h1Style = h1El ? window.getComputedStyle(h1El) : null
          const bodyStyle = bodyEl ? window.getComputedStyle(bodyEl) : null

          return {
            colors: [
              { name: "Primary", hex: primary, desc: "Detected Accent Color" },
              { name: "Secondary", hex: secondary, desc: "Detected Highlight" },
              { name: "Accent", hex: accent, desc: "Accent Element" },
              { name: "Background", hex: background, desc: "Backing Tint" },
              {
                name: "Text Primary",
                hex: textPrimary,
                desc: "Body Text Shade",
              },
              {
                name: "Link Color",
                hex: linkColor,
                desc: "Anchor Element Tint",
              },
            ],
            typography: {
              fontFamily: bodyStyle
                ? (bodyStyle.fontFamily.split(",")[0] ?? "sans-serif").replace(
                    /['"]/g,
                    ""
                  )
                : "sans-serif",
              heading: h1Style
                ? (h1Style.fontFamily.split(",")[0] ?? "sans-serif").replace(
                    /['"]/g,
                    ""
                  )
                : "sans-serif",
              h1: h1Style ? h1Style.fontSize : "60px",
              h2: "52px",
              body: bodyStyle ? bodyStyle.fontSize : "16px",
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
        })
        result.branding = branding
        json.brandingColors = branding.colors.map((c) => c.hex)
      }

      result.json = json
      result.meta.durationMs = Date.now() - startTime

      // Save scrape details to the scrape_runs history database
      try {
        const user = (req as any).user
        if (user && user.email) {
          await pool.query(
            "INSERT INTO scrape_runs (user_email, url, options, result) VALUES ($1, $2, $3, $4)",
            [
              user.email,
              url,
              JSON.stringify(activeOptions),
              JSON.stringify(result),
            ]
          )
          logger.info(`[Scraper] Saved scrape run for ${user.email} -> ${url}`)
        }
      } catch (dbErr: any) {
        logger.error(`[Scraper] Failed to save run history: ${dbErr.message}`)
      }

      // Cache the result for 1 hour
      await redis.set(cacheKey, JSON.stringify(result), "EX", 3600)

      return res.status(200).json(result)
    } finally {
      // Release browser context memory
      await context.close()
    }
  } catch (err: any) {
    logger.error(`[Scraper] Error scraping ${url}: ${err.message}`)
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          null,
          err.message || "Failed to execute scrape operation"
        )
      )
  }
})

// GET endpoint to retrieve list of recent runs for the current user
router.get("/runs", authMiddleware, async (req, res) => {
  const user = (req as any).user
  if (!user || !user.email) {
    return res.status(401).json(new ApiResponse(401, null, "Unauthorized"))
  }

  try {
    const limit = parseInt(req.query.limit as string) || 10
    const offset = parseInt(req.query.offset as string) || 0
    const result = await pool.query(
      "SELECT id, url, options, created_at FROM scrape_runs WHERE user_email = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
      [user.email, limit, offset]
    )
    return res
      .status(200)
      .json(
        new ApiResponse(200, result.rows, "Scrape runs retrieved successfully")
      )
  } catch (err: any) {
    logger.error(`[Scraper] Error fetching runs: ${err.message}`)
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Failed to retrieve recent runs"))
  }
})

// GET endpoint to retrieve a specific historical run
router.get("/runs/:id", authMiddleware, async (req, res) => {
  const user = (req as any).user
  const { id } = req.params

  if (!user || !user.email) {
    return res.status(401).json(new ApiResponse(401, null, "Unauthorized"))
  }

  try {
    const result = await pool.query(
      "SELECT * FROM scrape_runs WHERE id = $1 AND user_email = $2",
      [id, user.email]
    )

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Scrape run not found"))
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result.rows[0].result,
          "Scrape run retrieved successfully"
        )
      )
  } catch (err: any) {
    logger.error(
      `[Scraper] Error fetching run details for ID ${id}: ${err.message}`
    )
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Failed to retrieve scrape run details"))
  }
})

export default router

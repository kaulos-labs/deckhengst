import { NextResponse } from "next/server";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import path from "path";
import fs from "fs/promises";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// For local dev, use local Chrome
async function getBrowser() {
  if (process.env.NODE_ENV === "development") {
    // Try common Chrome paths for local dev
    const possiblePaths = [
      "/usr/bin/google-chrome",
      "/usr/bin/chromium-browser",
      "/usr/bin/chromium",
      process.env.CHROME_PATH,
    ].filter(Boolean) as string[];

    for (const execPath of possiblePaths) {
      try {
        await fs.access(execPath);
        return puppeteer.launch({
          executablePath: execPath,
          headless: true,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
      } catch {
        continue;
      }
    }
    throw new Error("No Chrome found for local dev");
  }

  // Production: use @sparticuz/chromium
  chromium.setHeadlessMode = true;
  chromium.setGraphicsMode = false;
  
  return puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 1920, height: 1080 },
    executablePath: await chromium.executablePath(),
    headless: true,
  });
}

export async function GET(request: Request, { params }: RouteParams) {
  const { slug } = await params;
  const decksDir = path.join(process.cwd(), "decks");
  const filePath = path.join(decksDir, `${slug}.html`);

  try {
    await fs.access(filePath);
  } catch {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 });
  }

  try {
    const browser = await getBrowser();
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Read HTML content and load it directly
    const htmlContent = await fs.readFile(filePath, "utf-8");
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    // Wait for fonts
    await page.evaluateHandle("document.fonts.ready");
    await new Promise((r) => setTimeout(r, 500));

    const pdfBuffer = await page.pdf({
      width: "1920px",
      height: "1080px",
      printBackground: true,
      preferCSSPageSize: true,
    });

    await browser.close();

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${slug}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "PDF generation failed", details: String(error) },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import path from "path";
import { getDeckContent } from "@/lib/decks";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { slug } = await params;
  const content = await getDeckContent(slug);

  if (!content) {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 });
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Load HTML directly
    const decksDir = path.join(process.cwd(), "decks");
    const filePath = path.join(decksDir, `${slug}.html`);
    await page.goto(`file://${filePath}`, { waitUntil: "networkidle0" });

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
      { error: "PDF generation failed" },
      { status: 500 }
    );
  }
}

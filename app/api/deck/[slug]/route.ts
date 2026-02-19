import { NextResponse } from "next/server";
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

  // Inject scroll behavior CSS to hide scrollbars and disable scroll
  const modifiedContent = content.replace(
    "</head>",
    `<style>
      html, body { 
        overflow: hidden !important; 
        margin: 0 !important; 
        padding: 0 !important;
      }
      .slide {
        scroll-snap-align: start;
      }
    </style>
    </head>`
  );

  return new NextResponse(modifiedContent, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}

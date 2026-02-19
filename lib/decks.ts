import fs from "fs/promises";
import path from "path";

const DECKS_DIR = path.join(process.cwd(), "decks");

export interface Deck {
  slug: string;
  title: string;
  path: string;
}

export async function getDecks(): Promise<Deck[]> {
  try {
    const files = await fs.readdir(DECKS_DIR);
    const htmlFiles = files.filter((f) => f.endsWith(".html"));

    const decks = await Promise.all(
      htmlFiles.map(async (file) => {
        const slug = file.replace(".html", "");
        const filePath = path.join(DECKS_DIR, file);
        const content = await fs.readFile(filePath, "utf-8");

        // Extract title from HTML
        const titleMatch = content.match(/<title>(.*?)<\/title>/i);
        const title = titleMatch ? titleMatch[1] : slug;

        return {
          slug,
          title,
          path: filePath,
        };
      })
    );

    return decks.sort((a, b) => a.title.localeCompare(b.title));
  } catch {
    return [];
  }
}

export async function getDeck(slug: string): Promise<Deck | null> {
  const filePath = path.join(DECKS_DIR, `${slug}.html`);

  try {
    const content = await fs.readFile(filePath, "utf-8");
    const titleMatch = content.match(/<title>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : slug;

    return { slug, title, path: filePath };
  } catch {
    return null;
  }
}

export async function getDeckContent(slug: string): Promise<string | null> {
  const filePath = path.join(DECKS_DIR, `${slug}.html`);

  try {
    return await fs.readFile(filePath, "utf-8");
  } catch {
    return null;
  }
}

export function countSlides(html: string): number {
  const matches = html.match(/<div[^>]*class="[^"]*slide[^"]*"[^>]*>/gi);
  return matches ? matches.length : 1;
}

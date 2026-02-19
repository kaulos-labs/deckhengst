import Link from "next/link";
import { getDecks } from "@/lib/decks";

export default async function HomePage() {
  const decks = await getDecks();

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-2">🐴 Deckhengst</h1>
          <p className="text-[var(--muted)]">CSS slide decks with style</p>
        </header>

        {decks.length === 0 ? (
          <div className="text-center py-16 text-[var(--muted)]">
            <p className="text-lg mb-4">No decks yet</p>
            <p className="text-sm">
              Add HTML files to the <code className="px-2 py-1 bg-[var(--primary-soft)] rounded">decks/</code> folder
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {decks.map((deck) => (
              <Link
                key={deck.slug}
                href={`/${deck.slug}`}
                className="block p-6 bg-[var(--card)] border border-[var(--border)] rounded-2xl hover:border-[var(--primary)] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">{deck.title}</h2>
                    <p className="text-sm text-[var(--muted)]">{deck.slug}.html</p>
                  </div>
                  <div className="text-[var(--muted)]">→</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

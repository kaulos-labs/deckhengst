import { notFound } from "next/navigation";
import { getDeck, getDeckContent, countSlides } from "@/lib/decks";
import { DeckViewer } from "@/components/deck-viewer";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DeckPage({ params }: PageProps) {
  const { slug } = await params;
  const deck = await getDeck(slug);

  if (!deck) {
    notFound();
  }

  const content = await getDeckContent(slug);
  if (!content) {
    notFound();
  }

  const slideCount = countSlides(content);

  return <DeckViewer slug={slug} title={deck.title} slideCount={slideCount} />;
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

interface DeckViewerProps {
  slug: string;
  title: string;
  slideCount: number;
}

export function DeckViewer({ slug, title, slideCount }: DeckViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [scale, setScale] = useState(1);
  const [exporting, setExporting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Calculate scale to fit viewport
  const updateScale = useCallback(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    const scaleX = clientWidth / 1920;
    const scaleY = clientHeight / 1080;
    
    // On mobile (portrait), fit to width; on desktop, contain
    const isMobile = clientWidth < clientHeight;
    if (isMobile) {
      setScale(scaleX * 0.98);
    } else {
      setScale(Math.min(scaleX, scaleY) * 0.95);
    }
  }, []);

  useEffect(() => {
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [updateScale]);

  // Scroll to slide in iframe
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    const scrollToSlide = () => {
      const doc = iframe.contentDocument;
      if (!doc) return;

      const slides = doc.querySelectorAll(".slide");
      const targetSlide = slides[currentSlide - 1];
      if (targetSlide) {
        targetSlide.scrollIntoView({ behavior: "instant" });
      }
    };

    // Wait for iframe to load
    iframe.onload = scrollToSlide;
    scrollToSlide();
  }, [currentSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        setCurrentSlide((s) => Math.min(s + 1, slideCount));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentSlide((s) => Math.max(s - 1, 1));
      } else if (e.key === "Home") {
        e.preventDefault();
        setCurrentSlide(1);
      } else if (e.key === "End") {
        e.preventDefault();
        setCurrentSlide(slideCount);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [slideCount]);

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const res = await fetch(`/api/pdf/${slug}`);
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slug}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("PDF export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="deck-container" ref={containerRef}>
      <div
        className="deck-wrapper"
        style={{ transform: `scale(${scale})` }}
      >
        <iframe
          ref={iframeRef}
          src={`/api/deck/${slug}?slide=${currentSlide}`}
          title={title}
        />
      </div>

      <div className="deck-controls">
        <Link href="/" className="text-white/70 hover:text-white text-sm">
          ← Back
        </Link>

        <div className="w-px h-6 bg-white/20" />

        <button
          onClick={() => setCurrentSlide((s) => Math.max(s - 1, 1))}
          disabled={currentSlide === 1}
        >
          ←
        </button>

        <span className="slide-counter">
          {currentSlide} / {slideCount}
        </span>

        <button
          onClick={() => setCurrentSlide((s) => Math.min(s + 1, slideCount))}
          disabled={currentSlide === slideCount}
        >
          →
        </button>

        <div className="w-px h-6 bg-white/20" />

        <button
          onClick={handleExportPDF}
          disabled={exporting}
          className="pdf-btn"
        >
          {exporting ? "Exporting..." : "📄 PDF"}
        </button>
      </div>
    </div>
  );
}

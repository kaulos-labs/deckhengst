# 🐴 Deckhengst

CSS slide decks with password protection + PDF export.

## Features

- **Password protected** — Set `DECK_PASSWORD` env var
- **CSS-based slides** — Drop HTML files in `decks/` folder
- **Keyboard navigation** — Arrow keys, space, home/end
- **PDF export** — One-click export via Puppeteer
- **Responsive viewer** — Auto-scales to fit any screen

## Getting Started

```bash
# Install dependencies
bun install

# Set password (optional)
cp .env.example .env.local
# Edit .env.local and set DECK_PASSWORD

# Run dev server
bun dev
```

## Adding Decks

1. Create an HTML file with your slides
2. Use `class="slide"` for each slide div
3. Drop it in the `decks/` folder
4. Refresh the app

### Slide Structure

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Deck</title>
  <style>
    .slide {
      width: 1920px;
      height: 1080px;
      page-break-after: always;
    }
  </style>
</head>
<body>
  <div class="slide">Slide 1</div>
  <div class="slide">Slide 2</div>
  <div class="slide">Slide 3</div>
</body>
</html>
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DECK_PASSWORD` | Password to access decks | (none - public) |

## Tech Stack

- Next.js 16
- Bun
- Tailwind CSS v4
- Puppeteer (PDF export)

## Deployment

Deploy to Vercel, set `DECK_PASSWORD` in environment variables.

---

Made by [kaulos-labs](https://github.com/kaulos-labs)

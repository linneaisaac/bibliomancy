# Bibliomancy

A [Claude Code](https://claude.com/claude-code) skill for drawing random Bible verses from the King James Version for divination or reflection.

## Usage

In Claude Code, run:

```
/bibliomancy
```

You'll be prompted with four choices:

### Mode
- **Random verse** — draw a fresh random verse
- **Verse of the day** — get a deterministic daily verse (same all day, changes tomorrow)

### Section
- **Whole Bible** — all 66 books
- **Old Testament** — the 39 OT books
- **New Testament** — the 27 NT books
- **Specific book** — name a book (e.g., Isaiah, Psalm, Proverbs)
- **Common group** — a named cluster like `gospels`, `torah`, `wisdom`, `pauline`, `historical`, or `prophets`
- **Multiple books** — comma-separated list (e.g., `"Isaiah,Jeremiah"`)
- **Range of books** — two books joined by a hyphen, spanning all books between them in canonical order (e.g., `"Isaiah-Amos"`)

### Keyword filter
- **No filter** — draw from all matching verses
- **Filter by keyword** — only draw from verses containing a specific word (e.g., "love", "faith", "mercy")

Keyword search matches whole words only, so searching for "ice" won't match "novice".

### Reading style
- **Single verse (Traditional)** — draw one verse
- **Past, Present, Future** — three-verse temporal spread
- **Thesis, Antithesis, Synthesis** — three-verse dialectical spread
- **Warning, Counsel, Promise** — three-verse guidance spread
- **Head, Heart, Hands** — three-verse reflection spread

Spreads draw multiple unique verses, each labeled with its position in the reading.

## CLI usage

You can also run the tool directly:

```bash
# Random verse from the whole Bible
bun run bibliomancy.ts all

# Verse of the day from the Gospels
bun run bibliomancy.ts gospels --daily

# Random verse containing "love" from the NT
bun run bibliomancy.ts nt --search "love"

# Past/Present/Future spread from the whole Bible
bun run bibliomancy.ts all --spread past-present-future

# Combine filters: wisdom books, keyword "fear", guidance spread
bun run bibliomancy.ts wisdom --search "fear" --spread warning-counsel-promise

# List all available books and clusters
bun run bibliomancy.ts books
```

## Credits

Built by [Linnea Isaac](https://github.com/linneaisaac) and Claude (Opus 4.6).

KJV text courtesy of [BibleProtector.com](https://www.bibleprotector.com) (Pure Cambridge Edition).

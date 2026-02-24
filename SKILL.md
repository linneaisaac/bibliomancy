---
name: bibliomancy
description: Draw a random Bible verse (KJV) for divination or reflection
user-invocable: true
allowed-tools: Bash, AskUserQuestion
---

When the user invokes this skill, use AskUserQuestion to ask them two things:

**First question — Mode:**
- **Random verse** — draw a random verse (default)
- **Verse of the day** — get today's deterministic daily verse (same all day, changes tomorrow)

**Second question — Section:**
- **Whole Bible** — draw from all 66 books
- **Old Testament** — draw from the 39 OT books only
- **New Testament** — draw from the 27 NT books only
- **Specific book** — let them name a book (e.g., Isaiah, Psalm, Proverbs, Revelation)
- **Common group** — draw from a named cluster (gospels, torah/pentateuch, pauline, wisdom, historical, prophets)
- **Multiple books** — draw from several specific books (e.g., Isaiah and Jeremiah)
- **Range of books** — draw from a consecutive range in canonical order (e.g., Isaiah through Amos)

**Third question — Keyword filter (optional):**
- **No filter** — draw from all matching verses
- **Filter by keyword** — only draw from verses containing a specific word or phrase (e.g., "love", "faith", "fear")

If the user chooses to filter by keyword, ask them for the keyword with a free-text response.

**Fourth question — Reading style:**
- **Single verse (Traditional)** — draw one verse (default)
- **Past, Present, Future** — three-verse temporal spread
- **Thesis, Antithesis, Synthesis** — three-verse dialectical spread
- **Warning, Counsel, Promise** — three-verse guidance spread
- **Head, Heart, Hands** — three-verse reflection spread

Ask ALL FOUR questions in a SINGLE AskUserQuestion call so the user sees every option on one screen. If a spread is selected, ignore "Verse of the day" mode (spreads are inherently random multi-draw). If the user chose "Specific book", "Common group", "Multiple books", "Range of books", or "Filter by keyword", follow up with a second AskUserQuestion to collect the details (book name, group, keyword, etc.).

Based on their answers, run the appropriate command. If the user chose "Verse of the day", append `--daily` to the command.

- Whole Bible: `~/.bun/bin/bun run '/home/lalwen/Dropbox/Linnea Dropbox/Coding/bibliomancy/bibliomancy.ts' all`
- Old Testament: `~/.bun/bin/bun run '/home/lalwen/Dropbox/Linnea Dropbox/Coding/bibliomancy/bibliomancy.ts' ot`
- New Testament: `~/.bun/bin/bun run '/home/lalwen/Dropbox/Linnea Dropbox/Coding/bibliomancy/bibliomancy.ts' nt`
- Specific book: `~/.bun/bin/bun run '/home/lalwen/Dropbox/Linnea Dropbox/Coding/bibliomancy/bibliomancy.ts' "Book Name"`
- Common group: ask which group they want (gospels, torah, pentateuch, pauline, wisdom, historical, prophets), then run: `~/.bun/bin/bun run '/home/lalwen/Dropbox/Linnea Dropbox/Coding/bibliomancy/bibliomancy.ts' "groupname"`
- Multiple books: ask which books they want, then pass them comma-separated: `~/.bun/bin/bun run '/home/lalwen/Dropbox/Linnea Dropbox/Coding/bibliomancy/bibliomancy.ts' "Isaiah,Jeremiah"`
- Range of books: ask for the start and end books, then pass them with a hyphen: `~/.bun/bin/bun run '/home/lalwen/Dropbox/Linnea Dropbox/Coding/bibliomancy/bibliomancy.ts' "Isaiah-Amos"`

For "Verse of the day", add `--daily` at the end of any command above, e.g.:
`~/.bun/bin/bun run '/home/lalwen/Dropbox/Linnea Dropbox/Coding/bibliomancy/bibliomancy.ts' gospels --daily`

For keyword filtering, add `--search "keyword"` to any command, e.g.:
`~/.bun/bin/bun run '/home/lalwen/Dropbox/Linnea Dropbox/Coding/bibliomancy/bibliomancy.ts' all --search "love"`
`~/.bun/bin/bun run '/home/lalwen/Dropbox/Linnea Dropbox/Coding/bibliomancy/bibliomancy.ts' gospels --search "faith" --daily`

For spreads, add `--spread <name>` to the command, e.g.:
`~/.bun/bin/bun run '/home/lalwen/Dropbox/Linnea Dropbox/Coding/bibliomancy/bibliomancy.ts' all --spread past-present-future`
`~/.bun/bin/bun run '/home/lalwen/Dropbox/Linnea Dropbox/Coding/bibliomancy/bibliomancy.ts' gospels --search "love" --spread warning-counsel-promise`

Spread names: `past-present-future`, `thesis-antithesis-synthesis`, `warning-counsel-promise`, `head-heart-hands`

When presenting spread results, display each verse with its label in bold, adding a brief overall reflection at the end.

If the user chose "Specific book", ask them which book with a free-text response. Use the book name exactly as they provide it. If the script reports no verses found, let the user know and suggest they try again with a corrected book name. You can run with `books` as the argument to list all valid book names and clusters.

Present the drawn verse plainly — share the reference and the text.

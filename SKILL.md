---
name: bibliomancy
description: Draw a random Bible verse (KJV) for divination or reflection
user-invocable: true
allowed-tools: Bash, AskUserQuestion
---

When the user invokes this skill, use AskUserQuestion to ask them what section of the Bible they would like to draw from. Offer these options:

- **Whole Bible** — draw from all 66 books
- **Old Testament** — draw from the 39 OT books only
- **New Testament** — draw from the 27 NT books only
- **Specific book** — let them name a book (e.g., Isaiah, Psalm, Proverbs, Revelation)
- **Common group** — draw from a named cluster (gospels, torah/pentateuch, pauline, wisdom, historical, prophets)
- **Multiple books** — draw from several specific books (e.g., Isaiah and Jeremiah)
- **Range of books** — draw from a consecutive range in canonical order (e.g., Isaiah through Amos)

Based on their answer, run the appropriate command:

- Whole Bible: `~/.bun/bin/bun run '/home/lalwen/Dropbox/Linnea Dropbox/Coding/bibliomancy/bibliomancy.ts' all`
- Old Testament: `~/.bun/bin/bun run '/home/lalwen/Dropbox/Linnea Dropbox/Coding/bibliomancy/bibliomancy.ts' ot`
- New Testament: `~/.bun/bin/bun run '/home/lalwen/Dropbox/Linnea Dropbox/Coding/bibliomancy/bibliomancy.ts' nt`
- Specific book: `~/.bun/bin/bun run '/home/lalwen/Dropbox/Linnea Dropbox/Coding/bibliomancy/bibliomancy.ts' "Book Name"`
- Common group: ask which group they want (gospels, torah, pentateuch, pauline, wisdom, historical, prophets), then run: `~/.bun/bin/bun run '/home/lalwen/Dropbox/Linnea Dropbox/Coding/bibliomancy/bibliomancy.ts' "groupname"`
- Multiple books: ask which books they want, then pass them comma-separated: `~/.bun/bin/bun run '/home/lalwen/Dropbox/Linnea Dropbox/Coding/bibliomancy/bibliomancy.ts' "Isaiah,Jeremiah"`
- Range of books: ask for the start and end books, then pass them with a hyphen: `~/.bun/bin/bun run '/home/lalwen/Dropbox/Linnea Dropbox/Coding/bibliomancy/bibliomancy.ts' "Isaiah-Amos"`

If the user chose "Specific book", ask them which book with a free-text response. Use the book name exactly as they provide it. If the script reports no verses found, let the user know and suggest they try again with a corrected book name. You can run with `books` as the argument to list all valid book names and clusters.

Present the drawn verse plainly — share the reference and the text.

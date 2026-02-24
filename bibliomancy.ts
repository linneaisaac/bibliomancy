import { readFileSync } from "fs";
import { join } from "path";

const OT_BOOKS = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
  "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles",
  "Ezra", "Nehemiah", "Esther", "Job", "Psalm", "Proverbs",
  "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah",
  "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos",
  "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah",
  "Haggai", "Zechariah", "Malachi",
];

const NT_BOOKS = [
  "Matthew", "Mark", "Luke", "John", "Acts", "Romans",
  "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians",
  "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians",
  "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews",
  "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John",
  "Jude", "Revelation",
];

const OT_SET = new Set(OT_BOOKS);
const NT_SET = new Set(NT_BOOKS);
const ALL_BOOKS = [...OT_BOOKS, ...NT_BOOKS];

const CLUSTERS: Record<string, string[]> = {
  torah: ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy"],
  pentateuch: ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy"],
  gospels: ["Matthew", "Mark", "Luke", "John"],
  pauline: [
    "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians",
    "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians",
    "1 Timothy", "2 Timothy", "Titus", "Philemon",
  ],
  wisdom: ["Job", "Psalm", "Proverbs", "Ecclesiastes", "Song of Solomon"],
  historical: [
    "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
    "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles",
    "Ezra", "Nehemiah", "Esther",
  ],
  prophets: [
    "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel",
    "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah",
    "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi",
  ],
};

interface Verse {
  reference: string;
  text: string;
  book: string;
}

function parseVerses(filePath: string): Verse[] {
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n").slice(2); // skip header lines
  const verses: Verse[] = [];

  for (const line of lines) {
    const tabIndex = line.indexOf("\t");
    if (tabIndex === -1) continue;
    const reference = line.slice(0, tabIndex);
    const text = line.slice(tabIndex + 1);
    // Extract book name: everything before the last space+chapter:verse
    const match = reference.match(/^(.+?)\s+\d+:\d+$/);
    if (!match) continue;
    verses.push({ reference, text, book: match[1] });
  }

  return verses;
}

function resolveBookNames(filter: string): Set<string> | null {
  const f = filter.toLowerCase();

  // Check clusters
  if (CLUSTERS[f]) {
    return new Set(CLUSTERS[f]);
  }

  // Check for comma-separated list
  if (filter.includes(",")) {
    const names = filter.split(",").map((s) => s.trim());
    const allLower = ALL_BOOKS.map((b) => b.toLowerCase());
    const matched = new Set<string>();
    for (const name of names) {
      const idx = allLower.indexOf(name.toLowerCase());
      if (idx !== -1) matched.add(ALL_BOOKS[idx]);
    }
    return matched.size > 0 ? matched : null;
  }

  // Check for range (Book1-Book2)
  if (filter.includes("-")) {
    const allLower = ALL_BOOKS.map((b) => b.toLowerCase());
    // Try splitting on each hyphen position to handle books with hyphens
    for (let i = 0; i < filter.length; i++) {
      if (filter[i] !== "-") continue;
      const left = filter.slice(0, i).trim().toLowerCase();
      const right = filter.slice(i + 1).trim().toLowerCase();
      const startIdx = allLower.indexOf(left);
      const endIdx = allLower.indexOf(right);
      if (startIdx !== -1 && endIdx !== -1 && startIdx <= endIdx) {
        return new Set(ALL_BOOKS.slice(startIdx, endIdx + 1));
      }
    }
  }

  return null;
}

function filterVerses(verses: Verse[], filter: string): Verse[] {
  const f = filter.toLowerCase();

  if (f === "all") return verses;
  if (f === "ot") return verses.filter((v) => OT_SET.has(v.book));
  if (f === "nt") return verses.filter((v) => NT_SET.has(v.book));

  // Try clusters, comma-separated, and ranges
  const bookSet = resolveBookNames(filter);
  if (bookSet) {
    return verses.filter((v) => bookSet.has(v.book));
  }

  // Match by book name (case-insensitive)
  return verses.filter((v) => v.book.toLowerCase() === f);
}

function listBooks(verses: Verse[]): string[] {
  const seen = new Set<string>();
  const books: string[] = [];
  for (const v of verses) {
    if (!seen.has(v.book)) {
      seen.add(v.book);
      books.push(v.book);
    }
  }
  return books;
}

const filter = process.argv[2] ?? "all";
const kjvPath = join(import.meta.dir, "kjv.txt");
const allVerses = parseVerses(kjvPath);

if (filter.toLowerCase() === "books") {
  const books = listBooks(allVerses);
  console.log("Available books:");
  for (const book of books) {
    const testament = OT_SET.has(book) ? "OT" : "NT";
    console.log(`  ${book} (${testament})`);
  }
  console.log("\nAvailable clusters:");
  for (const [name, clusterBooks] of Object.entries(CLUSTERS)) {
    console.log(`  ${name}: ${clusterBooks[0]}–${clusterBooks[clusterBooks.length - 1]}`);
  }
  process.exit(0);
}

const filtered = filterVerses(allVerses, filter);

if (filtered.length === 0) {
  console.error(`No verses found for filter: "${filter}"`);
  console.error('Use "all", "ot", "nt", a book name, a cluster (e.g., "gospels"), comma-separated books, or a range (e.g., "Isaiah-Amos").');
  console.error('Use "books" to list all available book names and clusters.');
  process.exit(1);
}

const chosen = filtered[Math.floor(Math.random() * filtered.length)];
console.log(`${chosen.reference}`);
console.log(`${chosen.text}`);

import { readFileSync } from "fs";
import { join } from "path";

const OT_BOOKS = new Set([
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
  "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles",
  "Ezra", "Nehemiah", "Esther", "Job", "Psalm", "Proverbs",
  "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah",
  "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos",
  "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah",
  "Haggai", "Zechariah", "Malachi",
]);

const NT_BOOKS = new Set([
  "Matthew", "Mark", "Luke", "John", "Acts", "Romans",
  "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians",
  "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians",
  "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews",
  "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John",
  "Jude", "Revelation",
]);

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

function filterVerses(verses: Verse[], filter: string): Verse[] {
  const f = filter.toLowerCase();

  if (f === "all") return verses;
  if (f === "ot") return verses.filter((v) => OT_BOOKS.has(v.book));
  if (f === "nt") return verses.filter((v) => NT_BOOKS.has(v.book));

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
    const testament = OT_BOOKS.has(book) ? "OT" : "NT";
    console.log(`  ${book} (${testament})`);
  }
  process.exit(0);
}

const filtered = filterVerses(allVerses, filter);

if (filtered.length === 0) {
  console.error(`No verses found for filter: "${filter}"`);
  console.error('Use "all", "ot", "nt", or a book name (e.g., "Isaiah", "Psalm").');
  console.error('Use "books" to list all available book names.');
  process.exit(1);
}

const chosen = filtered[Math.floor(Math.random() * filtered.length)];
console.log(`${chosen.reference}`);
console.log(`${chosen.text}`);

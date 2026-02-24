import { join } from "path";
import {
  parseVerses, filterVerses, listBooks,
  OT_SET, CLUSTERS,
} from "./lib";

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

import { join } from "node:path";
import {
  CLUSTERS,
  drawSpread,
  filterVerses,
  listBooks,
  OT_SET,
  parseVerses,
  pickDaily,
  SPREADS,
  searchVerses,
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

let filtered = filterVerses(allVerses, filter);

const searchIdx = process.argv.indexOf("--search");
if (searchIdx !== -1 && process.argv[searchIdx + 1]) {
  filtered = searchVerses(filtered, process.argv[searchIdx + 1]);
}

if (filtered.length === 0) {
  const searchTerm = searchIdx !== -1 ? process.argv[searchIdx + 1] : null;
  if (searchTerm) {
    console.error(`No verses found for filter "${filter}" containing "${searchTerm}".`);
  } else {
    console.error(`No verses found for filter: "${filter}"`);
  }
  console.error(
    'Use "all", "ot", "nt", a book name, a cluster (e.g., "gospels"), comma-separated books, or a range (e.g., "Isaiah-Amos").',
  );
  console.error('Use "books" to list all available book names and clusters.');
  process.exit(1);
}

const spreadIdx = process.argv.indexOf("--spread");
if (spreadIdx !== -1) {
  const spreadName = process.argv[spreadIdx + 1];
  if (!spreadName || !SPREADS[spreadName]) {
    console.error(`Unknown spread: "${spreadName ?? ""}"`);
    console.error("Available spreads:");
    for (const [name, labels] of Object.entries(SPREADS)) {
      console.error(`  ${name}: ${labels.join(", ")}`);
    }
    process.exit(1);
  }
  const results = drawSpread(filtered, spreadName);
  for (let i = 0; i < results.length; i++) {
    if (i > 0) console.log("");
    console.log(`${results[i].label}:`);
    console.log(`${results[i].verse.reference}`);
    console.log(`${results[i].verse.text}`);
  }
} else {
  const daily = process.argv.includes("--daily");
  const chosen = daily
    ? pickDaily(filtered)
    : filtered[Math.floor(Math.random() * filtered.length)];
  console.log(`${chosen.reference}`);
  console.log(`${chosen.text}`);
}

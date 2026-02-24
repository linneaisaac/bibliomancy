import { describe, expect, test } from "bun:test";
import {
  filterVerses, resolveBookNames, listBooks,
  OT_SET, NT_SET, CLUSTERS,
  type Verse,
} from "./lib";

// Small fixture of fake verses spanning several books/testaments
const FIXTURES: Verse[] = [
  { reference: "Genesis 1:1", text: "In the beginning...", book: "Genesis" },
  { reference: "Genesis 2:3", text: "And God blessed...", book: "Genesis" },
  { reference: "Exodus 3:14", text: "I AM THAT I AM", book: "Exodus" },
  { reference: "Leviticus 19:18", text: "Love thy neighbour", book: "Leviticus" },
  { reference: "Numbers 6:24", text: "The LORD bless thee", book: "Numbers" },
  { reference: "Deuteronomy 6:4", text: "Hear, O Israel", book: "Deuteronomy" },
  { reference: "Joshua 1:9", text: "Be strong and courageous", book: "Joshua" },
  { reference: "Ruth 1:16", text: "Whither thou goest", book: "Ruth" },
  { reference: "Job 1:21", text: "The LORD gave", book: "Job" },
  { reference: "Psalm 23:1", text: "The LORD is my shepherd", book: "Psalm" },
  { reference: "Proverbs 3:5", text: "Trust in the LORD", book: "Proverbs" },
  { reference: "Isaiah 40:31", text: "They that wait", book: "Isaiah" },
  { reference: "Jeremiah 29:11", text: "For I know the plans", book: "Jeremiah" },
  { reference: "Amos 5:24", text: "Let justice roll", book: "Amos" },
  { reference: "Matthew 5:3", text: "Blessed are the poor", book: "Matthew" },
  { reference: "Mark 1:1", text: "The beginning of the gospel", book: "Mark" },
  { reference: "Luke 2:10", text: "Good tidings", book: "Luke" },
  { reference: "John 3:16", text: "For God so loved", book: "John" },
  { reference: "Romans 8:28", text: "All things work together", book: "Romans" },
  { reference: "1 Corinthians 13:4", text: "Love is patient", book: "1 Corinthians" },
  { reference: "Galatians 5:22", text: "The fruit of the Spirit", book: "Galatians" },
  { reference: "Revelation 21:4", text: "No more tears", book: "Revelation" },
];

// --- filterVerses ---

describe("filterVerses", () => {
  test('"all" returns every verse', () => {
    expect(filterVerses(FIXTURES, "all")).toEqual(FIXTURES);
    expect(filterVerses(FIXTURES, "ALL")).toEqual(FIXTURES);
  });

  test('"ot" returns only Old Testament verses', () => {
    const result = filterVerses(FIXTURES, "ot");
    expect(result.length).toBeGreaterThan(0);
    for (const v of result) {
      expect(OT_SET.has(v.book)).toBe(true);
    }
    // Should not contain any NT book
    for (const v of result) {
      expect(NT_SET.has(v.book)).toBe(false);
    }
  });

  test('"nt" returns only New Testament verses', () => {
    const result = filterVerses(FIXTURES, "NT");
    expect(result.length).toBeGreaterThan(0);
    for (const v of result) {
      expect(NT_SET.has(v.book)).toBe(true);
    }
  });

  test("single book name (case-insensitive)", () => {
    const result = filterVerses(FIXTURES, "genesis");
    expect(result.length).toBe(2);
    expect(result.every((v) => v.book === "Genesis")).toBe(true);

    const result2 = filterVerses(FIXTURES, "PSALM");
    expect(result2.length).toBe(1);
    expect(result2[0].book).toBe("Psalm");
  });

  test("unknown book returns empty array", () => {
    expect(filterVerses(FIXTURES, "Hezekiah")).toEqual([]);
  });

  // Cluster tests
  test("gospels cluster", () => {
    const result = filterVerses(FIXTURES, "gospels");
    const expected = new Set(CLUSTERS.gospels);
    expect(result.length).toBeGreaterThan(0);
    for (const v of result) {
      expect(expected.has(v.book)).toBe(true);
    }
  });

  test("torah cluster", () => {
    const result = filterVerses(FIXTURES, "torah");
    const expected = new Set(CLUSTERS.torah);
    expect(result.length).toBeGreaterThan(0);
    for (const v of result) {
      expect(expected.has(v.book)).toBe(true);
    }
  });

  test("pentateuch cluster (alias for torah)", () => {
    const torah = filterVerses(FIXTURES, "torah");
    const pentateuch = filterVerses(FIXTURES, "pentateuch");
    expect(pentateuch).toEqual(torah);
  });

  test("wisdom cluster", () => {
    const result = filterVerses(FIXTURES, "wisdom");
    const expected = new Set(CLUSTERS.wisdom);
    expect(result.length).toBeGreaterThan(0);
    for (const v of result) {
      expect(expected.has(v.book)).toBe(true);
    }
  });

  test("pauline cluster", () => {
    const result = filterVerses(FIXTURES, "pauline");
    const expected = new Set(CLUSTERS.pauline);
    expect(result.length).toBeGreaterThan(0);
    for (const v of result) {
      expect(expected.has(v.book)).toBe(true);
    }
  });

  test("historical cluster", () => {
    const result = filterVerses(FIXTURES, "historical");
    const expected = new Set(CLUSTERS.historical);
    expect(result.length).toBeGreaterThan(0);
    for (const v of result) {
      expect(expected.has(v.book)).toBe(true);
    }
  });

  test("prophets cluster", () => {
    const result = filterVerses(FIXTURES, "prophets");
    const expected = new Set(CLUSTERS.prophets);
    expect(result.length).toBeGreaterThan(0);
    for (const v of result) {
      expect(expected.has(v.book)).toBe(true);
    }
  });

  // Comma-separated
  test("comma-separated books", () => {
    const result = filterVerses(FIXTURES, "Isaiah,Jeremiah");
    expect(result.length).toBe(2);
    const books = new Set(result.map((v) => v.book));
    expect(books.has("Isaiah")).toBe(true);
    expect(books.has("Jeremiah")).toBe(true);
  });

  test("comma-separated with spaces", () => {
    const result = filterVerses(FIXTURES, "Isaiah, Jeremiah, Amos");
    expect(result.length).toBe(3);
  });

  test("comma-separated with all unknown returns empty", () => {
    expect(filterVerses(FIXTURES, "FakeBook,AnotherFake")).toEqual([]);
  });

  // Range
  test("range of books (Isaiah-Amos)", () => {
    const result = filterVerses(FIXTURES, "Isaiah-Amos");
    const books = new Set(result.map((v) => v.book));
    // Isaiah through Amos in canonical order includes Isaiah, Jeremiah, Lamentations, Ezekiel, Daniel, Hosea, Joel, Amos
    expect(books.has("Isaiah")).toBe(true);
    expect(books.has("Jeremiah")).toBe(true);
    expect(books.has("Amos")).toBe(true);
    // Should not include books outside the range
    expect(books.has("Genesis")).toBe(false);
    expect(books.has("Matthew")).toBe(false);
  });
});

// --- resolveBookNames ---

describe("resolveBookNames", () => {
  test("returns null for unrecognized single name", () => {
    expect(resolveBookNames("Hezekiah")).toBeNull();
  });

  test("returns null for comma-separated all-unknown", () => {
    expect(resolveBookNames("FakeBook,AnotherFake")).toBeNull();
  });

  test("returns set for known cluster", () => {
    const result = resolveBookNames("gospels");
    expect(result).not.toBeNull();
    expect(result!.has("Matthew")).toBe(true);
    expect(result!.has("John")).toBe(true);
  });

  test("returns set for comma-separated known books", () => {
    const result = resolveBookNames("Genesis,Exodus");
    expect(result).not.toBeNull();
    expect(result!.size).toBe(2);
  });

  test("returns set for valid range", () => {
    const result = resolveBookNames("Genesis-Deuteronomy");
    expect(result).not.toBeNull();
    expect(result!.size).toBe(5);
  });

  test("returns null for reversed range", () => {
    expect(resolveBookNames("Deuteronomy-Genesis")).toBeNull();
  });
});

// --- listBooks ---

describe("listBooks", () => {
  test("returns books in order of first appearance", () => {
    const result = listBooks(FIXTURES);
    expect(result[0]).toBe("Genesis");
    expect(result[result.length - 1]).toBe("Revelation");
    // No duplicates
    expect(result.length).toBe(new Set(result).size);
  });

  test("returns empty array for empty input", () => {
    expect(listBooks([])).toEqual([]);
  });

  test("deduplicates books", () => {
    const result = listBooks(FIXTURES);
    // Genesis appears twice in fixtures but should appear once in output
    expect(result.filter((b) => b === "Genesis").length).toBe(1);
  });
});

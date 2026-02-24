import { describe, expect, test } from "bun:test";
import { writeFileSync, unlinkSync } from "fs";
import { join } from "path";
import {
  parseVerses, filterVerses, resolveBookNames, searchVerses, listBooks, pickDaily, drawSpread,
  OT_SET, NT_SET, CLUSTERS, SPREADS,
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

// --- parseVerses ---

describe("parseVerses", () => {
  const tmpPath = join(import.meta.dir, "_test_fixture.txt");

  test("parses tab-separated verses after 2 header lines", () => {
    const content = [
      "Header line 1",
      "Header line 2",
      "Genesis 1:1\tIn the beginning God created the heaven and the earth.",
      "Psalm 23:1\tThe LORD is my shepherd; I shall not want.",
      "",
    ].join("\n");
    writeFileSync(tmpPath, content);
    const verses = parseVerses(tmpPath);
    unlinkSync(tmpPath);

    expect(verses.length).toBe(2);
    expect(verses[0]).toEqual({
      reference: "Genesis 1:1",
      text: "In the beginning God created the heaven and the earth.",
      book: "Genesis",
    });
    expect(verses[1]).toEqual({
      reference: "Psalm 23:1",
      text: "The LORD is my shepherd; I shall not want.",
      book: "Psalm",
    });
  });

  test("skips lines without tabs", () => {
    const content = "H1\nH2\nno tab here\nGenesis 1:1\tValid verse\n";
    writeFileSync(tmpPath, content);
    const verses = parseVerses(tmpPath);
    unlinkSync(tmpPath);

    expect(verses.length).toBe(1);
    expect(verses[0].book).toBe("Genesis");
  });

  test("handles numbered books like 1 Samuel", () => {
    const content = "H1\nH2\n1 Samuel 3:10\tSpeak, for thy servant heareth.\n";
    writeFileSync(tmpPath, content);
    const verses = parseVerses(tmpPath);
    unlinkSync(tmpPath);

    expect(verses.length).toBe(1);
    expect(verses[0].book).toBe("1 Samuel");
  });

  test("returns empty array for file with only headers", () => {
    const content = "H1\nH2\n";
    writeFileSync(tmpPath, content);
    const verses = parseVerses(tmpPath);
    unlinkSync(tmpPath);

    expect(verses).toEqual([]);
  });
});

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

  test("returns null if any comma-separated name is invalid", () => {
    expect(resolveBookNames("Genesis,FakeBook")).toBeNull();
    expect(resolveBookNames("FakeBook,Exodus")).toBeNull();
  });

  test("returns null for reversed range", () => {
    expect(resolveBookNames("Deuteronomy-Genesis")).toBeNull();
  });
});

// --- searchVerses ---

describe("searchVerses", () => {
  test("finds verses containing keyword (case-insensitive)", () => {
    const result = searchVerses(FIXTURES, "lord");
    expect(result.length).toBeGreaterThan(0);
    for (const v of result) {
      expect(v.text.toLowerCase()).toContain("lord");
    }
  });

  test("returns empty for no matches", () => {
    expect(searchVerses(FIXTURES, "xyznoverse")).toEqual([]);
  });

  test("composes with filterVerses", () => {
    const ot = filterVerses(FIXTURES, "ot");
    const result = searchVerses(ot, "lord");
    expect(result.length).toBeGreaterThan(0);
    for (const v of result) {
      expect(OT_SET.has(v.book)).toBe(true);
      expect(v.text.toLowerCase()).toContain("lord");
    }
  });

  test("handles regex special characters safely", () => {
    // Should not throw and should return empty (no verse contains literal "[the]")
    expect(searchVerses(FIXTURES, "[the]")).toEqual([]);
    expect(searchVerses(FIXTURES, "God.*loved")).toEqual([]);
  });

  test("matches whole words only", () => {
    // "beginning" contains "begin" but should not match a search for "begin"
    const result = searchVerses(FIXTURES, "begin");
    expect(result).toEqual([]);

    // "beginning" should match a search for "beginning"
    const result2 = searchVerses(FIXTURES, "beginning");
    expect(result2.length).toBeGreaterThan(0);
  });
});

// --- pickDaily ---

describe("pickDaily", () => {
  test("same date and verses produce the same result", () => {
    const a = pickDaily(FIXTURES, "2026-02-23");
    const b = pickDaily(FIXTURES, "2026-02-23");
    expect(a).toEqual(b);
  });

  test("different dates produce different results", () => {
    const a = pickDaily(FIXTURES, "2026-02-23");
    const b = pickDaily(FIXTURES, "2026-02-24");
    expect(a).not.toEqual(b);
  });

  test("single-element array always returns that element", () => {
    const single = [FIXTURES[0]];
    expect(pickDaily(single, "2026-01-01")).toEqual(FIXTURES[0]);
    expect(pickDaily(single, "2026-12-31")).toEqual(FIXTURES[0]);
  });

  test("default date returns a valid verse", () => {
    const result = pickDaily(FIXTURES);
    expect(result).toHaveProperty("reference");
    expect(result).toHaveProperty("text");
    expect(result).toHaveProperty("book");
  });
});

// --- drawSpread ---

describe("drawSpread", () => {
  test("returns correct number of labeled results for each spread", () => {
    for (const [name, labels] of Object.entries(SPREADS)) {
      const results = drawSpread(FIXTURES, name);
      expect(results.length).toBe(labels.length);
    }
  });

  test("returns empty array for unknown spread name", () => {
    expect(drawSpread(FIXTURES, "nonexistent")).toEqual([]);
  });

  test("labels match the spread definition", () => {
    const results = drawSpread(FIXTURES, "past-present-future");
    expect(results[0].label).toBe("Past");
    expect(results[1].label).toBe("Present");
    expect(results[2].label).toBe("Future");
  });

  test("draws no duplicate verses", () => {
    // Run several times to check for duplicates (randomized)
    for (let i = 0; i < 10; i++) {
      const results = drawSpread(FIXTURES, "past-present-future");
      const refs = results.map((r) => r.verse.reference);
      expect(refs.length).toBe(new Set(refs).size);
    }
  });

  test("SPREADS has expected keys", () => {
    expect(Object.keys(SPREADS)).toContain("past-present-future");
    expect(Object.keys(SPREADS)).toContain("thesis-antithesis-synthesis");
    expect(Object.keys(SPREADS)).toContain("warning-counsel-promise");
    expect(Object.keys(SPREADS)).toContain("head-heart-hands");
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

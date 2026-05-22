// Niche-research criteria from the Sebt Rise Batch 14 notes.
// Each check supports two modes: "standard" and "apk".
// A check may define mode-specific overrides under `modes`; anything not
// overridden falls back to the check's base values.

export const MODES = {
  standard: { id: "standard", label: "Standard" },
  apk: { id: "apk", label: "APK" },
};

const SECTIONS_RAW = [
  {
    id: "core",
    title: "Core Metrics",
    checks: [
      {
        id: "volume",
        label: "Search Volume (monthly)",
        tool: "Keyword Everywhere / Keyword Surfer",
        type: "number",
        placeholder: "e.g. 22000",
        rule: "\u2265 15,000",
        test: (v) => v >= 15000,
        modes: {
          apk: { rule: "\u2265 30,000", test: (v) => v >= 30000 },
        },
      },
      {
        id: "mozkd",
        label: "MOZ Keyword Difficulty",
        tool: "MOZ Pro",
        type: "number",
        placeholder: "e.g. 24",
        rule: "< 30   (ideal < 25)",
        test: (v) => v < 30,
      },
      {
        id: "semrushkd",
        label: "SEMrush Keyword Difficulty",
        tool: "SEMrush",
        type: "number",
        placeholder: "e.g. 33",
        rule: "< 40",
        test: (v) => v < 40,
      },
      {
        id: "dr",
        label: "Main Competitor DR",
        tool: "Ahrefs Domain Rating",
        type: "number",
        placeholder: "e.g. 14",
        rule: "< 20",
        test: (v) => v < 20,
        modes: {
          apk: { rule: "< 30", test: (v) => v < 30 },
        },
      },
      {
        id: "da",
        label: "Main Competitor DA",
        tool: "MOZ Domain Authority",
        type: "number",
        placeholder: "e.g. 18",
        rule: "< 30",
        test: (v) => v < 30,
      },
      {
        id: "rd",
        label: "Reference Domains (RD)",
        tool: "Ahrefs",
        type: "number",
        placeholder: "e.g. 12",
        rule: "As low as possible (\u2264 30)",
        test: (v) => v <= 30,
      },
    ],
  },
  {
    id: "serp",
    title: "SERP Analysis (First Page Only)",
    checks: [
      {
        id: "weaksites",
        label: "Sites with DA < 20 on SERP",
        tool: "MOZ Bar on Google page 1",
        type: "number",
        placeholder: "e.g. 4",
        rule: "\u2265 3 sites",
        test: (v) => v >= 3,
        modes: {
          apk: { rule: "\u2265 2 sites", test: (v) => v >= 2 },
        },
      },
      {
        id: "siteage",
        label: "Competitor Site Age (years)",
        tool: "whois.com",
        type: "number",
        placeholder: "e.g. 1",
        rule: "\u2264 1 year",
        test: (v) => v <= 1,
      },
      {
        id: "pages",
        label: "Competitor Page Count",
        tool: "site:domain.com or sitemap.xml",
        type: "number",
        placeholder: "e.g. 80",
        rule: "< 150 pages",
        test: (v) => v < 150,
      },
      {
        id: "wordcount",
        label: "Keyword Word Count",
        tool: "Your seed keyword",
        type: "number",
        placeholder: "e.g. 3",
        rule: "\u2265 2 words (avoid single-word niches)",
        test: (v) => v >= 2,
      },
      {
        id: "emds",
        label: "EMDs on SERP",
        tool: "Manual SERP check",
        type: "number",
        placeholder: "e.g. 1",
        rule: "\u2264 2 (none with RD > 60)",
        test: (v) => v <= 2,
      },
    ],
  },
  {
    id: "quality",
    title: "Quality Checks",
    checks: [
      {
        id: "micro",
        label: "Is it a Micro / Nano niche?",
        tool: "Your judgement",
        type: "yesno",
        rule: "Must be Yes \u2013 Google prefers micro over macro",
        test: (v) => v === "yes",
      },
      {
        id: "specific",
        label: "Specific, problem-solving topic?",
        tool: "Your judgement",
        type: "yesno",
        rule: "Must be Yes \u2013 not a broad single word",
        test: (v) => v === "yes",
      },
      {
        id: "competitor",
        label: "Good competitor found to replicate?",
        tool: "Ahrefs / SEMrush",
        type: "yesno",
        rule: "Must be Yes \u2013 weak DA + organic traffic",
        test: (v) => v === "yes",
      },
      {
        id: "trends",
        label: "Google Trends stable or growing?",
        tool: "Google Trends",
        type: "yesno",
        rule: "Must be Yes \u2013 consistent over last 12 months",
        test: (v) => v === "yes",
      },
      {
        id: "money",
        label: "Has monetization potential?",
        tool: "Your judgement",
        type: "yesno",
        rule: "Must be Yes \u2013 AdSense, affiliate, products...",
        test: (v) => v === "yes",
      },
      {
        id: "ymyl",
        label: "Safe topic? (NOT gambling / adult / YMYL / copyright)",
        tool: "Your judgement",
        type: "yesno",
        critical: true,
        rule: "Must be Yes \u2013 a No instantly REJECTS the niche",
        test: (v) => v === "yes",
      },
    ],
  },
  {
    id: "bonus",
    title: "Bonus Signal (not scored)",
    checks: [
      {
        id: "download",
        label: "Download-focused niche?",
        tool: "Your judgement",
        type: "yesno",
        bonus: true,
        rule: "Optional \u2013 download niches often rank better",
        test: (v) => v === "yes",
      },
    ],
  },
];

// Resolve a check for a given mode, applying any mode overrides.
export function resolveCheck(check, mode) {
  const override = check.modes && check.modes[mode];
  if (!override) return check;
  return { ...check, ...override };
}

// Sections with checks resolved for the active mode.
export function getSections(mode) {
  return SECTIONS_RAW.map((s) => ({
    ...s,
    checks: s.checks.map((c) => resolveCheck(c, mode)),
  }));
}

// Stable list of every check id (mode-independent).
export const ALL_CHECK_IDS = SECTIONS_RAW.flatMap((s) =>
  s.checks.map((c) => c.id)
);

function allChecks(mode) {
  return SECTIONS_RAW.flatMap((s) =>
    s.checks.map((c) => resolveCheck(c, mode))
  );
}

// Evaluate one resolved check given its raw value.
// returns "pass" | "fail" | "empty"
export function evalCheck(check, value) {
  if (value === "" || value === undefined || value === null) return "empty";
  if (check.type === "number") {
    const n = Number(value);
    if (Number.isNaN(n)) return "empty";
    return check.test(n) ? "pass" : "fail";
  }
  return check.test(value) ? "pass" : "fail";
}

// Score the whole niche for the active mode.
export function scoreNiche(values, mode) {
  const scored = allChecks(mode).filter((c) => !c.bonus);
  let passed = 0;
  let rejected = false;
  let filled = 0;

  for (const c of scored) {
    const status = evalCheck(c, values[c.id]);
    if (status !== "empty") filled += 1;
    if (status === "pass") passed += 1;
    if (c.critical && status === "fail") rejected = true;
  }

  const total = scored.length;
  const pct = total ? Math.round((passed / total) * 100) : 0;

  let verdict, verdictKey;
  if (rejected) {
    verdict = "REJECT \u2013 Banned / YMYL Topic";
    verdictKey = "reject";
  } else if (filled === 0) {
    verdict = "Awaiting data";
    verdictKey = "empty";
  } else if (pct >= 85) {
    verdict = "Great Niche";
    verdictKey = "great";
  } else if (pct >= 65) {
    verdict = "Worth a Look";
    verdictKey = "ok";
  } else {
    verdict = "Weak \u2013 Skip";
    verdictKey = "weak";
  }

  return { passed, total, pct, verdict, verdictKey, filled };
}

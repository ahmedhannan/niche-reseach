"use client";

import { useState, useEffect, useMemo } from "react";
import {
  getSections,
  ALL_CHECK_IDS,
  evalCheck,
  scoreNiche,
  MODES,
} from "../lib/criteria";

const STORAGE_KEY = "niche-checker-saved-v1";
const MODE_KEY = "niche-checker-mode-v1";

const emptyValues = () =>
  Object.fromEntries(ALL_CHECK_IDS.map((id) => [id, ""]));

const VERDICT_STYLE = {
  great: { fg: "var(--green)", bg: "var(--green-bg)", label: "GREAT" },
  ok: { fg: "var(--amber)", bg: "var(--amber-bg)", label: "REVIEW" },
  weak: { fg: "var(--red)", bg: "var(--red-bg)", label: "SKIP" },
  reject: { fg: "var(--red)", bg: "var(--red-bg)", label: "REJECT" },
  empty: { fg: "#8a8470", bg: "transparent", label: "\u2014" },
};

export default function Page() {
  const [name, setName] = useState("");
  const [mode, setMode] = useState("standard");
  const [values, setValues] = useState(emptyValues);
  const [saved, setSaved] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSaved(JSON.parse(raw));
      const m = localStorage.getItem(MODE_KEY);
      if (m === "apk" || m === "standard") setMode(m);
    } catch (e) {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      } catch (e) {}
    }
  }, [saved, loaded]);

  useEffect(() => {
    if (loaded) {
      try {
        localStorage.setItem(MODE_KEY, mode);
      } catch (e) {}
    }
  }, [mode, loaded]);

  const sections = useMemo(() => getSections(mode), [mode]);
  const result = useMemo(() => scoreNiche(values, mode), [values, mode]);

  const setVal = (id, v) => setValues((p) => ({ ...p, [id]: v }));

  const reset = () => {
    setName("");
    setValues(emptyValues());
  };

  const saveNiche = () => {
    const entry = {
      id: Date.now(),
      name: name.trim() || "Untitled niche",
      mode,
      values,
      result,
      date: new Date().toLocaleDateString(),
    };
    setSaved((p) => [entry, ...p]);
    reset();
  };

  const loadNiche = (entry) => {
    setName(entry.name);
    if (entry.mode === "apk" || entry.mode === "standard") setMode(entry.mode);
    setValues({ ...emptyValues(), ...entry.values });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeNiche = (id) =>
    setSaved((p) => p.filter((e) => e.id !== id));

  const vs = VERDICT_STYLE[result.verdictKey] || VERDICT_STYLE.empty;

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b-2 border-[var(--ink)]">
        <div className="mx-auto max-w-5xl px-5 py-7 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="font-mono text-[11px] tracking-[0.25em] uppercase text-[#8a8470]">
              Sebt Rise &middot; Batch 14
            </p>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl leading-none mt-1">
              Niche Checker
            </h1>
          </div>
          <ModeToggle mode={mode} onChange={setMode} />
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-8 grid lg:grid-cols-[1fr_300px] gap-8">
        {/* Left: form */}
        <div>
          {/* niche name */}
          <label className="block mb-7">
            <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-[#8a8470]">
              Niche / Seed Keyword
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AI background remover"
              className="mt-2 w-full bg-transparent border-b-2 border-[var(--ink)] font-display text-2xl py-1 outline-none placeholder:text-[#bdb7a0]"
            />
          </label>

          {sections.map((section) => (
            <section key={section.id} className="mb-9">
              <div className="flex items-center gap-3 mb-3">
                <h2 className="font-display font-bold text-xl">
                  {section.title}
                </h2>
                <div className="flex-1 h-px bg-[var(--line)]" />
              </div>
              <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
                {section.checks.map((check) => {
                  const status = evalCheck(check, values[check.id]);
                  return (
                    <Row
                      key={check.id}
                      check={check}
                      value={values[check.id]}
                      status={status}
                      onChange={(v) => setVal(check.id, v)}
                    />
                  );
                })}
              </div>
            </section>
          ))}

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={saveNiche}
              className="font-mono text-xs tracking-wider uppercase px-5 py-3 bg-[var(--ink)] text-[var(--paper)] hover:opacity-80 transition"
            >
              Save this niche
            </button>
            <button
              onClick={reset}
              className="font-mono text-xs tracking-wider uppercase px-5 py-3 border-2 border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)] transition"
            >
              Clear form
            </button>
          </div>
        </div>

        {/* Right: sticky verdict + saved list */}
        <aside className="lg:sticky lg:top-6 self-start space-y-6">
          <VerdictCard result={result} vs={vs} mode={mode} />
          <SavedList
            saved={saved}
            onLoad={loadNiche}
            onRemove={removeNiche}
          />
        </aside>
      </div>

      <footer className="border-t border-[var(--line)] mt-6">
        <div className="mx-auto max-w-5xl px-5 py-6 font-mono text-[11px] text-[#8a8470] leading-relaxed">
          DA / PA / DR are third-party estimates from MOZ &amp; Ahrefs, not
          official Google numbers &mdash; treat them as guidance and cross-check
          volume &amp; KD across two tools. A REJECT verdict overrides
          everything: never build on a banned or YMYL topic. Saved niches stay
          in this browser only.
        </div>
      </footer>
    </main>
  );
}

function ModeToggle({ mode, onChange }) {
  return (
    <div>
      <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#8a8470] mb-1 text-right">
        Rule set
      </p>
      <div className="flex border-2 border-[var(--ink)] font-mono text-[11px]">
        {Object.values(MODES).map((m) => (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            className={
              "px-4 py-2 uppercase tracking-wider transition " +
              (mode === m.id
                ? "bg-[var(--ink)] text-[var(--paper)]"
                : "hover:bg-[var(--line)]")
            }
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Row({ check, value, status, onChange }) {
  const dot =
    status === "pass"
      ? "var(--green)"
      : status === "fail"
      ? "var(--red)"
      : "var(--line)";

  return (
    <div className="py-3 grid grid-cols-[14px_1fr_auto] gap-3 items-start">
      <span
        className="mt-[6px] w-[14px] h-[14px] rounded-full border border-[var(--ink)]"
        style={{ background: dot }}
        aria-hidden
      />
      <div className="min-w-0">
        <p className="font-display font-semibold text-[15px] leading-snug">
          {check.label}
          {check.bonus && (
            <span className="ml-2 font-mono text-[9px] uppercase tracking-wider text-[#8a8470] align-middle">
              bonus
            </span>
          )}
          {check.critical && (
            <span className="ml-2 font-mono text-[9px] uppercase tracking-wider text-[var(--red)] align-middle">
              critical
            </span>
          )}
        </p>
        <p className="font-mono text-[11px] text-[#8a8470] mt-0.5">
          {check.rule}
        </p>
        <p className="font-mono text-[10px] text-[#bdb7a0] mt-0.5">
          &rarr; {check.tool}
        </p>
      </div>
      <div className="w-[110px]">
        {check.type === "number" ? (
          <input
            type="number"
            value={value}
            placeholder={check.placeholder}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-[var(--paper)] border border-[var(--ink)] px-2 py-1.5 font-mono text-sm text-right outline-none focus:bg-white"
          />
        ) : (
          <div className="flex border border-[var(--ink)] font-mono text-[11px]">
            {["yes", "no"].map((opt) => (
              <button
                key={opt}
                onClick={() => onChange(value === opt ? "" : opt)}
                className={
                  "flex-1 py-1.5 uppercase tracking-wider transition " +
                  (value === opt
                    ? "bg-[var(--ink)] text-[var(--paper)]"
                    : "hover:bg-[var(--line)]")
                }
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function VerdictCard({ result, vs, mode }) {
  return (
    <div
      className="border-2 border-[var(--ink)] p-5 animate-rise"
      style={{ background: vs.bg }}
    >
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#8a8470]">
          Verdict
        </p>
        <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-[#8a8470] border border-[var(--line)] px-1.5 py-0.5">
          {mode === "apk" ? "APK rules" : "Standard rules"}
        </p>
      </div>
      <p
        className="font-display font-extrabold text-2xl leading-tight mt-1"
        style={{ color: vs.fg }}
      >
        {result.verdict}
      </p>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="font-display font-extrabold text-5xl leading-none">
            {result.pct}
            <span className="text-2xl">%</span>
          </p>
          <p className="font-mono text-[11px] text-[#8a8470] mt-1">
            {result.passed} / {result.total} checks passed
          </p>
        </div>
      </div>

      <div className="mt-3 h-2 border border-[var(--ink)] bg-[var(--paper)]">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${result.pct}%`, background: vs.fg }}
        />
      </div>

      <div className="mt-4 font-mono text-[10px] text-[#8a8470] leading-relaxed border-t border-[var(--line)] pt-3">
        85%+ Great &middot; 65&ndash;84% Review &middot; below 65% Skip.
        Banned / YMYL topic = instant Reject.
      </div>
    </div>
  );
}

function SavedList({ saved, onLoad, onRemove }) {
  return (
    <div className="border border-[var(--line)] p-4">
      <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#8a8470] mb-3">
        Saved niches ({saved.length})
      </p>
      {saved.length === 0 ? (
        <p className="font-display text-sm text-[#8a8470] italic">
          Nothing saved yet. Score a niche and hit save to compare later.
        </p>
      ) : (
        <ul className="space-y-2">
          {saved.map((e) => {
            const s = VERDICT_STYLE[e.result.verdictKey] || VERDICT_STYLE.empty;
            return (
              <li
                key={e.id}
                className="border border-[var(--line)] p-2.5 flex items-center gap-2"
              >
                <span
                  className="font-mono text-[9px] font-bold px-1.5 py-1 leading-none border border-[var(--ink)]"
                  style={{ background: s.bg, color: s.fg }}
                >
                  {e.result.pct}%
                </span>
                <button
                  onClick={() => onLoad(e)}
                  className="flex-1 text-left min-w-0"
                >
                  <p className="font-display font-semibold text-sm truncate">
                    {e.name}
                  </p>
                  <p
                    className="font-mono text-[10px] uppercase tracking-wide"
                    style={{ color: s.fg }}
                  >
                    {s.label}
                    {e.mode === "apk" ? " \u00b7 APK" : ""} &middot; {e.date}
                  </p>
                </button>
                <button
                  onClick={() => onRemove(e.id)}
                  className="font-mono text-sm text-[#bdb7a0] hover:text-[var(--red)] px-1"
                  aria-label="Remove"
                >
                  &times;
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

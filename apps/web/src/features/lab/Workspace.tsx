import { runLab, type LabResult } from "@securelab/core";
import type { Lab, Selection } from "@securelab/lab-schema";
import { Icon, Tabs } from "@securelab/ui";
import { useEffect, useRef, useState } from "react";
import { entry, isDone, save } from "../progress/store";
import { useProgress } from "../progress/useProgress";
import "./workspace.css";

export default function Workspace({
  lab,
  catalog,
}: {
  lab: Lab;
  catalog: Pick<Lab, "id" | "slug" | "title" | "prerequisites">[];
}) {
  const { snapshot, sessionOnly, loading } = useProgress();
  const [mobile, setMobile] = useState(false);
  const [active, setActive] = useState("brief");
  const [draft, setDraft] = useState<{
    selection: Selection;
    reason: string;
  }>();
  const [result, setResult] = useState<LabResult>();
  const [busy, setBusy] = useState(false);
  const [practice, setPractice] = useState(false);
  const pending = useRef(false);
  const hintsDialog = useRef<HTMLDialogElement>(null);
  const resetDialog = useRef<HTMLDialogElement>(null);
  const testHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const screen = matchMedia("(max-width: 1099px)");
    const refresh = () => setMobile(screen.matches);
    refresh();
    screen.addEventListener("change", refresh);
    return () => screen.removeEventListener("change", refresh);
  }, []);
  useEffect(() => {
    if (result && mobile && active === "tests") testHeading.current?.focus();
  }, [result, mobile, active]);

  const missing = catalog.find(
    (item) => lab.prerequisites.includes(item.id) && !isDone(snapshot, item.id),
  );
  const saved =
    snapshot.labs[lab.id]?.find((item) => item.version === lab.version) ??
    entry(lab.version);
  const current = { ...saved, ...draft };
  const groups =
    lab.mode === "choose-fix"
      ? [{ action: "primary", options: lab.options }]
      : lab.rules;
  const ready = groups.every((group) =>
    group.options.some(
      (option) => option.id === current.selection[group.action],
    ),
  );
  const next = catalog.find(
    (item) =>
      item.prerequisites.includes(lab.id) &&
      item.prerequisites.every((id) => isDone(snapshot, id)),
  );
  const completed = isDone(snapshot, lab.id);

  function edit(selection: Selection, reason = current.reason) {
    setResult(undefined);
    setDraft({ selection, reason });
    void save(lab.id, lab.version, (previous) => ({
      ...previous,
      selection,
      reason,
    }));
  }
  async function run() {
    if (pending.current || !ready) return;
    pending.current = true;
    setBusy(true);
    try {
      const output = runLab(lab, current.selection, current.reason);
      await save(lab.id, lab.version, (previous) => ({
        ...previous,
        attempts: previous.attempts + 1,
        best: Math.max(previous.best ?? 0, output.score),
        completedAt:
          previous.completedAt ??
          (output.passed ? new Date().toISOString() : null),
      }));
      setResult(output);
      setActive("tests");
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  function reset() {
    resetDialog.current?.close();
    edit({}, "");
    setActive("fix");
  }
  const brief = (
    <div className="panel">
      <h2>Brief</h2>
      <p>{lab.scenario}</p>
      <pre>{lab.routes.join("\n")}</pre>
      <h3>Objective</h3>
      <p>{lab.objective}</p>
      {mobile && (
        <button type="button" onClick={() => setActive("fix")}>
          Choose a fix
        </button>
      )}
    </div>
  );
  if (loading) return <p>Loading progress…</p>;
  if (missing)
    return (
      <>
        {brief}
        <p>
          This lab unlocks after completing{" "}
          <a href={`/labs/${missing.slug}/`}>{missing.title}</a>.
        </p>
      </>
    );

  const fix = (
    <div
      className="panel"
      onKeyDown={(event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
          event.preventDefault();
          void run();
        }
      }}
    >
      <h2>Fix</h2>
      {groups.map((group) => (
        <fieldset key={group.action} disabled={busy}>
          <legend>
            {group.action === "primary"
              ? "Choose a defensive policy"
              : `Policy for ${group.action}`}
          </legend>
          {group.options.map((option) => (
            <label className="choice" key={option.id}>
              <input
                type="radio"
                name={group.action}
                value={option.id}
                checked={current.selection[group.action] === option.id}
                onChange={() =>
                  edit({ ...current.selection, [group.action]: option.id })
                }
              />
              <span>
                {option.label}
                <small>
                  {option.checks
                    .map((check) => check.replaceAll("-", " "))
                    .join(" → ")}
                </small>
              </span>
            </label>
          ))}
        </fieldset>
      ))}
      <label className="reason">
        Why does your policy work?
        <select
          disabled={busy}
          value={current.reason}
          onChange={(event) => edit(current.selection, event.target.value)}
        >
          <option value="">Choose a reason for up to 10 points</option>
          {lab.reasoning.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
  const tests = (
    <div className="panel">
      <h2 ref={testHeading} tabIndex={-1}>
        Tests
      </h2>
      <p className="muted">Simulated decisions from fictional fixtures.</p>
      {!result && <p>Run tests to see results for the current policy.</p>}
      {result?.results.map((item) => (
        <details key={item.id}>
          <summary className={item.passed ? "pass" : "fail"}>
            {item.passed ? "✓ Pass" : "× Fail"} · {item.label}
          </summary>
          <p>{item.invariant}</p>
          <ul>
            {item.trace.map((step, index) => (
              <li key={index}>
                {step.passed ? "Pass" : "Fail"} · {step.label}
              </li>
            ))}
          </ul>
          <pre>
            {JSON.stringify(
              { expected: item.expected, simulated: item.observed },
              null,
              2,
            )}
          </pre>
          {!item.passed && <p>{lab.hints[0]}</p>}
        </details>
      ))}
    </div>
  );
  const explain = (
    <div className="panel">
      <h2>Explain</h2>
      {result ? (
        <>
          <p>
            <strong>{result.score}/100</strong> ·{" "}
            {result.passed ? "Complete" : "Review the requirements"}
          </p>
          <p>
            Behavior {result.breakdown.behavior}/70 · Boundaries{" "}
            {result.breakdown.boundary}/20 · Reasoning{" "}
            {result.breakdown.reasoning}/10
          </p>
          <p>
            {result.breakdown.reasoning === 10
              ? "Your reason matches the policy."
              : "Review the explanation and try the reasoning question again."}
          </p>
          <p>{lab.explanation}</p>
          {groups.map((group) => {
            const chosen = group.options.find(
              (option) => option.id === current.selection[group.action],
            );
            const solution =
              lab.mode === "choose-fix"
                ? lab.solution
                : lab.rules.find((rule) => rule.action === group.action)
                    ?.solution;
            return (
              <p key={group.action}>
                <strong>
                  {group.action === "primary" ? "Policy" : group.action}
                </strong>{" "}
                · {chosen?.label}
                <br />
                Reference ·{" "}
                {group.options.find((option) => option.id === solution)?.label}
              </p>
            );
          })}
        </>
      ) : (
        <p>Run tests to compare your policy with the reviewed reference.</p>
      )}
      {lab.references.map((reference) => (
        <p key={reference.url}>
          <a href={reference.url}>{reference.label}</a>
        </p>
      ))}
    </div>
  );
  return (
    <>
      {sessionOnly && (
        <p role="status">Progress is saved for this session only.</p>
      )}
      <p className="muted">
        {practice ? "Practice" : "Guided"} · {current.attempts} attempts ·{" "}
        {current.hints.length} hints used
        {current.best !== null && ` · Best ${current.best}/100`}
      </p>
      {mobile ? (
        <Tabs
          active={active}
          onChange={setActive}
          tabs={[
            { id: "brief", label: "Brief", content: brief },
            { id: "fix", label: "Fix", content: fix },
            { id: "tests", label: "Tests", content: tests },
            { id: "explain", label: "Explain", content: explain },
          ]}
        />
      ) : (
        <div className="workspace">
          {brief}
          {fix}
          <div className="results">
            {tests}
            {explain}
          </div>
        </div>
      )}
      <p role="status" aria-live="polite">
        {result &&
          `${result.results.filter((item) => item.passed).length} of ${result.results.length} tests passed. ${result.passed ? "Lab complete." : "Review the failed checks."}`}
      </p>
      <div className="actions workspace-actions">
        <button
          type="button"
          className="primary"
          disabled={!ready || busy}
          onClick={() => void run()}
        >
          <Icon name="run" /> Run tests
        </button>
        <button type="button" onClick={() => hintsDialog.current?.showModal()}>
          <Icon name="hint" /> Hints
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => resetDialog.current?.showModal()}
        >
          Reset draft
        </button>
        <button
          type="button"
          onClick={() => {
            setPractice(!practice);
            setActive("brief");
          }}
        >
          {practice ? "Guided mode" : "Practice mode"}
        </button>
        {completed && next && (
          <a className="button" href={`/labs/${next.slug}/`}>
            Next lab
          </a>
        )}
        {completed && !next && (
          <a className="button" href="/progress/">
            View progress
          </a>
        )}
      </div>
      <dialog ref={hintsDialog} aria-labelledby="hint-heading">
        <h2 id="hint-heading">Hints</h2>
        {lab.hints.map((hint, index) => (
          <div key={hint}>
            <button
              type="button"
              disabled={
                (index > 0 && !current.hints.includes(index - 1)) ||
                current.hints.includes(index)
              }
              onClick={() =>
                void save(lab.id, lab.version, (previous) => ({
                  ...previous,
                  hints: [...new Set([...previous.hints, index])],
                }))
              }
            >
              Reveal hint {index + 1}
            </button>
            {current.hints.includes(index) && <p>{hint}</p>}
          </div>
        ))}
        <button type="button" onClick={() => hintsDialog.current?.close()}>
          Close hints
        </button>
      </dialog>
      <dialog ref={resetDialog} aria-labelledby="reset-heading">
        <h2 id="reset-heading">Reset this draft?</h2>
        <p>Your saved completion and best score stay available.</p>
        <div className="actions">
          <button type="button" onClick={() => resetDialog.current?.close()}>
            Cancel
          </button>
          <button type="button" onClick={reset}>
            Reset choices
          </button>
        </div>
      </dialog>
    </>
  );
}

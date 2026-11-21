import type { Lab } from "@securelab/lab-schema";
import { useRef, useState } from "react";
import { isDone, progress, snapshotSchema, type Snapshot } from "./store";
import { useProgress } from "./useProgress";

export type LabCard = Pick<
  Lab,
  | "module"
  | "id"
  | "slug"
  | "title"
  | "prerequisites"
  | "version"
  | "difficulty"
  | "minutes"
  | "objective"
>;

export function LabCards({ labs }: { labs: LabCard[] }) {
  const { snapshot, loading } = useProgress();
  return (
    <div className="grid">
      {labs.map((lab) => {
        const done = isDone(snapshot, lab.id);
        const current = snapshot.labs[lab.id]?.find(
          (item) => item.version === lab.version,
        );
        const locked = lab.prerequisites.some((id) => !isDone(snapshot, id));
        const state = loading
          ? ""
          : done
            ? current?.completedAt
              ? "Complete"
              : "Updated · review available"
            : locked
              ? "Locked"
              : current
                ? "In progress"
                : "Available";
        return (
          <article className="panel" key={lab.id}>
            <p className="muted">
              {lab.difficulty} · {lab.minutes} min{state && ` · ${state}`}
            </p>
            <h2>
              <a href={`/labs/${lab.slug}/`}>{lab.title}</a>
            </h2>
            <p>{lab.objective}</p>
            {current?.best != null && (
              <p>
                Best {current.best}/100 · {current.hints.length} hints
              </p>
            )}
          </article>
        );
      })}
    </div>
  );
}

export default function ProgressPanel({ labs }: { labs: LabCard[] }) {
  const { snapshot, sessionOnly, recovered, loading } = useProgress();
  const [notice, setNotice] = useState("");
  const [preview, setPreview] = useState<{
    snapshot: Snapshot;
    skipped: number;
  }>();
  const dialog = useRef<HTMLDialogElement>(null);
  const [action, setAction] = useState<"replace" | "erase">("replace");
  const loadSequence = useRef(0);
  const active = labs.find(
    (lab) =>
      !isDone(snapshot, lab.id) &&
      lab.prerequisites.every((id) => isDone(snapshot, id)),
  );
  function download() {
    const file = new Blob([JSON.stringify(snapshot, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = "securelab-progress.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
  async function read(file: File) {
    const sequence = ++loadSequence.current;
    setPreview(undefined);
    try {
      if (file.size > 256 * 1024)
        throw new Error("Choose a file smaller than 256 KiB.");
      let input: unknown;
      try {
        input = JSON.parse(await file.text());
      } catch {
        throw new Error("Choose a valid SecureLab JSON export.");
      }
      const parsed = snapshotSchema.safeParse(input);
      if (!parsed.success)
        throw new Error(
          "This file uses an invalid or unsupported progress format.",
        );
      const entries = Object.entries(parsed.data.labs).filter(([id]) =>
        labs.some((lab) => lab.id === id),
      );
      if (sequence !== loadSequence.current) return;
      setPreview({
        snapshot: { schemaVersion: 1, labs: Object.fromEntries(entries) },
        skipped: Object.keys(parsed.data.labs).length - entries.length,
      });
      setNotice("");
      setAction("replace");
      dialog.current?.showModal();
    } catch (error) {
      if (sequence === loadSequence.current)
        setNotice(
          error instanceof Error ? error.message : "Could not read progress.",
        );
    }
  }
  return (
    <>
      <p>
        {loading
          ? "Loading progress…"
          : `${labs.filter((lab) => isDone(snapshot, lab.id)).length} of ${labs.length} labs complete`}
      </p>
      {sessionOnly && <p>Progress is saved for this session only.</p>}
      {recovered && (
        <p>
          Saved progress could not be read. Import a previous export or erase
          the unreadable data.
        </p>
      )}
      {active && !loading && (
        <p>
          <a className="button primary" href={`/labs/${active.slug}/`}>
            Resume {active.title}
          </a>
        </p>
      )}
      <div className="actions">
        <button type="button" disabled={loading} onClick={download}>
          Export progress
        </button>
        <label>
          Import progress{" "}
          <input
            type="file"
            accept=".json,application/json"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void read(file);
            }}
          />
        </label>
        <button
          type="button"
          disabled={loading}
          onClick={() => {
            setAction("erase");
            dialog.current?.showModal();
          }}
        >
          Erase all progress
        </button>
      </div>
      <p role="status">{notice}</p>
      <LabCards labs={labs} />
      <dialog ref={dialog} aria-labelledby="progress-confirm">
        <h2 id="progress-confirm">
          {action === "replace"
            ? "Replace saved progress?"
            : "Erase all progress?"}
        </h2>
        {action === "replace" && preview && (
          <p>
            Import {Object.keys(preview.snapshot.labs).length} lab records.
            Skipped unknown labs {preview.skipped}.
          </p>
        )}
        <div className="actions">
          <button type="button" onClick={() => dialog.current?.close()}>
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              const replace = action === "replace";
              dialog.current?.close();
              if (replace && !preview) return;
              void progress(() =>
                replace && preview
                  ? preview.snapshot
                  : { schemaVersion: 1, labs: {} },
              ).then(() =>
                setNotice(replace ? "Progress imported." : "Progress erased."),
              );
            }}
          >
            {action === "replace" ? "Replace progress" : "Erase progress"}
          </button>
        </div>
      </dialog>
    </>
  );
}

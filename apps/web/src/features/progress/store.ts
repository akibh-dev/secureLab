import { z } from "zod";

const progressEntry = z.strictObject({
  version: z.number().int().positive(),
  selection: z.record(
    z.string().regex(/^[a-z0-9-]+$/),
    z.string().regex(/^[a-z0-9-]+$/),
  ),
  reason: z.string().regex(/^[a-z0-9-]*$/),
  hints: z.array(z.number().int().min(0).max(2)).max(3),
  attempts: z.number().int().nonnegative(),
  best: z.number().int().min(0).max(100).nullable(),
  completedAt: z.iso.datetime().nullable(),
});
export const snapshotSchema = z.strictObject({
  schemaVersion: z.literal(1),
  labs: z.record(z.string().regex(/^MVP-\d{2}$/), z.array(progressEntry)),
});
export type Entry = z.infer<typeof progressEntry>;
export type Snapshot = z.infer<typeof snapshotSchema>;
export const empty: Snapshot = { schemaVersion: 1, labs: {} };
export function entry(version: number): Entry {
  return {
    version,
    selection: {},
    reason: "",
    hints: [],
    attempts: 0,
    best: null,
    completedAt: null,
  };
}
export const eventName = "securelab:progress";
let memory = empty;
let sessionOnly = false;
let db: Promise<IDBDatabase> | undefined;
const changes =
  typeof window !== "undefined" && typeof BroadcastChannel === "function"
    ? new BroadcastChannel(eventName)
    : undefined;
changes?.addEventListener("message", () =>
  window.dispatchEvent(new Event(eventName)),
);

function open() {
  return (db ??= new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("securelab", 1);
    request.onupgradeneeded = () =>
      request.result.createObjectStore("progress");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("Storage is blocked"));
  }));
}
export async function progress(update?: (current: Snapshot) => Snapshot) {
  let recovered = false;
  const apply = (raw: unknown) => {
    const current = snapshotSchema.safeParse(raw ?? empty);
    recovered = !current.success;
    return update?.(current.data ?? empty) ?? current.data ?? empty;
  };
  if (!sessionOnly) {
    try {
      const database = await open();
      memory = await new Promise<Snapshot>((resolve, reject) => {
        const transaction = database.transaction(
          "progress",
          update ? "readwrite" : "readonly",
        );
        const storage = transaction.objectStore("progress");
        const request = storage.get("snapshot");
        let next: Snapshot;
        request.onsuccess = () => {
          next = apply(request.result);
          if (update) storage.put(next, "snapshot");
        };
        transaction.oncomplete = () => resolve(next);
        transaction.onabort = () => reject(transaction.error);
      });
    } catch {
      sessionOnly = true;
    }
  }
  if (sessionOnly) memory = apply(memory);
  if (update) {
    window.dispatchEvent(new Event(eventName));
    if (!sessionOnly) changes?.postMessage("updated");
  }
  return { snapshot: memory, sessionOnly, recovered };
}
export function save(
  id: string,
  version: number,
  update: (current: Entry) => Entry,
) {
  return progress((snapshot) => {
    const history = snapshot.labs[id] ?? [];
    const current =
      history.find((item) => item.version === version) ?? entry(version);
    return {
      ...snapshot,
      labs: {
        ...snapshot.labs,
        [id]: [
          ...history.filter((item) => item.version !== version),
          update(current),
        ],
      },
    };
  });
}
export function isDone(snapshot: Snapshot, id: string) {
  return snapshot.labs[id]?.some((item) => item.completedAt !== null) ?? false;
}

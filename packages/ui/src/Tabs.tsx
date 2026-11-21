import { useId, type ReactNode } from "react";

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: readonly { id: string; label: string; content: ReactNode }[];
  active: string;
  onChange: (id: string) => void;
}) {
  const prefix = useId();
  return (
    <>
      <div role="tablist" aria-label="Lab workspace" className="actions">
        {tabs.map(({ id, label }, index) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={prefix + id}
            aria-controls={prefix + id + "-panel"}
            aria-selected={active === id}
            tabIndex={active === id ? 0 : -1}
            onClick={() => onChange(id)}
            onKeyDown={(event) => {
              const next = {
                ArrowRight: (index + 1) % tabs.length,
                ArrowLeft: (index + tabs.length - 1) % tabs.length,
                Home: 0,
                End: tabs.length - 1,
              }[event.key];
              if (next === undefined) return;
              event.preventDefault();
              onChange(tabs[next].id);
              document.getElementById(prefix + tabs[next].id)?.focus();
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {tabs.map(({ id, content }) => (
        <section
          key={id}
          role="tabpanel"
          id={prefix + id + "-panel"}
          aria-labelledby={prefix + id}
          hidden={active !== id}
          tabIndex={0}
        >
          {content}
        </section>
      ))}
    </>
  );
}

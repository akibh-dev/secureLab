import { useEffect, useState } from "react";
import { empty, eventName, progress } from "./store";

export function useProgress() {
  const [state, setState] = useState({
    snapshot: empty,
    sessionOnly: false,
    recovered: false,
    loading: true,
  });
  useEffect(() => {
    let mounted = true;
    const refresh = () => {
      void progress().then((next) => {
        if (mounted) setState({ ...next, loading: false });
      });
    };
    refresh();
    window.addEventListener(eventName, refresh);
    window.addEventListener("focus", refresh);
    return () => {
      mounted = false;
      window.removeEventListener(eventName, refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);
  return state;
}

import { createElement } from "react";

const paths = {
  pass: "m5 12 5 5L20 7",
  fail: "m6 6 12 12M18 6 6 18",
  caution: "M12 3 2 21h20L12 3zm0 7v4m0 3v1",
  locked: "M6 11h12v10H6zM8 11V7a4 4 0 0 1 8 0v4",
  hint: "M9 18h6m-5 3h4m-5-6a6 6 0 1 1 6 0",
  replay: "M4 11a8 8 0 1 1 2 7M4 5v6h6",
  run: "M8 4v16l12-8L8 4z",
};

export function Icon({ name }: { name: keyof typeof paths }) {
  return createElement(
    "svg",
    { viewBox: "0 0 24 24", width: 18, height: 18, "aria-hidden": true },
    createElement("path", {
      d: paths[name],
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 2,
      strokeLinecap: "round",
      strokeLinejoin: "round",
    }),
  );
}
export { Tabs } from "./Tabs";

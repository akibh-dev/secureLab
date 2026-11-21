import { publishedLabs } from "@securelab/lab-content";
import type { LabCard } from "./ProgressPanel";

export const cards: LabCard[] = publishedLabs.map(
  ({
    module,
    id,
    slug,
    title,
    prerequisites,
    version,
    difficulty,
    minutes,
    objective,
  }) => ({
    module,
    id,
    slug,
    title,
    prerequisites,
    version,
    difficulty,
    minutes,
    objective,
  }),
);

import { publishedLabs } from "@securelab/lab-content";
import type { LabCard } from "./ProgressPanel";

export const cards: LabCard[] = publishedLabs.map(
  ({
    id,
    slug,
    title,
    prerequisites,
    version,
    difficulty,
    minutes,
    objective,
  }) => ({
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

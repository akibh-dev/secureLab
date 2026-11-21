import type { Lab } from "@securelab/lab-schema";
import { pilot } from "./pilot";
import { curriculum } from "./curriculum";

export const publishedLabs: readonly Lab[] = [pilot, ...curriculum];

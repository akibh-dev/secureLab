import { labSchema, type Lab } from "@securelab/lab-schema";
import catalog from "./catalog.generated.json" with { type: "json" };

export const publishedLabs: readonly Lab[] = labSchema.array().parse(catalog);

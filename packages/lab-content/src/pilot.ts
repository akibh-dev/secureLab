import type { Lab } from "@securelab/lab-schema";
import {
  example,
  lesson,
  member,
  outsider,
  option,
  project,
  restricted,
} from "./examples";

export const pilot = {
  ...lesson(
    1,
    "authentication-is-not-authorization",
    "Authentication Is Not Authorization",
    "foundations",
    "Return a project only to a verified project member.",
    "API1",
  ),
  mode: "choose-fix",
  scenario:
    "Fieldnote is a fictional project workspace. Members need to read shared projects. The access policy must check who is in each project and use a consistent response when a project is unavailable.",
  routes: ["GET /api/projects/:projectId"],
  options: [
    option("owners-only", "Require the project owner", ["signed-in", "owner"]),
    option("members", "Require verified project membership", [
      "signed-in",
      "member",
    ]),
  ],
  solution: "members",
  cases: [
    example("member", "A verified member can read the project", "read", {
      actor: member,
      resource: project,
    }),
    example(
      "nonmember",
      "An unrelated account receives a restricted result",
      "read",
      { actor: outsider, resource: project },
      restricted,
      "boundary",
    ),
    example(
      "missing",
      "An unavailable project returns the same public result",
      "read",
      { actor: member, resource: null },
      restricted,
      "boundary",
    ),
    example(
      "anonymous",
      "An unverified identity cannot read",
      "read",
      { actor: null, resource: project },
      restricted,
      "boundary",
    ),
  ],
  hints: [
    "Think about the relationship between the verified actor and this project.",
    "Check membership after establishing the actor's identity.",
    "Require the verified actor's ID to appear in the project's member list.",
  ],
  reasoning: [
    {
      id: "relationship",
      label:
        "Authorization depends on the actor's relationship to this project.",
    },
    {
      id: "ownership",
      label: "Ownership is the only relationship that can grant read access.",
    },
  ],
  correctReason: "relationship",
  explanation:
    "Authentication establishes identity. Project membership grants the read permission in this scenario. The unavailable response reveals no project details.",
} satisfies Lab;

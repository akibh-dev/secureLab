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

const owner = { ...member, id: "owner-a" };
const supervisor = {
  ...owner,
  permissions: ["close", "edit", "share"] as ("close" | "edit" | "share")[],
};
const boundary = "boundary" as const;
function why(correct: string, alternate: string) {
  return {
    correctReason: "principle",
    reasoning: [
      { id: "principle", label: correct },
      { id: "alternate", label: alternate },
    ],
  };
}

const tenant = {
  ...lesson(
    2,
    "tenant-isolation",
    "Tenant Isolation",
    "authorization",
    "Scope documents using verified tenant membership.",
    "API1",
  ),
  mode: "choose-fix",
  scenario:
    "Ledgerleaf is a fictional workspace service. Each organization can read documents stored within its own workspace.",
  routes: ["GET /api/documents/:documentId"],
  options: [
    option("owner-only", "Require verified tenant and ownership", [
      "tenant",
      "owner",
    ]),
    option("tenant-scope", "Require the verified tenant to match", [
      "signed-in",
      "tenant",
    ]),
  ],
  solution: "tenant-scope",
  cases: [
    example(
      "own-tenant",
      "A member reads a document in their tenant",
      "read",
      { actor: member, resource: project },
      undefined,
      "behavior",
      20,
    ),
    example(
      "other-tenant",
      "Another tenant receives a restricted result",
      "read",
      { actor: outsider, resource: project },
      restricted,
      boundary,
      30,
    ),
    example(
      "unavailable",
      "An unavailable document reveals no details",
      "read",
      { actor: member, resource: null },
      restricted,
      boundary,
      10,
    ),
    example(
      "trusted-context",
      "Verified context determines tenant scope",
      "read",
      { actor: member, resource: project, suppliedTenant: "south" },
      undefined,
      "behavior",
      25,
    ),
    example(
      "no-membership",
      "An account without a verified tenant is restricted",
      "read",
      { actor: { id: "guest", permissions: ["read"] }, resource: project },
      restricted,
      boundary,
      15,
    ),
  ],
  hints: [
    "Find the trusted source of tenant membership.",
    "Apply verified tenant scope to the initial lookup.",
    "Compare the authenticated tenant to the owning tenant before returning a record.",
  ],
  ...why(
    "Verified membership defines the workspace boundary.",
    "Only the document owner can read a tenant-wide record.",
  ),
  explanation:
    "Use the verified tenant in the real database lookup and in the authorizing rule. This simulation checks the scoped decision and its public outcome.",
} satisfies Lab;

const close = {
  ...lesson(
    3,
    "role-vs-permission",
    "Role vs Permission",
    "authorization",
    "Require close permission, matching scope and an open ticket.",
    "API5",
  ),
  mode: "choose-fix",
  scenario:
    "Relay Desk routes fictional tickets to supervisors. An authorized supervisor may close an open ticket in their workspace.",
  routes: ["POST /api/tickets/:ticketId/close"],
  options: [
    option(
      "permitted",
      "Require permission, tenant scope and open state",
      ["tenant", "permission", "open"],
      "update",
    ),
    option(
      "assigned",
      "Additionally require personal ownership",
      ["tenant", "permission", "open", "owner"],
      "update",
    ),
  ],
  solution: "permitted",
  cases: [
    example(
      "close",
      "A scoped supervisor closes an open ticket",
      "close",
      { actor: { ...supervisor, id: "supervisor-a" }, resource: project },
      { outcome: "allowed", state: "closed" },
    ),
    example(
      "no-permission",
      "A reader cannot close a ticket",
      "close",
      { actor: member, resource: project },
      restricted,
      boundary,
    ),
    example(
      "other-scope",
      "An out-of-scope supervisor cannot close",
      "close",
      { actor: { ...supervisor, tenant: "south" }, resource: project },
      restricted,
      boundary,
    ),
    example(
      "closed",
      "A previously closed ticket stays closed",
      "close",
      { actor: supervisor, resource: { ...project, open: false } },
      restricted,
      boundary,
    ),
  ],
  hints: [
    "A role name describes a group of privileges.",
    "Check action scope and current business state together.",
    "Allow close only when permission, tenant and open state all match.",
  ],
  ...why(
    "The permission applies to the action and tenant where the ticket is open.",
    "A supervisor must always personally own every ticket they close.",
  ),
  explanation:
    "Evaluate ticket scope, explicit action permission and current state before updating. In a real service enforce the state condition atomically with the write.",
} satisfies Lab;

const profile = {
  ...lesson(
    4,
    "property-level-authorization",
    "Property-Level Authorization",
    "authorization",
    "Return only the approved fields for the authorized audience.",
    "API3",
  ),
  mode: "choose-fix",
  scenario:
    "The fictional Commonroom directory provides team profiles. Owners can see their own contact preference. Internal metadata stays outside the public response model.",
  routes: ["GET /api/profiles/:id"],
  options: [
    option(
      "one-view",
      "Use the public field list for every viewer",
      ["tenant", "visible"],
      "profile",
      "public",
    ),
    option(
      "audience",
      "Project fields by verified audience",
      ["tenant", "visible"],
      "profile",
      "by-audience",
    ),
  ],
  solution: "audience",
  cases: [
    example(
      "team-fields",
      "A teammate sees display name and bio",
      "read",
      { actor: member, resource: project },
      { outcome: "allowed", fields: ["display-name", "bio"] },
    ),
    example(
      "self-fields",
      "The owner also sees their contact preference",
      "read",
      { actor: owner, resource: project },
      {
        outcome: "allowed",
        fields: ["display-name", "bio", "contact-preference"],
      },
    ),
    example(
      "denied",
      "An unapproved viewer receives no profile fields",
      "read",
      { actor: outsider, resource: project },
      restricted,
      boundary,
    ),
  ],
  hints: [
    "A permitted record can have fields with different audiences.",
    "Authorize the record, then build a separate response.",
    "Create a public field list and add contact preference only for the verified owner.",
  ],
  ...why(
    "Object access and visibility of individual properties are separate decisions.",
    "Every audience needs the same fixed representation.",
  ),
  explanation:
    "Allowlist the exact response keys for each authorized audience. Construct a new response object so new internal fields remain private by default.",
} satisfies Lab;

const invalid = { outcome: "invalid-input", reads: 0 } as const;
const paging = {
  ...lesson(
    5,
    "validate-inputs-and-limit-work",
    "Validate Inputs and Limit Work",
    "resource-protection",
    "Validate pagination before accessing records.",
    "API4",
  ),
  mode: "choose-fix",
  scenario:
    "The fictional Stockroom catalog defaults to page 1 with 20 items. It accepts page numbers 1–1000 and sizes 1–50. Invalid input must return a clear validation response before doing any reads.",
  routes: ["GET /api/items?page=…&pageSize=…"],
  options: [
    option(
      "permission-first",
      "Require a catalog permission before validation",
      ["permission", "valid-page"],
      "page",
    ),
    option(
      "bounded",
      "Validate bounded pagination for signed-in viewers",
      ["signed-in", "valid-page"],
      "page",
    ),
  ],
  solution: "bounded",
  cases: [
    example(
      "defaults",
      "Omitted values use documented defaults",
      "list",
      { actor: owner, resource: null },
      { outcome: "allowed", page: 1, size: 20 },
    ),
    example(
      "edge",
      "Maximum accepted values are handled",
      "list",
      { actor: member, resource: null, page: "1000", size: "50" },
      { outcome: "allowed", page: 1000, size: 50 },
      boundary,
    ),
    example(
      "bad-size",
      "An out-of-range value performs no reads",
      "list",
      { actor: member, resource: null, size: "51" },
      invalid,
      boundary,
    ),
    example(
      "malformed",
      "Non-integer input performs no reads",
      "list",
      { actor: member, resource: null, page: "1.2" },
      invalid,
      boundary,
    ),
    example(
      "duplicate",
      "An ambiguous input performs no reads",
      "list",
      { actor: member, resource: null, size: "20,30" },
      invalid,
      boundary,
    ),
    example(
      "signed-in",
      "Signed-in catalog viewers can list",
      "list",
      { actor: { id: "catalog-reader", permissions: [] }, resource: null },
      { outcome: "allowed", page: 1, size: 20 },
    ),
  ],
  hints: [
    "Work out the input contract before deciding how to fetch.",
    "Distinguish omitted values from malformed or ambiguous input.",
    "Reject input outside page 1–1000 and size 1–50 before reading data.",
  ],
  ...why(
    "Early bounds make the requested work predictable.",
    "A permission check alone controls the amount of work.",
  ),
  explanation:
    "Validate each parameter once, apply defaults only when omitted and perform zero reads on validation failure. Real endpoints should also set query cost and rate limits.",
} satisfies Lab;

const capstone = {
  ...lesson(
    6,
    "least-privilege-capstone",
    "Least-Privilege Capstone",
    "capstones",
    "Apply the minimum permissions for each document action.",
    "API1 / API5",
  ),
  mode: "policy-editor",
  scenario:
    "The fictional Papertrail workspace distinguishes listing, editing and sharing. Configure each action to match the documented permissions and resource boundary.",
  routes: [
    "GET /api/workspaces/:id/docs",
    "PATCH /api/docs/:id",
    "POST /api/docs/:id/share",
  ],
  rules: [
    {
      action: "list",
      solution: "scoped-list",
      options: [
        option(
          "scoped-list",
          "List within the verified tenant with list permission",
          ["tenant", "permission"],
        ),
        option("owner-list", "Require ownership to list", [
          "tenant",
          "permission",
          "owner",
        ]),
      ],
    },
    {
      action: "edit",
      solution: "scoped-edit",
      options: [
        option(
          "scoped-edit",
          "Require edit permission in the verified tenant",
          ["tenant", "permission"],
          "update",
        ),
        option(
          "owner-edit",
          "Require ownership for every edit",
          ["tenant", "permission", "owner"],
          "update",
        ),
      ],
    },
    {
      action: "share",
      solution: "scoped-share",
      options: [
        option(
          "scoped-share",
          "Require share permission in the verified tenant",
          ["tenant", "permission"],
          "update",
        ),
        option(
          "owner-share",
          "Require ownership for every share",
          ["tenant", "permission", "owner"],
          "update",
        ),
      ],
    },
  ],
  cases: [
    example("list", "A verified member can list workspace documents", "list", {
      actor: member,
      resource: project,
    }),
    example(
      "edit",
      "An editor may edit the document",
      "edit",
      { actor: { ...supervisor, id: "editor-a" }, resource: project },
      { outcome: "allowed", state: "edited" },
    ),
    example(
      "share",
      "A delegated teammate may share the document",
      "share",
      { actor: { ...supervisor, id: "editor-a" }, resource: project },
      { outcome: "allowed", state: "shared" },
    ),
    example(
      "denied-share",
      "A reader cannot share",
      "share",
      { actor: member, resource: project },
      restricted,
      boundary,
    ),
    example(
      "foreign-edit",
      "An out-of-scope editor cannot edit",
      "edit",
      { actor: { ...supervisor, tenant: "south" }, resource: project },
      restricted,
      boundary,
    ),
    example(
      "other-action",
      "An action outside the policy matrix is restricted",
      "close",
      { actor: supervisor, resource: project },
      restricted,
      boundary,
    ),
  ],
  hints: [
    "Check how each operation changes or reveals data.",
    "Give every action a separate permission in the verified workspace.",
    "Use the tenant boundary and exact action permission for every supported operation.",
  ],
  ...why(
    "Each operation has an explicit permission inside the workspace boundary.",
    "Ownership is required for every operation.",
  ),
  explanation:
    "Use a shared tenant guard and an explicit permission per action. A real edit should also allowlist writable fields and apply permission and update atomically.",
} satisfies Lab;

export const curriculum = [tenant, close, profile, paging, capstone];

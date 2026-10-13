"use server";

import { cookies } from "next/headers";

import { maskProfanity } from "@/lib/laundromat/notebook/mask-profanity";
import { appendEntry } from "@/lib/laundromat/supabase/append-entry";
import { countNotebookEntries } from "@/lib/laundromat/supabase/count-notebook-entries";
import { createLaundromatServiceClient } from "@/lib/laundromat/supabase/create-laundromat-service-client";
import { getCurrentNotebook } from "@/lib/laundromat/supabase/get-current-notebook";
import { getFilledNotebooks } from "@/lib/laundromat/supabase/get-filled-notebooks";
import { getNotebookByNumber } from "@/lib/laundromat/supabase/get-notebook-by-number";
import { getNotebookEntries } from "@/lib/laundromat/supabase/get-notebook-entries";
import type {
  AppendEntryRejection,
  Notebook,
  NotebookEntry,
  NotebookScript,
} from "@/lib/laundromat/supabase/notebook-types";
import { reportEntry } from "@/lib/laundromat/supabase/report-entry";
import { toNotebookScript } from "@/lib/laundromat/supabase/to-notebook-script";
import { readVisitorId } from "@/lib/laundromat/visitor/read-visitor-id";
import { signVisitorId } from "@/lib/laundromat/visitor/sign-visitor-id";

import { createFakeNotebookStore } from "./create-fake-notebook-store";

const VISITOR_COOKIE = "laundromat_visitor";
const VISITOR_COOKIE_MAX_AGE_S = 60 * 60 * 24 * 365;
const FAKE_NOTEBOOKS_COOKIE = "laundromat_fake_notebooks";

const devFakeNotebookStore =
  process.env.NODE_ENV === "development"
    ? createFakeNotebookStore()
    : undefined;

export type NotebookEntryView = {
  id: number;
  page: number;
  lineStart: number;
  lineCount: number;
  body: string;
  signOff: string | null;
  script: NotebookScript;
  createdAt: string;
};

export type NotebookView = {
  number: number;
  pageCount: number;
  linesPerPage: number;
  linesUsed: number;
  startedAt: string;
  filledAt: string | null;
  entries: NotebookEntryView[];
};

export type ShelfBook = {
  number: number;
  startedAt: string;
  filledAt: string;
  entryCount: number;
};

export type ShelfResult =
  | {
      kind: "online";
      currentNumber: number;
      currentEntryCount: number;
      books: ShelfBook[];
    }
  | { kind: "offline" };

export type NotebookResult =
  | { kind: "online"; notebook: NotebookView }
  | { kind: "missing" }
  | { kind: "offline" };

export type LeaveEntryResult =
  | { kind: "placed"; entry: NotebookEntryView; notebookNumber: number }
  | { kind: "rejected"; reason: AppendEntryRejection }
  | { kind: "offline" };

export type ReportEntryResult = { kind: "reported" } | { kind: "offline" };

function toEntryView(entry: NotebookEntry): NotebookEntryView {
  const isHidden = entry.hidden_at !== null;
  return {
    id: entry.id,
    page: entry.page,
    lineStart: entry.line_start,
    lineCount: entry.line_count,
    body: isHidden ? "" : maskProfanity(entry.body),
    signOff:
      isHidden || entry.sign_off === null
        ? null
        : maskProfanity(entry.sign_off),
    script: toNotebookScript(entry.script),
    createdAt: entry.created_at,
  };
}

function toNotebookView(options: {
  notebook: Notebook;
  entries: NotebookEntry[];
}): NotebookView {
  const { notebook } = options;
  return {
    number: notebook.number,
    pageCount: notebook.page_count,
    linesPerPage: notebook.lines_per_page,
    linesUsed: notebook.lines_used,
    startedAt: notebook.started_at,
    filledAt: notebook.filled_at,
    entries: options.entries.map(toEntryView),
  };
}

async function readFakeNotebooks() {
  if (devFakeNotebookStore === undefined) return undefined;
  const cookieStore = await cookies();
  return cookieStore.get(FAKE_NOTEBOOKS_COOKIE)?.value === "1"
    ? devFakeNotebookStore
    : undefined;
}

async function readOrCreateVisitorId(secret: string) {
  const cookieStore = await cookies();
  const existing = readVisitorId({
    cookieValue: cookieStore.get(VISITOR_COOKIE)?.value,
    secret,
  });
  if (existing !== undefined) return existing;
  const visitorId = crypto.randomUUID();
  cookieStore.set(VISITOR_COOKIE, signVisitorId({ visitorId, secret }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: VISITOR_COOKIE_MAX_AGE_S,
    path: "/",
  });
  return visitorId;
}

/** Load the current notebook's number and size and every filled notebook for the shelf, or `offline` when the database is not configured or not reachable. */
export async function loadShelf(): Promise<ShelfResult> {
  const fake = await readFakeNotebooks();
  if (fake !== undefined) return fake.loadShelf();
  const client = createLaundromatServiceClient();
  if (client === undefined) return { kind: "offline" };
  try {
    const [current, books] = await Promise.all([
      getCurrentNotebook(client),
      getFilledNotebooks(client),
    ]);
    if (current === null) return { kind: "offline" };
    const currentEntryCount = await countNotebookEntries({
      client,
      notebookId: current.id,
    });
    return {
      kind: "online",
      currentNumber: current.number,
      currentEntryCount,
      books,
    };
  } catch {
    return { kind: "offline" };
  }
}

/** Load notebook `number` with all its entries, or the current one when `number` is `undefined`; hidden entries keep their place with an empty `body`. */
export async function loadNotebook(
  number: number | undefined
): Promise<NotebookResult> {
  const fake = await readFakeNotebooks();
  if (fake !== undefined) return fake.loadNotebook(number);
  const client = createLaundromatServiceClient();
  if (client === undefined) return { kind: "offline" };
  try {
    const notebook =
      number === undefined
        ? await getCurrentNotebook(client)
        : await getNotebookByNumber({ client, number });
    if (notebook === null) return { kind: "missing" };
    const entries = await getNotebookEntries({
      client,
      notebook,
      fromPage: 1,
      toPage: notebook.page_count,
    });
    return { kind: "online", notebook: toNotebookView({ notebook, entries }) };
  } catch {
    return { kind: "offline" };
  }
}

/** Leave an entry in the current notebook through `append_entry` as the visitor in the signed cookie, creating the cookie on first write. */
export async function leaveEntry(options: {
  body: string;
  script: NotebookScript;
  lineCount: number;
}): Promise<LeaveEntryResult> {
  const fake = await readFakeNotebooks();
  if (fake !== undefined) return fake.leaveEntry(options);
  const client = createLaundromatServiceClient();
  const secret = process.env.LAUNDROMAT_VISITOR_SECRET;
  if (client === undefined || !secret) return { kind: "offline" };
  try {
    const visitorId = await readOrCreateVisitorId(secret);
    const result = await appendEntry({
      client,
      visitorId,
      body: options.body,
      signOff: undefined,
      script: options.script,
      lineCount: options.lineCount,
    });
    if (result.kind === "rejected") return result;
    const { data: notebook, error } = await client
      .from("notebooks")
      .select("number")
      .eq("id", result.entry.notebook_id)
      .single();
    if (error) throw error;
    return {
      kind: "placed",
      entry: toEntryView(result.entry),
      notebookNumber: notebook.number,
    };
  } catch {
    return { kind: "offline" };
  }
}

/** Record the visitor's report of entry `entryId`; does nothing when the database or the visitor secret is not configured. */
export async function reportNotebookEntry(
  entryId: number
): Promise<ReportEntryResult> {
  if ((await readFakeNotebooks()) !== undefined) return { kind: "reported" };
  const client = createLaundromatServiceClient();
  const secret = process.env.LAUNDROMAT_VISITOR_SECRET;
  if (client === undefined || !secret) return { kind: "offline" };
  try {
    const visitorId = await readOrCreateVisitorId(secret);
    await reportEntry({ client, entryId, visitorId, reason: undefined });
    return { kind: "reported" };
  } catch {
    return { kind: "offline" };
  }
}

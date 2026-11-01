"use server";

import { revalidatePath } from "next/cache";

import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import { createCcServiceClient } from "@/lib/cc/supabase/create-cc-service-client";
import { MAX_ACTIVE_KEYWORDS } from "@/lib/cc/x/run-keyword-counts";

/** Start tracking `term` on X in lower case, bringing it back when it was archived; return why when the term is rejected. */
export async function addKeyword(options: {
  term: string;
}): Promise<{ kind: "added" } | { kind: "rejected"; reason: string }> {
  await requireCcOwner();
  const term = options.term.trim().replace(/\s+/gu, " ").toLowerCase();
  const phrase = term.replaceAll('"', "").trim();
  if (phrase === "") {
    return { kind: "rejected", reason: "A keyword needs some text." };
  }
  if (phrase.startsWith("-")) {
    return {
      kind: "rejected",
      reason: "A keyword can't start with -, X would only exclude it.",
    };
  }
  if (term.length > 100) {
    return {
      kind: "rejected",
      reason: "Keep a keyword under 100 characters.",
    };
  }
  const supabase = createCcServiceClient();
  const { count, error: countError } = await supabase
    .from("keywords")
    .select("id", { count: "exact", head: true })
    .is("archived_at", null)
    .neq("term", term);
  if (countError) throw countError;
  if ((count ?? 0) >= MAX_ACTIVE_KEYWORDS) {
    return {
      kind: "rejected",
      reason: `You can track up to ${MAX_ACTIVE_KEYWORDS} keywords. Archive one first.`,
    };
  }
  const { error } = await supabase
    .from("keywords")
    .upsert({ term, archived_at: null }, { onConflict: "term" });
  if (error) throw error;
  revalidatePath("/cc", "layout");
  return { kind: "added" };
}

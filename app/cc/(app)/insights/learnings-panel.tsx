"use client";

import { useState, useTransition } from "react";

import { CcButton } from "@/app/cc/_ui/cc-button";
import { Panel } from "@/app/cc/_ui/panel";
import { createNote } from "@/app/cc/(app)/_actions/create-note";
import { deleteNote } from "@/app/cc/(app)/_actions/delete-note";

type LearningsPanelProps = {
  campaignId: string;
  notes: { id: string; body: string; dateLabel: string }[];
};

export function LearningsPanel(props: LearningsPanelProps) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (draft.trim() === "") return;
    startTransition(async () => {
      try {
        await createNote({ campaignId: props.campaignId, body: draft });
        setDraft("");
        setError(undefined);
      } catch {
        setError("Couldn't save the note. Try again.");
      }
    });
  }

  function handleDelete(noteId: string) {
    if (!window.confirm("Delete this note?")) return;
    startTransition(async () => {
      try {
        await deleteNote({ noteId });
        setError(undefined);
      } catch {
        setError("Couldn't delete the note. Try again.");
      }
    });
  }

  return (
    <Panel
      title="Learnings"
      className="border-cc-ok flex-[2_1_360px]"
      bodyClassName="flex flex-col gap-y-3 px-3 py-2.5"
    >
      {props.notes.length === 0 ? (
        <p className="text-cc-text-2 leading-relaxed">
          No notes yet. Write down what you notice as the numbers come in, like
          “the link in reply 1 did better than the link in the post”.
        </p>
      ) : (
        <ul className="flex flex-col gap-y-3">
          {props.notes.map((note) => (
            <li
              key={note.id}
              className="flex items-start justify-between gap-x-3"
            >
              <div className="flex min-w-0 flex-col gap-y-0.5">
                <span className="text-cc-text-2 leading-relaxed whitespace-pre-wrap">
                  {note.body}
                </span>
                <span className="text-muted-foreground text-[11px]">
                  {note.dateLabel}
                </span>
              </div>
              <CcButton
                size="sm"
                onClick={() => handleDelete(note.id)}
                disabled={isPending}
                aria-label="Delete note"
              >
                ✕
              </CcButton>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-y-2">
        <label
          htmlFor="learning-note"
          className="text-muted-foreground text-[10.5px] tracking-[0.04em] uppercase"
        >
          NEW NOTE
        </label>
        <textarea
          id="learning-note"
          rows={2}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          className="cc-input"
        />
        <div className="flex items-center gap-x-3">
          <CcButton
            type="submit"
            variant="ok"
            disabled={isPending || draft.trim() === ""}
          >
            + ADD NOTE
          </CcButton>
          {error !== undefined && (
            <span role="alert" className="text-cc-warn text-[11px]">
              {error}
            </span>
          )}
        </div>
      </form>
    </Panel>
  );
}

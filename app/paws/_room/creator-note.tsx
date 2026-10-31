"use client";

import { usePawsCopy } from "@/app/paws/_i18n/use-paws-copy";

import { RoomSheet } from "./room-sheet";

type CreatorNoteProps = {
  onClose: () => void;
};

/** Render the creator's note in a sheet over the room: its paragraphs, then the signature. */
export function CreatorNote(props: CreatorNoteProps) {
  const { copy } = usePawsCopy();
  return (
    <RoomSheet title={copy.note.title} onClose={props.onClose}>
      <article className="flex flex-col gap-y-3 px-1 text-[13px] leading-relaxed select-text">
        {copy.note.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <p className="pt-2 text-right">{copy.note.signature}</p>
      </article>
    </RoomSheet>
  );
}

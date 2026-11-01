type HighlightedTextProps = {
  text: string;
  spans: readonly { start: number; end: number; label: string }[];
};

export function HighlightedText(props: HighlightedTextProps) {
  const boundaries = [
    ...new Set([
      0,
      props.text.length,
      ...props.spans.flatMap((span) => [span.start, span.end]),
    ]),
  ].toSorted((a, b) => a - b);
  const segments = boundaries.slice(0, -1).map((start, index) => {
    const end = boundaries.at(index + 1) ?? props.text.length;
    const labels = props.spans
      .filter((span) => span.start <= start && span.end >= end)
      .map((span) => span.label);
    return { start, text: props.text.slice(start, end), labels };
  });
  return (
    <div className="text-[14px] leading-[1.75] break-words whitespace-pre-wrap">
      {segments.map((segment) =>
        segment.labels.length === 0 ? (
          <span key={segment.start}>{segment.text}</span>
        ) : (
          <mark
            key={segment.start}
            title={[...new Set(segment.labels)].join(", ")}
            className="bg-cc-warn/20 text-cc-warn border-cc-warn border-b-2"
          >
            {segment.text}
          </mark>
        )
      )}
    </div>
  );
}

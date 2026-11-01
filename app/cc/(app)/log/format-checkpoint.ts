const CHECKPOINT_LABEL: { [checkpoint: string]: string } = {
  "1h": "+1 h",
  "24h": "+24 h",
  "7d": "+7 d",
  extra: "extra",
};

/** Return the display label for a metric `checkpoint` ("+24 h"), or `checkpoint` itself when it is unknown. */
export function formatCheckpoint(checkpoint: string) {
  return CHECKPOINT_LABEL[checkpoint] ?? checkpoint;
}

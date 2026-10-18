type SceneTooltipProps = {
  text: string | undefined;
  position: { x: number; y: number } | undefined;
};

export function SceneTooltip(props: SceneTooltipProps) {
  return (
    <div
      role="status"
      data-lm-control
      className="pointer-events-none absolute rounded-md border border-[var(--lm-edge)] bg-[var(--lm-panel)] px-2.5 py-1.5 text-[11px] leading-none whitespace-nowrap text-[var(--lm-ink-hi)] lowercase data-[hidden]:opacity-0"
      data-hidden={props.text === undefined ? "" : undefined}
      style={{
        left: props.position?.x ?? 0,
        top: props.position?.y ?? 0,
        transform: "translate(-50%, calc(-100% - 8px))",
      }}
    >
      {props.text}
    </div>
  );
}

type SkyPreviewProps = {
  top: string;
  horizon: string;
  sunProgress: number;
  label: string;
};

export function SkyPreview(props: SkyPreviewProps) {
  const isSunUp = props.sunProgress >= 0 && props.sunProgress <= 1;
  return (
    <div
      className="relative size-full overflow-hidden rounded-md border border-[var(--lm-edge)]"
      style={{
        background: `linear-gradient(to bottom, ${props.top}, ${props.horizon})`,
      }}
    >
      {isSunUp && (
        <div
          className="absolute size-3 -translate-x-1/2 translate-y-1/2 rounded-full bg-[var(--lm-accent-hi)]"
          style={{
            left: `${props.sunProgress * 100}%`,
            bottom: `${Math.sin(Math.PI * props.sunProgress) * 80}%`,
          }}
        />
      )}
      <p className="absolute top-2 left-2 text-[11px] text-[var(--lm-ink-hi)] tabular-nums">
        {props.label}
      </p>
    </div>
  );
}

type AssetPreviewProps = {
  file: string;
  url: string | undefined;
};

const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp", "gif"];
const VIDEO_EXTENSIONS = ["mp4", "mov", "webm"];

export function AssetPreview(props: AssetPreviewProps) {
  const extension = props.file.split(".").at(-1)?.toLowerCase() ?? "";
  const frameClass =
    "bg-cc-panel-2 flex size-24 shrink-0 items-center justify-center overflow-hidden border";

  if (props.url !== undefined && IMAGE_EXTENSIONS.includes(extension)) {
    return (
      <a
        href={props.url}
        target="_blank"
        rel="noopener noreferrer"
        className={frameClass}
      >
        <img src={props.url} alt="" className="size-full object-contain" />
      </a>
    );
  }
  if (props.url !== undefined && VIDEO_EXTENSIONS.includes(extension)) {
    return (
      <video
        src={props.url}
        controls
        preload="metadata"
        className={`${frameClass} object-contain`}
      />
    );
  }
  return (
    <div
      className={`${frameClass} text-muted-foreground text-[11px] uppercase`}
    >
      {extension === "" ? "FILE" : extension}
    </div>
  );
}

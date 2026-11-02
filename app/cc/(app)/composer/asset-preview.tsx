type AssetPreviewProps = {
  file: string;
  url: string | undefined;
};

const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp", "gif"];
const VIDEO_EXTENSIONS = ["mp4", "mov", "webm"];

export function AssetPreview(props: AssetPreviewProps) {
  const extension = props.file.split(".").at(-1)?.toLowerCase() ?? "";

  if (props.url !== undefined && IMAGE_EXTENSIONS.includes(extension)) {
    return (
      <a
        href={props.url}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-cc-panel-2 flex h-[180px] w-full max-w-[320px] shrink-0 items-center justify-center overflow-hidden border"
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
        className="bg-cc-panel-2 aspect-video w-full max-w-[480px] min-w-[320px] shrink-0 border object-contain"
      />
    );
  }
  return (
    <div className="bg-cc-panel-2 text-muted-foreground flex h-16 w-24 shrink-0 items-center justify-center border text-[11px] uppercase">
      {extension === "" ? "FILE" : extension}
    </div>
  );
}

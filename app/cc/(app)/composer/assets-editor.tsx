"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

import { CcButton } from "@/app/cc/_ui/cc-button";
import { createAssetUpload } from "@/app/cc/(app)/_actions/create-asset-upload";
import { getAssetUrls } from "@/app/cc/(app)/_actions/get-asset-urls";
import { CC_ASSETS_BUCKET, type PostAsset } from "@/lib/cc/post-asset";

import { AssetPreview } from "./asset-preview";
import { writeClipboard } from "./write-clipboard";

type AssetsEditorProps = {
  postId: string;
  assets: readonly PostAsset[];
  onChange: (assets: readonly PostAsset[]) => void;
};

type AssetUrls = { [path: string]: { view: string; download: string } };

type UploadState =
  | { kind: "idle" }
  | { kind: "uploading"; fileName: string; done: number; total: number }
  | { kind: "error"; message: string };

export function AssetsEditor(props: AssetsEditorProps) {
  const [urls, setUrls] = useState<AssetUrls>({});
  const [upload, setUpload] = useState<UploadState>({ kind: "idle" });
  const [copiedIndex, setCopiedIndex] = useState<number | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestedPathsRef = useRef<ReadonlySet<string>>(new Set());
  const paths = props.assets.flatMap((asset) =>
    asset.path === undefined ? [] : [asset.path]
  );
  const pathsKey = paths.toSorted().join("\n");

  useEffect(() => {
    const missing = pathsKey
      .split("\n")
      .filter((path) => path !== "" && !requestedPathsRef.current.has(path));
    if (missing.length === 0) return;
    requestedPathsRef.current = new Set([
      ...requestedPathsRef.current,
      ...missing,
    ]);
    getAssetUrls({ paths: missing })
      .then((fetched) => setUrls((previous) => ({ ...previous, ...fetched })))
      .catch(() => undefined);
  }, [pathsKey]);

  useEffect(() => {
    if (copiedIndex === undefined) return;
    const timeout = setTimeout(() => setCopiedIndex(undefined), 1500);
    return () => clearTimeout(timeout);
  }, [copiedIndex]);

  function updateAsset(options: { index: number; asset: PostAsset }) {
    props.onChange(
      props.assets.map((asset, index) =>
        index === options.index ? options.asset : asset
      )
    );
  }

  function removeAsset(index: number) {
    props.onChange(
      props.assets.filter((_, assetIndex) => assetIndex !== index)
    );
  }

  function addNamedAsset() {
    props.onChange([...props.assets, { file: "", alt: "" }]);
  }

  async function copyAlt(index: number) {
    await writeClipboard(props.assets.at(index)?.alt ?? "");
    setCopiedIndex(index);
  }

  async function uploadFiles(files: readonly File[]) {
    const uploaded = await files.reduce<Promise<PostAsset[]>>(
      async (previous, file, index) => {
        const done = await previous;
        setUpload({
          kind: "uploading",
          fileName: file.name,
          done: index,
          total: files.length,
        });
        const target = await createAssetUpload({
          postId: props.postId,
          fileName: file.name,
        });
        const { error } = await createClient(target.supabaseUrl, target.anonKey)
          .storage.from(CC_ASSETS_BUCKET)
          .uploadToSignedUrl(target.path, target.token, file, {
            contentType: file.type || undefined,
          });
        if (error) throw error;
        return [...done, { file: file.name, alt: "", path: target.path }];
      },
      Promise.resolve([])
    );
    props.onChange([...props.assets, ...uploaded]);
  }

  function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;
    uploadFiles(files)
      .then(() => setUpload({ kind: "idle" }))
      .catch((error: unknown) =>
        setUpload({
          kind: "error",
          message:
            error instanceof Error
              ? `Upload failed: ${error.message}`
              : "Upload failed. Try again.",
        })
      );
  }

  return (
    <fieldset className="flex min-w-0 flex-col gap-y-2">
      <legend className="text-muted-foreground mb-1.5 text-[11px] tracking-[0.14em]">
        ASSETS · FILE AND ALT TEXT
      </legend>
      {props.assets.length === 0 && (
        <p className="text-muted-foreground text-[12px]">No assets yet.</p>
      )}
      <ul className="flex flex-col gap-y-2">
        {props.assets.map((asset, index) => {
          const assetUrls =
            asset.path === undefined ? undefined : urls[asset.path];
          return (
            <li
              key={asset.path ?? `named-${index}`}
              className="border-cc-line-soft flex flex-wrap items-start gap-x-3 gap-y-2 border p-2"
            >
              <AssetPreview file={asset.file} url={assetUrls?.view} />
              <div className="flex min-w-[200px] flex-1 flex-col gap-y-2">
                {asset.path === undefined ? (
                  <>
                    <label
                      className="sr-only"
                      htmlFor={`asset-file-${props.postId}-${index}`}
                    >
                      File {index + 1}
                    </label>
                    <input
                      id={`asset-file-${props.postId}-${index}`}
                      className="cc-input"
                      placeholder="video/paws-promo.mp4"
                      value={asset.file}
                      onChange={(event) =>
                        updateAsset({
                          index,
                          asset: { ...asset, file: event.target.value },
                        })
                      }
                    />
                    <span className="text-cc-warn text-[11px]">
                      Name only · not uploaded
                    </span>
                  </>
                ) : (
                  <span className="text-cc-text-2 break-all">{asset.file}</span>
                )}
                <label
                  className="sr-only"
                  htmlFor={`asset-alt-${props.postId}-${index}`}
                >
                  Alt text for {asset.file || `file ${index + 1}`}
                </label>
                <input
                  id={`asset-alt-${props.postId}-${index}`}
                  className="cc-input"
                  placeholder="Alt text: what it shows"
                  value={asset.alt}
                  onChange={(event) =>
                    updateAsset({
                      index,
                      asset: { ...asset, alt: event.target.value },
                    })
                  }
                />
              </div>
              <div className="flex flex-wrap gap-x-2 gap-y-2">
                {assetUrls !== undefined && (
                  <a
                    href={assetUrls.download}
                    className="border-primary text-primary hover:bg-primary/10 inline-flex min-h-11 items-center border px-3 text-[11px] font-bold tracking-[0.1em]"
                  >
                    DOWNLOAD
                  </a>
                )}
                <CcButton
                  type="button"
                  size="sm"
                  disabled={asset.alt.trim() === ""}
                  onClick={() => copyAlt(index)}
                >
                  {copiedIndex === index ? "COPIED ✓" : "COPY ALT"}
                </CcButton>
                <CcButton
                  type="button"
                  size="sm"
                  aria-label={`Remove ${asset.file || `asset ${index + 1}`}`}
                  onClick={() => removeAsset(index)}
                >
                  REMOVE
                </CcButton>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*,.srt"
          className="sr-only"
          tabIndex={-1}
          onChange={handleFiles}
        />
        <CcButton
          type="button"
          size="sm"
          variant="primary"
          disabled={upload.kind === "uploading"}
          onClick={() => inputRef.current?.click()}
        >
          ↑ UPLOAD FILES
        </CcButton>
        <CcButton type="button" size="sm" onClick={addNamedAsset}>
          + NAME ONLY
        </CcButton>
        {(() => {
          switch (upload.kind) {
            case "idle":
              return (
                <span className="text-muted-foreground text-[11px]">
                  Up to 200 MB a file · Save the draft to keep new files
                </span>
              );
            case "uploading":
              return (
                <span role="status" className="text-primary text-[11px]">
                  Uploading {upload.fileName} ({upload.done + 1}/{upload.total}
                  )…
                </span>
              );
            case "error":
              return (
                <span role="alert" className="text-cc-warn text-[11px]">
                  {upload.message}
                </span>
              );
            default: {
              const unhandled: never = upload;
              return unhandled;
            }
          }
        })()}
      </div>
    </fieldset>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import differenceBy from "lodash/differenceBy.js";
import uniqBy from "lodash/uniqBy.js";

import { CcButton } from "@/app/cc/_ui/cc-button";
import { CcSelect } from "@/app/cc/_ui/cc-select";
import { createAssetUpload } from "@/app/cc/(app)/_actions/create-asset-upload";
import { getAssetUrls } from "@/app/cc/(app)/_actions/get-asset-urls";
import { listReusableAssets } from "@/app/cc/(app)/_actions/list-reusable-assets";
import { hashFile } from "@/lib/cc/hash-file";
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
  | { kind: "uploaded"; uploadedCount: number; reusedCount: number }
  | { kind: "error"; message: string };

type ReuseState =
  | { kind: "closed" }
  | { kind: "loading" }
  | { kind: "open"; assets: readonly { file: string; path: string }[] }
  | { kind: "error" };

export function AssetsEditor(props: AssetsEditorProps) {
  const [urls, setUrls] = useState<AssetUrls>({});
  const [upload, setUpload] = useState<UploadState>({ kind: "idle" });
  const [reuse, setReuse] = useState<ReuseState>({ kind: "closed" });
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
    const uploaded = await files.reduce<
      Promise<{ asset: PostAsset; isReused: boolean }[]>
    >(async (previous, file, index) => {
      const done = await previous;
      setUpload({
        kind: "uploading",
        fileName: file.name,
        done: index,
        total: files.length,
      });
      const target = await createAssetUpload({
        fileName: file.name,
        sha256: await hashFile(file),
      });
      if (target.kind === "upload") {
        const { error } = await createClient(target.supabaseUrl, target.anonKey)
          .storage.from(CC_ASSETS_BUCKET)
          .uploadToSignedUrl(target.path, target.token, file, {
            contentType: file.type || undefined,
          });
        if (error) throw error;
      }
      return [
        ...done,
        {
          asset: { file: file.name, alt: "", path: target.path },
          isReused: target.kind === "existing",
        },
      ];
    }, Promise.resolve([]));
    const addedPaths = addUploadedAssets(
      uploaded.map((entry) => entry.asset)
    ).map((asset) => asset.path);
    const added = uniqBy(uploaded, (entry) => entry.asset.path).filter(
      (entry) => addedPaths.includes(entry.asset.path)
    );
    setUpload({
      kind: "uploaded",
      uploadedCount: added.filter((entry) => !entry.isReused).length,
      reusedCount: added.filter((entry) => entry.isReused).length,
    });
  }

  function addUploadedAssets(assets: readonly PostAsset[]) {
    const added = differenceBy(uniqBy(assets, "path"), props.assets, "path");
    props.onChange([...props.assets, ...added]);
    return added;
  }

  function openReuse() {
    setReuse({ kind: "loading" });
    listReusableAssets({ postId: props.postId })
      .then((assets) => setReuse({ kind: "open", assets }))
      .catch(() => setReuse({ kind: "error" }));
  }

  function reuseAsset(path: string) {
    if (reuse.kind !== "open") return;
    const picked = reuse.assets.find((asset) => asset.path === path);
    if (picked === undefined) return;
    addUploadedAssets([{ file: picked.file, alt: "", path: picked.path }]);
    setReuse({ kind: "closed" });
  }

  function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;
    uploadFiles(files).catch((error: unknown) =>
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
      <legend className="text-muted-foreground mb-1.5 text-[10.5px] tracking-[0.04em] uppercase">
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
                <div className="flex flex-wrap gap-x-2 gap-y-2">
                  {assetUrls !== undefined && (
                    <a
                      href={assetUrls.download}
                      className="border-border text-cc-text-2 hover:border-primary hover:text-foreground inline-flex h-6 items-center border px-2 text-[10.5px] font-semibold tracking-[0.04em]"
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
        <CcButton
          type="button"
          size="sm"
          disabled={reuse.kind === "loading"}
          onClick={() =>
            reuse.kind === "closed" || reuse.kind === "error"
              ? openReuse()
              : setReuse({ kind: "closed" })
          }
        >
          ⟲ REUSE FILE
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
            case "uploaded":
              return (
                <span
                  role="status"
                  className="text-muted-foreground text-[11px]"
                >
                  {[
                    ...(upload.uploadedCount === 0
                      ? []
                      : [`Uploaded ${upload.uploadedCount}`]),
                    ...(upload.reusedCount === 0
                      ? []
                      : [`Reused ${upload.reusedCount} already stored`]),
                    ...(upload.uploadedCount + upload.reusedCount === 0
                      ? ["Already on this post"]
                      : ["Save the draft to keep new files"]),
                  ].join(" · ")}
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
      {(() => {
        switch (reuse.kind) {
          case "closed":
            return undefined;
          case "loading":
            return (
              <span role="status" className="text-muted-foreground text-[11px]">
                Loading stored files…
              </span>
            );
          case "error":
            return (
              <span role="alert" className="text-cc-warn text-[11px]">
                Could not load stored files. Try again.
              </span>
            );
          case "open": {
            const options = reuse.assets
              .filter(
                (asset) =>
                  !props.assets.some((existing) => existing.path === asset.path)
              )
              .map((asset, index, assets) => {
                const sameNameBefore = assets
                  .slice(0, index)
                  .filter((other) => other.file === asset.file).length;
                return {
                  value: asset.path,
                  label:
                    sameNameBefore === 0
                      ? asset.file
                      : `${asset.file} (${sameNameBefore + 1})`,
                };
              });
            return options.length === 0 ? (
              <span className="text-muted-foreground text-[11px]">
                No other uploaded files yet.
              </span>
            ) : (
              <CcSelect
                aria-label="Reuse a stored file"
                value=""
                placeholder={`Pick a stored file (${options.length})`}
                options={options}
                onChange={reuseAsset}
              />
            );
          }
          default: {
            const unhandled: never = reuse;
            return unhandled;
          }
        }
      })()}
    </fieldset>
  );
}

"use client";

import { CcButton } from "@/app/cc/_ui/cc-button";

import type { PostAsset } from "./draft-fields";

type AssetsEditorProps = {
  postId: string;
  assets: readonly PostAsset[];
  onChange: (assets: readonly PostAsset[]) => void;
};

export function AssetsEditor(props: AssetsEditorProps) {
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

  function addAsset() {
    props.onChange([...props.assets, { file: "", alt: "" }]);
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
        {props.assets.map((asset, index) => (
          <li
            key={index}
            className="border-cc-line-soft grid grid-cols-1 gap-x-2 gap-y-2 border p-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)_auto]"
          >
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
            <label
              className="sr-only"
              htmlFor={`asset-alt-${props.postId}-${index}`}
            >
              Alt text for file {index + 1}
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
            <CcButton
              type="button"
              size="sm"
              className="min-h-11"
              aria-label={`Remove ${asset.file || `asset ${index + 1}`}`}
              onClick={() => removeAsset(index)}
            >
              REMOVE
            </CcButton>
          </li>
        ))}
      </ul>
      <CcButton type="button" size="sm" className="w-fit" onClick={addAsset}>
        + ADD ASSET
      </CcButton>
    </fieldset>
  );
}

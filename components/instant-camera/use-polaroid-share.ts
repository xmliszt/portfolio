"use client";

import { useEffect, useRef, useState } from "react";

import { getShareIntentUrl } from "@/lib/laundromat/instant-camera/get-share-intent-url";
import { MASTODON_SERVER_STORAGE_KEY } from "@/lib/laundromat/instant-camera/mastodon-server-storage-key";
import { normalizeMastodonServer } from "@/lib/laundromat/instant-camera/normalize-mastodon-server";
import type {
  ShareStep,
  ShareTargetId,
} from "@/lib/laundromat/instant-camera/share-targets";
import { SHARE_TARGETS } from "@/lib/laundromat/instant-camera/share-targets";
import type { ViewfinderOrientation } from "@/lib/laundromat/instant-camera/viewfinder-frame";

import { canShareImageFiles } from "./can-share-image-files";
import { convertToJpeg } from "./convert-to-jpeg";
import { copyImageToClipboard } from "./copy-image-to-clipboard";
import { renderPolaroidBlob } from "./render-polaroid-blob";
import { saveBlobAsFile } from "./save-blob-as-file";
import { SHARE_TARGET_ICON_PATHS } from "./share-target-icon-paths";

const PRERENDER_DELAY_MS = 400;
const TOAST_MS = 2600;

export type Handoff = {
  label: string;
  iconPath: string;
  step: ShareStep;
  url: string;
  pasteKeys: string;
};

export type PolaroidPrintLook = Omit<
  Parameters<typeof renderPolaroidBlob>[0],
  "photoUrl" | "orientation" | "note"
>;

type ReadyPrint = { note: string; blob: Blob };

function readMastodonServer() {
  try {
    return (
      window.localStorage.getItem(MASTODON_SERVER_STORAGE_KEY) ?? undefined
    );
  } catch {
    return undefined;
  }
}

function rememberMastodonServer(server: string) {
  try {
    window.localStorage.setItem(MASTODON_SERVER_STORAGE_KEY, server);
  } catch {
    return;
  }
}

/** Keep the polaroid with `note` printed and ready to share, and return the share actions: the share sheet with `sheetText` on touch screens, otherwise a platform's new post with `shareText` and `siteUrl` and the print copied or saved first, plus copy, download and the toast and handoff to show. */
export function usePolaroidShare(options: {
  photo: { url: string; orientation: ViewfinderOrientation };
  note: string;
  readPrintLook: () => PolaroidPrintLook;
  shareText: string;
  sheetText: string;
  siteUrl: string;
  fileNames: { print: string; shared: string };
  messages: {
    copied: string;
    copyFailed: string;
    downloaded: string;
    printFailed: string;
    mastodonAsk: string;
    pasteReminder: (values: { platform: string; keys: string }) => string;
    savedReminder: (values: { platform: string }) => string;
  };
}) {
  const { note, messages } = options;
  const [toast, setToast] = useState<{
    text: string;
    id: number;
    visible: boolean;
  }>();
  const [handoff, setHandoff] = useState<Handoff>();
  const [isAskingMastodon, setIsAskingMastodon] = useState(false);
  const [mastodonInput, setMastodonInput] = useState("");
  const printRef = useRef<{ note: string; blob: Promise<Blob> }>(undefined);
  const [readyPrint, setReadyPrint] = useState<ReadyPrint>();
  const [canShareFiles] = useState(canShareImageFiles);
  const [failedNote, setFailedNote] = useState<string>();
  const [isCopying, setIsCopying] = useState(false);
  const isWaitingForPrint =
    canShareFiles && readyPrint?.note !== note && failedNote !== note;
  const isShareDisabled = isWaitingForPrint || isCopying;
  const pasteKeys = /Mac|iPhone|iPad/.test(navigator.userAgent)
    ? "⌘ V"
    : "Ctrl V";

  function getPrint() {
    const current = printRef.current;
    if (current !== undefined && current.note === note) return current.blob;
    const printedNote = note;
    const blob = renderPolaroidBlob({
      ...options.readPrintLook(),
      photoUrl: options.photo.url,
      orientation: options.photo.orientation,
      note: printedNote,
    });
    printRef.current = { note: printedNote, blob };
    blob
      .then((png) => (canShareFiles ? convertToJpeg(png) : png))
      .then(
        (ready) => {
          if (printRef.current?.blob === blob) {
            setReadyPrint({ note: printedNote, blob: ready });
          }
        },
        () => {
          if (printRef.current?.blob !== blob) return;
          printRef.current = undefined;
          setFailedNote(printedNote);
        }
      );
    return blob;
  }

  useEffect(() => {
    const timer = window.setTimeout(getPrint, PRERENDER_DELAY_MS);
    return () => window.clearTimeout(timer);
  });

  const toastId = toast?.visible === true ? toast.id : undefined;
  useEffect(() => {
    if (toastId === undefined) return;
    const timer = window.setTimeout(
      () =>
        setToast((current) =>
          current === undefined ? current : { ...current, visible: false }
        ),
      TOAST_MS
    );
    return () => window.clearTimeout(timer);
  }, [toastId]);

  function showToast(next: string) {
    setToast((current) => ({
      text: next,
      id: (current?.id ?? 0) + 1,
      visible: true,
    }));
  }

  function shareThroughSheet() {
    if (!canShareFiles) return false;
    if (readyPrint?.note !== note) return failedNote !== note;
    const file = new File([readyPrint.blob], options.fileNames.shared, {
      type: readyPrint.blob.type,
    });
    navigator
      .share({ files: [file], text: options.sheetText })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        copyPhoto();
      });
    return true;
  }

  function shareToTarget(target: {
    id: ShareTargetId;
    mastodonServer?: string;
  }) {
    if (shareThroughSheet()) return;
    const found = SHARE_TARGETS.find(({ id }) => id === target.id);
    if (found === undefined) return;
    if (found.id === "mastodon" && target.mastodonServer === undefined) {
      setMastodonInput(readMastodonServer() ?? "");
      setIsAskingMastodon(true);
      showToast(messages.mastodonAsk);
      return;
    }
    const url = getShareIntentUrl({
      target: found.id,
      text: options.shareText,
      siteUrl: options.siteUrl,
      mastodonServer: target.mastodonServer,
    });
    if (url === undefined) return;
    const print = getPrint();
    const copied = copyImageToClipboard(print);
    const isSaved = found.step === "pick-from-downloads";
    if (isSaved) {
      print.then(
        (blob) => saveBlobAsFile({ blob, fileName: options.fileNames.print }),
        () => {}
      );
    }
    setToast(undefined);
    setIsCopying(true);
    copied.then((isCopied) => {
      setIsCopying(false);
      if (!isCopied && !isSaved) {
        showToast(messages.copyFailed);
        return;
      }
      setHandoff({
        label:
          found.id === "mastodon" && target.mastodonServer !== undefined
            ? target.mastodonServer
            : found.label,
        iconPath: SHARE_TARGET_ICON_PATHS[found.id],
        step: found.step,
        url,
        pasteKeys,
      });
    });
  }

  function submitMastodon(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const server = normalizeMastodonServer(mastodonInput);
    if (server === undefined) {
      showToast(messages.mastodonAsk);
      return;
    }
    rememberMastodonServer(server);
    setIsAskingMastodon(false);
    shareToTarget({ id: "mastodon", mastodonServer: server });
  }

  function shareMore() {
    if (shareThroughSheet()) return;
    const print = getPrint();
    if (navigator.share !== undefined) {
      print
        .then((blob) =>
          navigator.share({
            files: [
              new File([blob], options.fileNames.print, {
                type: "image/png",
              }),
            ],
            text: options.shareText,
            url: options.siteUrl,
          })
        )
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError")
            return;
          copyPhoto();
        });
      return;
    }
    copyPhoto();
  }

  function download() {
    getPrint().then(
      (blob) => {
        saveBlobAsFile({ blob, fileName: options.fileNames.print });
        showToast(messages.downloaded);
      },
      () => showToast(messages.printFailed)
    );
  }

  function copyPhoto() {
    copyImageToClipboard(getPrint()).then((copied) =>
      showToast(copied ? messages.copied : messages.copyFailed)
    );
  }

  function finishHandoff() {
    const current = handoff;
    setHandoff(undefined);
    if (current === undefined) return;
    showToast(
      current.step === "pick-from-downloads"
        ? messages.savedReminder({ platform: current.label })
        : messages.pasteReminder({ platform: current.label, keys: pasteKeys })
    );
  }

  function cancelHandoff() {
    setHandoff(undefined);
  }

  return {
    canShareFiles,
    isShareDisabled,
    toast,
    handoff,
    isAskingMastodon,
    mastodonInput,
    setMastodonInput,
    shareToTarget,
    submitMastodon,
    shareMore,
    download,
    copyPhoto,
    finishHandoff,
    cancelHandoff,
  };
}

"use client";

import { useEffect, useState } from "react";

import { CcButton } from "@/app/cc/_ui/cc-button";

import { writeClipboard } from "./write-clipboard";

type CopyButtonProps = {
  text: string;
  label?: string;
  size?: "md" | "sm";
  variant?: "ghost" | "chatgpt";
};

export function CopyButton(props: CopyButtonProps) {
  const [result, setResult] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    if (result === "idle") return;
    const timeout = setTimeout(() => setResult("idle"), 1500);
    return () => clearTimeout(timeout);
  }, [result]);

  async function handleClick() {
    setResult((await writeClipboard(props.text)) ? "copied" : "failed");
  }

  return (
    <CcButton
      type="button"
      size={props.size}
      variant={props.variant ?? "ghost"}
      onClick={handleClick}
    >
      {result === "copied"
        ? "COPIED ✓"
        : result === "failed"
          ? "COPY FAILED"
          : (props.label ?? "COPY")}
    </CcButton>
  );
}

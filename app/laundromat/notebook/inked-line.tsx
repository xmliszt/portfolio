"use client";

import { useEffect, useState } from "react";
import type { TegakiBundle } from "tegaki";
import { TegakiRenderer } from "tegaki/react";

import type { NotebookScript } from "@/lib/laundromat/supabase/notebook-types";
import { cn } from "@/lib/utils";

import { loadTegakiFont } from "./load-tegaki-font";

type InkedLineProps = {
  text: string;
  script: NotebookScript;
  fontFamily: string;
  speed: number;
  className: string;
  onComplete: () => void;
};

export function InkedLine(props: InkedLineProps) {
  const [font, setFont] = useState<TegakiBundle>();
  const [didFail, setDidFail] = useState(false);
  const { onComplete } = props;

  useEffect(() => {
    let isCancelled = false;
    loadTegakiFont(props.script).then(
      (bundle) => {
        if (!isCancelled) setFont(bundle);
      },
      () => {
        if (!isCancelled) setDidFail(true);
      }
    );
    return () => {
      isCancelled = true;
    };
  }, [props.script]);

  useEffect(() => {
    if (didFail) onComplete();
  }, [didFail, onComplete]);

  if (font === undefined) {
    return (
      <span className={props.className} style={{ opacity: didFail ? 1 : 0 }}>
        {props.text}
      </span>
    );
  }

  return (
    <TegakiRenderer
      as="span"
      font={font}
      fallbackFont={props.fontFamily}
      time={{ mode: "uncontrolled", speed: props.speed }}
      onComplete={onComplete}
      className={cn("block", props.className)}
    >
      {props.text}
    </TegakiRenderer>
  );
}

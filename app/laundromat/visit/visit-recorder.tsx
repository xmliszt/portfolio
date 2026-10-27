"use client";

import { useEffect } from "react";

import { readOrCreateVisitorId } from "@/app/laundromat/read-or-create-visitor-id";
import type { LaundromatLocale } from "@/lib/laundromat/i18n/laundromat-locales";

import { recordLaundromatVisit } from "./visit-actions";

type VisitRecorderProps = {
  locale: LaundromatLocale;
};

/** Count this page load as a visit once it mounts. */
export function VisitRecorder(props: VisitRecorderProps) {
  useEffect(() => {
    recordLaundromatVisit({
      visitorId: readOrCreateVisitorId(),
      locale: props.locale,
      referrer: document.referrer,
    }).catch(() => undefined);
  }, [props.locale]);
  return null;
}

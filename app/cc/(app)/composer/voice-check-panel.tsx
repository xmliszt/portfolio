import uniq from "lodash/uniq.js";

import { Panel } from "@/app/cc/_ui/panel";
import { checkVoice } from "@/lib/cc/check-voice";
import { VOICE_RULES } from "@/lib/cc/voice-rules";
import { cn } from "@/lib/utils";

import { HighlightedText } from "./highlighted-text";

type VoiceCheckPanelProps = {
  text: string;
  maxHashtags: number;
  className?: string;
};

export function VoiceCheckPanel(props: VoiceCheckPanelProps) {
  const flags = checkVoice({
    text: props.text,
    maxHashtags: props.maxHashtags,
  });
  const flaggedRuleIds = flags.map((flag) => flag.ruleId);
  const alsoChecked = uniq(
    VOICE_RULES.filter((rule) => !flaggedRuleIds.includes(rule.id)).map(
      (rule) => rule.label
    )
  );
  return (
    <Panel
      title={`Voice check · ${flags.length} ${flags.length === 1 ? "flag" : "flags"}`}
      className={cn(flags.length > 0 && "border-cc-warn", props.className)}
      aside="A flag is a prompt, not an error"
    >
      <div className="flex flex-col gap-y-4 px-[18px] py-4">
        {props.text.trim() === "" ? (
          <p className="text-muted-foreground">Nothing to check yet.</p>
        ) : (
          <HighlightedText text={props.text} spans={flags} />
        )}
        {flags.length > 0 && (
          <ul className="flex flex-col gap-y-2.5 border-t pt-3">
            {flags.map((flag) => (
              <li
                key={`${flag.ruleId}-${flag.start}`}
                className="flex flex-col gap-y-1"
              >
                <span className="text-cc-warn">
                  {flag.label.toUpperCase()} · line{" "}
                  {props.text.slice(0, flag.start).split("\n").length} · “
                  {props.text.slice(flag.start, flag.end).trim().slice(0, 40)}”
                </span>
                <span className="text-cc-text-2 leading-normal">
                  {flag.reason}
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="text-muted-foreground text-[11px] leading-[1.7]">
          {flags.length === 0 ? "CHECKED: " : "ALSO CHECKED: "}
          {alsoChecked.join(" · ")}
        </p>
      </div>
    </Panel>
  );
}

import { Panel } from "@/app/cc/_ui/panel";

const FOLLOW_UPS = [
  {
    when: "−10 MIN",
    toneClass: "text-primary",
    what: "Telegram: copy + open link",
  },
  { when: "+30 MIN", toneClass: "text-cc-warn", what: "Reply to comments" },
  {
    when: "+1H · +24H · +7D",
    toneClass: "text-cc-warn",
    what: "Log numbers",
  },
  {
    when: "REPOST",
    toneClass: "text-cc-ok",
    what: "Suggested when 24 h views reach 1.5× the platform median",
  },
] as const;

export function FollowUpsPanel() {
  return (
    <Panel
      title="FOLLOW-UPS EVERY POST GETS"
      className="flex-[2_1_520px]"
      bodyClassName="grid grid-cols-1 gap-x-2.5 gap-y-2.5 px-3 py-2 sm:grid-cols-2 lg:grid-cols-4"
      footer="Times count from when you mark a post posted."
    >
      {FOLLOW_UPS.map((followUp) => (
        <div key={followUp.when} className="flex flex-col gap-y-1 border p-2.5">
          <span className={`font-bold ${followUp.toneClass}`}>
            {followUp.when}
          </span>
          <span className="text-cc-text-2 text-[12px]">{followUp.what}</span>
        </div>
      ))}
    </Panel>
  );
}

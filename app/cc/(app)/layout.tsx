import { Suspense } from "react";

import { requireCcOwner } from "@/lib/cc/auth/require-cc-owner";
import { listDueReminders } from "@/lib/cc/data/list-due-reminders";

import { NavigationProgress } from "./navigation-progress";
import { SectionRail } from "./section-rail";

type CcAppLayoutProps = {
  children: React.ReactNode;
};

export default async function CcAppLayout(props: CcAppLayoutProps) {
  await requireCcOwner();
  const dueReminders = await listDueReminders({ now: new Date() });
  const dueLogCount = dueReminders.filter(
    (reminder) => reminder.kind === "log"
  ).length;
  const isTelegramLinked =
    process.env.CC_TELEGRAM_BOT_TOKEN !== undefined &&
    process.env.CC_TELEGRAM_CHAT_ID !== undefined;

  return (
    <div className="flex min-h-full flex-wrap">
      <Suspense>
        <NavigationProgress />
      </Suspense>
      <SectionRail
        dueLogCount={dueLogCount}
        telegramLinked={isTelegramLinked}
      />
      <main className="flex min-w-0 flex-[999_1_560px] flex-col gap-y-5 px-4 pt-6 pb-10 sm:px-8">
        {props.children}
      </main>
    </div>
  );
}

import Link from "next/link";

import type { AppData } from "@/app/apps/data";

type AppViewBottomViewProps = {
  app: AppData;
};

export function AppViewBottomViewMobile(props: AppViewBottomViewProps) {
  const { app } = props;

  return (
    <section className="pt-4">
      <div className="text-foreground flex flex-col gap-y-2 text-sm">
        <div className="flex gap-x-2">
          <Link
            href={`/apps/${app.id}/privacy-policy`}
            className="hover:underline"
          >
            Privacy Policy
          </Link>

          {/* dot */}
          <span className="text-foreground">•</span>

          <Link
            href={`/apps/${app.id}/terms-of-service`}
            className="hover:underline"
          >
            Terms of Service
          </Link>
        </div>

        <div className="flex gap-x-2">
          <Link href={`/apps/${app.id}/changelogs`} className="hover:underline">
            Changelogs
          </Link>

          {/* dot */}
          <span className="text-foreground">•</span>

          <Link href={`/apps/${app.id}/faqs`} className="hover:underline">
            FAQs
          </Link>

          {/* dot */}
          <span className="text-foreground">•</span>

          <Link href={`/apps/${app.id}/support`} className="hover:underline">
            Support
          </Link>
        </div>
      </div>
    </section>
  );
}

export function AppViewBottomViewWeb(props: AppViewBottomViewProps) {
  const { app } = props;

  return (
    <section className="pt-4">
      <div className="text-foreground flex flex-wrap gap-x-2 gap-y-2 text-sm">
        <Link
          href={`/apps/${app.id}/privacy-policy`}
          className="hover:underline"
        >
          Privacy Policy
        </Link>

        {/* dot */}
        <span className="text-foreground">•</span>

        <Link
          href={`/apps/${app.id}/terms-of-service`}
          className="hover:underline"
        >
          Terms of Service
        </Link>

        {/* dot */}
        <span className="text-foreground">•</span>

        <Link href={`/apps/${app.id}/changelogs`} className="hover:underline">
          Changelogs
        </Link>

        {/* dot */}
        <span className="text-foreground">•</span>

        <Link href={`/apps/${app.id}/faqs`} className="hover:underline">
          FAQs
        </Link>

        {/* dot */}
        <span className="text-foreground">•</span>

        <Link href={`/apps/${app.id}/support`} className="hover:underline">
          Support
        </Link>
      </div>
    </section>
  );
}

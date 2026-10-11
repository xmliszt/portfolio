"use client";

import { usePathname } from "next/navigation";

import { BackToAppsLink } from "@/app/apps/back-to-apps-link";

type PlaygroundLayoutProps = {
  children: React.ReactNode;
};

export default function PlaygroundLayout(props: PlaygroundLayoutProps) {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);
  const isAppRootLevel = pathSegments.length === 2;

  return (
    <div className="mx-auto max-w-4xl space-y-16">
      {isAppRootLevel && <BackToAppsLink />}

      <div>{props.children}</div>

      {/* Spacer */}
      <section className="h-16 w-full"></section>
    </div>
  );
}

"use client";

import { ArrowLeft, Park } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { usePathname } from "next/navigation";

type PlaygroundLayoutProps = {
  children: React.ReactNode;
};

export default function PlaygroundLayout(props: PlaygroundLayoutProps) {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);
  const isAppRootLevel = pathSegments.length === 2;

  return (
    <div className="mx-auto max-w-4xl space-y-16">
      {isAppRootLevel && (
        <Link href="/apps" className="group">
          <div className="mb-12 flex items-center gap-2 text-sm">
            <ArrowLeft
              size={18}
              className="group-hover:animate-wobble-horizontal"
            />
            <Park size={24} />
            Back to Apps
          </div>
        </Link>
      )}

      <div>{props.children}</div>

      {/* Spacer */}
      <section className="h-16 w-full"></section>
    </div>
  );
}

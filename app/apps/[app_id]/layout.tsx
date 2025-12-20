import { ArrowLeft, Park } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

type PlaygroundLayoutProps = {
  children: React.ReactNode;
};

export default function PlaygroundLayout(props: PlaygroundLayoutProps) {
  return (
    <div className="mx-auto max-w-4xl space-y-16">
      <Link href="/apps" className="group">
        <div className="flex items-center gap-2 text-sm">
          <ArrowLeft
            size={18}
            className="group-hover:animate-wobble-horizontal"
          />
          <Park size={24} />
          Back to Apps
        </div>
      </Link>

      <div className="pt-12">{props.children}</div>

      {/* Spacer */}
      <section className="h-16 w-full"></section>
    </div>
  );
}

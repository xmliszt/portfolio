import { ArrowLeft, Park } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export function BackToAppsLink() {
  return (
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
  );
}

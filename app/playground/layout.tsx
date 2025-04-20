import { ArrowLeft, Park } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

type PlaygroundLayoutProps = {
  children: React.ReactNode;
};

export default function PlaygroundLayout(props: PlaygroundLayoutProps) {
  return (
    <div className="flex flex-col items-start gap-6">
      <Link href="/playground" className="group">
        <div className="flex items-center gap-2 text-sm">
          <ArrowLeft
            size={18}
            className="group-hover:animate-wobble-horizontal"
          />
          <Park size={24} />
          Back to playground
        </div>
      </Link>
      {props.children}
    </div>
  );
}

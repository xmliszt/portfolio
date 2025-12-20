import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { startCase } from "lodash";
import Link from "next/link";

type AppLayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    app_id: string;
  }>;
};

export default async function AppLayout(props: AppLayoutProps) {
  const params = await props.params;

  return (
    <div className="flex flex-col items-start gap-6">
      <Link href={`/apps/${params.app_id}`} className="group">
        <div className="flex items-center gap-2 text-sm">
          <ArrowLeft
            size={18}
            className="group-hover:animate-wobble-horizontal"
          />
          Back to {startCase(params.app_id)}
        </div>
      </Link>
      {props.children}
    </div>
  );
}

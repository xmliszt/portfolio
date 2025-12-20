import { cn } from "@/lib/utils";

type NavigationBarProps = {
  children: React.ReactNode;
};

export function NavigationBar(props: NavigationBarProps) {
  return (
    <div
      className={cn(
        "absolute top-0 -left-28 h-screen w-36 md:-left-36 lg:-left-44 xl:-left-48",
        "hidden md:block"
      )}
    >
      <nav
        className={cn(
          "bg-card sticky top-24! flex flex-col gap-2 rounded-lg border p-2 shadow-md",
          "transition-[transform_box-shadow] ease-out hover:shadow-xl"
        )}
      >
        {props.children}
      </nav>
    </div>
  );
}

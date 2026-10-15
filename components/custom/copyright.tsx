import Link from "next/link";

export function Copyright() {
  return (
    <div className="text-muted-foreground/50 absolute right-[max(1rem,env(safe-area-inset-right))] bottom-[max(0.5rem,env(safe-area-inset-bottom))] z-50 text-[10px] md:left-[max(1rem,env(safe-area-inset-left))]">
      <Link
        href="http://creativecommons.org/licenses/by-nc-sa/4.0/?ref=chooser-v1"
        target="_blank"
      >
        © CC BY-NC-SA 4.0 2024-{new Date().getFullYear()} Li Yuxuan
      </Link>
    </div>
  );
}

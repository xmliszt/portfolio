import { cn } from '@/lib/utils';

type NavigationBarProps = {
  children: React.ReactNode;
};

export function NavigationBar(props: NavigationBarProps) {
  return (
    <div
      className={cn(
        'absolute -left-28 top-0 h-full w-36 md:-left-36 lg:-left-44 xl:-left-48',
        'hidden md:block'
      )}
    >
      <nav
        className={cn(
          'sticky top-24 flex flex-col gap-2 rounded-lg border bg-card p-3 shadow-md',
          'transition-[transform_box-shadow] ease-out hover:scale-105 hover:shadow-xl'
        )}
      >
        {props.children}
      </nav>
    </div>
  );
}

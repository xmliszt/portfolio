import { cn } from '@/lib/utils';

type NavigationBarProps = {
  children: React.ReactNode;
};

export function NavigationBar(props: NavigationBarProps) {
  return (
    <div
      className={cn('absolute top-16 w-32 -left-40 h-full', 'hidden md:block')}
    >
      <nav className='sticky top-16 flex flex-col gap-2 p-3 border rounded-lg'>
        {props.children}
      </nav>
    </div>
  );
}

export * from './navigation-bar-item';

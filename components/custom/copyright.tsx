import Link from 'next/link';

export function Copyright() {
  return (
    <div className='absolute bottom-2 right-4 z-50 text-[10px] text-muted-foreground/50 md:left-4'>
      <Link
        href='http://creativecommons.org/licenses/by-nc-sa/4.0/?ref=chooser-v1'
        target='_blank'
      >
        © CC BY-NC-SA 4.0 2024-{new Date().getFullYear()} Li Yuxuan
      </Link>
    </div>
  );
}

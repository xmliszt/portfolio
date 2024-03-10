import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';

type FocusCardProps = {
  focus: Focus;
};

export function FocusCard(props: FocusCardProps) {
  return (
    <Link href={`/focus/${props.focus.slug}`} className='group relative'>
      <article className='flex flex-col gap-4 rounded-xl border p-6 transition-[transform_box-shadow] duration-300 ease-in-out group-hover:scale-[1.02] group-hover:shadow-lg'>
        <div className='flex items-start justify-between gap-4'>
          <h3>{props.focus.title}</h3>
          {props.focus.updated && (
            <time className='text-end'>
              Updated: {format(props.focus.updated, 'do LLLL yyyy')}
            </time>
          )}
        </div>
        <Image
          className='rounded-xl border'
          src={props.focus.cover}
          alt={props.focus.title}
          width={120}
          height={120}
          layout='responsive'
          unoptimized
        />
      </article>
    </Link>
  );
}

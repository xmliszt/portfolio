import Link from 'next/link';

import { Badge } from './badge';

type CustomBadgeLinkProps = {
  href: string;
  children: React.ReactNode;
};

export function CustomBadgeLink(props: CustomBadgeLinkProps) {
  return (
    <Link href={props.href}>
      <Badge
        className='rounded-full border-border text-xs font-normal transition-transform hover:scale-105'
        variant='secondary'
      >
        {props.children}
      </Badge>
    </Link>
  );
}

import Link from 'next/link';

import { Badge } from '../ui/badge';

type CustomBadgeLinkProps = {
  href: string;
  children: React.ReactNode;
};

export function CustomBadgeLink(props: CustomBadgeLinkProps) {
  return (
    <Link href={props.href}>
      <Badge
        className='hover:scale-105 transition-transform ease-out rounded-full border-border'
        variant='secondary'
      >
        {props.children}
      </Badge>
    </Link>
  );
}

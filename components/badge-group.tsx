import { Badge } from './ui/badge';

type BadgeGroupProps = {
  tags: string[];
};

export function BadgeGroup({ tags }: BadgeGroupProps) {
  return (
    <div className='flex flex-row flex-wrap gap-2'>
      {tags.map((tag) => (
        <Badge
          key={tag}
          className='rounded-full border-border transition-transform ease-out hover:scale-105'
          variant='secondary'
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
}
